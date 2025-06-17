/**
 * Parent Task Operations - Clean Builder Pattern API
 *
 * Provides a clean builder interface for all parent task operations.
 * This is the ONLY API for working with parent tasks.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import {
  getSupportingFiles,
  getTaskIdFromFilename,
  getWorkflowDirectory,
  isParentTaskFolder,
  parseTaskLocation,
} from './directory-utils.js';
import { generateSubtaskId, generateUniqueTaskId } from './id-generator.js';
import { getDefaultStatus } from './metadata/schema-service.js';
import { type TaskOrder, makeTasksParallel, reorderSubtasks } from './subtask-sequencing.js';
import { create, del, get, move, update } from './task-crud.js';
import { parseTaskDocument } from './task-parser.js';
import type {
  OperationResult,
  ParentTask,
  ProjectConfig,
  SubtaskInfo,
  Task,
  TaskCreateOptions,
  TaskMetadata,
  TaskMoveOptions,
  TaskStatus,
  TaskType,
  TaskUpdateOptions,
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
    async create(
      title: string,
      options: Partial<TaskCreateOptions> = {}
    ): Promise<OperationResult<Task>> {
      // Create subtask within this parent
      const subtaskOptions: TaskCreateOptions = {
        title,
        type: options.type || 'feature',
        area: options.area || 'general',
        status: options.status || (getDefaultStatus() as TaskStatus),
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

    // Parent-specific operations
    async resequence(
      sequenceMap: Array<{ id: string; sequence: string }>
    ): Promise<OperationResult<void>> {
      try {
        // Get parent task to find folder
        const parentResult = await getParentTaskWithSubtasks(projectRoot, parentId, config);
        if (!parentResult.success || !parentResult.data) {
          return {
            success: false,
            error: parentResult.error || 'Parent task not found',
          };
        }

        const parentFolder = dirname(parentResult.data.metadata.path);
        const subtasks = parentResult.data.subtasks;

        // Sort subtasks by current sequence
        subtasks.sort((a, b) => {
          const seqA = a.metadata.sequenceNumber || '99';
          const seqB = b.metadata.sequenceNumber || '99';
          return seqA.localeCompare(seqB);
        });

        // Build new order based on sequence map
        const newOrder: TaskOrder[] = [];

        // First, handle all explicitly mapped tasks
        for (const mapping of sequenceMap) {
          // Find the subtask by ID (check both full ID and partial match)
          const subtask = subtasks.find(
            (st) => st.metadata.id === mapping.id || st.metadata.filename.includes(mapping.id)
          );

          if (!subtask) {
            return {
              success: false,
              error: `Subtask not found: ${mapping.id}`,
            };
          }

          // Extract task name from filename (remove sequence prefix and .task.md)
          const filename = basename(subtask.metadata.filename);
          const taskName = filename.replace(/^\d{2}_/, '').replace(/\.task\.md$/, '');

          newOrder.push({
            taskId: taskName,
            newSequence: mapping.sequence,
          });
        }

        // Apply reordering
        const result = reorderSubtasks(parentFolder, newOrder);
        if (!result.success) {
          return {
            success: false,
            error: result.error,
          };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to resequence subtasks',
        };
      }
    },

    async parallelize(
      subtaskIds: string[],
      targetSequence?: string
    ): Promise<OperationResult<void>> {
      try {
        // Get parent task
        const parentResult = await getParentTaskWithSubtasks(projectRoot, parentId, config);
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
          return {
            success: false,
            error: result.error,
          };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to parallelize subtasks',
        };
      }
    },

    async updateSequence(
      subtaskId: string,
      newSequence: string,
      options: { force?: boolean } = {}
    ): Promise<OperationResult<void>> {
      try {
        // Get parent task
        const parentResult = await getParentTaskWithSubtasks(projectRoot, parentId, config);
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
          return {
            success: false,
            error: result.error,
          };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update subtask sequence',
        };
      }
    },

    async extractSubtask(
      subtaskId: string,
      targetLocation: WorkflowState
    ): Promise<OperationResult<Task>> {
      try {
        // Get parent task
        const parentResult = await getParentTaskWithSubtasks(projectRoot, parentId, config);
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
        const createResult = await create(projectRoot, floatingOptions, config);
        if (!createResult.success || !createResult.data) {
          return {
            success: false,
            error: createResult.error || 'Failed to create floating task',
          };
        }

        // Delete the subtask using CRUD API
        const deleteResult = await del(projectRoot, subtaskId, config, parentId);
        if (!deleteResult.success) {
          return {
            success: false,
            error: deleteResult.error || 'Failed to delete subtask from parent',
          };
        }

        return createResult;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to extract subtask',
        };
      }
    },

    async move(
      targetState: WorkflowState,
      options: Omit<TaskMoveOptions, 'targetState'> = {}
    ): Promise<OperationResult<Task>> {
      return move(
        projectRoot,
        parentId,
        {
          ...options,
          targetState,
        },
        config
      );
    },

    async adoptTask(
      taskId: string,
      options: { sequence?: string; after?: string; before?: string } = {}
    ): Promise<OperationResult<Task>> {
      try {
        // Get the floating task
        const taskResult = await get(projectRoot, taskId, config);
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
        const parentResult = await getParentTaskWithSubtasks(projectRoot, parentId, config);
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
              (st) =>
                st.metadata.id === options.after || st.metadata.filename.includes(options.after!)
            );
            if (afterTask?.metadata.sequenceNumber) {
              const afterSeq = Number.parseInt(afterTask.metadata.sequenceNumber, 10);
              sequence = String(afterSeq + 1).padStart(2, '0');
            }
          } else if (options.before) {
            // Find the task to insert before
            const beforeTask = parentTask.subtasks.find(
              (st) =>
                st.metadata.id === options.before || st.metadata.filename.includes(options.before!)
            );
            if (beforeTask?.metadata.sequenceNumber) {
              const beforeSeq = Number.parseInt(beforeTask.metadata.sequenceNumber, 10);
              sequence = String(Math.max(1, beforeSeq - 1)).padStart(2, '0');
            }
          } else {
            // Default to next available
            sequence = String(parentTask.subtasks.length + 1).padStart(2, '0');
          }
        }

        // Create the task as a subtask in the parent using CRUD API
        const subtaskOptions: TaskCreateOptions = {
          title: task.document.title,
          type: task.document.frontmatter.type,
          area: task.document.frontmatter.area,
          status: task.document.frontmatter.status,
          workflowState: parentTask.metadata.location.workflowState,
          instruction: task.document.sections.instruction,
          tasks: task.document.sections.tasks
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => line.replace(/^-\s*\[.\]\s*/, '').trim()),
          deliverable: task.document.sections.deliverable,
          customMetadata: Object.entries(task.document.frontmatter)
            .filter(([key]) => !['type', 'status', 'area'].includes(key))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        };

        // Create subtask using CRUD API
        const createResult = await create(projectRoot, subtaskOptions, config, parentId);
        if (!createResult.success || !createResult.data) {
          return {
            success: false,
            error: createResult.error || 'Failed to create subtask',
          };
        }

        // Delete the original floating task using CRUD API
        const deleteResult = await del(projectRoot, taskId, config);
        if (!deleteResult.success) {
          return {
            success: false,
            error: deleteResult.error || 'Failed to delete original task',
          };
        }

        const subtaskId = createResult.data.metadata.id;

        // If we need to shift other sequences
        if (options.after || options.before) {
          // Get updated parent task
          const updatedParent = await getParentTaskWithSubtasks(projectRoot, parentId, config);
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
        const adoptedResult = await get(projectRoot, subtaskId, config, parentId);
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
    },
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
    const workflowState = options.workflowState || config?.defaultWorkflowState || 'current';
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
        options.instruction || 'This is a parent task that will be broken down into child tasks.',
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
      return {
        success: false,
        error: overviewResult.error || 'Failed to move overview file',
      };
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

    // Get supporting files
    const supportingFiles = getSupportingFiles(dirname(task.metadata.path));

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

async function moveTaskToParentFolder(
  task: Task,
  targetPath: string
): Promise<OperationResult<void>> {
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
