import type { OperationResult, Task } from '../types.js';
import { getTask, listTasks } from './task-crud.js';

/**
 * Find the next task based on dependencies and workflow sequence
 * @param taskId Current task ID (optional)
 * @returns Operation result with next task if found
 */
export async function findNextTask(taskId?: string): Promise<OperationResult<Task | null>> {
  try {
    if (!taskId) {
      // If no task ID provided, find the first task that has no dependencies or previous task
      const tasksResult = await listTasks({ include_content: true });

      if (!tasksResult.success || !tasksResult.data) {
        return {
          success: false,
          error: tasksResult.error || 'Failed to list tasks',
        };
      }

      const tasks = tasksResult.data;

      // Skip overview files when suggesting next task
      const nonOverviewTasks = tasks.filter((task) => !task.metadata.is_overview);

      // Filter to tasks that aren't blocked by dependencies or previous tasks
      const availableTasks = nonOverviewTasks.filter((task) => {
        // Skip tasks with previous_task set (they are part of a sequence)
        if (task.metadata.previous_task) return false;

        // Skip tasks with unmet dependencies
        if (
          task.metadata.depends &&
          Array.isArray(task.metadata.depends) &&
          task.metadata.depends.length > 0
        ) {
          // Check if all dependencies are completed
          const allDepsCompleted = task.metadata.depends.every((depId) => {
            const depTask = tasks.find((t) => t.metadata.id === depId);
            return (
              depTask &&
              (depTask.metadata.status?.includes('Done') ||
                depTask.metadata.status?.includes('🟢') ||
                depTask.metadata.status?.includes('Completed') ||
                depTask.metadata.status?.includes('Complete'))
            );
          });

          if (!allDepsCompleted) return false;
        }

        return true;
      });

      if (availableTasks.length === 0) {
        return {
          success: true,
          data: null,
          message: 'No available tasks found. Consider completing dependencies first.',
        };
      }

      // Sort by priority
      const priorityOrder: Record<string, number> = {
        '🔥 Highest': 4,
        '🔼 High': 3,
        '▶️ Medium': 2,
        '🔽 Low': 1,
        '': 0,
      };

      availableTasks.sort((a, b) => {
        const aPrio = priorityOrder[a.metadata.priority || ''] || 0;
        const bPrio = priorityOrder[b.metadata.priority || ''] || 0;

        if (aPrio !== bPrio) {
          return bPrio - aPrio; // Higher priority first
        }

        // If priorities are the same, sort by creation date
        const aDate = a.metadata.created_date ? new Date(a.metadata.created_date).getTime() : 0;
        const bDate = b.metadata.created_date ? new Date(b.metadata.created_date).getTime() : 0;
        return aDate - bDate; // Older tasks first
      });

      return {
        success: true,
        data: availableTasks[0],
      };
    }
    // If a task ID is provided, find the next task in sequence first
    const taskResult = await getTask(taskId);

    if (!taskResult.success || !taskResult.data) {
      return {
        success: false,
        error: taskResult.error || `Task with ID ${taskId} not found`,
      };
    }

    const task = taskResult.data;

    // If next_task is set, that's our next task
    if (task.metadata.next_task) {
      const nextTaskResult = await getTask(task.metadata.next_task);

      if (nextTaskResult.success && nextTaskResult.data) {
        return {
          success: true,
          data: nextTaskResult.data,
        };
      }
    }

    // No next task set, find tasks that have this task as a dependency
    const tasksResult = await listTasks();

    if (!tasksResult.success || !tasksResult.data) {
      return {
        success: false,
        error: tasksResult.error || 'Failed to list tasks',
      };
    }

    const dependentTasks = tasksResult.data.filter(
      (t) =>
        t.metadata.depends &&
        Array.isArray(t.metadata.depends) &&
        t.metadata.depends.includes(taskId)
    );

    if (dependentTasks.length > 0) {
      // Sort by priority
      const priorityOrder: Record<string, number> = {
        '🔥 Highest': 4,
        '🔼 High': 3,
        '▶️ Medium': 2,
        '🔽 Low': 1,
        '': 0,
      };

      dependentTasks.sort((a, b) => {
        const aPrio = priorityOrder[a.metadata.priority || ''] || 0;
        const bPrio = priorityOrder[b.metadata.priority || ''] || 0;

        if (aPrio !== bPrio) {
          return bPrio - aPrio; // Higher priority first
        }

        // If priorities are the same, sort by creation date
        const aDate = a.metadata.created_date ? new Date(a.metadata.created_date).getTime() : 0;
        const bDate = b.metadata.created_date ? new Date(b.metadata.created_date).getTime() : 0;
        return aDate - bDate; // Older tasks first
      });

      return {
        success: true,
        data: dependentTasks[0],
      };
    }

    // No dependent tasks, suggest any high priority task
    const suggestResult = await findNextTask();
    if (suggestResult.success) {
      return {
        success: true,
        data: suggestResult.data,
        message: 'No direct dependencies found. Suggesting highest priority available task.',
      };
    }
    return suggestResult;
  } catch (error) {
    return {
      success: false,
      error: `Error finding next task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
