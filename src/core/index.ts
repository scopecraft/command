/**
 * Scopecraft Core Exports
 *
 * Main entry point for task system functionality
 */

// Types
export * from './types.js';

// Legacy exports for compatibility
export * from './project-config.js';
export * from './formatters.js';
export * from './field-normalizers.js';
export * from './worktree/index.js';

// Helper function for directory creation
import fs from 'node:fs';
export const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Directory utilities
export {
  getWorkflowDirectory,
  getArchiveDirectory,
  getTemplatesDirectory,
  getConfigDirectory,
  ensureWorkflowDirectories,
  detectStructureVersion,
  getTaskFilesInWorkflow,
  parseTaskLocation,
  getTaskIdFromFilename,
  isParentTaskFolder,
  getSubtaskFiles,
  getSubtaskSequence,
  createArchiveDate,
  isValidTaskFilename,
  getExistingWorkflowStates,
  resolveTaskId,
  taskIdExists,
} from './directory-utils.js';

// Task parser
export {
  parseTaskDocument,
  serializeTaskDocument,
  serializeTaskContent,
  validateTaskDocument,
  updateSection,
  extractSection,
  ensureRequiredSections,
  formatLogTimestamp,
  parseTasksSection,
  formatTasksSection,
  addLogEntry,
} from './task-parser.js';

// ID generator
export {
  generateTaskId,
  generateSubtaskId,
  parseTaskId,
  isValidTaskId,
  parseTaskReference,
  formatTaskReference,
  generateUniqueTaskId,
  listTaskIds,
  getAllTaskIds,
} from './id-generator.js';

// Name abbreviation
export {
  abbreviateTaskName,
  isReasonableAbbreviation,
  getAbbreviationExamples,
} from './name-abbreviator.js';

// Task CRUD operations
export {
  create,
  get,
  update,
  del,
  move,
  list,
} from './task-crud.js';

// Project initialization
export {
  initializeProjectStructure,
  needsInit,
  getInitStatus,
} from './project-init.js';

// Parent task operations
export {
  createParentTask,
  addSubtask as addSubtaskLowLevel,
  getParentTask,
  moveParentTask,
  deleteParentTask,
  listSubtasks,
  canConvertToParent,
} from './parent-tasks.js';

// Subtask sequencing operations
export {
  reorderSubtasks as reorderSubtasksLowLevel,
  makeTasksParallel,
  insertTaskAfter,
  getNextSequenceNumber,
  isValidSequence,
  listSubtasksWithSequence,
} from './subtask-sequencing.js';

// High-level task operations
export {
  resequenceSubtasks,
  parallelizeSubtasks,
  updateSubtaskSequence,
  promoteToParent,
  extractSubtask,
  adoptTask,
  addSubtask,
} from './task-operations.js';

// Template management
export {
  listTemplates,
  getTemplate,
  applyTemplate,
  initializeTemplates,
} from './template-manager.js';
export type { TemplateInfo } from './template-manager.js';

// Re-export key types for convenience
export type {
  Task,
  TaskDocument,
  TaskFrontmatter,
  TaskSections,
  TaskMetadata,
  TaskLocation,
  WorkflowState,
  TaskType,
  TaskStatus,
  TaskCreateOptions,
  TaskUpdateOptions,
  TaskMoveOptions,
  TaskListOptions,
  ParentTask,
  ProjectConfig,
  OperationResult,
  ValidationError,
  StructureVersion,
} from './types.js';
