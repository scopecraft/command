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
 * @deprecated phases are now first-level directories under tasks
 * @param config Optional runtime configuration
 * @returns Path to the tasks directory
 */
export function getPhasesDirectory(config?: RuntimeConfig): string {
  const projectConfig = ProjectConfig.getInstance(config);
  return projectConfig.getPhasesDirectory();
}

/**
 * Resolves any path to an absolute path
 * @param filePath Path to resolve
 * @returns Absolute path
 */
export function resolveAbsolutePath(filePath: string): string {
  return path.resolve(filePath);
}

/**
 * Parses a task path to extract phase and subdirectory information
 * @param filePath Path to parse
 * @param config Optional runtime configuration
 * @returns Object with phase and subdirectory properties
 */
export function parseTaskPath(
  filePath: string,
  config?: RuntimeConfig
): { phase?: string; subdirectory?: string } {
  const tasksDir = getTasksDirectory(config);
  const absoluteTasksDir = path.resolve(tasksDir);
  const absoluteFilePath = path.resolve(filePath);

  // Ensure file is under tasks directory
  if (!absoluteFilePath.startsWith(absoluteTasksDir)) {
    return {};
  }

  const relativePath = path.relative(absoluteTasksDir, absoluteFilePath);
  const parts = relativePath.split(path.sep);

  // Skip dot-prefix directories (system dirs)
  if (parts.length > 0 && parts[0].startsWith('.')) {
    return {};
  }

  if (parts.length === 1) {
    // Only filename, no phase or subdirectory
    return {};
  }

  if (parts.length === 2) {
    // phase/filename - has phase but no subdirectory
    return { phase: parts[0] };
  }

  // Has both phase and subdirectory (or more levels)
  const phase = parts[0];
  // Combine all middle directories as the subdirectory path
  const subdirectory = parts.slice(1, -1).join(path.sep);
  return { phase, subdirectory };
}

/**
 * Gets the full file path for a task
 * @param id Task ID
 * @param phase Optional phase
 * @param subdirectory Optional subdirectory
 * @param config Optional runtime configuration
 * @returns Full file path
 */
export function getTaskFilePath(
  id: string,
  phase?: string,
  subdirectory?: string,
  config?: RuntimeConfig
): string {
  const tasksDir = getTasksDirectory(config);
  const parts = [tasksDir];

  if (phase) {
    parts.push(phase);
  }

  if (subdirectory) {
    parts.push(subdirectory);
  }

  parts.push(`${id}.md`);

  return path.join(...parts);
}

/**
 * Migrates system directories to dot-prefix convention
 * @param config Optional runtime configuration
 */
export function migrateSystemDirectories(config?: RuntimeConfig): void {
  const tasksDir = getTasksDirectory(config);

  // Migrate config and templates to dot-prefix
  const migrations = [
    { old: 'config', new: '.config' },
    { old: 'templates', new: '.templates' },
  ];

  for (const { old, new: newName } of migrations) {
    const oldPath = path.join(tasksDir, old);
    const newPath = path.join(tasksDir, newName);

    if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
      console.log(`Migrating ${oldPath} to ${newPath}`);
      fs.renameSync(oldPath, newPath);
    }
  }
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
