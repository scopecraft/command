/**
 * Dispatch command implementation for autonomous Claude sessions
 * 
 * Provides the `sc dispatch` command for running Claude in background/autonomous mode
 * with Docker or detached execution options.
 */

import { ConfigurationManager } from '../../core/config/index.js';
import {
  EnvironmentResolver,
  WorktreeManager,
} from '../../core/environment/index.js';
import { DockerConfigService } from '../../core/environment/configuration-services.js';
import { printError, printSuccess, printWarning } from '../formatters.js';
import { get as getTask } from '../../core/task-crud.js';
import type { Task } from '../../core/types.js';
import {
  createChannelCoderClient,
  type ChannelCoderClient,
  type WorkMode,
} from '../../integrations/channelcoder/index.js';

export type ExecutionType = 'docker' | 'detached' | 'tmux';

export interface DispatchCommandOptions {
  mode?: WorkMode;
  exec?: ExecutionType;
  rootDir?: string;
  continue?: string;
  dryRun?: boolean; // If true, show what would be executed without running it
}

/**
 * Main handler for the dispatch command
 * 
 * @param taskId Required task ID for autonomous execution
 * @param options Command options including mode and execution type
 */
export async function handleDispatchCommand(
  taskId: string,
  options: DispatchCommandOptions
): Promise<void> {
  try {
    // Handle continuation first
    if (options.continue) {
      const client = createChannelCoderClient();
      printSuccess(`Continuing session: ${options.continue}`);
      
      try {
        const result = await client.continueSession(options.continue);
        if (result.success) {
          printSuccess(`Session ${result.sessionName} continued successfully`);
        }
      } catch (error) {
        printError(`Failed to continue session: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
      return;
    }
    
    // Validate taskId is provided
    if (!taskId) {
      printError('Task ID is required for dispatch command');
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
    const worktreeManager = new WorktreeManager();
    const resolver = new EnvironmentResolver(worktreeManager);
    const dockerConfig = new DockerConfigService();
    const client = createChannelCoderClient();
    
    // Step 1: Load task and validate
    let task: Task | undefined;
    try {
      const result = await getTask(projectRoot, taskId);
      if (!result.success) {
        throw new Error(result.error || 'Task not found');
      }
      task = result.data;
    } catch (error) {
      printError(`Task '${taskId}' not found`);
      process.exit(1);
    }
    
    if (!task) {
      printError(`Task '${taskId}' not found`);
      process.exit(1);
    }
    
    // Step 2: Resolve and ensure environment
    const envId = await resolver.resolveEnvironmentId(taskId);
    const envInfo = await resolver.ensureEnvironment(envId);
    
    printSuccess(`Environment ready: ${envInfo.path}`);
    
    // Step 3: Get task information
    const taskInstruction = task.document.sections.instruction || '';
    const mode = options.mode || 'auto';
    const execType = options.exec || 'docker';
    
    // Common options for all execution types
    const baseOptions = {
      taskId,
      taskInstruction,
      mode,
      projectRoot,
      dryRun: options.dryRun,
      session: {
        parentId: task.metadata.parentTask
      }
    };
    
    // Step 4: Execute based on type
    let result;
    
    switch (execType) {
      case 'docker':
        if (options.dryRun) {
          printSuccess(`[DRY RUN] Would launch Claude in Docker (${mode} mode)`);
          printSuccess(`[DRY RUN] Would work in: ${envInfo.path}`);
          printSuccess(`[DRY RUN] Would use Docker image: ${dockerConfig.getDefaultImage()}`);
        } else {
          printSuccess(`Launching Claude in Docker (${mode} mode)...`);
          printSuccess(`Working in: ${envInfo.path}`);
          printSuccess(`Docker image: ${dockerConfig.getDefaultImage()}`);
        }
        
        result = await client.executeDocker({
          ...baseOptions,
          docker: {
            image: dockerConfig.getDefaultImage(),
            mounts: [`${envInfo.path}:/workspace:rw`],
            env: {
              TASK_ID: taskId,
              WORK_MODE: mode
            }
          },
          worktree: {
            branch: envInfo.branch,
            path: envInfo.path
          }
        });
        break;
        
      case 'detached':
        if (options.dryRun) {
          printSuccess(`[DRY RUN] Would launch Claude in detached mode (${mode} mode)`);
        } else {
          printSuccess(`Launching Claude in detached mode (${mode} mode)...`);
        }
        printSuccess(`Working in: ${envInfo.path}`);
        
        result = await client.executeDetached({
          ...baseOptions,
          worktree: {
            branch: envInfo.branch,
            path: envInfo.path
          }
        });
        break;
        
      case 'tmux':
        if (options.dryRun) {
          printSuccess(`[DRY RUN] Would launch Claude in tmux (${mode} mode)`);
          printSuccess(`[DRY RUN] Would work in: ${envInfo.path}`);
        } else {
          printSuccess(`Launching Claude in tmux (${mode} mode)...`);
          printSuccess(`Working in: ${envInfo.path}`);
        }
        
        result = await client.executeTmux({
          ...baseOptions,
          worktree: {
            branch: envInfo.branch,
            path: envInfo.path
          }
        });
        
        if (!options.dryRun) {
          printSuccess(`✓ Tmux window created`);
          printSuccess(`Attach with: tmux attach -t scopecraft`);
        }
        break;
        
      default:
        printError(`Unknown execution type: ${execType}`);
        process.exit(1);
    }
    
    // Display result information
    if (result.success) {
      printSuccess(`✅ Execution started successfully`);
      if (result.sessionName) {
        printSuccess(`Session: ${result.sessionName}`);
      }
      if (result.pid) {
        printSuccess(`PID: ${result.pid}`);
      }
      if (result.logFile) {
        printSuccess(`Log: ${result.logFile}`);
      }
      if (execType !== 'tmux') {
        printSuccess(`Continue with: sc dispatch --continue ${result.sessionName}`);
      }
    } else {
      printError(`Execution failed: ${result.error}`);
      process.exit(1);
    }
    
  } catch (error) {
    printError(`Dispatch command failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}