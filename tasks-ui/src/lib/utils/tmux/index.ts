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
    
    // For browser frontend, we need to mock this for now
    // In the real implementation this would call a backend API endpoint
    // that executes the tmux command
    
    // Simulating check with localStorage for quick testing
    const existingKey = `claude-session-${taskId}`;
    return localStorage.getItem(existingKey) === 'true';
  } catch {
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
    
    // In a real implementation, this would be an API call to a backend endpoint
    // that executes the dispatch script
    
    // POST /api/claude-sessions
    // body: { taskId, mode }
    
    // For now, we'll just track in localStorage for testing
    const existingKey = `claude-session-${taskId}`;
    localStorage.setItem(existingKey, 'true');
    
    // Fake an API call with a short delay
    setTimeout(() => {
      console.log(`Started Claude session for ${taskId} in mode ${mode}`);
    }, 100);
    
    return true;
  } catch (error) {
    console.error("Failed to start Claude session:", error);
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