/**
 * Client API for managing Claude tmux sessions
 */
import { z } from 'zod';

// Zod schemas for validation
export const SessionInputSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  mode: z.string().default('none'),
  type: z.enum(['task', 'feature']),
});

export type SessionInput = z.infer<typeof SessionInputSchema>;

interface SessionCheckResult {
  exists: boolean;
  windows?: string[];
}

/**
 * Check if a Claude session exists for the given task ID
 *
 * @param taskId - The task ID to check
 * @param type - The type of ID (task or feature)
 * @returns Promise<SessionCheckResult> - Result with exists flag and windows if any
 */
export async function checkSessionExists(
  taskId: string,
  type: 'task' | 'feature'
): Promise<SessionCheckResult> {
  try {
    // Validate input
    SessionInputSchema.parse({ taskId, type });

    console.log(`[CLAUDE SESSION] Checking if session exists for taskId: ${taskId}`);

    // Call the API to check session status
    const response = await fetch(
      `/api/claude-sessions/check?taskId=${encodeURIComponent(taskId)}&type=${encodeURIComponent(type)}`
    );

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('[CLAUDE SESSION] API session check result:', data);

    // Return existence status and windows from API
    return {
      exists: data.success && data.exists,
      windows: data.windows || [],
    };
  } catch (error) {
    console.error(`[CLAUDE SESSION] Error checking session for ${taskId}:`, error);
    return { exists: false, windows: [] };
  }
}

/**
 * Start a Claude session for the given task ID
 *
 * @param input - Session input containing taskId and mode
 * @returns Promise<boolean> - True if session was started successfully
 */
export async function startClaudeSession(input: SessionInput): Promise<boolean> {
  try {
    // Validate input
    const { taskId, mode, type } = SessionInputSchema.parse(input);

    console.log('[CLAUDE SESSION] Starting session', { taskId, mode, type });

    // Make API request to start the tmux session
    const response = await fetch('/api/claude-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ taskId, mode, type }),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('[CLAUDE SESSION] API session start result:', data);

    // Return success status from API
    return data.success;
  } catch (error) {
    console.error('[CLAUDE SESSION] Failed to start Claude session:', error);
    return false;
  }
}
