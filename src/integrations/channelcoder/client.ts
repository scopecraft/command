/**
 * Simple ChannelCoder integration - function-based, no classes
 */

import { claude, session } from 'channelcoder';
import { ScopecraftSessionStorage } from './session-storage.js';

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Simple execution function with dry-run support
 */
export async function execute(promptOrFile: string, options: any = {}): Promise<ExecutionResult> {
  try {
    if (options.dryRun) {
      console.log('[DRY RUN] Would execute:');
      console.log(`  Prompt/File: ${promptOrFile}`);
      console.log(`  Options: ${JSON.stringify(options, null, 2)}`);
      return { success: true, data: { dryRun: true } };
    }

    const result = await claude(promptOrFile, options);
    return { success: true, data: result };
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
  return session({ storage, ...options });
}

/**
 * Load session with our storage
 */
export async function loadSession(sessionName: string) {
  const _storage = new ScopecraftSessionStorage();
  return await session.load(sessionName);
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
function buildChannelCoderCommand(promptPath: string, options: { data: Record<string, unknown> }): string {
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
