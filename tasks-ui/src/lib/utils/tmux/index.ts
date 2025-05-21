/**
 * Utilities for interacting with tmux Claude sessions
 */
import { spawnSync } from 'bun';
import { z } from 'zod';

const SESSION_NAME = "scopecraft";

// Zod schemas for validation
export const SessionInputSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  mode: z.string().default("none")
});

export type SessionInput = z.infer<typeof SessionInputSchema>;

export const SessionSchema = z.object({
  taskId: z.string(),
  mode: z.string(),
  active: z.boolean()
});

export type Session = z.infer<typeof SessionSchema>;

/**
 * Check if a Claude session exists for the given task ID
 * @param taskId - The task ID to check
 * @returns boolean - True if session exists, false otherwise
 */
export function checkSessionExists(taskId: string): boolean {
  try {
    // Validate input
    SessionInputSchema.parse({ taskId });
    
    // This matches how the dispatch script checks for existing windows
    const result = spawnSync([
      "tmux", "list-windows", 
      "-t", SESSION_NAME, 
      "-F", "#{window_name}"
    ]);
    
    if (result.exitCode !== 0) return false;
    
    const output = result.stdout.toString();
    return output.split('\n').some(line => line.startsWith(`${taskId}-`));
  } catch {
    // Either tmux isn't running or there was another error
    return false;
  }
}

/**
 * Start a Claude session for the given task ID
 * @param input - Session input containing taskId and mode
 * @returns boolean - True if session started successfully, false otherwise
 */
export function startClaudeSession(input: SessionInput): boolean {
  try {
    // Validate input
    const { taskId, mode } = SessionInputSchema.parse(input);
    
    // Get project root directory
    const rootDir = spawnSync(["git", "rev-parse", "--show-toplevel"]).stdout.toString().trim();
    
    // The dispatch script handles all the logic of session creation
    // Running in background to prevent blocking UI
    // Adding --no-interactive flag to prevent prompting for input
    spawnSync({
      cmd: ["./dispatch", mode, taskId, "--no-interactive"],
      cwd: rootDir,
      stdio: ['ignore', 'ignore', 'ignore'],
      detached: true
    });
    
    return true;
  } catch (error) {
    console.error("Failed to start Claude session:", error);
    return false;
  }
}

/**
 * List all active Claude sessions
 * @returns Array<Session>
 */
export function listClaudeSessions(): Session[] {
  try {
    // Format: "taskId-mode|active"
    const result = spawnSync([
      "tmux", "list-windows", 
      "-t", SESSION_NAME, 
      "-F", "#{window_name}|#{window_active}"
    ]);
    
    if (result.exitCode !== 0) return [];
    
    const output = result.stdout.toString();
    
    const sessions = output.split('\n')
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
    
    // Validate each session object
    return sessions.filter(session => {
      try {
        SessionSchema.parse(session);
        return true;
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}