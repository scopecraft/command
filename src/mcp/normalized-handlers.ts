/**
 * Normalized MCP Handlers using Zod schemas and transformations
 *
 * These handlers implement the new consistent API schema design
 */

import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as core from '../core/index.js';
import {
  type ParentGetInput,
  ParentGetInputSchema,
  ParentGetOutputSchema,
  type ParentListInput,
  ParentListInputSchema,
  ParentListOutputSchema,
  type ParentTask,
  type ParentTaskDetail,
  type Task,
  type TaskGetInput,
  TaskGetInputSchema,
  TaskGetOutputSchema,
  type TaskListInput,
  TaskListInputSchema,
  TaskListOutputSchema,
  isParentTask,
} from './schemas.js';
import {
  createErrorResponse,
  createResponse,
  transformParentTask,
  transformParentTaskDetail,
  transformTask,
} from './transformers.js';
import type { McpResponse } from './types.js';

// =============================================================================
// Filtering Utilities
// =============================================================================

/**
 * Apply task structure filtering to tasks
 */
function filterTasksByStructure(tasks: core.Task[], taskType: string): core.Task[] {
  if (taskType === 'all') return tasks;

  return tasks.filter((task) => {
    const isParent = task.metadata.isParentTask;
    const isSubtask = task.metadata.parentTask !== undefined;
    const isSimple = !isParent && !isSubtask;

    switch (taskType) {
      case 'simple':
        return isSimple;
      case 'parent':
        return isParent;
      case 'subtask':
        return isSubtask;
      case 'top-level':
        return isSimple || isParent; // Simple tasks + Parent overviews (no subtasks)
      default:
        return true;
    }
  });
}

/**
 * Apply basic filters to core list options
 */
function buildCoreListOptions(params: TaskListInput | ParentListInput): core.TaskListOptions {
  const listOptions: core.TaskListOptions = {};

  // Map workflowState parameter to workflowStates
  if (params.workflowState) {
    listOptions.workflowStates = Array.isArray(params.workflowState)
      ? params.workflowState
      : [params.workflowState];
  }

  // Add other basic filters
  if ('type' in params && params.type) {
    // Convert clean enum back to core format (with emoji)
    // TODO: This is temporary - core should store clean enums
    const typeMap: Record<string, string> = {
      feature: '🌟 Feature',
      bug: '🐞 Bug',
      chore: '🧹 Chore',
      documentation: '📖 Documentation',
      test: '🧪 Test',
      spike: '💡 Spike/Research',
    };
    listOptions.type = typeMap[params.type] as core.TaskType;
  }

  if ('status' in params && params.status) {
    // Convert clean enum back to core format
    const statusMap: Record<string, string> = {
      todo: 'To Do',
      in_progress: 'In Progress',
      done: 'Done',
      blocked: 'Blocked',
      archived: 'Archived',
    };
    listOptions.status = statusMap[params.status] as core.TaskStatus;
  }

  if (params.area) listOptions.area = params.area;
  if (params.assignee) listOptions.assignee = params.assignee;
  if (params.tags) listOptions.tags = params.tags;

  return listOptions;
}

// =============================================================================
// Handler Implementations
// =============================================================================

/**
 * Handler for task_list method
 */
export async function handleTaskListNormalized(rawParams: unknown): Promise<McpResponse<Task[]>> {
  try {
    // Validate input with Zod schema
    const params = TaskListInputSchema.parse(rawParams);

    // Check for advanced filter usage
    if (params.advancedFilter) {
      console.warn('advancedFilter not yet implemented - ignoring');
    }

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    // Build core list options from basic filters
    const listOptions = buildCoreListOptions(params);

    // Token efficiency: exclude completed tasks by default
    if (!params.includeCompleted) {
      listOptions.excludeStatuses = ['Done', 'Archived'];
    }

    // Handle include_archived separately from include_completed
    if (params.includeArchived) {
      listOptions.includeArchived = true;
    }

    // Handle parent task inclusion
    const taskType = params.taskType || 'top-level';
    if (
      taskType === 'top-level' ||
      taskType === 'parent' ||
      taskType === 'all' ||
      params.includeParentTasks
    ) {
      listOptions.includeParentTasks = true;
    }

    const result = await core.list(projectRoot, listOptions);

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to list tasks');
    }

    // Filter by task structure
    const filteredTasks = filterTasksByStructure(result.data, taskType);

    // Transform to normalized schema
    const transformedTasks: Task[] = [];
    for (const task of filteredTasks) {
      try {
        const normalizedTask = await transformTask(
          projectRoot,
          task,
          params.includeContent || false,
          false // Never include subtasks in task_list for token efficiency
        );
        transformedTasks.push(normalizedTask);
      } catch (error) {
        console.error(`Failed to transform task ${task.metadata.id}:`, error);
        // Continue with other tasks
      }
    }

    // Return simplified MCP response format (legacy compatibility)
    return {
      success: true,
      data: transformedTasks,
      message: `Found ${transformedTasks.length} tasks`,
    };
  } catch (error) {
    console.error('Error in handleTaskListNormalized:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to list tasks',
    };
  }
}

/**
 * Handler for task_get method
 */
export async function handleTaskGetNormalized(rawParams: unknown): Promise<McpResponse<Task>> {
  try {
    // Validate input with Zod schema
    const params = TaskGetInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    // Use getTask with parent context if available
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

    // Return simplified MCP response format (legacy compatibility)
    return {
      success: true,
      data: normalizedTask,
      message: `Retrieved task ${params.id}`,
    };
  } catch (error) {
    console.error('Error in handleTaskGetNormalized:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get task',
    };
  }
}

/**
 * Handler for parent_list method
 */
export async function handleParentListNormalized(
  rawParams: unknown
): Promise<McpResponse<ParentTask[]>> {
  try {
    // Validate input with Zod schema
    const params = ParentListInputSchema.parse(rawParams);

    // Check for advanced filter usage
    if (params.advancedFilter) {
      console.warn('advancedFilter not yet implemented - ignoring');
    }

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    // Build list options for parent tasks only
    const listOptions = buildCoreListOptions(params);
    listOptions.includeParentTasks = true;

    const result = await core.list(projectRoot, listOptions);

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to list parent tasks');
    }

    // Filter to only parent tasks
    const parentTasks = result.data.filter((task) => task.metadata.isParentTask);

    // Transform to normalized schema
    const transformedParents: ParentTask[] = [];
    for (const parentTask of parentTasks) {
      try {
        const normalizedParent = await transformParentTask(
          projectRoot,
          parentTask,
          params.includeSubtasks || false,
          false // Don't include content in list view for token efficiency
        );
        transformedParents.push(normalizedParent);
      } catch (error) {
        console.error(`Failed to transform parent task ${parentTask.metadata.id}:`, error);
        // Continue with other tasks
      }
    }

    // Return simplified MCP response format (legacy compatibility)
    return {
      success: true,
      data: transformedParents,
      message: `Found ${transformedParents.length} parent tasks`,
    };
  } catch (error) {
    console.error('Error in handleParentListNormalized:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to list parent tasks',
    };
  }
}

/**
 * Handler for parent_get method
 */
export async function handleParentGetNormalized(
  rawParams: unknown
): Promise<McpResponse<ParentTaskDetail>> {
  try {
    // Validate input with Zod schema
    const params = ParentGetInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    // Transform to detailed parent task (always includes subtasks and content)
    const parentDetail = await transformParentTaskDetail(
      projectRoot,
      params.id,
      true // Always include content for parent_get
    );

    // Return simplified MCP response format (legacy compatibility)
    return {
      success: true,
      data: parentDetail,
      message: `Retrieved parent task ${params.id} with ${parentDetail.subtasks.length} subtasks`,
    };
  } catch (error) {
    console.error('Error in handleParentGetNormalized:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get parent task',
    };
  }
}
