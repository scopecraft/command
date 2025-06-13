/**
 * Task Storage Path Encoder
 * 
 * Provides encoding/decoding for project paths to create readable directory names
 * for centralized storage in ~/.scopecraft/projects/
 */

import os from 'node:os';
import path from 'node:path';

/**
 * Utility class for encoding project paths into flat, readable directory names
 */
export class TaskStoragePathEncoder {
  /**
   * Encode a project path into a flat, readable format
   * Example: "/Users/alice/Projects/myapp" -> "users-alice-projects-myapp"
   */
  static encode(projectPath: string): string {
    const resolved = path.resolve(projectPath);
    
    // Split path into parts and filter out empty strings
    const parts = resolved.split(path.sep).filter(Boolean);
    
    // Convert to lowercase, readable format with hyphens
    return parts
      .map(part => part.replace(/[^a-zA-Z0-9-]/g, '_')) // Replace special chars with underscore
      .join('-')
      .toLowerCase();
  }
  
  /**
   * Decode an encoded path back to a filesystem path
   * Note: This is a best-effort reconstruction and may not be exact
   */
  static decode(encodedPath: string): string {
    // Replace hyphens with path separators
    const reconstructed = encodedPath.replace(/-/g, path.sep);
    
    // Add leading separator for absolute paths (Unix/Linux/macOS)
    if (process.platform !== 'win32') {
      return path.sep + reconstructed;
    }
    
    return reconstructed;
  }
  
  /**
   * Validate that an encoded path looks reasonable
   */
  static validateEncoded(encodedPath: string): boolean {
    // Should only contain lowercase letters, numbers, hyphens, and underscores
    return /^[a-z0-9-_]+$/.test(encodedPath);
  }
  
  /**
   * Get the storage root directory for a project
   */
  static getProjectStorageRoot(projectPath: string): string {
    const encoded = TaskStoragePathEncoder.encode(projectPath);
    return path.join(os.homedir(), '.scopecraft', 'projects', encoded);
  }
  
  /**
   * Get the tasks directory for a project
   */
  static getTaskStorageRoot(projectPath: string): string {
    return path.join(TaskStoragePathEncoder.getProjectStorageRoot(projectPath), 'tasks');
  }
  
  /**
   * Get the sessions directory for a project
   */
  static getSessionStorageRoot(projectPath: string): string {
    return path.join(TaskStoragePathEncoder.getProjectStorageRoot(projectPath), 'sessions');
  }
  
  /**
   * Get the templates directory for a project
   */
  static getTemplateStorageRoot(projectPath: string): string {
    return path.join(TaskStoragePathEncoder.getProjectStorageRoot(projectPath), 'templates');
  }
  
  /**
   * Get the modes directory for a project
   */
  static getModeStorageRoot(projectPath: string): string {
    return path.join(TaskStoragePathEncoder.getProjectStorageRoot(projectPath), 'modes');
  }
  
  /**
   * Get the config directory for a project
   */
  static getConfigStorageRoot(projectPath: string): string {
    return path.join(TaskStoragePathEncoder.getProjectStorageRoot(projectPath), 'config');
  }
}

/**
 * Security validation for scopecraft paths
 */
export function validateScopecraftPath(targetPath: string): void {
  const scopecraftRoot = path.join(os.homedir(), '.scopecraft');
  const resolved = path.resolve(targetPath);
  
  if (!resolved.startsWith(scopecraftRoot)) {
    throw new Error(`Security: Path ${targetPath} outside ~/.scopecraft`);
  }
}

/**
 * File and directory permissions for security
 */
export const STORAGE_PERMISSIONS = {
  DIRECTORY: 0o700,  // drwx------ (user only)
  FILE: 0o600,       // -rw------- (user only)
} as const;