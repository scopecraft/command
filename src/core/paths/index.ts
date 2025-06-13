/**
 * Path Resolution Module
 *
 * ⚠️ IMPORTANT: This is the ONLY module that should handle path resolution ⚠️
 *
 * All path resolution logic for Scopecraft is centralized here.
 * DO NOT create path logic elsewhere in the codebase.
 */

// Main exports - these are what you should use
export {
  // Core functions
  createPathContext,
  resolvePath,
  resolvePathWithPrecedence,
  resolveExistingPath,
  // Convenience functions
  getTemplatesPath,
  getModesPath,
  getTasksPath,
  getSessionsPath,
  getConfigPath,
} from './path-resolver.js';

// Type exports
export {
  PATH_TYPES,
  type PathType,
  type PathContext,
  type PathStrategy,
} from './types.js';

// Strategy exports (rarely needed directly)
export {
  pathStrategies,
  repoStrategy,
  centralizedStrategy,
  globalUserStrategy,
} from './strategies.js';

// Migration helpers (temporary)
export {
  legacyPathJoin,
  assertNoDirectPaths,
  isUnmigratedPath,
  logMigrationInstructions,
} from './migration.js';

// Cache utilities (for performance)
export {
  PathCache,
  pathContextCache,
  directoryPathCache,
} from './cache.js';
