/**
 * Adapter to integrate v2 core with existing CLI command structure
 * This allows gradual migration from v1 to v2
 */

import * as v2 from '../core/v2/index.js';
import { getTasksDirectory } from '../core/index.js';
import type { Task } from '../core/types.js';

/**
 * Convert v2 task to v1 format for compatibility
 */
export function convertV2TaskToV1(v2Task: v2.Task): Task {
  const meta = v2Task.document.frontmatter as any;
  
  return {
    metadata: {
      id: v2Task.metadata.id,
      title: v2Task.document.title,
      type: meta.type || v2Task.document.frontmatter.type,
      status: meta.status || v2Task.document.frontmatter.status,
      priority: meta.priority,
      assigned_to: meta.assignee || meta.assigned_to,
      tags: meta.tags || [],
      phase: v2Task.metadata.location.workflowState, // Map workflow state to phase
      subdirectory: v2Task.metadata.location.workflowState === 'archive' 
        ? v2Task.metadata.location.archiveDate 
        : meta.area,
      parent_task: meta.parent || meta.parent_task,
      subtasks: meta.subtasks || [],
      depends_on: meta.depends || meta.depends_on || [],
      blocks: meta.blocks || [],
      related_to: meta.related_to || [],
      previous_task: meta.previous || meta.previous_task,
      next_task: meta.next || meta.next_task,
      file_path: v2Task.metadata.path,
      created_at: meta.created_at,
      updated_at: meta.updated_at,
      due_date: meta.due_date,
      labels: meta.labels || [],
      notes: meta.notes || ''
    },
    content: v2Task.document.sections.instruction || ''
  };
}

/**
 * Check if project has v2 structure
 */
export function hasV2Structure(projectRoot?: string): boolean {
  const root = projectRoot || getTasksDirectory();
  const version = v2.detectStructureVersion(root.replace('/.tasks', ''));
  return version === 'v2' || version === 'mixed';
}

/**
 * List tasks using v2 if available
 */
export async function listTasksV2Adapter(options: {
  status?: string;
  type?: string;
  assignee?: string;
  tags?: string[];
  phase?: string;
  subdirectory?: string;
  overview?: boolean;
}): Promise<Task[]> {
  const projectRoot = getTasksDirectory().replace('/.tasks', '');
  
  if (!hasV2Structure(projectRoot)) {
    throw new Error('V2 structure not available');
  }
  
  // Build v2 options
  const v2Options: v2.TaskListOptions = {};
  
  // Map phase to workflow states
  if (options.phase) {
    if (options.phase === 'backlog') v2Options.workflowStates = ['backlog'];
    else if (options.phase === 'current') v2Options.workflowStates = ['current'];
    else if (options.phase === 'archive') v2Options.workflowStates = ['archive'];
  }
  
  // Map other options
  if (options.status) {
    // Remove emoji from status if present
    const cleanStatus = options.status.replace(/^[^\s]+\s/, '');
    v2Options.status = cleanStatus as v2.TaskStatus;
  }
  
  if (options.type) {
    // Remove emoji from type if present
    const cleanType = options.type.replace(/^[^\s]+\s/, '').toLowerCase();
    v2Options.type = cleanType as v2.TaskType;
  }
  
  if (options.assignee) v2Options.assignee = options.assignee;
  if (options.tags) v2Options.tags = options.tags;
  if (options.subdirectory) v2Options.subdirectory = options.subdirectory;
  
  // Get v2 tasks
  const result = await v2.listTasks(projectRoot, v2Options);
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to list tasks');
  }
  
  // Convert to v1 format
  return result.data.map(convertV2TaskToV1);
}

/**
 * Get a task using v2 if available
 */
export async function getTaskV2Adapter(
  id: string,
  options?: { phase?: string; subdirectory?: string }
): Promise<Task | null> {
  const projectRoot = getTasksDirectory().replace('/.tasks', '');
  
  if (!hasV2Structure(projectRoot)) {
    throw new Error('V2 structure not available');
  }
  
  const result = await v2.getTask(projectRoot, id);
  
  if (!result.success || !result.data) {
    return null;
  }
  
  return convertV2TaskToV1(result.data);
}

/**
 * Create a task using v2
 */
export async function createTaskV2Adapter(
  task: Partial<Task>,
  options?: { phase?: string; subdirectory?: string }
): Promise<Task> {
  const projectRoot = getTasksDirectory().replace('/.tasks', '');
  
  if (!hasV2Structure(projectRoot)) {
    throw new Error('V2 structure not available');
  }
  
  // Build v2 create options
  const v2Options: v2.TaskCreateOptions = {
    title: task.metadata?.title || 'Untitled',
    type: (task.metadata?.type?.replace(/^[^\s]+\s/, '').toLowerCase() || 'chore') as v2.TaskType,
    area: options?.subdirectory || task.metadata?.subdirectory || 'general',
    workflowState: 'backlog', // Default to backlog
    status: 'To Do',
    instruction: task.content
  };
  
  // Add custom metadata
  const customMeta: any = {};
  if (task.metadata?.priority) customMeta.priority = task.metadata.priority;
  if (task.metadata?.assigned_to) customMeta.assignee = task.metadata.assigned_to;
  if (task.metadata?.tags) customMeta.tags = task.metadata.tags;
  if (task.metadata?.parent_task) customMeta.parent = task.metadata.parent_task;
  if (task.metadata?.depends_on) customMeta.depends = task.metadata.depends_on;
  if (task.metadata?.previous_task) customMeta.previous = task.metadata.previous_task;
  if (task.metadata?.next_task) customMeta.next = task.metadata.next_task;
  
  v2Options.customMetadata = customMeta;
  
  const result = await v2.createTask(projectRoot, v2Options);
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to create task');
  }
  
  return convertV2TaskToV1(result.data);
}

/**
 * Initialize v2 project structure
 */
export async function initV2Structure(): Promise<void> {
  const projectRoot = getTasksDirectory().replace('/.tasks', '');
  v2.initializeV2ProjectStructure(projectRoot);
}