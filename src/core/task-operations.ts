/**
 * Task Operations
 *
 * High-level operations for task management including sequencing,
 * conversions, and workflow transitions
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import {
  getArchiveDirectory,
  getSubtaskSequence,
  getTaskIdFromFilename,
  getWorkflowDirectory,
  isParentTaskFolder,
  parseTaskLocation,
} from './directory-utils.js';
import { generateSubtaskId, generateTaskId, parseTaskId } from './id-generator.js';
import {
  addSubtask as addSubtaskLowLevel,
  createParentTask,
  getParentTask,
} from './parent-tasks.js';
import {
  type TaskOrder,
  insertTaskAfter,
  makeTasksParallel,
  reorderSubtasks,
  updateSubtaskSequence as updateSequenceLowLevel,
} from './subtask-sequencing.js';
import { create as createTask, del as deleteTask, get as getTask, move as moveTask, update as updateTask } from './task-crud.js';
import { parseTaskDocument, serializeTaskDocument } from './task-parser.js';
import type {
  OperationResult,
  Task,
  TaskCreateOptions,
  TaskMetadata,
  ProjectConfig,
  WorkflowState,
} from './types.js';

/**
 * Resequence subtasks within a parent
 * Maps positions to task orders for the low-level function
 */
export async function resequenceSubtasks(
  projectRoot: string,
  parentId: string,
  fromPositions: number[],
  toPositions: number[],
  config?: ProjectConfig
): Promise<OperationResult<void>> {
  try {
    // Get parent task to find folder
    const parentResult = await getParentTask(projectRoot, parentId, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Parent task not found',
      };
    }

    const parentFolder = dirname(parentResult.data.metadata.path);
    const subtasks = parentResult.data.subtasks;

    // Validate positions
    if (fromPositions.length !== toPositions.length) {
      return {
        success: false,
        error: 'From and to positions must have same length',
      };
    }

    // Sort subtasks by sequence
    subtasks.sort((a, b) => {
      const seqA = a.metadata.sequenceNumber || '99';
      const seqB = b.metadata.sequenceNumber || '99';
      return seqA.localeCompare(seqB);
    });

    // Build new order
    const newOrder: TaskOrder[] = [];
    const movedTasks = new Map<number, number>(); // from -> to

    for (let i = 0; i < fromPositions.length; i++) {
      movedTasks.set(fromPositions[i] - 1, toPositions[i] - 1); // Convert to 0-based
    }

    // Create new ordering
    for (let i = 0; i < subtasks.length; i++) {
      let targetPosition = i;

      // Check if this position has a moved task
      for (const [from, to] of movedTasks) {
        if (to === i) {
          targetPosition = from;
          break;
        }
      }

      // If this task is being moved, skip it here
      if (movedTasks.has(i)) {
        continue;
      }

      const task = subtasks[targetPosition];
      const taskName = basename(task.metadata.filename).replace(/\.task\.md$/, '');
      newOrder.push({
        taskId: taskName,
        newSequence: String(i + 1).padStart(2, '0'),
      });
    }

    // Add moved tasks at their new positions
    for (const [from, to] of movedTasks) {
      const task = subtasks[from];
      const taskName = basename(task.metadata.filename).replace(/\.task\.md$/, '');
      newOrder.splice(to, 0, {
        taskId: taskName,
        newSequence: String(to + 1).padStart(2, '0'),
      });
    }

    // Apply reordering
    const result = reorderSubtasks(parentFolder, newOrder);
    if (!result.success) {
      return result;
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resequence subtasks',
    };
  }
}

/**
 * Make multiple subtasks parallel
 */
export async function parallelizeSubtasks(
  projectRoot: string,
  parentId: string,
  subtaskIds: string[],
  targetSequence?: string,
  config?: ProjectConfig
): Promise<OperationResult<void>> {
  try {
    // Get parent task
    const parentResult = await getParentTask(projectRoot, parentId, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Parent task not found',
      };
    }

    const parentFolder = dirname(parentResult.data.metadata.path);

    // Use the low-level function
    const result = makeTasksParallel(parentFolder, subtaskIds, targetSequence);
    if (!result.success) {
      return result;
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parallelize subtasks',
    };
  }
}

/**
 * Update a single subtask's sequence
 */
export async function updateSubtaskSequence(
  projectRoot: string,
  parentId: string,
  subtaskId: string,
  newSequence: string,
  options: { force?: boolean } = {},
  config?: ProjectConfig
): Promise<OperationResult<void>> {
  try {
    // Get parent task
    const parentResult = await getParentTask(projectRoot, parentId, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Parent task not found',
      };
    }

    const parentFolder = dirname(parentResult.data.metadata.path);
    const subtasks = parentResult.data.subtasks;

    // Check if sequence is already taken
    if (!options.force) {
      const existingTask = subtasks.find((t) => t.metadata.sequenceNumber === newSequence);
      if (existingTask && existingTask.metadata.id !== subtaskId) {
        return {
          success: false,
          error: `Sequence ${newSequence} is already taken by ${existingTask.metadata.id}. Use --force to make parallel.`,
        };
      }
    }

    // Build new order
    const newOrder: TaskOrder[] = subtasks.map((task) => {
      const taskName = basename(task.metadata.filename).replace(/\.task\.md$/, '');
      if (task.metadata.id === subtaskId || taskName.includes(subtaskId)) {
        return {
          taskId: taskName,
          newSequence,
        };
      }
      return {
        taskId: taskName,
        newSequence: task.metadata.sequenceNumber || '99',
      };
    });

    // Apply reordering
    const result = reorderSubtasks(parentFolder, newOrder);
    if (!result.success) {
      return result;
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update subtask sequence',
    };
  }
}

/**
 * Promote a simple task to a parent task
 */
export async function promoteToParent(
  projectRoot: string,
  taskId: string,
  options: {
    subtasks?: string[];
    keepOriginal?: boolean;
  } = {},
  config?: ProjectConfig
): Promise<OperationResult<Task>> {
  try {
    // Get the task to promote
    const taskResult = await getTask(projectRoot, taskId, config);
    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || 'Task not found',
      };
    }

    const task = taskResult.data;

    // Can't promote if already a parent
    if (task.metadata.isParentTask) {
      return {
        success: false,
        error: 'Task is already a parent task',
      };
    }

    // Can't promote from archive
    if (task.metadata.location.workflowState === 'archive') {
      return {
        success: false,
        error: 'Cannot promote archived tasks',
      };
    }

    // Create parent task with same content
    const parentOptions: TaskCreateOptions = {
      title: task.document.title,
      type: task.document.frontmatter.type,
      area: task.document.frontmatter.area,
      status: task.document.frontmatter.status,
      workflowState: task.metadata.location.workflowState,
      instruction: task.document.sections.instruction,
      tasks: [], // Will be populated with subtasks
      deliverable: task.document.sections.deliverable,
      customMetadata: Object.entries(task.document.frontmatter)
        .filter(([key]) => !['type', 'status', 'area'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
    };

    // Create the parent task
    const parentResult = await createParentTask(projectRoot, parentOptions, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Failed to create parent task',
      };
    }

    const parentTask = parentResult.data;

    // Add initial subtasks if requested
    if (options.subtasks && options.subtasks.length > 0) {
      for (const subtaskTitle of options.subtasks) {
        await addSubtaskLowLevel(projectRoot, parentTask.metadata.id, subtaskTitle, {}, config);
      }
    }

    // If keeping original as subtask
    if (options.keepOriginal) {
      // Copy content to first subtask
      await addSubtaskLowLevel(
        projectRoot,
        parentTask.metadata.id,
        task.document.title,
        {
          instruction: task.document.sections.instruction,
          tasks: task.document.sections.tasks
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => line.replace(/^-\s*\[.\]\s*/, '').trim()),
          deliverable: task.document.sections.deliverable,
        },
        config
      );
    }

    // Delete the original task
    await deleteTask(projectRoot, taskId, config);

    // Return the parent task as a regular task (overview)
    const finalResult = await getTask(projectRoot, parentTask.metadata.id, config);
    if (!finalResult.success || !finalResult.data) {
      return {
        success: false,
        error: 'Failed to get promoted task',
      };
    }

    return finalResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to promote task',
    };
  }
}

/**
 * Extract a subtask to become a floating task
 */
export async function extractSubtask(
  projectRoot: string,
  parentId: string,
  subtaskId: string,
  targetLocation: WorkflowState,
  config?: ProjectConfig
): Promise<OperationResult<Task>> {
  try {
    // Get parent task
    const parentResult = await getParentTask(projectRoot, parentId, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Parent task not found',
      };
    }

    // Find the subtask
    const subtask = parentResult.data.subtasks.find(
      (st) => st.metadata.id === subtaskId || st.metadata.filename.includes(subtaskId)
    );

    if (!subtask) {
      return {
        success: false,
        error: `Subtask not found: ${subtaskId}`,
      };
    }

    // Create a new floating task with same content
    const floatingOptions: TaskCreateOptions = {
      title: subtask.document.title,
      type: subtask.document.frontmatter.type,
      area: subtask.document.frontmatter.area,
      status: subtask.document.frontmatter.status,
      workflowState: targetLocation,
      instruction: subtask.document.sections.instruction,
      tasks: subtask.document.sections.tasks
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => line.replace(/^-\s*\[.\]\s*/, '').trim()),
      deliverable: subtask.document.sections.deliverable,
      customMetadata: Object.entries(subtask.document.frontmatter)
        .filter(([key]) => !['type', 'status', 'area'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
    };

    // Create the floating task
    const createResult = await createTask(projectRoot, floatingOptions, config);
    if (!createResult.success || !createResult.data) {
      return {
        success: false,
        error: createResult.error || 'Failed to create floating task',
      };
    }

    // Delete the subtask
    rmSync(subtask.metadata.path);

    return createResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract subtask',
    };
  }
}

/**
 * Adopt a floating task into a parent as a subtask
 */
export async function adoptTask(
  projectRoot: string,
  parentId: string,
  taskId: string,
  options: {
    sequence?: string;
    after?: string;
    before?: string;
  } = {},
  config?: ProjectConfig
): Promise<OperationResult<Task>> {
  try {
    // Get the floating task
    const taskResult = await getTask(projectRoot, taskId, config);
    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || 'Task not found',
      };
    }

    const task = taskResult.data;

    // Can't adopt parent tasks
    if (task.metadata.isParentTask) {
      return {
        success: false,
        error: 'Cannot adopt a parent task as a subtask',
      };
    }

    // Get parent task
    const parentResult = await getParentTask(projectRoot, parentId, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Parent task not found',
      };
    }

    const parentTask = parentResult.data;
    const parentFolder = dirname(parentTask.metadata.path);

    // Determine sequence
    let sequence = options.sequence;
    if (!sequence) {
      if (options.after) {
        // Find the task to insert after
        const afterTask = parentTask.subtasks.find(
          (st) => st.metadata.id === options.after || st.metadata.filename.includes(options.after!)
        );
        if (afterTask && afterTask.metadata.sequenceNumber) {
          const afterSeq = Number.parseInt(afterTask.metadata.sequenceNumber, 10);
          sequence = String(afterSeq + 1).padStart(2, '0');
        }
      } else if (options.before) {
        // Find the task to insert before
        const beforeTask = parentTask.subtasks.find(
          (st) =>
            st.metadata.id === options.before || st.metadata.filename.includes(options.before!)
        );
        if (beforeTask && beforeTask.metadata.sequenceNumber) {
          const beforeSeq = Number.parseInt(beforeTask.metadata.sequenceNumber, 10);
          sequence = String(Math.max(1, beforeSeq - 1)).padStart(2, '0');
        }
      } else {
        // Default to next available
        sequence = String(parentTask.subtasks.length + 1).padStart(2, '0');
      }
    }

    // Generate new subtask ID
    const subtaskId = generateSubtaskId(task.document.title, sequence);
    const subtaskPath = join(parentFolder, `${subtaskId}.task.md`);

    // Read original content
    const originalContent = readFileSync(task.metadata.path, 'utf-8');

    // Write to new location
    writeFileSync(subtaskPath, originalContent, 'utf-8');

    // Delete original
    rmSync(task.metadata.path);

    // If we need to shift other sequences
    if (options.after || options.before) {
      // Get updated parent task
      const updatedParent = await getParentTask(projectRoot, parentId, config);
      if (updatedParent.success && updatedParent.data) {
        // Reorder to ensure proper sequencing
        const subtasks = updatedParent.data.subtasks.sort((a, b) => {
          const seqA = Number.parseInt(a.metadata.sequenceNumber || '99', 10);
          const seqB = Number.parseInt(b.metadata.sequenceNumber || '99', 10);
          return seqA - seqB;
        });

        const newOrder: TaskOrder[] = subtasks.map((st, index) => ({
          taskId: basename(st.metadata.filename).replace(/\.task\.md$/, ''),
          newSequence: String(index + 1).padStart(2, '0'),
        }));

        reorderSubtasks(parentFolder, newOrder);
      }
    }

    // Return the adopted task with parent context for efficient lookup
    const adoptedResult = await getTask(projectRoot, subtaskId, config, parentId);
    if (!adoptedResult.success || !adoptedResult.data) {
      return {
        success: false,
        error: 'Failed to get adopted task',
      };
    }

    return adoptedResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to adopt task',
    };
  }
}

/**
 * Enhanced addSubtask with sequence options
 */
export async function addSubtask(
  projectRoot: string,
  parentId: string,
  title: string,
  options: {
    sequence?: string;
    parallelWith?: string;
    after?: string;
    before?: string;
    type?: string;
    assignee?: string;
    [key: string]: unknown;
  } = {},
  config?: ProjectConfig
): Promise<OperationResult<Task>> {
  try {
    // Get parent task
    const parentResult = await getParentTask(projectRoot, parentId, config);
    if (!parentResult.success || !parentResult.data) {
      return {
        success: false,
        error: parentResult.error || 'Parent task not found',
      };
    }

    const parentTask = parentResult.data;

    // Determine sequence
    let sequence = options.sequence;

    if (options.parallelWith) {
      // Find the task to be parallel with
      const parallelTask = parentTask.subtasks.find(
        (st) =>
          st.metadata.id === options.parallelWith ||
          st.metadata.filename.includes(options.parallelWith!)
      );
      if (parallelTask && parallelTask.metadata.sequenceNumber) {
        sequence = parallelTask.metadata.sequenceNumber;
      }
    } else if (options.after) {
      // Insert after specific task
      const afterTask = parentTask.subtasks.find(
        (st) => st.metadata.id === options.after || st.metadata.filename.includes(options.after!)
      );
      if (afterTask && afterTask.metadata.sequenceNumber) {
        const afterSeq = Number.parseInt(afterTask.metadata.sequenceNumber, 10);
        sequence = String(afterSeq + 1).padStart(2, '0');
      }
    } else if (options.before) {
      // Insert before specific task
      const beforeTask = parentTask.subtasks.find(
        (st) => st.metadata.id === options.before || st.metadata.filename.includes(options.before!)
      );
      if (beforeTask && beforeTask.metadata.sequenceNumber) {
        const beforeSeq = Number.parseInt(beforeTask.metadata.sequenceNumber, 10);
        sequence = String(Math.max(1, beforeSeq - 1)).padStart(2, '0');
      }
    }

    // If no sequence determined, use next available
    if (!sequence) {
      const sequences = parentTask.subtasks
        .map((st) => Number.parseInt(st.metadata.sequenceNumber || '0', 10))
        .filter((seq) => seq > 0);
      const maxSeq = sequences.length > 0 ? Math.max(...sequences) : 0;
      sequence = String(maxSeq + 1).padStart(2, '0');
    }

    // Create subtask with specific sequence
    const subtaskId = generateSubtaskId(title, sequence);
    const parentFolder = dirname(parentTask.metadata.path);
    const subtaskPath = join(parentFolder, `${subtaskId}.task.md`);

    // Prepare options for creation
    const createOptions: TaskCreateOptions = {
      title,
      type: options.type || parentTask.overview.frontmatter.type,
      area: parentTask.overview.frontmatter.area,
      status: 'To Do',
      workflowState: parentTask.metadata.location.workflowState,
      customMetadata: options.assignee ? { assignee: options.assignee } : undefined,
    };

    // Create the task using low-level function
    const createResult = await createTask(projectRoot, createOptions, config);
    if (!createResult.success || !createResult.data) {
      return {
        success: false,
        error: createResult.error || 'Failed to create subtask',
      };
    }

    // Move to correct location with proper name
    try {
      renameSync(createResult.data.metadata.path, subtaskPath);
    } catch (error) {
      return {
        success: false,
        error: `Failed to move subtask from ${createResult.data.metadata.path} to ${subtaskPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // If we inserted in the middle, resequence
    if (options.after || options.before) {
      const updatedParent = await getParentTask(projectRoot, parentId, config);
      if (updatedParent.success && updatedParent.data) {
        const subtasks = updatedParent.data.subtasks.sort((a, b) => {
          const seqA = Number.parseInt(a.metadata.sequenceNumber || '99', 10);
          const seqB = Number.parseInt(b.metadata.sequenceNumber || '99', 10);
          return seqA - seqB;
        });

        const newOrder: TaskOrder[] = subtasks.map((st, index) => ({
          taskId: basename(st.metadata.filename).replace(/\.task\.md$/, ''),
          newSequence: String(index + 1).padStart(2, '0'),
        }));

        reorderSubtasks(parentFolder, newOrder);
      }
    }

    // Return the created subtask using getTask with parent context
    const subtaskResult = await getTask(projectRoot, subtaskId, config, parentId);
    if (!subtaskResult.success || !subtaskResult.data) {
      return {
        success: false,
        error: subtaskResult.error || 'Failed to read created subtask',
      };
    }

    return subtaskResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add subtask',
    };
  }
}
