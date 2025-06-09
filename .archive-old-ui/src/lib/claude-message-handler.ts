/**
 * Claude JSON Format Message Handler
 *
 * This file contains utilities for handling both old and new Claude JSON streaming formats
 */

interface MessageBlock {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: unknown;
}

interface Message {
  id: string;
  type: 'assistant' | 'tool_call' | 'tool_result' | 'error' | 'info' | 'user';
  content: string | MessageBlock | MessageBlock[];
  timestamp: Date;
}

// Generic types for JSON message handling
type JsonObject = Record<string, unknown>;
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

interface MessageHandlerInterface {
  addMessage: (type: Message['type'], content: Message['content']) => void;
  ensureBubble: (id: string, role: string) => void;
  appendText: (id: string, text?: string) => void;
  renderToolCall: (messageId: string, block: MessageBlock) => void;
  renderToolResult: (toolUseId: string, result: MessageBlock) => void;
  closeBubble: (id: string) => void;
  handleMessage?: (data: string) => void; // Added for useClaudeWebSocket
}

/**
 * Create message handlers for different Claude JSON message types
 */
function createMessageHandlers(handlers: MessageHandlerInterface) {
  const { addMessage, ensureBubble, appendText, renderToolCall, renderToolResult, closeBubble } =
    handlers;

  // Main handler that will try each handler in sequence
  const handleMessage = (data: string) => {
    console.log('[Claude Handler] Received message:', data);

    try {
      const msg = JSON.parse(data) as JsonObject;
      console.log('[Claude Handler] Message type:', msg.type, msg.subtype || '');

      // Try each handler in order until one handles the message
      let handled = false;

      // Protocol messages (errors, info)
      if (handleProtocolMessage(msg)) {
        console.log('[Claude Handler] Handled as protocol message');
        handled = true;
      }
      // System messages (init, result)
      else if (handleSystemMessage(msg)) {
        console.log('[Claude Handler] Handled as system message');
        handled = true;
      }
      // Legacy message format
      else if (handleLegacyMessage(msg)) {
        console.log('[Claude Handler] Handled as legacy message');
        handled = true;
      }
      // New assistant message format
      else if (handleAssistantMessage(msg)) {
        console.log('[Claude Handler] Handled as assistant message');
        handled = true;
      }
      // Tool results
      else if (handleToolResults(msg)) {
        console.log('[Claude Handler] Handled as tool results');
        handled = true;
      }

      // If we've handled the message, we're done
      if (handled) {
        return;
      }

      // This special case should now be handled by handleSystemMessage,
      // but we'll leave this as a fallback for any missed formats
      if (msg.type === 'result' && msg.result && typeof msg.result === 'string' && !handled) {
        console.log('[Claude Handler] Fallback: extracting result from result message');
        const messageId = `result-${Date.now()}`;
        ensureBubble(messageId, 'assistant');
        appendText(messageId, String(msg.result));
        closeBubble(messageId);
        return;
      }

      // Last-ditch effort - look for any text content we can display
      if (msg.type === 'assistant') {
        console.log(
          '[Claude Handler] Attempting to extract text from unrecognized assistant message'
        );

        const messageId = msg.id || msg.message?.id || Date.now().toString();
        let extractedText = '';

        // Try to extract content from various locations
        if (msg.message?.content) {
          if (Array.isArray(msg.message.content)) {
            extractedText = msg.message.content
              .filter((item: any) => item.type === 'text')
              .map((item: any) => item.text)
              .join('');
          } else if (typeof msg.message.content === 'object' && msg.message.content.text) {
            extractedText = msg.message.content.text;
          } else if (typeof msg.message.content === 'string') {
            extractedText = msg.message.content;
          }
        }

        if (extractedText) {
          console.log('[Claude Handler] Extracted text from unrecognized format:', extractedText);
          ensureBubble(messageId, 'assistant');
          appendText(messageId, extractedText);
          return;
        }
      }

      // If it's a message format we don't recognize, log it for debugging
      console.log('[Claude Handler] Unhandled message format:', JSON.stringify(msg, null, 2));
      addMessage('info', 'Received unhandled message format. Check console for details.');
    } catch (e) {
      console.error('[Claude Handler] Error parsing JSON:', e);
      // If not JSON, treat as plain text assistant message
      addMessage('assistant', data);
    }
  };

  // Handle protocol messages (internal websocket messages)
  const handleProtocolMessage = (msg: JsonObject): boolean => {
    // Ignore connection status messages completely (don't show in UI)
    if (msg.type === 'connection_status') {
      console.log('[Claude Handler] Connection status message received:', msg.status);
      return true;
    }

    if (msg.error) {
      addMessage('error', String(msg.error));
      return true;
    }

    if (msg.info) {
      addMessage('info', String(msg.info));
      return true;
    }

    if (msg.type === 'user_echo' && msg.content) {
      addMessage('info', String(msg.content));
      return true;
    }

    return false;
  };

  // Handle system messages from the new Claude JSON streaming format
  const handleSystemMessage = (msg: JsonObject): boolean => {
    // Handle init system message (first message in the conversation)
    if (msg.type === 'system' && msg.subtype === 'init') {
      console.log('[Claude Handler] System init message detected:', msg);
      addMessage('info', 'Session initialized');
      return true;
    }

    // Handle final result message with stats (new Claude CLI format)
    if (msg.type === 'result') {
      console.log('[Claude Handler] Result message detected:', msg);
      if (msg.is_error) {
        addMessage('error', `Error: ${String(msg.result || 'Unknown error')}`);
      } else {
        // Show the result content as if it were an assistant message
        if (msg.result) {
          const messageId = `result-${Date.now()}`;
          ensureBubble(messageId, 'assistant');
          appendText(messageId, String(msg.result));
          closeBubble(messageId);

          // Also add a cost summary
          const cost = typeof msg.cost_usd === 'number' ? msg.cost_usd.toFixed(4) : 'unknown';
          addMessage('info', `Session completed. Cost: $${cost}`);
        }
      }
      return true;
    }

    // Also handle system messages with content.type = result (older format)
    if (
      msg.type === 'system' &&
      msg.content &&
      typeof msg.content === 'object' &&
      (msg.content as JsonObject).type === 'result'
    ) {
      console.log('[Claude Handler] System result message detected:', msg);

      const content = msg.content as JsonObject;
      const tokens = content.total_tokens || 'unknown';
      addMessage('info', `Session completed. Tokens: ${tokens}`);
      return true;
    }

    return false;
  };

  // Handle old message format (for backward compatibility)
  const handleLegacyMessage = (msg: any): boolean => {
    if (msg.type === 'message') {
      ensureBubble(msg.id, msg.role);
      for (const block of msg.content || []) {
        if (block.type === 'text') {
          appendText(msg.id, block.text);
        } else if (block.type === 'tool_use') {
          renderToolCall(msg.id, block);
        }
      }
      if (msg.stop_reason === 'end_turn') {
        closeBubble(msg.id);
      }
      return true;
    }
    return false;
  };

  // Handle new assistant message format
  const handleAssistantMessage = (msg: any): boolean => {
    console.log('[Claude Handler] Checking assistant message format:', msg.type, msg.message?.id);

    // New format from Claude CLI with --verbose flag
    if (msg.type === 'assistant') {
      // Case 1: New format with message wrapper
      if (msg.message) {
        const message = msg.message;
        const messageId = message.id || msg.id || Date.now().toString();
        console.log('[Claude Handler] Processing message with wrapper:', messageId);

        ensureBubble(messageId, 'assistant');

        // Handle content which is an array of blocks
        if (message.content && Array.isArray(message.content)) {
          for (const block of message.content) {
            if (block.type === 'text') {
              appendText(messageId, block.text);
            } else if (block.type === 'tool_use') {
              console.log('[Claude Handler] Found tool_use in message content:', block);
              renderToolCall(messageId, block);
            }
          }
        }
        // Handle single text content in newer CLI versions
        else if (typeof message.content === 'object' && message.content?.type === 'text') {
          appendText(messageId, message.content.text);
        }

        if (
          message.stop_reason === 'end_turn' ||
          message.stop_reason === 'tool_use' ||
          msg.stop_sequence
        ) {
          closeBubble(messageId);

          // If stop_reason is tool_use, we need to check if there's a tool_use block to render
          if (message.stop_reason === 'tool_use' && message.content) {
            console.log('[Claude Handler] Processing tool_use from stop_reason');
            const toolUseBlocks = Array.isArray(message.content)
              ? message.content.filter((block: any) => block.type === 'tool_use')
              : [];

            for (const toolUseBlock of toolUseBlocks) {
              renderToolCall(messageId, toolUseBlock);
            }
          }
        }

        return true;
      }

      // Case 2: Older format with content directly in the message
      if (msg.content) {
        const messageId = msg.id || Date.now().toString();
        console.log('[Claude Handler] Processing direct content message:', messageId);

        ensureBubble(messageId, 'assistant');

        // Handle array content
        if (Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === 'text') {
              appendText(messageId, block.text);
            } else if (block.type === 'tool_use') {
              console.log('[Claude Handler] Found tool_use in direct content:', block);
              renderToolCall(messageId, block);
            }
          }
        }
        // Handle single text block
        else if (typeof msg.content === 'object' && msg.content.type === 'text') {
          appendText(messageId, msg.content.text);
        }

        if (msg.stop_reason === 'end_turn' || msg.done) {
          closeBubble(messageId);
        }

        return true;
      }

      // Case 3: Handle very simplified assistant format (just has text content)
      if (typeof msg.content === 'string' || Array.isArray(msg.content)) {
        const messageId = msg.id || Date.now().toString();
        console.log('[Claude Handler] Processing simple message:', messageId);

        ensureBubble(messageId, 'assistant');
        appendText(
          messageId,
          Array.isArray(msg.content)
            ? msg.content.map((c: any) => c.text || c).join('')
            : msg.content
        );

        return true;
      }
    }

    return false;
  };

  // Handle tool results (from both old and new format)
  const handleToolResults = (msg: JsonObject): boolean => {
    console.log('[Claude Handler] Checking for tool results in:', msg);

    // Case 1: New format with "user" type and nested message structure
    if (msg.type === 'user' && msg.message && typeof msg.message === 'object') {
      const message = msg.message as JsonObject;

      if (message.content && Array.isArray(message.content)) {
        // Look for tool results in the array
        const toolResults = message.content.filter(
          (item) => typeof item === 'object' && item.type === 'tool_result' && item.tool_use_id
        );

        if (toolResults.length > 0) {
          console.log('[Claude Handler] Found tool results in user message:', toolResults);

          for (const result of toolResults) {
            console.log('[Claude Handler] Processing tool result:', result);
            renderToolResult(String(result.tool_use_id), result as MessageBlock);
          }
          return true;
        }
      }
    }

    // Case 2: Standard format with user role/type and direct content
    if ((msg.role === 'user' || msg.type === 'user') && msg.content) {
      let toolResults: MessageBlock[] = [];

      if (Array.isArray(msg.content)) {
        toolResults = msg.content.filter((b: MessageBlock) => b.type === 'tool_result');
      } else if (
        typeof msg.content === 'object' &&
        (msg.content as MessageBlock).type === 'tool_result'
      ) {
        // Single tool result
        toolResults = [msg.content as MessageBlock];
      }

      if (toolResults.length > 0) {
        for (const result of toolResults) {
          renderToolResult(String(result.tool_use_id), result);
        }
        return true;
      }
    }

    // Case 3: New format with assistant message and tool use/call
    if (msg.type === 'assistant' && msg.message && typeof msg.message === 'object') {
      const message = msg.message as JsonObject;

      // Check if this is a tool use message
      if (message.stop_reason === 'tool_use' && message.content) {
        console.log('[Claude Handler] Found tool_use stop_reason in message:', message.stop_reason);

        const content = message.content;
        let toolCalls: MessageBlock[] = [];

        if (Array.isArray(content)) {
          toolCalls = content.filter((b: MessageBlock) => b.type === 'tool_use');
        } else if (typeof content === 'object' && (content as MessageBlock).type === 'tool_use') {
          toolCalls = [content as MessageBlock];
        }

        if (toolCalls.length > 0) {
          const messageId = String(message.id || msg.id || Date.now());
          for (const toolCall of toolCalls) {
            console.log('[Claude Handler] Rendering tool call:', toolCall);
            renderToolCall(messageId, toolCall);
          }
          return true;
        }
      }
    }

    // Case 4: Direct tool result format
    if (
      msg.type === 'tool_result' ||
      (msg.content &&
        typeof msg.content === 'object' &&
        (msg.content as JsonObject).type === 'tool_result')
    ) {
      const result =
        msg.content &&
        typeof msg.content === 'object' &&
        (msg.content as JsonObject).type === 'tool_result'
          ? (msg.content as MessageBlock)
          : (msg as unknown as MessageBlock);

      console.log('[Claude Handler] Rendering direct tool result:', result);
      renderToolResult(String(result.tool_use_id), result);
      return true;
    }

    return false;
  };

  return {
    handleProtocolMessage,
    handleSystemMessage,
    handleLegacyMessage,
    handleAssistantMessage,
    handleToolResults,
    handleMessage,
  };
}

// Export all types and functions
export type { MessageBlock, Message, MessageHandlerInterface };

export { createMessageHandlers };
