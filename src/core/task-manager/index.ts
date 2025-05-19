/**
 * Task manager module
 * Export all task manager functionality
 */

// Export utility functions - specifically choose the one from directory-utils
export {
  getTasksDirectory,
  getPhasesDirectory,
  ensureDirectoryExists,
  getAllFiles,
  resolveAbsolutePath,
  parseTaskPath,
  getTaskFilePath,
  migrateSystemDirectories,
} from './directory-utils.js';

// Export from utils except getAllFiles (already exported from directory-utils)
export * from './utils.js';

// Forward declarations for circular dependencies
export * from './task-relationships.js';

// Export CRUD operations
export * from './task-crud.js';
export * from './phase-crud.js';
export * from './feature-crud.js';
export * from './area-crud.js';

// Export workflow operations
export * from './task-workflow.js';

// Export task movement operations
export * from './task-move.js';
