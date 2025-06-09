/**
 * ChannelCoder integration constants
 */

import { join } from 'node:path';

// Session storage configuration
export const SESSION_STORAGE = {
  // Base directory for all session data (relative to project root)
  BASE_DIR: '.sessions',

  // Subdirectories
  SESSIONS_SUBDIR: 'sessions', // ChannelCoder session files
  LOGS_SUBDIR: 'logs', // Log files for autonomous tasks

  // File patterns
  INFO_FILE_SUFFIX: '.info.json',
  LOG_FILE_SUFFIX: '.log',

  // Helper functions for consistent path generation
  getBaseDir: (projectRoot?: string) =>
    join(projectRoot || process.cwd(), SESSION_STORAGE.BASE_DIR),

  getSessionsDir: (projectRoot?: string) =>
    join(SESSION_STORAGE.getBaseDir(projectRoot), SESSION_STORAGE.SESSIONS_SUBDIR),

  getLogsDir: (projectRoot?: string) =>
    join(SESSION_STORAGE.getBaseDir(projectRoot), SESSION_STORAGE.LOGS_SUBDIR),
} as const;

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
