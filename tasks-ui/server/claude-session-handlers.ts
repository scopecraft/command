/**
 * Claude Session API Handlers
 * Provides endpoints for managing Claude tmux sessions
 */
import { spawnSync } from 'bun';
import { z } from 'zod';
import { logger } from '../src/observability/logger.js';

// Ensure directory exists
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

try {
  await mkdir(dirname(new URL(import.meta.url).pathname), { recursive: true });
} catch (error) {
  // Directory already exists or can't be created
  console.warn(`Warning: Could not create server directory - ${error}`);
}

// Validation schema for session parameters
const SessionInputSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  mode: z.string().default("none")
});

type SessionInput = z.infer<typeof SessionInputSchema>;

const SESSION_NAME = "scopecraft";

/**
 * Check if tmux session exists
 */
function sessionExists(sessionName: string): boolean {
  try {
    const result = spawnSync(["tmux", "has-session", "-t", sessionName]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Check if window exists in a session
 */
function windowExists(sessionName: string, windowName: string): boolean {
  try {
    const result = spawnSync([
      "tmux", "list-windows", 
      "-t", sessionName, 
      "-F", "#{window_name}"
    ]);
    
    if (result.exitCode !== 0) return false;
    
    const output = result.stdout.toString();
    return output.split('\n').some(name => name.trim() === windowName);
  } catch {
    return false;
  }
}

/**
 * Get worktree path for a task ID
 */
function getWorktreePath(taskId: string): string {
  try {
    // Get repo root
    const rootDirResult = spawnSync(["git", "rev-parse", "--show-toplevel"]);
    if (rootDirResult.exitCode !== 0) {
      throw new Error("Could not determine git root directory");
    }
    const rootDir = rootDirResult.stdout.toString().trim();
    
    // Return worktrees directory with task ID
    return `${rootDir}.worktrees/${taskId}`;
  } catch (error) {
    logger.error(`Failed to get worktree path`, { error, taskId });
    throw error;
  }
}

/**
 * Check if a Claude session exists for the given task ID
 * Uses tmux to check if a window exists with the taskId in its name
 * 
 * @param params - Query parameters with taskId
 * @returns Object with success status and exists flag
 */
export async function handleSessionCheck(params: any): Promise<any> {
  try {
    // Validate parameters
    const { taskId } = SessionInputSchema.parse(params);
    
    logger.info(`Checking if Claude session exists`, { taskId });
    
    // Check if tmux session exists
    if (!sessionExists(SESSION_NAME)) {
      logger.info(`Tmux session '${SESSION_NAME}' does not exist`, { taskId });
      return { 
        success: true, 
        exists: false,
        error: null
      };
    }
    
    // Check if window exists with task ID prefix
    const result = spawnSync([
      "tmux", "list-windows", 
      "-t", SESSION_NAME, 
      "-F", "#{window_name}"
    ]);
    
    const output = result.stdout.toString();
    const exists = output.split('\n').some(line => line.startsWith(`${taskId}-`));
    
    logger.info(`Claude session check result`, { taskId, exists });
    
    return {
      success: true,
      exists,
      error: null
    };
  } catch (error) {
    logger.error(`Error checking if Claude session exists`, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      params 
    });
    
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Start a new Claude session for the given task ID
 * Creates a tmux window directly with claude command
 * 
 * @param params - Request body with taskId and mode
 * @returns Object with success status and error message if applicable
 */
export async function handleSessionStart(params: any): Promise<any> {
  try {
    // Validate parameters
    const { taskId, mode = "none" } = SessionInputSchema.parse(params);
    
    logger.info(`Starting Claude session`, { taskId, mode });
    
    // First check if session already exists to prevent duplicates
    const checkResult = await handleSessionCheck({ taskId });
    if (checkResult.success && checkResult.exists) {
      logger.info(`Session already exists, skipping creation`, { taskId, mode });
      return { 
        success: true, 
        message: "Session already exists",
        created: false,
        error: null
      };
    }
    
    // Window name for the session
    const windowName = `${taskId}-${mode}`;
    
    // Get worktree path for this task
    let worktreePath;
    try {
      worktreePath = getWorktreePath(taskId);
    } catch (error) {
      return {
        success: false,
        created: false,
        error: `Failed to get worktree path: ${error instanceof Error ? error.message : error}`
      };
    }
    
    // Create tmux session if it doesn't exist
    if (!sessionExists(SESSION_NAME)) {
      logger.info(`Creating tmux session: ${SESSION_NAME}`);
      spawnSync(["tmux", "new-session", "-d", "-s", SESSION_NAME]);
      
      // Set global session options
      spawnSync(["tmux", "set-option", "-g", "-t", SESSION_NAME, "automatic-rename", "off"]);
      spawnSync(["tmux", "set-option", "-g", "-t", SESSION_NAME, "allow-rename", "off"]);
    }
    
    // Create the command to run in the window
    const claudeCommand = mode === "none" 
      ? "claude" 
      : `claude '/project:${mode} ${taskId}'`;
    
    // Create new window in the session
    logger.info(`Creating tmux window: ${windowName} with command: ${claudeCommand}`);
    
    const windowResult = spawnSync([
      "tmux", "new-window", 
      "-t", SESSION_NAME, 
      "-n", windowName, 
      "-c", worktreePath, 
      claudeCommand
    ]);
    
    if (windowResult.exitCode !== 0) {
      const stderr = windowResult.stderr.toString();
      logger.error(`Failed to create tmux window`, { 
        taskId, 
        mode, 
        exitCode: windowResult.exitCode, 
        stderr 
      });
      
      return {
        success: false,
        created: false,
        error: `Failed to create tmux window: ${stderr}`
      };
    }
    
    // Set window options
    spawnSync(["tmux", "set-window-option", "-t", `${SESSION_NAME}:${windowName}`, "automatic-rename", "off"]);
    spawnSync(["tmux", "set-window-option", "-t", `${SESSION_NAME}:${windowName}`, "allow-rename", "off"]);
    
    logger.info(`Successfully created Claude session`, { taskId, mode, window: windowName });
    
    return {
      success: true,
      created: true,
      message: "Session started successfully",
      error: null
    };
  } catch (error) {
    logger.error(`Error starting Claude session`, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      params
    });
    
    return {
      success: false,
      created: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}