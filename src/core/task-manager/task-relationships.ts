import fs from 'node:fs';
import type { RuntimeConfig } from '../config/types.js';
import { formatTaskFile, parseTaskFile } from '../task-parser.js';
import type { OperationResult, Task } from '../types.js';
import { getTask } from './task-crud.js';

/**
 * Update relationships between tasks
 * @param task Task to update relationships for
 * @param options Optional parameters including config
 * @returns Operation result
 */
export async function updateRelationships(
  task: Task,
  options?: {
    config?: RuntimeConfig;
  }
): Promise<OperationResult<void>> {
  const errors: string[] = [];

  // Update parent task if specified
  if (task.metadata.parent_task) {
    try {
      const parentResult = await getTask(task.metadata.parent_task, { config: options?.config });
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
        errors.push(
          `Could not update parent task ${task.metadata.parent_task}: ${parentResult.error}`
        );
      }
    } catch (error) {
      errors.push(
        `Could not update parent task ${task.metadata.parent_task}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Update previous task's next_task field if specified
  if (task.metadata.previous_task) {
    try {
      const previousResult = await getTask(task.metadata.previous_task, {
        config: options?.config,
      });
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
        errors.push(
          `Could not update previous task ${task.metadata.previous_task}: ${previousResult.error}`
        );
      }
    } catch (error) {
      errors.push(
        `Could not update previous task ${task.metadata.previous_task}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Update next task's previous_task field if specified
  if (task.metadata.next_task) {
    try {
      const nextResult = await getTask(task.metadata.next_task, { config: options?.config });
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
      errors.push(
        `Could not update next task ${task.metadata.next_task}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Handle task dependencies if specified
  if (task.metadata.depends && Array.isArray(task.metadata.depends)) {
    for (const dependId of task.metadata.depends) {
      try {
        const dependResult = await getTask(dependId, { config: options?.config });
        if (!dependResult.success || !dependResult.data) {
          errors.push(`Could not find dependency task ${dependId}: ${dependResult.error}`);
        }
        // We don't need to update the dependent task, just verify it exists
      } catch (error) {
        errors.push(
          `Error checking dependency task ${dependId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  return errors.length > 0 ? { success: false, error: errors.join('; ') } : { success: true };
}
