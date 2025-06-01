/**
 * Parent Task Operations - Clean Builder Pattern API
 *
 * Provides a clean builder interface for all parent task operations.
 * This is the ONLY API for working with parent tasks.
 */

import { mkdirSync, rmSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import {
  getWorkflowDirectory,
  getTaskIdFromFilename,
  isParentTaskFolder,
  parseTaskLocation,
} from './directory-utils.js';
import { generateUniqueTaskId, generateSubtaskId } from './id-generator.js';
import { create, del, get, move } from './task-crud.js';
import { parseTaskDocument } from './task-parser.js';
import type {
  OperationResult,
  ParentTask,
  SubtaskInfo,
  Task,
  TaskCreateOptions,
  TaskUpdateOptions,
  TaskMetadata,
  TaskStatus,
  TaskType,
  ProjectConfig,
  WorkflowState,
} from './types.js';

/**
 * Clean builder pattern for parent-scoped operations
 * 
 * Usage:
 *   parent(projectRoot, parentId).create(title, options)
 *   parent(projectRoot, parentId).get()
 *   parent(projectRoot, parentId).list()
 *   parent(projectRoot, parentId).del(cascade: true)
 */
export function parent(projectRoot: string, parentId: string, config?: ProjectConfig) {
  return {
    // CRUD operations scoped to parent
    async create(title: string, options: Partial<TaskCreateOptions> = {}): Promise<OperationResult<Task>> {
      // Create subtask within this parent
      const subtaskOptions: TaskCreateOptions = {
        title,
        type: options.type || 'feature',
        area: options.area,
        status: options.status || 'To Do',
        workflowState: options.workflowState,
        instruction: options.instruction,
        tasks: options.tasks,
        deliverable: options.deliverable,
        customMetadata: options.customMetadata,
      };
      return create(projectRoot, subtaskOptions, config, parentId);
    },
    
    async get(subtaskId?: string): Promise<OperationResult<Task | ParentTask>> {
      if (subtaskId) {
        // Get specific subtask
        return get(projectRoot, subtaskId, config, parentId);
      }
      // Get parent task with all subtasks
      return getParentTaskWithSubtasks(projectRoot, parentId, config);
    },
    
    async update(updates: TaskUpdateOptions): Promise<OperationResult<Task>> {
      // Update the parent overview
      return update(projectRoot, parentId, updates, config);
    },
    
    async del(cascade = false): Promise<OperationResult<void>> {
      if (!cascade) {
        throw new Error('Must specify cascade=true to delete parent task');
      }
      return deleteParentTaskWithSubtasks(projectRoot, parentId, config);
    },
    
    async list(): Promise<OperationResult<Task[]>> {
      const parentResult = await getParentTaskWithSubtasks(projectRoot, parentId, config);
      if (!parentResult.success || !parentResult.data) {
        return {
          success: false,
          error: parentResult.error || 'Parent task not found',
        };
      }
      return { success: true, data: parentResult.data.subtasks || [] };
    },
    
    // Parent-specific operations (will be implemented in Phase 3B)
    async resequence(mapping: Array<{taskId: string, newSequence: string}>): Promise<OperationResult<void>> {
      // TODO: Will be moved from task-operations.ts in Phase 3B
      throw new Error('Not implemented yet - will be moved from task-operations.ts');
    },
    
    async parallelize(subtaskIds: string[]): Promise<OperationResult<void>> {
      // TODO: Will be moved from task-operations.ts in Phase 3B  
      throw new Error('Not implemented yet - will be moved from task-operations.ts');
    }
  };
}

/**
 * Create a new parent task (folder with _overview.md)
 * This is used by the builder's create method when no parentId is provided
 */
export async function createParent(
  projectRoot: string,
  options: TaskCreateOptions,
  config?: ProjectConfig
): Promise<OperationResult<ParentTask>> {
  try {
    // Generate unique ID for the folder
    const taskId = generateUniqueTaskId(options.title, projectRoot, config);

    // Determine workflow state
    const workflowState = options.workflowState || config?.defaultWorkflowState || 'backlog';
    const workflowDir = getWorkflowDirectory(projectRoot, workflowState, config);

    // Create task folder
    const taskFolder = join(workflowDir, taskId);
    if (existsSync(taskFolder)) {
      return {
        success: false,
        error: `Task folder already exists: ${taskId}`,
      };
    }

    mkdirSync(taskFolder, { recursive: true });

    // Create _overview.md using task CRUD
    const overviewPath = join(taskFolder, '_overview.md');
    const overviewOptions: TaskCreateOptions = {
      ...options,
      instruction:
        options.instruction || `This is a parent task that will be broken down into child tasks.`,
      tasks: ['Break down into subtasks', 'Create subtask files', 'Track progress'],
    };

    // Create overview document
    const result = await create(projectRoot, overviewOptions, config);
    if (!result.success || !result.data) {
      // Cleanup folder on failure
      rmSync(taskFolder, { recursive: true, force: true });
      return {
        success: false,
        error: result.error || 'Failed to create overview',
      };
    }

    // Move the created task to the correct location
    const overviewResult = await moveTaskToParentFolder(result.data, overviewPath);
    if (!overviewResult.success) {
      // Cleanup on failure
      rmSync(taskFolder, { recursive: true, force: true });
      return overviewResult;
    }

    // Return the parent task
    return getParentTaskWithSubtasks(projectRoot, taskId, config);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create parent task',
    };
  }
}

// Helper functions (internal implementation details)

async function getParentTaskWithSubtasks(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig
): Promise<OperationResult<ParentTask>> {
  try {
    // Get the overview task
    const result = await get(projectRoot, taskId, config);
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Task not found',
      };
    }

    const task = result.data;

    // Verify it's a parent task (has _overview.md)
    if (!task.metadata.isParentTask) {
      return {
        success: false,
        error: `Task ${taskId} is not a parent task`,
      };
    }

    // Get subtasks
    const subtasks = await getSubtasksForParent(projectRoot, task.metadata.path);

    // Create parent task object
    const parentTask: ParentTask = {
      metadata: task.metadata,
      overview: task.document,
      subtasks,
    };

    return {
      success: true,
      data: parentTask,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get parent task',
    };
  }
}

async function getSubtasksForParent(projectRoot: string, overviewPath: string): Promise<Task[]> {
  const subtasks: Task[] = [];
  const taskFolder = dirname(overviewPath);

  if (!existsSync(taskFolder)) {
    return subtasks;
  }

  try {
    const files = readdirSync(taskFolder);
    
    for (const file of files) {
      if (file === '_overview.md' || !file.endsWith('.task.md')) {
        continue;
      }

      const subtaskPath = join(taskFolder, file);
      try {
        const content = readFileSync(subtaskPath, 'utf-8');
        const document = parseTaskDocument(content);
        const location = parseTaskLocation(subtaskPath, projectRoot);
        
        if (!location) continue;

        const id = getTaskIdFromFilename(subtaskPath);
        const sequenceMatch = file.match(/^(\d{2})[_-]/);
        const sequenceNumber = sequenceMatch ? sequenceMatch[1] : undefined;

        const metadata: TaskMetadata = {
          id,
          filename: file,
          path: subtaskPath,
          location,
          isParentTask: false,
          parentTask: basename(taskFolder),
          sequenceNumber,
        };

        subtasks.push({
          metadata,
          document,
        });
      } catch (error) {
        // Skip invalid subtask files
        console.error(`Failed to parse subtask ${file}:`, error);
      }
    }

    // Sort by sequence number
    subtasks.sort((a, b) => {
      const seqA = a.metadata.sequenceNumber || '99';
      const seqB = b.metadata.sequenceNumber || '99';
      return seqA.localeCompare(seqB);
    });

    return subtasks;
  } catch (error) {
    console.error(`Failed to read subtasks from ${taskFolder}:`, error);
    return [];
  }
}

async function deleteParentTaskWithSubtasks(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig
): Promise<OperationResult<void>> {
  try {
    // Get parent task to find folder location
    const parentResult = await getParentTaskWithSubtasks(projectRoot, taskId, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Parent task not found',
      };
    }

    const taskFolder = dirname(parentResult.data.metadata.path);

    // Delete entire folder (overview + all subtasks)
    rmSync(taskFolder, { recursive: true, force: true });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete parent task',
    };
  }
}

async function moveTaskToParentFolder(task: Task, targetPath: string): Promise<OperationResult<void>> {
  try {
    // Move the file to the parent folder location
    const fs = await import('node:fs');
    fs.renameSync(task.metadata.path, targetPath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to move task to parent folder',
    };
  }
}

/**
 * Check if a task can be converted to a parent task
 */
export async function canConvertToParent(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig
): Promise<boolean> {
  const result = await get(projectRoot, taskId, config);
  if (!result.success || !result.data) {
    return false;
  }

  // Can't convert if already parent or in archive
  return (
    !result.data.metadata.isParentTask && result.data.metadata.location.workflowState !== 'archive'
  );
}