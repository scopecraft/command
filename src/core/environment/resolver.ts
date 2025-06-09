/**
 * Environment Resolver
 *
 * Resolves task IDs to environment IDs and manages environment lifecycle.
 * Handles the parent/subtask logic for environment determination.
 */

import { ConfigurationManager } from '../config/configuration-manager.js';
import { get as getTask } from '../task-crud.js';
import type { Task } from '../types.js';
import { BranchNamingService } from './configuration-services.js';
import {
  EnvironmentError,
  EnvironmentErrorCodes,
  type EnvironmentInfo,
  type EnvironmentResolver as IEnvironmentResolver,
} from './types.js';
import { WorktreeManager } from './worktree-manager.js';

export class EnvironmentResolver implements IEnvironmentResolver {
  private worktreeManager: WorktreeManager;
  private branchNaming: BranchNamingService;
  private config: ConfigurationManager;

  constructor(
    worktreeManager?: WorktreeManager,
    branchNaming?: BranchNamingService,
    config?: ConfigurationManager
  ) {
    this.worktreeManager = worktreeManager || new WorktreeManager();
    this.branchNaming = branchNaming || new BranchNamingService();
    this.config = config || ConfigurationManager.getInstance();
  }

  /**
   * Resolves the environment ID for a task
   * - For parent tasks: returns the task ID
   * - For subtasks: returns the parent ID
   * - For simple tasks: returns the task ID
   */
  async resolveEnvironmentId(taskId: string): Promise<string> {
    if (!taskId) {
      throw new EnvironmentError(
        'Task ID is required for environment resolution',
        EnvironmentErrorCodes.INVALID_TASK_ID
      );
    }

    try {
      // Get project root from config
      const rootConfig = this.config.getRootConfig();
      if (!rootConfig.validated || !rootConfig.path) {
        throw new EnvironmentError(
          'No valid project root found',
          EnvironmentErrorCodes.CONFIGURATION_ERROR
        );
      }

      // Load the task to check if it's a subtask
      const taskResult = await getTask(rootConfig.path, taskId);

      if (!taskResult.success) {
        throw new EnvironmentError(
          `Task not found: ${taskId}`,
          EnvironmentErrorCodes.TASK_NOT_FOUND,
          { taskId, error: taskResult.error }
        );
      }

      const task = taskResult.data;

      // If this is a subtask (has a parent), use the parent's ID as the environment
      if (task?.metadata.parentTask) {
        return task.metadata.parentTask;
      }

      // Otherwise (parent task or simple task), use the task ID itself
      return taskId;
    } catch (error) {
      if (error instanceof EnvironmentError) {
        throw error;
      }

      throw new EnvironmentError(
        `Failed to resolve environment for task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
        EnvironmentErrorCodes.TASK_NOT_FOUND,
        { taskId, originalError: error }
      );
    }
  }

  /**
   * Ensures environment exists (creates if missing)
   * @returns Environment info including path
   */
  async ensureEnvironment(envId: string): Promise<EnvironmentInfo> {
    if (!envId) {
      throw new EnvironmentError(
        'Environment ID is required',
        EnvironmentErrorCodes.INVALID_TASK_ID
      );
    }

    try {
      // Check if worktree already exists
      const exists = await this.worktreeManager.exists(envId);

      if (exists) {
        // Get existing worktree info
        const worktrees = await this.worktreeManager.list();
        const worktree = worktrees.find((w) => w.taskId === envId);

        if (worktree) {
          return {
            id: envId,
            path: worktree.path,
            branch: worktree.branch,
            exists: true,
            isActive: true,
          };
        }
      }

      // Create new worktree
      const worktree = await this.worktreeManager.create(envId);

      return {
        id: envId,
        path: worktree.path,
        branch: worktree.branch,
        exists: true,
        isActive: true,
      };
    } catch (error) {
      if (error instanceof EnvironmentError) {
        throw error;
      }

      throw new EnvironmentError(
        `Failed to ensure environment for ${envId}: ${error instanceof Error ? error.message : String(error)}`,
        EnvironmentErrorCodes.GIT_OPERATION_FAILED,
        { envId, originalError: error }
      );
    }
  }

  /**
   * Gets environment info without creating
   */
  async getEnvironmentInfo(envId: string): Promise<EnvironmentInfo | null> {
    if (!envId) {
      return null;
    }

    try {
      // Check if worktree exists
      const exists = await this.worktreeManager.exists(envId);

      if (!exists) {
        return null;
      }

      // Get worktree info
      const worktrees = await this.worktreeManager.list();
      const worktree = worktrees.find((w) => w.taskId === envId);

      if (!worktree) {
        return null;
      }

      return {
        id: envId,
        path: worktree.path,
        branch: worktree.branch,
        exists: true,
        isActive: true,
      };
    } catch (_error) {
      // If we can't get info, return null rather than throwing
      return null;
    }
  }

  /**
   * Helper method to get environment info for a task (not just environment ID)
   * This resolves the task to its environment ID first
   */
  async getTaskEnvironmentInfo(taskId: string): Promise<EnvironmentInfo | null> {
    try {
      const envId = await this.resolveEnvironmentId(taskId);
      return this.getEnvironmentInfo(envId);
    } catch {
      return null;
    }
  }

  /**
   * Helper method to ensure environment for a task (not just environment ID)
   * This resolves the task to its environment ID first
   */
  async ensureTaskEnvironment(taskId: string): Promise<EnvironmentInfo> {
    const envId = await this.resolveEnvironmentId(taskId);
    return this.ensureEnvironment(envId);
  }
}
