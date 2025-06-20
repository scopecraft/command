/**
 * Directory Utilities
 *
 * Manages workflow-based directory structure for task system
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { WorktreePathResolver } from './environment/worktree-path-resolver.js';
import { directoryPathCache } from './paths/cache.js';
// MIGRATION: Using new centralized path resolver
import { PATH_TYPES, createPathContext, resolvePath } from './paths/path-resolver.js';
import { TaskStoragePathEncoder } from './task-storage-path-encoder.js';
import type { ProjectConfig, TaskLocation, WorkflowState } from './types.js';

// Default workflow folder names
const DEFAULT_WORKFLOW_FOLDERS = {
  current: 'current',
  archive: 'archive',
} as const;

/**
 * Get the tasks directory path (centralized storage)
 * @param createIfMissing - Whether to create the directory if it doesn't exist (default: true)
 */
export function getTasksDirectory(
  projectRoot: string,
  override?: boolean,
  createIfMissing = true
): string {
  const cacheKey = `tasks:${projectRoot}:${override || false}`;

  // Check cache first
  const cached = directoryPathCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Use the path resolver as the single source of truth
  const context = createPathContext(projectRoot, { override });
  const centralizedPath = resolvePath(PATH_TYPES.TASKS, context);

  // Ensure centralized directory exists only if requested
  if (createIfMissing && !existsSync(centralizedPath)) {
    mkdirSync(centralizedPath, { recursive: true });
  }

  // Cache the result
  directoryPathCache.set(cacheKey, centralizedPath);

  return centralizedPath;
}

/**
 * Get workflow directory path
 */
export function getWorkflowDirectory(
  projectRoot: string,
  state: WorkflowState,
  config?: ProjectConfig
): string {
  const cacheKey = `workflow:${projectRoot}:${state}:${config?.override || false}`;

  // Check cache first
  const cached = directoryPathCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const tasksDir = getTasksDirectory(projectRoot, config?.override, true);
  const folderName = config?.workflowFolders?.[state] || DEFAULT_WORKFLOW_FOLDERS[state];
  const path = join(tasksDir, folderName);

  // Cache the result
  directoryPathCache.set(cacheKey, path);

  return path;
}

/**
 * Get archive directory with optional date
 */
export function getArchiveDirectory(
  projectRoot: string,
  date?: string,
  config?: ProjectConfig
): string {
  const archiveDir = getWorkflowDirectory(projectRoot, 'archive', config);

  if (date) {
    // Validate date format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(date)) {
      throw new Error(`Invalid archive date format: ${date}. Expected YYYY-MM`);
    }
    return join(archiveDir, date);
  }

  return archiveDir;
}

/**
 * Get templates directory path
 *
 * @deprecated Since v2.1.0 - Use resolvePath(PATH_TYPES.TEMPLATES, context) instead
 * @migration This function now delegates to the new path resolver
 * @removeIn v3.0.0
 */
export function getTemplatesDirectory(projectRoot: string): string {
  // MIGRATION: Now using centralized path resolver
  // OLD: return join(getTasksDirectory(projectRoot), '.templates');
  const context = createPathContext(projectRoot);
  return resolvePath(PATH_TYPES.TEMPLATES, context);
}

/**
 * Get config directory path
 *
 * @deprecated Since v2.1.0 - Use resolvePath(PATH_TYPES.CONFIG, context) instead
 * @migration This function now delegates to the new path resolver
 * @removeIn v3.0.0
 */
export function getConfigDirectory(projectRoot: string): string {
  // MIGRATION: Now using centralized path resolver
  // OLD: return join(getTasksDirectory(projectRoot), '.config');
  const context = createPathContext(projectRoot);
  return resolvePath(PATH_TYPES.CONFIG, context);
}

/**
 * Get modes directory path
 *
 * @since v2.1.0
 * NEW: Added to support centralized path resolution
 */
export function getModesDirectory(projectRoot: string): string {
  const context = createPathContext(projectRoot);
  return resolvePath(PATH_TYPES.MODES, context);
}

/**
 * Ensure all workflow directories exist
 */
export function ensureWorkflowDirectories(projectRoot: string, config?: ProjectConfig): void {
  // Create path context with override if provided
  const context = createPathContext(projectRoot, { override: config?.override });

  // Get paths using resolver
  const tasksDir = resolvePath(PATH_TYPES.TASKS, context);
  const templatesDir = resolvePath(PATH_TYPES.TEMPLATES, context);
  const modesDir = resolvePath(PATH_TYPES.MODES, context);
  const configDir = resolvePath(PATH_TYPES.CONFIG, context);

  // Create main tasks directory
  if (!existsSync(tasksDir)) {
    mkdirSync(tasksDir, { recursive: true });
  }

  // Create workflow directories
  const states: WorkflowState[] = ['current', 'archive'];
  for (const state of states) {
    const dir = getWorkflowDirectory(projectRoot, state, config);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  // Create templates directory
  if (!existsSync(templatesDir)) {
    mkdirSync(templatesDir, { recursive: true });
  }

  // Create modes directory
  if (!existsSync(modesDir)) {
    mkdirSync(modesDir, { recursive: true });
  }

  // Create config directory
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Get all task files in a workflow state
 */
export function getTaskFilesInWorkflow(
  projectRoot: string,
  state: WorkflowState,
  config?: ProjectConfig
): string[] {
  const workflowDir = getWorkflowDirectory(projectRoot, state, config);

  if (!existsSync(workflowDir)) {
    return [];
  }

  return findTaskFiles(workflowDir);
}

/**
 * Recursively find all .task.md files
 */
function findTaskFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip hidden directories
      if (entry.startsWith('.')) continue;

      // Check if it's a parent task (has _overview.md)
      const overviewPath = join(fullPath, '_overview.md');
      if (existsSync(overviewPath)) {
        // Add the overview file as the main task
        files.push(overviewPath);
      }

      // Recursively find tasks in subdirectory
      findTaskFiles(fullPath, files);
    } else if (entry.endsWith('.task.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse task location from file path
 */
export function parseTaskLocation(taskPath: string, projectRoot: string): TaskLocation | null {
  const tasksDir = getTasksDirectory(projectRoot);
  const relativePath = relative(tasksDir, taskPath);

  // Parse workflow state from path
  const parts = relativePath.split('/');
  if (parts.length === 0) return null;

  const firstDir = parts[0];

  // Check if it's a workflow directory
  if (firstDir === 'current') {
    return { workflowState: 'current' };
  }
  if (firstDir === 'archive') {
    // Check for archive date
    if (parts.length > 1 && /^\d{4}-\d{2}$/.test(parts[1])) {
      return {
        workflowState: 'archive',
        archiveDate: parts[1],
      };
    }
    return { workflowState: 'archive' };
  }

  return null;
}

/**
 * Get task ID from filename
 */
export function getTaskIdFromFilename(filename: string): string {
  const name = basename(filename);

  // Remove .task.md extension
  if (name.endsWith('.task.md')) {
    return name.slice(0, -8);
  }

  // Handle _overview.md for parent tasks
  if (name === '_overview.md') {
    // Use parent directory name as ID
    return basename(dirname(filename));
  }

  return name;
}

/**
 * Check if a path is a parent task folder
 */
export function isParentTaskFolder(dirPath: string, projectRoot?: string): boolean {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return false;
  }

  const overviewPath = join(dirPath, '_overview.md');
  if (!existsSync(overviewPath)) {
    return false;
  }

  // Prevent workflow directories from being treated as parent task folders
  // Parent task folders CANNOT be at the workflow level (second level)
  if (projectRoot) {
    const relativePath = relative(projectRoot, dirPath);
    const pathParts = relativePath.split(sep);

    // Block second-level directories (workflow level) from being parent folders
    // Examples: .tasks/current/ or .tasks/archive/ should never be parent folders
    if (pathParts.length <= 2) {
      return false;
    }
  }

  return true;
}

/**
 * Get subtask files in a parent task folder
 */
export function getSubtaskFiles(parentTaskDir: string): string[] {
  if (!isParentTaskFolder(parentTaskDir)) {
    return [];
  }

  const files = readdirSync(parentTaskDir);

  return files
    .filter((file) => {
      // Match pattern: NN_name-MMX.task.md or NN-name.task.md (both supported)
      return /^\d{2}[_-].*\.task\.md$/.test(file);
    })
    .sort() // Sort by sequence number
    .map((file) => join(parentTaskDir, file));
}

/**
 * Extract sequence number from subtask filename
 */
export function getSubtaskSequence(filename: string): string | null {
  const name = basename(filename);
  const match = name.match(/^(\d{2})[_-]/);
  return match ? match[1] : null;
}

/**
 * Get supporting documentation files in a parent task folder
 * Returns markdown files that are not task files or overview files
 */
export function getSupportingFiles(parentTaskDir: string): string[] {
  if (!existsSync(parentTaskDir) || !statSync(parentTaskDir).isDirectory()) {
    return [];
  }

  try {
    const files = readdirSync(parentTaskDir);

    return files
      .filter((file) => {
        // Only include markdown files
        if (!file.endsWith('.md')) return false;

        // Exclude task files and overview file
        if (file.endsWith('.task.md') || file === '_overview.md') return false;

        return true;
      })
      .sort(); // Sort alphabetically for consistent ordering
  } catch (error) {
    console.error(`Failed to read supporting files from ${parentTaskDir}:`, error);
    return [];
  }
}

/**
 * Create archive date string
 */
export function createArchiveDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Validate task filename format
 */
export function isValidTaskFilename(filename: string): boolean {
  const name = basename(filename);

  // Check for _overview.md (parent task)
  if (name === '_overview.md') {
    return true;
  }

  // Check for .task.md extension
  if (!name.endsWith('.task.md')) {
    return false;
  }

  // Check for subtask pattern (NN-name.task.md)
  if (/^\d{2}-.*\.task\.md$/.test(name)) {
    return true;
  }

  // Check for standard pattern (name-MMDD-XX.task.md)
  const pattern = /^[a-z0-9-]+-\d{4}-[a-zA-Z0-9]{2}\.task\.md$/;
  return pattern.test(name);
}

/**
 * Get all workflow directories that exist
 */
export function getExistingWorkflowStates(
  projectRoot: string,
  config?: ProjectConfig
): WorkflowState[] {
  const states: WorkflowState[] = [];

  for (const state of ['current', 'archive'] as const) {
    const dir = getWorkflowDirectory(projectRoot, state, config);
    if (existsSync(dir)) {
      states.push(state);
    }
  }

  return states;
}

/**
 * Resolve a task ID to its full path
 * Search order: current → archive
 * With optional parent context for efficient subtask resolution
 */
export function resolveTaskId(
  taskId: string,
  projectRoot: string,
  config?: ProjectConfig,
  parentId?: string
): string | null {
  // Handle explicit paths (e.g., "current/implement-oauth-0127-AB")
  if (taskId.includes('/')) {
    const fullPath = join(getTasksDirectory(projectRoot), taskId);

    // Add .task.md if not present
    const pathsToCheck = [
      fullPath,
      `${fullPath}.task.md`,
      join(fullPath, '_overview.md'), // Complex task
    ];

    for (const path of pathsToCheck) {
      if (existsSync(path)) {
        return path;
      }
    }

    return null;
  }

  // If parent context is provided, search within parent first
  if (parentId) {
    const parentPath = resolveTaskId(parentId, projectRoot, config);
    if (parentPath?.endsWith('_overview.md')) {
      const parentDir = dirname(parentPath);
      const subtaskPath = join(parentDir, `${taskId}.task.md`);
      if (existsSync(subtaskPath)) {
        return subtaskPath;
      }
    }
    // If not found in parent, fall through to standard search
  }

  // Standard search order
  const searchOrder: WorkflowState[] = ['current', 'archive'];

  for (const state of searchOrder) {
    const found = findTaskInWorkflow(taskId, projectRoot, state, config);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Find a task in a specific workflow state
 */
function findTaskInWorkflow(
  taskId: string,
  projectRoot: string,
  state: WorkflowState,
  config?: ProjectConfig
): string | null {
  const workflowDir = getWorkflowDirectory(projectRoot, state, config);
  if (!existsSync(workflowDir)) {
    return null;
  }

  // Direct file check (standalone task)
  const directPath = join(workflowDir, `${taskId}.task.md`);
  if (existsSync(directPath)) {
    return directPath;
  }

  // Check for complex task folder (parent task)
  const complexPath = join(workflowDir, taskId);
  if (isParentTaskFolder(complexPath)) {
    return join(complexPath, '_overview.md');
  }

  // Search inside parent task folders for subtasks
  const subtaskPath = searchForSubtask(taskId, workflowDir);
  if (subtaskPath) {
    return subtaskPath;
  }

  // For archive, search subdirectories (YYYY-MM)
  if (state === 'archive') {
    return searchArchive(taskId, workflowDir);
  }

  return null;
}

/**
 * Search for a subtask inside parent task folders
 */
function searchForSubtask(taskId: string, workflowDir: string): string | null {
  if (!existsSync(workflowDir)) {
    return null;
  }

  const entries = readdirSync(workflowDir);

  for (const entry of entries) {
    const entryPath = join(workflowDir, entry);
    const stat = statSync(entryPath);

    if (stat.isDirectory() && isParentTaskFolder(entryPath)) {
      // Search inside parent task folder for the subtask
      const subtaskPath = join(entryPath, `${taskId}.task.md`);
      if (existsSync(subtaskPath)) {
        return subtaskPath;
      }
    }
  }

  return null;
}

/**
 * Search archive subdirectories for a task
 */
function searchArchive(taskId: string, archiveDir: string): string | null {
  if (!existsSync(archiveDir)) {
    return null;
  }

  const entries = readdirSync(archiveDir);

  // Sort by date descending (newest first)
  const dateDirs = entries
    .filter((entry) => /^\d{4}-\d{2}$/.test(entry))
    .sort()
    .reverse();

  for (const dateDir of dateDirs) {
    const dirPath = join(archiveDir, dateDir);

    // Check direct file
    const filePath = join(dirPath, `${taskId}.task.md`);
    if (existsSync(filePath)) {
      return filePath;
    }

    // Check complex task
    const complexPath = join(dirPath, taskId);
    if (isParentTaskFolder(complexPath)) {
      return join(complexPath, '_overview.md');
    }

    // Search for subtasks within parent folders
    const subtaskPath = searchForSubtask(taskId, dirPath);
    if (subtaskPath) {
      return subtaskPath;
    }
  }

  return null;
}

/**
 * Check if a task ID already exists
 */
export function taskIdExists(taskId: string, projectRoot: string, config?: ProjectConfig): boolean {
  return resolveTaskId(taskId, projectRoot, config) !== null;
}

/**
 * Move a file using safe write-then-delete approach
 * This ensures the file is successfully written before deleting the original
 */
export function moveFile(src: string, dest: string): void {
  const content = readFileSync(src);
  writeFileSync(dest, content);
  unlinkSync(src);
}

/**
 * Move a directory using rename (same filesystem only)
 * For cross-filesystem moves, this will throw an error
 */
export function moveDirectory(src: string, dest: string): void {
  renameSync(src, dest);
}

/**
 * Ensure a parent task directory exists in the target workflow directory
 * Used when moving subtasks to preserve parent folder structure
 */
export function ensureParentTaskDirectory(parentTaskId: string, targetWorkflowDir: string): string {
  const parentFolderPath = join(targetWorkflowDir, parentTaskId);

  if (!existsSync(parentFolderPath)) {
    mkdirSync(parentFolderPath, { recursive: true });
  }

  return parentFolderPath;
}
