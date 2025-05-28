/**
 * V2 ID Generation and Resolution
 * 
 * Handles task ID generation and resolution for the v2 system
 */

import { existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { 
  TaskIdComponents, 
  WorkflowState,
  TaskReference,
  V2Config 
} from './types.js';
import { 
  getWorkflowDirectory, 
  getTasksDirectory,
  getExistingWorkflowStates,
  isParentTaskFolder
} from './directory-utils.js';

// Characters to use for random suffix (alphanumeric, no ambiguous chars)
const SUFFIX_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a v2 task ID from a title
 */
export function generateTaskId(title: string, date: Date = new Date()): string {
  // Generate descriptive name (kebab-case)
  const descriptiveName = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
    .slice(0, 50);                 // Limit length
  
  // Generate date code (MMDD)
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateCode = `${month}${day}`;
  
  // Generate random suffix (2 chars)
  const randomSuffix = generateRandomSuffix();
  
  return `${descriptiveName}-${dateCode}-${randomSuffix}`;
}

/**
 * Generate a random suffix for task IDs
 */
function generateRandomSuffix(): string {
  let suffix = '';
  for (let i = 0; i < 2; i++) {
    const index = Math.floor(Math.random() * SUFFIX_CHARS.length);
    suffix += SUFFIX_CHARS[index];
  }
  return suffix;
}

/**
 * Parse a v2 task ID into components
 */
export function parseTaskId(taskId: string): TaskIdComponents | null {
  // Remove .task.md if present
  const id = taskId.replace(/\.task\.md$/, '');
  
  // Match pattern: descriptive-name-MMDD-XX
  const match = id.match(/^(.+)-(\d{4})-([A-Z0-9]{2})$/);
  if (!match) {
    return null;
  }
  
  return {
    descriptiveName: match[1],
    dateCode: match[2],
    randomSuffix: match[3]
  };
}

/**
 * Validate a v2 task ID format
 */
export function isValidTaskId(taskId: string): boolean {
  const components = parseTaskId(taskId);
  if (!components) return false;
  
  // Validate date code (MMDD)
  const month = parseInt(components.dateCode.slice(0, 2), 10);
  const day = parseInt(components.dateCode.slice(2, 4), 10);
  
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
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
      join(fullPath, '_overview.md') // Complex task
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
  
  // Direct file check
  const directPath = join(workflowDir, `${taskId}.task.md`);
  if (existsSync(directPath)) {
    return directPath;
  }
  
  // Check for complex task folder
  const complexPath = join(workflowDir, taskId);
  if (isParentTaskFolder(complexPath)) {
    return join(complexPath, '_overview.md');
  }
  
  // For archive, search subdirectories (YYYY-MM)
  if (state === 'archive') {
    return searchArchive(taskId, workflowDir);
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
    .filter(entry => /^\d{4}-\d{2}$/.test(entry))
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
    explicitPath
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
export function taskIdExists(
  taskId: string,
  projectRoot: string,
  config?: V2Config
): boolean {
  return resolveTaskId(taskId, projectRoot, config) !== null;
}

/**
 * Generate a unique task ID
 * If the generated ID exists, it will try with different random suffixes
 */
export function generateUniqueTaskId(
  title: string,
  projectRoot: string,
  config?: V2Config,
  maxAttempts: number = 10
): string {
  const date = new Date();
  
  for (let i = 0; i < maxAttempts; i++) {
    const id = generateTaskId(title, date);
    if (!taskIdExists(id, projectRoot, config)) {
      return id;
    }
  }
  
  // If we still can't find a unique ID, add timestamp
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return generateTaskId(`${title}-${timestamp}`, date);
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
export function getAllTaskIds(
  projectRoot: string,
  config?: V2Config
): Map<string, WorkflowState> {
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