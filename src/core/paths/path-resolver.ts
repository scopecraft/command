/**
 * PATH RESOLUTION - SINGLE SOURCE OF TRUTH
 * ========================================
 *
 * This module is THE authoritative source for all path resolution in Scopecraft.
 *
 * DO NOT:
 * - Hardcode paths anywhere else in the codebase
 * - Use join(projectRoot, '.tasks', ...) directly
 * - Create new path resolution logic elsewhere
 *
 * DO:
 * - Always use resolvePath() or the specific get*Directory() functions
 * - Add new path types here, not in other modules
 * - Update strategies here when path requirements change
 *
 * Path Types:
 * - templates: Git repository (.tasks/.templates/)
 * - modes: Git repository (.tasks/.modes/)
 * - tasks: Centralized (~/.scopecraft/projects/{encoded}/tasks/)
 * - sessions: Centralized (~/.scopecraft/projects/{encoded}/sessions/)
 * - config: Centralized (~/.scopecraft/projects/{encoded}/config/)
 *
 * @module path-resolver
 * @see docs/architecture/path-resolution.md for full documentation
 */

import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { WorktreePathResolver } from '../environment/worktree-path-resolver.js';
import { TaskStoragePathEncoder } from '../task-storage-path-encoder.js';
import { pathContextCache } from './cache.js';
import { pathStrategies } from './strategies.js';
import { PATH_TYPES, type PathContext, type PathType } from './types.js';

// Re-export types for convenience
export { PATH_TYPES, type PathContext, type PathType } from './types.js';

/**
 * Options for creating a path context
 */
export interface PathContextOptions {
  /**
   * Override mode for testing - treats projectRoot as standalone project
   * without git detection or worktree resolution
   */
  override?: boolean;
}

/**
 * Create a path context from a project root
 * This captures all the information needed for path resolution
 *
 * PERFORMANCE: Results are cached to avoid repeated git commands
 */
export function createPathContext(projectRoot: string, options?: PathContextOptions): PathContext {
  // For override mode (testing), create a simple context
  if (options?.override) {
    const context: PathContext = {
      executionRoot: projectRoot,
      mainRepoRoot: projectRoot, // Use same root for testing
      worktreeRoot: undefined,
      userHome: homedir(),
    };
    // Don't cache override contexts
    return context;
  }

  // Check cache first
  const cached = pathContextCache.get(projectRoot);
  if (cached) {
    return cached;
  }

  const resolver = new WorktreePathResolver();

  let mainRepoRoot: string;
  let worktreeRoot: string | undefined;

  try {
    // Try to get git repository root
    mainRepoRoot = resolver.getMainRepositoryRootSync(projectRoot);
    // Determine if we're in a worktree by comparing paths
    worktreeRoot = projectRoot !== mainRepoRoot ? projectRoot : undefined;
  } catch (error: any) {
    // If not a git repository, treat the projectRoot as a standalone project
    // This is valid for test scenarios or non-git projects
    if (error?.code === 'NOT_GIT_REPOSITORY' || error?.message?.includes('Not a git repository')) {
      mainRepoRoot = projectRoot;
      worktreeRoot = undefined;
    } else {
      // Re-throw other errors
      throw error;
    }
  }

  const context: PathContext = {
    executionRoot: projectRoot,
    mainRepoRoot,
    worktreeRoot,
    userHome: homedir(),
  };

  // Cache the result
  pathContextCache.set(projectRoot, context);

  return context;
}

/**
 * Main path resolution function
 * Returns a single path based on the configured strategy
 *
 * @param featureType - The type of path to resolve
 * @param context - The path context containing root directories
 * @returns The resolved path
 */
export function resolvePath(featureType: PathType, context: PathContext): string {
  const strategies = pathStrategies[featureType];

  if (!strategies || strategies.length === 0) {
    throw new Error(`No path strategies defined for feature type: ${featureType}`);
  }

  // For now, use the first strategy (highest priority)
  // Future: Could add logic to check multiple strategies
  return strategies[0](context);
}

/**
 * Resolve path with precedence
 * Returns all possible paths in order of precedence
 *
 * @param featureType - The type of path to resolve
 * @param context - The path context containing root directories
 * @returns Array of paths in precedence order
 */
export function resolvePathWithPrecedence(featureType: PathType, context: PathContext): string[] {
  const strategies = pathStrategies[featureType];

  if (!strategies || strategies.length === 0) {
    throw new Error(`No path strategies defined for feature type: ${featureType}`);
  }

  return strategies.map((strategy) => strategy(context));
}

/**
 * Find the first existing path from precedence list
 * Useful for reading files that might exist in multiple locations
 *
 * @param featureType - The type of path to resolve
 * @param context - The path context containing root directories
 * @returns The first existing path, or the highest precedence path if none exist
 */
export function resolveExistingPath(featureType: PathType, context: PathContext): string {
  const paths = resolvePathWithPrecedence(featureType, context);

  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }

  // Return highest precedence path if none exist
  return paths[0];
}

/**
 * Convenience exports for specific path types
 * These maintain backward compatibility while using the new resolver
 */
export function getTemplatesPath(context: PathContext): string {
  return resolvePath(PATH_TYPES.TEMPLATES, context);
}

export function getModesPath(context: PathContext): string {
  return resolvePath(PATH_TYPES.MODES, context);
}

export function getTasksPath(context: PathContext): string {
  return resolvePath(PATH_TYPES.TASKS, context);
}

export function getSessionsPath(context: PathContext): string {
  return resolvePath(PATH_TYPES.SESSIONS, context);
}

export function getConfigPath(context: PathContext): string {
  return resolvePath(PATH_TYPES.CONFIG, context);
}

/**
 * Find mode files matching a given name within the modes directory
 * 
 * @param projectRoot - The project root directory
 * @param modeName - The mode name to search for (e.g., "code_review")
 * @returns Array of matching file paths relative to modes directory
 * 
 * @example
 * findModeFiles("/project", "code_review")
 * // Returns: ["implementation/code_review.md"]
 * 
 * findModeFiles("/project", "base") 
 * // Returns: ["exploration/base.md", "design/base.md", ...]
 */
export function findModeFiles(projectRoot: string, modeName: string): string[] {
  const context = createPathContext(projectRoot);
  const modesDir = resolvePath(PATH_TYPES.MODES, context);
  
  try {
    const entries = readdirSync(modesDir, { 
      recursive: true, 
      withFileTypes: true 
    });
    
    return entries
      .filter(entry => 
        entry.isFile() && 
        entry.name === `${modeName}.md`
      )
      .map(entry => {
        // Return relative path from modes directory
        const fullPath = join(entry.path, entry.name);
        return fullPath.substring(modesDir.length + 1); // +1 for path separator
      })
      .sort((a, b) => {
        // Sort non-base files before base.md files
        const aIsBase = a.endsWith('/base.md');
        const bIsBase = b.endsWith('/base.md');
        if (aIsBase && !bIsBase) return 1;
        if (!aIsBase && bIsBase) return -1;
        return a.localeCompare(b);
      });
  } catch (error) {
    // If modes directory doesn't exist, return empty array
    return [];
  }
}
