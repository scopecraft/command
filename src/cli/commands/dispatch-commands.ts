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
    // Using new functional API with ConfigurationManager

    // Step 1: Load task and environment if taskId provided
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

    // Step 2: Setup execution parameters
    const mode = options.mode || 'auto';
    const execType = options.exec || 'docker';

    // Step 3: Display execution info
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

    // Step 4: Execute using our helper
    const promptPath = resolveModePromptPath(projectRoot, mode);

    // Use appropriate prompt based on whether we're resuming
    const promptOrFile = options.session
      ? 'Continue task execution from where you left off'
      : promptPath;
    const baseData = options.session
      ? { sessionName: options.session }
      : buildTaskData(taskId || '', taskInstruction, '', parentId);

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

    const result = await executeAutonomousTask(promptOrFile, {
      taskId: taskId || 'session-resume', // Dummy value if resuming
      parentId,
      execType,
      projectRoot,
      dryRun: options.dryRun,
      session: options.session, // Pass through session for resume
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
    });

    if (execType === 'tmux' && !options.dryRun) {
      printSuccess('✓ Tmux window created');
      printSuccess('Attach with: tmux attach -t scopecraft');
    }

    // Display result information
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
  } catch (error) {
    printError(
      `Dispatch command failed: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
