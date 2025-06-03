/**
 * Shared option builders for MCP handlers
 * Provides consistent option building across create/update operations
 */

import * as core from '../../../core/index.js';
import { type TaskCreateInput, type TaskUpdateInput } from '../../schemas.js';

/**
 * Build common metadata fields for task creation
 * Used by both task and parent creation
 */
export function buildCommonMetadata(params: {
  priority?: string;
  assignee?: string;
  tags?: string[];
}): Record<string, any> {
  const metadata: Record<string, any> = {};
  
  if (params.priority) {
    metadata.priority = params.priority; // Core will normalize
  }
  if (params.assignee) {
    metadata.assignee = params.assignee;
  }
  
  return metadata;
}

/**
 * Build base task create options
 * Used by task and parent creation
 */
export function buildTaskCreateOptionsBase(params: {
  title: string;
  type: string;
  area?: string;
  status?: string;
  workflowState?: string;
  instruction?: string;
}): Partial<core.TaskCreateOptions> {
  return {
    title: params.title,
    type: params.type as core.TaskType,
    area: params.area || 'general',
    status: (params.status || 'todo') as core.TaskStatus, // Core will normalize
    workflowState: params.workflowState as core.WorkflowState,
    instruction: params.instruction,
  };
}

/**
 * Build task update options from update params
 */
export function buildTaskUpdateOptions(
  updates: TaskUpdateInput['updates']
): core.TaskUpdateOptions {
  const updateOptions: core.TaskUpdateOptions = {};

  // Handle metadata updates
  if (updates.title) updateOptions.title = updates.title;

  // Build frontmatter updates
  const frontmatter: Partial<core.TaskFrontmatter> = {};
  if (updates.status) frontmatter.status = updates.status as core.TaskStatus;
  if (updates.priority) frontmatter.priority = updates.priority as core.TaskPriority;
  if (updates.area) frontmatter.area = updates.area;
  if (updates.assignee) frontmatter.assignee = updates.assignee;
  if (updates.tags) frontmatter.tags = updates.tags;

  if (Object.keys(frontmatter).length > 0) {
    updateOptions.frontmatter = frontmatter;
  }

  // Build section updates
  const sections: Partial<core.TaskSections> = {};
  if (updates.instruction) sections.instruction = updates.instruction;
  if (updates.tasks) sections.tasks = updates.tasks;
  if (updates.deliverable) sections.deliverable = updates.deliverable;
  if (updates.log) sections.log = updates.log;

  if (Object.keys(sections).length > 0) {
    updateOptions.sections = sections;
  }

  return updateOptions;
}

/**
 * Parse and normalize task list into array of strings
 */
export function parseTasksList(tasksInput?: string | string[]): string[] | undefined {
  if (!tasksInput) return undefined;
  
  if (Array.isArray(tasksInput)) {
    return tasksInput;
  }
  
  // Parse markdown task list format
  return core.parseTasksSection(tasksInput).map((t) => t.text);
}