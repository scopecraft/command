/**
 * Transformation utilities to convert core types to normalized MCP schema
 */

import * as core from '../core/v2/index.js';
import {
  type ParentTask,
  type ParentTaskDetail,
  ParentTaskDetailSchema,
  ParentTaskSchema,
  type SimpleTask,
  SimpleTaskSchema,
  type SubTask,
  SubTaskSchema,
  type Task,
  type TaskPriority,
  TaskSchema,
  type TaskStatus,
  type TaskType,
  type WorkflowState,
} from './schemas.js';

// =============================================================================
// Field Transformation Utilities
// =============================================================================

/**
 * Clean task type by removing emoji prefixes and normalizing to enum values
 */
export function cleanTaskType(rawType: string): TaskType {
  // Remove emoji prefixes and normalize to lowercase
  const cleanType = rawType
    .replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27FF]\s*/gu, '') // Remove emojis
    .replace(/^\W+\s*/, '') // Remove any remaining special chars at start
    .toLowerCase()
    .trim();

  switch (cleanType) {
    case 'feature':
      return 'feature';
    case 'bug':
      return 'bug';
    case 'chore':
      return 'chore';
    case 'documentation':
      return 'documentation';
    case 'test':
      return 'test';
    case 'spike':
    case 'spike/research':
      return 'spike';
    default:
      console.warn(`Unknown task type: "${rawType}" -> "${cleanType}", defaulting to 'chore'`);
      return 'chore';
  }
}

/**
 * Normalize task status to clean enum values
 */
export function normalizeStatus(rawStatus: string): TaskStatus {
  const cleanStatus = rawStatus.toLowerCase().replace(/\s+/g, '_');

  switch (cleanStatus) {
    case 'to_do':
    case 'todo':
      return 'todo';
    case 'in_progress':
    case 'progress':
      return 'in_progress';
    case 'done':
      return 'done';
    case 'blocked':
      return 'blocked';
    case 'archived':
      return 'archived';
    default:
      console.warn(`Unknown task status: ${rawStatus}, defaulting to 'todo'`);
      return 'todo';
  }
}

/**
 * Normalize task priority to clean enum values
 */
export function normalizePriority(rawPriority?: string): TaskPriority {
  if (!rawPriority) return 'medium';

  const cleanPriority = rawPriority.toLowerCase();

  switch (cleanPriority) {
    case 'highest':
      return 'highest';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      console.warn(`Unknown task priority: ${rawPriority}, defaulting to 'medium'`);
      return 'medium';
  }
}

/**
 * Map core workflow state to normalized enum
 */
export function normalizeWorkflowState(workflowState: string): WorkflowState {
  switch (workflowState) {
    case 'backlog':
      return 'backlog';
    case 'current':
      return 'current';
    case 'archive':
      return 'archive';
    default:
      console.warn(`Unknown workflow state: ${workflowState}, defaulting to 'backlog'`);
      return 'backlog';
  }
}

// =============================================================================
// Base Task Transformation
// =============================================================================

/**
 * Transform core task metadata to base task fields
 */
function transformBaseTask(task: core.Task) {
  return {
    id: task.metadata.id,
    title: task.document.title,
    type: cleanTaskType(task.document.frontmatter.type || 'chore'),
    status: normalizeStatus(task.document.frontmatter.status || 'todo'),
    priority: normalizePriority(task.document.frontmatter.priority),
    workflowState: normalizeWorkflowState(task.metadata.location.workflowState),
    area: task.document.frontmatter.area || 'general',
    tags: (task.document.frontmatter.tags as string[]) || [],
    assignee: task.document.frontmatter.assignee || undefined,
    createdDate: undefined, // TODO: Extract from file stats if needed
    updatedDate: undefined, // TODO: Extract from file stats if needed
    archivedDate: task.metadata.location.workflowState === 'archive' ? undefined : undefined, // TODO: Extract archive date
    path: task.metadata.path,
    filename: task.metadata.filename,
  };
}

/**
 * Transform task sections from core document
 */
function transformTaskSections(task: core.Task) {
  return {
    instruction: task.document.sections.instruction,
    tasks: task.document.sections.tasks,
    deliverable: task.document.sections.deliverable,
    log: task.document.sections.log,
  };
}

// =============================================================================
// Task Type Specific Transformations
// =============================================================================

/**
 * Transform core task to normalized simple task
 */
export function transformSimpleTask(task: core.Task, includeContent = false): SimpleTask {
  const baseTask = transformBaseTask(task);

  const simpleTask: SimpleTask = {
    ...baseTask,
    taskStructure: 'simple' as const,
    bodyContent: includeContent ? core.serializeTaskContent(task.document) : undefined,
    sections: includeContent ? transformTaskSections(task) : undefined,
  };

  // Validate with Zod schema
  return SimpleTaskSchema.parse(simpleTask);
}

/**
 * Transform core subtask to normalized subtask
 */
export function transformSubTask(task: core.Task, includeContent = false): SubTask {
  const baseTask = transformBaseTask(task);

  if (!task.metadata.parentTask || !task.metadata.sequenceNumber) {
    throw new Error(`Task ${task.metadata.id} is not a valid subtask`);
  }

  const subTask: SubTask = {
    ...baseTask,
    taskStructure: 'subtask' as const,
    parentId: task.metadata.parentTask,
    sequenceNumber: task.metadata.sequenceNumber,
    bodyContent: includeContent ? core.serializeTaskContent(task.document) : undefined,
    sections: includeContent ? transformTaskSections(task) : undefined,
  };

  // Validate with Zod schema
  return SubTaskSchema.parse(subTask);
}

/**
 * Transform core parent task to normalized parent task
 */
export async function transformParentTask(
  projectRoot: string,
  task: core.Task,
  includeSubtasks = false,
  includeContent = false
): Promise<ParentTask> {
  const baseTask = transformBaseTask(task);

  if (!task.metadata.isParentTask) {
    throw new Error(`Task ${task.metadata.id} is not a parent task`);
  }

  // Get full parent task data to calculate progress
  const parentResult = await core.getParentTask(projectRoot, task.metadata.id);
  if (!parentResult.success || !parentResult.data) {
    throw new Error(`Failed to get parent task data for ${task.metadata.id}`);
  }

  const parentData = parentResult.data;
  const subtaskCount = parentData.subtasks.length;
  const completedCount = parentData.subtasks.filter(
    (st) => normalizeStatus(st.document.frontmatter.status || 'todo') === 'done'
  ).length;

  const parentTask: ParentTask = {
    ...baseTask,
    taskStructure: 'parent' as const,
    progress: {
      total: subtaskCount,
      completed: completedCount,
      percentage: subtaskCount > 0 ? Math.round((completedCount / subtaskCount) * 100) : 0,
    },
    subtaskIds: parentData.subtasks.map((st) => st.metadata.id),
    overviewContent: includeContent ? core.serializeTaskContent(task.document) : undefined,
    sections: includeContent ? transformTaskSections(task) : undefined,
    subtasks: includeSubtasks
      ? parentData.subtasks.map((st) => transformSubTask(st, includeContent))
      : undefined,
  };

  // Validate with Zod schema
  return ParentTaskSchema.parse(parentTask);
}

/**
 * Transform core parent task to detailed parent task (for parent_get)
 */
export async function transformParentTaskDetail(
  projectRoot: string,
  parentId: string,
  includeContent = true
): Promise<ParentTaskDetail> {
  const parentResult = await core.getParentTask(projectRoot, parentId);
  if (!parentResult.success || !parentResult.data) {
    throw new Error(`Failed to get parent task data for ${parentId}`);
  }

  const parentData = parentResult.data;

  // Transform the overview task - note: overview is TaskDocument, need to create Task structure
  const overviewTask: core.Task = {
    metadata: parentData.metadata,
    document: parentData.overview,
  };

  const parentTask = await transformParentTask(projectRoot, overviewTask, false, includeContent);

  // Transform all subtasks
  const subtasks = parentData.subtasks.map((st) => transformSubTask(st, includeContent));

  const parentTaskDetail: ParentTaskDetail = {
    ...parentTask,
    subtasks,
    supportingFiles: parentData.supportingFiles || [],
  };

  // Validate with Zod schema
  return ParentTaskDetailSchema.parse(parentTaskDetail);
}

// =============================================================================
// Main Transformation Function
// =============================================================================

/**
 * Transform any core task to appropriate normalized task type
 */
export async function transformTask(
  projectRoot: string,
  task: core.Task,
  includeContent = false,
  includeSubtasks = false
): Promise<Task> {
  if (task.metadata.isParentTask) {
    return await transformParentTask(projectRoot, task, includeSubtasks, includeContent);
  } else if (task.metadata.parentTask) {
    return transformSubTask(task, includeContent);
  }
  return transformSimpleTask(task, includeContent);
}

// Export with normalized name (without V2)
export const transformTaskToNormalized = transformTask;

// =============================================================================
// Response Envelope Utilities
// =============================================================================

/**
 * Create standardized response envelope
 */
export function createResponse<T>(data: T, message: string, count?: number) {
  return {
    success: true,
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '2.0',
      count,
    },
  };
}

/**
 * Create error response envelope
 */
export function createErrorResponse(error: string, message?: string) {
  return {
    success: false,
    error,
    message: message || 'Operation failed',
    metadata: {
      timestamp: new Date().toISOString(),
      version: '2.0',
    },
  };
}
