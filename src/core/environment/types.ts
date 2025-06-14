/**
 * Environment Management Types
 *
 * Core type definitions for environment resolution and worktree management
 */

import type { Task, TaskType } from '../types.js';

// ============================================
// Environment Resolution
// ============================================

/**
 * Environment resolver for task-to-environment mapping
 */
export interface EnvironmentResolver {
  /**
   * Resolves the environment ID for a task
   * - For parent tasks: returns the task ID
   * - For subtasks: returns the parent ID
   */
  resolveEnvironmentId(taskId: string): Promise<string>;

  /**
   * Ensures environment exists (creates if missing)
   * @returns Environment info including path
   */
  ensureEnvironment(envId: string): Promise<EnvironmentInfo>;

  /**
   * Gets environment info without creating
   */
  getEnvironmentInfo(envId: string): Promise<EnvironmentInfo | null>;
}

/**
 * Environment information
 */
export interface EnvironmentInfo {
  id: string;
  path: string;
  branch: string;
  exists: boolean;
  isActive: boolean;
}

// ============================================
// Worktree Management
// ============================================

/**
 * Git worktree manager for environment creation
 */
export interface WorktreeManager {
  /**
   * Creates a new worktree for the given task
   */
  create(taskId: string, options?: WorktreeOptions): Promise<WorktreeInfo>;

  /**
   * Removes a worktree safely
   */
  remove(taskId: string): Promise<void>;

  /**
   * Lists all active worktrees
   */
  list(): Promise<WorktreeInfo[]>;

  /**
   * Checks if a worktree exists
   */
  exists(taskId: string): Promise<boolean>;

  /**
   * Gets the path for a worktree (doesn't check existence)
   */
  getPath(taskId: string): string;
}

/**
 * Options for worktree creation
 */
export interface WorktreeOptions {
  base?: string; // Base branch (default: current branch)
  force?: boolean; // Force creation even if exists
}

/**
 * Worktree information
 */
export interface WorktreeInfo {
  path: string;
  branch: string;
  taskId: string;
  commit: string;
}

// ============================================
// Path Resolution
// ============================================

/**
 * Centralized path resolver for worktree locations
 * CRITICAL: This is the ONLY place where path patterns should exist
 */
export interface WorktreePathResolver {
  /**
   * Gets the base path for all worktrees
   * Pattern: ../{projectName}.worktrees/
   */
  getWorktreeBasePath(): Promise<string>;

  /**
   * Gets the path for a specific worktree
   * Pattern: ../{projectName}.worktrees/{taskId}
   */
  getWorktreePath(taskId: string): Promise<string>;

  /**
   * Gets the main repository root, even when running from a worktree
   * This is needed for centralized storage to ensure all worktrees
   * share the same storage location
   *
   * @param fromPath - Optional path to run git commands from
   */
  getMainRepositoryRoot(fromPath?: string): Promise<string>;
}

// ============================================
// Configuration Services
// ============================================

/**
 * Centralized branch naming service
 */
export interface BranchNamingService {
  /**
   * Gets the branch name for a task
   * Pattern: task/{taskId}
   */
  getBranchName(taskId: string): string;

  /**
   * Gets the default base branch
   */
  getDefaultBaseBranch(): string;
}

/**
 * Docker configuration service
 */
export interface DockerConfigService {
  /**
   * Gets the default Docker image
   */
  getDefaultImage(): string;

  /**
   * Gets the workspace mount path inside Docker
   */
  getWorkspaceMountPath(): string;
}

/**
 * Work mode types
 */
export type WorkMode = 'implement' | 'explore' | 'orchestrate' | 'diagnose';

/**
 * Mode inference service
 */
export interface ModeDefaultsService {
  /**
   * Infers the work mode from task metadata
   */
  inferMode(task: Task): WorkMode;
}

// ============================================
// Error Handling
// ============================================

/**
 * Environment-specific error class
 */
export class EnvironmentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Common error codes
 */
export const EnvironmentErrorCodes = {
  WORKTREE_CONFLICT: 'WORKTREE_CONFLICT',
  WORKTREE_NOT_FOUND: 'WORKTREE_NOT_FOUND',
  GIT_OPERATION_FAILED: 'GIT_OPERATION_FAILED',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  INVALID_TASK_ID: 'INVALID_TASK_ID',
  PATH_RESOLUTION_FAILED: 'PATH_RESOLUTION_FAILED',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
} as const;

export type EnvironmentErrorCode =
  (typeof EnvironmentErrorCodes)[keyof typeof EnvironmentErrorCodes];
