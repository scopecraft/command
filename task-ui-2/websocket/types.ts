export interface ClaudeWebSocketMessage {
  prompt: string;
  meta: string;
}

export interface ClaudeWebSocketError {
  error: string;
}

export interface ClaudeWebSocketInfo {
  info: string;
}

export interface ProcessWithWebSocket {
  proc: any; // Bun subprocess type
  timeout: NodeJS.Timeout;
}

export const META_REGEX = /^[A-Z0-9_\-]+$/;
export const MAX_PROMPT_LENGTH = 8192;
export const TIMEOUT_MS = 300_000; // 5 minutes