/**
 * Work command implementation for interactive Claude sessions
 *
 * Provides the `sc work` command for starting interactive development sessions
 * with automatic environment management and mode inference.
 */

import inquirer from 'inquirer';
import { ConfigurationManager } from '../../core/config/index.js';
import { EnvironmentResolver, WorktreeManager } from '../../core/environment/index.js';
import { getStatusEmoji, getTypeEmoji } from '../../core/metadata/schema-service.js';
import { get as getTask, list as listTasks } from '../../core/task-crud.js';
import type { Task } from '../../core/types.js';
import {
  buildTaskData,
  execute,
  resolveModePromptPath,
} from '../../integrations/channelcoder/index.js';
import { printError, printSuccess, printWarning } from '../formatters.js';

export interface WorkCommandOptions {
  mode?: string;
  docker?: boolean; // This will be set to false by --no-docker flag
  dryRun?: boolean; // If true, show what would be executed without running it
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
    const worktreeManager = new WorktreeManager();
    const resolver = new EnvironmentResolver(worktreeManager);

    // Step 1: Resolve task ID
    let resolvedTaskId = taskId;
    if (!resolvedTaskId) {
      resolvedTaskId = await selectTaskInteractive(projectRoot);
      if (!resolvedTaskId) {
        printWarning('No task selected');
        process.exit(0);
      }
    }

    // Step 2: Load task and validate
    let task: Task | undefined;
    try {
      const result = await getTask(projectRoot, resolvedTaskId);
      if (!result.success) {
        throw new Error(result.error || 'Task not found');
      }
      task = result.data;
    } catch (_error) {
      printError(`Task '${resolvedTaskId}' not found`);
      process.exit(1);
    }

    if (!task) {
      printError(`Task '${resolvedTaskId}' not found`);
      process.exit(1);
    }

    // Step 3: Resolve and ensure environment
    const envId = await resolver.resolveEnvironmentId(resolvedTaskId);
    const envInfo = await resolver.ensureEnvironment(envId);

    printSuccess(`Environment ready: ${envInfo.path}`);

    // Step 4: Get task information
    const taskInstruction = task.document.sections.instruction || '';
    const additionalPrompt = additionalPromptArgs.join(' ');
    const mode = options.mode || 'auto';

    // Step 5: Execute via ChannelCoder
    if (options.dryRun) {
      printSuccess(`[DRY RUN] Would launch Claude session in ${mode} mode`);
      printSuccess(`[DRY RUN] Would work in: ${envInfo.path}`);
    } else {
      printSuccess(`Launching Claude session in ${mode} mode...`);
      printSuccess(`Working in: ${envInfo.path}`);
    }

    // Work command is always interactive (never Docker) per PRD
    // The --no-docker option exists for compatibility but work never uses Docker
    if (options.docker === false) {
      printSuccess('Running in interactive mode (work command is always interactive)');
    }

    // Execute with ChannelCoder using simple function
    const promptPath = resolveModePromptPath(projectRoot, mode);
    const data = buildTaskData(resolvedTaskId, taskInstruction, additionalPrompt);

    const result = await execute(promptPath, {
      data,
      mode: 'interactive', // Work command always uses interactive mode
      dryRun: options.dryRun,
      worktree: envInfo.path,
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
