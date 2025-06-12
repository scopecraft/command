/**
 * Environment Resolution Functions
 *
 * Pure functions for environment resolution that properly use ConfigurationManager.
 * Replaces the class-based EnvironmentResolver with functional architecture.
 *
 * Based on TRD requirements:
 * - Keep ConfigurationManager as foundation
 * - Convert environment system to pure functions
 * - Fix session storage bug by consistently using ConfigurationManager's root
 * - Maintain backward compatibility
 */

import type { ConfigurationManager } from '../config/configuration-manager.js';
import { get as getTask } from '../task-crud.js';
import type { Task } from '../types.js';
import { BranchNamingService } from './configuration-services.js';
import {
  EnvironmentError,
  EnvironmentErrorCodes,
  type EnvironmentInfo,
  type WorktreeInfo,
} from './types.js';
import {
  type WorktreeContext,
  createWorktree,
  createWorktreeContext,
  getWorktreePath as getWorktreePathPure,
  listWorktrees,
  worktreeExists,
} from './worktree-functions.js';

/**
 * Resolves the environment ID for a task
 * - For parent tasks: returns the task ID
 * - For subtasks: returns the parent ID
 * - For simple tasks: returns the task ID
 *
 * @param taskId - Task ID to resolve
 * @param config - ConfigurationManager instance to use for project root
 * @returns Promise<string> - Environment ID
 */
export async function resolveEnvironmentId(
  taskId: string,
  config: ConfigurationManager
): Promise<string> {
  if (!taskId) {
    throw new EnvironmentError(
      'Task ID is required for environment resolution',
      EnvironmentErrorCodes.INVALID_TASK_ID
    );
  }

  try {
    // Get project root from ConfigurationManager (following TRD)
    const rootConfig = config.getRootConfig();
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
 * Gets the worktree path for an environment ID
 * Pure function equivalent of WorktreeManager.getWorktreePath
 *
 * @param envId - Environment ID
 * @param config - ConfigurationManager instance
 * @returns Promise<string> - Worktree path
 */
export async function getWorktreePath(
  envId: string,
  config: ConfigurationManager
): Promise<string> {
  if (!envId) {
    throw new EnvironmentError('Environment ID is required', EnvironmentErrorCodes.INVALID_TASK_ID);
  }

  // Use pure worktree functions with ChannelCoder integration
  const context = createWorktreeContext(config);
  return getWorktreePathPure(envId, context);
}

/**
 * Gets the branch name for an environment ID
 * Pure function equivalent of BranchNamingService.getBranchName
 *
 * @param envId - Environment ID
 * @returns string - Branch name
 */
export function getBranchNameForTask(envId: string): string {
  if (!envId) {
    throw new EnvironmentError('Environment ID is required', EnvironmentErrorCodes.INVALID_TASK_ID);
  }

  // For now, delegate to existing BranchNamingService
  // This is already a pure function pattern, just needs to be exposed
  const branchNaming = new BranchNamingService();
  return branchNaming.getBranchName(envId);
}

/**
 * Ensures environment exists (creates if missing)
 * Pure function equivalent of EnvironmentResolver.ensureEnvironment
 *
 * @param envId - Environment ID
 * @param config - ConfigurationManager instance
 * @param dryRun - If true, only check existence without creating
 * @returns Promise<EnvironmentInfo> - Environment info including path
 */
export async function ensureEnvironment(
  envId: string,
  config: ConfigurationManager,
  dryRun = false
): Promise<EnvironmentInfo> {
  if (!envId) {
    throw new EnvironmentError('Environment ID is required', EnvironmentErrorCodes.INVALID_TASK_ID);
  }

  try {
    // Create worktree context using pure functions
    const context = createWorktreeContext(config);

    // Check if worktree already exists
    const exists = await worktreeExists(envId, context);

    if (exists) {
      // Get existing worktree info
      const worktrees = await listWorktrees(context);
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

    // In dry-run mode, don't create - just return what would be created
    if (dryRun) {
      const branchNaming = new BranchNamingService();
      const branch = branchNaming.getBranchName(envId);
      const path = await getWorktreePathPure(envId, context);
      return {
        id: envId,
        path: path,
        branch: branch,
        exists: false,
        isActive: false,
      };
    }

    // Create new worktree using pure functions
    const worktree = await createWorktree(envId, context);

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
 * Pure function equivalent of EnvironmentResolver.getEnvironmentInfo
 *
 * @param envId - Environment ID
 * @param config - ConfigurationManager instance
 * @returns Promise<EnvironmentInfo | null> - Environment info or null if not found
 */
export async function getEnvironmentInfo(
  envId: string,
  config: ConfigurationManager
): Promise<EnvironmentInfo | null> {
  if (!envId) {
    return null;
  }

  try {
    const context = createWorktreeContext(config);

    // Check if worktree exists
    const exists = await worktreeExists(envId, context);

    if (!exists) {
      return null;
    }

    // Get worktree info
    const worktrees = await listWorktrees(context);
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
 * Helper function to resolve environment ID for a task and then get its info
 * Combines resolveEnvironmentId + getEnvironmentInfo
 *
 * @param taskId - Task ID
 * @param config - ConfigurationManager instance
 * @returns Promise<EnvironmentInfo | null> - Environment info or null if not found
 */
export async function getTaskEnvironmentInfo(
  taskId: string,
  config: ConfigurationManager
): Promise<EnvironmentInfo | null> {
  try {
    const envId = await resolveEnvironmentId(taskId, config);
    return getEnvironmentInfo(envId, config);
  } catch {
    return null;
  }
}

/**
 * Helper function to resolve environment ID for a task and then ensure it exists
 * Combines resolveEnvironmentId + ensureEnvironment
 *
 * @param taskId - Task ID
 * @param config - ConfigurationManager instance
 * @param dryRun - If true, only check existence without creating
 * @returns Promise<EnvironmentInfo> - Environment info
 */
export async function ensureTaskEnvironment(
  taskId: string,
  config: ConfigurationManager,
  dryRun = false
): Promise<EnvironmentInfo> {
  const envId = await resolveEnvironmentId(taskId, config);
  return ensureEnvironment(envId, config, dryRun);
}

