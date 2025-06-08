/**
 * Worktree Path Resolver
 * 
 * CRITICAL: This is the ONLY place where worktree path patterns should exist.
 * All components must use this service for path resolution.
 * 
 * Pattern: ../{projectName}.worktrees/{taskId}
 * - Works for ANY project, not hardcoded for Scopecraft
 * - Keeps worktrees outside main repo
 * - Clear naming convention based on project name
 */

import { basename, dirname, join, resolve } from 'node:path';
import { ConfigurationManager } from '../config/configuration-manager.js';
import { EnvironmentError, EnvironmentErrorCodes, type WorktreePathResolver as IWorktreePathResolver } from './types.js';

export class WorktreePathResolver implements IWorktreePathResolver {
  private config: ConfigurationManager;
  
  constructor(config?: ConfigurationManager) {
    this.config = config || ConfigurationManager.getInstance();
  }
  
  /**
   * Gets the base path for all worktrees
   * Pattern: ../{projectName}.worktrees/
   * 
   * Examples:
   * - Project: /Users/alice/projects/scopecraft → ../scopecraft.worktrees/
   * - Project: /Users/bob/work/client-app → ../client-app.worktrees/
   * - Project: /home/team/awesome-tool → ../awesome-tool.worktrees/
   */
  async getWorktreeBasePath(): Promise<string> {
    try {
      const rootConfig = this.config.getRootConfig();
      if (!rootConfig.validated || !rootConfig.path) {
        throw new EnvironmentError(
          'No valid project root found',
          EnvironmentErrorCodes.CONFIGURATION_ERROR
        );
      }
      
      const projectRoot = rootConfig.path;
      const projectName = basename(projectRoot).toLowerCase();
      
      // This is the ONLY place this pattern should exist
      const worktreeBasePath = resolve(dirname(projectRoot), `${projectName}.worktrees`);
      
      return worktreeBasePath;
    } catch (error) {
      if (error instanceof EnvironmentError) {
        throw error;
      }
      throw new EnvironmentError(
        `Failed to resolve worktree base path: ${error instanceof Error ? error.message : String(error)}`,
        EnvironmentErrorCodes.PATH_RESOLUTION_FAILED,
        { originalError: error }
      );
    }
  }
  
  /**
   * Gets the path for a specific worktree
   * Pattern: ../{projectName}.worktrees/{taskId}
   * 
   * @param taskId The task ID to create a worktree for
   * @returns Absolute path to the worktree
   */
  async getWorktreePath(taskId: string): Promise<string> {
    if (!taskId || typeof taskId !== 'string') {
      throw new EnvironmentError(
        'Task ID is required for worktree path resolution',
        EnvironmentErrorCodes.INVALID_TASK_ID,
        { taskId }
      );
    }
    
    try {
      const basePath = await this.getWorktreeBasePath();
      return join(basePath, taskId);
    } catch (error) {
      if (error instanceof EnvironmentError) {
        throw error;
      }
      throw new EnvironmentError(
        `Failed to resolve worktree path for task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
        EnvironmentErrorCodes.PATH_RESOLUTION_FAILED,
        { taskId, originalError: error }
      );
    }
  }
  
  /**
   * Gets the project name from the current configuration
   * Useful for other services that need project context
   */
  async getProjectName(): Promise<string> {
    const rootConfig = this.config.getRootConfig();
    if (!rootConfig.validated || !rootConfig.path) {
      throw new EnvironmentError(
        'No valid project root found',
        EnvironmentErrorCodes.CONFIGURATION_ERROR
      );
    }
    
    return basename(rootConfig.path).toLowerCase();
  }
}