import fs from 'node:fs';
import path from 'node:path';
import { ConfigurationManager } from '../config/configuration-manager.js';
import type { RuntimeConfig } from '../config/types.js';
import { ProjectConfig } from '../project-config.js';

/**
 * Gets the tasks directory path
 * @param config Optional runtime configuration
 * @returns Path to the tasks directory
 */
export function getTasksDirectory(config?: RuntimeConfig): string {
  const projectConfig = ProjectConfig.getInstance(config);
  return projectConfig.getTasksDirectory();
}

/**
 * Gets the phases directory path
 * @param config Optional runtime configuration
 * @returns Path to the phases directory
 */
export function getPhasesDirectory(config?: RuntimeConfig): string {
  const projectConfig = ProjectConfig.getInstance(config);
  return projectConfig.getPhasesDirectory();
}

/**
 * Ensure directory exists
 * @param dirPath Directory path to ensure exists
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get all files in a directory recursively
 * @param dir Directory to search
 * @param files Accumulator for files
 * @returns Array of file paths
 */
export function getAllFiles(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}
