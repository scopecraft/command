/**
 * Path type definitions for Scopecraft
 *
 * ⚠️ Adding a new path type? Add it HERE FIRST! ⚠️
 */

/**
 * All valid path types in Scopecraft
 * Using const assertion for type safety
 */
export const PATH_TYPES = {
  TEMPLATES: 'templates',
  MODES: 'modes',
  TASKS: 'tasks',
  SESSIONS: 'sessions',
  CONFIG: 'config',
} as const;

/**
 * Type derived from PATH_TYPES values
 */
export type PathType = (typeof PATH_TYPES)[keyof typeof PATH_TYPES];

/**
 * Path context containing all necessary roots for resolution
 */
export interface PathContext {
  /**
   * Current working directory (where command is executed)
   * Could be main repo or a worktree
   */
  executionRoot: string;

  /**
   * Main repository root (not worktree)
   * Used for shared resources and centralized storage encoding
   */
  mainRepoRoot: string;

  /**
   * Current worktree root if in a worktree
   * undefined if in main repository
   */
  worktreeRoot?: string;

  /**
   * User home directory
   * Used for global user preferences and centralized storage
   */
  userHome: string;
}

/**
 * Strategy function type
 * Takes a context and returns a resolved path
 */
export type PathStrategy = (context: PathContext) => string;
