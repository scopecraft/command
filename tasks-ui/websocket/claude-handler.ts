import { z } from 'zod';
import { streamClaude } from '../streamClaude.js';
import { ProcessManager } from './process-manager.js';
import {
  ClaudeWebSocketMessageSchema,
  ClaudeWebSocketError,
  ClaudeWebSocketInfo,
  ProcessWithWebSocket,
  TIMEOUT_MS
} from './schemas.js';

export function createClaudeWebSocketHandler(processManager: ProcessManager) {
  return {
    open(ws: any) {
      const info: ClaudeWebSocketInfo = { info: "send {prompt,meta}" };
      ws.send(JSON.stringify(info));
    },

    async message(ws: any, data: any) {
      // Validate message
      try {
        const message = ClaudeWebSocketMessageSchema.parse(
          typeof data === 'string' ? JSON.parse(data) : data
        );
        
        // Create full prompt
        const fullPrompt = message.meta 
          ? `${message.prompt}\n\n[meta:${message.meta}]`
          : message.prompt;
        
        // Spawn Claude process
        let proc;
        try {
          proc = streamClaude(fullPrompt);
        } catch (error) {
          const errorResponse: ClaudeWebSocketError = { 
            error: `Failed to spawn Claude: ${error}` 
          };
          ws.send(JSON.stringify(errorResponse));
          ws.close(1011);
          return;
        }
        
        // Set up timeout
        const timeout = setTimeout(() => {
          processManager.killProcess(proc);
          ws.close(1011, "Timeout");
        }, TIMEOUT_MS);
        
        // Store process info for cleanup
        const wsData: ProcessWithWebSocket = { proc, timeout };
        ws.data = wsData;
        processManager.addProcess(proc);
        
        // Stream stdout
        if (proc.stdout) {
          (async () => {
            const reader = proc.stdout.getReader();
            const decoder = new TextDecoder();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                ws.send(decoder.decode(value));
              }
            } catch (error) {
              console.error('Error reading stdout:', error);
            }
          })();
        }
        
        // Stream stderr
        if (proc.stderr) {
          (async () => {
            const reader = proc.stderr.getReader();
            const decoder = new TextDecoder();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const errorResponse: ClaudeWebSocketError = { 
                  error: decoder.decode(value) 
                };
                ws.send(JSON.stringify(errorResponse));
              }
            } catch (error) {
              console.error('Error reading stderr:', error);
            }
          })();
        }
        
        // Handle process exit
        proc.exited.then((code: number | null) => {
          clearTimeout(timeout);
          processManager.removeProcess(proc);
          ws.close(code ? 1011 : 1000);
        });
        
        // Ignore further messages
        ws.onmessage = () => {};
        
      } catch (error) {
        let errorMessage = 'Invalid request';
        
        if (error instanceof z.ZodError) {
          errorMessage = error.errors[0]?.message || 'Validation error';
        } else if (error instanceof SyntaxError) {
          errorMessage = 'Bad JSON';
        }
        
        const errorResponse: ClaudeWebSocketError = { error: errorMessage };
        ws.send(JSON.stringify(errorResponse));
        ws.close(1008);
      }
    },
    
    close(ws: any, code: number, reason: string) {
      const wsData = ws.data as ProcessWithWebSocket | undefined;
      if (wsData?.proc) {
        processManager.killProcess(wsData.proc);
        console.log(`Killed Claude process on WebSocket close (code: ${code})`);
      }
      if (wsData?.timeout) {
        clearTimeout(wsData.timeout);
      }
    }
  };
}