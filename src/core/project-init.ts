/**
 *  Project Initialization
 *
 * Handles project structure initialization for  workflow-based system
 */

import { existsSync } from 'node:fs';
import { detectStructureVersion, ensureWorkflowDirectories } from './directory-utils.js';
import type { ProjectConfig } from './types.js';

/**
 * Initialize  project structure
 */
export function initializeProjectStructure(projectRoot: string, config?: ProjectConfig): void {
  // Create workflow directories
  ensureWorkflowDirectories(projectRoot, config);
}

/**
 * Check if project needs initialization
 */
export function needsInit(projectRoot: string): boolean {
  const version = detectStructureVersion(projectRoot);

  // Need init if no structure or only v1 structure
  return version === 'none' || version === 'v1';
}

/**
 * Get initialization status message
 */
export function getInitStatus(projectRoot: string): string {
  const version = detectStructureVersion(projectRoot);

  switch (version) {
    case 'none':
      return 'No task structure found. Ready to initialize.';
    case 'v1':
      return 'V1 structure detected. New structure will be added alongside.';
    case 'v2':
      return 'Structure already initialized.';
    case 'mixed':
      return 'Mixed structure detected.';
    default:
      return 'Unknown structure state.';
  }
}
