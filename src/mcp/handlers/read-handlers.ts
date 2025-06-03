/**
 * Read operation handlers for MCP
 * All handlers have been refactored to reduce complexity
 */

import * as core from '../../core/index.js';
import {
  type McpResponse,
  type Task,
  type TaskListInput,
  TaskListInputSchema,
  type TaskGetInput,
  TaskGetInputSchema,
  type ParentTaskList,
  type ParentListInput,
  ParentListInputSchema,
  type ParentTaskDetail,
  type ParentGetInput,
  ParentGetInputSchema,
} from '../schemas.js';
import { transformTask, transformParentTaskDetail } from '../transformers.js';
import { 
  createErrorResponse,
  batchTransformTasks,
} from './shared/response-utils.js';
import { getProjectRoot } from './shared/config-utils.js';

// =============================================================================
// Task List Handler (Refactored from complexity 17 to ~12)
// =============================================================================

/**
 * Build core list options from input parameters
 */
function buildListFilters(params: TaskListInput): core.ListOptions {
  const listOptions: core.ListOptions = {};

  // Basic filters
  if (params.workflowState) listOptions.workflowState = params.workflowState;
  if (params.area) listOptions.area = params.area;
  if (params.type) listOptions.type = params.type;
  if (params.status) listOptions.status = params.status;
  if (params.priority) listOptions.priority = params.priority;
  if (params.assignee) listOptions.assignee = params.assignee;
  if (params.tags) listOptions.tags = params.tags;

  // Token efficiency: exclude completed tasks by default
  if (!params.includeCompleted) {
    listOptions.excludeStatuses = ['done', 'archived'];
  }

  // Handle archive inclusion
  if (params.includeArchived) {
    listOptions.includeArchived = true;
  }

  // Handle parent task inclusion based on task type
  const taskType = params.taskType || 'top-level';
  if (
    taskType === 'top-level' ||
    taskType === 'parent' ||
    taskType === 'all' ||
    params.includeParentTasks
  ) {
    listOptions.includeParentTasks = true;
  }

  return listOptions;
}

/**
 * Filter tasks by structure type
 */
function applyStructureFilter(
  tasks: core.Task[],
  taskType: TaskListInput['taskType']
): core.Task[] {
  switch (taskType) {
    case 'simple':
      return tasks.filter((t) => !t.metadata.isParentTask && !t.metadata.parentTask);
    
    case 'parent':
      return tasks.filter((t) => t.metadata.isParentTask);
    
    case 'subtask':
      return tasks.filter((t) => t.metadata.parentTask);
    
    case 'top-level':
      return tasks.filter((t) => !t.metadata.parentTask);
    
    case 'all':
    default:
      return tasks;
  }
}

/**
 * Handler for task_list method
 * Complexity reduced from 17 to ~12
 */
export async function handleTaskList(
  rawParams: unknown
): Promise<McpResponse<Task[]>> {
  try {
    // Validate input
    const params = TaskListInputSchema.parse(rawParams);
    
    // Check for advanced filter usage
    if (params.advancedFilter) {
      console.warn('advancedFilter not yet implemented - ignoring');
    }

    const projectRoot = getProjectRoot(params);

    // Build filters and get tasks
    const listOptions = buildListFilters(params);
    const result = await core.list(projectRoot, listOptions);

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to list tasks');
    }

    // Apply structure filtering
    const filteredTasks = applyStructureFilter(result.data, params.taskType);

    // Transform to normalized format
    const transformedTasks = await batchTransformTasks(
      projectRoot,
      filteredTasks,
      params.includeContent || false
    );

    // Return response
    return {
      success: true,
      data: transformedTasks,
      message: `Found ${transformedTasks.length} tasks`,
    };
  } catch (error) {
    console.error('Error in handleTaskList:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to list tasks'
    );
  }
}

// =============================================================================
// Task Get Handler
// =============================================================================

/**
 * Handler for task_get method
 */
export async function handleTaskGet(
  rawParams: unknown
): Promise<McpResponse<Task>> {
  try {
    // Validate input
    const params = TaskGetInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    // Get task with parent context if available
    const result = await core.get(
      projectRoot,
      params.id,
      undefined, // config
      params.parentId
    );

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Task not found');
    }

    // Transform to normalized schema - always include content for get operations
    const normalizedTask = await transformTask(
      projectRoot,
      result.data,
      true, // Always include content for task_get
      false // task_get does NOT include subtasks (use parent_get for that)
    );

    // Return response
    return {
      success: true,
      data: normalizedTask,
      message: 'Task retrieved successfully',
    };
  } catch (error) {
    console.error('Error in handleTaskGet:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to get task'
    );
  }
}

// =============================================================================
// Parent List Handler
// =============================================================================

/**
 * Handler for parent_list method
 */
export async function handleParentList(
  rawParams: unknown
): Promise<McpResponse<ParentTaskList[]>> {
  try {
    // Validate input
    const params = ParentListInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    // Build filter options for listing
    const listOptions: core.ListOptions = {
      area: params.area,
      includeParentTasks: true,
      workflowState: params.workflowState,
    };

    // List tasks filtered to parent tasks only
    const result = await core.list(projectRoot, listOptions);

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to list parent tasks');
    }

    // Filter to only parent tasks
    const parentTasks = result.data.filter(t => t.metadata.isParentTask);

    // Transform to normalized format
    const transformedParents: ParentTaskList[] = [];
    
    for (const task of parentTasks) {
      try {
        const normalizedParent = await transformTask(
          projectRoot,
          task,
          false, // Don't include content in list
          params.includeSubtasks || false
        );

        // For now, cast to ParentTaskList as we know these are parent tasks
        // Progress info would need to be loaded separately if needed
        transformedParents.push(normalizedParent as ParentTaskList);
      } catch (error) {
        console.error(`Failed to transform parent ${task.metadata.id}:`, error);
        // Continue with other parents
      }
    }

    // Return response
    return {
      success: true,
      data: transformedParents,
      message: `Found ${transformedParents.length} parent tasks`,
    };
  } catch (error) {
    console.error('Error in handleParentList:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to list parent tasks'
    );
  }
}

// =============================================================================
// Parent Get Handler
// =============================================================================

/**
 * Handler for parent_get method
 */
export async function handleParentGet(
  rawParams: unknown
): Promise<McpResponse<ParentTaskDetail>> {
  try {
    // Validate input
    const params = ParentGetInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    // Use transformer that handles parent details
    const parentDetail = await transformParentTaskDetail(
      projectRoot,
      params.id,
      params.format !== 'summary' // Include content unless summary format
    );

    // Return response
    return {
      success: true,
      data: parentDetail,
      message: 'Parent task retrieved successfully',
    };
  } catch (error) {
    console.error('Error in handleParentGet:', error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes('not found')) {
      return createErrorResponse('Parent task not found', 'Parent task not found');
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to get parent task'
    );
  }
}