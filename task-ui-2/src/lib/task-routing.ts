/**
 * Helper functions for task routing
 */

/**
 * Generate a URL for a task - handles parent tasks, subtasks, and simple tasks
 */
export function getTaskUrl(task: any): string {
  // Check if it's a parent task
  if (task.metadata?.isParentTask || task.task_type === 'parent') {
    return `/parents/${task.id || task.metadata?.id}`
  }
  
  // Check if it's a subtask (has parent_task or parentTask)
  if (task.metadata?.parentTask || task.parent_task) {
    const parentId = task.metadata?.parentTask || task.parent_task
    const subtaskId = task.id || task.metadata?.id
    return `/parents/${parentId}/${subtaskId}`
  }
  
  // Simple tasks
  return `/tasks/${task.id || task.metadata?.id}`
}

/**
 * Check if a task is a subtask
 */
export function isSubtask(task: any): boolean {
  return !!(task.metadata?.parentTask || task.parent_task)
}

/**
 * Get parent task ID from a subtask
 */
export function getParentTaskId(subtask: any): string | null {
  return subtask.metadata?.parentTask || subtask.parent_task || null
}