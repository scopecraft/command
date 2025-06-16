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
 * Supports:
 * - Simple modes: "design" -> "design/base.md"
 * - Mode variants: "design/trd" -> "design/trd.md"
 * - Special auto mode: "auto" -> "orchestration/autonomous.md"
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
  
  // Check if mode contains a slash, indicating a variant
  if (mode.includes('/')) {
    // Split into mode and variant: "design/trd" -> ["design", "trd"]
    const parts = mode.split('/');
    const modeName = parts[0];
    const variantName = parts.slice(1).join('/'); // Support nested paths if needed
    
    // Add .md extension if not present
    const fileName = variantName.endsWith('.md') ? variantName : `${variantName}.md`;
    return join(modesDir, modeName, fileName);
  }
  
  // Default behavior for simple mode names
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
