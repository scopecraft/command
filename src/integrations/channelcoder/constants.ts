/**
 * ChannelCoder integration constants
 */

import { join } from 'node:path';
import { WorktreePathResolver } from '../../core/environment/worktree-path-resolver.js';
import { TaskStoragePathEncoder } from '../../core/task-storage-path-encoder.js';
import type { IConfigurationManager } from '../../core/config/types.js';

// Session storage configuration
export const SESSION_STORAGE = {
  // Subdirectories under centralized storage
  SESSIONS_SUBDIR: 'sessions', // ChannelCoder session files
  LOGS_SUBDIR: 'logs', // Log files for autonomous tasks

  // File patterns
  INFO_FILE_SUFFIX: '.info.json',
  LOG_FILE_SUFFIX: '.log',
} as const;

/**
 * Get centralized session storage directories
 * All worktrees share the same session storage in ~/.scopecraft/projects/{encoded}/sessions/
 */
export function getCentralizedSessionPaths(config?: IConfigurationManager) {
  // Get main repository root to ensure all worktrees share the same storage
  const resolver = new WorktreePathResolver(config);
  const mainRepoRoot = resolver.getMainRepositoryRootSync();
  
  // Use the same encoder as task storage for consistency
  const storageRoot = TaskStoragePathEncoder.getProjectStorageRoot(mainRepoRoot);
  
  return {
    baseDir: join(storageRoot, 'sessions'),
    sessionsDir: join(storageRoot, 'sessions', SESSION_STORAGE.SESSIONS_SUBDIR),
    logsDir: join(storageRoot, 'sessions', SESSION_STORAGE.LOGS_SUBDIR),
  };
}


// Session types
export const SESSION_TYPES = {
  AUTONOMOUS: 'autonomous-task',
  INTERACTIVE: 'interactive',
  PLANNING: 'planning',
} as const;

// Execution modes
export const EXECUTION_MODES = {
  DETACHED: 'detached',
  DOCKER: 'docker',
  TMUX: 'tmux',
  INTERACTIVE: 'interactive',
} as const;
