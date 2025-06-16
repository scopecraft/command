/**
 * Work command implementation for interactive Claude sessions
 *
 * Provides the `sc work` command for starting interactive development sessions
 * with automatic environment management and mode inference.
 */

import { ConfigurationManager } from '../../core/config/index.js';
import { ensureEnvironment, resolveEnvironmentId } from '../../core/environment/index.js';
import { get as getTask } from '../../core/task-crud.js';
import type { Task } from '../../core/types.js';
import {
  buildTaskData,
  executeInteractiveTask,
  resolveModePromptPath,
} from '../../integrations/channelcoder/index.js';
import { printError, printSuccess, printWarning } from '../formatters.js';

export interface WorkCommandOptions {
  mode?: string;
  docker?: boolean; // This will be set to false by --no-docker flag
  session?: string; // Session ID to resume
  dryRun?: boolean; // If true, show what would be executed without running it
  data?: string | Record<string, unknown>; // Additional data to merge (JSON string from CLI or object)
}

interface ValidatedWorkOptions {
  projectRoot: string;
  configManager: ConfigurationManager;
  options: WorkCommandOptions;
  additionalPrompt: string;
}

interface WorkEnvironment {
  taskId?: string;
  task?: Task;
  envInfo?: { path: string; branch: string };
  taskInstruction: string;
}

/**
 * Validates work command options and sets up configuration
 */
function validateWorkOptions(
  additionalPromptArgs: string[],
  options: WorkCommandOptions
): ValidatedWorkOptions {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = configManager.getProjectRoot();

  if (!projectRoot) {
    printError('No project root found. Run "sc init" or specify --root-dir.');
    process.exit(1);
  }

  const additionalPrompt = additionalPromptArgs.join(' ');

  return {
    projectRoot,
    configManager,
    options,
    additionalPrompt,
  };
}

/**
 * Handles session resumption logic
 */
async function handleSessionResume(sessionId: string): Promise<WorkEnvironment> {
  printSuccess(`Resuming session: ${sessionId}`);
  return {
    taskInstruction: '',
  };
}

/**
 * Prepares work environment by resolving task and setting up environment
 */
async function prepareWorkEnvironment(
  taskId: string | undefined,
  validated: ValidatedWorkOptions
): Promise<WorkEnvironment> {
  const { projectRoot, configManager, options } = validated;

  // Task ID is now optional - if not provided, work in current directory
  if (!taskId) {
    return {
      taskInstruction: '',
    };
  }

  // Load task and validate
  let task: Task | undefined;
  let taskInstruction = '';
  try {
    const result = await getTask(projectRoot, taskId);
    if (!result.success) {
      throw new Error(result.error || 'Task not found');
    }
    task = result.data;
    if (task) {
      taskInstruction = task.document.sections.instruction || '';
    }
  } catch (_error) {
    printError(`Task '${taskId}' not found`);
    process.exit(1);
  }

  // Resolve and ensure environment (respecting dry-run mode)
  const envId = await resolveEnvironmentId(taskId, configManager);
  const envInfo = await ensureEnvironment(envId, configManager, options.dryRun);

  if (options.dryRun) {
    printSuccess(`[DRY RUN] Environment would be: ${envInfo.path}`);
  } else {
    printSuccess(`Environment ready: ${envInfo.path}`);
  }

  return {
    taskId,
    task,
    envInfo,
    taskInstruction,
  };
}

/**
 * Displays work session information
 */
function displayWorkInfo(
  environment: WorkEnvironment,
  mode: string,
  options: WorkCommandOptions
): void {
  const { envInfo } = environment;

  if (options.dryRun) {
    printSuccess(`[DRY RUN] Would launch Claude session in ${mode} mode`);
    if (envInfo) {
      printSuccess(`[DRY RUN] Would work in: ${envInfo.path}`);
    }
  } else {
    printSuccess(`Launching Claude session in ${mode} mode...`);
    if (envInfo) {
      printSuccess(`Working in: ${envInfo.path}`);
    }
  }

  // Work command is always interactive (never Docker) per PRD
  if (options.docker === false) {
    printSuccess('Running in interactive mode (work command is always interactive)');
  }
}

/**
 * Parses additional data from CLI options - shared with dispatch command
 */
function parseWorkAdditionalData(
  dataOption?: string | Record<string, unknown>
): Record<string, unknown> {
  if (!dataOption) {
    return {};
  }

  try {
    return typeof dataOption === 'string' ? JSON.parse(dataOption) : dataOption;
  } catch (error) {
    printError(
      `Invalid JSON in --data option: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

/**
 * Starts the interactive session with prepared environment
 */
async function startInteractiveSession(
  environment: WorkEnvironment,
  validated: ValidatedWorkOptions,
  mode: string
): Promise<void> {
  const { projectRoot, options, additionalPrompt } = validated;
  const { taskId, task, envInfo, taskInstruction } = environment;

  const promptPath = resolveModePromptPath(projectRoot, mode);
  const promptOrFile = options.session
    ? 'Continue working on the task from where you left off'
    : promptPath;

  // Build base data - always include both taskId and parentId
  const baseData: Record<string, unknown> = {
    additionalInstructions: additionalPrompt,
    taskId: taskId || '',
    parentId: task?.metadata.parentTask || '',
  };

  const additionalData = parseWorkAdditionalData(options.data);
  const data = { ...baseData, ...additionalData };

  const result = await executeInteractiveTask(promptOrFile, {
    taskId: taskId || 'session-resume',
    instruction: taskInstruction,
    dryRun: options.dryRun,
    session: options.session,
    worktree:
      envInfo && !options.dryRun
        ? {
            path: envInfo.path,
            branch: envInfo.branch,
          }
        : undefined,
    data,
  });

  if (result.success) {
    printSuccess('✅ Interactive session completed');
  } else {
    printError(`Session failed: ${result.error}`);
  }
}

/**
 * Main handler for the work command
 *
 * @param taskId Optional task ID. If not provided, shows interactive selector
 * @param additionalPromptArgs Additional prompt arguments passed after taskId
 * @param options Command options including mode override
 */
export async function handleWorkCommand(
  taskId: string | undefined,
  additionalPromptArgs: string[],
  options: WorkCommandOptions
): Promise<void> {
  try {
    // Step 1: Validate options and setup configuration
    const validated = validateWorkOptions(additionalPromptArgs, options);

    // Step 2: Handle session resume or prepare work environment
    const environment = options.session
      ? await handleSessionResume(options.session)
      : await prepareWorkEnvironment(taskId, validated);

    // Step 3: Setup execution parameters and display info
    const mode = options.mode || 'auto';
    displayWorkInfo(environment, mode, options);

    // Step 4: Start interactive session
    await startInteractiveSession(environment, validated, mode);
  } catch (error) {
    printError(`Work command failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
