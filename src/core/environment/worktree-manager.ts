/**
 * Worktree Manager
 *
 * Handles git worktree operations for environment management.
 * Uses simple-git for reliable git operations instead of shell commands.
 */

import { existsSync } from 'node:fs';
import { type SimpleGit, simpleGit } from 'simple-git';
import { ConfigurationManager } from '../config/configuration-manager.js';
import { BranchNamingService } from './configuration-services.js';
import {
  EnvironmentError,
  EnvironmentErrorCodes,
  type WorktreeManager as IWorktreeManager,
  type WorktreeInfo,
  type WorktreeOptions,
} from './types.js';
import { WorktreePathResolver } from './worktree-path-resolver.js';

export class WorktreeManager implements IWorktreeManager {
  private git: SimpleGit;
  private pathResolver: WorktreePathResolver;
  private branchNaming: BranchNamingService;
  private config: ConfigurationManager;

  constructor(
    config?: ConfigurationManager,
    pathResolver?: WorktreePathResolver,
    branchNaming?: BranchNamingService
  ) {
    this.config = config || ConfigurationManager.getInstance();
    this.pathResolver = pathResolver || new WorktreePathResolver(this.config);
    this.branchNaming = branchNaming || new BranchNamingService();

    // Initialize git at the project root
    const rootConfig = this.config.getRootConfig();
    if (!rootConfig.validated || !rootConfig.path) {
      throw new EnvironmentError(
        'No valid project root found',
        EnvironmentErrorCodes.CONFIGURATION_ERROR
      );
    }

    this.git = simpleGit(rootConfig.path);
  }

  /**
   * Creates a new worktree for the given task
   */
  async create(taskId: string, options?: WorktreeOptions): Promise<WorktreeInfo> {
    this.validateTaskId(taskId);

    try {
      const worktreePath = await this.pathResolver.getWorktreePath(taskId);
      const branchName = this.branchNaming.getBranchName(taskId);

      // Check existing worktree
      const existing = await this.handleExistingWorktree(taskId, worktreePath, options?.force);
      if (existing) {
        return existing;
      }

      // Create new worktree
      await this.createNewWorktree(worktreePath, branchName, options);

      // Get commit info
      const worktreeGit = simpleGit(worktreePath);
      const log = await worktreeGit.log(['-1']);
      const commit = log.latest?.hash || 'unknown';

      return {
        path: worktreePath,
        branch: branchName,
        taskId,
        commit,
      };
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
   * Removes a worktree safely
   */
  async remove(taskId: string): Promise<void> {
    if (!taskId) {
      throw new EnvironmentError(
        'Task ID is required to remove worktree',
        EnvironmentErrorCodes.INVALID_TASK_ID
      );
    }

    try {
      const worktreePath = await this.pathResolver.getWorktreePath(taskId);

      // Check if worktree exists
      const worktrees = await this.listRawWorktrees();
      const worktree = worktrees.find((w) => w.path === worktreePath);

      if (!worktree) {
        throw new EnvironmentError(
          `Worktree not found for task ${taskId}`,
          EnvironmentErrorCodes.WORKTREE_NOT_FOUND,
          { taskId, path: worktreePath }
        );
      }

      // Remove the worktree
      await this.git.raw(['worktree', 'remove', worktreePath, '--force']);

      // Prune worktree list to clean up any references
      await this.git.raw(['worktree', 'prune']);
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
   * Lists all active worktrees
   */
  async list(): Promise<WorktreeInfo[]> {
    try {
      const rawWorktrees = await this.listRawWorktrees();
      const worktreeInfos: WorktreeInfo[] = [];

      for (const raw of rawWorktrees) {
        // Try to extract task ID from branch name, but show ALL worktrees
        const extractedTaskId = this.branchNaming.extractTaskIdFromBranch(raw.branch);
        // If no task ID extracted, use the branch name as the task ID
        const taskId = extractedTaskId || raw.branch;

        // Get commit info
        try {
          const worktreeGit = simpleGit(raw.path);
          const log = await worktreeGit.log(['-1']);
          const commit = log.latest?.hash || raw.commit;

          worktreeInfos.push({
            path: raw.path,
            branch: raw.branch,
            taskId,
            commit,
          });
        } catch {
          // If we can't access the worktree, include it with the original commit
          worktreeInfos.push({
            path: raw.path,
            branch: raw.branch,
            taskId,
            commit: raw.commit,
          });
        }
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
   * Checks if a worktree exists
   */
  async exists(taskId: string): Promise<boolean> {
    if (!taskId) {
      return false;
    }

    try {
      const worktrees = await this.list();
      return worktrees.some((w) => w.taskId === taskId);
    } catch {
      return false;
    }
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
    return this.pathResolver.getWorktreePath(taskId);
  }

  /**
   * Gets the current branch
   */
  private async getCurrentBranch(): Promise<string | null> {
    try {
      const branches = await this.git.branch();
      return branches.current;
    } catch {
      return null;
    }
  }

  /**
   * Lists raw worktree information from git
   */
  private async listRawWorktrees(): Promise<
    Array<{ path: string; branch: string; commit: string }>
  > {
    const output = await this.git.raw(['worktree', 'list', '--porcelain']);
    const worktrees: Array<{ path: string; branch: string; commit: string }> = [];
    let current: Partial<{ path: string; branch: string; commit: string }> = {};

    for (const line of output.split('\n')) {
      if (!line.trim()) {
        if (current.path && current.branch && current.commit) {
          worktrees.push(current as { path: string; branch: string; commit: string });
        }
        current = {};
        continue;
      }

      if (line.startsWith('worktree ')) {
        current.path = line.substring('worktree '.length).trim();
      } else if (line.startsWith('HEAD ')) {
        current.commit = line.substring('HEAD '.length).trim();
      } else if (line.startsWith('branch ')) {
        const branchRef = line.substring('branch '.length).trim();
        current.branch = branchRef.replace('refs/heads/', '');
      }
    }

    // Add the last worktree if exists
    if (current.path && current.branch && current.commit) {
      worktrees.push(current as { path: string; branch: string; commit: string });
    }

    return worktrees;
  }

  /**
   * Validates task ID input
   */
  private validateTaskId(taskId: string): void {
    if (!taskId) {
      throw new EnvironmentError(
        'Task ID is required to create worktree',
        EnvironmentErrorCodes.INVALID_TASK_ID
      );
    }
  }

  /**
   * Handles existing worktree logic
   */
  private async handleExistingWorktree(
    taskId: string,
    worktreePath: string,
    force?: boolean
  ): Promise<WorktreeInfo | null> {
    if (!force && existsSync(worktreePath)) {
      // Verify it's actually a valid worktree
      const worktrees = await this.list();
      const existing = worktrees.find((w) => w.taskId === taskId);

      if (existing) {
        return existing;
      }

      // Path exists but not a worktree - this is an error
      throw new EnvironmentError(
        `Path exists but is not a worktree: ${worktreePath}`,
        EnvironmentErrorCodes.WORKTREE_CONFLICT,
        { taskId, path: worktreePath }
      );
    }
    return null;
  }

  /**
   * Creates new worktree with branch logic
   */
  private async createNewWorktree(
    worktreePath: string,
    branchName: string,
    options?: WorktreeOptions
  ): Promise<void> {
    // Determine base branch
    const baseBranch =
      options?.base || (await this.getCurrentBranch()) || this.branchNaming.getDefaultBaseBranch();

    // Check if branch already exists
    const branches = await this.git.branch();
    const branchExists =
      branches.all.includes(branchName) || branches.all.includes(`remotes/origin/${branchName}`);

    if (branchExists && !options?.force) {
      // Branch exists, create worktree from existing branch
      await this.git.raw(['worktree', 'add', worktreePath, branchName]);
    } else {
      // Create new branch and worktree
      await this.git.raw(['worktree', 'add', '-b', branchName, worktreePath, baseBranch]);
    }
  }
}
