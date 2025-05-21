/**
 * Core types for the worktree service
 */
import { z } from 'zod';

/**
 * Worktree status enumeration
 */
export enum WorktreeStatus {
  CLEAN = 'clean',
  MODIFIED = 'modified',
  UNTRACKED = 'untracked',
  CONFLICT = 'conflict',
  UNKNOWN = 'unknown'
}

/**
 * Changed file status types
 */
export type FileStatus = 'added' | 'modified' | 'deleted' | 'untracked' | 'renamed' | 'conflicted';

/**
 * Workflow status for integration with task system
 */
export enum WorkflowStatus {
  TO_DO = 'todo',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  DONE = 'done',
  UNKNOWN = 'unknown'
}

/**
 * Development mode for task implementation
 */
export enum DevelopmentMode {
  TYPESCRIPT = 'typescript',
  UI = 'ui',
  CLI = 'cli',
  MCP = 'mcp',
  DEVOPS = 'devops',
  UNKNOWN = 'unknown'
}

/**
 * Zod schema for changed file
 */
export const ChangedFileSchema = z.object({
  path: z.string(),
  status: z.enum(['added', 'modified', 'deleted', 'untracked', 'renamed', 'conflicted']),
  oldPath: z.string().optional(),
});

/**
 * Changed file information
 */
export type ChangedFile = z.infer<typeof ChangedFileSchema>;

/**
 * Zod schema for commit information
 */
export const CommitInfoSchema = z.object({
  hash: z.string(),
  message: z.string(),
  author: z.string(),
  date: z.string(),
});

/**
 * Commit information
 */
export type CommitInfo = z.infer<typeof CommitInfoSchema>;

/**
 * Zod schema for feature task
 */
export const FeatureTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
});

/**
 * Zod schema for feature progress
 */
export const FeatureProgressSchema = z.object({
  totalTasks: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  inProgress: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  toDo: z.number().int().nonnegative(),
  tasks: z.array(FeatureTaskSchema).optional(),
});

/**
 * Feature progress information
 */
export type FeatureProgress = z.infer<typeof FeatureProgressSchema>;

/**
 * Zod schema for development mode
 */
export const DevelopmentModeObjectSchema = z.object({
  current: z.nativeEnum(DevelopmentMode).optional(),
  next: z.nativeEnum(DevelopmentMode).optional(),
});

/**
 * Zod schema for worktree
 */
export const WorktreeSchema = z.object({
  // Git properties
  path: z.string(),
  branch: z.string(),
  headCommit: z.string(),
  status: z.nativeEnum(WorktreeStatus),
  lastActivity: z.date().optional(),
  changedFiles: z.array(ChangedFileSchema).optional(),
  
  // Task properties
  taskId: z.string().optional(),
  taskTitle: z.string().optional(),
  taskStatus: z.string().optional(),
  workflowStatus: z.nativeEnum(WorkflowStatus).optional(),
  mode: DevelopmentModeObjectSchema.optional(),
  
  // Feature properties
  featureProgress: FeatureProgressSchema.optional(),
  
  // UI state
  isLoading: z.boolean().optional(),
  error: z.string().optional(),
});

/**
 * Core worktree interface that contains all the information
 * for a git worktree
 */
export type Worktree = z.infer<typeof WorktreeSchema>;

/**
 * Zod schema for worktree summary
 */
export const WorktreeSummarySchema = z.object({
  totalWorktrees: z.number().int().nonnegative(),
  clean: z.number().int().nonnegative(),
  modified: z.number().int().nonnegative(),
  untracked: z.number().int().nonnegative(),
  conflict: z.number().int().nonnegative(),
  unknown: z.number().int().nonnegative(),
  worktrees: z.array(WorktreeSchema),
});

/**
 * Summary statistics for all worktrees
 */
export type WorktreeSummary = z.infer<typeof WorktreeSummarySchema>;

/**
 * Zod schema for dashboard configuration
 */
export const WorktreeDashboardConfigSchema = z.object({
  refreshInterval: z.number().int().positive(),
  showTaskInfo: z.boolean(),
  maxWorktrees: z.number().int().positive().optional(),
});

/**
 * Dashboard configuration
 */
export type WorktreeDashboardConfig = z.infer<typeof WorktreeDashboardConfigSchema>;

/**
 * Cache item with timestamp
 */
export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Custom error types
 */
export class WorktreeNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorktreeNotFoundError';
  }
}

export class GitOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitOperationError';
  }
}

export class TaskCorrelationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskCorrelationError';
  }
}