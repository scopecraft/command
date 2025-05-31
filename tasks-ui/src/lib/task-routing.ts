/**
 * Helper functions for task routing - simplified for normalized API
 */

import type { Task } from './types';

/**
 * Generate a URL for a task using normalized taskStructure field
 */
export function getTaskUrl(
  task: Pick<Task, 'id' | 'taskStructure'> & { parentId?: string }
): string {
  switch (task.taskStructure) {
    case 'parent':
      return `/parents/${task.id}`;
    case 'subtask':
      return `/parents/${task.parentId}/${task.id}`;
    default:
      return `/tasks/${task.id}`;
  }
}

/**
 * Check if a task is a subtask
 */
export function isSubtask(task: Pick<Task, 'taskStructure'>): boolean {
  return task.taskStructure === 'subtask';
}

/**
 * Get parent task ID from a subtask
 */
export function getParentTaskId(
  subtask: Pick<Task, 'taskStructure'> & { parentId?: string }
): string | null {
  return subtask.taskStructure === 'subtask' ? subtask.parentId || null : null;
}
