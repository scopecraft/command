/**
 * Core task management functionality
 * Handles all CRUD operations for tasks, features, and areas
 */
import fs from 'fs';
import { 
  getTasksDirectory, 
  getPhasesDirectory, 
  ensureDirectoryExists, 
  getAllFiles,
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateRelationships,
  findNextTask,
  listPhases,
  createPhase,
  updatePhase,
  deletePhase
} from './task-manager/index.js';
import path from 'path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import {
  Task,
  TaskMetadata,
  TaskFilterOptions,
  TaskUpdateOptions,
  OperationResult,
  Phase,
  Feature,
  Area,
  FeatureFilterOptions,
  AreaFilterOptions,
  FeatureUpdateOptions,
  AreaUpdateOptions
} from './types.js';
import { parseTaskFile, formatTaskFile, generateTaskId } from './task-parser.js';
import { projectConfig } from './project-config.js';

// Re-export utilities from the task-manager module
export { getTasksDirectory, getPhasesDirectory, ensureDirectoryExists };

// Re-export task CRUD operations from the task-manager module
export { listTasks, getTask, createTask, updateTask, deleteTask, updateRelationships };

// Re-export phase CRUD operations from the task-manager module
export { listPhases, createPhase, updatePhase, deletePhase };

// Re-export workflow operations from the task-manager module
export { findNextTask };

// Re-export feature CRUD operations from the task-manager module
export { 
  listFeatures, 
  getFeature, 
  createFeature, 
  updateFeature, 
  deleteFeature 
};

// Re-export area CRUD operations from the task-manager module
export { 
  listAreas, 
  getArea, 
  createArea, 
  updateArea, 
  deleteArea 
};

// Re-export task movement operations from the task-manager module
export { moveTask };

/**
 * @deprecated Moved to task-manager/task-crud.js
 */
/*
async function listTasks(options: TaskFilterOptions = {}): Promise<OperationResult<Task[]>> {
  try {
    const tasksDir = getTasksDirectory();

    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`
      };
    }

    const filePaths = getAllFiles(tasksDir);
    const tasks: Task[] = [];
    const errors: string[] = [];

    for (const filePath of filePaths) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const task = parseTaskFile(content);
        task.filePath = filePath;

        // Extract phase and subdirectory from file path if not in metadata
        const pathInfo = projectConfig.parseTaskPath(filePath);
        if (pathInfo.phase && !task.metadata.phase) {
          task.metadata.phase = pathInfo.phase;
        }
        if (pathInfo.subdirectory && !task.metadata.subdirectory) {
          task.metadata.subdirectory = pathInfo.subdirectory;
        }

        // Handle _overview.md files
        if (path.basename(filePath) === '_overview.md' && !task.metadata.is_overview) {
          task.metadata.is_overview = true;
        }

        // Apply filters
        if (options.status && task.metadata.status !== options.status) continue;
        if (options.type && task.metadata.type !== options.type) continue;
        if (options.assignee && task.metadata.assigned_to !== options.assignee) continue;
        if (options.phase && task.metadata.phase !== options.phase) continue;
        if (options.subdirectory && task.metadata.subdirectory !== options.subdirectory) continue;
        if (options.is_overview !== undefined && task.metadata.is_overview !== options.is_overview) continue;

        // Filter out completed tasks by default, UNLESS explicitly requested to include them
        if (options.include_completed !== true) {
          const status = task.metadata.status || '';
          if (status.includes('Done') ||
              status.includes('🟢') ||
              status.includes('Completed') ||
              status.includes('Complete')) {
            continue;
          }
        }

        // Filter by tags if provided
        if (options.tags && options.tags.length > 0) {
          const taskTags = task.metadata.tags || [];
          if (!options.tags.some(tag => taskTags.includes(tag))) continue;
        }

        tasks.push(task);
      } catch (error) {
        errors.push(`Skipping file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Remove content from tasks by default to reduce payload size, UNLESS explicitly requested to include it
    if (options.include_content !== true) {
      const compactTasks = tasks.map(task => ({
        metadata: task.metadata,
        filePath: task.filePath,
        content: '' // Empty string instead of undefined to maintain the Task interface structure
      }));

      return {
        success: true,
        data: compactTasks,
        message: errors.length > 0
          ? `Listed ${compactTasks.length} tasks with ${errors.length} errors (content excluded)`
          : `Listed ${compactTasks.length} tasks (content excluded)`
      };
    }

    return {
      success: true,
      data: tasks,
      message: errors.length > 0 ? `Listed ${tasks.length} tasks with ${errors.length} errors` : `Listed ${tasks.length} tasks`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error listing tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/task-crud.js
 */
/*
async function getTask(id: string, phase?: string, subdirectory?: string): Promise<OperationResult<Task>> {
  try {
    // If phase and subdirectory are provided, try direct path lookup first
    if (phase && subdirectory) {
      const filePath = projectConfig.getTaskFilePath(id, phase, subdirectory);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const task = parseTaskFile(content);
        task.filePath = filePath;
        // Ensure phase and subdirectory are set in metadata
        task.metadata.phase = phase;
        task.metadata.subdirectory = subdirectory;
        return {
          success: true,
          data: task,
          message: `Task ${id} found`
        };
      }
    }

    // If only phase is provided, try that path
    if (phase) {
      const filePath = projectConfig.getTaskFilePath(id, phase);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const task = parseTaskFile(content);
        task.filePath = filePath;
        // Ensure phase is set in metadata
        task.metadata.phase = phase;
        return {
          success: true,
          data: task,
          message: `Task ${id} found`
        };
      }
    }

    const tasksDir = getTasksDirectory();

    // Try direct file lookup in the root directory
    const filePath = path.join(tasksDir, `${id}.md`);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const task = parseTaskFile(content);
      task.filePath = filePath;
      return {
        success: true,
        data: task,
        message: `Task ${id} found`
      };
    }

    // If not found anywhere specific, search in all directories
    // Include completed tasks and content to ensure we find all tasks with full content
    const result = await listTasks({
      include_completed: true,
      include_content: true
    });
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to list tasks'
      };
    }

    const task = result.data.find(t => t.metadata.id === id);

    if (!task) {
      return {
        success: false,
        error: `Task with ID ${id} not found`
      };
    }

    // If we found the task, check if it has a file path
    if (task.filePath) {
      // Parse the file path to extract phase and subdirectory info
      const pathInfo = projectConfig.parseTaskPath(task.filePath);
      if (pathInfo.phase && !task.metadata.phase) {
        task.metadata.phase = pathInfo.phase;
      }
      if (pathInfo.subdirectory && !task.metadata.subdirectory) {
        task.metadata.subdirectory = pathInfo.subdirectory;
      }
    }

    return {
      success: true,
      data: task,
      message: `Task ${id} found`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/task-crud.js
 */
/*
async function createTask(task: Task, subdirectory?: string): Promise<OperationResult<Task>> {
  try {
    const tasksDir = getTasksDirectory();

    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }

    // Store subdirectory in task metadata if provided
    if (subdirectory) {
      if (!task.metadata.subdirectory) {
        task.metadata.subdirectory = subdirectory;
      }
    }

    // Use project config to handle directory creation and path resolution
    const targetDir = projectConfig.ensureTaskDirectory(task.metadata.phase, subdirectory);
    const filePath = path.join(targetDir, `${task.metadata.id}.md`);

    if (fs.existsSync(filePath)) {
      return {
        success: false,
        error: `Task with ID ${task.metadata.id} already exists`
      };
    }

    // Set created and updated dates if not provided
    if (!task.metadata.created_date) {
      const now = new Date().toISOString().split('T')[0];
      task.metadata.created_date = now;
      task.metadata.updated_date = now;
    }

    const fileContent = formatTaskFile(task);
    fs.writeFileSync(filePath, fileContent);

    // Add file path to task
    task.filePath = filePath;

    // Handle special treatment for _overview.md files
    if (task.metadata.id.toLowerCase() === '_overview' ||
        task.metadata.id.toLowerCase().endsWith('/_overview') ||
        path.basename(filePath) === '_overview.md') {
      task.metadata.is_overview = true;
    }

    // Update relationship with parent/depends_on/next_task if specified
    const relationshipResult = await updateRelationships(task);
    if (!relationshipResult.success) {
      return {
        success: true,
        data: task,
        message: `Task ${task.metadata.id} created successfully, but with relationship warnings: ${relationshipResult.error}`
      };
    }

    return {
      success: true,
      data: task,
      message: `Task ${task.metadata.id} created successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/task-relationships.js
 */
/*
async function updateRelationships(task: Task): Promise<OperationResult<void>> {
  const errors: string[] = [];
  
  // Update parent task if specified
  if (task.metadata.parent_task) {
    try {
      const parentResult = await getTask(task.metadata.parent_task);
      if (parentResult.success && parentResult.data) {
        const parentTask = parentResult.data;
        if (!parentTask.metadata.subtasks) {
          parentTask.metadata.subtasks = [];
        }
        if (!parentTask.metadata.subtasks.includes(task.metadata.id)) {
          parentTask.metadata.subtasks.push(task.metadata.id);
          
          // Update parent task file
          const fileContent = formatTaskFile(parentTask);
          if (parentTask.filePath) {
            fs.writeFileSync(parentTask.filePath, fileContent);
          }
        }
      } else {
        errors.push(`Could not update parent task ${task.metadata.parent_task}: ${parentResult.error}`);
      }
    } catch (error) {
      errors.push(`Could not update parent task ${task.metadata.parent_task}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Update previous task's next_task field if specified
  if (task.metadata.previous_task) {
    try {
      const previousResult = await getTask(task.metadata.previous_task);
      if (previousResult.success && previousResult.data) {
        const previousTask = previousResult.data;
        if (previousTask.metadata.next_task !== task.metadata.id) {
          previousTask.metadata.next_task = task.metadata.id;
          
          // Update previous task file
          const fileContent = formatTaskFile(previousTask);
          if (previousTask.filePath) {
            fs.writeFileSync(previousTask.filePath, fileContent);
          }
        }
      } else {
        errors.push(`Could not update previous task ${task.metadata.previous_task}: ${previousResult.error}`);
      }
    } catch (error) {
      errors.push(`Could not update previous task ${task.metadata.previous_task}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Update next task's previous_task field if specified
  if (task.metadata.next_task) {
    try {
      const nextResult = await getTask(task.metadata.next_task);
      if (nextResult.success && nextResult.data) {
        const nextTask = nextResult.data;
        if (nextTask.metadata.previous_task !== task.metadata.id) {
          nextTask.metadata.previous_task = task.metadata.id;
          
          // Update next task file
          const fileContent = formatTaskFile(nextTask);
          if (nextTask.filePath) {
            fs.writeFileSync(nextTask.filePath, fileContent);
          }
        }
      } else {
        errors.push(`Could not update next task ${task.metadata.next_task}: ${nextResult.error}`);
      }
    } catch (error) {
      errors.push(`Could not update next task ${task.metadata.next_task}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return errors.length > 0 
    ? { success: false, error: errors.join('; ') }
    : { success: true };
}
*/

/**
 * @deprecated Moved to task-manager/task-crud.js
 */
/*
async function updateTask(
  id: string,
  updates: TaskUpdateOptions,
  phase?: string,
  subdirectory?: string
): Promise<OperationResult<Task>> {
  try {
    // Get the task, using phase and subdirectory if provided
    const taskResult = await getTask(id, phase, subdirectory);

    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || `Task with ID ${id} not found`
      };
    }

    const task = taskResult.data;

    if (!task.filePath) {
      return {
        success: false,
        error: `Task file path not found for ID ${id}`
      };
    }

    // Save old values for comparison
    const oldParentTask = task.metadata.parent_task;
    const oldPreviousTask = task.metadata.previous_task;
    const oldNextTask = task.metadata.next_task;
    const oldPhase = task.metadata.phase;
    const oldSubdirectory = task.metadata.subdirectory;

    // Update metadata fields
    if (updates.metadata) {
      task.metadata = {
        ...task.metadata,
        ...updates.metadata,
        // Always update the updated_date
        updated_date: new Date().toISOString().split('T')[0]
      };
    }

    // Update content if provided
    if (updates.content !== undefined) {
      task.content = updates.content;
    }

    // Determine if we need to move the file (phase or subdirectory changed)
    let moveFile = false;
    let targetFilePath = task.filePath;

    // Handling phase changes
    if (updates.metadata?.phase && updates.metadata.phase !== oldPhase) {
      moveFile = true;
    }

    // Handling subdirectory changes
    if (updates.metadata?.subdirectory !== undefined && updates.metadata.subdirectory !== oldSubdirectory) {
      moveFile = true;
    }

    if (moveFile) {
      // Get the new directory path based on phase and subdirectory
      const newPhase = updates.metadata?.phase || oldPhase;
      const newSubdirectory = updates.metadata?.subdirectory || oldSubdirectory;

      // Ensure target directory exists
      const targetDir = projectConfig.ensureTaskDirectory(newPhase, newSubdirectory);

      // Generate new file path
      targetFilePath = path.join(targetDir, path.basename(task.filePath));
    }

    // Generate formatted content
    const fileContent = formatTaskFile(task);

    // Write to the new location first
    fs.writeFileSync(targetFilePath, fileContent);

    // If the file was moved, delete the old one
    if (moveFile && targetFilePath !== task.filePath && targetFilePath !== undefined && task.filePath !== undefined) {
      try {
        fs.unlinkSync(task.filePath);
      } catch (error) {
        return {
          success: true,
          data: task,
          message: `Task ${id} updated but failed to delete old file: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }

    // Set the new file path
    task.filePath = targetFilePath;

    // Update relationships if they changed
    if (
      updates.metadata?.parent_task !== undefined ||
      updates.metadata?.previous_task !== undefined ||
      updates.metadata?.next_task !== undefined
    ) {
      // Clean up old relationships
      const relationshipErrors: string[] = [];

      if (oldParentTask && (updates.metadata?.parent_task === undefined || updates.metadata.parent_task !== oldParentTask)) {
        try {
          const parentResult = await getTask(oldParentTask);
          if (parentResult.success && parentResult.data) {
            const parentTask = parentResult.data;
            if (parentTask.metadata.subtasks && parentTask.metadata.subtasks.includes(id)) {
              parentTask.metadata.subtasks = parentTask.metadata.subtasks.filter(t => t !== id);

              // Update parent task file
              const fileContent = formatTaskFile(parentTask);
              if (parentTask.filePath) {
                fs.writeFileSync(parentTask.filePath, fileContent);
              }
            }
          } else {
            relationshipErrors.push(`Could not update old parent task ${oldParentTask}: ${parentResult.error}`);
          }
        } catch (error) {
          relationshipErrors.push(`Could not update old parent task ${oldParentTask}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (oldPreviousTask && (updates.metadata?.previous_task === undefined || updates.metadata.previous_task !== oldPreviousTask)) {
        try {
          const previousResult = await getTask(oldPreviousTask);
          if (previousResult.success && previousResult.data) {
            const previousTask = previousResult.data;
            if (previousTask.metadata.next_task === id) {
              previousTask.metadata.next_task = undefined;

              // Update previous task file
              const fileContent = formatTaskFile(previousTask);
              if (previousTask.filePath) {
                fs.writeFileSync(previousTask.filePath, fileContent);
              }
            }
          } else {
            relationshipErrors.push(`Could not update old previous task ${oldPreviousTask}: ${previousResult.error}`);
          }
        } catch (error) {
          relationshipErrors.push(`Could not update old previous task ${oldPreviousTask}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (oldNextTask && (updates.metadata?.next_task === undefined || updates.metadata.next_task !== oldNextTask)) {
        try {
          const nextResult = await getTask(oldNextTask);
          if (nextResult.success && nextResult.data) {
            const nextTask = nextResult.data;
            if (nextTask.metadata.previous_task === id) {
              nextTask.metadata.previous_task = undefined;

              // Update next task file
              const fileContent = formatTaskFile(nextTask);
              if (nextTask.filePath) {
                fs.writeFileSync(nextTask.filePath, fileContent);
              }
            }
          } else {
            relationshipErrors.push(`Could not update old next task ${oldNextTask}: ${nextResult.error}`);
          }
        } catch (error) {
          relationshipErrors.push(`Could not update old next task ${oldNextTask}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Create new relationships
      const relationshipResult = await updateRelationships(task);
      if (!relationshipResult.success) {
        relationshipErrors.push(relationshipResult.error || 'Unknown relationship error');
      }

      if (relationshipErrors.length > 0) {
        return {
          success: true,
          data: task,
          message: `Task ${id} updated with relationship warnings: ${relationshipErrors.join('; ')}`
        };
      }
    }

    // Handle special treatment for _overview.md files
    if (path.basename(task.filePath) === '_overview.md' && !task.metadata.is_overview) {
      task.metadata.is_overview = true;
      // Write the updated content with the is_overview flag
      const updatedContent = formatTaskFile(task);
      fs.writeFileSync(task.filePath, updatedContent);
    }

    return {
      success: true,
      data: task,
      message: `Task ${id} updated successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/task-crud.js
 */
/*
async function deleteTask(id: string, phase?: string, subdirectory?: string): Promise<OperationResult<void>> {
  try {
    const taskResult = await getTask(id, phase, subdirectory);

    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || `Task with ID ${id} not found`
      };
    }

    const task = taskResult.data;

    if (!task.filePath) {
      return {
        success: false,
        error: `Task file path not found for ID ${id}`
      };
    }

    // Clean up relationships before deleting
    const relationshipErrors: string[] = [];

    if (task.metadata.parent_task) {
      try {
        const parentResult = await getTask(task.metadata.parent_task);
        if (parentResult.success && parentResult.data) {
          const parentTask = parentResult.data;
          if (parentTask.metadata.subtasks && parentTask.metadata.subtasks.includes(id)) {
            parentTask.metadata.subtasks = parentTask.metadata.subtasks.filter(t => t !== id);

            // Update parent task file
            const fileContent = formatTaskFile(parentTask);
            if (parentTask.filePath) {
              fs.writeFileSync(parentTask.filePath, fileContent);
            }
          }
        } else {
          relationshipErrors.push(`Could not update parent task ${task.metadata.parent_task}: ${parentResult.error}`);
        }
      } catch (error) {
        relationshipErrors.push(`Could not update parent task ${task.metadata.parent_task}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (task.metadata.previous_task) {
      try {
        const previousResult = await getTask(task.metadata.previous_task);
        if (previousResult.success && previousResult.data) {
          const previousTask = previousResult.data;
          if (previousTask.metadata.next_task === id) {
            previousTask.metadata.next_task = task.metadata.next_task; // Link to next task if exists

            // Update previous task file
            const fileContent = formatTaskFile(previousTask);
            if (previousTask.filePath) {
              fs.writeFileSync(previousTask.filePath, fileContent);
            }
          }
        } else {
          relationshipErrors.push(`Could not update previous task ${task.metadata.previous_task}: ${previousResult.error}`);
        }
      } catch (error) {
        relationshipErrors.push(`Could not update previous task ${task.metadata.previous_task}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (task.metadata.next_task) {
      try {
        const nextResult = await getTask(task.metadata.next_task);
        if (nextResult.success && nextResult.data) {
          const nextTask = nextResult.data;
          if (nextTask.metadata.previous_task === id) {
            nextTask.metadata.previous_task = task.metadata.previous_task; // Link to previous task if exists

            // Update next task file
            const fileContent = formatTaskFile(nextTask);
            if (nextTask.filePath) {
              fs.writeFileSync(nextTask.filePath, fileContent);
            }
          }
        } else {
          relationshipErrors.push(`Could not update next task ${task.metadata.next_task}: ${nextResult.error}`);
        }
      } catch (error) {
        relationshipErrors.push(`Could not update next task ${task.metadata.next_task}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Delete the subtasks (warn only)
    if (task.metadata.subtasks && task.metadata.subtasks.length > 0) {
      relationshipErrors.push(`Task ${id} has ${task.metadata.subtasks.length} subtasks that will become orphaned`);
    }

    // Special warning for _overview.md files
    if (path.basename(task.filePath) === '_overview.md' || task.metadata.is_overview) {
      relationshipErrors.push(`Task ${id} is an overview file. Tasks in this directory may lose context.`);
    }

    // Delete the file
    fs.unlinkSync(task.filePath);

    // Check if the directory is now empty (for subdirectories only)
    if (task.metadata.subdirectory) {
      const dirPath = path.dirname(task.filePath);
      const remainingFiles = fs.readdirSync(dirPath);

      if (remainingFiles.length === 0) {
        // Directory is empty, ask if we should delete it
        relationshipErrors.push(`Subdirectory ${task.metadata.subdirectory} is now empty. Consider removing it with 'rm -rf ${dirPath}'`);
      }
    }

    return relationshipErrors.length > 0
      ? {
          success: true,
          message: `Task ${id} deleted with warnings: ${relationshipErrors.join('; ')}`
        }
      : {
          success: true,
          message: `Task ${id} deleted successfully`
        };
  } catch (error) {
    return {
      success: false,
      error: `Error deleting task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/task-workflow.js
 */
/*
async function findNextTask(taskId?: string): Promise<OperationResult<Task | null>> {
  try {
    if (!taskId) {
      // If no task ID provided, find the first task that has no dependencies or previous task
      const tasksResult = await listTasks();
      
      if (!tasksResult.success || !tasksResult.data) {
        return {
          success: false,
          error: tasksResult.error || 'Failed to list tasks'
        };
      }
      
      const tasks = tasksResult.data;
      
      // First check for tasks with no deps and no previous_task
      const independentTasks = tasks.filter(task => 
        (!task.metadata.depends_on || task.metadata.depends_on.length === 0) && 
        !task.metadata.previous_task &&
        task.metadata.status !== '🟢 Done' && 
        task.metadata.status !== 'Done' && 
        task.metadata.status !== '🟢 Completed' && 
        task.metadata.status !== 'Completed'
      );
      
      if (independentTasks.length > 0) {
        // Sort by priority if available
        const nextTask = independentTasks.sort((a, b) => {
          const priorityA = a.metadata.priority || '';
          const priorityB = b.metadata.priority || '';
          
          if (priorityA.includes('Highest') || priorityA.includes('🔥')) return -1;
          if (priorityB.includes('Highest') || priorityB.includes('🔥')) return 1;
          if (priorityA.includes('High') || priorityA.includes('🔼')) return -1;
          if (priorityB.includes('High') || priorityB.includes('🔼')) return 1;
          
          return 0;
        })[0];
        
        return {
          success: true,
          data: nextTask,
          message: 'Found next task based on independent tasks'
        };
      }
      
      return {
        success: true,
        data: null,
        message: 'No independent tasks found'
      };
    }
    
    // If task ID provided, get the current task
    const currentTaskResult = await getTask(taskId);
    
    if (!currentTaskResult.success || !currentTaskResult.data) {
      return {
        success: false,
        error: currentTaskResult.error || `Task with ID ${taskId} not found`
      };
    }
    
    const currentTask = currentTaskResult.data;
    
    // First check if this task has a next_task field
    if (currentTask.metadata.next_task) {
      try {
        const nextTaskResult = await getTask(currentTask.metadata.next_task);
        
        if (nextTaskResult.success && nextTaskResult.data) {
          const nextTask = nextTaskResult.data;
          // Ensure the next task is not completed
          if (nextTask.metadata.status !== '🟢 Done' && 
              nextTask.metadata.status !== 'Done' && 
              nextTask.metadata.status !== '🟢 Completed' && 
              nextTask.metadata.status !== 'Completed') {
            
            // Check if all dependencies are satisfied
            if (nextTask.metadata.depends_on && nextTask.metadata.depends_on.length > 0) {
              const unsatisfiedDeps = [];
              
              for (const depId of nextTask.metadata.depends_on) {
                try {
                  const depTaskResult = await getTask(depId);
                  if (depTaskResult.success && depTaskResult.data) {
                    const depTask = depTaskResult.data;
                    if (depTask.metadata.status !== '🟢 Done' && 
                        depTask.metadata.status !== 'Done' && 
                        depTask.metadata.status !== '🟢 Completed' && 
                        depTask.metadata.status !== 'Completed') {
                      unsatisfiedDeps.push(depId);
                    }
                  } else {
                    // Dependency task not found - consider it unsatisfied
                    unsatisfiedDeps.push(depId);
                  }
                } catch {
                  // Dependency task not found - consider it unsatisfied
                  unsatisfiedDeps.push(depId);
                }
              }
              
              if (unsatisfiedDeps.length === 0) {
                return {
                  success: true,
                  data: nextTask,
                  message: 'Found next task based on explicit next_task field'
                };
              } else {
                return {
                  success: true,
                  data: null,
                  message: `Next task ${nextTask.metadata.id} has unsatisfied dependencies: ${unsatisfiedDeps.join(', ')}`
                };
              }
            }
            
            return {
              success: true,
              data: nextTask,
              message: 'Found next task based on explicit next_task field'
            };
          }
        }
      } catch (error) {
        return {
          success: false,
          error: `Error getting next task: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
    
    // If no explicit next_task, check for tasks that depend on this task
    const tasksResult = await listTasks();
    
    if (!tasksResult.success || !tasksResult.data) {
      return {
        success: false,
        error: tasksResult.error || 'Failed to list tasks'
      };
    }
    
    const tasks = tasksResult.data;
    const dependentTasks = tasks.filter(task => 
      task.metadata.depends_on?.includes(taskId) && 
      task.metadata.status !== '🟢 Done' && 
      task.metadata.status !== 'Done' && 
      task.metadata.status !== '🟢 Completed' && 
      task.metadata.status !== 'Completed'
    );
    
    if (dependentTasks.length > 0) {
      // If multiple dependent tasks, pick the highest priority one
      const nextTask = dependentTasks.sort((a, b) => {
        const priorityA = a.metadata.priority || '';
        const priorityB = b.metadata.priority || '';
        
        if (priorityA.includes('Highest') || priorityA.includes('🔥')) return -1;
        if (priorityB.includes('Highest') || priorityB.includes('🔥')) return 1;
        if (priorityA.includes('High') || priorityA.includes('🔼')) return -1;
        if (priorityB.includes('High') || priorityB.includes('🔼')) return 1;
        
        return 0;
      })[0];
      
      return {
        success: true,
        data: nextTask,
        message: 'Found next task based on dependencies'
      };
    }
    
    // If this task is part of a phase, check for the next task in the same phase
    if (currentTask.metadata.phase) {
      const phaseTasks = tasks.filter(task => 
        task.metadata.phase === currentTask.metadata.phase && 
        task.metadata.id !== currentTask.metadata.id &&
        task.metadata.status !== '🟢 Done' && 
        task.metadata.status !== 'Done' && 
        task.metadata.status !== '🟢 Completed' && 
        task.metadata.status !== 'Completed'
      );
      
      if (phaseTasks.length > 0) {
        // Sort by priority if available
        const nextTask = phaseTasks.sort((a, b) => {
          const priorityA = a.metadata.priority || '';
          const priorityB = b.metadata.priority || '';
          
          if (priorityA.includes('Highest') || priorityA.includes('🔥')) return -1;
          if (priorityB.includes('Highest') || priorityB.includes('🔥')) return 1;
          if (priorityA.includes('High') || priorityA.includes('🔼')) return -1;
          if (priorityB.includes('High') || priorityB.includes('🔼')) return 1;
          
          return 0;
        })[0];
        
        return {
          success: true,
          data: nextTask,
          message: 'Found next task in same phase'
        };
      }
    }
    
    // If no next task found in the same phase, check for the first task in the next phase
    if (currentTask.metadata.phase) {
      const phasesResult = await listPhases();
      
      if (phasesResult.success && phasesResult.data) {
        const phases = phasesResult.data;
        
        // Find current phase and check if there's a next one
        const currentPhaseIndex = phases.findIndex(p => p.id === currentTask.metadata.phase);
        if (currentPhaseIndex >= 0 && currentPhaseIndex < phases.length - 1) {
          const nextPhase = phases[currentPhaseIndex + 1];
          
          // Find the first incomplete task in the next phase
          for (const taskId of nextPhase.tasks) {
            try {
              const taskResult = await getTask(taskId);
              if (taskResult.success && taskResult.data) {
                const task = taskResult.data;
                if (task.metadata.status !== '🟢 Done' && 
                    task.metadata.status !== 'Done' && 
                    task.metadata.status !== '🟢 Completed' && 
                    task.metadata.status !== 'Completed') {
                  return {
                    success: true,
                    data: task,
                    message: 'Found first task in next phase'
                  };
                }
              }
            } catch (error) {
              console.warn(`Error checking task ${taskId} in next phase: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      }
    }
    
    return {
      success: true,
      data: null,
      message: `No next task found after ${taskId}`
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error finding next task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/phase-crud.js
 */
/*
async function listPhases(): Promise<OperationResult<Phase[]>> {
  try {
    const tasksDir = getTasksDirectory();
    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`
      };
    }
    
    const phasesDir = getPhasesDirectory();
    const phases: Phase[] = [];
    
    // First, check for a dedicated phases configuration file (if you have one)
    const phasesConfigPath = projectConfig.getPhasesConfigPath();
    if (fs.existsSync(phasesConfigPath)) {
      try {
        const phasesContent = fs.readFileSync(phasesConfigPath, 'utf-8');
        const phasesConfig = parseToml(phasesContent);
        
        if (phasesConfig.phases && Array.isArray(phasesConfig.phases)) {
          // This assumes your phases config has a specific format - adjust as needed
          phasesConfig.phases.forEach((phase: any, index: number) => {
            phases.push({
              id: phase.id || `phase-${index + 1}`,
              name: phase.name || `Phase ${index + 1}`,
              description: phase.description || '',
              tasks: [], // We'll fill this in later
              status: phase.status || 'Unknown',
              order: phase.order || index + 1
            });
          });
        }
      } catch (error) {
        return {
          success: true,
          data: [],
          message: `Failed to read phases config file: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
    
    // Next, look for phase directories in the tasks directory
    try {
      const entries = fs.readdirSync(tasksDir, { withFileTypes: true });

      // Filter directories and exclude special system directories
      const systemDirectories = ['config', 'templates', 'phases'];
      const phaseDirs = entries.filter(entry =>
        entry.isDirectory() && !systemDirectories.includes(entry.name.toLowerCase())
      );

      for (const phaseDir of phaseDirs) {
        const phaseName = phaseDir.name;

        // Skip if this phase is already defined in the config
        if (phases.some(p => p.id === phaseName)) {
          continue;
        }

        // Create a phase entry based on the directory
        phases.push({
          id: phaseName,
          name: phaseName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          tasks: [], // We'll fill this in later
          status: 'Unknown', // Default status
          order: phases.length + 1 // Just place it after any configured phases
        });
      }
    } catch (error) {
      return {
        success: false,
        error: `Error reading task directories: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
    
    // Finally, gather tasks for each phase
    // Include completed tasks to correctly determine phase status
    const tasksResult = await listTasks({ include_completed: true });
    if (tasksResult.success && tasksResult.data) {
      const allTasks = tasksResult.data;
      
      for (const phase of phases) {
        const phaseTasks = allTasks.filter(task => task.metadata.phase === phase.id);
        phase.tasks = phaseTasks.map(task => task.metadata.id);
        
        // Determine phase status based on task statuses
        if (phaseTasks.length > 0) {
          const allDone = phaseTasks.every(task => task.metadata.status?.includes('Done') || task.metadata.status?.includes('🟢'));
          const anyInProgress = phaseTasks.some(task => task.metadata.status?.includes('In Progress') || task.metadata.status?.includes('🔵'));
          const anyBlocked = phaseTasks.some(task => task.metadata.status?.includes('Blocked') || task.metadata.status?.includes('⚪'));
          
          if (allDone) {
            phase.status = '🟢 Completed';
          } else if (anyBlocked) {
            phase.status = '⚪ Blocked';
          } else if (anyInProgress) {
            phase.status = '🔵 In Progress';
          } else {
            phase.status = '🟡 Pending';
          }
        }
      }
    }
    
    return {
      success: true,
      data: phases.sort((a, b) => a.order! - b.order!),
      message: `Listed ${phases.length} phases`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error listing phases: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/phase-crud.js
 */
/*
async function createPhase(phase: Phase): Promise<OperationResult<Phase>> {
  try {
    const tasksDir = getTasksDirectory();
    
    // Create phase directory if it doesn't exist
    const phaseDir = path.join(tasksDir, phase.id);
    if (!fs.existsSync(phaseDir)) {
      fs.mkdirSync(phaseDir, { recursive: true });
    }
    
    // Optionally, update a phases config file if you have one
    const phasesConfigPath = projectConfig.getPhasesConfigPath();
    try {
      let phasesConfig: any = { phases: [] };
      
      if (fs.existsSync(phasesConfigPath)) {
        const phasesContent = fs.readFileSync(phasesConfigPath, 'utf-8');
        phasesConfig = parseToml(phasesContent);
        
        if (!phasesConfig.phases) {
          phasesConfig.phases = [];
        }
      } else {
        // Create config directory if it doesn't exist
        const configDir = projectConfig.getConfigDirectory();
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
      }
      
      // Check if phase already exists in config
      const existingPhaseIndex = phasesConfig.phases.findIndex((p: any) => p.id === phase.id);
      
      if (existingPhaseIndex >= 0) {
        // Update existing phase
        phasesConfig.phases[existingPhaseIndex] = {
          id: phase.id,
          name: phase.name,
          description: phase.description || '',
          status: phase.status || 'Unknown',
          order: phase.order || phasesConfig.phases.length + 1
        };
      } else {
        // Add new phase
        phasesConfig.phases.push({
          id: phase.id,
          name: phase.name,
          description: phase.description || '',
          status: phase.status || 'Unknown',
          order: phase.order || phasesConfig.phases.length + 1
        });
      }
      
      // Write updated config
      const updatedContent = stringifyToml(phasesConfig);
      fs.writeFileSync(phasesConfigPath, updatedContent);
    } catch (error) {
      return {
        success: true,
        data: phase,
        message: `Phase ${phase.id} created, but failed to update config: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
    
    return {
      success: true,
      data: phase,
      message: `Phase ${phase.id} created successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating phase: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/phase-crud.js
 */
/*
async function updatePhase(id: string, updates: Partial<Phase>): Promise<OperationResult<Phase>> {
  try {
    // First, get the existing phase to ensure it exists
    const phasesResult = await listPhases();
    if (!phasesResult.success || !phasesResult.data) {
      return {
        success: false,
        error: phasesResult.error || 'Failed to list phases'
      };
    }

    const phases = phasesResult.data;
    const existingPhase = phases.find(p => p.id === id);

    if (!existingPhase) {
      return {
        success: false,
        error: `Phase with ID ${id} not found`
      };
    }

    const tasksDir = getTasksDirectory();
    const oldPhaseDir = path.join(tasksDir, id);
    
    // Verify that the phase directory exists
    if (!fs.existsSync(oldPhaseDir)) {
      return {
        success: false,
        error: `Phase directory not found for ID ${id}`
      };
    }

    // Create updated phase object
    const updatedPhase: Phase = {
      ...existingPhase,
      ...updates
    };

    // Handle ID changes that require directory renaming
    let needsDirRename = false;
    if (updates.id && updates.id !== id) {
      // Validate the new ID (ensure it can be used as a directory name)
      if (!/^[a-zA-Z0-9_-]+$/.test(updates.id)) {
        return {
          success: false,
          error: `Invalid phase ID format: ${updates.id}. Use only letters, numbers, underscores, and hyphens.`
        };
      }
      
      // Check if a phase with the new ID already exists
      if (phases.some(p => p.id === updates.id)) {
        return {
          success: false,
          error: `A phase with ID ${updates.id} already exists. Use a unique ID.`
        };
      }

      // Mark for directory rename
      needsDirRename = true;
    }

    // Update the phase in the config file
    const phasesConfigPath = projectConfig.getPhasesConfigPath();
    try {
      let phasesConfig: any = { phases: [] };
      
      if (fs.existsSync(phasesConfigPath)) {
        const phasesContent = fs.readFileSync(phasesConfigPath, 'utf-8');
        phasesConfig = parseToml(phasesContent);
        
        if (!phasesConfig.phases) {
          phasesConfig.phases = [];
        }
      } else {
        // Create config directory if it doesn't exist
        const configDir = projectConfig.getConfigDirectory();
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
      }
      
      // Find the phase in the config
      const existingPhaseIndex = phasesConfig.phases.findIndex((p: any) => p.id === id);
      
      if (existingPhaseIndex >= 0) {
        // Update existing phase
        const updatedPhaseConfig = {
          id: updatedPhase.id,
          name: updatedPhase.name,
          description: updatedPhase.description || '',
          status: updatedPhase.status || 'Unknown',
          order: updatedPhase.order || phasesConfig.phases[existingPhaseIndex].order
        };

        // Remove the old phase entry (if ID changed)
        if (needsDirRename) {
          phasesConfig.phases.splice(existingPhaseIndex, 1);
          // Add the updated phase with new ID
          phasesConfig.phases.push(updatedPhaseConfig);
        } else {
          // Update the existing phase in place
          phasesConfig.phases[existingPhaseIndex] = updatedPhaseConfig;
        }
        
        // Write updated config
        const updatedContent = stringifyToml(phasesConfig);
        fs.writeFileSync(phasesConfigPath, updatedContent);
      } else {
        return {
          success: false,
          error: `Phase ${id} not found in configuration file`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Error updating phase configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Handle directory renaming if ID has changed
    if (needsDirRename) {
      try {
        const newPhaseDir = path.join(tasksDir, updatedPhase.id);
        
        // Make sure the destination doesn't already exist
        if (fs.existsSync(newPhaseDir)) {
          return {
            success: false,
            error: `Cannot rename phase directory: destination ${newPhaseDir} already exists`
          };
        }
        
        // Create the new directory first
        fs.mkdirSync(newPhaseDir, { recursive: true });
        
        // Now we need to move all files from old to new directory
        const moveAllFiles = (srcDir: string, destDir: string) => {
          const entries = fs.readdirSync(srcDir, { withFileTypes: true });
          
          for (const entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);
            
            if (entry.isDirectory()) {
              // Create the destination subdirectory
              fs.mkdirSync(destPath, { recursive: true });
              // Recursively move files from this subdirectory
              moveAllFiles(srcPath, destPath);
            } else {
              // Move the file (copy + delete)
              fs.copyFileSync(srcPath, destPath);
            }
          }
        };
        
        // Move all files from old phase dir to new phase dir
        moveAllFiles(oldPhaseDir, newPhaseDir);
        
        // Now update all task files to reference the new phase ID
        const updateTaskPhaseReferences = async () => {
          try {
            // Get all tasks in the new directory (include content for updates)
            const tasksResult = await listTasks({
              phase: updatedPhase.id,
              include_content: true,
              include_completed: true
            });
            
            if (tasksResult.success && tasksResult.data) {
              const tasks = tasksResult.data;
              for (const task of tasks) {
                if (task.metadata.phase === id) {
                  // Update the phase reference in task metadata
                  task.metadata.phase = updatedPhase.id;
                  task.metadata.updated_date = new Date().toISOString().split('T')[0];
                  
                  // Update the task file
                  if (task.filePath) {
                    const fileContent = formatTaskFile(task);
                    fs.writeFileSync(task.filePath, fileContent);
                  }
                }
              }
            }
            
            return { success: true };
          } catch (error) {
            return {
              success: false,
              error: `Error updating task references: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
          }
        };
        
        // Update task references
        const updateResult = await updateTaskPhaseReferences();
        if (!updateResult.success) {
          return {
            success: false,
            error: updateResult.error
          };
        }
        
        // Finally, remove the old directory after all content is moved and updated
        const removeDir = (dir: string) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const entryPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
              removeDir(entryPath);
            } else {
              fs.unlinkSync(entryPath);
            }
          }
          
          fs.rmdirSync(dir);
        };
        
        removeDir(oldPhaseDir);
      } catch (error) {
        return {
          success: false,
          error: `Error renaming phase directory: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
    
    return {
      success: true,
      data: updatedPhase,
      message: `Phase ${id} updated successfully${needsDirRename ? ' with directory rename' : ''}`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error updating phase: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * @deprecated Moved to task-manager/phase-crud.js
 */
/*
async function deletePhase(id: string, options: { force?: boolean } = {}): Promise<OperationResult<void>> {
  try {
    // First, get the existing phase to ensure it exists
    const phasesResult = await listPhases();
    if (!phasesResult.success || !phasesResult.data) {
      return {
        success: false,
        error: phasesResult.error || 'Failed to list phases'
      };
    }

    const phases = phasesResult.data;
    const existingPhase = phases.find(p => p.id === id);

    if (!existingPhase) {
      return {
        success: false,
        error: `Phase with ID ${id} not found`
      };
    }

    const tasksDir = getTasksDirectory();
    const phaseDir = path.join(tasksDir, id);
    
    // Verify that the phase directory exists
    if (!fs.existsSync(phaseDir)) {
      return {
        success: false,
        error: `Phase directory not found for ID ${id}`
      };
    }

    // Check if phase has tasks
    if (existingPhase.tasks && existingPhase.tasks.length > 0 && !options.force) {
      return {
        success: false,
        error: `Phase ${id} has ${existingPhase.tasks.length} tasks. Use --force to delete the phase and all its tasks.`
      };
    }

    // Remove phase from config file
    const phasesConfigPath = projectConfig.getPhasesConfigPath();
    try {
      if (fs.existsSync(phasesConfigPath)) {
        const phasesContent = fs.readFileSync(phasesConfigPath, 'utf-8');
        const phasesConfig = parseToml(phasesContent);
        
        if (phasesConfig.phases) {
          // Find the phase in the config
          const existingPhaseIndex = phasesConfig.phases.findIndex((p: any) => p.id === id);
          
          if (existingPhaseIndex >= 0) {
            // Remove the phase
            phasesConfig.phases.splice(existingPhaseIndex, 1);
            
            // Write updated config
            const updatedContent = stringifyToml(phasesConfig);
            fs.writeFileSync(phasesConfigPath, updatedContent);
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Error updating phase configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Delete the phase directory and all its contents
    const removeDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          removeDir(entryPath);
        } else {
          fs.unlinkSync(entryPath);
        }
      }
      
      fs.rmdirSync(dir);
    };
    
    removeDir(phaseDir);

    return {
      success: true,
      message: `Phase ${id} deleted successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error deleting phase: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
*/

/**
 * Lists all features in the project with optional filtering
 * @param options Filter options for features
 * @returns Operation result with array of features
 */
/**
 * @deprecated Moved to task-manager/feature-crud.js
 */
/*
async function listFeatures_old(options: FeatureFilterOptions = {}): Promise<OperationResult<Feature[]>> {
  try {
    const tasksDir = getTasksDirectory();

    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`
      };
    }

    const features: Feature[] = [];
    const errors: string[] = [];

    // Function to recursively scan directories for FEATURE_ prefixed directories
    const scanDirectories = async (dir: string, phase?: string): Promise<void> => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dir, entry.name);
          const dirBasename = path.basename(fullPath);
          
          // If this is a phase directory, recurse with phase name
          if (!dirBasename.startsWith('FEATURE_') && !dirBasename.startsWith('AREA_')) {
            await scanDirectories(fullPath, dirBasename);
            continue;
          }
          
          // If this is a feature directory (starts with FEATURE_)
          if (dirBasename.startsWith('FEATURE_')) {
            try {
              // Look for _overview.md file in the feature directory
              const overviewPath = path.join(fullPath, '_overview.md');
              let overview: Task | undefined;
              let title = dirBasename.replace('FEATURE_', '');
              let description = '';
              let status = '';
              
              if (fs.existsSync(overviewPath)) {
                const content = fs.readFileSync(overviewPath, 'utf-8');
                overview = parseTaskFile(content);
                overview.filePath = overviewPath;
                title = overview.metadata.title || title;
                
                // Extract description from content (first paragraph after title)
                if (overview.content) {
                  const contentLines = overview.content.split('\n');
                  const descriptionStart = contentLines.findIndex(line => line.startsWith('# ')) + 1;
                  if (descriptionStart > 0) {
                    for (let i = descriptionStart; i < contentLines.length; i++) {
                      if (contentLines[i].trim() !== '' && !contentLines[i].startsWith('#')) {
                        description = contentLines[i].trim();
                        break;
                      }
                    }
                  }
                }
                
                status = overview.metadata.status || '';
              }
              
              // List all tasks in this feature directory
              const taskFiles = fs.readdirSync(fullPath)
                .filter(file => file.endsWith('.md') && file !== '_overview.md')
                .map(file => {
                  try {
                    const taskPath = path.join(fullPath, file);
                    const content = fs.readFileSync(taskPath, 'utf-8');
                    const task = parseTaskFile(content);
                    return task.metadata.id;
                  } catch (err) {
                    return null;
                  }
                })
                .filter(id => id !== null) as string[];
              
              // Calculate progress based on task status
              let completedTasks = 0;
              let totalTasks = taskFiles.length;
              
              if (options.include_progress) {
                // Get detailed task information to calculate progress
                const tasksResult = await listTasks({
                  phase: phase,
                  subdirectory: dirBasename,
                  include_completed: true,
                  include_content: false
                });
                
                if (tasksResult.success && tasksResult.data) {
                  totalTasks = tasksResult.data.length;
                  completedTasks = tasksResult.data.filter(task => {
                    const status = task.metadata.status || '';
                    return status.includes('Done') || 
                           status.includes('🟢') || 
                           status.includes('Completed') || 
                           status.includes('Complete');
                  }).length;
                }
              }
              
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              
              // Calculate overall feature status based on tasks
              if (status === '') {
                if (totalTasks === 0) {
                  status = '🟡 To Do';
                } else if (completedTasks === totalTasks) {
                  status = '🟢 Done';
                } else if (completedTasks > 0) {
                  status = '🔵 In Progress';
                } else {
                  status = '🟡 To Do';
                }
              }
              
              // Create feature object
              const feature: Feature = {
                id: dirBasename,
                name: dirBasename.replace('FEATURE_', ''),
                title,
                description,
                phase,
                tasks: taskFiles,
                status,
                progress,
                overview
              };
              
              // Apply filters
              if (options.phase && phase !== options.phase) continue;
              if (options.status && status !== options.status) continue;
              
              // Remove task details if not requested
              if (!options.include_tasks) {
                delete feature.overview;
              }
              
              features.push(feature);
            } catch (error) {
              errors.push(`Error processing feature ${dirBasename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      }
    };
    
    // Start scanning from tasks directory
    await scanDirectories(tasksDir);
    
    return {
      success: true,
      data: features,
      message: `Found ${features.length} features ${errors.length > 0 ? `with ${errors.length} errors` : ''}`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error listing features: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets a specific feature by ID (directory name)
 * @param id Feature ID (e.g., "FEATURE_Authentication")
 * @param phase Optional phase to look in
 * @returns Operation result with feature if found
 */
/**
 * @deprecated Moved to task-manager/feature-crud.js
 */
/*
async function getFeature_old(id: string, phase?: string): Promise<OperationResult<Feature>> {
  try {
    const features = await listFeatures({
      phase,
      include_tasks: true,
      include_progress: true
    });
    
    if (!features.success || !features.data) {
      return {
        success: false,
        error: features.error || 'Failed to list features'
      };
    }
    
    const feature = features.data.find(f => f.id === (id.startsWith('FEATURE_') ? id : `FEATURE_${id}`));
    
    if (!feature) {
      return {
        success: false,
        error: `Feature ${id} not found`
      };
    }
    
    return {
      success: true,
      data: feature,
      message: `Feature ${id} found`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting feature: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Creates a new feature with an _overview.md file
 * @param name Feature name (will be prefixed with FEATURE_ if not already)
 * @param title Feature title
 * @param phase Phase to create the feature in
 * @param type Feature type (default: "🌟 Feature")
 * @param status Initial status (default: "🟡 To Do")
 * @param description Optional description
 * @param assignee Optional assignee
 * @param tags Optional tags
 * @returns Operation result with created feature
 */
/**
 * @deprecated Moved to task-manager/feature-crud.js
 */
/*
async function createFeature_old(
  name: string,
  title: string,
  phase: string,
  type: string = '🌟 Feature',
  status: string = '🟡 To Do',
  description?: string,
  assignee?: string,
  tags?: string[]
): Promise<OperationResult<Feature>> {
  try {
    const tasksDir = getTasksDirectory();
    
    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`
      };
    }
    
    // Ensure phase directory exists
    const phaseDir = path.join(tasksDir, phase);
    if (!fs.existsSync(phaseDir)) {
      return {
        success: false,
        error: `Phase directory not found: ${phase}`
      };
    }
    
    // Format feature directory name
    const cleanName = name.replace(/\s+/g, '');
    const featureId = cleanName.startsWith('FEATURE_') ? cleanName : `FEATURE_${cleanName}`;
    
    // Create feature directory
    const featureDir = path.join(phaseDir, featureId);
    if (fs.existsSync(featureDir)) {
      return {
        success: false,
        error: `Feature directory already exists: ${featureId}`
      };
    }
    
    ensureDirectoryExists(featureDir);
    
    // Create overview task
    const overviewTask: Task = {
      metadata: {
        id: '_overview',
        title,
        type,
        status,
        priority: '▶️ Medium',
        created_date: new Date().toISOString().split('T')[0],
        updated_date: new Date().toISOString().split('T')[0],
        assigned_to: assignee || '',
        phase,
        subdirectory: featureId,
        is_overview: true,
        tags: tags || []
      },
      content: `# ${title}\n\n${description || 'Overview of this feature.'}\n\n## Tasks\n\n- [ ] Task 1`
    };
    
    // Save overview file
    const overviewPath = path.join(featureDir, '_overview.md');
    fs.writeFileSync(overviewPath, formatTaskFile(overviewTask));
    
    // Get created feature
    const result = await getFeature(featureId, phase);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to retrieve created feature'
      };
    }
    
    return {
      success: true,
      data: result.data,
      message: `Feature ${featureId} created successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating feature: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Updates a feature's metadata via its _overview.md file
 * @param id Feature ID (e.g., "FEATURE_Authentication")
 * @param updates Update options
 * @param phase Optional phase to look in
 * @returns Operation result with updated feature
 */
/**
 * @deprecated Moved to task-manager/feature-crud.js
 */
/*
async function updateFeature_old(
  id: string,
  updates: FeatureUpdateOptions,
  phase?: string
): Promise<OperationResult<Feature>> {
  try {
    // Get the feature first
    const feature = await getFeature(id, phase);
    
    if (!feature.success || !feature.data) {
      return {
        success: false,
        error: feature.error || `Feature ${id} not found`
      };
    }
    
    const featureData = feature.data;
    const featurePhase = featureData.phase || phase;
    
    if (!featurePhase) {
      return {
        success: false,
        error: 'Cannot update feature: phase not found'
      };
    }
    
    // Feature should have an overview task, if not, we can't update
    if (!featureData.overview) {
      return {
        success: false,
        error: `Feature ${id} does not have an overview file`
      };
    }
    
    // Update overview task
    const overviewTask = featureData.overview;
    let updateNeeded = false;
    
    if (updates.title) {
      overviewTask.metadata.title = updates.title;
      updateNeeded = true;
    }
    
    if (updates.status) {
      overviewTask.metadata.status = updates.status;
      updateNeeded = true;
    }
    
    if (updates.description) {
      // Update description in content
      const contentLines = overviewTask.content.split('\n');
      const titleIndex = contentLines.findIndex(line => line.startsWith('# '));
      
      if (titleIndex >= 0) {
        const newContent = [
          ...contentLines.slice(0, titleIndex + 1),
          '',
          updates.description,
          '',
          ...contentLines.slice(titleIndex + 1).filter(line => {
            // Skip existing description lines
            return line.startsWith('#') || line.trim() === '' || line.includes('- [');
          })
        ];
        
        overviewTask.content = newContent.join('\n');
        updateNeeded = true;
      }
    }
    
    // If name changed, need to rename directory
    if (updates.name && updates.name !== featureData.name) {
      const tasksDir = getTasksDirectory();
      const oldFeaturePath = path.join(tasksDir, featurePhase, featureData.id);
      const newFeatureName = updates.name.replace(/\s+/g, '');
      const newFeatureId = newFeatureName.startsWith('FEATURE_') ? newFeatureName : `FEATURE_${newFeatureName}`;
      const newFeaturePath = path.join(tasksDir, featurePhase, newFeatureId);
      
      if (fs.existsSync(newFeaturePath)) {
        return {
          success: false,
          error: `Cannot rename feature: target directory already exists: ${newFeatureId}`
        };
      }
      
      // Update path in metadata
      overviewTask.metadata.subdirectory = newFeatureId;
      updateNeeded = true;
      
      // Update all task files in the feature to point to new subdirectory
      const tasksResult = await listTasks({
        phase: featurePhase,
        subdirectory: featureData.id,
        include_completed: true,
        include_content: true
      });
      
      if (tasksResult.success && tasksResult.data) {
        for (const task of tasksResult.data) {
          if (task.metadata.id === '_overview') continue; // Skip overview, we're updating it separately
          
          task.metadata.subdirectory = newFeatureId;
          if (task.filePath) {
            const taskFilename = path.basename(task.filePath);
            // Will be written after directory is renamed
            fs.writeFileSync(task.filePath, formatTaskFile(task));
          }
        }
      }
      
      // Write updated overview file to old location first
      if (overviewTask.filePath) {
        fs.writeFileSync(overviewTask.filePath, formatTaskFile(overviewTask));
      }
      
      // Rename directory
      fs.renameSync(oldFeaturePath, newFeaturePath);
      
      return await getFeature(newFeatureId, featurePhase);
    }
    
    // Just update the overview file
    if (updateNeeded && overviewTask.filePath) {
      fs.writeFileSync(overviewTask.filePath, formatTaskFile(overviewTask));
    }
    
    // Get updated feature
    return await getFeature(id, featurePhase);
  } catch (error) {
    return {
      success: false,
      error: `Error updating feature: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Deletes a feature (directory and all tasks within it)
 * @param id Feature ID (e.g., "FEATURE_Authentication")
 * @param phase Optional phase to look in
 * @param force Whether to force deletion even if feature contains tasks
 * @returns Operation result
 */
/**
 * @deprecated Moved to task-manager/feature-crud.js
 */
/*
async function deleteFeature_old(id: string, phase?: string, force: boolean = false): Promise<OperationResult<void>> {
  try {
    // Get the feature first
    const feature = await getFeature(id, phase);
    
    if (!feature.success || !feature.data) {
      return {
        success: false,
        error: feature.error || `Feature ${id} not found`
      };
    }
    
    const featureData = feature.data;
    const featurePhase = featureData.phase || phase;
    
    if (!featurePhase) {
      return {
        success: false,
        error: 'Cannot delete feature: phase not found'
      };
    }
    
    // Check if feature has tasks (excluding overview)
    if (!force && featureData.tasks.length > 0) {
      return {
        success: false,
        error: `Feature ${id} contains ${featureData.tasks.length} tasks. Use force option to delete.`
      };
    }
    
    // Delete the feature directory
    const tasksDir = getTasksDirectory();
    const featurePath = path.join(tasksDir, featurePhase, featureData.id);
    
    if (fs.existsSync(featurePath)) {
      // Recursively delete directory
      const deleteDir = (dirPath: string) => {
        if (fs.existsSync(dirPath)) {
          fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              deleteDir(curPath);
            } else {
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(dirPath);
        }
      };
      
      deleteDir(featurePath);
      
      return {
        success: true,
        message: `Feature ${id} deleted successfully`
      };
    } else {
      return {
        success: false,
        error: `Feature directory not found: ${featurePath}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Error deleting feature: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Lists all areas in the project with optional filtering
 * @param options Filter options for areas
 * @returns Operation result with array of areas
 */
/**
 * @deprecated Moved to task-manager/area-crud.js
 */
/*
async function listAreas_old(options: AreaFilterOptions = {}): Promise<OperationResult<Area[]>> {
  try {
    const tasksDir = getTasksDirectory();

    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`
      };
    }

    const areas: Area[] = [];
    const errors: string[] = [];

    // Function to recursively scan directories for AREA_ prefixed directories
    const scanDirectories = async (dir: string, phase?: string): Promise<void> => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dir, entry.name);
          const dirBasename = path.basename(fullPath);
          
          // If this is a phase directory, recurse with phase name
          if (!dirBasename.startsWith('FEATURE_') && !dirBasename.startsWith('AREA_')) {
            await scanDirectories(fullPath, dirBasename);
            continue;
          }
          
          // If this is an area directory (starts with AREA_)
          if (dirBasename.startsWith('AREA_')) {
            try {
              // Look for _overview.md file in the area directory
              const overviewPath = path.join(fullPath, '_overview.md');
              let overview: Task | undefined;
              let title = dirBasename.replace('AREA_', '');
              let description = '';
              let status = '';
              
              if (fs.existsSync(overviewPath)) {
                const content = fs.readFileSync(overviewPath, 'utf-8');
                overview = parseTaskFile(content);
                overview.filePath = overviewPath;
                title = overview.metadata.title || title;
                
                // Extract description from content (first paragraph after title)
                if (overview.content) {
                  const contentLines = overview.content.split('\n');
                  const descriptionStart = contentLines.findIndex(line => line.startsWith('# ')) + 1;
                  if (descriptionStart > 0) {
                    for (let i = descriptionStart; i < contentLines.length; i++) {
                      if (contentLines[i].trim() !== '' && !contentLines[i].startsWith('#')) {
                        description = contentLines[i].trim();
                        break;
                      }
                    }
                  }
                }
                
                status = overview.metadata.status || '';
              }
              
              // List all tasks in this area directory
              const taskFiles = fs.readdirSync(fullPath)
                .filter(file => file.endsWith('.md') && file !== '_overview.md')
                .map(file => {
                  try {
                    const taskPath = path.join(fullPath, file);
                    const content = fs.readFileSync(taskPath, 'utf-8');
                    const task = parseTaskFile(content);
                    return task.metadata.id;
                  } catch (err) {
                    return null;
                  }
                })
                .filter(id => id !== null) as string[];
              
              // Calculate progress based on task status
              let completedTasks = 0;
              let totalTasks = taskFiles.length;
              
              if (options.include_progress) {
                // Get detailed task information to calculate progress
                const tasksResult = await listTasks({
                  phase: phase,
                  subdirectory: dirBasename,
                  include_completed: true,
                  include_content: false
                });
                
                if (tasksResult.success && tasksResult.data) {
                  totalTasks = tasksResult.data.length;
                  completedTasks = tasksResult.data.filter(task => {
                    const status = task.metadata.status || '';
                    return status.includes('Done') || 
                           status.includes('🟢') || 
                           status.includes('Completed') || 
                           status.includes('Complete');
                  }).length;
                }
              }
              
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              
              // Calculate overall area status based on tasks
              if (status === '') {
                if (totalTasks === 0) {
                  status = '🟡 To Do';
                } else if (completedTasks === totalTasks) {
                  status = '🟢 Done';
                } else if (completedTasks > 0) {
                  status = '🔵 In Progress';
                } else {
                  status = '🟡 To Do';
                }
              }
              
              // Create area object
              const area: Area = {
                id: dirBasename,
                name: dirBasename.replace('AREA_', ''),
                title,
                description,
                phase,
                tasks: taskFiles,
                status,
                progress,
                overview
              };
              
              // Apply filters
              if (options.phase && phase !== options.phase) continue;
              if (options.status && status !== options.status) continue;
              
              // Remove task details if not requested
              if (!options.include_tasks) {
                delete area.overview;
              }
              
              areas.push(area);
            } catch (error) {
              errors.push(`Error processing area ${dirBasename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      }
    };
    
    // Start scanning from tasks directory
    await scanDirectories(tasksDir);
    
    return {
      success: true,
      data: areas,
      message: `Found ${areas.length} areas ${errors.length > 0 ? `with ${errors.length} errors` : ''}`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error listing areas: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets a specific area by ID (directory name)
 * @param id Area ID (e.g., "AREA_Performance")
 * @param phase Optional phase to look in
 * @returns Operation result with area if found
 */
/**
 * @deprecated Moved to task-manager/area-crud.js
 */
/*
async function getArea_old(id: string, phase?: string): Promise<OperationResult<Area>> {
  try {
    const areas = await listAreas({
      phase,
      include_tasks: true,
      include_progress: true
    });
    
    if (!areas.success || !areas.data) {
      return {
        success: false,
        error: areas.error || 'Failed to list areas'
      };
    }
    
    const area = areas.data.find(a => a.id === (id.startsWith('AREA_') ? id : `AREA_${id}`));
    
    if (!area) {
      return {
        success: false,
        error: `Area ${id} not found`
      };
    }
    
    return {
      success: true,
      data: area,
      message: `Area ${id} found`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting area: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Creates a new area with an _overview.md file
 * @param name Area name (will be prefixed with AREA_ if not already)
 * @param title Area title
 * @param phase Phase to create the area in
 * @param type Area type (default: "🧹 Chore")
 * @param status Initial status (default: "🟡 To Do")
 * @param description Optional description
 * @param assignee Optional assignee
 * @param tags Optional tags
 * @returns Operation result with created area
 */
/**
 * @deprecated Moved to task-manager/area-crud.js
 */
/*
async function createArea_old(
  name: string,
  title: string,
  phase: string,
  type: string = '🧹 Chore',
  status: string = '🟡 To Do',
  description?: string,
  assignee?: string,
  tags?: string[]
): Promise<OperationResult<Area>> {
  try {
    const tasksDir = getTasksDirectory();
    
    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`
      };
    }
    
    // Ensure phase directory exists
    const phaseDir = path.join(tasksDir, phase);
    if (!fs.existsSync(phaseDir)) {
      return {
        success: false,
        error: `Phase directory not found: ${phase}`
      };
    }
    
    // Format area directory name
    const cleanName = name.replace(/\s+/g, '');
    const areaId = cleanName.startsWith('AREA_') ? cleanName : `AREA_${cleanName}`;
    
    // Create area directory
    const areaDir = path.join(phaseDir, areaId);
    if (fs.existsSync(areaDir)) {
      return {
        success: false,
        error: `Area directory already exists: ${areaId}`
      };
    }
    
    ensureDirectoryExists(areaDir);
    
    // Create overview task
    const overviewTask: Task = {
      metadata: {
        id: '_overview',
        title,
        type,
        status,
        priority: '▶️ Medium',
        created_date: new Date().toISOString().split('T')[0],
        updated_date: new Date().toISOString().split('T')[0],
        assigned_to: assignee || '',
        phase,
        subdirectory: areaId,
        is_overview: true,
        tags: tags || []
      },
      content: `# ${title}\n\n${description || 'Overview of this cross-cutting area.'}\n\n## Tasks\n\n- [ ] Task 1`
    };
    
    // Save overview file
    const overviewPath = path.join(areaDir, '_overview.md');
    fs.writeFileSync(overviewPath, formatTaskFile(overviewTask));
    
    // Get created area
    const result = await getArea(areaId, phase);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to retrieve created area'
      };
    }
    
    return {
      success: true,
      data: result.data,
      message: `Area ${areaId} created successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating area: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Updates an area's metadata via its _overview.md file
 * @param id Area ID (e.g., "AREA_Performance")
 * @param updates Update options
 * @param phase Optional phase to look in
 * @returns Operation result with updated area
 */
/**
 * @deprecated Moved to task-manager/area-crud.js
 */
/*
async function updateArea_old(
  id: string,
  updates: AreaUpdateOptions,
  phase?: string
): Promise<OperationResult<Area>> {
  try {
    // Get the area first
    const area = await getArea(id, phase);
    
    if (!area.success || !area.data) {
      return {
        success: false,
        error: area.error || `Area ${id} not found`
      };
    }
    
    const areaData = area.data;
    const areaPhase = areaData.phase || phase;
    
    if (!areaPhase) {
      return {
        success: false,
        error: 'Cannot update area: phase not found'
      };
    }
    
    // Area should have an overview task, if not, we can't update
    if (!areaData.overview) {
      return {
        success: false,
        error: `Area ${id} does not have an overview file`
      };
    }
    
    // Update overview task
    const overviewTask = areaData.overview;
    let updateNeeded = false;
    
    if (updates.title) {
      overviewTask.metadata.title = updates.title;
      updateNeeded = true;
    }
    
    if (updates.status) {
      overviewTask.metadata.status = updates.status;
      updateNeeded = true;
    }
    
    if (updates.description) {
      // Update description in content
      const contentLines = overviewTask.content.split('\n');
      const titleIndex = contentLines.findIndex(line => line.startsWith('# '));
      
      if (titleIndex >= 0) {
        const newContent = [
          ...contentLines.slice(0, titleIndex + 1),
          '',
          updates.description,
          '',
          ...contentLines.slice(titleIndex + 1).filter(line => {
            // Skip existing description lines
            return line.startsWith('#') || line.trim() === '' || line.includes('- [');
          })
        ];
        
        overviewTask.content = newContent.join('\n');
        updateNeeded = true;
      }
    }
    
    // If name changed, need to rename directory
    if (updates.name && updates.name !== areaData.name) {
      const tasksDir = getTasksDirectory();
      const oldAreaPath = path.join(tasksDir, areaPhase, areaData.id);
      const newAreaName = updates.name.replace(/\s+/g, '');
      const newAreaId = newAreaName.startsWith('AREA_') ? newAreaName : `AREA_${newAreaName}`;
      const newAreaPath = path.join(tasksDir, areaPhase, newAreaId);
      
      if (fs.existsSync(newAreaPath)) {
        return {
          success: false,
          error: `Cannot rename area: target directory already exists: ${newAreaId}`
        };
      }
      
      // Update path in metadata
      overviewTask.metadata.subdirectory = newAreaId;
      updateNeeded = true;
      
      // Update all task files in the area to point to new subdirectory
      const tasksResult = await listTasks({
        phase: areaPhase,
        subdirectory: areaData.id,
        include_completed: true,
        include_content: true
      });
      
      if (tasksResult.success && tasksResult.data) {
        for (const task of tasksResult.data) {
          if (task.metadata.id === '_overview') continue; // Skip overview, we're updating it separately
          
          task.metadata.subdirectory = newAreaId;
          if (task.filePath) {
            const taskFilename = path.basename(task.filePath);
            // Will be written after directory is renamed
            fs.writeFileSync(task.filePath, formatTaskFile(task));
          }
        }
      }
      
      // Write updated overview file to old location first
      if (overviewTask.filePath) {
        fs.writeFileSync(overviewTask.filePath, formatTaskFile(overviewTask));
      }
      
      // Rename directory
      fs.renameSync(oldAreaPath, newAreaPath);
      
      return await getArea(newAreaId, areaPhase);
    }
    
    // Just update the overview file
    if (updateNeeded && overviewTask.filePath) {
      fs.writeFileSync(overviewTask.filePath, formatTaskFile(overviewTask));
    }
    
    // Get updated area
    return await getArea(id, areaPhase);
  } catch (error) {
    return {
      success: false,
      error: `Error updating area: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Deletes an area (directory and all tasks within it)
 * @param id Area ID (e.g., "AREA_Performance")
 * @param phase Optional phase to look in
 * @param force Whether to force deletion even if area contains tasks
 * @returns Operation result
 */
/**
 * @deprecated Moved to task-manager/area-crud.js
 */
/*
async function deleteArea_old(id: string, phase?: string, force: boolean = false): Promise<OperationResult<void>> {
  try {
    // Get the area first
    const area = await getArea(id, phase);
    
    if (!area.success || !area.data) {
      return {
        success: false,
        error: area.error || `Area ${id} not found`
      };
    }
    
    const areaData = area.data;
    const areaPhase = areaData.phase || phase;
    
    if (!areaPhase) {
      return {
        success: false,
        error: 'Cannot delete area: phase not found'
      };
    }
    
    // Check if area has tasks (excluding overview)
    if (!force && areaData.tasks.length > 0) {
      return {
        success: false,
        error: `Area ${id} contains ${areaData.tasks.length} tasks. Use force option to delete.`
      };
    }
    
    // Delete the area directory
    const tasksDir = getTasksDirectory();
    const areaPath = path.join(tasksDir, areaPhase, areaData.id);
    
    if (fs.existsSync(areaPath)) {
      // Recursively delete directory
      const deleteDir = (dirPath: string) => {
        if (fs.existsSync(dirPath)) {
          fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              deleteDir(curPath);
            } else {
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(dirPath);
        }
      };
      
      deleteDir(areaPath);
      
      return {
        success: true,
        message: `Area ${id} deleted successfully`
      };
    } else {
      return {
        success: false,
        error: `Area directory not found: ${areaPath}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Error deleting area: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Moves a task to a different feature or area
 * @param id Task ID to move
 * @param options Move options (targetSubdirectory, targetPhase, searchPhase, searchSubdirectory)
 * @returns Operation result with moved task
 */
/**
 * @deprecated Moved to task-manager/task-move.js
 */
/*
async function moveTask_old(id: string, options: {
  targetSubdirectory: string;
  targetPhase?: string;
  searchPhase?: string;
  searchSubdirectory?: string;
}): Promise<OperationResult<Task>> {
  try {
    // Get the task first
    const task = await getTask(id);
    
    if (!task.success || !task.data) {
      return {
        success: false,
        error: task.error || `Task ${id} not found`
      };
    }
    
    const taskData = task.data;
    const currentPhase = taskData.metadata.phase;
    const currentSubdir = taskData.metadata.subdirectory;
    const targetPhase = options.targetPhase || currentPhase;
    
    if (!targetPhase) {
      return {
        success: false,
        error: 'Cannot move task: phase not found'
      };
    }
    
    // Update task metadata
    taskData.metadata.subdirectory = options.targetSubdirectory;
    if (options.targetPhase) {
      taskData.metadata.phase = options.targetPhase;
    }
    
    // Get current and target file paths
    const tasksDir = getTasksDirectory();
    const taskFilename = `${id}.md`;
    
    // Delete old file
    if (taskData.filePath && fs.existsSync(taskData.filePath)) {
      fs.unlinkSync(taskData.filePath);
    }
    
    // Create target file
    const targetPath = currentSubdir 
      ? path.join(tasksDir, targetPhase, options.targetSubdirectory, taskFilename)
      : path.join(tasksDir, targetPhase, taskFilename);
    
    // Ensure target directory exists
    ensureDirectoryExists(path.dirname(targetPath));
    
    // Write task to new location
    fs.writeFileSync(targetPath, formatTaskFile(taskData));
    
    // Get updated task
    return await getTask(id, targetPhase, options.targetSubdirectory);
  } catch (error) {
    return {
      success: false,
      error: `Error moving task: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}*/

// The functions above have been moved to respective modules in the task-manager/ directory.