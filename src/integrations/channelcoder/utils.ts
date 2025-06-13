/**
 * Utility functions for ChannelCoder integration
 */

import { join } from 'node:path';
import type { InterpolationData } from 'channelcoder';
// MIGRATION: Using new centralized path resolver for modes
import { PATH_TYPES, createPathContext, resolvePath } from '../../core/paths/index.js';

/**
 * Resolve mode prompt path based on project structure
 *
 * @migration Updated to use centralized path resolver
 */
export function resolveModePromptPath(projectRoot: string, mode: string): string {
  // MIGRATION: Now using centralized path resolver
  const context = createPathContext(projectRoot);
  const modesDir = resolvePath(PATH_TYPES.MODES, context);

  if (mode === 'auto') {
    return join(modesDir, 'orchestration', 'autonomous.md');
  }
  return join(modesDir, mode, 'base.md');
}

/**
 * Build data object for task template interpolation
 */
export function buildTaskData(
  taskId: string,
  instruction: string,
  additionalContext?: string,
  parentId?: string
): InterpolationData {
  return {
    taskId,
    parentId: parentId || '',
    taskInstruction: instruction,
    additionalInstructions: additionalContext || '',
  };
}
