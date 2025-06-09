/**
 * Utility functions for ChannelCoder integration
 */

import { join } from 'node:path';
import type { InterpolationData } from 'channelcoder';

/**
 * Resolve mode prompt path based on project structure
 */
export function resolveModePromptPath(projectRoot: string, mode: string): string {
  if (mode === 'auto') {
    return join(projectRoot, '.tasks', '.modes', 'orchestration', 'autonomous.md');
  }
  return join(projectRoot, '.tasks', '.modes', mode, 'base.md');
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
