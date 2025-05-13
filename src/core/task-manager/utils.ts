import fs from 'fs';
import path from 'path';

/**
 * Recursively get all files from a directory
 * @param dir Directory to search
 * @returns Array of file paths
 */
export function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory()
      ? getAllFiles(fullPath)
      : entry.name.endsWith('.md') ? [fullPath] : [];
  });
}