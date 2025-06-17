/**
 * Transformation utilities to convert core types to normalized MCP schema
 */

import * as core from '../core/index.js';
import { getPriorityLabel, getStatusLabel } from '../core/metadata/schema-service.js';
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
  type TaskPhase,
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
 * Denormalize status from MCP format to core format
 * Converts from MCP format (e.g., "in_progress") to core format (e.g., "In Progress")
 */
export function denormalizeStatus(mcpStatus?: TaskStatus): string {
  if (!mcpStatus) return getStatusLabel('todo'); // Default to "To Do"

  // Use schema service to get the label
  return getStatusLabel(mcpStatus);
}

/**
 * Denormalize priority from MCP format to core format
 * Converts from MCP format (e.g., "high") to core format (e.g., "High")
 */
export function denormalizePriority(mcpPriority?: TaskPriority): string {
  if (!mcpPriority) return getPriorityLabel('medium'); // Default to "Medium"

  // Use schema service to get the label
  return getPriorityLabel(mcpPriority);
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
    type: task.document.frontmatter.type as TaskType,
    status: task.document.frontmatter.status as TaskStatus,
    priority: task.document.frontmatter.priority as TaskPriority,
    phase: task.document.frontmatter.phase as TaskPhase | undefined,
    workflowState: task.metadata.location.workflowState as WorkflowState,
    area: task.document.frontmatter.area,
    tags: task.document.frontmatter.tags as string[],
    assignee:
      typeof task.document.frontmatter.assignee === 'string'
        ? task.document.frontmatter.assignee
        : undefined,
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
    content: includeContent ? core.serializeTaskContent(task.document) : undefined,
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
    content: includeContent ? core.serializeTaskContent(task.document) : undefined,
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
  const parentResult = await core.parent(projectRoot, task.metadata.id).get();
  if (!parentResult.success || !parentResult.data) {
    throw new Error(`Failed to get parent task data for ${task.metadata.id}`);
  }

  const parentData = parentResult.data as core.ParentTask;
  const subtaskCount = parentData.subtasks.length;
  const completedCount = parentData.subtasks.filter(
    (st) => st.document.frontmatter.status === 'done'
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
    content: includeContent ? core.serializeTaskContent(task.document) : undefined,
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
  const parentResult = await core.parent(projectRoot, parentId).get();
  if (!parentResult.success || !parentResult.data) {
    throw new Error(`Failed to get parent task data for ${parentId}`);
  }

  const parentData = parentResult.data as core.ParentTask;

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
  }
  if (task.metadata.parentTask) {
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
