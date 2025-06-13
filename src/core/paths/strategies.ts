/**
 * Path resolution strategies for Scopecraft
 * 
 * Each strategy is a pure function that takes a PathContext and returns a path
 * Strategies are composable and can be combined in precedence order
 */

import { join } from 'node:path';
import { TaskStoragePathEncoder } from '../task-storage-path-encoder.js';
import { type PathContext, type PathStrategy, type PathType, PATH_TYPES } from './types.js';

/**
 * Repository-based strategy
 * Returns paths within the git repository
 */
export const repoStrategy: PathStrategy = (context: PathContext): string => {
  // Use execution root (could be worktree) for repo-based paths
  return join(context.executionRoot, '.tasks');
};

/**
 * Repository templates strategy
 * Templates are stored in the repository under .tasks/.templates/
 */
export const repoTemplatesStrategy: PathStrategy = (context: PathContext): string => {
  return join(repoStrategy(context), '.templates');
};

/**
 * Repository modes strategy
 * Modes are stored in the repository under .tasks/.modes/
 */
export const repoModesStrategy: PathStrategy = (context: PathContext): string => {
  return join(repoStrategy(context), '.modes');
};

/**
 * Centralized storage strategy
 * Returns paths within ~/.scopecraft/projects/{encoded}/
 */
export const centralizedStrategy: PathStrategy = (context: PathContext): string => {
  // Always use main repo root for centralized storage to ensure consistency
  const encoded = TaskStoragePathEncoder.encode(context.mainRepoRoot);
  return join(context.userHome, '.scopecraft', 'projects', encoded);
};

/**
 * Centralized tasks strategy
 * Tasks are stored centrally under ~/.scopecraft/projects/{encoded}/tasks/
 */
export const centralizedTasksStrategy: PathStrategy = (context: PathContext): string => {
  return join(centralizedStrategy(context), 'tasks');
};

/**
 * Centralized sessions strategy
 * Sessions are stored centrally under ~/.scopecraft/projects/{encoded}/sessions/
 */
export const centralizedSessionsStrategy: PathStrategy = (context: PathContext): string => {
  return join(centralizedStrategy(context), 'sessions');
};

/**
 * Centralized config strategy
 * Project config stored centrally under ~/.scopecraft/projects/{encoded}/config/
 */
export const centralizedConfigStrategy: PathStrategy = (context: PathContext): string => {
  return join(centralizedStrategy(context), 'config');
};

/**
 * Global user strategy
 * Returns paths within ~/.scopecraft/ for user-wide settings
 */
export const globalUserStrategy: PathStrategy = (context: PathContext): string => {
  return join(context.userHome, '.scopecraft');
};

/**
 * Global templates strategy
 * User-wide templates under ~/.scopecraft/templates/
 */
export const globalTemplatesStrategy: PathStrategy = (context: PathContext): string => {
  return join(globalUserStrategy(context), 'templates');
};

/**
 * Local override strategy (future)
 * Returns paths for local overrides (.local/)
 */
export const localOverrideStrategy: PathStrategy = (context: PathContext): string => {
  return join(context.executionRoot, '.local', '.tasks');
};

/**
 * Path strategy mappings
 * Defines which strategies to use for each path type, in precedence order
 * 
 * IMPORTANT: This is the configuration that determines where each feature
 * stores its data. Modify this to change storage locations.
 */
export const pathStrategies: Record<PathType, PathStrategy[]> = {
  [PATH_TYPES.TEMPLATES]: [
    repoTemplatesStrategy,        // Primary: .tasks/.templates/ in repo
    globalTemplatesStrategy,      // Fallback: ~/.scopecraft/templates/
  ],
  
  [PATH_TYPES.MODES]: [
    repoModesStrategy,           // Only: .tasks/.modes/ in repo
  ],
  
  [PATH_TYPES.TASKS]: [
    centralizedTasksStrategy,    // Only: ~/.scopecraft/projects/{encoded}/tasks/
  ],
  
  [PATH_TYPES.SESSIONS]: [
    centralizedSessionsStrategy, // Only: ~/.scopecraft/projects/{encoded}/sessions/
  ],
  
  [PATH_TYPES.CONFIG]: [
    centralizedConfigStrategy,   // Primary: ~/.scopecraft/projects/{encoded}/config/
    repoStrategy,               // Fallback: .tasks/ in repo (for legacy)
  ],
};