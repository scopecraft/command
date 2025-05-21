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
 * Calls the server API endpoint to check if a tmux session exists for this task
 * Falls back to localStorage when API fails or in development mode
 * 
 * @param taskId - The task ID to check
 * @returns boolean - True if session exists, false otherwise
 */
export function checkSessionExists(taskId: string): boolean {
  try {
    // Validate input
    SessionInputSchema.parse({ taskId });
    
    console.log(`[CLAUDE SESSION] Checking if session exists for taskId: ${taskId}`);
    
    // This is now just for quick dev testing - in production we'd wait for the API call
    // to complete. Using the localStorage lets us quickly test the UI without waiting.
    const existingKey = `claude-session-${taskId}`;
    const storedValue = localStorage.getItem(existingKey);
    const localExists = storedValue === 'true';
    
    // Make API request to check real tmux session status
    // Using sync fetch for simplicity, would be async in real code
    try {
      const response = fetch(`/api/claude-sessions/check?taskId=${encodeURIComponent(taskId)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }).then(res => {
        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }
        return res.json();
      }).then(data => {
        console.log(`[CLAUDE SESSION] API session check result:`, data);
        
        // Update localStorage to match the actual server state
        if (data.success) {
          if (data.exists) {
            localStorage.setItem(existingKey, 'true');
          } else {
            localStorage.removeItem(existingKey);
          }
          
          // If this would change our UI state, log it - would trigger a re-render in a reactive system
          if (localExists !== data.exists) {
            console.log(`[CLAUDE SESSION] Session status changed from API: ${localExists} -> ${data.exists}`);
          }
        }
      }).catch(err => {
        console.error(`[CLAUDE SESSION] API session check failed:`, err);
      });
    } catch (err) {
      console.warn(`[CLAUDE SESSION] Could not check session via API:`, err);
    }
    
    // For quick local development, return the localStorage value
    // In a real implementation, we'd make this async and await the API response
    return localExists;
  } catch (error) {
    console.error(`[CLAUDE SESSION] Error checking session for ${taskId}:`, error);
    return false;
  }
}

/**
 * Start a Claude session for the given task ID
 * 
 * Makes an API call to start a real tmux session via the server
 * Falls back to localStorage for development/testing
 * 
 * @param input - Session input containing taskId and mode
 * @returns boolean - True if session start request was sent successfully
 */
export function startClaudeSession(input: SessionInput): boolean {
  try {
    // Validate input
    const { taskId, mode } = SessionInputSchema.parse(input);
    
    console.log("[CLAUDE SESSION] Starting session", { taskId, mode });
    
    // Optimistically update localStorage for immediate UI feedback
    const existingKey = `claude-session-${taskId}`;
    localStorage.setItem(existingKey, 'true');
    
    // Make API request to start the tmux session
    fetch('/api/claude-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ taskId, mode }),
    }).then(response => {
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      return response.json();
    }).then(data => {
      console.log(`[CLAUDE SESSION] API session start result:`, data);
      
      // If the API call failed, update localStorage accordingly
      if (!data.success) {
        console.warn(`[CLAUDE SESSION] Session creation failed from API:`, data.error || 'Unknown error');
        localStorage.removeItem(existingKey);
      } else {
        console.log(`[CLAUDE SESSION] Session ${data.created ? 'created' : 'already exists'}: ${taskId} / ${mode}`);
      }
    }).catch(error => {
      console.error(`[CLAUDE SESSION] API session start failed:`, error);
      // If the API call failed, revert the optimistic update
      localStorage.removeItem(existingKey);
    });
    
    // Return true if the request was sent, not if the session was actually created
    // The actual creation result will be handled in the Promise resolution
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