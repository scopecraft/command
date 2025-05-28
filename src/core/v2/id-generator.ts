/**
 * V2 ID Generation and Resolution
 *
 * Handles task ID generation and resolution for the v2 system
 * Now uses abbreviated names and simplified suffix format
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import {
  getExistingWorkflowStates,
  getTasksDirectory,
  getWorkflowDirectory,
  isParentTaskFolder,
} from './directory-utils.js';
import { abbreviateTaskName } from './name-abbreviator.js';
import type { TaskIdComponents, TaskReference, V2Config, WorkflowState } from './types.js';

// Characters to use for month suffix (A-Z)
const MONTH_SUFFIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generate a v2 task ID from a title
 * Format: {abbreviated-name}-{MM}{X}
 */
export function generateTaskId(title: string, date: Date = new Date()): string {
  // Use abbreviation utility for intelligent shortening
  const descriptiveName = abbreviateTaskName(title, 30);

  // Generate month code (MM)
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Generate random letter suffix (A-Z)
  const randomLetter = generateMonthSuffix();

  return `${descriptiveName}-${month}${randomLetter}`;
}

/**
 * Generate a subtask ID with sequence prefix
 * Format: {NN}_{abbreviated-name}-{MM}{X}
 */
export function generateSubtaskId(
  title: string,
  sequence: string,
  date: Date = new Date()
): string {
  const baseId = generateTaskId(title, date);
  return `${sequence}_${baseId}`;
}

/**
 * Generate a random letter suffix for month uniqueness
 */
function generateMonthSuffix(): string {
  const index = Math.floor(Math.random() * MONTH_SUFFIX_CHARS.length);
  return MONTH_SUFFIX_CHARS[index];
}

/**
 * Parse a v2 task ID into components
 */
export function parseTaskId(taskId: string): TaskIdComponents | null {
  // Remove .task.md if present
  const id = taskId.replace(/\.task\.md$/, '');

  // Check if it's a subtask (has sequence prefix)
  const subtaskMatch = id.match(/^(\d{2})_(.+)-(\d{2})([A-Z])$/);
  if (subtaskMatch) {
    return {
      sequenceNumber: subtaskMatch[1],
      descriptiveName: subtaskMatch[2],
      monthCode: subtaskMatch[3],
      letterSuffix: subtaskMatch[4],
    };
  }

  // Match floating task pattern: descriptive-name-MM[A-Z]
  const floatingMatch = id.match(/^(.+)-(\d{2})([A-Z])$/);
  if (!floatingMatch) {
    return null;
  }

  return {
    descriptiveName: floatingMatch[1],
    monthCode: floatingMatch[2],
    letterSuffix: floatingMatch[3],
  };
}

/**
 * Validate a v2 task ID format
 */
export function isValidTaskId(taskId: string): boolean {
  const components = parseTaskId(taskId);
  if (!components) return false;

  // Validate month code (MM)
  const month = Number.parseInt(components.monthCode, 10);
  if (month < 1 || month > 12) return false;

  // Validate letter suffix
  if (!/^[A-Z]$/.test(components.letterSuffix)) return false;

  // Validate sequence number if present
  if (components.sequenceNumber) {
    const seq = Number.parseInt(components.sequenceNumber, 10);
    if (isNaN(seq) || seq < 1 || seq > 99) return false;
  }

  // Validate descriptive name
  if (!components.descriptiveName || components.descriptiveName.length > 30) {
    return false;
  }

  return true;
}

/**
 * Resolve a task ID to its full path
 * Search order: current → backlog → archive
 */
export function resolveTaskId(
  taskId: string,
  projectRoot: string,
  config?: V2Config
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

  // Standard search order
  const searchOrder: WorkflowState[] = ['current', 'backlog', 'archive'];

  for (const state of searchOrder) {
    const found = findTaskInWorkflow(taskId, projectRoot, state, config);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Enhanced task ID resolution with parent context support
 * Eliminates the need for workflow state prefixes when using parent context
 */
export function resolveTaskIdWithContext(
  taskId: string,
  projectRoot: string,
  parentId?: string,
  config?: V2Config
): { path: string | null; suggestions?: string[] } {
  // Handle explicit paths (e.g., "current/implement-oauth-0127-AB")
  if (taskId.includes('/')) {
    const path = resolveTaskId(taskId, projectRoot, config);
    return { path };
  }

  // If parent context is provided, search within parent first
  if (parentId) {
    const parentPath = resolveTaskId(parentId, projectRoot, config);
    if (parentPath && parentPath.endsWith('_overview.md')) {
      const parentDir = dirname(parentPath);
      const subtaskPath = join(parentDir, `${taskId}.task.md`);
      if (existsSync(subtaskPath)) {
        return { path: subtaskPath };
      }
    }
  }

  // Collect all matches across workflow states
  const matches: Array<{ path: string; state: WorkflowState; parent?: string }> = [];
  const searchOrder: WorkflowState[] = ['current', 'backlog', 'archive'];

  for (const state of searchOrder) {
    const found = findTaskInWorkflow(taskId, projectRoot, state, config);
    if (found) {
      // Determine if it's a subtask and get parent info
      const parentDir = dirname(found);
      const isSubtask =
        basename(parentDir) !== state && (state !== 'archive' || !parentDir.match(/\d{4}-\d{2}$/));

      matches.push({
        path: found,
        state,
        parent: isSubtask ? basename(parentDir) : undefined,
      });
    }
  }

  // Return results based on number of matches
  if (matches.length === 0) {
    return { path: null };
  }

  if (matches.length === 1) {
    return { path: matches[0].path };
  }

  // Multiple matches - prefer current, then backlog, then archive
  const preferredMatch = matches[0]; // Already sorted by search order
  const suggestions = matches.map((match) => {
    if (match.parent) {
      return `${match.state}/${match.parent}/${taskId}`;
    }
    return `${match.state}/${taskId}`;
  });

  return {
    path: preferredMatch.path,
    suggestions,
  };
}

/**
 * Find a task in a specific workflow state
 */
function findTaskInWorkflow(
  taskId: string,
  projectRoot: string,
  state: WorkflowState,
  config?: V2Config
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
 * Parse a task reference (@task:{id}#{section})
 */
export function parseTaskReference(reference: string): TaskReference | null {
  const match = reference.match(/^@task:([^#]+)(?:#(.+))?$/);
  if (!match) {
    return null;
  }

  const id = match[1];
  const section = match[2];

  // Check if it's an explicit path
  const explicitPath = id.includes('/') ? id : undefined;

  return {
    id: explicitPath ? basename(id) : id,
    section,
    explicitPath,
  };
}

/**
 * Format a task reference
 */
export function formatTaskReference(ref: TaskReference): string {
  const path = ref.explicitPath || ref.id;
  return ref.section ? `@task:${path}#${ref.section}` : `@task:${path}`;
}

/**
 * Check if a task ID already exists
 */
export function taskIdExists(taskId: string, projectRoot: string, config?: V2Config): boolean {
  return resolveTaskId(taskId, projectRoot, config) !== null;
}

/**
 * Generate a unique task ID
 * If the generated ID exists, it will try with different letter suffixes
 */
export function generateUniqueTaskId(
  title: string,
  projectRoot: string,
  config?: V2Config,
  maxAttempts = 26
): string {
  const date = new Date();
  const abbreviated = abbreviateTaskName(title, 30);
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Try all letters A-Z for this month
  for (let i = 0; i < maxAttempts && i < 26; i++) {
    const letter = MONTH_SUFFIX_CHARS[i];
    const id = `${abbreviated}-${month}${letter}`;
    if (!taskIdExists(id, projectRoot, config)) {
      return id;
    }
  }

  // If all 26 letters are taken for this month (unlikely!),
  // append a number to the name and try again
  const extendedTitle = `${title}-${Math.floor(Math.random() * 99)}`;
  return generateTaskId(extendedTitle, date);
}

/**
 * List all task IDs in a workflow state
 */
export function listTaskIds(
  projectRoot: string,
  state: WorkflowState,
  config?: V2Config
): string[] {
  const workflowDir = getWorkflowDirectory(projectRoot, state, config);
  if (!existsSync(workflowDir)) {
    return [];
  }

  const ids: string[] = [];

  function scanDirectory(dir: string) {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);

      // Skip hidden directories
      if (entry.startsWith('.')) continue;

      if (entry.endsWith('.task.md')) {
        // Regular task file
        ids.push(entry.slice(0, -8)); // Remove .task.md
      } else if (isParentTaskFolder(fullPath)) {
        // Complex task folder
        ids.push(entry);
      } else if (state === 'archive' && /^\d{4}-\d{2}$/.test(entry)) {
        // Archive date directory
        scanDirectory(fullPath);
      }
    }
  }

  scanDirectory(workflowDir);
  return ids;
}

/**
 * Get all task IDs across all workflow states
 */
export function getAllTaskIds(projectRoot: string, config?: V2Config): Map<string, WorkflowState> {
  const idMap = new Map<string, WorkflowState>();
  const states = getExistingWorkflowStates(projectRoot, config);

  for (const state of states) {
    const ids = listTaskIds(projectRoot, state, config);
    for (const id of ids) {
      idMap.set(id, state);
    }
  }

  return idMap;
}
