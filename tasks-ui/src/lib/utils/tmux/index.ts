/**
 * Utilities for interacting with tmux Claude sessions
 */
import { execSync } from 'child_process';

const SESSION_NAME = "scopecraft";

/**
 * Check if a Claude session exists for the given task ID
 * @param taskId - The task ID to check
 * @returns boolean - True if session exists, false otherwise
 */
export function checkSessionExists(taskId: string): boolean {
  try {
    // This matches how the dispatch script checks for existing windows
    execSync(
      `tmux list-windows -t "${SESSION_NAME}" -F "#{window_name}" 2>/dev/null | grep -q "^${taskId}-"`,
      { stdio: 'pipe' }
    );
    return true; // grep returns 0 if match found
  } catch {
    // Either tmux isn't running or there was another error
    return false;
  }
}

/**
 * Start a Claude session for the given task ID
 * @param taskId - The task ID to start a session for
 * @param mode - The Claude command mode (default: "none")
 * @returns boolean - True if session started successfully, false otherwise
 */
export function startClaudeSession(taskId: string, mode: string = "none"): boolean {
  try {
    // The dispatch script handles all the logic of session creation
    // Running in background to prevent blocking UI
    // Adding --no-interactive flag to prevent prompting for input
    execSync(`cd "$(git rev-parse --show-toplevel)" && ./dispatch ${mode} ${taskId} --no-interactive & disown`, {
      stdio: 'pipe',
      shell: '/bin/bash'
    });
    return true;
  } catch (error) {
    console.error("Failed to start Claude session:", error);
    return false;
  }
}

/**
 * List all active Claude sessions
 * @returns Array<{taskId: string, mode: string, active: boolean}>
 */
export function listClaudeSessions(): Array<{taskId: string, mode: string, active: boolean}> {
  try {
    // Format: "taskId-mode|active"
    const result = execSync(
      `tmux list-windows -t "${SESSION_NAME}" -F "#{window_name}|#{window_active}" 2>/dev/null`,
      { stdio: 'pipe', encoding: 'utf8' }
    );
    
    if (!result) return [];
    
    return result.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const [nameStr, activeStr] = line.split('|');
        const [taskId, mode] = nameStr.split('-');
        return {
          taskId,
          mode: mode || 'none',
          active: activeStr === '1'
        };
      });
  } catch {
    return [];
  }
}