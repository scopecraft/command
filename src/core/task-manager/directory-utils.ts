import fs from 'node:fs';
import path from 'node:path';
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

/**
 * Gets the templates directory path
 * @param config Optional runtime configuration
 * @returns Path to the templates directory
 */
export function getTemplatesDirectory(config?: RuntimeConfig): string {
  const tasksDir = getTasksDirectory(config);
  return path.join(tasksDir, '.templates');
}

/**
 * Gets the config directory path
 * @param config Optional runtime configuration
 * @returns Path to the config directory
 */
export function getConfigDirectory(config?: RuntimeConfig): string {
  const tasksDir = getTasksDirectory(config);
  return path.join(tasksDir, '.config');
}

/**
 * Gets a specific phase directory
 * @param phase Phase name
 * @param config Optional runtime configuration
 * @returns Path to the phase directory
 */
export function getPhaseDirectory(phase: string, config?: RuntimeConfig): string {
  const tasksDir = getTasksDirectory(config);
  return path.join(tasksDir, phase);
}

/**
 * Lists all phase directories (excluding dot-prefix directories)
 * @param config Optional runtime configuration
 * @returns Array of phase directory names
 */
export function listPhaseDirectories(config?: RuntimeConfig): string[] {
  const tasksDir = getTasksDirectory(config);
  if (!fs.existsSync(tasksDir)) return [];

  return fs
    .readdirSync(tasksDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map((dirent) => dirent.name);
}

/**
 * Checks if a directory name is a feature directory
 * @param dirName Directory name to check
 * @returns True if it's a feature directory
 */
export function isFeatureDirectory(dirName: string): boolean {
  return dirName.startsWith('FEATURE_');
}

/**
 * Checks if a directory name is an area directory
 * @param dirName Directory name to check
 * @returns True if it's an area directory
 */
export function isAreaDirectory(dirName: string): boolean {
  return dirName.startsWith('AREA_');
}

/**
 * Lists subdirectories of a specific type within a phase
 * @param phase Phase to search in
 * @param type Optional type filter (feature or area)
 * @param config Optional runtime configuration
 * @returns Array of subdirectory names
 */
export function listSubdirectories(
  phase: string,
  type?: 'feature' | 'area',
  config?: RuntimeConfig
): string[] {
  const phaseDir = getPhaseDirectory(phase, config);
  if (!fs.existsSync(phaseDir)) return [];

  return fs
    .readdirSync(phaseDir, { withFileTypes: true })
    .filter((dirent) => {
      if (!dirent.isDirectory()) return false;
      if (!type) return true;
      if (type === 'feature') return isFeatureDirectory(dirent.name);
      if (type === 'area') return isAreaDirectory(dirent.name);
      return false;
    })
    .map((dirent) => dirent.name);
}

/**
 * Builds a file path for any entity type
 * @param filename File name
 * @param phase Optional phase
 * @param subdirectory Optional subdirectory
 * @param config Optional runtime configuration
 * @returns Full file path
 */
export function getFilePath(
  filename: string,
  phase?: string,
  subdirectory?: string,
  config?: RuntimeConfig
): string {
  const tasksDir = getTasksDirectory(config);
  const parts = [tasksDir];

  if (phase) parts.push(phase);
  if (subdirectory) parts.push(subdirectory);
  parts.push(filename);

  return path.join(...parts);
}

/**
 * Checks if a phase exists
 * @param phase Phase name to check
 * @param config Optional runtime configuration
 * @returns True if phase exists
 */
export function phaseExists(phase: string, config?: RuntimeConfig): boolean {
  const phaseDir = getPhaseDirectory(phase, config);
  return fs.existsSync(phaseDir) && fs.statSync(phaseDir).isDirectory();
}

/**
 * Checks if a subdirectory exists within a phase
 * @param phase Phase name
 * @param subdirectory Subdirectory name
 * @param config Optional runtime configuration
 * @returns True if subdirectory exists
 */
export function subdirectoryExists(
  phase: string,
  subdirectory: string,
  config?: RuntimeConfig
): boolean {
  const dir = getFilePath('', phase, subdirectory, config);
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

/**
 * Checks if a directory name is a system directory (dot-prefix)
 * @param dirName Directory name to check
 * @returns True if it's a system directory
 */
export function isSystemDirectory(dirName: string): boolean {
  return dirName.startsWith('.');
}

/**
 * Gets the path for overview file in a directory
 * @param phase Phase name
 * @param subdirectory Optional subdirectory
 * @param config Optional runtime configuration
 * @returns Path to overview file
 */
export function getOverviewFilePath(
  phase: string,
  subdirectory?: string,
  config?: RuntimeConfig
): string {
  return getFilePath('_overview.md', phase, subdirectory, config);
}

/**
 * Checks if a file is an overview file
 * @param filename File name to check
 * @returns True if it's an overview file
 */
export function isOverviewFile(filename: string): boolean {
  return path.basename(filename) === '_overview.md';
}

/**
 * Converts feature/area names to safe directory names
 * @param name Name to convert
 * @param prefix Optional prefix (FEATURE, AREA)
 * @returns Safe directory name
 */
export function toSafeDirectoryName(name: string, prefix?: string): string {
  // Remove special characters, spaces to underscores
  const safeName = name
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .toUpperCase();

  return prefix ? `${prefix}_${safeName}` : safeName;
}

/**
 * Extracts clean name from directory name
 * @param dirName Directory name
 * @returns Clean human-readable name
 */
export function extractNameFromDirectory(dirName: string): string {
  // Remove prefixes like FEATURE_, AREA_
  return dirName
    .replace(/^(FEATURE_|AREA_)/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
