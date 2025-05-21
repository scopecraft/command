/**
 * Utilities for interacting with tmux Claude sessions
 */
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
 * 
 * This is a client-side API that uses a backend endpoint
 * 
 * @param taskId - The task ID to check
 * @returns boolean - True if session exists, false otherwise
 */
export function checkSessionExists(taskId: string): boolean {
  try {
    // Validate input
    SessionInputSchema.parse({ taskId });
    
    console.log(`[CLAUDE SESSION] Checking if session exists for taskId: ${taskId}`);
    
    // For browser frontend, we need to mock this for now
    // In the real implementation this would call a backend API endpoint
    // that executes the tmux command
    
    // =====================================================================
    // IMPORTANT: THIS IS WHAT WOULD BE ADDED IN THE REAL BACKEND API CALL:
    // =====================================================================
    // const result = runBackendCommand({
    //   command: 'checkClaudeSession',
    //   params: { taskId }
    // });
    // 
    // The backend would execute something like:
    // tmux list-windows -t "scopecraft" -F "#{window_name}" | grep -q "^${taskId}-"
    //
    // And return true/false based on the exit code
    // =====================================================================
    
    // Simulating check with localStorage for quick testing
    const existingKey = `claude-session-${taskId}`;
    const storedValue = localStorage.getItem(existingKey);
    const exists = storedValue === 'true';
    
    console.log(`[CLAUDE SESSION] localStorage check: key='${existingKey}', value='${storedValue}'`);
    console.log(`[CLAUDE SESSION] Session check result for ${taskId}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    console.log(`[CLAUDE SESSION] In production, this would execute: tmux list-windows -t "scopecraft" -F "#{window_name}" | grep -q "^${taskId}-"`);
    
    // List all related localStorage items for debugging
    try {
      const allKeys = Object.keys(localStorage);
      const sessionKeys = allKeys.filter(key => key.startsWith('claude-session-'));
      if (sessionKeys.length > 0) {
        console.log('[CLAUDE SESSION] All active sessions in localStorage:', 
          sessionKeys.map(key => ({
            key,
            taskId: key.replace('claude-session-', ''),
            value: localStorage.getItem(key)
          }))
        );
      } else {
        console.log('[CLAUDE SESSION] No active sessions found in localStorage');
      }
    } catch (err) {
      console.warn('[CLAUDE SESSION] Could not enumerate localStorage keys:', err);
    }
    
    return exists;
  } catch (error) {
    console.error(`[CLAUDE SESSION] Error checking session for ${taskId}:`, error);
    return false;
  }
}

/**
 * Start a Claude session for the given task ID
 * 
 * This is a client-side API that uses a backend endpoint
 * 
 * @param input - Session input containing taskId and mode
 * @returns boolean - True if session started successfully, false otherwise
 */
export function startClaudeSession(input: SessionInput): boolean {
  try {
    // Validate input
    const { taskId, mode } = SessionInputSchema.parse(input);
    
    console.log("[CLAUDE SESSION] Starting session", { taskId, mode });
    
    // In a real implementation, this would be an API call to a backend endpoint
    // that executes the dispatch script
    
    // POST /api/claude-sessions
    // body: { taskId, mode }
    
    // For now, we'll just track in localStorage for testing
    const existingKey = `claude-session-${taskId}`;
    localStorage.setItem(existingKey, 'true');
    
    // =====================================================================
    // IMPORTANT: THIS IS WHAT WOULD BE ADDED IN THE REAL BACKEND API CALL:
    // =====================================================================
    // const result = runBackendCommand({
    //   command: 'startClaudeSession',
    //   params: {
    //     taskId,
    //     mode,
    //     options: {
    //       noInteractive: true,
    //     }
    //   }
    // });
    // 
    // The backend would execute something like:
    // cd "$(git rev-parse --show-toplevel)" && ./dispatch ${mode} ${taskId} --no-interactive
    //
    // And return success/failure status
    // =====================================================================
    
    // Provide detailed logging for troubleshooting
    console.log(`[CLAUDE SESSION] Session request sent. In production, this would execute: 
      ./dispatch ${mode} ${taskId} --no-interactive
    `);
    
    // Fake an API call with a short delay - in the real API this would be replaced with actual results
    setTimeout(() => {
      console.log(`[CLAUDE SESSION] Fake success response received for ${taskId} in mode ${mode}`);
      
      // In the local dev environment, simulate a successful creation that we can test with
      const randomSuccess = Math.random() > 0.1; // 90% success rate for testing
      if (randomSuccess) {
        console.log(`[CLAUDE SESSION] Session created successfully for ${taskId}`);
      } else {
        console.warn(`[CLAUDE SESSION] Session creation failed for ${taskId} (simulated failure)`);
        localStorage.removeItem(existingKey);
      }
    }, 800);
    
    return true;
  } catch (error) {
    console.error("[CLAUDE SESSION] Failed to start Claude session:", error);
    return false;
  }
}

/**
 * List all active Claude sessions
 * 
 * This is a client-side API that uses a backend endpoint
 * 
 * @returns Array<Session>
 */
export function listClaudeSessions(): Session[] {
  try {
    // In a real implementation, this would be an API call to a backend endpoint
    // For now, just return an empty array
    return [];
  } catch {
    return [];
  }
}