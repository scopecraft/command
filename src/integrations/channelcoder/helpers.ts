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
import { EXECUTION_MODES, SESSION_STORAGE, SESSION_TYPES } from './constants.js';
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
    worktree?: WorktreeOptions;
    docker?: DockerOptions;
    dryRun?: boolean;
    data?: Record<string, unknown>;
  }
): Promise<ExecutionResult> {
  const projectRoot = options.projectRoot || process.cwd();
  const timestamp = Date.now();

  // Consistent session naming: {execType}-{taskId}-{timestamp}
  const sessionName = `${options.execType}-${options.taskId}-${timestamp}`;

  // ALWAYS generate logFile for autonomous execution
  const logFile = join(
    SESSION_STORAGE.getLogsDir(projectRoot),
    `${sessionName}${SESSION_STORAGE.LOG_FILE_SUFFIX}`
  );

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
    worktree?: WorktreeOptions;
    docker?: DockerOptions;
    dryRun?: boolean;
    data?: Record<string, unknown>;
  }
): Promise<ExecutionResult> {
  // Generate session name for interactive tasks
  // Format: interactive-{taskId}-{timestamp}
  const sessionName = `interactive-${options.taskId}-${Date.now()}`;

  const enhancedOptions: ClaudeOptions & { sessionName?: string } = {
    mode: 'interactive',
    sessionName, // Track session for future resume capability
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

/**
 * Helper to continue an existing session
 */
export async function continueSession(
  sessionName: string,
  prompt: string,
  options: {
    projectRoot?: string;
    dryRun?: boolean;
  } = {}
): Promise<ExecutionResult> {
  // First, check if we need to get the real session ID from the log
  const storage = new ScopecraftSessionStorage(undefined, options.projectRoot);
  let effectiveSessionName = sessionName;

  try {
    // Load session info to get log file path
    const sessionInfo = await storage.loadSessionInfo(sessionName);

    if (sessionInfo?.logFile && !sessionInfo.realSessionId) {
      // Try to extract real session ID from log file
      const { parseLogFile } = await import('channelcoder');
      const parsed = await parseLogFile(sessionInfo.logFile);

      if (parsed.sessionId) {
        await storage.updateRealSessionId(sessionName, parsed.sessionId);
        // Use the real session ID for continuation
        effectiveSessionName = parsed.sessionId;
      }
    } else if (sessionInfo?.realSessionId) {
      // We already have the real session ID
      effectiveSessionName = sessionInfo.realSessionId;
    }
  } catch (error) {
    console.warn('Could not load session info for continuation:', error);
  }

  // Continue with the session (real ID if we found it, otherwise the original name)
  const enhancedOptions: ClaudeOptions & { sessionName?: string } = {
    sessionName: effectiveSessionName,
    continue: true,
    dryRun: options.dryRun,
  };

  return execute(prompt, enhancedOptions);
}
