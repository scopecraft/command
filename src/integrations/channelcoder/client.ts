/**
 * Simple ChannelCoder integration - function-based, no classes
 */

import { type CCResult, type ClaudeOptions, claude, session } from 'channelcoder';
import { ScopecraftSessionStorage } from './session-storage.js';

export interface ExecutionResult {
  success: boolean;
  data?: CCResult['data'];
  error?: string;
}

// Extended options to include our sessionName
export interface ScopecraftClaudeOptions extends ClaudeOptions {
  sessionName?: string;
}

/**
 * Simple execution function with dry-run support
 */
export async function execute(
  promptOrFile: string,
  options: ScopecraftClaudeOptions = {}
): Promise<ExecutionResult> {
  try {
    if (options.dryRun) {
      console.log('[DRY RUN] Would execute:');
      console.log(`  Prompt/File: ${promptOrFile}`);
      console.log(`  Options: ${JSON.stringify(options, null, 2)}`);
      return { success: true, data: { dryRun: true } };
    }

    // For task tracking, always use session with our custom storage
    const taskId = options.data?.taskId as string | undefined;
    const parentId = options.data?.parentId as string | undefined;
    const sessionName = options.sessionName;

    if (taskId || sessionName) {
      const storage = new ScopecraftSessionStorage();
      const finalSessionName = sessionName || `task-${taskId || 'unknown'}-${Date.now()}`;

      const s = session({
        name: finalSessionName,
        storage,
        autoSave: true, // Real-time updates for monitoring
      });

      // Set up metadata for our monitoring
      if (storage.setScopecraftMetadata) {
        storage.setScopecraftMetadata({
          taskId,
          parentId,
          logFile: options.logFile,
          status: 'running',
          type: 'autonomous-task',
        });
      }

      // Just use claude through the session - it handles ALL modes!
      const result = await s.claude(promptOrFile, options);

      // For detached mode, PID is in result.data
      if (
        options.detached &&
        result.success &&
        result.data &&
        typeof result.data === 'object' &&
        'pid' in result.data
      ) {
        console.log('Detached PID:', result.data.pid);
      }

      return {
        success: result.success,
        data: {
          ...(result.data || {}),
          sessionName: finalSessionName,
          taskId,
        },
      };
    }

    // For non-tracked execution, just use claude directly
    const result = await claude(promptOrFile, options);
    return { success: result.success, data: result.data };
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
  const storage = new ScopecraftSessionStorage();
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
  const storage = new ScopecraftSessionStorage();
  // Use ChannelCoder's session loading with our storage
  return await session.load(sessionName, storage);
}

/**
 * TMux execution - our custom implementation
 */
export async function executeTmux(
  promptPath: string,
  options: { taskId: string; worktree: string; data: Record<string, unknown>; dryRun?: boolean }
): Promise<ExecutionResult> {
  const windowName = `scopecraft-${options.taskId}`;

  if (options.dryRun) {
    console.log('[DRY RUN] Would create tmux window:');
    console.log(`  Window: ${windowName}`);
    console.log(`  Worktree: ${options.worktree}`);
    console.log(
      `  Command: cd "${options.worktree}" && claude "${promptPath}" --data '${JSON.stringify(options.data)}'`
    );
    return { success: true, data: { dryRun: true } };
  }

  try {
    await createTmuxWindow(windowName, options.worktree);
    const command = buildChannelCoderCommand(promptPath, options);
    await runInTmux(windowName, command);

    return {
      success: true,
      data: {
        windowName,
        attachCommand: `tmux attach -t ${windowName}`,
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
async function createTmuxWindow(windowName: string, workingDir: string): Promise<void> {
  const { spawn } = await import('node:child_process');

  return new Promise((resolve, reject) => {
    const tmux = spawn('tmux', ['new-window', '-n', windowName, '-c', workingDir], {
      stdio: 'inherit',
    });

    tmux.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tmux new-window failed with code ${code}`));
      }
    });

    tmux.on('error', (error) => {
      reject(new Error(`Failed to start tmux: ${error.message}`));
    });
  });
}

/**
 * Build the ChannelCoder command for tmux execution
 */
function buildChannelCoderCommand(
  promptPath: string,
  options: { data: Record<string, unknown> }
): string {
  const dataArg = JSON.stringify(options.data).replace(/"/g, '\\"');
  return `claude "${promptPath}" --data "${dataArg}"`;
}

/**
 * Run command in tmux window
 */
async function runInTmux(windowName: string, command: string): Promise<void> {
  const { spawn } = await import('node:child_process');

  return new Promise((resolve, reject) => {
    const tmux = spawn('tmux', ['send-keys', '-t', windowName, command, 'Enter'], {
      stdio: 'inherit',
    });

    tmux.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tmux send-keys failed with code ${code}`));
      }
    });

    tmux.on('error', (error) => {
      reject(new Error(`Failed to send keys to tmux: ${error.message}`));
    });
  });
}
