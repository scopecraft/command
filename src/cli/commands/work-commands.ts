/**
 * Work command implementation for interactive Claude sessions
 *
 * Provides the `sc work` command for starting interactive development sessions
 * with automatic environment management and mode inference.
 */

import inquirer from 'inquirer';
import { ConfigurationManager } from '../../core/config/index.js';
import { ensureEnvironment, resolveEnvironmentId } from '../../core/environment/index.js';
import { getStatusEmoji, getTypeEmoji } from '../../core/metadata/schema-service.js';
import { get as getTask, list as listTasks } from '../../core/task-crud.js';
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
    // Get project root from configuration (already set by CLI framework)
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getProjectRoot();

    if (!projectRoot) {
      printError('No project root found. Run "sc init" or specify --root-dir.');
      process.exit(1);
    }

    // Initialize core services
    // Using new functional API with ConfigurationManager

    // Step 1: Handle session resume or task resolution
    let resolvedTaskId: string | undefined;
    let task: Task | undefined;
    let envInfo: { path: string; branch: string } | undefined;
    let taskInstruction = '';

    if (options.session) {
      // When resuming, we don't need task selection
      printSuccess(`Resuming session: ${options.session}`);
    } else {
      // Normal task resolution flow
      resolvedTaskId = taskId;
      if (!resolvedTaskId) {
        resolvedTaskId = await selectTaskInteractive(projectRoot);
        if (!resolvedTaskId) {
          printWarning('No task selected');
          process.exit(0);
        }
      }

      // Load task and validate
      try {
        const result = await getTask(projectRoot, resolvedTaskId);
        if (!result.success) {
          throw new Error(result.error || 'Task not found');
        }
        task = result.data;
        if (task) {
          taskInstruction = task.document.sections.instruction || '';
        }
      } catch (_error) {
        printError(`Task '${resolvedTaskId}' not found`);
        process.exit(1);
      }

      // Resolve and ensure environment (respecting dry-run mode)
      const envId = await resolveEnvironmentId(resolvedTaskId, configManager);
      envInfo = await ensureEnvironment(envId, configManager, options.dryRun);
      if (options.dryRun) {
        printSuccess(`[DRY RUN] Environment would be: ${envInfo.path}`);
      } else {
        printSuccess(`Environment ready: ${envInfo.path}`);
      }
    }

    // Step 2: Setup execution parameters
    const additionalPrompt = additionalPromptArgs.join(' ');
    const mode = options.mode || 'auto';

    // Step 3: Display execution info
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
    // The --no-docker option exists for compatibility but work never uses Docker
    if (options.docker === false) {
      printSuccess('Running in interactive mode (work command is always interactive)');
    }

    // Step 4: Execute with ChannelCoder
    const promptPath = resolveModePromptPath(projectRoot, mode);
    const promptOrFile = options.session
      ? 'Continue working on the task from where you left off'
      : promptPath;

    // Build base data - always include both taskId and parentId
    const baseData: Record<string, unknown> = {
      additionalInstructions: additionalPrompt,
      taskId: resolvedTaskId || '',
      parentId: task?.metadata.parentTask || '', // Get from task metadata
    };

    // Parse and merge any additional data provided via --data
    let additionalData: Record<string, unknown> = {};
    if (options.data) {
      try {
        additionalData = typeof options.data === 'string' ? JSON.parse(options.data) : options.data;
      } catch (error) {
        printError(
          `Invalid JSON in --data option: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
    const data = { ...baseData, ...additionalData };

    const result = await executeInteractiveTask(promptOrFile, {
      taskId: resolvedTaskId || 'session-resume',
      instruction: taskInstruction,
      dryRun: options.dryRun,
      session: options.session, // Pass through for resume
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
  } catch (error) {
    printError(`Work command failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Interactive task selector for when no task ID is provided
 *
 * @param taskCrud Task CRUD service
 * @returns Selected task ID or undefined if cancelled
 */
async function selectTaskInteractive(projectRoot: string): Promise<string | undefined> {
  try {
    // List current tasks only (most relevant for work)
    const result = await listTasks(projectRoot, { location: 'current' });
    if (!result.success) {
      printError(`Failed to list tasks: ${result.error}`);
      return undefined;
    }
    const tasks = result.data;

    if (!tasks || tasks.length === 0) {
      printWarning('No current tasks found. Use "sc task list --all" to see all tasks.');
      return undefined;
    }

    // Build choices for the selector
    const choices = tasks.map((task) => ({
      name: formatTaskChoice(task),
      value: task.metadata.id,
      description: task.document.sections.instruction
        ? `${task.document.sections.instruction.split('\n')[0].substring(0, 80)}...`
        : undefined,
    }));

    // Add cancel option
    choices.push({
      name: '── Cancel ──',
      value: '__cancel__',
      description: undefined,
    });

    // Show selector
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select a task to work on:',
        choices,
        pageSize: 15,
      },
    ]);

    return selected === '__cancel__' ? undefined : selected;
  } catch (_error) {
    // User cancelled with Ctrl+C
    return undefined;
  }
}

/**
 * Format task for display in selector
 */
function formatTaskChoice(task: Task): string {
  const typeEmoji = getTypeEmoji(task.document.frontmatter.type) || '';
  const statusEmoji = getStatusEmoji(task.document.frontmatter.status) || '';
  const priority = task.document.frontmatter.priority
    ? ` [${task.document.frontmatter.priority.toUpperCase()}]`
    : '';

  return `${typeEmoji} ${task.metadata.id} - ${task.document.title} ${statusEmoji}${priority}`;
}
