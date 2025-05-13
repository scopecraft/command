/**
 * Core task management functionality
 * Handles all CRUD operations for tasks
 */
import fs from 'fs';
import path from 'path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import {
  Task,
  TaskMetadata,
  TaskFilterOptions,
  TaskUpdateOptions,
  OperationResult,
  Phase
} from './types.js';
import { parseTaskFile, formatTaskFile, generateTaskId } from './task-parser.js';
import { projectConfig } from './project-config.js';

/**
 * Gets the tasks directory path
 * @returns Path to the tasks directory
 */
export function getTasksDirectory(): string {
  return projectConfig.getTasksDirectory();
}

/**
 * Gets the phases directory path
 * @returns Path to the phases directory
 */
export function getPhasesDirectory(): string {
  return projectConfig.getPhasesDirectory();
}

/**
 * Ensure directory exists
 * @param dirPath Path to the directory to ensure
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Lists all tasks with optional filtering
 * @param options Filter options
 * @returns Operation result with array of tasks
 */
export async function listTasks(options: TaskFilterOptions = {}): Promise<OperationResult<Task[]>> {
  try {
    const tasksDir = getTasksDirectory();

    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`
      };
    }

    // Get all task files recursively
    const getAllFiles = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      return entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory()
          ? getAllFiles(fullPath)
          : entry.name.endsWith('.md') ? [fullPath] : [];
      });
    };

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

/**
 * Gets a task by ID, optionally with phase and subdirectory information
 * @param id Task ID
 * @param phase Optional phase to look in
 * @param subdirectory Optional subdirectory to look in
 * @returns Operation result with task if found
 */
export async function getTask(id: string, phase?: string, subdirectory?: string): Promise<OperationResult<Task>> {
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

/**
 * Creates a new task
 * @param task Task object to create
 * @param subdirectory Optional subdirectory within phase (e.g., "FEATURE_Login")
 * @returns Operation result with the created task
 */
export async function createTask(task: Task, subdirectory?: string): Promise<OperationResult<Task>> {
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

/**
 * Update relationships between tasks
 * @param task Task to update relationships for
 * @returns Operation result
 */
export async function updateRelationships(task: Task): Promise<OperationResult<void>> {
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

/**
 * Updates an existing task
 * @param id Task ID
 * @param updates Updates to apply
 * @param phase Optional phase to look in (for task lookup)
 * @param subdirectory Optional subdirectory to look in (for task lookup)
 * @returns Operation result with updated task
 */
export async function updateTask(
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

/**
 * Deletes a task
 * @param id Task ID
 * @param phase Optional phase to look in
 * @param subdirectory Optional subdirectory to look in
 * @returns Operation result
 */
export async function deleteTask(id: string, phase?: string, subdirectory?: string): Promise<OperationResult<void>> {
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

/**
 * Find the next task based on dependencies and workflow sequence
 * @param taskId Current task ID (optional)
 * @returns Operation result with next task if found
 */
export async function findNextTask(taskId?: string): Promise<OperationResult<Task | null>> {
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

/**
 * Lists all phases
 * @returns Operation result with array of phases
 */
export async function listPhases(): Promise<OperationResult<Phase[]>> {
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

/**
 * Creates a new phase
 * @param phase Phase object
 * @returns Operation result with created phase
 */
export async function createPhase(phase: Phase): Promise<OperationResult<Phase>> {
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

/**
 * Updates an existing phase
 * @param id Phase ID to update
 * @param updates Partial<Phase> with updated fields
 * @returns Operation result with updated phase
 */
export async function updatePhase(id: string, updates: Partial<Phase>): Promise<OperationResult<Phase>> {
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