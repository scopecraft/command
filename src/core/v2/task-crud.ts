/**
 * V2 Task CRUD Operations
 * 
 * Create, Read, Update, Delete operations for v2 tasks
 */

import { readFileSync, writeFileSync, unlinkSync, renameSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import type {
  Task,
  TaskDocument,
  TaskCreateOptions,
  TaskUpdateOptions,
  TaskMoveOptions,
  TaskListOptions,
  TaskStatus,
  WorkflowState,
  OperationResult,
  TaskMetadata,
  TaskLocation,
  V2Config
} from './types.js';
import {
  getWorkflowDirectory,
  getArchiveDirectory,
  parseTaskLocation,
  getTaskIdFromFilename,
  getTaskFilesInWorkflow,
  createArchiveDate,
  isParentTaskFolder,
  getExistingWorkflowStates
} from './directory-utils.js';
import {
  parseTaskDocument,
  serializeTaskDocument,
  validateTaskDocument,
  ensureRequiredSections,
  updateSection as updateDocumentSection,
  addLogEntry,
  formatLogTimestamp
} from './task-parser.js';
import {
  generateUniqueTaskId,
  resolveTaskId,
  parseTaskId
} from './id-generator.js';

/**
 * Create a new task
 */
export async function createTask(
  projectRoot: string,
  options: TaskCreateOptions,
  config?: V2Config
): Promise<OperationResult<Task>> {
  try {
    // Generate unique ID
    const taskId = generateUniqueTaskId(options.title, projectRoot, config);
    
    // Determine workflow state (default to backlog)
    const workflowState = options.workflowState || config?.defaultWorkflowState || 'backlog';
    
    // Create task document
    const document: TaskDocument = {
      title: options.title,
      frontmatter: {
        type: options.type,
        status: options.status || 'To Do',
        area: options.area,
        ...options.customMetadata
      },
      sections: ensureRequiredSections({
        instruction: options.instruction || '',
        tasks: options.tasks ? formatTasksList(options.tasks) : '',
        ...options.customSections
      })
    };
    
    // Validate document
    const errors = validateTaskDocument(document);
    if (errors.length > 0) {
      return {
        success: false,
        error: 'Invalid task document',
        validationErrors: errors
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
    
    // Check if file already exists (shouldn't happen with unique ID)
    if (existsSync(filepath)) {
      return {
        success: false,
        error: `Task file already exists: ${filename}`
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
        isParentTask: false
      },
      document
    };
    
    return {
      success: true,
      data: task
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task'
    };
  }
}

/**
 * Read a task by ID
 */
export async function getTask(
  projectRoot: string,
  taskId: string,
  config?: V2Config
): Promise<OperationResult<Task>> {
  try {
    // Resolve task path
    const taskPath = resolveTaskId(taskId, projectRoot, config);
    if (!taskPath) {
      return {
        success: false,
        error: `Task not found: ${taskId}`
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
        error: 'Failed to parse task location'
      };
    }
    
    // Check if parent task
    const isParentTask = basename(taskPath) === '_overview.md';
    const id = getTaskIdFromFilename(taskPath);
    
    // Create metadata
    const metadata: TaskMetadata = {
      id,
      filename: basename(taskPath),
      path: taskPath,
      location,
      isParentTask
    };
    
    return {
      success: true,
      data: {
        metadata,
        document
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read task'
    };
  }
}

/**
 * Update a task
 */
export async function updateTask(
  projectRoot: string,
  taskId: string,
  updates: TaskUpdateOptions,
  config?: V2Config
): Promise<OperationResult<Task>> {
  try {
    // Get existing task
    const result = await getTask(projectRoot, taskId, config);
    if (!result.success || !result.data) {
      return result;
    }
    
    const task = result.data;
    
    // Apply updates
    if (updates.title !== undefined) {
      task.document.title = updates.title;
    }
    
    if (updates.frontmatter) {
      task.document.frontmatter = {
        ...task.document.frontmatter,
        ...updates.frontmatter
      };
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
        validationErrors: errors
      };
    }
    
    // Write updated content
    const updatedContent = serializeTaskDocument(task.document);
    writeFileSync(task.metadata.path, updatedContent, 'utf-8');
    
    return {
      success: true,
      data: task
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task'
    };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(
  projectRoot: string,
  taskId: string,
  config?: V2Config
): Promise<OperationResult<void>> {
  try {
    // Resolve task path
    const taskPath = resolveTaskId(taskId, projectRoot, config);
    if (!taskPath) {
      return {
        success: false,
        error: `Task not found: ${taskId}`
      };
    }
    
    // Check if it's a parent task
    if (isParentTaskFolder(dirname(taskPath))) {
      return {
        success: false,
        error: 'Cannot delete parent task overview directly. Delete the entire folder.'
      };
    }
    
    // Delete file
    unlinkSync(taskPath);
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task'
    };
  }
}

/**
 * Move a task between workflow states
 */
export async function moveTask(
  projectRoot: string,
  taskId: string,
  options: TaskMoveOptions,
  config?: V2Config
): Promise<OperationResult<Task>> {
  try {
    // Get existing task
    const result = await getTask(projectRoot, taskId, config);
    if (!result.success || !result.data) {
      return result;
    }
    
    const task = result.data;
    const currentState = task.metadata.location.workflowState;
    
    // Check if already in target state
    if (currentState === options.targetState && 
        options.targetState !== 'archive') { // Archive can have date subdirs
      return {
        success: false,
        error: `Task is already in ${options.targetState}`
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
    
    // Build new path
    const newPath = join(targetDir, task.metadata.filename);
    
    // Check if target exists
    if (existsSync(newPath)) {
      return {
        success: false,
        error: `Target file already exists: ${newPath}`
      };
    }
    
    // Update status if requested
    if (options.updateStatus || config?.autoStatusUpdate) {
      const newStatus = getStatusForWorkflow(options.targetState);
      if (newStatus && newStatus !== task.document.frontmatter.status) {
        task.document.frontmatter.status = newStatus;
      }
    }
    
    // Write to new location first (safer)
    const updatedContent = serializeTaskDocument(task.document);
    writeFileSync(newPath, updatedContent, 'utf-8');
    
    // Delete from old location
    unlinkSync(task.metadata.path);
    
    // Update metadata
    task.metadata.path = newPath;
    task.metadata.location = {
      workflowState: options.targetState,
      archiveDate: options.targetState === 'archive' ? 
        options.archiveDate || createArchiveDate() : undefined
    };
    
    return {
      success: true,
      data: task
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to move task'
    };
  }
}

/**
 * List tasks with filters
 */
export async function listTasks(
  projectRoot: string,
  options: TaskListOptions = {},
  config?: V2Config
): Promise<OperationResult<Task[]>> {
  try {
    const tasks: Task[] = [];
    
    // Determine which workflow states to search
    let statesToSearch: WorkflowState[];
    if (options.workflowStates && options.workflowStates.length > 0) {
      statesToSearch = options.workflowStates;
    } else if (options.includeArchived) {
      statesToSearch = ['current', 'backlog', 'archive'];
    } else {
      statesToSearch = ['current', 'backlog'];
    }
    
    // Get existing states only
    const existingStates = getExistingWorkflowStates(projectRoot, config);
    statesToSearch = statesToSearch.filter(state => existingStates.includes(state));
    
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
          
          if (options.area && document.frontmatter.area !== options.area) {
            continue;
          }
          
          // Check parent task filter
          const isParent = basename(file) === '_overview.md';
          if (!options.includeParentTasks && isParent) {
            continue;
          }
          
          // Parse location
          const location = parseTaskLocation(file, projectRoot);
          if (!location) continue;
          
          // Create task object
          const task: Task = {
            metadata: {
              id: getTaskIdFromFilename(file),
              filename: basename(file),
              path: file,
              location,
              isParentTask: isParent
            },
            document
          };
          
          tasks.push(task);
        } catch (error) {
          // Skip invalid files
          console.error(`Failed to parse task file ${file}:`, error);
        }
      }
    }
    
    // Sort by workflow state order: current, backlog, archive
    tasks.sort((a, b) => {
      const stateOrder = { current: 0, backlog: 1, archive: 2 };
      const aOrder = stateOrder[a.metadata.location.workflowState];
      const bOrder = stateOrder[b.metadata.location.workflowState];
      return aOrder - bOrder;
    });
    
    return {
      success: true,
      data: tasks
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list tasks'
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
  config?: V2Config
): Promise<OperationResult<Task>> {
  try {
    // Get existing task
    const result = await getTask(projectRoot, taskId, config);
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
      data: task
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update section'
    };
  }
}

// Helper functions

/**
 * Format tasks array into checklist markdown
 */
function formatTasksList(tasks: string[]): string {
  return tasks.map(task => `- [ ] ${task}`).join('\n');
}

/**
 * Get default status for workflow state
 */
function getStatusForWorkflow(state: WorkflowState): TaskStatus | null {
  switch (state) {
    case 'backlog':
      return 'To Do';
    case 'current':
      return 'In Progress';
    case 'archive':
      return 'Done';
    default:
      return null;
  }
}