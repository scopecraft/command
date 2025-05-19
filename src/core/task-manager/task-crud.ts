import fs from 'node:fs';
import path from 'node:path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import type { RuntimeConfig } from '../config/types.js';
import {
  getPriorityOrder,
  isCompletedTaskStatus,
  normalizePhaseStatus,
  normalizePriority,
  normalizeTaskStatus,
} from '../field-normalizers.js';
import { ProjectConfig } from '../project-config.js';
import { formatTaskFile, parseTaskFile } from '../task-parser.js';
import {
  type OperationResult,
  type Task,
  type TaskFilterOptions,
  TaskMetadata,
  type TaskUpdateOptions,
} from '../types.js';
import { generateTaskId as generateNewTaskId, validateTaskId } from './id-generator.js';
import {
  ensureDirectoryExists,
  getAllFiles,
  getTaskFilePath,
  getTasksDirectory,
  parseTaskPath,
} from './index.js';
import { updateRelationships } from './task-relationships.js';

/**
 * Lists all tasks with optional filtering
 * @param options Filter options
 * @returns Operation result with array of tasks
 */
export async function listTasks(options: TaskFilterOptions = {}): Promise<OperationResult<Task[]>> {
  try {
    const tasksDir = getTasksDirectory(options.config);

    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`,
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
        const pathInfo = parseTaskPath(filePath, options.config);
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

        // Apply filters with normalization
        if (options.status) {
          const normalizedFilterStatus = normalizeTaskStatus(options.status);
          const normalizedTaskStatus = normalizeTaskStatus(task.metadata.status);
          if (normalizedTaskStatus !== normalizedFilterStatus) continue;
        }

        if (options.type && task.metadata.type !== options.type) continue;
        if (options.assignee && task.metadata.assigned_to !== options.assignee) continue;
        if (options.phase && task.metadata.phase !== options.phase) continue;
        if (options.subdirectory && task.metadata.subdirectory !== options.subdirectory) continue;
        if (options.is_overview !== undefined && task.metadata.is_overview !== options.is_overview)
          continue;

        // Filter out completed tasks by default, UNLESS explicitly requested to include them
        if (options.include_completed !== true) {
          if (isCompletedTaskStatus(task.metadata.status)) {
            continue;
          }
        }

        // Filter by tags if provided
        if (options.tags && options.tags.length > 0) {
          if (!task.metadata.tags || !Array.isArray(task.metadata.tags)) continue;

          const taskTags = task.metadata.tags;
          const hasAllTags = options.tags.every((tag) => taskTags.includes(tag));
          if (!hasAllTags) continue;
        }

        // Exclude content if not explicitly requested (to reduce token size)
        if (options.include_content !== true) {
          task.content = '';
        }

        tasks.push(task);
      } catch (error) {
        errors.push(
          `Error parsing ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Sort tasks by priority or creation date (newest first)
    tasks.sort((a, b) => {
      const aPrio = getPriorityOrder(a.metadata.priority);
      const bPrio = getPriorityOrder(b.metadata.priority);

      if (aPrio !== bPrio) {
        return bPrio - aPrio; // Higher priority first
      }

      // If priorities are the same, sort by creation date (newest first)
      const aDate = a.metadata.created_date ? new Date(a.metadata.created_date).getTime() : 0;
      const bDate = b.metadata.created_date ? new Date(b.metadata.created_date).getTime() : 0;
      return bDate - aDate;
    });

    return {
      success: true,
      data: tasks,
      warnings: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error listing tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Gets a task by ID with optional parameters
 * @param id Task ID
 * @param options Optional parameters including phase, subdirectory, and config
 * @returns Operation result with task if found
 */
export async function getTask(
  id: string,
  options?: {
    phase?: string;
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task>> {
  try {
    // If phase and subdirectory are provided, try direct path lookup first
    if (options?.phase && options?.subdirectory) {
      const filePath = getTaskFilePath(id, options.phase, options.subdirectory, options.config);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const task = parseTaskFile(content);
        task.filePath = filePath;

        // Set phase and subdirectory in metadata if not already set
        if (!task.metadata.phase) {
          task.metadata.phase = options.phase;
        }
        if (!task.metadata.subdirectory) {
          task.metadata.subdirectory = options.subdirectory;
        }

        return { success: true, data: task };
      }
    }

    // If direct path lookup fails or phase/subdirectory not provided, search all tasks
    const tasksResult = await listTasks({
      include_content: true,
      include_completed: true,
      config: options?.config,
    });
    if (!tasksResult.success || !tasksResult.data) {
      return {
        success: false,
        error: tasksResult.error || 'Failed to list tasks',
      };
    }

    const task = tasksResult.data.find((task) => task.metadata.id === id);
    if (!task) {
      return {
        success: false,
        error: `Task with ID ${id} not found`,
      };
    }

    return { success: true, data: task };
  } catch (error) {
    return {
      success: false,
      error: `Error getting task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Creates a new task
 * @param task Task object to create
 * @param options Optional parameters including subdirectory and config
 * @returns Operation result with the created task
 */
export async function createTask(
  task: Task,
  options?: {
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task>> {
  try {
    const tasksDir = getTasksDirectory(options?.config);

    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }

    // Store subdirectory in task metadata if provided
    if (options?.subdirectory) {
      task.metadata.subdirectory = options.subdirectory;
    }

    // Generate ID if not provided
    if (!task.metadata.id) {
      // Use new concise format by default, unless explicitly set to timestamp
      const projectConfigData = ProjectConfig.getInstance(options?.config).getConfig();
      const useOldFormat = projectConfigData?.idFormat === 'timestamp';

      if (!useOldFormat) {
        // Generate new concise ID with collision retry (default behavior)
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          const newId = generateNewTaskId({
            type: task.metadata.type,
            title: task.metadata.title,
          });

          // Check if ID already exists
          const existingTask = await getTask(newId, { config: options?.config });
          if (!existingTask.success) {
            // ID doesn't exist, we can use it
            task.metadata.id = newId;
            break;
          }

          attempts++;
        }

        if (!task.metadata.id) {
          throw new Error('Failed to generate unique task ID after multiple attempts');
        }
      } else {
        // Use old timestamp format only if explicitly configured
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
        task.metadata.id = `TASK-${timestamp}`;
      }
    }

    // Normalize priority and status values if present
    if (task.metadata.priority) {
      task.metadata.priority = normalizePriority(task.metadata.priority);
    }

    if (task.metadata.status) {
      task.metadata.status = normalizeTaskStatus(task.metadata.status);
    }

    // Add created date if not set
    if (!task.metadata.created_date) {
      const today = new Date();
      task.metadata.created_date = today.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Set updated date to today
    const today = new Date();
    task.metadata.updated_date = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Format task as TOML + Markdown file
    const fileContent = formatTaskFile(task);

    // Determine file path based on phase and subdirectory
    const filePath = task.metadata.phase
      ? getTaskFilePath(
          task.metadata.id,
          task.metadata.phase,
          task.metadata.subdirectory || '',
          options?.config
        )
      : path.join(tasksDir, `${task.metadata.id}.md`);

    // Create phase directory if needed
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, fileContent);
    task.filePath = filePath;

    // Update relationships
    if (
      task.metadata.parent_task ||
      task.metadata.depends ||
      task.metadata.next_task ||
      task.metadata.previous_task
    ) {
      await updateRelationships(task, { config: options?.config });
    }

    return {
      success: true,
      data: task,
      message: `Task ${task.metadata.id} created successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Updates a task
 * @param id Task id
 * @param updates Updates to apply
 * @param options Optional parameters including phase, subdirectory, and config
 * @returns Operation result with updated task
 */
export async function updateTask(
  id: string,
  updates: TaskUpdateOptions,
  options?: {
    phase?: string;
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task>> {
  try {
    // Get the task, using phase and subdirectory if provided
    const taskResult = await getTask(id, {
      phase: options?.phase,
      subdirectory: options?.subdirectory,
      config: options?.config,
    });
    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || `Task with ID ${id} not found`,
      };
    }

    const task = taskResult.data;
    let needsRelationshipUpdate = false;

    // Check if updating phase or subdirectory (requires file move)
    const targetPhase = updates.metadata?.phase || updates.phase;
    const targetSubdirectory = updates.metadata?.subdirectory || updates.subdirectory;
    const needsFileMove =
      (targetPhase && targetPhase !== task.metadata.phase) ||
      (targetSubdirectory && targetSubdirectory !== task.metadata.subdirectory);

    // Set updated date to today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Update metadata fields with normalization
    if (updates.metadata) {
      // Create a normalized copy of the updates
      const normalizedMetadata = { ...updates.metadata };

      // Apply normalizations to relevant fields
      if (normalizedMetadata.status !== undefined) {
        normalizedMetadata.status = normalizeTaskStatus(normalizedMetadata.status);
      }

      if (normalizedMetadata.priority !== undefined) {
        normalizedMetadata.priority = normalizePriority(normalizedMetadata.priority);
      }

      // Update the task metadata with normalized values
      task.metadata = {
        ...task.metadata,
        ...normalizedMetadata,
        // Always update the updated_date
        updated_date: todayString,
      };

      // Check if any relationship fields were updated
      if (
        updates.metadata.parent_task !== undefined ||
        updates.metadata.depends !== undefined ||
        updates.metadata.next_task !== undefined ||
        updates.metadata.previous_task !== undefined
      ) {
        needsRelationshipUpdate = true;
      }
    }

    // Handle direct property updates (not nested in metadata) with normalization
    if (updates.status !== undefined) {
      task.metadata.status = normalizeTaskStatus(updates.status);
    }

    if (updates.priority !== undefined) {
      task.metadata.priority = normalizePriority(updates.priority);
    }

    if (updates.phase !== undefined) {
      task.metadata.phase = updates.phase;
    }

    if (updates.subdirectory !== undefined) {
      task.metadata.subdirectory = updates.subdirectory;
    }

    // Update content if provided
    if (updates.content !== undefined) {
      task.content = updates.content;
    }

    // We've already set the date in the metadata update above

    // Handle ID change
    if (updates.metadata?.new_id || updates.new_id) {
      const _oldId = task.metadata.id;
      task.metadata.id = updates.metadata?.new_id || updates.new_id;

      // Update relationships for new ID
      needsRelationshipUpdate = true;
    }

    // Set updated date if it wasn't already updated in metadata
    if (!updates.metadata) {
      task.metadata.updated_date = todayString;
    }

    // Format task as TOML + Markdown file
    const fileContent = formatTaskFile(task);

    if (needsFileMove) {
      // Determine old and new file paths
      const oldFilePath = task.filePath;
      const newFilePath = getTaskFilePath(
        task.metadata.id,
        targetPhase || task.metadata.phase,
        targetSubdirectory || task.metadata.subdirectory,
        options?.config
      );

      // Create target directory if needed
      const targetDir = path.dirname(newFilePath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Write to new location
      fs.writeFileSync(newFilePath, fileContent);

      // Delete original file
      fs.unlinkSync(oldFilePath);

      // Update file path
      task.filePath = newFilePath;
    } else {
      // No file move needed, just update in place
      fs.writeFileSync(task.filePath, fileContent);
    }

    // Update relationships if needed
    if (needsRelationshipUpdate) {
      await updateRelationships(task, { config: options?.config });
    }

    return { 
      success: true, 
      data: task,
      message: `Task ${id} updated successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Deletes a task
 * @param id Task ID
 * @param options Optional parameters including phase, subdirectory, and config
 * @returns Operation result
 */
export async function deleteTask(
  id: string,
  options?: {
    phase?: string;
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<void>> {
  try {
    const taskResult = await getTask(id, {
      phase: options?.phase,
      subdirectory: options?.subdirectory,
      config: options?.config,
    });

    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || `Task with ID ${id} not found`,
      };
    }

    const task = taskResult.data;

    // Delete the file
    if (task.filePath && fs.existsSync(task.filePath)) {
      fs.unlinkSync(task.filePath);
    } else {
      return {
        success: false,
        error: `Task file not found: ${task.filePath}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Error deleting task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
