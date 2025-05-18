import fs from 'node:fs';
import path from 'node:path';
import { ConfigurationManager } from '../config/configuration-manager.js';
import type { RuntimeConfig } from '../config/types.js';
import { projectConfig } from '../project-config.js';

/**
 * Gets the tasks directory path
 * @param config Optional runtime configuration
 * @returns Path to the tasks directory
 */
export function getTasksDirectory(config?: RuntimeConfig): string {
  const configManager = ConfigurationManager.getInstance();
  const rootConfig = configManager.getRootConfig(config);

  // Check if we have a configured root (from CLI, config file, etc.)
  if (rootConfig.path && rootConfig.source !== 'auto_detect') {
    // Determine task directory based on project type in root
    if (fs.existsSync(path.join(rootConfig.path, '.ruru'))) {
      return path.join(rootConfig.path, '.ruru', 'tasks');
    }
    return path.join(rootConfig.path, '.tasks');
  }

  // Fallback to existing behavior
  return projectConfig.getTasksDirectory();
}

/**
 * Gets the phases directory path
 * @param config Optional runtime configuration
 * @returns Path to the phases directory
 */
export function getPhasesDirectory(config?: RuntimeConfig): string {
  const configManager = ConfigurationManager.getInstance();
  const rootConfig = configManager.getRootConfig(config);

  // Check if we have a configured root (from CLI, config file, etc.)
  if (rootConfig.path && rootConfig.source !== 'auto_detect') {
    // Determine phases directory based on project type in root
    if (fs.existsSync(path.join(rootConfig.path, '.ruru'))) {
      return path.join(rootConfig.path, '.ruru', 'tasks'); // Roo Commander uses tasks dir for phases
    }
    return path.join(rootConfig.path, '.tasks', 'phases');
  }

  // Fallback to existing behavior
  return projectConfig.getPhasesDirectory();
}

/**
 * Ensure directory exists
 * @param dirPath Path to the directory to ensure
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
