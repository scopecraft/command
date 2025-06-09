/**
 * ChannelCoder Integration Utilities
 * 
 * Utility functions for working with Claude sessions and prompts
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { WorkMode } from './types.js';

/**
 * Builds task context for Claude session
 * 
 * This provides Claude with the task information needed for mode selection
 * and context awareness.
 */
export function buildTaskContext(
  taskId: string,
  taskTitle: string,
  taskType: string,
  taskStatus: string
): string {
  return `Task: ${taskId} - ${taskTitle}
Type: ${taskType}
Status: ${taskStatus}`;
}

/**
 * Load mode prompt from .tasks/.modes directory
 * 
 * @param projectRoot Project root directory
 * @param mode Work mode to load
 * @param area Optional area-specific prompt
 * @returns Mode prompt content or null if not found
 */
export async function loadModePrompt(
  projectRoot: string,
  mode: WorkMode,
  area?: string
): Promise<string | null> {
  // Special case for 'auto' mode - use the autonomous router
  const modeDir = mode === 'auto' ? 'orchestration' : mode;
  const fileName = mode === 'auto' ? 'autonomous.md' : 'base.md';
  
  const modesBasePath = join(projectRoot, '.tasks', '.modes');
  
  // Try area-specific prompt first if area is provided
  if (area) {
    const areaPath = join(modesBasePath, modeDir, 'area', `${area}.md`);
    if (existsSync(areaPath)) {
      try {
        return await readFile(areaPath, 'utf-8');
      } catch {
        // Fall through to base prompt
      }
    }
  }
  
  // Try base mode prompt
  const basePath = join(modesBasePath, modeDir, fileName);
  if (existsSync(basePath)) {
    try {
      return await readFile(basePath, 'utf-8');
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Combine prompts into final prompt for Claude
 * 
 * @param modePrompt Mode-specific prompt template
 * @param taskContext Task context (ID, title, type, status)
 * @param taskInstruction Task instruction content
 * @param additionalPrompt Additional user-provided prompt
 * @param data Template data for interpolation
 * @returns Combined prompt ready for Claude
 */
export function combinePrompts(
  modePrompt: string | null,
  taskContext: string,
  taskInstruction: string,
  additionalPrompt?: string,
  data?: Record<string, string>
): string {
  const parts: string[] = [];
  
  // If we have a mode prompt, use it as the base
  if (modePrompt) {
    // Replace template variables if data provided
    let processedPrompt = modePrompt;
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        processedPrompt = processedPrompt.replace(new RegExp(`{${key}}`, 'g'), value);
      });
    }
    parts.push(processedPrompt);
  } else {
    // Fallback if no mode prompt found
    parts.push('You are assisting with a development task.');
    parts.push(taskContext);
  }
  
  // Add task instruction
  if (taskInstruction) {
    parts.push('## Task Instruction\n' + taskInstruction);
  }
  
  // Add additional prompt from user
  if (additionalPrompt) {
    parts.push('## Additional Context\n' + additionalPrompt);
  }
  
  return parts.join('\n\n');
}

/**
 * Generate session name for tracking
 * 
 * @param taskId Task ID
 * @param mode Work mode
 * @param execType Execution type
 * @returns Generated session name
 */
export function generateSessionName(
  taskId: string,
  mode: WorkMode,
  execType: string
): string {
  const timestamp = Date.now();
  return `${execType}-${taskId}-${mode}-${timestamp}`;
}

/**
 * Get session directories
 * 
 * @param projectRoot Project root directory
 * @returns Object with session directory paths
 */
export function getSessionDirectories(projectRoot: string) {
  const baseDir = join(projectRoot, '.tasks', '.autonomous-sessions');
  return {
    baseDir,
    logDir: join(baseDir, 'logs'),
  };
}