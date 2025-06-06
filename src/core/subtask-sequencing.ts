/**
 * Subtask Sequencing Operations
 *
 * Provides low-level operations for managing subtask sequences
 * including reordering, parallelization, and insertion
 */

import { existsSync, renameSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { getSubtaskFiles, getSubtaskSequence, isParentTaskFolder } from './directory-utils.js';
import type { OperationResult, SubtaskInfo } from './types.js';

/**
 * Result of a sequencing operation
 */
export interface SequencingResult {
  renamedFiles: Array<{
    from: string;
    to: string;
  }>;
  errors: string[];
}

/**
 * Task order specification for resequencing
 */
export interface TaskOrder {
  taskId: string; // Current filename without .task.md
  newSequence: string; // New sequence number (01, 02, etc)
}

/**
 * Extract task name from a subtask filename
 * Example: "02_impl-auth-05K" -> "impl-auth-05K"
 */
function extractTaskName(filename: string): string {
  const match = filename.match(/^\d{2}_(.+)$/);
  return match ? match[1] : filename;
}

/**
 * Build a new subtask filename with given sequence
 */
function buildSubtaskFilename(sequence: string, taskName: string): string {
  // Ensure taskName doesn't have .task.md extension
  const cleanName = taskName.replace(/\.task\.md$/, '');
  return `${sequence}_${cleanName}.task.md`;
}

/**
 * Reorder subtasks in a parent folder
 * This is the main low-level operation for sequence management
 */
export function reorderSubtasks(
  parentFolder: string,
  newOrder: TaskOrder[]
): OperationResult<SequencingResult> {
  try {
    // Validate parent folder
    if (!isParentTaskFolder(parentFolder)) {
      return {
        success: false,
        error: 'Not a valid parent task folder',
      };
    }

    // Get current subtasks
    const currentFiles = getSubtaskFiles(parentFolder);
    const result: SequencingResult = {
      renamedFiles: [],
      errors: [],
    };

    // Create a map of current files by their base name (without sequence)
    const fileMap = new Map<string, string>();
    for (const file of currentFiles) {
      const filename = basename(file);
      const taskName = extractTaskName(filename.replace(/\.task\.md$/, ''));
      fileMap.set(taskName, file);
    }

    // Process reordering
    const processedFiles = new Set<string>();
    const targetFilenames = new Set<string>();

    for (const order of newOrder) {
      // Find the file to rename
      let sourceFile: string | undefined;

      // First try exact match with current filename
      if (order.taskId.includes('_')) {
        // It's already a subtask filename
        sourceFile = currentFiles.find((f) => basename(f).startsWith(order.taskId));
      } else {
        // It's just the task name part
        sourceFile = fileMap.get(order.taskId);
      }

      if (!sourceFile) {
        result.errors.push(`Task not found: ${order.taskId}`);
        continue;
      }

      // Build new filename
      const taskName = extractTaskName(basename(sourceFile).replace(/\.task\.md$/, ''));
      const newFilename = buildSubtaskFilename(order.newSequence, taskName);
      const newPath = join(parentFolder, newFilename);

      // Check for conflicts
      if (targetFilenames.has(newFilename)) {
        result.errors.push(`Duplicate sequence ${order.newSequence} for multiple tasks`);
        continue;
      }

      targetFilenames.add(newFilename);
      processedFiles.add(sourceFile);

      // Only rename if actually changing
      if (basename(sourceFile) !== newFilename) {
        result.renamedFiles.push({
          from: sourceFile,
          to: newPath,
        });
      }
    }

    // Check for unprocessed files
    const unprocessed = currentFiles.filter((f) => !processedFiles.has(f));
    if (unprocessed.length > 0) {
      result.errors.push(
        `Not all subtasks were included in reordering. Missing: ${unprocessed
          .map((f) => basename(f))
          .join(', ')}`
      );
    }

    // Perform the actual renames in two passes to avoid conflicts
    // First pass: rename to temporary names
    const tempRenames: Array<{ temp: string; final: string }> = [];
    for (const rename of result.renamedFiles) {
      const tempName = join(dirname(rename.from), `.tmp_${Date.now()}_${basename(rename.to)}`);
      renameSync(rename.from, tempName);
      tempRenames.push({ temp: tempName, final: rename.to });
    }

    // Second pass: rename to final names
    for (const { temp, final } of tempRenames) {
      renameSync(temp, final);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reorder subtasks',
    };
  }
}

/**
 * Make a set of tasks parallel by giving them the same sequence number
 */
export function makeTasksParallel(
  parentFolder: string,
  taskIds: string[],
  targetSequence?: string
): OperationResult<SequencingResult> {
  try {
    if (taskIds.length < 2) {
      return {
        success: false,
        error: 'At least 2 tasks required to make parallel',
      };
    }

    // Get current subtasks
    const currentFiles = getSubtaskFiles(parentFolder);

    // Find the tasks to make parallel
    const tasksToUpdate: string[] = [];
    for (const taskId of taskIds) {
      const file = currentFiles.find((f) => {
        const filename = basename(f);
        return filename.includes(taskId) || filename === `${taskId}.task.md`;
      });

      if (!file) {
        return {
          success: false,
          error: `Task not found: ${taskId}`,
        };
      }

      tasksToUpdate.push(file);
    }

    // Determine target sequence
    let sequence = targetSequence;
    if (!sequence) {
      // Use the lowest sequence number from the selected tasks
      const sequences = tasksToUpdate
        .map((f) => getSubtaskSequence(basename(f)))
        .filter(Boolean)
        .map((s) => Number.parseInt(s!, 10));

      if (sequences.length > 0) {
        sequence = String(Math.min(...sequences)).padStart(2, '0');
      } else {
        sequence = '01';
      }
    }

    // Build new order keeping these tasks parallel
    const newOrder: TaskOrder[] = [];

    // Add the parallel tasks
    for (const file of tasksToUpdate) {
      const taskName = extractTaskName(basename(file).replace(/\.task\.md$/, ''));
      newOrder.push({
        taskId: taskName,
        newSequence: sequence,
      });
    }

    // Add other tasks maintaining their relative order
    let nextSeq = Number.parseInt(sequence, 10) + 1;
    for (const file of currentFiles) {
      if (!tasksToUpdate.includes(file)) {
        const taskName = extractTaskName(basename(file).replace(/\.task\.md$/, ''));
        newOrder.push({
          taskId: taskName,
          newSequence: String(nextSeq).padStart(2, '0'),
        });
        nextSeq++;
      }
    }

    return reorderSubtasks(parentFolder, newOrder);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to make tasks parallel',
    };
  }
}

/**
 * Insert a task after another task in the sequence
 */
export function insertTaskAfter(
  parentFolder: string,
  taskId: string,
  afterTaskId: string
): OperationResult<SequencingResult> {
  try {
    const currentFiles = getSubtaskFiles(parentFolder);

    // Find both tasks
    const taskFile = currentFiles.find((f) => basename(f).includes(taskId));
    const afterFile = currentFiles.find((f) => basename(f).includes(afterTaskId));

    if (!taskFile || !afterFile) {
      return {
        success: false,
        error: `Task not found: ${!taskFile ? taskId : afterTaskId}`,
      };
    }

    // Get sequence of target position
    const afterSeq = getSubtaskSequence(basename(afterFile));
    if (!afterSeq) {
      return {
        success: false,
        error: 'Invalid subtask sequence',
      };
    }

    // Build new order
    const newOrder: TaskOrder[] = [];
    const insertSeq = Number.parseInt(afterSeq, 10) + 1;

    for (const file of currentFiles) {
      const filename = basename(file);
      const taskName = extractTaskName(filename.replace(/\.task\.md$/, ''));
      const currentSeq = getSubtaskSequence(filename);

      if (file === taskFile) {
        // Skip for now, will be inserted later
        continue;
      }

      if (currentSeq && Number.parseInt(currentSeq, 10) >= insertSeq) {
        // Shift sequences up
        newOrder.push({
          taskId: taskName,
          newSequence: String(Number.parseInt(currentSeq, 10) + 1).padStart(2, '0'),
        });
      } else {
        // Keep current sequence
        newOrder.push({
          taskId: taskName,
          newSequence: currentSeq || '01',
        });
      }
    }

    // Insert the task
    const taskName = extractTaskName(basename(taskFile).replace(/\.task\.md$/, ''));
    newOrder.splice(
      newOrder.findIndex((o) => o.newSequence === String(insertSeq + 1).padStart(2, '0')),
      0,
      {
        taskId: taskName,
        newSequence: String(insertSeq).padStart(2, '0'),
      }
    );

    // Sort by sequence to ensure proper order
    newOrder.sort((a, b) => a.newSequence.localeCompare(b.newSequence));

    return reorderSubtasks(parentFolder, newOrder);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to insert task',
    };
  }
}

/**
 * Get the next available sequence number in a parent folder
 */
export function getNextSequenceNumber(parentFolder: string): string {
  const subtasks = getSubtaskFiles(parentFolder);

  if (subtasks.length === 0) {
    return '01';
  }

  // Find highest sequence
  let maxSeq = 0;
  for (const file of subtasks) {
    const seq = getSubtaskSequence(basename(file));
    if (seq) {
      const num = Number.parseInt(seq, 10);
      if (num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  return String(maxSeq + 1).padStart(2, '0');
}

/**
 * Validate a sequence number
 */
export function isValidSequence(sequence: string): boolean {
  return (
    /^[0-9]{2}$/.test(sequence) &&
    Number.parseInt(sequence, 10) >= 1 &&
    Number.parseInt(sequence, 10) <= 99
  );
}

/**
 * List subtasks with their sequence info
 */
export function listSubtasksWithSequence(parentFolder: string): SubtaskInfo[] {
  const files = getSubtaskFiles(parentFolder);
  const subtasks: SubtaskInfo[] = [];

  // Group by sequence to detect parallel tasks
  const bySequence = new Map<string, string[]>();

  for (const file of files) {
    const filename = basename(file);
    const sequence = getSubtaskSequence(filename);

    if (sequence) {
      if (!bySequence.has(sequence)) {
        bySequence.set(sequence, []);
      }
      bySequence.get(sequence)!.push(filename);
    }
  }

  // Build result
  for (const file of files) {
    const filename = basename(file);
    const sequence = getSubtaskSequence(filename);

    if (sequence) {
      const parallelTasks = bySequence.get(sequence) || [];
      subtasks.push({
        sequenceNumber: sequence,
        filename,
        canRunParallel: parallelTasks.length > 1,
      });
    }
  }

  // Sort by sequence
  return subtasks.sort((a, b) => a.sequenceNumber.localeCompare(b.sequenceNumber));
}
