/**
 * Simple ChannelCoder integration - function-based, no classes
 */

import {
  type CCResult,
  type ClaudeOptions,
  claude,
  session,
} from "channelcoder";
import { ConfigurationManager } from "../../core/config/configuration-manager.js";
import { ScopecraftSessionStorage } from "./session-storage.js";

/**
 * Gets project root from configuration for cwd parameter
 */
function getProjectRoot(config: ConfigurationManager): string {
  const rootConfig = config.getRootConfig();
  if (!rootConfig.validated || !rootConfig.path) {
    throw new Error("No valid project root found for ChannelCoder operations");
  }
  return rootConfig.path;
}

export interface ExecutionResult {
  success: boolean;
  data?: Record<string, unknown>;
  // Additional fields we add
  sessionName?: string;
  taskId?: string;
  error?: string; // Error message when success is false
}

// Extended options to include our sessionName
export interface ScopecraftClaudeOptions extends ClaudeOptions {
  sessionName?: string;
}

interface SessionSetup {
  taskId?: string;
  parentId?: string;
  sessionName: string;
  config: ConfigurationManager;
  storage: ScopecraftSessionStorage;
  projectRoot: string;
}

/**
 * Handles dry-run mode execution
 */
function handleDryRun(
  promptOrFile: string,
  options: ScopecraftClaudeOptions,
): ExecutionResult | null {
  if (!options.dryRun) {
    return null;
  }

  console.log("[DRY RUN] Would execute:");
  console.log(`  Prompt/File: ${promptOrFile}`);
  console.log(`  Options: ${JSON.stringify(options, null, 2)}`);
  return { success: true, data: { dryRun: true } };
}

/**
 * Sets up session configuration for tracked execution
 */
function setupTrackedSession(
  options: ScopecraftClaudeOptions,
): SessionSetup | null {
  const taskId = options.data?.taskId as string | undefined;
  const parentId = options.data?.parentId as string | undefined;
  const sessionName = options.sessionName;

  if (!taskId && !sessionName) {
    return null;
  }

  const config = ConfigurationManager.getInstance();
  const storage = new ScopecraftSessionStorage(config);
  const projectRoot = getProjectRoot(config);
  const finalSessionName =
    sessionName || `task-${taskId || "unknown"}-${Date.now()}`;

  return {
    taskId,
    parentId,
    sessionName: finalSessionName,
    config,
    storage,
    projectRoot,
  };
}

/**
 * Determines session type based on execution options
 */
function determineSessionType(options: ScopecraftClaudeOptions): string {
  if (options.mode === "interactive") {
    return "interactive";
  }
  if (options.detached || options.docker) {
    return "autonomous-task";
  }
  return "planning";
}

/**
 * Executes with session tracking
 */
async function executeWithTracking(
  promptOrFile: string,
  options: ScopecraftClaudeOptions,
  setup: SessionSetup,
): Promise<ExecutionResult> {
  const { taskId, parentId, sessionName, storage, projectRoot } = setup;

  // Create session with cwd for v3 compatibility
  const s = session({
    name: sessionName,
    storage,
    autoSave: true,
    cwd: projectRoot, // v3: Added missing cwd parameter
  });

  // Set up metadata for monitoring
  if (storage.setScopecraftMetadata) {
    const sessionType = determineSessionType(options);
    storage.setScopecraftMetadata({
      taskId,
      parentId,
      logFile: options.logFile,
      status: "running",
      type: sessionType,
    });
  }

  // Execute with cwd for proper project isolation (v3)
  const optionsWithCwd = { ...options, cwd: projectRoot };
  const result = await s.claude(promptOrFile, optionsWithCwd);

  // Handle detached mode if needed
  if (options.detached) {
    await handleDetachedMode(
      storage,
      sessionName,
      result,
      taskId,
      parentId,
      options,
    );
  }

  return {
    success: result.success,
    data: result.data as Record<string, unknown> | undefined,
    sessionName,
    taskId,
  };
}

/**
 * Handles detached mode session persistence
 */
async function handleDetachedMode(
  storage: ScopecraftSessionStorage,
  sessionName: string,
  result: CCResult,
  taskId?: string,
  parentId?: string,
  options?: ScopecraftClaudeOptions,
): Promise<void> {
  const pid = extractPidFromResult(result);

  await storage.saveSessionInfo(sessionName, {
    taskId,
    parentId,
    logFile: options?.logFile,
    status: "running",
    type: "autonomous-task",
    pid,
  });

  if (result.success && pid) {
    console.log("Detached PID:", pid);
  }
}

/**
 * Extracts PID from execution result
 */
function extractPidFromResult(result: CCResult): number | undefined {
  if (result.data && typeof result.data === "object" && "pid" in result.data) {
    return (result.data as Record<string, unknown>).pid as number;
  }
  return undefined;
}

/**
 * Executes without session tracking
 */
async function executeDirectly(
  promptOrFile: string,
  options: ScopecraftClaudeOptions,
): Promise<ExecutionResult> {
  const config = ConfigurationManager.getInstance();
  const projectRoot = getProjectRoot(config);
  const optionsWithCwd = { ...options, cwd: projectRoot };
  const result = await claude(promptOrFile, optionsWithCwd);

  return {
    success: result.success,
    data: result.data as Record<string, unknown> | undefined,
  };
}

/**
 * Simple execution function with dry-run support
 */
export async function execute(
  promptOrFile: string,
  options: ScopecraftClaudeOptions = {},
): Promise<ExecutionResult> {
  try {
    // Step 1: Handle dry-run mode
    const dryRunResult = handleDryRun(promptOrFile, options);
    if (dryRunResult) {
      return dryRunResult;
    }

    // Step 2: Check if we need session tracking
    const sessionSetup = setupTrackedSession(options);

    // Step 3: Execute with or without tracking
    if (sessionSetup) {
      return await executeWithTracking(promptOrFile, options, sessionSetup);
    }
    return await executeDirectly(promptOrFile, options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create session with our custom storage
 */
export function createSession(options: Record<string, unknown> = {}) {
  const config = ConfigurationManager.getInstance();
  const storage = new ScopecraftSessionStorage(config);
  return session({
    storage,
    autoSave: true,
    ...options,
  });
}

/**
 * Load session with our storage
 */
export async function loadSession(sessionName: string) {
  const config = ConfigurationManager.getInstance();
  const storage = new ScopecraftSessionStorage(config);
  // Use ChannelCoder's session loading with our storage
  return await session.load(sessionName, storage);
}

/**
 * TMux execution - our custom implementation
 */
export async function executeTmux(
  promptPath: string,
  options: {
    taskId: string;
    worktree: string;
    data: Record<string, unknown>;
    dryRun?: boolean;
  },
): Promise<ExecutionResult> {
  // Sanitize window name - tmux has issues with certain characters
  const sanitizedTaskId = options.taskId.replace(/[_]/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const windowName = `sc-${sanitizedTaskId}`;

  if (options.dryRun) {
    console.log("[DRY RUN] Would create tmux window:");
    console.log(`  Window: ${windowName}`);
    console.log(`  Working Directory: ${options.worktree}`);
    const command = buildChannelCoderCommand(promptPath, options);
    console.log(`  Command: ${command}`);
    return { success: true, data: { dryRun: true } };
  }

  try {
    await createTmuxWindow(windowName, options.worktree);
    
    // Add a small delay to ensure window is fully created
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const command = buildChannelCoderCommand(promptPath, options);
    await runInTmux(windowName, command);

    return {
      success: true,
      data: {
        windowName,
        attachCommand: `tmux attach -t ${windowName}`,
        taskId: options.taskId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create a new tmux window
 */
async function createTmuxWindow(
  windowName: string,
  workingDir: string,
): Promise<void> {
  const { spawn } = await import("node:child_process");

  return new Promise((resolve, reject) => {
    const tmux = spawn(
      "tmux",
      ["new-window", "-n", windowName, "-c", workingDir],
      {
        stdio: "inherit",
      },
    );

    tmux.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tmux new-window failed with code ${code}`));
      }
    });

    tmux.on("error", (error) => {
      reject(new Error(`Failed to start tmux: ${error.message}`));
    });
  });
}

/**
 * Build the ChannelCoder command for tmux execution
 */
function buildChannelCoderCommand(
  promptPath: string,
  options: { data: Record<string, unknown>; worktree?: string },
): string {
  // Build command with multiple --data flags for better shell compatibility
  let command = `channelcoder "${promptPath}"`;
  
  // Note: We don't pass --worktree since tmux already sets the working directory with -c flag
  
  // Add each data field as a separate --data flag
  for (const [key, value] of Object.entries(options.data)) {
    // Convert value to string, handling different types
    let valueStr = '';
    if (value === null || value === undefined) {
      valueStr = '';
    } else if (typeof value === 'string') {
      valueStr = value;
    } else {
      valueStr = JSON.stringify(value);
    }
    
    // Always quote the value for consistency and to handle empty strings
    // Escape double quotes and wrap in double quotes
    valueStr = `"${valueStr.replace(/"/g, '\\"')}"`;
    
    command += ` --data ${key}=${valueStr}`;
  }
  
  return command;
}

/**
 * Run command in tmux window
 */
async function runInTmux(windowName: string, command: string): Promise<void> {
  const { spawn } = await import("node:child_process");

  return new Promise((resolve, reject) => {
    const tmux = spawn(
      "tmux",
      ["send-keys", "-t", windowName, command, "Enter"],
      {
        stdio: "inherit",
      },
    );

    tmux.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tmux send-keys failed with code ${code}`));
      }
    });

    tmux.on("error", (error) => {
      reject(new Error(`Failed to send keys to tmux: ${error.message}`));
    });
  });
}
