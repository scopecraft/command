/**
 *  Project Initialization
 *
 * Handles project structure initialization for  workflow-based system
 */

import { ensureWorkflowDirectories } from './directory-utils.js';
import { initializeTemplates } from './template-manager.js';
import type { ProjectConfig } from './types.js';

/**
 * Initialize  project structure
 */
export function initializeProjectStructure(projectRoot: string, config?: ProjectConfig): void {
  // Create workflow directories (handles both centralized and repo paths)
  ensureWorkflowDirectories(projectRoot, config);

  // Initialize templates in the repository with override if provided
  initializeTemplates(projectRoot, config?.override);
}
