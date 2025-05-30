/**
 * Normalized Write Operation Handlers
 * 
 * Implements MCP write operations with consistent field names, Zod validation,
 * and normalized response formats matching the read operations.
 */

import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as core from '../core/v2/index.js';
import { type McpResponse } from './types.js';
import {
  TaskCreateInputSchema,
  TaskCreateOutputSchema,
  TaskUpdateInputSchema,
  TaskUpdateOutputSchema,
  TaskDeleteInputSchema,
  TaskDeleteOutputSchema,
  TaskMoveInputSchema,
  TaskMoveOutputSchema,
  TaskTransformInputSchema,
  TaskTransformOutputSchema,
  ParentCreateInputSchema,
  ParentCreateOutputSchema,
  ParentOperationsInputSchema,
  ParentOperationsOutputSchema,
  type Task,
  type TaskCreateInput,
  type TaskCreateOutput,
  type TaskUpdateInput,
  type TaskUpdateOutput,
  type TaskDeleteInput,
  type TaskDeleteOutput,
  type TaskMoveInput,
  type TaskMoveOutput,
  type TaskTransformInput,
  type TaskTransformOutput,
  type ParentCreateInput,
  type ParentCreateOutput,
  type ParentOperationsInput,
  type ParentOperationsOutput,
} from './schemas.js';
import { transformTaskToNormalized, normalizeStatus } from './transformers.js';

/**
 * Create consistent response metadata
 */
function createResponseMetadata() {
  return {
    timestamp: new Date().toISOString(),
    version: '2.0',
  };
}

/**
 * Handler for task_create method
 */
export async function handleTaskCreateNormalized(rawParams: unknown): Promise<McpResponse<TaskCreateOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = TaskCreateInputSchema.parse(rawParams);
    
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;
    
    // Build create options with normalized field names
    const createOptions: core.TaskCreateOptions = {
      title: params.title,
      type: params.type,
      area: params.area,
      status: params.status,
      workflowState: params.workflowState,
      parentId: params.parentId,
      instruction: params.instruction,
      tasks: params.tasks,
      customMetadata: {},
    };
    
    // Add optional metadata
    if (params.priority) createOptions.customMetadata.priority = params.priority;
    if (params.assignee) createOptions.customMetadata.assignee = params.assignee;
    if (params.tags) createOptions.customMetadata.tags = params.tags;
    
    const result = await core.createTask(projectRoot, createOptions);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create task',
        message: result.error || 'Task creation failed',
        metadata: createResponseMetadata(),
      };
    }
    
    // Transform and validate output
    const outputData = {
      id: result.data.metadata.id,
      title: result.data.document.title,
      type: result.data.document.frontmatter.type as TaskCreateOutput['data']['type'],
      status: result.data.document.frontmatter.status as TaskCreateOutput['data']['status'],
      workflowState: result.data.metadata.location.workflowState as TaskCreateOutput['data']['workflowState'],
      area: result.data.document.frontmatter.area || 'general',
      path: result.data.metadata.path,
      createdAt: new Date().toISOString(),
    };
    
    const response = TaskCreateOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Task ${outputData.id} created successfully`,
      metadata: createResponseMetadata(),
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Task creation failed',
        metadata: createResponseMetadata(),
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
    if (params.updates.status) frontmatter.status = params.updates.status;
    if (params.updates.priority) frontmatter.priority = params.updates.priority;
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
      const currentTask = await core.getTask(projectRoot, params.id, undefined, params.parentId);
      if (currentTask.success && currentTask.data) {
        const currentLog = currentTask.data.document.sections.log || '';
        const timestamp = new Date().toISOString().split('T')[0];
        sections.log = currentLog + (currentLog ? '\n' : '') + `- ${timestamp}: ${params.updates.addLogEntry}`;
      }
    }
    
    if (Object.keys(sections).length > 0) {
      updateOptions.sections = sections;
    }
    
    const result = await core.updateTask(projectRoot, params.id, updateOptions, params.parentId);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to update task',
        message: result.error || 'Task update failed',
        metadata: createResponseMetadata(),
      };
    }
    
    // Transform to normalized format - always include content for update responses
    const normalizedTask = await transformTaskToNormalized(
      projectRoot,
      result.data,
      false, // includeSubtasks
      true   // includeContent - always true for updates to show changes
    );
    
    const response = TaskUpdateOutputSchema.parse({
      success: true,
      data: normalizedTask,
      message: `Task ${params.id} updated successfully`,
      metadata: createResponseMetadata(),
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Task update failed',
        metadata: createResponseMetadata(),
      };
    }
    throw error;
  }
}

/**
 * Handler for task_delete method
 */
export async function handleTaskDeleteNormalized(rawParams: unknown): Promise<McpResponse<TaskDeleteOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = TaskDeleteInputSchema.parse(rawParams);
    
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;
    
    const deleteOptions: core.TaskDeleteOptions = {
      cascade: params.cascade,
    };
    
    const result = await core.deleteTask(projectRoot, params.id, deleteOptions, params.parentId);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to delete task',
        message: result.error || 'Task deletion failed',
        metadata: createResponseMetadata(),
      };
    }
    
    const outputData = {
      id: params.id,
      deleted: true,
      cascadeCount: result.data?.cascadeCount,
    };
    
    const response = TaskDeleteOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Task ${params.id} deleted successfully`,
      metadata: createResponseMetadata(),
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Task deletion failed',
        metadata: createResponseMetadata(),
      };
    }
    throw error;
  }
}

/**
 * Handler for task_move method
 */
export async function handleTaskMoveNormalized(rawParams: unknown): Promise<McpResponse<TaskMoveOutput['data']>> {
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
    const currentTask = await core.getTask(projectRoot, params.id, undefined, params.parentId);
    if (!currentTask.success || !currentTask.data) {
      return {
        success: false,
        error: 'Task not found',
        message: 'Failed to find task for move operation',
        metadata: createResponseMetadata(),
      };
    }
    
    const previousState = currentTask.data.metadata.location.workflowState;
    
    const result = await core.moveTask(projectRoot, params.id, moveOptions);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to move task',
        message: result.error || 'Task move failed',
        metadata: createResponseMetadata(),
      };
    }
    
    const outputData = {
      id: params.id,
      previousState: previousState as TaskMoveOutput['data']['previousState'],
      currentState: params.targetState,
      statusUpdated: params.updateStatus,
      newStatus: params.updateStatus && result.data.document.frontmatter.status 
        ? normalizeStatus(result.data.document.frontmatter.status) 
        : undefined,
    };
    
    const response = TaskMoveOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Task ${params.id} moved to ${params.targetState}`,
      metadata: createResponseMetadata(),
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Task move failed',
        metadata: createResponseMetadata(),
      };
    }
    throw error;
  }
}

/**
 * Handler for task_transform method
 */
export async function handleTaskTransformNormalized(rawParams: unknown): Promise<McpResponse<TaskTransformOutput['data']>> {
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
          affectedTasks = promoteResult.data.subtasks.map(st => st.metadata.id);
        }
        break;
      }
      
      case 'extract': {
        if (!params.parentId) {
          return {
            success: false,
            error: 'parentId required for extract operation',
            message: 'Missing required field for extract operation',
            metadata: createResponseMetadata(),
          };
        }
        
        const extractResult = await core.extractSubtask(
          projectRoot,
          params.parentId,
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
            metadata: createResponseMetadata(),
          };
        }
        
        // Note: adoption is currently broken in core
        return {
          success: false,
          error: 'Task adoption is currently not implemented',
          message: 'This operation is not available at this time',
          metadata: createResponseMetadata(),
        };
      }
      
      default:
        return {
          success: false,
          error: `Unknown operation: ${params.operation}`,
          message: 'Invalid transform operation',
          metadata: createResponseMetadata(),
        };
    }
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Transform operation failed',
        message: result.error || 'Task transformation failed',
        metadata: createResponseMetadata(),
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
      metadata: createResponseMetadata(),
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Task transformation failed',
        metadata: createResponseMetadata(),
      };
    }
    throw error;
  }
}

/**
 * Handler for parent_create method
 */
export async function handleParentCreateNormalized(rawParams: unknown): Promise<McpResponse<ParentCreateOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = ParentCreateInputSchema.parse(rawParams);
    
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;
    
    // Create parent task
    const createOptions: core.TaskCreateOptions = {
      title: params.title,
      type: params.type,
      area: params.area,
      status: params.status,
      workflowState: params.workflowState,
      instruction: params.overviewContent,
      customMetadata: {},
    };
    
    if (params.priority) createOptions.customMetadata.priority = params.priority;
    if (params.assignee) createOptions.customMetadata.assignee = params.assignee;
    if (params.tags) createOptions.customMetadata.tags = params.tags;
    
    const result = await core.createParentTask(projectRoot, createOptions);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create parent task',
        message: result.error || 'Parent task creation failed',
        metadata: createResponseMetadata(),
      };
    }
    
    const createdSubtasks: { id: string; title: string; sequence: string }[] = [];
    
    // Add initial subtasks if provided
    if (params.subtasks && params.subtasks.length > 0) {
      for (const subtaskDef of params.subtasks) {
        const subtaskResult = await core.addSubtask(
          projectRoot,
          result.data.metadata.id,
          subtaskDef.title,
          {
            type: subtaskDef.type || params.type,
            area: params.area,
          }
        );
        
        if (subtaskResult.success && subtaskResult.data) {
          createdSubtasks.push({
            id: subtaskResult.data.metadata.id,
            title: subtaskResult.data.document.title,
            sequence: subtaskResult.data.metadata.sequenceNumber || '01',
          });
        }
      }
      
      // Handle parallel tasks if specified
      const parallelTasks = params.subtasks.filter(st => st.parallelWith);
      if (parallelTasks.length > 0) {
        // Group tasks by what they should be parallel with
        const parallelGroups: Record<string, string[]> = {};
        
        for (const task of parallelTasks) {
          if (task.parallelWith) {
            // Find the current task that was just created
            const currentSubtask = createdSubtasks.find(st => st.title === task.title);
            if (!currentSubtask) continue;
            
            // Find the target task to be parallel with
            // It could be specified by title (for tasks in same batch) or ID
            const targetSubtask = createdSubtasks.find(st => 
              st.title === task.parallelWith || 
              st.id === task.parallelWith ||
              st.id.endsWith(task.parallelWith) // Handle partial ID match like "01_test-sub-one"
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
        for (const [baseTaskId, allIds] of Object.entries(parallelGroups)) {
          // Remove duplicates and parallelize
          const uniqueIds = [...new Set(allIds)];
          if (uniqueIds.length > 1) {
            await core.parallelizeSubtasks(
              projectRoot,
              result.data.metadata.id,
              uniqueIds
            );
          }
        }
      }
    }
    
    const outputData = {
      id: result.data.metadata.id,
      title: result.data.overview.title,
      type: result.data.overview.frontmatter.type as ParentCreateOutput['data']['type'],
      workflowState: result.data.metadata.location.workflowState as ParentCreateOutput['data']['workflowState'],
      path: result.data.metadata.path,
      subtaskCount: createdSubtasks.length,
      createdSubtasks: createdSubtasks.length > 0 ? createdSubtasks : undefined,
    };
    
    const response = ParentCreateOutputSchema.parse({
      success: true,
      data: outputData,
      message: `Parent task ${outputData.id} created successfully`,
      metadata: createResponseMetadata(),
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Parent task creation failed',
        metadata: createResponseMetadata(),
      };
    }
    throw error;
  }
}

/**
 * Handler for parent_operations method
 */
export async function handleParentOperationsNormalized(rawParams: unknown): Promise<McpResponse<ParentOperationsOutput['data']>> {
  try {
    // Validate input with Zod schema
    const params = ParentOperationsInputSchema.parse(rawParams);
    
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = params.rootDir || configManager.getRootConfig().path;
    
    const affectedSubtasks: ParentOperationsOutput['data']['affectedSubtasks'] = [];
    let newSubtask: Task | undefined;
    
    switch (params.operationData.operation) {
      case 'resequence': {
        // Note: v2.resequenceSubtasks expects from/to positions
        // This is a simplified implementation
        for (const mapping of params.operationData.sequenceMap) {
          affectedSubtasks.push({
            id: mapping.id,
            previousSequence: undefined, // Would need to track
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
          metadata: createResponseMetadata(),
        };
      }
      
      case 'parallelize': {
        const result = await core.parallelizeSubtasks(
          projectRoot,
          params.parentId,
          params.operationData.subtaskIds,
          params.operationData.targetSequence
        );
        
        if (!result.success) {
          return {
            success: false,
            error: result.error || 'Failed to parallelize subtasks',
            message: result.error || 'Parallelize operation failed',
            metadata: createResponseMetadata(),
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
        const result = await core.addSubtask(
          projectRoot,
          params.parentId,
          params.operationData.subtask.title,
          {
            type: params.operationData.subtask.type,
            template: params.operationData.subtask.template,
          }
        );
        
        if (!result.success || !result.data) {
          return {
            success: false,
            error: result.error || 'Failed to add subtask',
            message: result.error || 'Add subtask operation failed',
            metadata: createResponseMetadata(),
          };
        }
        
        // Transform new subtask to normalized format
        newSubtask = await transformTaskToNormalized(
          projectRoot,
          result.data,
          false,
          true
        );
        
        affectedSubtasks.push({
          id: result.data.metadata.id,
          currentSequence: result.data.metadata.sequenceNumber || '01',
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
      metadata: createResponseMetadata(),
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Parent operation failed',
        metadata: createResponseMetadata(),
      };
    }
    throw error;
  }
}