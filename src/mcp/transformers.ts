/**
 * Transformation utilities to convert core V2 types to normalized MCP schema
 */

import * as v2 from '../core/v2/index.js';
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
 * Transform core V2 task metadata to base task fields
 */
function transformBaseTask(v2Task: v2.Task) {
  return {
    id: v2Task.metadata.id,
    title: v2Task.document.title,
    type: cleanTaskType(v2Task.document.frontmatter.type || 'chore'),
    status: normalizeStatus(v2Task.document.frontmatter.status || 'todo'),
    priority: normalizePriority(v2Task.document.frontmatter.priority),
    workflowState: normalizeWorkflowState(v2Task.metadata.location.workflowState),
    area: v2Task.document.frontmatter.area || 'general',
    tags: (v2Task.document.frontmatter.tags as string[]) || [],
    assignee: v2Task.document.frontmatter.assignee || undefined,
    createdDate: undefined, // TODO: Extract from file stats if needed
    updatedDate: undefined, // TODO: Extract from file stats if needed
    archivedDate: v2Task.metadata.location.workflowState === 'archive' ? undefined : undefined, // TODO: Extract archive date
    path: v2Task.metadata.path,
    filename: v2Task.metadata.filename,
  };
}

/**
 * Transform task sections from core V2 document
 */
function transformTaskSections(v2Task: v2.Task) {
  return {
    instruction: v2Task.document.sections.instruction,
    tasks: v2Task.document.sections.tasks,
    deliverable: v2Task.document.sections.deliverable,
    log: v2Task.document.sections.log,
  };
}

// =============================================================================
// Task Type Specific Transformations
// =============================================================================

/**
 * Transform core V2 task to normalized simple task
 */
export function transformSimpleTask(v2Task: v2.Task, includeContent = false): SimpleTask {
  const baseTask = transformBaseTask(v2Task);

  const simpleTask: SimpleTask = {
    ...baseTask,
    taskStructure: 'simple' as const,
    content: includeContent ? v2.serializeTaskDocument(v2Task.document) : undefined,
    sections: includeContent ? transformTaskSections(v2Task) : undefined,
  };

  // Validate with Zod schema
  return SimpleTaskSchema.parse(simpleTask);
}

/**
 * Transform core V2 subtask to normalized subtask
 */
export function transformSubTask(v2Task: v2.Task, includeContent = false): SubTask {
  const baseTask = transformBaseTask(v2Task);

  if (!v2Task.metadata.parentTask || !v2Task.metadata.sequenceNumber) {
    throw new Error(`Task ${v2Task.metadata.id} is not a valid subtask`);
  }

  const subTask: SubTask = {
    ...baseTask,
    taskStructure: 'subtask' as const,
    parentId: v2Task.metadata.parentTask,
    sequenceNumber: v2Task.metadata.sequenceNumber,
    content: includeContent ? v2.serializeTaskDocument(v2Task.document) : undefined,
    sections: includeContent ? transformTaskSections(v2Task) : undefined,
  };

  // Validate with Zod schema
  return SubTaskSchema.parse(subTask);
}

/**
 * Transform core V2 parent task to normalized parent task
 */
export async function transformParentTask(
  projectRoot: string,
  v2Task: v2.Task,
  includeSubtasks = false,
  includeContent = false
): Promise<ParentTask> {
  const baseTask = transformBaseTask(v2Task);

  if (!v2Task.metadata.isParentTask) {
    throw new Error(`Task ${v2Task.metadata.id} is not a parent task`);
  }

  // Get full parent task data to calculate progress
  const parentResult = await v2.getParentTask(projectRoot, v2Task.metadata.id);
  if (!parentResult.success || !parentResult.data) {
    throw new Error(`Failed to get parent task data for ${v2Task.metadata.id}`);
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
    overview: includeContent ? v2.serializeTaskDocument(v2Task.document) : undefined,
    sections: includeContent ? transformTaskSections(v2Task) : undefined,
    subtasks: includeSubtasks
      ? parentData.subtasks.map((st) => transformSubTask(st, includeContent))
      : undefined,
  };

  // Validate with Zod schema
  return ParentTaskSchema.parse(parentTask);
}

/**
 * Transform core V2 parent task to detailed parent task (for parent_get)
 */
export async function transformParentTaskDetail(
  projectRoot: string,
  parentId: string,
  includeContent = true
): Promise<ParentTaskDetail> {
  const parentResult = await v2.getParentTask(projectRoot, parentId);
  if (!parentResult.success || !parentResult.data) {
    throw new Error(`Failed to get parent task data for ${parentId}`);
  }

  const parentData = parentResult.data;

  // Transform the overview task - note: overview is TaskDocument, need to create Task structure
  const overviewTask: v2.Task = {
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
 * Transform any core V2 task to appropriate normalized task type
 */
export async function transformV2Task(
  projectRoot: string,
  v2Task: v2.Task,
  includeContent = false,
  includeSubtasks = false
): Promise<Task> {
  if (v2Task.metadata.isParentTask) {
    return await transformParentTask(projectRoot, v2Task, includeSubtasks, includeContent);
  } else if (v2Task.metadata.parentTask) {
    return transformSubTask(v2Task, includeContent);
  }
  return transformSimpleTask(v2Task, includeContent);
}

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
