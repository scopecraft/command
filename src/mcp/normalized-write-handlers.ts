/**
 * Normalized Write Operation Handlers
 *
 * Implements MCP write operations with consistent field names, Zod validation,
 * and normalized response formats matching the read operations.
 */

import { ConfigurationManager } from '../core/config/configuration-manager.js';
import {
  normalizePriority,
  normalizeTaskStatus,
  normalizeTaskType,
  normalizeWorkflowState,
} from '../core/field-normalizers.js';
import * as core from '../core/index.js';
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
  type TaskUpdateOutput,
  TaskUpdateOutputSchema,
} from './schemas.js';
import { transformTaskToNormalized } from './transformers.js';
import type { McpResponse } from './types.js';

/**
 * Handler for task_create method
 */
export async function handleTaskCreateNormalized(
  rawParams: unknown
): Promise<McpResponse<TaskCreateOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = TaskCreateInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    // Check if this should be a subtask
    if (params.parentId) {
      // Create subtask using parent builder
      const result = await core.parent(projectRoot, params.parentId).create(params.title, {
        type: normalizeTaskType(params.type) as core.TaskType,
        area: params.area,
        status: normalizeTaskStatus(params.status) as core.TaskStatus,
        tags: params.tags,
        customMetadata: params.assignee ? { assignee: params.assignee } : undefined,
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to create subtask',
          message: result.error || 'Subtask creation failed',
        };
      }

      // Transform and validate output
      const data = result.data;
      const outputData = {
        id: data.metadata.id,
        title: data.document.title,
        type: data.document.frontmatter.type,
        status: normalizeTaskStatus(data.document.frontmatter.status),
        workflowState: data.metadata.location.workflowState,
        area: data.document.frontmatter.area || 'general',
        path: data.metadata.path,
        createdAt: new Date().toISOString(),
      };

      const response = TaskCreateOutputSchema.parse({
        success: true,
        data: outputData,
        message: `Subtask ${outputData.id} created successfully`,
      });

      return response;
    }

    // Build create options with normalized field names
    const createOptions: core.TaskCreateOptions = {
      title: params.title,
      type: normalizeTaskType(params.type) as core.TaskType,
      area: params.area || 'general',
      status: normalizeTaskStatus(params.status || 'todo') as core.TaskStatus,
      workflowState: normalizeWorkflowState(params.workflowState) as core.WorkflowState,
      instruction: params.instruction,
      tasks: params.tasks ? core.parseTasksSection(params.tasks).map((t) => t.text) : undefined,
      customMetadata: {},
    };

    // Add optional metadata
    if (params.priority && createOptions.customMetadata) {
      createOptions.customMetadata.priority = params.priority; // Pass directly - core will normalize
    }
    if (params.assignee && createOptions.customMetadata) {
      createOptions.customMetadata.assignee = params.assignee;
    }
    if (params.tags) createOptions.tags = params.tags;

    const result = await core.create(projectRoot, createOptions);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create task',
        message: result.error || 'Task creation failed',
      };
    }

    // Transform and validate output
    const data = result.data;
    const outputData = {
      id: data.metadata.id,
      title: data.document.title,
      type: data.document.frontmatter.type,
      status: normalizeTaskStatus(data.document.frontmatter.status),
      priority: normalizePriority(data.document.frontmatter.priority),
      workflowState: data.metadata.location.workflowState,
      area: data.document.frontmatter.area || 'general',
      path: data.metadata.path,
      createdAt: new Date().toISOString(),
    };

    const response = TaskCreateOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Task ${outputData.id} created successfully`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Task creation failed',
      };
    }
    throw error;
  }
}

/**
 * Handler for task_update method
 */
export async function handleTaskUpdateNormalized(rawParams: unknown): Promise<McpResponse<Task>> {
  try {
    // Validate input with Zod schema
    const params = TaskUpdateInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    // Build update options
    const updateOptions: core.TaskUpdateOptions = {};

    // Handle metadata updates
    if (params.updates.title) updateOptions.title = params.updates.title;

    const frontmatter: Partial<core.TaskFrontmatter> = {};
    if (params.updates.status) frontmatter.status = params.updates.status as core.TaskStatus; // Pass directly - core will normalize
    if (params.updates.priority)
      frontmatter.priority = params.updates.priority as core.TaskPriority; // Pass directly - core will normalize
    if (params.updates.area) frontmatter.area = params.updates.area;
    if (params.updates.assignee) frontmatter.assignee = params.updates.assignee;
    if (params.updates.tags) frontmatter.tags = params.updates.tags;

    if (Object.keys(frontmatter).length > 0) {
      updateOptions.frontmatter = frontmatter;
    }

    // Handle section updates
    const sections: Partial<core.TaskSections> = {};
    if (params.updates.instruction) sections.instruction = params.updates.instruction;
    if (params.updates.tasks) sections.tasks = params.updates.tasks;
    if (params.updates.deliverable) sections.deliverable = params.updates.deliverable;
    if (params.updates.log) sections.log = params.updates.log;

    // Handle special log entry appending
    if (params.updates.addLogEntry) {
      const currentTask = await core.get(projectRoot, params.id, undefined, params.parentId);
      if (currentTask.success && currentTask.data) {
        const currentLog = currentTask.data.document.sections.log || '';
        const timestamp = new Date().toISOString().split('T')[0];
        sections.log = `${currentLog}${currentLog ? '\n' : ''}- ${timestamp}: ${params.updates.addLogEntry}`;
      }
    }

    if (Object.keys(sections).length > 0) {
      updateOptions.sections = sections;
    }

    const result = await core.update(
      projectRoot,
      params.id,
      updateOptions,
      undefined,
      params.parentId
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to update task',
        message: result.error || 'Task update failed',
      };
    }

    // Transform to normalized format - always include content for update responses
    const normalizedTask = await transformTaskToNormalized(
      projectRoot,
      result.data,
      false, // includeSubtasks
      true // includeContent - always true for updates to show changes
    );

    const response = TaskUpdateOutputSchema.parse({
      success: true,
      data: normalizedTask,
      message: `Task ${params.id} updated successfully`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Task update failed',
      };
    }
    throw error;
  }
}

/**
 * Handler for task_delete method
 */
export async function handleTaskDeleteNormalized(
  rawParams: unknown
): Promise<McpResponse<TaskDeleteOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = TaskDeleteInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    let result: core.OperationResult<void>;
    const cascadeCount = 0;

    // Check if this is a parent task with cascade
    if (params.cascade) {
      // Try to delete as parent task with cascade
      const parentDel = await core.parent(projectRoot, params.id).del(true);
      if (parentDel.success) {
        result = parentDel;
        // TODO: Get cascade count from parent deletion
      } else {
        // Not a parent task, just delete normally
        result = await core.del(projectRoot, params.id, undefined, params.parentId);
      }
    } else {
      // Normal delete
      result = await core.del(projectRoot, params.id, undefined, params.parentId);
    }

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to delete task',
        message: result.error || 'Task deletion failed',
      };
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
      return {
        success: false,
        error: error.message,
        message: 'Task deletion failed',
      };
    }
    throw error;
  }
}

/**
 * Handler for task_move method
 */
export async function handleTaskMoveNormalized(
  rawParams: unknown
): Promise<McpResponse<TaskMoveOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = TaskMoveInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    const moveOptions: core.TaskMoveOptions = {
      targetState: params.targetState,
      updateStatus: params.updateStatus,
      archiveDate: params.archiveDate,
    };

    // Get current state before move
    const currentTask = await core.get(projectRoot, params.id, undefined, params.parentId);
    if (!currentTask.success || !currentTask.data) {
      return {
        success: false,
        error: 'Task not found',
        message: 'Failed to find task for move operation',
      };
    }

    const previousState = currentTask.data.metadata.location.workflowState;

    const result = await core.move(projectRoot, params.id, moveOptions);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to move task',
        message: result.error || 'Task move failed',
      };
    }

    const data = result.data;
    const outputData = {
      id: params.id,
      previousState: previousState,
      currentState: params.targetState,
      statusUpdated: params.updateStatus,
      newStatus:
        params.updateStatus && data.document.frontmatter.status
          ? normalizeTaskStatus(data.document.frontmatter.status)
          : undefined,
    };

    const response = TaskMoveOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Task ${params.id} moved to ${params.targetState}`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Task move failed',
      };
    }
    throw error;
  }
}

/**
 * Handler for task_transform method
 */
export async function handleTaskTransformNormalized(
  rawParams: unknown
): Promise<McpResponse<TaskTransformOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = TaskTransformInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    let result: core.OperationResult<core.Task | core.ParentTask>;
    let affectedTasks: string[] = [];

    switch (params.operation) {
      case 'promote': {
        const promoteResult = await core.promoteToParent(projectRoot, params.id, {
          subtasks: params.initialSubtasks || [],
          keepOriginal: false,
        });
        result = promoteResult;
        if (promoteResult.success && promoteResult.data) {
          // The promoted task is now a parent, but subtasks aren't populated in the response
          // If initial subtasks were created, they would be in the parent folder
          // For now, just return the parent task ID as affected
          affectedTasks = [promoteResult.data.metadata.id];
        }
        break;
      }

      case 'extract': {
        if (!params.parentId) {
          return {
            success: false,
            error: 'parentId required for extract operation',
            message: 'Missing required field for extract operation',
          };
        }

        const extractResult = await core.parent(projectRoot, params.parentId).extractSubtask(
          params.id,
          'backlog' // Default to backlog
        );
        result = extractResult;
        if (extractResult.success) {
          affectedTasks = [params.parentId]; // Parent is affected
        }
        break;
      }

      case 'adopt': {
        if (!params.targetParentId) {
          return {
            success: false,
            error: 'targetParentId required for adopt operation',
            message: 'Missing required field for adopt operation',
          };
        }

        // Note: adoption is currently broken in core
        return {
          success: false,
          error: 'Task adoption is currently not implemented',
          message: 'This operation is not available at this time',
        };
      }

      default:
        return {
          success: false,
          error: `Unknown operation: ${params.operation}`,
          message: 'Invalid transform operation',
        };
    }

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Transform operation failed',
        message: result.error || 'Task transformation failed',
      };
    }

    // Transform the task to normalized format
    const normalizedTask = await transformTaskToNormalized(
      projectRoot,
      result.data as core.Task,
      false,
      true
    );

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
      return {
        success: false,
        error: error.message,
        message: 'Task transformation failed',
      };
    }
    throw error;
  }
}

/**
 * Handler for parent_create method
 */
export async function handleParentCreateNormalized(
  rawParams: unknown
): Promise<McpResponse<ParentCreateOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = ParentCreateInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    // Create parent task
    const createOptions: core.TaskCreateOptions = {
      title: params.title,
      type: params.type,
      area: params.area || 'general',
      status: params.status || 'To Do', // Pass directly - core will normalize
      workflowState: params.workflowState,
      instruction: params.overviewContent,
      customMetadata: {},
    };

    if (params.priority && createOptions.customMetadata) {
      createOptions.customMetadata.priority = params.priority; // Pass directly - core will normalize
    }
    if (params.assignee && createOptions.customMetadata) {
      createOptions.customMetadata.assignee = params.assignee;
    }
    if (params.tags) createOptions.tags = params.tags;

    const result = await core.createParent(projectRoot, createOptions);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create parent task',
        message: result.error || 'Parent task creation failed',
      };
    }

    const data = result.data;
    const createdSubtasks: { id: string; title: string; sequence: string }[] = [];

    // Add initial subtasks if provided
    if (params.subtasks && params.subtasks.length > 0) {
      for (const subtaskDef of params.subtasks) {
        const subtaskResult = await core
          .parent(projectRoot, data.metadata.id)
          .create(subtaskDef.title, {
            type: subtaskDef.type || params.type,
            area: params.area,
          });

        if (subtaskResult.success && subtaskResult.data) {
          createdSubtasks.push({
            id: subtaskResult.data.metadata.id,
            title: subtaskResult.data.document.title,
            sequence: subtaskResult.data.metadata.sequenceNumber || '01',
          });
        }
      }

      // Handle parallel tasks if specified
      const parallelTasks = params.subtasks.filter((st) => st.parallelWith);
      if (parallelTasks.length > 0) {
        // Group tasks by what they should be parallel with
        const parallelGroups: Record<string, string[]> = {};

        for (const task of parallelTasks) {
          if (task.parallelWith) {
            // Find the current task that was just created
            const currentSubtask = createdSubtasks.find((st) => st.title === task.title);
            if (!currentSubtask) continue;

            // Find the target task to be parallel with
            // It could be specified by title (for tasks in same batch) or ID
            const targetSubtask = createdSubtasks.find(
              (st) =>
                st.title === task.parallelWith ||
                st.id === task.parallelWith ||
                (task.parallelWith && st.id.endsWith(task.parallelWith)) // Handle partial ID match like "01_test-sub-one"
            );

            if (targetSubtask) {
              // Group tasks that should share the same sequence number
              const groupKey = targetSubtask.id;
              if (!parallelGroups[groupKey]) {
                parallelGroups[groupKey] = [targetSubtask.id];
              }
              parallelGroups[groupKey].push(currentSubtask.id);
            }
          }
        }

        // Parallelize each group
        for (const [_baseTaskId, allIds] of Object.entries(parallelGroups)) {
          // Remove duplicates and parallelize
          const uniqueIds = [...new Set(allIds)];
          if (uniqueIds.length > 1) {
            await core.parent(projectRoot, data.metadata.id).parallelize(uniqueIds);
          }
        }
      }
    }

    const parentData = data;
    const outputData = {
      id: parentData.metadata.id,
      title: parentData.overview.title,
      type: parentData.overview.frontmatter.type,
      workflowState: parentData.metadata.location.workflowState,
      path: parentData.metadata.path,
      subtaskCount: createdSubtasks.length,
      createdSubtasks: createdSubtasks.length > 0 ? createdSubtasks : undefined,
    };

    const response = ParentCreateOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Parent task ${outputData.id} created successfully`,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Parent task creation failed',
      };
    }
    throw error;
  }
}

/**
 * Handler for parent_operations method
 */
export async function handleParentOperationsNormalized(
  rawParams: unknown
): Promise<McpResponse<ParentOperationsOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = ParentOperationsInputSchema.parse(rawParams);

    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;

    const affectedSubtasks: Array<{
      id: string;
      currentSequence: string;
      previousSequence?: string;
    }> = [];
    let newSubtask: Task | undefined;

    switch (params.operationData.operation) {
      case 'resequence': {
        // Call the resequence method with the sequence map
        const result = await core
          .parent(projectRoot, params.parentId)
          .resequence(params.operationData.sequenceMap);

        if (!result.success) {
          return {
            success: false,
            error: result.error || 'Resequence operation failed',
            message: result.error || 'Failed to resequence subtasks',
          };
        }

        // Build affected subtasks for response
        for (const mapping of params.operationData.sequenceMap) {
          affectedSubtasks.push({
            id: mapping.id,
            currentSequence: mapping.sequence,
          });
        }

        return {
          success: true,
          data: {
            operation: 'resequence',
            parentId: params.parentId,
            affectedSubtasks,
            newSubtask: undefined,
          },
          message: 'Resequence operation completed',
        };
      }

      case 'parallelize': {
        const result = await core
          .parent(projectRoot, params.parentId)
          .parallelize(params.operationData.subtaskIds, params.operationData.targetSequence);

        if (!result.success) {
          return {
            success: false,
            error: result.error || 'Failed to parallelize subtasks',
            message: result.error || 'Parallelize operation failed',
          };
        }

        // Track affected subtasks
        for (const id of params.operationData.subtaskIds) {
          affectedSubtasks.push({
            id,
            previousSequence: undefined, // Would need to track
            currentSequence: params.operationData.targetSequence || '01',
          });
        }

        break;
      }

      case 'add_subtask': {
        const result = await core
          .parent(projectRoot, params.parentId)
          .create(params.operationData.subtask.title, {
            type: params.operationData.subtask.type,
            // Note: template handling might need to be added to parent builder
          });

        if (!result.success || !result.data) {
          return {
            success: false,
            error: result.error || 'Failed to add subtask',
            message: result.error || 'Add subtask operation failed',
          };
        }

        // Transform new subtask to normalized format
        const subtaskData = result.data;
        newSubtask = await transformTaskToNormalized(projectRoot, subtaskData, false, true);

        affectedSubtasks.push({
          id: subtaskData.metadata.id,
          currentSequence: subtaskData.metadata.sequenceNumber || '01',
        });

        break;
      }
    }

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
      return {
        success: false,
        error: error.message,
        message: 'Parent operation failed',
      };
    }
    throw error;
  }
}
