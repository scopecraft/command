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
  resolveTaskId,
  taskIdExists,
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
