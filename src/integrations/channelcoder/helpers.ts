/**
 * Value-added helper functions for common ChannelCoder patterns
 * Encapsulates complexity while maintaining composability
 */

import { type ClaudeOptions, type DockerOptions, type WorktreeOptions } from 'channelcoder';
import { join } from 'node:path';
import { execute, executeTmux, type ExecutionResult } from './client.js';

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
    projectRoot,
    '.tasks/.autonomous-sessions/logs',
    `${sessionName}.log`
  );

  // Special case for tmux - it has its own implementation
  if (options.execType === 'tmux') {
    return executeTmux(promptOrFile, {
      taskId: options.taskId,
      worktree: options.worktree?.path || projectRoot,
      data: {
        taskId: options.taskId,
        parentId: options.parentId,
        ...options.data
      },
      dryRun: options.dryRun,
    });
  }

  // For docker and detached, ALWAYS use detached=true for dispatch
  const enhancedOptions: ClaudeOptions & { sessionName?: string } = {
    detached: true,              // ALWAYS true for autonomous tasks
    logFile,                     // ALWAYS needed for detached
    stream: true,                // ALWAYS stream for monitoring
    outputFormat: 'stream-json', // REQUIRED for real-time log monitoring
    sessionName,                 // Our tracking field
    docker: options.docker,      // Pass through if provided
    worktree: options.worktree,  // Pass through if provided
    dryRun: options.dryRun,
    data: {
      ...options.data,
      taskId: options.taskId,
      parentId: options.parentId,
    }
  };

  return execute(promptOrFile, enhancedOptions);
}

/**
 * Helper for interactive task execution (work command)
 * Simpler setup without monitoring requirements
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
  const enhancedOptions: ClaudeOptions = {
    mode: 'interactive',
    docker: options.docker,
    worktree: options.worktree,
    dryRun: options.dryRun,
    data: {
      ...options.data,
      taskId: options.taskId,
      taskInstruction: options.instruction,
    }
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
    dryRun?: boolean;
  } = {}
): Promise<ExecutionResult> {
  // For continuation, we need to load the session and continue it
  // This is a placeholder - actual implementation depends on ChannelCoder's continuation API
  const enhancedOptions: ClaudeOptions & { sessionName?: string } = {
    sessionName,
    continue: true,
    dryRun: options.dryRun,
  };

  return execute(prompt, enhancedOptions);
}