import fs from 'node:fs';
import { projectConfig } from '../project-config.js';

/**
 * Gets the tasks directory path
 * @returns Path to the tasks directory
 */
export function getTasksDirectory(): string {
  return projectConfig.getTasksDirectory();
}

/**
 * Gets the phases directory path
 * @returns Path to the phases directory
 */
export function getPhasesDirectory(): string {
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
