/**
 * Value-added helper functions for common ChannelCoder patterns
 * Encapsulates complexity while maintaining composability
 */

import { join } from 'node:path';
import {
  type ClaudeOptions,
  type DockerOptions,
  type WorktreeOptions,
  monitorLog,
} from 'channelcoder';
import { type ExecutionResult, execute, executeTmux } from './client.js';
import { EXECUTION_MODES, getCentralizedSessionPaths, SESSION_STORAGE, SESSION_TYPES } from './constants.js';
import { ScopecraftSessionStorage } from './session-storage.js';

/**
 * Helper for autonomous task execution with monitoring support
 * Encapsulates session naming, log file setup, and streaming configuration
 */
export async function executeAutonomousTask(
  promptOrFile: string,
  options: {
    taskId: string;
    parentId?: string;
    execType: 'docker' | 'detached' | 'tmux';
    projectRoot?: string;
    session?: string; // For resuming sessions
    worktree?: WorktreeOptions;
    docker?: DockerOptions;
    dryRun?: boolean;
    data?: Record<string, unknown>;
  }
): Promise<ExecutionResult> {
  const projectRoot = options.projectRoot || process.cwd();
  const timestamp = Date.now();

  // Use provided session name or generate new one
  const sessionName = options.session || `${options.execType}-${options.taskId}-${timestamp}`;

  // ALWAYS generate logFile for autonomous execution
  const paths = getCentralizedSessionPaths();
  const logFile = join(paths.logsDir, `${sessionName}${SESSION_STORAGE.LOG_FILE_SUFFIX}`);

  // Ensure log directory exists
  const { mkdirSync } = await import('node:fs');
  mkdirSync(paths.logsDir, { recursive: true });

  // Special case for tmux - it has its own implementation
  if (options.execType === 'tmux') {
    return executeTmux(promptOrFile, {
      taskId: options.taskId,
      worktree: options.worktree?.path || projectRoot,
      data: {
        taskId: options.taskId,
        parentId: options.parentId,
        ...options.data,
      },
      dryRun: options.dryRun,
    });
  }

  // For docker and detached, ALWAYS use detached=true for dispatch
  const enhancedOptions: ClaudeOptions & { sessionName?: string } = {
    detached: true, // ALWAYS true for autonomous tasks
    logFile, // ALWAYS needed for detached
    stream: true, // ALWAYS stream for monitoring
    outputFormat: 'stream-json', // REQUIRED for real-time log monitoring
    sessionName, // Our tracking field
    resume: options.session, // Resume if session provided
    docker: options.docker, // Pass through if provided
    worktree: options.worktree, // Pass through if provided
    dryRun: options.dryRun,
    data: {
      ...options.data,
      taskId: options.taskId,
      parentId: options.parentId,
    },
  };

  return execute(promptOrFile, enhancedOptions);
}

/**
 * Helper for interactive task execution (work command)
 * Uses sessions for consistency but without log files
 */
export async function executeInteractiveTask(
  promptOrFile: string,
  options: {
    taskId: string;
    instruction?: string;
    session?: string; // For resuming sessions
    worktree?: WorktreeOptions;
    docker?: DockerOptions;
    dryRun?: boolean;
    data?: Record<string, unknown>;
  }
): Promise<ExecutionResult> {
  // Use provided session name or generate new one
  const sessionName = options.session || `interactive-${options.taskId}-${Date.now()}`;

  const enhancedOptions: ClaudeOptions & { sessionName?: string } = {
    mode: 'interactive',
    sessionName, // Track session for future resume capability
    resume: options.session, // Resume if session provided
    docker: options.docker,
    worktree: options.worktree,
    dryRun: options.dryRun,
    data: {
      ...options.data,
      taskId: options.taskId,
      taskInstruction: options.instruction,
    },
  };

  return execute(promptOrFile, enhancedOptions);
}

/**
 * Helper for planning/exploration without task context
 */
export async function executePlan(
  promptOrFile: string,
  options: ClaudeOptions = {}
): Promise<ExecutionResult> {
  // Simple pass-through for non-task execution
  return execute(promptOrFile, options);
}
