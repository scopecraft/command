/**
 * V2 Directory Utilities
 * 
 * Manages workflow-based directory structure for v2 task system
 */

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import type { 
  WorkflowState, 
  TaskLocation, 
  StructureVersion,
  V2Config 
} from './types.js';

// Default workflow folder names
const DEFAULT_WORKFLOW_FOLDERS = {
  backlog: 'backlog',
  current: 'current',
  archive: 'archive'
} as const;

/**
 * Get the .tasks directory path
 */
export function getTasksDirectory(projectRoot: string): string {
  return join(projectRoot, '.tasks');
}

/**
 * Get workflow directory path
 */
export function getWorkflowDirectory(
  projectRoot: string, 
  state: WorkflowState,
  config?: V2Config
): string {
  const tasksDir = getTasksDirectory(projectRoot);
  const folderName = config?.workflowFolders?.[state] || DEFAULT_WORKFLOW_FOLDERS[state];
  return join(tasksDir, folderName);
}

/**
 * Get archive directory with optional date
 */
export function getArchiveDirectory(
  projectRoot: string,
  date?: string,
  config?: V2Config
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
 */
export function getTemplatesDirectory(projectRoot: string): string {
  return join(getTasksDirectory(projectRoot), '.templates');
}

/**
 * Get config directory path
 */
export function getConfigDirectory(projectRoot: string): string {
  return join(getTasksDirectory(projectRoot), '.config');
}

/**
 * Ensure all v2 workflow directories exist
 */
export function ensureWorkflowDirectories(projectRoot: string, config?: V2Config): void {
  const tasksDir = getTasksDirectory(projectRoot);
  
  // Create main .tasks directory
  if (!existsSync(tasksDir)) {
    mkdirSync(tasksDir, { recursive: true });
  }
  
  // Create workflow directories
  const states: WorkflowState[] = ['backlog', 'current', 'archive'];
  for (const state of states) {
    const dir = getWorkflowDirectory(projectRoot, state, config);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
  
  // Create .templates directory
  const templatesDir = getTemplatesDirectory(projectRoot);
  if (!existsSync(templatesDir)) {
    mkdirSync(templatesDir, { recursive: true });
  }
  
  // Create .config directory
  const configDir = getConfigDirectory(projectRoot);
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Detect structure version of a project
 */
export function detectStructureVersion(projectRoot: string): StructureVersion {
  const tasksDir = getTasksDirectory(projectRoot);
  
  if (!existsSync(tasksDir)) {
    return 'none';
  }
  
  const entries = readdirSync(tasksDir);
  
  // Check for v2 structure (workflow folders)
  const hasBacklog = entries.includes('backlog');
  const hasCurrent = entries.includes('current');
  const hasArchive = entries.includes('archive');
  const hasV2 = hasBacklog || hasCurrent || hasArchive;
  
  // Check for v1 structure (phase folders)
  const hasPhases = entries.some(entry => {
    const fullPath = join(tasksDir, entry);
    if (!statSync(fullPath).isDirectory()) return false;
    // V1 phases typically have names like "release-v1", "sprint-23", etc.
    return !['backlog', 'current', 'archive', '.templates', '.config'].includes(entry);
  });
  
  if (hasV2 && hasPhases) {
    return 'mixed';
  } else if (hasV2) {
    return 'v2';
  } else if (hasPhases) {
    return 'v1';
  }
  
  return 'none';
}

/**
 * Get all task files in a workflow state
 */
export function getTaskFilesInWorkflow(
  projectRoot: string,
  state: WorkflowState,
  config?: V2Config
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
export function parseTaskLocation(
  taskPath: string,
  projectRoot: string
): TaskLocation | null {
  const tasksDir = getTasksDirectory(projectRoot);
  const relativePath = relative(tasksDir, taskPath);
  
  // Parse workflow state from path
  const parts = relativePath.split('/');
  if (parts.length === 0) return null;
  
  const firstDir = parts[0];
  
  // Check if it's a workflow directory
  if (firstDir === 'backlog') {
    return { workflowState: 'backlog' };
  } else if (firstDir === 'current') {
    return { workflowState: 'current' };
  } else if (firstDir === 'archive') {
    // Check for archive date
    if (parts.length > 1 && /^\d{4}-\d{2}$/.test(parts[1])) {
      return { 
        workflowState: 'archive',
        archiveDate: parts[1]
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
export function isParentTaskFolder(dirPath: string): boolean {
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    return false;
  }
  
  const overviewPath = join(dirPath, '_overview.md');
  return existsSync(overviewPath);
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
    .filter(file => {
      // Match pattern: NN_name-MMX.task.md or NN-name.task.md (both supported)
      return /^\d{2}[_-].*\.task\.md$/.test(file);
    })
    .sort() // Sort by sequence number
    .map(file => join(parentTaskDir, file));
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
  config?: V2Config
): WorkflowState[] {
  const states: WorkflowState[] = [];
  
  for (const state of ['backlog', 'current', 'archive'] as const) {
    const dir = getWorkflowDirectory(projectRoot, state, config);
    if (existsSync(dir)) {
      states.push(state);
    }
  }
  
  return states;
}