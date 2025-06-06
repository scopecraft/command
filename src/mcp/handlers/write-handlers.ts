/**
 * Write operation handlers for MCP
 * All handlers have been refactored to reduce complexity
 */

import * as core from '../../core/index.js';
import {
  type ParentCreateInput,
  ParentCreateInputSchema,
  type ParentCreateOutput,
  ParentCreateOutputSchema,
  type ParentOperationsInput,
  ParentOperationsInputSchema,
  type ParentOperationsOutput,
  ParentOperationsOutputSchema,
  type Task,
  type TaskCreateInput,
  TaskCreateInputSchema,
  type TaskCreateOutput,
  TaskCreateOutputSchema,
  type TaskDeleteInput,
  TaskDeleteInputSchema,
  type TaskDeleteOutput,
  TaskDeleteOutputSchema,
  type TaskMoveInput,
  TaskMoveInputSchema,
  type TaskMoveOutput,
  TaskMoveOutputSchema,
  type TaskTransformInput,
  TaskTransformInputSchema,
  type TaskTransformOutput,
  TaskTransformOutputSchema,
  type TaskUpdateInput,
  TaskUpdateInputSchema,
  TaskUpdateOutputSchema,
} from '../schemas.js';
import { transformTask } from '../transformers.js';
import type { McpResponse } from '../types.js';

// Type aliases for inline schemas
type SubtaskDefinition = NonNullable<ParentCreateInput['subtasks']>[number];
import { getProjectRoot, loadProjectConfig } from './shared/config-utils.js';
import { appendTimestampedLogEntry } from './shared/log-utils.js';
import {
  buildCommonMetadata,
  buildTaskCreateOptionsBase,
  buildTaskUpdateOptions,
  parseTasksList,
} from './shared/options-builders.js';
import {
  createErrorResponse,
  createSuccessResponse,
  createTaskResponse,
} from './shared/response-utils.js';
import {
  type CreatedSubtask,
  applyParallelizations,
  buildSubtaskResponse,
  createSubtaskWithDefaults,
  groupParallelSubtasks,
} from './shared/subtask-utils.js';
import { validateParentTask, validateTaskExists } from './shared/validation-utils.js';

// =============================================================================
// Parent Create Handler (Refactored from complexity 58 to ~10)
// =============================================================================

/**
 * Build parent create options from input parameters
 */
function buildParentCreateOptions(params: ParentCreateInput): core.TaskCreateOptions {
  const baseOptions = buildTaskCreateOptionsBase({
    title: params.title,
    type: params.type,
    area: params.area,
    status: params.status,
    workflowState: params.workflowState,
    instruction: params.overviewContent,
  });

  const metadata = buildCommonMetadata({
    priority: params.priority,
    assignee: params.assignee,
    tags: params.tags,
  });

  return {
    ...baseOptions,
    title: params.title, // Ensure title is always present
    customMetadata: metadata,
    tags: params.tags,
  } as core.TaskCreateOptions;
}

/**
 * Create initial subtasks for a parent task
 */
async function createInitialSubtasks(
  projectRoot: string,
  parentId: string,
  subtasks: SubtaskDefinition[],
  parentType: string,
  parentArea?: string
): Promise<CreatedSubtask[]> {
  const createdSubtasks: CreatedSubtask[] = [];

  for (const subtaskDef of subtasks) {
    const result = await createSubtaskWithDefaults(projectRoot, parentId, subtaskDef.title, {
      type: subtaskDef.type,
      parentType,
      parentArea,
    });

    if (result.success && result.subtask) {
      createdSubtasks.push(buildSubtaskResponse(result.subtask));
    }
  }

  return createdSubtasks;
}

/**
 * Build parent create response
 */
function buildParentCreateResponse(
  parentData: core.ParentTask,
  createdSubtasks: CreatedSubtask[]
): ParentCreateOutput['data'] {
  return {
    id: parentData.metadata.id,
    title: parentData.overview.title,
    type: parentData.overview.frontmatter.type,
    workflowState: parentData.metadata.location.workflowState,
    path: parentData.metadata.path,
    subtaskCount: createdSubtasks.length,
    createdSubtasks: createdSubtasks.length > 0 ? createdSubtasks : undefined,
  };
}

/**
 * Handler for parent_create method
 * Complexity reduced from 58 to ~10
 */
export async function handleParentCreate(
  rawParams: unknown
): Promise<McpResponse<ParentCreateOutput['data']>> {
  try {
    // Validate input
    const params = ParentCreateInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);
    const projectConfig = loadProjectConfig(projectRoot);

    // Create parent with options
    const createOptions = buildParentCreateOptions(params);
    const result = await core.createParent(projectRoot, createOptions, projectConfig);

    if (!result.success || !result.data) {
      return createErrorResponse(
        result.error || 'Failed to create parent task',
        'Parent task creation failed'
      );
    }

    // Create initial subtasks if provided
    const createdSubtasks = params.subtasks?.length
      ? await createInitialSubtasks(
          projectRoot,
          result.data.metadata.id,
          params.subtasks,
          params.type,
          params.area
        )
      : [];

    // Handle parallel subtasks if specified
    if (params.subtasks?.length && createdSubtasks.length > 0) {
      const parallelGroups = groupParallelSubtasks(params.subtasks, createdSubtasks);
      await applyParallelizations(projectRoot, result.data.metadata.id, parallelGroups);
    }

    // Build and validate response
    const responseData = buildParentCreateResponse(result.data, createdSubtasks);
    const response = ParentCreateOutputSchema.parse({
      success: true,
      data: responseData,
      message: `Parent task ${responseData?.id} created successfully`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 'Parent task creation failed');
    }
    throw error;
  }
}

// =============================================================================
// Task Create Handler (Refactored from complexity 26 to ~10)
// =============================================================================

/**
 * Handle subtask creation within a parent
 */
async function handleSubtaskCreation(
  params: TaskCreateInput,
  projectRoot: string
): Promise<McpResponse<TaskCreateOutput['data']> | null> {
  if (!params.parentId) return null;

  // Validate parent exists
  const parentValidation = await validateParentTask(projectRoot, params.parentId);
  if (!parentValidation.isValid) {
    return createErrorResponse(
      parentValidation.error || 'Invalid parent task',
      'Subtask creation failed'
    );
  }

  // Create subtask
  const result = await createSubtaskWithDefaults(projectRoot, params.parentId, params.title, {
    type: params.type,
    area: params.area,
  });

  if (!result.success || !result.subtask) {
    return createErrorResponse(
      result.error || 'Failed to create subtask',
      'Subtask creation failed'
    );
  }

  // Build response
  return createTaskResponse<TaskCreateOutput['data']>(
    projectRoot,
    result.subtask,
    `Subtask ${result.subtask.metadata.id} created successfully`
  );
}

/**
 * Build task create response data
 */
function buildTaskCreateResponse(task: core.Task): TaskCreateOutput['data'] {
  return {
    id: task.metadata.id,
    title: task.document.title,
    type: task.document.frontmatter.type,
    status: task.document.frontmatter.status,
    priority: task.document.frontmatter.priority,
    workflowState: task.metadata.location.workflowState,
    area: task.document.frontmatter.area || 'general',
    path: task.metadata.path,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Handler for task_create method
 * Complexity reduced from 26 to ~10
 */
export async function handleTaskCreate(
  rawParams: unknown
): Promise<McpResponse<TaskCreateOutput['data']>> {
  try {
    // Validate input
    const params = TaskCreateInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    // Handle subtask creation separately
    const subtaskResponse = await handleSubtaskCreation(params, projectRoot);
    if (subtaskResponse) return subtaskResponse;

    // Build create options
    const createOptions: core.TaskCreateOptions = {
      ...buildTaskCreateOptionsBase({
        title: params.title,
        type: params.type,
        area: params.area,
        status: params.status || 'todo',
        workflowState: params.workflowState,
        instruction: params.instruction,
      }),
      title: params.title, // Ensure title is always present
      type: params.type as core.TaskType, // Ensure type is always present
      area: params.area || 'general', // Ensure area is always present
      tasks: parseTasksList(params.tasks),
      customMetadata: buildCommonMetadata({
        priority: params.priority,
        assignee: params.assignee,
        tags: params.tags,
      }),
      tags: params.tags,
    };

    // Load project config
    const projectConfig = loadProjectConfig(projectRoot);

    // Create task
    const result = await core.create(projectRoot, createOptions, projectConfig);

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to create task', 'Task creation failed');
    }

    // Build and validate response
    const responseData = buildTaskCreateResponse(result.data);
    const response = TaskCreateOutputSchema.parse({
      success: true,
      data: responseData,
      message: `Task ${responseData?.id} created successfully`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 'Task creation failed');
    }
    throw error;
  }
}

// =============================================================================
// Task Update Handler (Refactored from complexity 28 to ~10)
// =============================================================================

/**
 * Append a log entry to the current task log
 */
async function appendLogEntry(
  projectRoot: string,
  taskId: string,
  logEntry: string,
  parentId?: string
): Promise<string> {
  const projectConfig = loadProjectConfig(projectRoot);
  const currentTask = await core.get(projectRoot, taskId, projectConfig, parentId);
  if (currentTask.success && currentTask.data) {
    const currentLog = currentTask.data.document.sections.log || '';
    return appendTimestampedLogEntry(currentLog, logEntry);
  }
  return appendTimestampedLogEntry('', logEntry);
}

/**
 * Create update response with normalized task data
 */
async function createUpdateResponse(
  projectRoot: string,
  updatedTask: core.Task,
  taskId: string
): Promise<McpResponse<Task>> {
  const normalizedTask = await transformTask(
    projectRoot,
    updatedTask,
    true, // Always include content for updates
    false // No subtasks
  );

  return TaskUpdateOutputSchema.parse({
    success: true,
    data: normalizedTask,
    message: `Task ${taskId} updated successfully`,
  });
}

/**
 * Handler for task_update method
 * Complexity reduced from 28 to ~10
 */
export async function handleTaskUpdate(rawParams: unknown): Promise<McpResponse<Task>> {
  try {
    // Validate input
    const params = TaskUpdateInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    // Build update options
    const updateOptions = buildTaskUpdateOptions(params.updates);

    // Handle special log entry appending
    if (params.updates.addLogEntry) {
      const newLog = await appendLogEntry(
        projectRoot,
        params.id,
        params.updates.addLogEntry,
        params.parentId
      );

      if (!updateOptions.sections) {
        updateOptions.sections = {};
      }
      updateOptions.sections.log = newLog;
    }

    // Load project config to respect autoWorkflowTransitions setting
    const projectConfig = loadProjectConfig(projectRoot);

    // Perform update
    const result = await core.update(
      projectRoot,
      params.id,
      updateOptions,
      projectConfig,
      params.parentId
    );

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to update task', 'Task update failed');
    }

    // Create response with normalized data
    return await createUpdateResponse(projectRoot, result.data, params.id);
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 'Task update failed');
    }
    throw error;
  }
}

// =============================================================================
// Task Delete Handler
// =============================================================================

/**
 * Get cascade count for parent task deletion
 */
async function getCascadeCount(projectRoot: string, taskId: string): Promise<number> {
  try {
    const parentResult = await core.parent(projectRoot, taskId).get();
    if (parentResult.success && parentResult.data && 'subtasks' in parentResult.data) {
      return parentResult.data.subtasks.length;
    }
  } catch (_error) {
    // If we can't get subtask count, return 0
  }
  return 0;
}

/**
 * Delete parent task with cascade
 */
async function deleteParentTask(
  projectRoot: string,
  taskId: string,
  cascade: boolean
): Promise<{ result: core.OperationResult<void>; cascadeCount: number }> {
  if (!cascade) {
    throw new Error(
      'Cannot delete parent task without cascade. Use cascade=true to delete the task and all its subtasks.'
    );
  }

  const cascadeCount = await getCascadeCount(projectRoot, taskId);
  const result = await core.parent(projectRoot, taskId).del(true);

  return { result, cascadeCount };
}

/**
 * Handler for task_delete method
 */
export async function handleTaskDelete(
  rawParams: unknown
): Promise<McpResponse<TaskDeleteOutput['data']>> {
  try {
    // Validate input
    const params = TaskDeleteInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);
    const projectConfig = loadProjectConfig(projectRoot);

    // Resolve task path to check if it's a parent task
    const taskPath = core.resolveTaskId(params.id, projectRoot, projectConfig, params.parentId);
    if (!taskPath) {
      return createErrorResponse(`Task not found: ${params.id}`, 'Task not found');
    }

    const isParentTask = taskPath.endsWith('_overview.md');
    let result: core.OperationResult<void>;
    let cascadeCount = 0;

    if (isParentTask) {
      const parentDeletion = await deleteParentTask(projectRoot, params.id, params.cascade);
      result = parentDeletion.result;
      cascadeCount = parentDeletion.cascadeCount;
    } else {
      result = await core.del(projectRoot, params.id, projectConfig, params.parentId);
    }

    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to delete task', 'Task deletion failed');
    }

    const outputData = {
      id: params.id,
      deleted: true,
      cascadeCount: cascadeCount > 0 ? cascadeCount : undefined,
    };

    const response = TaskDeleteOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Task ${params.id} deleted successfully`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 'Task deletion failed');
    }
    throw error;
  }
}

// =============================================================================
// Task Move Handler
// =============================================================================

/**
 * Handler for task_move method
 */
export async function handleTaskMove(
  rawParams: unknown
): Promise<McpResponse<TaskMoveOutput['data']>> {
  try {
    // Validate input
    const params = TaskMoveInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    // Load project config
    const projectConfig = loadProjectConfig(projectRoot);

    // Get the task's current state before moving
    const beforeMove = await core.get(projectRoot, params.id, projectConfig, params.parentId);
    if (!beforeMove.success || !beforeMove.data) {
      return createErrorResponse(beforeMove.error || 'Task not found', 'Failed to get task');
    }

    const previousState = beforeMove.data.metadata.location.workflowState;
    const previousStatus = beforeMove.data.document.frontmatter.status;

    // Perform move
    const result = await core.move(
      projectRoot,
      params.id,
      {
        targetState: params.targetState,
        updateStatus: params.updateStatus !== false, // Default true
        archiveDate: params.archiveDate,
      },
      projectConfig,
      params.parentId
    );

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to move task', 'Task move failed');
    }

    // Build response
    const newTask = result.data;
    const currentState = newTask.metadata.location.workflowState;
    const statusUpdated = newTask.document.frontmatter.status !== previousStatus;

    const outputData = {
      id: params.id,
      previousState: previousState,
      currentState: currentState,
      statusUpdated: statusUpdated,
      newStatus: statusUpdated ? newTask.document.frontmatter.status : undefined,
    };

    const response = TaskMoveOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Task ${params.id} moved to ${currentState}`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 'Task move failed');
    }
    throw error;
  }
}

// =============================================================================
// Task Transform Handler (Refactored from complexity 20 to ~10)
// =============================================================================

/**
 * Handle promote operation
 */
async function handlePromoteOperation(
  projectRoot: string,
  taskId: string,
  initialSubtasks?: string[]
): Promise<{ result: core.OperationResult<core.Task | core.ParentTask>; affectedTasks: string[] }> {
  const promoteResult = await core.promoteToParent(projectRoot, taskId, {
    subtasks: initialSubtasks || [],
    keepOriginal: false,
  });

  const affectedTasks =
    promoteResult.success && promoteResult.data ? [promoteResult.data.metadata.id] : [];

  return { result: promoteResult, affectedTasks };
}

/**
 * Handle extract operation
 */
async function handleExtractOperation(
  projectRoot: string,
  taskId: string,
  parentId: string
): Promise<{ result: core.OperationResult<core.Task>; affectedTasks: string[] }> {
  const extractResult = await core.parent(projectRoot, parentId).extractSubtask(
    taskId,
    'backlog' // Default to backlog
  );

  const affectedTasks = extractResult.success ? [parentId] : [];

  return { result: extractResult, affectedTasks };
}

/**
 * Handler for task_transform method
 * Complexity reduced from 20 to ~10
 */
export async function handleTaskTransform(
  rawParams: unknown
): Promise<McpResponse<TaskTransformOutput['data']>> {
  try {
    // Validate input
    const params = TaskTransformInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    let result: core.OperationResult<core.Task | core.ParentTask>;
    let affectedTasks: string[] = [];

    // Handle each operation type
    switch (params.operation) {
      case 'promote': {
        const promoteOp = await handlePromoteOperation(
          projectRoot,
          params.id,
          params.initialSubtasks
        );
        result = promoteOp.result;
        affectedTasks = promoteOp.affectedTasks;
        break;
      }

      case 'extract': {
        if (!params.parentId) {
          return createErrorResponse(
            'parentId required for extract operation',
            'Missing required field for extract operation'
          );
        }
        const extractOp = await handleExtractOperation(projectRoot, params.id, params.parentId);
        result = extractOp.result;
        affectedTasks = extractOp.affectedTasks;
        break;
      }

      case 'adopt': {
        // Note: adoption is currently broken in core
        return createErrorResponse(
          'Task adoption is currently not implemented',
          'This operation is not available at this time'
        );
      }

      default:
        return createErrorResponse(
          `Unknown operation: ${params.operation}`,
          'Invalid transform operation'
        );
    }

    if (!result.success || !result.data) {
      return createErrorResponse(
        result.error || 'Transform operation failed',
        'Task transformation failed'
      );
    }

    // Transform to normalized format
    const normalizedTask = await transformTask(projectRoot, result.data as core.Task, false, true);

    const outputData = {
      operation: params.operation,
      transformedTask: normalizedTask,
      affectedTasks: affectedTasks.length > 0 ? affectedTasks : undefined,
    };

    const response = TaskTransformOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Task ${params.id} transformed successfully`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 'Task transformation failed');
    }
    throw error;
  }
}

// =============================================================================
// Parent Operations Handler (Refactored from complexity 24 to ~10)
// =============================================================================

/**
 * Handle resequence operation
 */
async function handleResequenceOperation(
  projectRoot: string,
  parentId: string,
  sequenceMap: Array<{ id: string; sequence: string }>
): Promise<{
  success: boolean;
  error?: string;
  affectedSubtasks: Array<{ id: string; currentSequence: string; previousSequence?: string }>;
}> {
  const result = await core.parent(projectRoot, parentId).resequence(sequenceMap);

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Resequence operation failed',
      affectedSubtasks: [],
    };
  }

  // Build affected subtasks for response
  const affectedSubtasks = sequenceMap.map((mapping) => ({
    id: mapping.id,
    currentSequence: mapping.sequence,
  }));

  return {
    success: true,
    affectedSubtasks,
  };
}

/**
 * Handle parallelize operation
 */
async function handleParallelizeOperation(
  projectRoot: string,
  parentId: string,
  subtaskIds: string[],
  targetSequence?: string
): Promise<{
  success: boolean;
  error?: string;
  affectedSubtasks: Array<{ id: string; currentSequence: string; previousSequence?: string }>;
}> {
  const result = await core.parent(projectRoot, parentId).parallelize(subtaskIds, targetSequence);

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to parallelize subtasks',
      affectedSubtasks: [],
    };
  }

  // Track affected subtasks
  const affectedSubtasks = subtaskIds.map((id) => ({
    id,
    previousSequence: undefined, // Would need to track
    currentSequence: targetSequence || '01',
  }));

  return {
    success: true,
    affectedSubtasks,
  };
}

/**
 * Handle add subtask operation
 */
async function handleAddSubtaskOperation(
  projectRoot: string,
  parentId: string,
  subtask: { title: string; type?: string; template?: string }
): Promise<{
  success: boolean;
  error?: string;
  newSubtask?: Task;
  affectedSubtasks: Array<{ id: string; currentSequence: string }>;
}> {
  const result = await core.parent(projectRoot, parentId).create(subtask.title, {
    type: subtask.type as core.TaskType,
    // Note: template handling might need to be added to parent builder
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || 'Failed to add subtask',
      affectedSubtasks: [],
    };
  }

  // Transform new subtask to normalized format
  const normalizedSubtask = await transformTask(projectRoot, result.data, false, true);

  const affectedSubtasks = [
    {
      id: result.data.metadata.id,
      currentSequence: result.data.metadata.sequenceNumber || '01',
    },
  ];

  return {
    success: true,
    newSubtask: normalizedSubtask,
    affectedSubtasks,
  };
}

/**
 * Handler for parent_operations method
 * Complexity reduced from 24 to ~10
 */
export async function handleParentOperations(
  rawParams: unknown
): Promise<McpResponse<ParentOperationsOutput['data']>> {
  try {
    // Validate input
    const params = ParentOperationsInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    let affectedSubtasks: Array<{
      id: string;
      currentSequence: string;
      previousSequence?: string;
    }> = [];
    let newSubtask: Task | undefined;

    // Handle each operation type
    switch (params.operationData.operation) {
      case 'resequence': {
        const result = await handleResequenceOperation(
          projectRoot,
          params.parentId,
          params.operationData.sequenceMap
        );
        if (!result.success) {
          return createErrorResponse(
            result.error || 'Unknown error',
            'Resequence operation failed'
          );
        }
        affectedSubtasks = result.affectedSubtasks;
        break;
      }

      case 'parallelize': {
        const result = await handleParallelizeOperation(
          projectRoot,
          params.parentId,
          params.operationData.subtaskIds,
          params.operationData.targetSequence
        );
        if (!result.success) {
          return createErrorResponse(
            result.error || 'Unknown error',
            'Parallelize operation failed'
          );
        }
        affectedSubtasks = result.affectedSubtasks;
        break;
      }

      case 'add_subtask': {
        const result = await handleAddSubtaskOperation(
          projectRoot,
          params.parentId,
          params.operationData.subtask
        );
        if (!result.success) {
          return createErrorResponse(
            result.error || 'Unknown error',
            'Add subtask operation failed'
          );
        }
        affectedSubtasks = result.affectedSubtasks;
        newSubtask = result.newSubtask;
        break;
      }
    }

    // Build response
    const outputData = {
      operation: params.operationData.operation,
      parentId: params.parentId,
      affectedSubtasks,
      newSubtask,
    };

    const response = ParentOperationsOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Parent operation ${params.operationData.operation} completed successfully`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return createErrorResponse(error.message, 'Parent operation failed');
    }
    throw error;
  }
}
