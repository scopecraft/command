import fs from 'node:fs';
import path from 'node:path';
import type { RuntimeConfig } from '../config/types.js';
import type { OperationResult } from '../types.js';
import { getTasksDirectory } from './directory-utils.js';
import { getTask, updateTask } from './task-crud.js';

/**
 * Moves a task to a different subdirectory
 * @param id Task ID to move
 * @param options Movement options
 * @param options.targetSubdirectory Target subdirectory (e.g. "FEATURE_Authentication")
 * @param options.targetPhase Optional target phase (defaults to current phase)
 * @param options.searchPhase Optional phase to look in
 * @param options.searchSubdirectory Optional subdirectory to look in
 * @returns Operation result
 */
export async function moveTask(
  id: string,
  options: {
    targetSubdirectory: string;
    targetPhase?: string;
    searchPhase?: string;
    searchSubdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<void>> {
  try {
    // Get the task
    const taskResult = await getTask(id, {
      phase: options.searchPhase,
      subdirectory: options.searchSubdirectory,
      config: options.config,
    });

    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || `Task with ID ${id} not found`,
      };
    }

    const task = taskResult.data;

    // Get the current phase
    const currentPhase = task.metadata.phase;

    // Set target phase to current if not specified
    const targetPhase = options.targetPhase || currentPhase;

    // Update the task using the task-crud updateTask function
    // This will handle file movement, path updates, etc.
    const updateResult = await updateTask(
      id,
      {
        phase: targetPhase,
        subdirectory: options.targetSubdirectory,
      },
      {
        phase: options.searchPhase,
        subdirectory: options.searchSubdirectory,
        config: options.config,
      }
    );

    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || `Failed to move task ${id}`,
      };
    }

    return {
      success: true,
      message: `Task ${id} moved to ${options.targetSubdirectory} in phase ${targetPhase}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error moving task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
