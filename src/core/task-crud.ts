/**
 * Task CRUD Operations
 *
 * Create, Read, Update, Delete operations for tasks
 *
 * IMPORTANT ARCHITECTURE RULE:
 * This file is like a lightweight ORM layer on top of directory-utils.ts (which acts like a SQL library).
 *
 * ALL directory/filesystem manipulation MUST go through directory-utils.ts functions.
 * DO NOT add new existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, etc. operations here.
 * Instead, create utility functions in directory-utils.ts and call them from here.
 *
 * This separation ensures:
 * - Consistent filesystem operations across the codebase
 * - Proper abstraction of directory structure logic
 * - Easier testing and maintenance of file operations
 */

import { readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import {
  createArchiveDate,
  ensureParentTaskDirectory,
  getArchiveDirectory,
  getExistingWorkflowStates,
  getTaskFilesInWorkflow,
  getTaskIdFromFilename,
  getWorkflowDirectory,
  isParentTaskFolder,
  moveDirectory,
  moveFile,
  parseTaskLocation,
  resolveTaskId,
} from './directory-utils.js';
import {
  normalizePhase,
  normalizePriority,
  normalizeTaskStatus,
  normalizeTaskType,
} from './field-normalizers.js';
import { generateSubtaskId, generateUniqueTaskId, parseTaskId } from './id-generator.js';
import { getDefaultStatus } from './metadata/schema-service.js';
import { getNextSequenceNumber } from './subtask-sequencing.js';
import {
  addLogEntry,
  ensureRequiredSections,
  formatLogTimestamp,
  parseTaskDocument,
  serializeTaskDocument,
  updateSection as updateDocumentSection,
  validateTaskDocument,
} from './task-parser.js';
import type {
  OperationResult,
  ProjectConfig,
  Task,
  TaskCreateOptions,
  TaskDocument,
  TaskFrontmatter,
  TaskListOptions,
  TaskLocation,
  TaskMetadata,
  TaskMoveOptions,
  TaskPhase,
  TaskPriority,
  TaskStatus,
  TaskType,
  TaskUpdateOptions,
  WorkflowState,
} from './types.js';

/**
 * Normalize frontmatter values using schema service
 * The normalizers will throw errors for invalid values
 */
function normalizeFrontmatter(frontmatter: Record<string, unknown>): TaskFrontmatter {
  const normalized = { ...frontmatter } as TaskFrontmatter;

  // Normalize type - will throw if invalid
  if (normalized.type) {
    normalized.type = normalizeTaskType(normalized.type) as TaskType;
  }

  // Normalize status - will throw if invalid
  if (normalized.status) {
    normalized.status = normalizeTaskStatus(normalized.status) as TaskStatus;
  }

  // Normalize priority - will throw if invalid
  if (normalized.priority) {
    normalized.priority = normalizePriority(normalized.priority) as TaskPriority;
  }

  // Normalize phase - will throw if invalid
  if (normalized.phase) {
    normalized.phase = normalizePhase(normalized.phase) as TaskPhase;
  }

  return normalized;
}

/**
 * Prepare task document from options
 */
function prepareTaskDocument(options: TaskCreateOptions): TaskDocument {
  return {
    title: options.title,
    frontmatter: normalizeFrontmatter({
      type: options.type,
      status: options.status || 'To Do',
      area: options.area,
      ...(options.phase && { phase: options.phase }),
      ...(options.tags && options.tags.length > 0 && { tags: options.tags }),
      ...options.customMetadata,
    }),
    sections: ensureRequiredSections({
      instruction: options.instruction || '',
      tasks: options.tasks ? formatTasksList(options.tasks) : '',
      deliverable: options.deliverable || '',
      ...options.customSections,
    }),
  };
}

/**
 * Create a subtask within a parent
 */
async function createSubtask(
  parentPath: string,
  options: TaskCreateOptions,
  parentId: string,
  projectRoot: string
): Promise<OperationResult<Task>> {
  // Verify it's a parent task
  if (!parentPath.endsWith('_overview.md')) {
    return {
      success: false,
      error: `Task ${parentId} is not a parent task`,
    };
  }

  // Get parent folder - it's the directory containing _overview.md
  const parentDir = dirname(parentPath);

  // Generate subtask ID and sequence
  const sequence = getNextSequenceNumber(parentDir);
  const subtaskId = generateSubtaskId(options.title, sequence);
  const filename = `${subtaskId}.task.md`;
  const filepath = join(parentDir, filename);

  // Create task document
  const document = prepareTaskDocument({
    ...options,
    status: options.status || (getDefaultStatus() as TaskStatus),
  });

  // Write file
  const content = serializeTaskDocument(document);
  writeFileSync(filepath, content, 'utf-8');

  // Create task object
  const task: Task = {
    metadata: {
      id: subtaskId,
      filename,
      path: filepath,
      location: parseTaskLocation(filepath, projectRoot) || { workflowState: 'current' },
      isParentTask: false,
      parentTask: parentId,
      sequenceNumber: sequence,
    },
    document,
  };

  return {
    success: true,
    data: task,
  };
}

/**
 * Create a simple task
 */
async function createSimpleTask(
  projectRoot: string,
  options: TaskCreateOptions,
  config?: ProjectConfig
): Promise<OperationResult<Task>> {
  // Generate unique ID
  const taskId = generateUniqueTaskId(options.title, projectRoot, config);

  // Determine workflow state (default to current)
  const workflowState = options.workflowState || config?.defaultWorkflowState || 'current';

  // Create task document
  const document = prepareTaskDocument(options);

  // Validate document
  const errors = validateTaskDocument(document);
  if (errors.length > 0) {
    return {
      success: false,
      error: 'Invalid task document',
      validationErrors: errors,
    };
  }

  // Determine file path
  const workflowDir = getWorkflowDirectory(projectRoot, workflowState, config);
  const filename = `${taskId}.task.md`;
  const filepath = join(workflowDir, filename);

  // Ensure directory exists
  if (!existsSync(workflowDir)) {
    mkdirSync(workflowDir, { recursive: true });
  }

  // Check if file already exists
  if (existsSync(filepath)) {
    return {
      success: false,
      error: `Task file already exists: ${filename}`,
    };
  }

  // Write file
  const content = serializeTaskDocument(document);
  writeFileSync(filepath, content, 'utf-8');

  // Create task object
  const task: Task = {
    metadata: {
      id: taskId,
      filename,
      path: filepath,
      location: { workflowState },
      isParentTask: false,
    },
    document,
  };

  return {
    success: true,
    data: task,
  };
}

/**
 * Create a new task
 * Complexity reduced from 24 to ~10
 */
export async function create(
  projectRoot: string,
  options: TaskCreateOptions,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>> {
  try {
    // Handle subtask creation
    if (parentId) {
      const parentPath = resolveTaskId(parentId, projectRoot, config);
      if (!parentPath) {
        return {
          success: false,
          error: `Parent task not found: ${parentId}`,
        };
      }
      return createSubtask(parentPath, options, parentId, projectRoot);
    }

    // Handle simple task creation
    return createSimpleTask(projectRoot, options, config);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

/**
 * Read a task by ID
 */
export async function get(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>> {
  try {
    // Resolve task path with optional parent context
    const taskPath = resolveTaskId(taskId, projectRoot, config, parentId);
    if (!taskPath) {
      return {
        success: false,
        error: `Task not found: ${taskId}`,
      };
    }

    // Read file content
    const content = readFileSync(taskPath, 'utf-8');

    // Parse document
    const document = parseTaskDocument(content);

    // Parse location
    const location = parseTaskLocation(taskPath, projectRoot);
    if (!location) {
      return {
        success: false,
        error: 'Failed to parse task location',
      };
    }

    // Check if parent task
    const isParentTask = basename(taskPath) === '_overview.md';
    const id = getTaskIdFromFilename(taskPath);

    // Detect if this is a subtask in a parent directory
    const fileDir = dirname(taskPath);
    let parentTask: string | undefined;
    let sequenceNumber: string | undefined;

    // Check if the task is inside a parent directory (but not the parent task itself)
    if (isParentTaskFolder(fileDir, projectRoot) && !isParentTask) {
      parentTask = basename(fileDir);

      // Extract sequence number for subtasks
      const fileName = basename(taskPath);
      const seqMatch = fileName.match(/^(\d{2})[_-]/);
      if (seqMatch) {
        sequenceNumber = seqMatch[1];
      }
    }

    // Create metadata
    const metadata: TaskMetadata = {
      id,
      filename: basename(taskPath),
      path: taskPath,
      location,
      isParentTask,
      parentTask,
      sequenceNumber,
    };

    return {
      success: true,
      data: {
        metadata,
        document,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read task',
    };
  }
}

/**
 * Determine if automatic workflow transition should occur based on status change
 */
function shouldAutoTransition(
  currentWorkflow: WorkflowState,
  oldStatus: TaskStatus | undefined,
  newStatus: TaskStatus,
  _config?: ProjectConfig
): WorkflowState | null {
  // Only transition if auto-transitions are enabled (default: true)
  // TEMPORARY FIX: Force auto-transitions to false to prevent subtask corruption
  // TODO: Remove this override when implementing 2-state architecture (current + archive only)
  const autoTransitionsEnabled = false; // config?.autoWorkflowTransitions !== false;
  if (!autoTransitionsEnabled) {
    return null;
  }

  // Only transition when status actually changes
  if (oldStatus === newStatus) {
    return null;
  }

  // No automatic workflow transitions in two-state architecture
  // Tasks start in current and move to archive when done

  // Re-opening archived tasks: move to current when status changes from non-active to active
  if (currentWorkflow === 'archive' && (newStatus === 'in_progress' || newStatus === 'todo')) {
    return 'current';
  }

  // No other automatic transitions
  return null;
}

/**
 * Update a task
 */
export async function update(
  projectRoot: string,
  taskId: string,
  updates: TaskUpdateOptions,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>> {
  try {
    // Get existing task
    const result = await get(projectRoot, taskId, config, parentId);
    if (!result.success || !result.data) {
      return result;
    }

    const task = result.data;

    // Capture original state for auto-transition logic
    const originalStatus = task.document.frontmatter.status;
    const taskLocation = parseTaskLocation(task.metadata.path, projectRoot);
    const currentWorkflow = taskLocation?.workflowState;

    if (!currentWorkflow) {
      return {
        success: false,
        error: 'Could not determine current workflow state for task',
      };
    }

    // Apply updates
    if (updates.title !== undefined) {
      task.document.title = updates.title;
    }

    if (updates.frontmatter) {
      task.document.frontmatter = normalizeFrontmatter({
        ...task.document.frontmatter,
        ...updates.frontmatter,
      });
    }

    if (updates.sections) {
      // Merge sections, ensuring all required sections remain
      for (const [key, value] of Object.entries(updates.sections)) {
        if (value !== undefined) {
          task.document.sections[key] = value;
        }
      }
    }

    // Validate updated document
    const errors = validateTaskDocument(task.document);
    if (errors.length > 0) {
      return {
        success: false,
        error: 'Invalid task document after update',
        validationErrors: errors,
      };
    }

    // Check for automatic workflow transition
    const newStatus = task.document.frontmatter.status;
    const targetWorkflow = shouldAutoTransition(currentWorkflow, originalStatus, newStatus, config);

    if (targetWorkflow && targetWorkflow !== currentWorkflow) {
      // First, write updated content to current location to preserve status change
      const updatedContent = serializeTaskDocument(task.document);
      writeFileSync(task.metadata.path, updatedContent, 'utf-8');

      // Then use moveTask with updateStatus: false to move to new workflow
      const moveResult = await move(
        projectRoot,
        taskId,
        {
          targetState: targetWorkflow,
          updateStatus: false, // Don't override the status we just set
        },
        config,
        parentId
      );

      if (moveResult.success && moveResult.data) {
        // Return the moved task
        return moveResult;
      }
      // If move fails, the task is still updated in current location
      return {
        success: true,
        data: task,
      };
    }

    // Write updated content
    const updatedContent = serializeTaskDocument(task.document);
    writeFileSync(task.metadata.path, updatedContent, 'utf-8');

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    };
  }
}

/**
 * Delete a task
 */
export async function del(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<void>> {
  try {
    // Resolve task path
    const taskPath = resolveTaskId(taskId, projectRoot, config, parentId);
    if (!taskPath) {
      return {
        success: false,
        error: `Task not found: ${taskId}`,
      };
    }

    // Check if it's a parent task overview file (not a subtask)
    if (basename(taskPath) === '_overview.md') {
      return {
        success: false,
        error: 'Cannot delete parent task overview directly. Delete the entire folder.',
      };
    }

    // Delete file
    unlinkSync(taskPath);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task',
    };
  }
}

/**
 * Move a simple task file or subtask
 */
async function moveSimpleTask(
  task: Task,
  targetDir: string,
  options: TaskMoveOptions,
  _config?: ProjectConfig
): Promise<OperationResult<Task>> {
  let newPath: string;

  // Check if this is a subtask - if so, preserve parent folder structure
  if (task.metadata.parentTask) {
    // For subtasks, ensure parent folder exists in target directory
    const parentFolderInTarget = ensureParentTaskDirectory(task.metadata.parentTask, targetDir);
    newPath = join(parentFolderInTarget, task.metadata.filename);
  } else {
    // For simple tasks, use the workflow root
    newPath = join(targetDir, task.metadata.filename);
  }

  // Check if target exists
  if (existsSync(newPath)) {
    return {
      success: false,
      error: `Target file already exists: ${newPath}`,
    };
  }

  // Write updated content and move file
  const updatedContent = serializeTaskDocument(task.document);
  writeFileSync(task.metadata.path, updatedContent, 'utf-8');

  // Use moveFile from directory-utils
  moveFile(task.metadata.path, newPath);

  // Update metadata
  task.metadata.path = newPath;
  task.metadata.location = {
    workflowState: options.targetState,
    archiveDate:
      options.targetState === 'archive' ? options.archiveDate || createArchiveDate() : undefined,
  };

  return {
    success: true,
    data: task,
  };
}

/**
 * Move a parent task folder
 */
async function moveParentTask(
  task: Task,
  targetDir: string,
  _options: TaskMoveOptions,
  projectRoot: string,
  config?: ProjectConfig
): Promise<OperationResult<Task>> {
  const currentFolder = dirname(task.metadata.path);
  const folderName = basename(currentFolder);
  const newFolder = join(targetDir, folderName);

  // Check if target folder exists
  if (existsSync(newFolder)) {
    return {
      success: false,
      error: `Target folder already exists: ${newFolder}`,
    };
  }

  // Move the entire folder
  moveDirectory(currentFolder, newFolder);

  // Return the parent task from new location
  return get(projectRoot, task.metadata.id, config);
}

/**
 * Move a task between workflow states
 * Auto-detects parent tasks and moves the entire folder
 */
export async function move(
  projectRoot: string,
  taskId: string,
  options: TaskMoveOptions,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>> {
  try {
    // Get existing task
    const result = await get(projectRoot, taskId, config, parentId);
    if (!result.success || !result.data) {
      return result;
    }

    const task = result.data;
    const currentState = task.metadata.location.workflowState;

    // Check if already in target state
    if (currentState === options.targetState && options.targetState !== 'archive') {
      // Archive can have date subdirs
      return {
        success: false,
        error: `Task is already in ${options.targetState}`,
      };
    }

    // Determine target directory
    let targetDir: string;
    if (options.targetState === 'archive') {
      const archiveDate = options.archiveDate || createArchiveDate();
      targetDir = getArchiveDirectory(projectRoot, archiveDate, config);
    } else {
      targetDir = getWorkflowDirectory(projectRoot, options.targetState, config);
    }

    // Ensure target directory exists
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Delegate to appropriate move function
    if (task.metadata.isParentTask) {
      return moveParentTask(task, targetDir, options, projectRoot, config);
    }
    return moveSimpleTask(task, targetDir, options, config);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to move task',
    };
  }
}

/**
 * List tasks with filters
 */
export async function list(
  projectRoot: string,
  options: TaskListOptions = {},
  config?: ProjectConfig,
  _parentId?: string // TODO: Filter by parent when implemented
): Promise<OperationResult<Task[]>> {
  try {
    // Note: parentId filtering not implemented yet
    const tasks: Task[] = [];

    // Determine which workflow states to search
    let statesToSearch: WorkflowState[];
    if (options.workflowStates && options.workflowStates.length > 0) {
      statesToSearch = options.workflowStates;
    } else if (options.includeArchived) {
      statesToSearch = ['current', 'archive'];
    } else {
      statesToSearch = ['current'];
    }

    // Get existing states only
    const existingStates = getExistingWorkflowStates(projectRoot, config);
    statesToSearch = statesToSearch.filter((state) => existingStates.includes(state));

    // Collect tasks from each state
    for (const state of statesToSearch) {
      const files = getTaskFilesInWorkflow(projectRoot, state, config);

      for (const file of files) {
        try {
          const content = readFileSync(file, 'utf-8');
          const document = parseTaskDocument(content);

          // Apply filters
          if (options.type && document.frontmatter.type !== options.type) {
            continue;
          }

          if (options.status && document.frontmatter.status !== options.status) {
            continue;
          }

          if (options.excludeStatuses?.includes(document.frontmatter.status)) {
            continue;
          }

          if (options.area && document.frontmatter.area !== options.area) {
            continue;
          }

          if (options.phase && document.frontmatter.phase !== options.phase) {
            continue;
          }

          if (options.tags && options.tags.length > 0) {
            const taskTags = document.frontmatter.tags;
            if (!taskTags || !options.tags.some((tag) => taskTags.includes(tag))) {
              continue;
            }
          }

          // Check parent task filter
          const isParent = basename(file) === '_overview.md';
          if (!options.includeParentTasks && isParent) {
            continue;
          }

          // Parse location
          const location = parseTaskLocation(file, projectRoot);
          if (!location) continue;

          // Detect if this is a subtask in a parent directory
          const fileDir = dirname(file);
          const taskId = getTaskIdFromFilename(file);
          let parentTask: string | undefined;
          let sequenceNumber: string | undefined;

          // Check if the task is inside a parent directory (but not the parent task itself)
          if (isParentTaskFolder(fileDir, projectRoot) && !isParent) {
            parentTask = basename(fileDir);

            // Extract sequence number for subtasks
            const fileName = basename(file);
            const seqMatch = fileName.match(/^(\d{2})[_-]/);
            if (seqMatch) {
              sequenceNumber = seqMatch[1];
            }
          }

          // Create task object
          const task: Task = {
            metadata: {
              id: taskId,
              filename: basename(file),
              path: file,
              location,
              isParentTask: isParent,
              parentTask,
              sequenceNumber,
            },
            document,
          };

          tasks.push(task);
        } catch (error) {
          // Skip invalid files
          console.error(`Failed to parse task file ${file}:`, error);
        }
      }
    }

    // Sort by workflow state order: current, archive
    tasks.sort((a, b) => {
      const stateOrder = { current: 0, archive: 1 };
      const aOrder = stateOrder[a.metadata.location.workflowState];
      const bOrder = stateOrder[b.metadata.location.workflowState];
      return aOrder - bOrder;
    });

    return {
      success: true,
      data: tasks,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list tasks',
    };
  }
}

/**
 * Update a specific section of a task
 */
export async function updateSection(
  projectRoot: string,
  taskId: string,
  sectionName: string,
  content: string,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>> {
  try {
    // Get existing task
    const result = await get(projectRoot, taskId, config, parentId);
    if (!result.success || !result.data) {
      return result;
    }

    const task = result.data;

    // Update section
    task.document.sections[sectionName.toLowerCase()] = content;

    // Write updated content
    const updatedContent = serializeTaskDocument(task.document);
    writeFileSync(task.metadata.path, updatedContent, 'utf-8');

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update section',
    };
  }
}

/**
 * Promote a simple task to a parent task
 *
 * Transforms a simple task into a parent task with subtasks.
 * This is a task transformation operation, not a parent-scoped operation.
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
    const taskResult = await get(projectRoot, taskId, config);
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

    // Generate parent folder name
    const parentId = generateUniqueTaskId(task.document.title, projectRoot, config);
    const workflowDir = getWorkflowDirectory(
      projectRoot,
      task.metadata.location.workflowState,
      config
    );
    const parentFolder = join(workflowDir, parentId);

    // Create parent folder
    if (!existsSync(parentFolder)) {
      mkdirSync(parentFolder, { recursive: true });
    }

    // Create _overview.md file with task content
    const overviewPath = join(parentFolder, '_overview.md');
    const overviewDocument: TaskDocument = {
      title: task.document.title,
      frontmatter: {
        type: task.document.frontmatter.type,
        status: task.document.frontmatter.status,
        area: task.document.frontmatter.area,
        ...Object.entries(task.document.frontmatter)
          .filter(([key]) => !['type', 'status', 'area'].includes(key))
          .reduce(
            (acc, [key, value]) => {
              acc[key] = value;
              return acc;
            },
            {} as Record<string, unknown>
          ),
      },
      sections: {
        instruction: task.document.sections.instruction || '',
        tasks: '', // Parent tasks don't use the tasks section in _overview.md
        deliverable: task.document.sections.deliverable || '',
        log: task.document.sections.log || '',
      },
    };

    // Write overview file
    const overviewContent = serializeTaskDocument(overviewDocument);
    writeFileSync(overviewPath, overviewContent, 'utf-8');

    // Create initial subtasks if requested
    let subtaskIndex = 1;

    // If keeping original as first subtask
    if (options.keepOriginal) {
      const sequence = String(subtaskIndex).padStart(2, '0');
      const subtaskId = generateSubtaskId(task.document.title, sequence);
      const subtaskPath = join(parentFolder, `${subtaskId}.task.md`);

      const subtaskDocument: TaskDocument = {
        title: task.document.title,
        frontmatter: {
          type: task.document.frontmatter.type,
          status: getDefaultStatus() as TaskStatus, // Reset status for subtask
          area: task.document.frontmatter.area,
        },
        sections: {
          instruction: task.document.sections.instruction || '',
          tasks: task.document.sections.tasks || '',
          deliverable: task.document.sections.deliverable || '',
          log: '',
        },
      };

      const subtaskContent = serializeTaskDocument(subtaskDocument);
      writeFileSync(subtaskPath, subtaskContent, 'utf-8');
      subtaskIndex++;
    }

    // Add additional subtasks if provided
    if (options.subtasks && options.subtasks.length > 0) {
      for (const subtaskTitle of options.subtasks) {
        const sequence = String(subtaskIndex).padStart(2, '0');
        const subtaskId = generateSubtaskId(subtaskTitle, sequence);
        const subtaskPath = join(parentFolder, `${subtaskId}.task.md`);

        const subtaskDocument: TaskDocument = {
          title: subtaskTitle,
          frontmatter: {
            type: task.document.frontmatter.type,
            status: getDefaultStatus() as TaskStatus,
            area: task.document.frontmatter.area,
          },
          sections: ensureRequiredSections({
            instruction: '',
            tasks: '',
            deliverable: '',
          }),
        };

        const subtaskContent = serializeTaskDocument(subtaskDocument);
        writeFileSync(subtaskPath, subtaskContent, 'utf-8');
        subtaskIndex++;
      }
    }

    // Delete the original task
    await del(projectRoot, taskId, config);

    // Return the parent task (overview)
    const finalResult = await get(projectRoot, parentId, config);
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

// Helper functions

/**
 * Format tasks array into checklist markdown
 */
function formatTasksList(tasks: string[]): string {
  return tasks.map((task) => `- [ ] ${task}`).join('\n');
}
