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

import { join } from 'node:path';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import { WorktreePathResolver } from '../environment/worktree-path-resolver.js';
import { TaskStoragePathEncoder } from '../task-storage-path-encoder.js';
import { type PathContext, type PathType, PATH_TYPES } from './types.js';
import { pathStrategies } from './strategies.js';

/**
 * Create a path context from a project root
 * This captures all the information needed for path resolution
 */
export function createPathContext(projectRoot: string): PathContext {
  const resolver = new WorktreePathResolver();
  
  // Use the existing implementation from WorktreePathResolver
  const mainRepoRoot = resolver.getMainRepositoryRootSync();
  
  // Determine if we're in a worktree by comparing paths
  // If execution root differs from main repo root, we're in a worktree
  const worktreeRoot = projectRoot !== mainRepoRoot ? projectRoot : undefined;
  
  return {
    executionRoot: projectRoot,
    mainRepoRoot,
    worktreeRoot,
    userHome: homedir(),
  };
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
  
  return strategies.map(strategy => strategy(context));
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