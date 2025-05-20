/**
 * Tests for Claude JSON format parsing
 * 
 * This tests that both the old and new Claude JSON streaming formats are handled correctly.
 */

import * as assert from 'assert';

// Mock the PromptPage's message handling logic for testing
interface Message {
  id: string;
  type: 'assistant' | 'tool_call' | 'tool_result' | 'error' | 'info' | 'user';
  content: any;
  timestamp: Date;
}

// Simplified message handling for testing
function parseClaudeMessage(jsonString: string): {
  messageType: string;
  content: string | object;
  handled: boolean;
} {
  try {
    const msg = JSON.parse(jsonString);
    
    // Internal websocket protocol messages
    if (msg.error) {
      return { messageType: 'error', content: msg.error, handled: true };
    }

    if (msg.info) {
      return { messageType: 'info', content: msg.info, handled: true };
    }

    if (msg.type === 'user_echo') {
      return { messageType: 'info', content: msg.content, handled: true };
    }

    // New Claude JSON streaming format
    // 1. Handle init system message (first message in the conversation)
    if (msg.type === 'system' && msg.content && msg.content.type === 'init') {
      return { messageType: 'info', content: `Session initialized`, handled: true };
    }

    // 2. Handle final result system message with stats
    if (msg.type === 'system' && msg.content && msg.content.type === 'result') {
      return { 
        messageType: 'info', 
        content: `Session completed. Tokens: ${msg.content.total_tokens || 'unknown'}`, 
        handled: true 
      };
    }

    // 3. Handle the old message format (backward compatibility)
    if (msg.type === 'message') {
      // Test would process content blocks
      return { messageType: 'assistant', content: msg.content, handled: true };
    }

    // 4. Handle new assistant message format
    if (msg.type === 'assistant' && msg.content) {
      // Test would process content blocks
      return { messageType: 'assistant', content: msg.content, handled: true };
    }

    // 5. Handle tool results from user role (both old and new format)
    if ((msg.role === 'user' || msg.type === 'user') && msg.content) {
      let toolResults = [];
      
      if (Array.isArray(msg.content)) {
        toolResults = msg.content.filter((b: any) => b.type === 'tool_result');
      } else if (msg.content.type === 'tool_result') {
        // Single tool result
        toolResults = [msg.content];
      }
      
      if (toolResults.length > 0) {
        return { messageType: 'tool_result', content: toolResults, handled: true };
      }
    }

    // Unrecognized format
    return { messageType: 'unknown', content: msg, handled: false };
  } catch (e) {
    // If not JSON, treat as plain text assistant message
    return { messageType: 'assistant', content: jsonString, handled: true };
  }
}

describe('Claude JSON Format Parser', () => {
  it('should handle old message format', () => {
    const oldFormat = `{
      "type": "message",
      "id": "msg_123abc",
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "Here is some text content"
        },
        {
          "type": "tool_use",
          "id": "tool_123",
          "name": "Bash",
          "input": {
            "command": "ls -la"
          }
        }
      ],
      "stop_reason": null
    }`;
    
    const result = parseClaudeMessage(oldFormat);
    assert.strictEqual(result.messageType, 'assistant');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(Array.isArray(result.content), true);
    assert.strictEqual(result.content.length, 2);
  });

  it('should handle new assistant message format', () => {
    const newFormat = `{
      "type": "assistant",
      "id": "msg_456def",
      "content": [
        {
          "type": "text",
          "text": "Here is some new format text"
        }
      ],
      "done": false
    }`;
    
    const result = parseClaudeMessage(newFormat);
    assert.strictEqual(result.messageType, 'assistant');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(Array.isArray(result.content), true);
    assert.strictEqual(result.content.length, 1);
  });

  it('should handle new single text block format', () => {
    const singleBlockFormat = `{
      "type": "assistant",
      "id": "msg_789ghi",
      "content": {
        "type": "text",
        "text": "Single text block"
      },
      "done": false
    }`;
    
    const result = parseClaudeMessage(singleBlockFormat);
    assert.strictEqual(result.messageType, 'assistant');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.content.type, 'text');
    assert.strictEqual(result.content.text, 'Single text block');
  });

  it('should handle system init message', () => {
    const systemInit = `{
      "type": "system",
      "content": {
        "type": "init",
        "model": "claude-3-7-sonnet-20250219"
      }
    }`;
    
    const result = parseClaudeMessage(systemInit);
    assert.strictEqual(result.messageType, 'info');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.content, 'Session initialized');
  });

  it('should handle system result message', () => {
    const systemResult = `{
      "type": "system",
      "content": {
        "type": "result",
        "total_tokens": 4283,
        "completion_tokens": 2147,
        "prompt_tokens": 2136
      }
    }`;
    
    const result = parseClaudeMessage(systemResult);
    assert.strictEqual(result.messageType, 'info');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.content, 'Session completed. Tokens: 4283');
  });

  it('should handle old format tool results', () => {
    const oldFormatToolResult = `{
      "role": "user",
      "content": [
        {
          "type": "tool_result",
          "tool_use_id": "tool_123",
          "content": {
            "output": "file1.txt\\nfile2.txt"
          }
        }
      ]
    }`;
    
    const result = parseClaudeMessage(oldFormatToolResult);
    assert.strictEqual(result.messageType, 'tool_result');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(Array.isArray(result.content), true);
    assert.strictEqual(result.content.length, 1);
    assert.strictEqual(result.content[0].tool_use_id, 'tool_123');
  });

  it('should handle new format tool results', () => {
    const newFormatToolResult = `{
      "type": "user",
      "content": {
        "type": "tool_result",
        "tool_use_id": "tool_456",
        "content": {
          "output": "success"
        }
      }
    }`;
    
    const result = parseClaudeMessage(newFormatToolResult);
    assert.strictEqual(result.messageType, 'tool_result');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(Array.isArray(result.content), true);
    assert.strictEqual(result.content.length, 1);
    assert.strictEqual(result.content[0].tool_use_id, 'tool_456');
  });

  it('should handle internal error messages', () => {
    const errorMessage = `{"error": "Something went wrong"}`;
    
    const result = parseClaudeMessage(errorMessage);
    assert.strictEqual(result.messageType, 'error');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.content, 'Something went wrong');
  });

  it('should handle info messages', () => {
    const infoMessage = `{"info": "Connection established"}`;
    
    const result = parseClaudeMessage(infoMessage);
    assert.strictEqual(result.messageType, 'info');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.content, 'Connection established');
  });

  it('should handle plain text as assistant message', () => {
    const plainText = `This is not a JSON message`;
    
    const result = parseClaudeMessage(plainText);
    assert.strictEqual(result.messageType, 'assistant');
    assert.strictEqual(result.handled, true);
    assert.strictEqual(result.content, plainText);
  });
});