/**
 * Worktree Manager
 *
 * Class-based wrapper around pure worktree functions for backward compatibility.
 * Uses ChannelCoder utilities to avoid duplication.
 */

import type { ConfigurationManager } from '../config/configuration-manager.js';
import type { BranchNamingService } from './configuration-services.js';
import {
  EnvironmentError,
  EnvironmentErrorCodes,
  type WorktreeManager as IWorktreeManager,
  type WorktreeInfo,
  type WorktreeOptions,
} from './types.js';
import {
  type WorktreeContext,
  createWorktree,
  createWorktreeContext,
  getWorktreePath,
  listWorktrees,
  removeWorktree,
  worktreeExists,
} from './worktree-functions.js';
import type { WorktreePathResolver } from './worktree-path-resolver.js';

export class WorktreeManager implements IWorktreeManager {
  private context: WorktreeContext;

  constructor(
    config?: ConfigurationManager,
    pathResolver?: WorktreePathResolver,
    branchNaming?: BranchNamingService
  ) {
    this.context = createWorktreeContext(config, pathResolver, branchNaming);
  }

  /**
   * Creates a new worktree for the given task
   */
  async create(taskId: string, options?: WorktreeOptions): Promise<WorktreeInfo> {
    return createWorktree(taskId, this.context, options);
  }

  /**
   * Removes a worktree safely
   */
  async remove(taskId: string): Promise<void> {
    return removeWorktree(taskId, this.context);
  }

  /**
   * Lists all active worktrees
   */
  async list(): Promise<WorktreeInfo[]> {
    return listWorktrees(this.context);
  }

  /**
   * Checks if a worktree exists
   */
  async exists(taskId: string): Promise<boolean> {
    return worktreeExists(taskId, this.context);
  }

  /**
   * Gets the path for a worktree (doesn't check existence)
   */
  getPath(_taskId: string): string {
    // This is synchronous, but we need to handle the async path resolver
    // For now, we'll throw an error - the async version should be used
    throw new EnvironmentError(
      'Use getWorktreePath() for async path resolution',
      EnvironmentErrorCodes.CONFIGURATION_ERROR
    );
  }

  /**
   * Gets the path for a worktree (async version)
   */
  async getWorktreePath(taskId: string): Promise<string> {
    return getWorktreePath(taskId, this.context);
  }
}
