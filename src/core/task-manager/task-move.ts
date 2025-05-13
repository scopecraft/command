import fs from 'fs';
import path from 'path';
import { OperationResult } from '../types.js';
import { getTasksDirectory } from './directory-utils.js';
import { getTask, updateTask } from './task-crud.js';

/**
 * Moves a task to a different subdirectory
 * @param id Task ID to move
 * @param targetSubdirectory Target subdirectory (e.g. "FEATURE_Authentication")
 * @param searchPhase Optional phase to look in
 * @param searchSubdirectory Optional subdirectory to look in
 * @param targetPhase Optional target phase (defaults to current phase)
 * @returns Operation result
 */
export async function moveTask(
  id: string, 
  targetSubdirectory: string,
  searchPhase?: string,
  searchSubdirectory?: string,
  targetPhase?: string
): Promise<OperationResult<void>> {
  try {
    // Get the task
    const taskResult = await getTask(id, searchPhase, searchSubdirectory);

    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || `Task with ID ${id} not found`
      };
    }

    const task = taskResult.data;
    
    // Get the current phase
    const currentPhase = task.metadata.phase;
    
    // Set target phase to current if not specified
    if (!targetPhase) {
      targetPhase = currentPhase;
    }
    
    // Update the task using the task-crud updateTask function
    // This will handle file movement, path updates, etc.
    const updateResult = await updateTask(
      id, 
      {
        phase: targetPhase,
        subdirectory: targetSubdirectory
      },
      searchPhase,
      searchSubdirectory
    );
    
    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || `Failed to move task ${id}`
      };
    }
    
    return {
      success: true,
      message: `Task ${id} moved to ${targetSubdirectory} in phase ${targetPhase}`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error moving task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}