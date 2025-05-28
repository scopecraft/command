/**
 * Scopecraft V2 Core Exports
 * 
 * Main entry point for v2 task system functionality
 */

// Types
export * from './types.js';

// Directory utilities
export {
  getTasksDirectory,
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
  getExistingWorkflowStates
} from './directory-utils.js';

// Task parser
export {
  parseTaskDocument,
  serializeTaskDocument,
  validateTaskDocument,
  updateSection,
  extractSection,
  ensureRequiredSections,
  formatLogTimestamp,
  parseTasksSection,
  formatTasksSection,
  addLogEntry
} from './task-parser.js';

// ID generator
export {
  generateTaskId,
  generateSubtaskId,
  parseTaskId,
  isValidTaskId,
  resolveTaskId,
  parseTaskReference,
  formatTaskReference,
  taskIdExists,
  generateUniqueTaskId,
  listTaskIds,
  getAllTaskIds
} from './id-generator.js';

// Name abbreviation
export {
  abbreviateTaskName,
  isReasonableAbbreviation,
  getAbbreviationExamples
} from './name-abbreviator.js';

// Task CRUD operations
export {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  listTasks,
  updateSection as updateTaskSection
} from './task-crud.js';

// Project initialization
export {
  initializeV2ProjectStructure,
  needsV2Init,
  getInitStatus
} from './project-init.js';

// Parent task operations
export {
  createParentTask,
  addSubtask as addSubtaskLowLevel,
  getParentTask,
  moveParentTask,
  deleteParentTask,
  listSubtasks,
  canConvertToParent
} from './parent-tasks.js';

// Subtask sequencing operations
export {
  reorderSubtasks as reorderSubtasksLowLevel,
  makeTasksParallel,
  insertTaskAfter,
  getNextSequenceNumber,
  isValidSequence,
  listSubtasksWithSequence
} from './subtask-sequencing.js';

// High-level task operations
export {
  resequenceSubtasks,
  parallelizeSubtasks,
  updateSubtaskSequence,
  promoteToParent,
  extractSubtask,
  adoptTask,
  addSubtask
} from './task-operations.js';

// Template management
export {
  listTemplates,
  getTemplate,
  applyTemplate,
  initializeV2Templates
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
  V2Config,
  OperationResult,
  ValidationError,
  StructureVersion
} from './types.js';