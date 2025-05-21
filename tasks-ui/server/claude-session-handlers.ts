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
    
    // Check if tmux session exists with the task ID as window name
    const result = spawnSync([
      "tmux", "list-windows", 
      "-t", SESSION_NAME, 
      "-F", "#{window_name}"
    ]);
    
    // If the session doesn't exist, result will have a non-zero exit code
    if (result.exitCode !== 0) {
      logger.info(`Tmux session not found or not running`, { taskId });
      return { 
        success: true, 
        exists: false,
        error: null
      };
    }
    
    // Check output for window with taskId prefix
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
 * Calls the dispatch script to create a tmux window with Claude
 * 
 * @param params - Request body with taskId and mode
 * @returns Object with success status and error message if applicable
 */
export async function handleSessionStart(params: any): Promise<any> {
  try {
    // Validate parameters
    const { taskId, mode } = SessionInputSchema.parse(params);
    
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
    
    // Get project root directory
    const rootDirResult = spawnSync(["git", "rev-parse", "--show-toplevel"]);
    if (rootDirResult.exitCode !== 0) {
      throw new Error("Could not determine git root directory");
    }
    const rootDir = rootDirResult.stdout.toString().trim();
    
    // Create session using the dispatch script with --no-interactive flag
    const result = spawnSync({
      cmd: ["./dispatch", mode, taskId, "--no-interactive"],
      cwd: rootDir,
      env: process.env,
      stdin: 'ignore',
      stdout: 'pipe',
      stderr: 'pipe'
    });
    
    // Parse the result - non-zero exit code means failure
    if (result.exitCode !== 0) {
      const stderr = result.stderr.toString();
      logger.error(`Failed to start Claude session`, { 
        taskId, 
        mode, 
        exitCode: result.exitCode,
        stderr
      });
      
      return {
        success: false,
        created: false,
        error: `Command failed with error: ${stderr}`
      };
    }
    
    // Log success and response
    const stdout = result.stdout.toString();
    logger.info(`Successfully started Claude session`, { 
      taskId, 
      mode,
      stdout
    });
    
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