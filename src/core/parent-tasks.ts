/**
 * Parent Task Support
 *
 * Handles folder-based tasks with child tasks (subtasks)
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import {
  getSubtaskFiles,
  getSubtaskSequence,
  getTaskIdFromFilename,
  getWorkflowDirectory,
  isParentTaskFolder,
  parseTaskLocation,
} from './directory-utils.js';
import { generateSubtaskId, generateUniqueTaskId } from './id-generator.js';
import { create as createTask, del as deleteTask, get as getTask, move as moveTask } from './task-crud.js';
import { ensureRequiredSections, parseTaskDocument } from './task-parser.js';
import type {
  OperationResult,
  ParentTask,
  SubtaskInfo,
  Task,
  TaskCreateOptions,
  TaskMetadata,
  TaskStatus,
  TaskType,
  ProjectConfig,
  WorkflowState,
} from './types.js';

/**
 * Create a parent task (folder with _overview.md)
 */
export async function createParentTask(
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
    const result = await createTask(projectRoot, overviewOptions, config);
    if (!result.success || !result.data) {
      // Cleanup folder on failure
      rmSync(taskFolder, { recursive: true, force: true });
      return {
        success: false,
        error: result.error || 'Failed to create overview',
      };
    }

    // Move the created file to _overview.md
    const tempPath = result.data.metadata.path;
    const fs = await import('node:fs');
    fs.renameSync(tempPath, overviewPath);

    // Update metadata
    result.data.metadata.path = overviewPath;
    result.data.metadata.filename = '_overview.md';
    result.data.metadata.isParentTask = true;

    // Create parent task object
    const parentTask: ParentTask = {
      metadata: result.data.metadata,
      overview: result.data.document,
      subtasks: [],
      supportingFiles: [],
    };

    return {
      success: true,
      data: parentTask,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create parent task',
    };
  }
}

/**
 * Add a subtask to a parent task
 */
export async function addSubtask(
  projectRoot: string,
  parentTaskId: string,
  subtaskTitle: string,
  options: Partial<TaskCreateOptions> = {},
  config?: ProjectConfig
): Promise<OperationResult<Task>> {
  try {
    // Get parent task
    const parentResult = await getParentTask(projectRoot, parentTaskId, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Parent task not found',
      };
    }

    const parentTask = parentResult.data;
    const taskFolder = dirname(parentTask.metadata.path);

    // Determine next sequence number
    const nextSequence = getNextSequenceNumber(taskFolder);

    // Generate subtask ID using the new format
    const subtaskId = generateSubtaskId(subtaskTitle, nextSequence);
    const subtaskPath = join(taskFolder, `${subtaskId}.task.md`);

    // Create subtask options
    const subtaskOptions: TaskCreateOptions = {
      title: subtaskTitle,
      type: (options.type || parentTask.overview.frontmatter.type) as TaskType,
      area: options.area || parentTask.overview.frontmatter.area,
      status: (options.status || 'To Do') as TaskStatus,
      workflowState: parentTask.metadata.location.workflowState,
      instruction: options.instruction || `Complete the subtask: ${subtaskTitle}`,
      tasks: options.tasks,
      deliverable: options.deliverable,
      customMetadata: options.customMetadata,
    };

    // Create subtask using standard task creation
    const result = await createTask(projectRoot, subtaskOptions, config);
    if (!result.success || !result.data) {
      return result;
    }

    // Move to correct location
    const fs = await import('node:fs');
    fs.renameSync(result.data.metadata.path, subtaskPath);

    // Update metadata
    result.data.metadata.path = subtaskPath;
    result.data.metadata.filename = `${subtaskId}.task.md`;
    result.data.metadata.id = subtaskId;
    result.data.metadata.parentTask = parentTaskId;
    result.data.metadata.sequenceNumber = nextSequence;

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add subtask',
    };
  }
}

/**
 * Get a parent task with all child tasks
 */
export async function getParentTask(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig
): Promise<OperationResult<ParentTask>> {
  try {
    // Get the overview task
    const result = await getTask(projectRoot, taskId, config);
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Task not found',
      };
    }

    const task = result.data;

    // Check if it's actually a parent task
    if (!task.metadata.isParentTask) {
      return {
        success: false,
        error: 'Not a parent task',
      };
    }

    // Get task folder
    const taskFolder = dirname(task.metadata.path);

    // Get subtasks
    const subtaskPaths = getSubtaskFiles(taskFolder);
    const subtasks: Task[] = [];

    for (const subtaskPath of subtaskPaths) {
      // Read subtask directly instead of trying to resolve by ID
      try {
        const content = readFileSync(subtaskPath, 'utf-8');
        const document = parseTaskDocument(content);

        // Parse location
        const location = parseTaskLocation(subtaskPath, projectRoot);
        if (!location) continue;

        // Get ID and sequence from filename
        const filename = basename(subtaskPath);
        const id = getTaskIdFromFilename(subtaskPath);
        const sequence = getSubtaskSequence(filename);

        // Create metadata
        const metadata: TaskMetadata = {
          id,
          filename,
          path: subtaskPath,
          location,
          isParentTask: false,
          parentTask: task.metadata.id,
          sequenceNumber: sequence || undefined,
        };

        subtasks.push({
          metadata,
          document,
        });
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    // Get supporting files
    const allFiles = readdirSync(taskFolder);
    const supportingFiles = allFiles.filter((file) => {
      const fullPath = join(taskFolder, file);
      if (!statSync(fullPath).isFile()) return false;
      if (file === '_overview.md') return false;
      if (file.endsWith('.task.md')) return false;
      return true;
    });

    // Create parent task object
    const parentTask: ParentTask = {
      metadata: task.metadata,
      overview: task.document,
      subtasks,
      supportingFiles,
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

/**
 * Move a parent task (entire folder)
 */
export async function moveParentTask(
  projectRoot: string,
  taskId: string,
  targetState: WorkflowState,
  config?: ProjectConfig
): Promise<OperationResult<ParentTask>> {
  try {
    // Get parent task
    const result = await getParentTask(projectRoot, taskId, config);
    if (!result.success || !result.data) {
      return result;
    }

    const parentTask = result.data;
    const currentFolder = dirname(parentTask.metadata.path);
    const folderName = basename(currentFolder);

    // Determine target directory
    const targetDir = getWorkflowDirectory(projectRoot, targetState, config);
    const targetFolder = join(targetDir, folderName);

    // Check if target exists
    if (existsSync(targetFolder)) {
      return {
        success: false,
        error: `Target folder already exists: ${targetFolder}`,
      };
    }

    // Ensure target directory exists
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Move entire folder
    const fs = await import('node:fs');
    fs.renameSync(currentFolder, targetFolder);

    // Update parent task metadata
    parentTask.metadata.path = join(targetFolder, '_overview.md');
    parentTask.metadata.location.workflowState = targetState;

    // Update all subtask metadata
    for (const subtask of parentTask.subtasks) {
      const newPath = join(targetFolder, basename(subtask.metadata.path));
      subtask.metadata.path = newPath;
      subtask.metadata.location.workflowState = targetState;
    }

    return {
      success: true,
      data: parentTask,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to move parent task',
    };
  }
}

/**
 * Delete a parent task (entire folder)
 */
export async function deleteParentTask(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig
): Promise<OperationResult<void>> {
  try {
    // Get parent task to find folder
    const result = await getParentTask(projectRoot, taskId, config);
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Parent task not found',
      };
    }

    const taskFolder = dirname(result.data.metadata.path);

    // Delete entire folder
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

/**
 * List subtasks of a parent task
 */
export function listSubtasks(parentTaskFolder: string): SubtaskInfo[] {
  const subtaskPaths = getSubtaskFiles(parentTaskFolder);
  const subtasks: SubtaskInfo[] = [];

  for (const path of subtaskPaths) {
    const filename = basename(path);
    const sequence = getSubtaskSequence(filename);

    if (sequence) {
      // Check if another task has same sequence (parallel execution)
      const canRunParallel = subtaskPaths.some((other) => {
        if (other === path) return false;
        const otherSeq = getSubtaskSequence(basename(other));
        return otherSeq === sequence;
      });

      subtasks.push({
        sequenceNumber: sequence,
        filename,
        canRunParallel,
      });
    }
  }

  return subtasks.sort((a, b) => a.sequenceNumber.localeCompare(b.sequenceNumber));
}

/**
 * Get next sequence number for subtasks
 */
function getNextSequenceNumber(taskFolder: string): string {
  const subtasks = listSubtasks(taskFolder);

  if (subtasks.length === 0) {
    return '01';
  }

  // Find highest sequence number
  const sequences = subtasks.map((s) => Number.parseInt(s.sequenceNumber, 10));
  const highest = Math.max(...sequences);

  return String(highest + 1).padStart(2, '0');
}

/**
 * Check if a task can be converted to parent
 */
export async function canConvertToParent(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig
): Promise<boolean> {
  const result = await getTask(projectRoot, taskId, config);
  if (!result.success || !result.data) {
    return false;
  }

  // Can't convert if already parent or in archive
  return (
    !result.data.metadata.isParentTask && result.data.metadata.location.workflowState !== 'archive'
  );
}
