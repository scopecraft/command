# WebSocket Claude Integration

This document describes the WebSocket endpoint for streaming Claude responses in real-time.

## Overview

The WebSocket endpoint at `/ws/claude` allows clients to send prompts to Claude and receive streaming responses in real-time. This is particularly useful for:

- Interactive chat interfaces
- Real-time code generation
- Task automation with progress tracking

## Architecture

```
Client -> WebSocket -> Bun Server -> Claude CLI -> Stream Response -> Client
```

### Modular Structure

```
tasks-ui/
├── server.ts                    # Main entry point
├── websocket/
│   ├── claude-handler.ts        # WebSocket handler for Claude
│   ├── process-manager.ts       # Process lifecycle management
│   └── schemas.ts              # Zod schemas and types
└── streamClaude.ts             # Claude CLI spawning utility
```

## Implementation Details

### Server Components

1. **Main Server** (`server.ts`)
   - Initializes ProcessManager and WebSocket handler
   - Routes WebSocket upgrades to Claude handler
   - Maintains existing API endpoints

2. **Claude Handler** (`websocket/claude-handler.ts`)
   - Validates messages using Zod schemas
   - Spawns Claude CLI processes
   - Streams stdout/stderr to clients
   - Manages timeouts and cleanup

3. **Process Manager** (`websocket/process-manager.ts`)
   - Tracks active Claude processes
   - Handles graceful shutdown
   - Cleans up orphaned processes

4. **Schemas** (`websocket/schemas.ts`)
   - Zod schemas for validation
   - TypeScript types for WebSocket messages
   - Configuration constants

5. **Stream Helper** (`streamClaude.ts`)
   - Wraps Bun.spawn for Claude CLI execution
   - Provides stdout/stderr pipes

### Message Flow

1. Client connects to `ws://localhost:3000/ws/claude`
2. Server sends info message: `{"info":"send {prompt,meta}"}`
3. Client sends: `{"prompt":"...", "meta":"TASK-123"}`
4. Server validates input and spawns Claude process
5. Server streams Claude output line-by-line to client
6. Connection closes when Claude process exits

### Error Handling

- Invalid JSON: Close with code 1008
- Invalid prompt/meta: Close with code 1008
- Process errors: Send error frame, close with code 1011
- Timeout (5 min): Kill process, close with code 1011
- Normal completion: Close with code 1000

## Client Implementation Guide

### Basic JavaScript Client

```javascript
const ws = new WebSocket('ws://localhost:3000/ws/claude');

ws.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    
    if (msg.error) {
      console.error('Error:', msg.error);
      return;
    }
    
    if (msg.type === 'message') {
      // Handle Claude message
      for (const block of msg.content) {
        if (block.type === 'text') {
          console.log('Assistant:', block.text);
        } else if (block.type === 'tool_use') {
          console.log('Tool call:', block.name);
        }
      }
    }
  } catch (e) {
    // Plain text output
    console.log('Output:', event.data);
  }
};

ws.onopen = () => {
  // Wait for info message, then send prompt
  setTimeout(() => {
    ws.send(JSON.stringify({
      prompt: 'Hello Claude',
      meta: 'TASK-123'
    }));
  }, 100);
};
```

### React Hook Example

```typescript
function useClaudeWebSocket() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  
  const connect = useCallback((prompt, meta) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    const ws = new WebSocket('ws://localhost:3000/ws/claude');
    wsRef.current = ws;
    
    ws.onopen = () => {
      setIsConnected(true);
      // Send prompt after info message
      setTimeout(() => {
        ws.send(JSON.stringify({ prompt, meta }));
      }, 100);
    };
    
    ws.onmessage = (event) => {
      // Parse and handle messages
      handleMessage(event.data);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };
  }, []);
  
  return { messages, isConnected, connect };
}
```

## Testing

### Unit Tests

Run the unit tests:
```bash
bun test test/websocket-claude.test.ts
```

### Integration Tests

Run integration tests (requires Claude CLI):
```bash
bun test test/websocket-claude-integration.test.ts
```

### Manual Testing

1. Use the demo page at `ws-demo.html`
2. Use wscat for command-line testing
3. Use browser developer tools WebSocket inspector

## Security Considerations

1. **Input Validation**
   - Prompt length limited to 8192 bytes
   - Meta must match `^[A-Z0-9_\-]+$`
   - JSON parsing in try-catch blocks

2. **Process Management**
   - 5-minute timeout for all Claude processes
   - Proper process cleanup on disconnect
   - Single process per connection

3. **Rate Limiting**
   - Consider adding rate limiting for production
   - Monitor concurrent connections
   - Add authentication if needed

## Future Enhancements

1. **Authentication**
   - Add JWT or API key authentication
   - User-specific rate limiting

2. **Persistence**
   - Save conversation history
   - Resume interrupted sessions

3. **Enhanced Features**
   - Support for model selection
   - Temperature and other parameters
   - Conversation context management

4. **Monitoring**
   - Add metrics collection
   - Error tracking
   - Usage analytics