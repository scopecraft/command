/**
 * Pure Worktree Functions
 *
 * Functional wrapper around ChannelCoder's worktree utilities.
 * Provides composable, pure functions that avoid duplication.
 */

import { worktree, worktreeUtils } from 'channelcoder';
import { ConfigurationManager } from '../config/configuration-manager.js';
import { BranchNamingService } from './configuration-services.js';
import {
  EnvironmentError,
  EnvironmentErrorCodes,
  type WorktreeInfo,
  type WorktreeOptions,
} from './types.js';
import { WorktreePathResolver } from './worktree-path-resolver.js';

// Internal types for ChannelCoder integration
interface ChannelCoderWorktreeInfo {
  path: string;
  branch: string;
  commit: string;
  isBare?: boolean;
  isDetached?: boolean;
}

/**
 * Configuration context for worktree operations
 */
export interface WorktreeContext {
  config: ConfigurationManager;
  pathResolver: WorktreePathResolver;
  branchNaming: BranchNamingService;
}

/**
 * Creates a worktree context with default services
 */
export function createWorktreeContext(
  config?: ConfigurationManager,
  pathResolver?: WorktreePathResolver,
  branchNaming?: BranchNamingService
): WorktreeContext {
  const configManager = config || ConfigurationManager.getInstance();
  
  return {
    config: configManager,
    pathResolver: pathResolver || new WorktreePathResolver(configManager),
    branchNaming: branchNaming || new BranchNamingService(),
  };
}

/**
 * Validates project root configuration
 */
function validateProjectRoot(config: ConfigurationManager): string {
  const rootConfig = config.getRootConfig();
  if (!rootConfig.validated || !rootConfig.path) {
    throw new EnvironmentError(
      'No valid project root found',
      EnvironmentErrorCodes.CONFIGURATION_ERROR
    );
  }
  return rootConfig.path;
}

/**
 * Validates task ID input
 */
function validateTaskId(taskId: string): void {
  if (!taskId) {
    throw new EnvironmentError(
      'Task ID is required for worktree operations',
      EnvironmentErrorCodes.INVALID_TASK_ID
    );
  }
}

/**
 * Converts ChannelCoder worktree info to our format
 */
function convertWorktreeInfo(
  ccInfo: any, // Use any to avoid type casting issues with ChannelCoder types
  taskId: string
): WorktreeInfo {
  return {
    path: ccInfo.path,
    branch: ccInfo.branch,
    taskId,
    commit: ccInfo.commit || 'unknown',
  };
}

/**
 * Creates a new worktree for the given task using ChannelCoder utilities
 */
export async function createWorktree(
  taskId: string,
  context: WorktreeContext,
  options?: WorktreeOptions
): Promise<WorktreeInfo> {
  validateTaskId(taskId);
  validateProjectRoot(context.config);

  try {
    const worktreePath = await context.pathResolver.getWorktreePath(taskId);
    const branchName = context.branchNaming.getBranchName(taskId);

    // Check if worktree already exists using ChannelCoder
    if (!options?.force) {
      const existing = await worktreeUtils.worktreeUtils.find(branchName);
      if (existing) {
        // Extract task ID from existing worktree
        const extractedTaskId = context.branchNaming.extractTaskIdFromBranch(existing.branch);
        const resultTaskId = extractedTaskId || existing.branch;
        
        return convertWorktreeInfo(existing, resultTaskId);
      }
    }

    // Create worktree using ChannelCoder
    // ChannelCoder's create handles branch creation automatically
    await worktreeUtils.worktreeUtils.create(branchName);
    
    // Get the created worktree info
    const created = await worktreeUtils.worktreeUtils.find(branchName);
    if (!created) {
      throw new EnvironmentError(
        `Failed to find created worktree for branch ${branchName}`,
        EnvironmentErrorCodes.GIT_OPERATION_FAILED,
        { taskId, branch: branchName }
      );
    }

    return convertWorktreeInfo(created, taskId);
  } catch (error) {
    if (error instanceof EnvironmentError) {
      throw error;
    }

    throw new EnvironmentError(
      `Failed to create worktree for task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      EnvironmentErrorCodes.GIT_OPERATION_FAILED,
      { taskId, originalError: error }
    );
  }
}

/**
 * Removes a worktree safely using ChannelCoder utilities
 */
export async function removeWorktree(
  taskId: string,
  context: WorktreeContext
): Promise<void> {
  validateTaskId(taskId);

  try {
    const branchName = context.branchNaming.getBranchName(taskId);
    
    // Check if worktree exists
    const existing = await worktreeUtils.worktreeUtils.find(branchName);
    if (!existing) {
      throw new EnvironmentError(
        `Worktree not found for task ${taskId}`,
        EnvironmentErrorCodes.WORKTREE_NOT_FOUND,
        { taskId, branch: branchName }
      );
    }

    // Remove using ChannelCoder utilities
    await worktreeUtils.worktreeUtils.remove(branchName);
  } catch (error) {
    if (error instanceof EnvironmentError) {
      throw error;
    }

    throw new EnvironmentError(
      `Failed to remove worktree for task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      EnvironmentErrorCodes.GIT_OPERATION_FAILED,
      { taskId, originalError: error }
    );
  }
}

/**
 * Lists all active worktrees using ChannelCoder utilities
 */
export async function listWorktrees(context: WorktreeContext): Promise<WorktreeInfo[]> {
  try {
    const ccWorktrees = await worktreeUtils.worktreeUtils.list();
    const worktreeInfos: WorktreeInfo[] = [];

    for (const ccWorktree of ccWorktrees) {
      // Extract task ID from branch name, fallback to branch name
      const extractedTaskId = context.branchNaming.extractTaskIdFromBranch(ccWorktree.branch);
      const taskId = extractedTaskId || ccWorktree.branch;

      worktreeInfos.push(convertWorktreeInfo(ccWorktree, taskId));
    }

    return worktreeInfos;
  } catch (error) {
    throw new EnvironmentError(
      `Failed to list worktrees: ${error instanceof Error ? error.message : String(error)}`,
      EnvironmentErrorCodes.GIT_OPERATION_FAILED,
      { originalError: error }
    );
  }
}

/**
 * Checks if a worktree exists for the given task
 */
export async function worktreeExists(
  taskId: string,
  context: WorktreeContext
): Promise<boolean> {
  if (!taskId) {
    return false;
  }

  try {
    const branchName = context.branchNaming.getBranchName(taskId);
    return await worktreeUtils.worktreeUtils.exists(branchName);
  } catch {
    return false;
  }
}

/**
 * Gets the path for a worktree (async version)
 */
export async function getWorktreePath(
  taskId: string,
  context: WorktreeContext
): Promise<string> {
  return context.pathResolver.getWorktreePath(taskId);
}

/**
 * Executes code within a worktree context using ChannelCoder's high-level API
 */
export async function withWorktree<T>(
  taskId: string,
  context: WorktreeContext,
  callback: (worktreeInfo: WorktreeInfo) => Promise<T>
): Promise<T> {
  validateTaskId(taskId);
  
  const branchName = context.branchNaming.getBranchName(taskId);
  
  return worktree(branchName, async (wt) => {
    // Convert ChannelCoder worktree info to our format
    const worktreeInfo: WorktreeInfo = {
      path: wt.path,
      branch: branchName,
      taskId,
      commit: wt.commit || 'unknown',
    };
    
    return callback(worktreeInfo);
  });
}

/**
 * Cleans up unused worktree references
 */
export async function cleanupWorktrees(): Promise<void> {
  try {
    await worktreeUtils.worktreeUtils.cleanup();
  } catch (error) {
    throw new EnvironmentError(
      `Failed to cleanup worktrees: ${error instanceof Error ? error.message : String(error)}`,
      EnvironmentErrorCodes.GIT_OPERATION_FAILED,
      { originalError: error }
    );
  }
}

/**
 * Gets current worktree information
 */
export async function getCurrentWorktree(context: WorktreeContext): Promise<WorktreeInfo | null> {
  try {
    const current = await worktreeUtils.worktreeUtils.current();
    if (!current) {
      return null;
    }

    // Extract task ID from branch name
    const extractedTaskId = context.branchNaming.extractTaskIdFromBranch(current.branch);
    const taskId = extractedTaskId || current.branch;

    return convertWorktreeInfo(current, taskId);
  } catch {
    return null;
  }
}

/**
 * Composite function for tmux session workflow
 * Creates worktree if needed and returns session info
 */
export async function prepareWorktreeForTmux(
  taskId: string,
  context: WorktreeContext,
  options?: WorktreeOptions
): Promise<{ worktreeInfo: WorktreeInfo; sessionName: string }> {
  // Ensure worktree exists
  const worktreeInfo = await createWorktree(taskId, context, options);
  
  // Generate session name for tmux
  const sessionName = `scopecraft-${taskId}`;
  
  return { worktreeInfo, sessionName };
}