/**
 * Dispatch command implementation for autonomous Claude sessions
 *
 * Provides the `sc dispatch` command for running Claude in background/autonomous mode
 * with Docker or detached execution options.
 */

import { ConfigurationManager } from '../../core/config/index.js';
import { DockerConfigService } from '../../core/environment/configuration-services.js';
import { ensureEnvironment, resolveEnvironmentId } from '../../core/environment/index.js';
import { get as getTask } from '../../core/task-crud.js';
import type { Task } from '../../core/types.js';
import {
  buildTaskData,
  executeAutonomousTask,
  resolveModePromptPath,
} from '../../integrations/channelcoder/index.js';
import { printError, printSuccess, printWarning } from '../formatters.js';

export type ExecutionType = 'docker' | 'detached' | 'tmux';

export interface DispatchCommandOptions {
  mode?: string;
  exec?: ExecutionType;
  rootDir?: string;
  session?: string;
  dryRun?: boolean; // If true, show what would be executed without running it
  data?: string | Record<string, unknown>; // Additional data to merge (JSON string from CLI or object)
}

interface ValidatedDispatchOptions {
  taskId: string | undefined;
  projectRoot: string;
  configManager: ConfigurationManager;
  dockerConfig: DockerConfigService;
  options: DispatchCommandOptions;
}

interface DispatchEnvironment {
  task?: Task;
  envInfo?: { path: string; branch: string };
  taskInstruction: string;
  parentId?: string;
}

interface ExecutionParams {
  mode: string;
  execType: ExecutionType;
  promptOrFile: string;
  data: Record<string, unknown>;
  worktree?: { branch: string; path: string };
  docker?: {
    image: string;
    mounts: string[];
    env: Record<string, string>;
  };
}

/**
 * Validates dispatch command options and sets up initial configuration
 */
function validateDispatchOptions(
  taskId: string | undefined,
  options: DispatchCommandOptions
): ValidatedDispatchOptions {
  // Validate input - need either taskId or session
  if (!taskId && !options.session) {
    printError('Task ID is required for dispatch command (unless using --session)');
    process.exit(1);
  }

  // Get project root from configuration
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = options.rootDir || configManager.getProjectRoot();

  if (!projectRoot) {
    printError('No project root found. Run "sc init" or specify --root-dir.');
    process.exit(1);
  }

  // Initialize core services
  const dockerConfig = new DockerConfigService();

  return {
    taskId,
    projectRoot,
    configManager,
    dockerConfig,
    options,
  };
}

/**
 * Prepares the dispatch environment by loading task data and setting up environment
 */
async function prepareDispatchEnvironment(
  validated: ValidatedDispatchOptions
): Promise<DispatchEnvironment> {
  const { taskId, projectRoot, configManager, options } = validated;

  let task: Task | undefined;
  let envInfo: { path: string; branch: string } | undefined;
  let taskInstruction = '';
  let parentId: string | undefined;

  if (taskId) {
    try {
      const result = await getTask(projectRoot, taskId);
      if (!result.success) {
        throw new Error(result.error || 'Task not found');
      }
      task = result.data;
      if (task) {
        taskInstruction = task.document.sections.instruction || '';
        parentId = task.metadata.parentTask;
      }
    } catch (_error) {
      printError(`Task '${taskId}' not found`);
      process.exit(1);
    }

    // Resolve and ensure environment (respecting dry-run mode)
    const envId = await resolveEnvironmentId(taskId, configManager);
    envInfo = await ensureEnvironment(envId, configManager, options.dryRun);

    if (options.dryRun) {
      printSuccess(`[DRY RUN] Environment would be: ${envInfo.path}`);
    } else {
      printSuccess(`Environment ready: ${envInfo.path}`);
    }
  }

  return { task, envInfo, taskInstruction, parentId };
}

/**
 * Displays execution information based on current mode and options
 */
function displayExecutionInfo(
  validated: ValidatedDispatchOptions,
  environment: DispatchEnvironment,
  mode: string,
  execType: ExecutionType
): void {
  const { options, dockerConfig } = validated;
  const { envInfo } = environment;

  if (options.session) {
    if (options.dryRun) {
      printSuccess(`[DRY RUN] Would resume session: ${options.session}`);
      printSuccess(`[DRY RUN] Would execute in ${execType} mode (${mode} mode)`);
    } else {
      printSuccess(`Resuming session: ${options.session}`);
      printSuccess(`Executing in ${execType} mode (${mode} mode)...`);
    }
  } else {
    if (options.dryRun) {
      printSuccess(`[DRY RUN] Would launch Claude in ${execType} mode (${mode} mode)`);
      printSuccess(`[DRY RUN] Would work in: ${envInfo?.path}`);
      if (execType === 'docker') {
        printSuccess(`[DRY RUN] Would use Docker image: ${dockerConfig.getDefaultImage()}`);
      }
    } else {
      printSuccess(`Launching Claude in ${execType} mode (${mode} mode)...`);
      printSuccess(`Working in: ${envInfo?.path}`);
      if (execType === 'docker') {
        printSuccess(`Docker image: ${dockerConfig.getDefaultImage()}`);
      }
    }
  }
}

/**
 * Parses and validates additional data from CLI options
 */
function parseAdditionalData(
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
 * Prepares execution parameters for the autonomous task
 */
function prepareExecutionParams(
  validated: ValidatedDispatchOptions,
  environment: DispatchEnvironment,
  mode: string,
  execType: ExecutionType
): ExecutionParams {
  const { taskId, projectRoot, options, dockerConfig } = validated;
  const { taskInstruction, parentId, envInfo } = environment;

  const promptPath = resolveModePromptPath(projectRoot, mode);
  const promptOrFile = options.session
    ? 'Continue task execution from where you left off'
    : promptPath;
  const baseData = options.session
    ? { sessionName: options.session }
    : buildTaskData(taskId || '', taskInstruction, '', parentId);

  const additionalData = parseAdditionalData(options.data);
  const data = { ...baseData, ...additionalData };

  return {
    mode,
    execType,
    promptOrFile,
    data,
    worktree:
      envInfo && !options.dryRun
        ? {
            branch: envInfo.branch,
            path: envInfo.path,
          }
        : undefined,
    docker:
      execType === 'docker' && envInfo && !options.dryRun
        ? {
            image: dockerConfig.getDefaultImage(),
            mounts: [`${envInfo.path}:/workspace:rw`],
            env: {
              TASK_ID: taskId || options.session || '',
              WORK_MODE: mode,
            },
          }
        : undefined,
  };
}

interface ExecutionResult {
  success: boolean;
  error?: string;
  sessionName?: string;
  data?: Record<string, unknown>;
}

/**
 * Handles the execution result and displays appropriate messages
 */
function handleExecutionResult(
  result: ExecutionResult,
  execType: ExecutionType,
  options: DispatchCommandOptions
): void {
  if (execType === 'tmux' && !options.dryRun) {
    printSuccess('✓ Tmux window created');
    printSuccess('Attach with: tmux attach -t scopecraft');
  }

  if (result.success) {
    printSuccess('✅ Execution started successfully');

    // Session info is at top level, other data in result.data
    if (result.sessionName) {
      printSuccess(`Session: ${result.sessionName}`);
    }
    if (result.data && typeof result.data === 'object' && 'pid' in result.data) {
      printSuccess(`PID: ${(result.data as Record<string, unknown>).pid}`);
    }
    if (execType !== 'tmux' && result.sessionName && !options.session) {
      printSuccess(`Resume with: sc dispatch --session ${result.sessionName}`);
    }
  } else {
    printError(`Execution failed: ${result.error}`);
    process.exit(1);
  }
}

/**
 * Main handler for the dispatch command
 *
 * @param taskId Required task ID for autonomous execution
 * @param options Command options including mode and execution type
 */
export async function handleDispatchCommand(
  taskId: string | undefined,
  options: DispatchCommandOptions
): Promise<void> {
  try {
    // Step 1: Validate options and setup configuration
    const validated = validateDispatchOptions(taskId, options);

    // Step 2: Prepare environment and load task data
    const environment = await prepareDispatchEnvironment(validated);

    // Step 3: Setup execution parameters
    const mode = options.mode || 'auto';
    const execType = options.exec || 'docker';

    // Step 4: Display execution info
    displayExecutionInfo(validated, environment, mode, execType);

    // Step 5: Prepare execution parameters
    const execParams = prepareExecutionParams(validated, environment, mode, execType);

    // Step 6: Execute the autonomous task
    const result = await executeAutonomousTask(execParams.promptOrFile, {
      taskId: validated.taskId || 'session-resume',
      parentId: environment.parentId,
      execType,
      projectRoot: validated.projectRoot,
      dryRun: options.dryRun,
      session: options.session,
      data: execParams.data,
      worktree: execParams.worktree,
      docker: execParams.docker,
    });

    // Step 7: Handle and display results
    handleExecutionResult(result, execType, options);
  } catch (error) {
    printError(
      `Dispatch command failed: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
