import { z } from 'zod';

// Define schemas
export const ClaudeWebSocketMessageSchema = z.object({
  prompt: z.string().min(1).max(8192),
  meta: z.string().optional() // Made optional as per user request
});

export const ClaudeWebSocketErrorSchema = z.object({
  error: z.string()
});

export const ClaudeWebSocketInfoSchema = z.object({
  info: z.string()
});

// Export types from schemas
export type ClaudeWebSocketMessage = z.infer<typeof ClaudeWebSocketMessageSchema>;
export type ClaudeWebSocketError = z.infer<typeof ClaudeWebSocketErrorSchema>;
export type ClaudeWebSocketInfo = z.infer<typeof ClaudeWebSocketInfoSchema>;

// Other types that don't need validation
export interface ProcessWithWebSocket {
  proc: any; // Bun subprocess type
  timeout: NodeJS.Timeout;
}

// Constants
export const MAX_PROMPT_LENGTH = 8192;
export const TIMEOUT_MS = 300_000; // 5 minutes