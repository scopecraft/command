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
import { logger } from '../src/observability/logger.js';

export function createClaudeWebSocketHandler(processManager: ProcessManager) {
  return {
    open(ws: any) {
      const connectionId = Math.random().toString(36).substr(2, 9);
      ws.data = { ...ws.data, connectionId };
      
      logger.info('WebSocket connection opened', { connectionId });
      
      // Send a connection confirmation that won't appear in the message area
      ws.send(JSON.stringify({ 
        type: "connection_status", 
        status: "connected",
        message: "WebSocket connected. Ready to send prompts." 
      }));
    },

    async message(ws: any, data: any) {
      const connectionId = ws.data?.connectionId;
      
      // Log incoming data
      logger.info('WebSocket message received', {
        connectionId,
        dataType: typeof data,
        dataLength: data?.length || 0
      });
      
      // Validate message
      try {
        const message = ClaudeWebSocketMessageSchema.parse(
          typeof data === 'string' ? JSON.parse(data) : data
        );
        
        logger.info('WebSocket message parsed', {
          connectionId,
          hasPrompt: !!message.prompt,
          hasMeta: !!message.meta,
          promptLength: message.prompt.length
        });
        
        // Create full prompt with parameters in XML tags that Claude can parse
        const fullPrompt = message.meta 
          ? `${message.prompt} <user_params>task:${message.meta}</user_params>`
          : message.prompt;
        
        logger.info('Full prompt prepared for Claude', {
          connectionId,
          fullPromptLength: fullPrompt.length,
          prompt: message.prompt,
          meta: message.meta,
          fullPrompt: fullPrompt
        });
        
        // Echo back the user message to confirm receipt
        ws.send(JSON.stringify({
          type: 'user_echo',
          content: `Received: ${message.prompt}${message.meta ? ` [Context: ${message.meta}]` : ''}`
        }));
        
        // Spawn Claude process
        let proc;
        try {
          proc = streamClaude(fullPrompt);
          logger.info('Claude process spawned', {
            connectionId,
            pid: proc.pid
          });
        } catch (error) {
          logger.error('Failed to spawn Claude process', {
            connectionId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
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
        ws.data = { ...ws.data, ...wsData };
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
                const outputText = decoder.decode(value);
                
                logger.info('Claude stdout output', {
                  connectionId,
                  stdout: outputText.substring(0, 500), // Log first 500 chars
                  length: outputText.length
                });
                
                // Log if it appears to be a tool-related message
                if (outputText.includes('"tool_use"') || outputText.includes('"tool_result"')) {
                  logger.info('Tool-related message detected', {
                    connectionId,
                    isToolUse: outputText.includes('"tool_use"'),
                    isToolResult: outputText.includes('"tool_result"'),
                    length: outputText.length
                  });
                }
                
                ws.send(outputText);
              }
            } catch (error) {
              logger.error('Error reading stdout', {
                connectionId,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
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
                const errorText = decoder.decode(value);
                
                logger.error('Claude stderr output', {
                  connectionId,
                  stderr: errorText
                });
                
                const errorResponse: ClaudeWebSocketError = { 
                  error: errorText 
                };
                ws.send(JSON.stringify(errorResponse));
              }
            } catch (error) {
              logger.error('Error reading stderr', {
                connectionId,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          })();
        }
        
        // Handle process exit
        proc.exited.then((code: number | null) => {
          logger.info('Claude process exited', {
            connectionId,
            exitCode: code
          });
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
        
        logger.error('WebSocket message error', {
          connectionId,
          errorMessage,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        const errorResponse: ClaudeWebSocketError = { error: errorMessage };
        ws.send(JSON.stringify(errorResponse));
        ws.close(1008);
      }
    },
    
    close(ws: any, code: number, reason: string) {
      const connectionId = ws.data?.connectionId;
      const wsData = ws.data as ProcessWithWebSocket | undefined;
      
      logger.info('WebSocket closing', {
        connectionId,
        code,
        reason
      });
      
      if (wsData?.proc) {
        processManager.killProcess(wsData.proc);
        logger.info('Killed Claude process on WebSocket close', {
          connectionId,
          code,
          pid: wsData.proc.pid
        });
      }
      if (wsData?.timeout) {
        clearTimeout(wsData.timeout);
      }
    }
  };
}