/**
 * Shared validation utilities for MCP handlers
 * Provides consistent validation across operations
 */

import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as core from '../../../core/index.js';
import { loadProjectConfig } from './config-utils.js';

/**
 * Validate that a parent task exists and is valid
 */
export async function validateParentTask(
  projectRoot: string,
  parentId: string
): Promise<{ isValid: boolean; error?: string; path?: string }> {
  try {
    // Try to resolve the parent task
    const projectConfig = loadProjectConfig(projectRoot);
    const parentPath = core.resolveTaskId(parentId, projectRoot, projectConfig);
    if (!parentPath) {
      return {
        isValid: false,
        error: `Parent task not found: ${parentId}`,
      };
    }

    // Verify it's a parent task (ends with _overview.md)
    if (!parentPath.endsWith('_overview.md')) {
      return {
        isValid: false,
        error: `Task ${parentId} is not a parent task`,
      };
    }

    // Verify the file exists
    if (!existsSync(parentPath)) {
      return {
        isValid: false,
        error: `Parent task file not found: ${parentPath}`,
      };
    }

    return {
      isValid: true,
      path: parentPath,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to validate parent task',
    };
  }
}

/**
 * Validate that a task exists
 */
export async function validateTaskExists(
  projectRoot: string,
  taskId: string,
  parentId?: string
): Promise<{ exists: boolean; task?: core.Task; error?: string }> {
  try {
    const projectConfig = loadProjectConfig(projectRoot);
    const result = await core.get(projectRoot, taskId, projectConfig, parentId);

    if (!result.success || !result.data) {
      return {
        exists: false,
        error: result.error || 'Task not found',
      };
    }

    return {
      exists: true,
      task: result.data,
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Failed to validate task',
    };
  }
}

/**
 * Validate workflow state
 */
export function validateWorkflowState(state?: string): state is core.WorkflowState {
  if (!state) return true; // Optional, so undefined is valid
  return ['current', 'archive'].includes(state);
}

/**
 * Validate task type
 */
export function validateTaskType(type: string): type is core.TaskType {
  return ['feature', 'bug', 'chore', 'documentation', 'test', 'spike', 'idea'].includes(type);
}

/**
 * Validate and parse subtask ID within a parent
 * Returns the full subtask path if valid
 */
export function resolveSubtaskPath(parentDir: string, subtaskId: string): string | null {
  // Handle different subtask ID formats
  // Could be: "01_task-name", "task-name", or full ID

  // If it looks like a sequence_name format
  if (/^\d{2}_/.test(subtaskId)) {
    const filename = `${subtaskId}.task.md`;
    const path = join(parentDir, filename);
    return existsSync(path) ? path : null;
  }

  // Try to find by partial match using fs
  const files = existsSync(parentDir) ? readdirSync(parentDir) : [];
  const match = files.find(
    (f) => f.endsWith('.task.md') && (f.includes(subtaskId) || f.endsWith(`${subtaskId}.task.md`))
  );

  return match ? join(parentDir, match) : null;
}

/**
 * Sanitize section content to prevent section header corruption
 * Converts ## headers to ### headers to avoid parser conflicts
 */
export function sanitizeSectionContent(content: string): string {
  if (!content) return content;

  // Convert ## headers to ### headers, but leave ### and #### unchanged
  // This prevents section content from being misinterpreted as task sections
  return content.replace(/^##(?!#)/gm, '###');
}
