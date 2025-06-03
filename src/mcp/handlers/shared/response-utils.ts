/**
 * Shared response utilities for MCP handlers
 * Provides consistent response formatting across all handlers
 */

import type * as core from '../../../core/index.js';
import type { Task } from '../../schemas.js';
import { transformTask } from '../../transformers.js';
import type { McpResponse } from '../../types.js';

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T, message: string): McpResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse<T>(error: string, message?: string): McpResponse<T> {
  return {
    success: false,
    error,
    message: message || 'Operation failed',
  };
}

/**
 * Create a task response with normalized data
 * Used by create, update, and transform operations
 */
export async function createTaskResponse<T>(
  projectRoot: string,
  task: core.Task,
  message: string,
  includeContent = true
): Promise<McpResponse<T>> {
  try {
    const normalizedTask = await transformTask(
      projectRoot,
      task,
      includeContent,
      false // Never include subtasks in single task responses
    );

    return {
      success: true,
      data: normalizedTask as unknown as T,
      message,
    };
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to transform task',
      'Task transformation failed'
    );
  }
}

/**
 * Transform and return multiple tasks
 * Used by list operations
 */
export async function batchTransformTasks(
  projectRoot: string,
  tasks: core.Task[],
  includeContent = false
): Promise<Task[]> {
  const transformedTasks: Task[] = [];

  for (const task of tasks) {
    try {
      const normalizedTask = await transformTask(
        projectRoot,
        task,
        includeContent,
        false // Never include subtasks in list operations
      );
      transformedTasks.push(normalizedTask);
    } catch (error) {
      console.error(`Failed to transform task ${task.metadata.id}:`, error);
      // Continue with other tasks
    }
  }

  return transformedTasks;
}
