import fs from 'fs';
import path from 'path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import {
  Task,
  TaskMetadata,
  TaskFilterOptions,
  TaskUpdateOptions,
  OperationResult
} from '../types.js';
import { parseTaskFile, formatTaskFile, generateTaskId } from '../task-parser.js';
import { projectConfig } from '../project-config.js';
import { getTasksDirectory, getPhasesDirectory, ensureDirectoryExists, getAllFiles } from './index.js';
import { updateRelationships } from './task-relationships.js';

/**
 * Updated task with debug logging
 * @param id Task id
 * @param updates Updates to apply
 * @param searchPhase Optional phase to search for the task in 
 * @param searchSubdirectory Optional subdirectory to search for the task in
 * @returns Operation result with updated task
 */
export async function updateTaskDebug(
  id: string,
  updates: TaskUpdateOptions,
  searchPhase?: string,
  searchSubdirectory?: string
): Promise<OperationResult<Task>> {
  try {
    console.log('[DEBUG] Starting updateTask');
    console.log('[DEBUG] Updates:', JSON.stringify(updates, null, 2));
    
    // Get the task, using phase and subdirectory if provided
    const taskResult = await getTask(id, searchPhase, searchSubdirectory);
    if (!taskResult.success || !taskResult.data) {
      console.log('[DEBUG] Failed to get task:', taskResult.error);
      return {
        success: false,
        error: taskResult.error || `Task with ID ${id} not found`
      };
    }

    const task = taskResult.data;
    console.log('[DEBUG] Original task metadata:', JSON.stringify(task.metadata, null, 2));
    
    let needsRelationshipUpdate = false;

    // Check if updating phase or subdirectory (requires file move)
    const targetPhase = updates.metadata?.phase || updates.phase;
    const targetSubdirectory = updates.metadata?.subdirectory || updates.subdirectory;
    
    console.log('[DEBUG] Target phase:', targetPhase);
    console.log('[DEBUG] Target subdirectory:', targetSubdirectory);
    
    const needsFileMove = 
      (targetPhase && targetPhase !== task.metadata.phase) || 
      (targetSubdirectory && targetSubdirectory !== task.metadata.subdirectory);
    
    console.log('[DEBUG] Needs file move:', needsFileMove);

    // Update metadata fields from updates.metadata object
    if (updates.metadata) {
      console.log('[DEBUG] Updating from metadata object');
      for (const [key, value] of Object.entries(updates.metadata)) {
        console.log(`[DEBUG] Setting metadata[${key}] = ${value}`);
        if (key === 'parent_task' || key === 'depends' || key === 'next_task' || key === 'previous_task') {
          needsRelationshipUpdate = true;
        }

        // TypeScript trick to allow assignment to specific keys
        (task.metadata as any)[key] = value;
      }
    }
    
    // Update metadata fields from direct properties
    if (updates.status !== undefined) {
      console.log(`[DEBUG] Setting status = ${updates.status}`);
      task.metadata.status = updates.status;
    }
    
    if (updates.phase !== undefined) {
      console.log(`[DEBUG] Setting phase = ${updates.phase}`);
      task.metadata.phase = updates.phase;
    }
    
    if (updates.subdirectory !== undefined) {
      console.log(`[DEBUG] Setting subdirectory = ${updates.subdirectory}`);
      task.metadata.subdirectory = updates.subdirectory;
    }

    // Update content if provided
    if (updates.content !== undefined) {
      console.log('[DEBUG] Updating content');
      task.content = updates.content;
    }

    // Set updated date to today
    const today = new Date();
    task.metadata.updated_date = today.toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`[DEBUG] Setting updated_date = ${task.metadata.updated_date}`);

    // Handle ID change
    if (updates.metadata?.new_id || updates.new_id) {
      const oldId = task.metadata.id;
      task.metadata.id = updates.metadata?.new_id || updates.new_id!;
      console.log(`[DEBUG] Changing ID from ${oldId} to ${task.metadata.id}`);

      // Update relationships for new ID
      needsRelationshipUpdate = true;
    }

    console.log('[DEBUG] Updated task metadata:', JSON.stringify(task.metadata, null, 2));

    // Format task as TOML + Markdown file
    const fileContent = formatTaskFile(task);
    console.log('[DEBUG] Generated file content:', fileContent.length, 'characters');

    if (needsFileMove) {
      // Determine old and new file paths
      const oldFilePath = task.filePath;
      const newFilePath = projectConfig.getTaskFilePath(
        task.metadata.id,
        targetPhase || task.metadata.phase,
        targetSubdirectory || task.metadata.subdirectory
      );
      
      console.log('[DEBUG] Old file path:', oldFilePath);
      console.log('[DEBUG] New file path:', newFilePath);

      // Create target directory if needed
      const targetDir = path.dirname(newFilePath);
      if (!fs.existsSync(targetDir)) {
        console.log('[DEBUG] Creating target directory:', targetDir);
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Write to new location
      console.log('[DEBUG] Writing to new location');
      fs.writeFileSync(newFilePath, fileContent);

      // Delete original file
      console.log('[DEBUG] Deleting original file');
      fs.unlinkSync(oldFilePath);

      // Update file path
      task.filePath = newFilePath;
      console.log('[DEBUG] Updated file path:', task.filePath);
    } else {
      // No file move needed, just update in place
      console.log('[DEBUG] Updating file in place:', task.filePath);
      fs.writeFileSync(task.filePath, fileContent);
    }

    // Update relationships if needed
    if (needsRelationshipUpdate) {
      console.log('[DEBUG] Updating relationships');
      await updateRelationships(task);
    }

    console.log('[DEBUG] Update task completed successfully');
    return { 
      success: true, 
      data: task,
      message: `Task ${id} updated successfully` 
    };
  } catch (error) {
    console.log('[DEBUG] Error updating task:', error);
    return {
      success: false,
      error: `Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Import the original function for other operations
import { getTask } from './task-crud.js';