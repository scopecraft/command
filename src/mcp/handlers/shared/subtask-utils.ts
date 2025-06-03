/**
 * Shared subtask utilities for MCP handlers
 * Provides consistent subtask operations across handlers
 */

import * as core from '../../../core/index.js';

/**
 * Response format for created subtasks
 */
export interface CreatedSubtask {
  id: string;
  title: string;
  sequence: string;
}

/**
 * Create a subtask with defaults from parent
 */
export async function createSubtaskWithDefaults(
  projectRoot: string,
  parentId: string,
  title: string,
  options: {
    type?: string;
    area?: string;
    parentType?: string;
    parentArea?: string;
  }
): Promise<{ success: boolean; subtask?: core.Task; error?: string }> {
  try {
    // Use parent's type and area as defaults if not specified
    const subtaskType = options.type || options.parentType || 'feature';
    const subtaskArea = options.area || options.parentArea || 'general';

    const result = await core.parent(projectRoot, parentId).create(title, {
      type: subtaskType as core.TaskType,
      area: subtaskArea,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create subtask',
      };
    }

    return {
      success: true,
      subtask: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subtask',
    };
  }
}

/**
 * Build standardized subtask response format
 */
export function buildSubtaskResponse(subtask: core.Task): CreatedSubtask {
  return {
    id: subtask.metadata.id,
    title: subtask.document.title,
    sequence: subtask.metadata.sequenceNumber || '01',
  };
}

/**
 * Group subtasks by their parallel relationships
 * Returns a map of base task ID to all tasks that should be parallel with it
 */
export function groupParallelSubtasks(
  subtasks: Array<{ title: string; parallelWith?: string }>,
  createdSubtasks: CreatedSubtask[]
): Record<string, string[]> {
  const parallelGroups: Record<string, string[]> = {};

  for (const task of subtasks) {
    if (!task.parallelWith) continue;

    // Find the current task that was just created
    const currentSubtask = createdSubtasks.find((st) => st.title === task.title);
    if (!currentSubtask) continue;

    // Find the target task to be parallel with
    const targetSubtask = findTargetSubtask(task.parallelWith, createdSubtasks);
    if (!targetSubtask) continue;

    // Group tasks that should share the same sequence number
    const groupKey = targetSubtask.id;
    if (!parallelGroups[groupKey]) {
      parallelGroups[groupKey] = [targetSubtask.id];
    }
    parallelGroups[groupKey].push(currentSubtask.id);
  }

  return parallelGroups;
}

/**
 * Find a target subtask by title, ID, or partial ID
 */
function findTargetSubtask(
  identifier: string,
  createdSubtasks: CreatedSubtask[]
): CreatedSubtask | undefined {
  return createdSubtasks.find(
    (st) =>
      st.title === identifier || st.id === identifier || (identifier && st.id.endsWith(identifier)) // Handle partial ID match
  );
}

/**
 * Apply parallelization to grouped subtasks
 */
export async function applyParallelizations(
  projectRoot: string,
  parentId: string,
  parallelGroups: Record<string, string[]>
): Promise<void> {
  for (const [_baseTaskId, allIds] of Object.entries(parallelGroups)) {
    // Remove duplicates and parallelize
    const uniqueIds = [...new Set(allIds)];
    if (uniqueIds.length > 1) {
      await core.parent(projectRoot, parentId).parallelize(uniqueIds);
    }
  }
}
