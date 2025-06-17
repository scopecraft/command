/**
 * ChannelCoder integration constants
 */

import { join } from 'node:path';
import type { IConfigurationManager } from '../../core/config/types.js';
import { WorktreePathResolver } from '../../core/environment/worktree-path-resolver.js';
import { TaskStoragePathEncoder } from '../../core/task-storage-path-encoder.js';

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
export function getCentralizedSessionPaths(_config?: IConfigurationManager) {
  // Get main repository root to ensure all worktrees share the same storage
  // If interface provided, let WorktreePathResolver use its default getInstance()
  const resolver = new WorktreePathResolver();
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
