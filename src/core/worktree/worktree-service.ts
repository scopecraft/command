import path from 'node:path';
import { simpleGit, SimpleGit } from 'simple-git';
import { CacheManager } from './cache-manager.js';
import {
  ChangedFile,
  CommitInfo,
  GitOperationError,
  WorktreeNotFoundError,
  Worktree,
  WorktreeStatus,
  WorktreeSummary,
  WorkflowStatus,
} from './types.js';

/**
 * Core service for git worktree operations
 */
export class WorktreeService {
  private cacheManager: CacheManager;
  private repoPath: string;
  private git: SimpleGit;

  /**
   * Creates a new WorktreeService
   * @param repoPath Path to the git repository
   * @param cacheTtl Cache Time To Live in milliseconds (default: 30s)
   */
  constructor(repoPath: string, cacheTtl = 30000) {
    this.repoPath = repoPath;
    this.cacheManager = new CacheManager(cacheTtl);
    this.git = simpleGit(this.repoPath);
  }

  /**
   * Gets the repository path
   * @returns Repository path
   */
  getRepositoryPath(): string {
    return this.repoPath;
  }

  /**
   * Lists all worktrees in the repository
   * @param useCache Whether to use cached results (default: true)
   * @returns Array of worktrees
   */
  async listWorktrees(useCache = true): Promise<Worktree[]> {
    const cacheKey = 'worktrees:list';
    
    if (!useCache) {
      this.cacheManager.invalidate(cacheKey);
    }
    
    return this.cacheManager.getOrCompute(cacheKey, async () => {
      try {
        // Get worktrees using porcelain format for easy parsing
        const result = await this.git.raw(['worktree', 'list', '--porcelain']);
        const parsedWorktrees = this.parseWorktreesOutput(result);
        
        // Ensure required fields are present
        const worktrees = parsedWorktrees
          .filter(worktree => worktree.path && worktree.branch && worktree.headCommit) as Worktree[];
        
        // Fetch status and other details for each worktree
        const worktreesWithDetails = await Promise.all(
          worktrees.map(async (worktree) => {
            try {
              const status = await this.getWorktreeStatus(worktree.path, useCache);
              const lastCommit = await this.getLastCommit(worktree.path, useCache);
              const changedFiles = await this.getChangedFiles(worktree.path, useCache);
              
              return {
                ...worktree,
                status,
                headCommit: lastCommit.hash,
                lastActivity: new Date(lastCommit.date),
                changedFiles,
              } as Worktree;
            } catch (error) {
              return {
                ...worktree,
                status: WorktreeStatus.UNKNOWN,
                error: error instanceof Error ? error.message : String(error),
              } as Worktree;
            }
          })
        );
        
        return worktreesWithDetails;
      } catch (error) {
        throw new GitOperationError(`Failed to list worktrees: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  /**
   * Gets a specific worktree by path
   * @param worktreePath Path to the worktree
   * @param useCache Whether to use cached results (default: true)
   * @returns Worktree details
   */
  async getWorktree(worktreePath: string, useCache = true): Promise<Worktree> {
    const cacheKey = this.cacheManager.createKey('worktree', worktreePath);
    
    if (!useCache) {
      this.cacheManager.invalidate(cacheKey);
    }
    
    return this.cacheManager.getOrCompute(cacheKey, async () => {
      try {
        // Normalize path for consistent cache keys
        const normalizedPath = path.normalize(worktreePath);
        
        // Get all worktrees and find the one that matches the path
        const allWorktrees = await this.listWorktrees(useCache);
        const worktree = allWorktrees.find(w => path.normalize(w.path) === normalizedPath);
        
        if (!worktree) {
          throw new WorktreeNotFoundError(`Worktree not found at path: ${worktreePath}`);
        }
        
        return worktree;
      } catch (error) {
        if (error instanceof WorktreeNotFoundError) {
          throw error;
        }
        throw new GitOperationError(`Failed to get worktree: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  /**
   * Gets the status of a worktree
   * @param worktreePath Path to the worktree
   * @param useCache Whether to use cached results (default: true)
   * @returns Worktree status
   */
  async getWorktreeStatus(worktreePath: string, useCache = true): Promise<WorktreeStatus> {
    const cacheKey = this.cacheManager.createKey('status', worktreePath);
    
    if (!useCache) {
      this.cacheManager.invalidate(cacheKey);
    }
    
    return this.cacheManager.getOrCompute(cacheKey, async () => {
      try {
        const git = simpleGit(worktreePath);
        const status = await git.status();
        
        if (status.conflicted.length > 0) {
          return WorktreeStatus.CONFLICT;
        } else if (status.modified.length > 0 || status.deleted.length > 0 || status.renamed.length > 0) {
          return WorktreeStatus.MODIFIED;
        } else if (status.not_added.length > 0) {
          return WorktreeStatus.UNTRACKED;
        } else {
          return WorktreeStatus.CLEAN;
        }
      } catch (error) {
        return WorktreeStatus.UNKNOWN;
      }
    });
  }

  /**
   * Gets the changed files in a worktree
   * @param worktreePath Path to the worktree
   * @param useCache Whether to use cached results (default: true)
   * @returns Array of changed files
   */
  async getChangedFiles(worktreePath: string, useCache = true): Promise<ChangedFile[]> {
    const cacheKey = this.cacheManager.createKey('changedFiles', worktreePath);
    
    if (!useCache) {
      this.cacheManager.invalidate(cacheKey);
    }
    
    return this.cacheManager.getOrCompute(cacheKey, async () => {
      try {
        const git = simpleGit(worktreePath);
        const status = await git.status();
        
        const changedFiles: ChangedFile[] = [
          ...status.modified.map((path: string) => ({
            path,
            status: 'modified' as const,
          })),
          ...status.not_added.map((path: string) => ({
            path,
            status: 'untracked' as const,
          })),
          ...status.deleted.map((path: string) => ({
            path,
            status: 'deleted' as const,
          })),
          ...status.created.map((path: string) => ({
            path,
            status: 'added' as const,
          })),
          ...status.renamed.map(({ from, to }: { from: string, to: string }) => ({
            path: to,
            oldPath: from,
            status: 'renamed' as const,
          })),
          ...status.conflicted.map((path: string) => ({
            path,
            status: 'conflicted' as const,
          })),
        ];
        
        return changedFiles;
      } catch (error) {
        return [];
      }
    });
  }

  /**
   * Gets the count of changed files in a worktree
   * @param worktreePath Path to the worktree
   * @param useCache Whether to use cached results (default: true)
   * @returns Count of changed files
   */
  async getChangesCount(worktreePath: string, useCache = true): Promise<number> {
    const changedFiles = await this.getChangedFiles(worktreePath, useCache);
    return changedFiles.length;
  }

  /**
   * Gets information about the last commit in a worktree
   * @param worktreePath Path to the worktree
   * @param useCache Whether to use cached results (default: true)
   * @returns Last commit information
   */
  async getLastCommit(worktreePath: string, useCache = true): Promise<CommitInfo> {
    const cacheKey = this.cacheManager.createKey('lastCommit', worktreePath);
    
    if (!useCache) {
      this.cacheManager.invalidate(cacheKey);
    }
    
    return this.cacheManager.getOrCompute(cacheKey, async () => {
      try {
        const git = simpleGit(worktreePath);
        
        // We'll use direct git commands to get the commit info in the format we need
        const result = await git.raw([
          'log',
          '-1',
          '--format=%H|%s|%an|%ad',
        ]);
        
        // Parse the result
        if (result) {
          const parts = result.trim().split('|');
          
          if (parts.length >= 4) {
            const [ hash, message, author, date ] = parts;
            return { hash, message, author, date };
          }
        }
        
        throw new GitOperationError('No commits found in the repository');
      } catch (error) {
        throw new GitOperationError(`Failed to get last commit: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  /**
   * Gets the timestamp of the last activity in a worktree
   * @param worktreePath Path to the worktree
   * @param useCache Whether to use cached results (default: true)
   * @returns Last activity timestamp
   */
  async getLastActivity(worktreePath: string, useCache = true): Promise<Date> {
    const lastCommit = await this.getLastCommit(worktreePath, useCache);
    return new Date(lastCommit.date);
  }

  /**
   * Gets a summary of all worktrees
   * @param useCache Whether to use cached results (default: true)
   * @returns Worktree summary
   */
  async getWorktreeSummary(useCache = true): Promise<WorktreeSummary> {
    const worktrees = await this.listWorktrees(useCache);
    
    // Count worktrees in each status
    const statusCounts = worktrees.reduce(
      (counts, worktree) => {
        counts[worktree.status]++;
        return counts;
      },
      {
        [WorktreeStatus.CLEAN]: 0,
        [WorktreeStatus.MODIFIED]: 0,
        [WorktreeStatus.UNTRACKED]: 0,
        [WorktreeStatus.CONFLICT]: 0,
        [WorktreeStatus.UNKNOWN]: 0,
      }
    );
    
    return {
      totalWorktrees: worktrees.length,
      clean: statusCounts[WorktreeStatus.CLEAN],
      modified: statusCounts[WorktreeStatus.MODIFIED],
      untracked: statusCounts[WorktreeStatus.UNTRACKED],
      conflict: statusCounts[WorktreeStatus.CONFLICT],
      unknown: statusCounts[WorktreeStatus.UNKNOWN],
      worktrees,
    };
  }

  /**
   * Extracts a task ID from a branch name
   * @param branch Branch name
   * @returns Extracted task ID or undefined if no match
   */
  extractTaskId(branch: string): string | undefined {
    // Common patterns for task IDs in branch names
    const patterns = [
      // Direct match (branch name is task ID)
      /^(TASK-[\w-]+)$/i,
      /^(FEAT-[\w-]+)$/i,
      // Branch with task ID prefix
      /^(TASK-[\w-]+)-.+$/i,
      /^(FEAT-[\w-]+)-.+$/i,
      // Branch with task ID anywhere
      /.*(TASK-[\w-]+).*/i,
      /.*(FEAT-[\w-]+).*/i,
    ];
    
    for (const pattern of patterns) {
      const match = branch.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return undefined;
  }

  /**
   * Maps a task status to a workflow status
   * @param taskStatus Task status string
   * @returns Mapped workflow status
   */
  mapTaskStatusToWorkflow(taskStatus: string): WorkflowStatus {
    const status = taskStatus.toLowerCase();
    
    if (status.includes('done') || status.includes('complete') || status.includes('🟢')) {
      return WorkflowStatus.DONE;
    } else if (status.includes('progress') || status.includes('working') || status.includes('🔵')) {
      return WorkflowStatus.IN_PROGRESS;
    } else if (status.includes('blocked') || status.includes('waiting') || status.includes('🔴')) {
      return WorkflowStatus.BLOCKED;
    } else if (status.includes('to do') || status.includes('todo') || status.includes('🟡')) {
      return WorkflowStatus.TO_DO;
    } else {
      return WorkflowStatus.UNKNOWN;
    }
  }

  /**
   * Parses the output of git worktree list --porcelain
   * @param output Raw output from git worktree list --porcelain
   * @returns Array of parsed worktrees
   */
  private parseWorktreesOutput(output: string): Partial<Worktree>[] {
    const worktrees: Partial<Worktree>[] = [];
    let currentWorktree: Partial<Worktree> | null = null;
    
    // Split by lines and process them
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (!line.trim()) {
        // Empty line indicates the end of a worktree entry
        if (currentWorktree) {
          worktrees.push(currentWorktree);
          currentWorktree = null;
        }
        continue;
      }
      
      // Create a new worktree entry if we don't have one
      if (!currentWorktree) {
        currentWorktree = {
          status: WorktreeStatus.UNKNOWN, // Default status
        };
      }
      
      // Parse the line based on the prefix
      if (line.startsWith('worktree ')) {
        currentWorktree.path = line.substring('worktree '.length).trim();
      } else if (line.startsWith('HEAD ')) {
        currentWorktree.headCommit = line.substring('HEAD '.length).trim();
      } else if (line.startsWith('branch ')) {
        const branchRef = line.substring('branch '.length).trim();
        // Extract branch name from refs/heads/branch-name
        currentWorktree.branch = branchRef.replace('refs/heads/', '');
        
        // Try to extract task ID from branch name
        if (currentWorktree.branch) {
          const taskId = this.extractTaskId(currentWorktree.branch);
          if (taskId) {
            currentWorktree.taskId = taskId;
          }
        }
      }
    }
    
    // Add the last worktree if there is one
    if (currentWorktree) {
      worktrees.push(currentWorktree);
    }
    
    return worktrees;
  }

  /**
   * Invalidates all cached worktree data
   */
  invalidateCache(): void {
    this.cacheManager.clear();
  }
}