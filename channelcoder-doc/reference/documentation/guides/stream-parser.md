# Stream Parser SDK Guide

The Stream Parser SDK provides powerful tools for parsing Claude's stream-json output from detached sessions and log files. This enables real-time monitoring, cost tracking, and event analysis.

## Overview

The Stream Parser SDK helps you:
- Parse Claude's JSON stream output from log files
- Monitor logs in real-time as Claude responds
- Extract assistant messages, tool usage, and metadata
- Track costs and token usage
- Build monitoring tools and dashboards

## Quick Start

### Parse a Log File

```typescript
import { parseLogFile } from 'channelcoder';

// Parse completed session log
const parsed = await parseLogFile('session.log');

console.log(parsed.content);        // All assistant messages
console.log(parsed.totalCost);      // Total cost in USD
console.log(parsed.events.length);  // Number of events
```

### Real-time Monitoring

```typescript
import { monitorLog } from 'channelcoder';

// Monitor active log file
const cleanup = monitorLog('active.log', (event) => {
  console.log(`[${event.type}] ${new Date().toISOString()}`);
  
  if (event.type === 'assistant') {
    console.log('Claude:', event.message.content);
  }
});

// Stop monitoring when done
cleanup();
```

## Core Functions

### parseLogFile

Parse a complete log file into structured data:

```typescript
const result = await parseLogFile('path/to/log.jsonl');

// Result structure
{
  events: ClaudeEvent[];      // All parsed events
  content: string;            // Concatenated assistant messages
  totalCost: number;          // Total cost in USD
  totalTokens: {
    input: number;
    output: number;
    cache_creation: number;
    cache_read: number;
  };
  errors: Array<{             // Parsing errors
    line: number;
    content: string;
    error: string;
  }>;
}
```

### monitorLog

Monitor a log file for new events in real-time:

```typescript
const cleanup = monitorLog('active.log', (event) => {
  // Handle each event as it arrives
  switch (event.type) {
    case 'assistant':
      console.log('Message:', event.message.content);
      break;
    case 'tool_use':
      console.log('Tool:', event.tool, event.input);
      break;
    case 'result':
      console.log('Finished! Cost:', event.cost_usd);
      break;
  }
}, {
  tail: true,          // Start from end of file (default: false)
  pollInterval: 100    // Check interval in ms (default: 100)
});

// Cleanup when done
setTimeout(cleanup, 60000); // Stop after 1 minute
```

### parseStream

Parse a readable stream of JSON events:

```typescript
import { parseStream } from 'channelcoder';
import { createReadStream } from 'fs';

const stream = createReadStream('session.log');
const parser = parseStream();

stream.pipe(parser);

for await (const event of parser) {
  console.log('Event:', event.type);
}
```

## Event Types

### System Events

```typescript
interface SystemEvent {
  type: 'system';
  subtype: 'info' | 'warning' | 'error';
  message?: string;
  code?: string;
  data?: Record<string, unknown>;
}
```

### Assistant Events

```typescript
interface AssistantEvent {
  type: 'assistant';
  message: {
    role: 'assistant';
    content: string;
    model?: string;
  };
}
```

### Tool Use Events

```typescript
interface ToolUseEvent {
  type: 'tool_use';
  tool: string;              // Tool name (e.g., 'Read', 'Write')
  input: Record<string, any>; // Tool parameters
  output?: any;              // Tool result
  error?: string;            // Tool error if failed
}
```

### Result Events

```typescript
interface ResultEvent {
  type: 'result';
  subtype: 'success' | 'error';
  data?: Record<string, unknown>;
  error?: string;
  exit_code?: number;
  cost_usd?: number;
  tokens?: TokenUsage;
}
```

## Type Guards

Use type guards for safe event handling:

```typescript
import { 
  isSystemEvent, 
  isAssistantEvent, 
  isToolUseEvent,
  isResultEvent,
  isErrorEvent 
} from 'channelcoder';

function handleEvent(event: ClaudeEvent) {
  if (isAssistantEvent(event)) {
    // TypeScript knows this is AssistantEvent
    console.log('Claude says:', event.message.content);
  } else if (isToolUseEvent(event)) {
    // TypeScript knows this is ToolUseEvent
    console.log('Tool used:', event.tool);
  } else if (isResultEvent(event)) {
    // TypeScript knows this is ResultEvent
    if (event.subtype === 'success') {
      console.log('Success! Cost:', event.cost_usd);
    }
  }
}
```

## Utility Functions

### Extract Assistant Text

```typescript
import { streamParser } from 'channelcoder';

const text = streamParser.extractAssistantText(event);
// Returns content if assistant event, empty string otherwise
```

### Parse Individual Events

```typescript
import { parseStreamEvent } from 'channelcoder';

const line = '{"type":"assistant","message":{"role":"assistant","content":"Hello"}}';
const event = parseStreamEvent(line);

if (event) {
  console.log('Parsed:', event.type);
}
```

### Convert Events to Chunks

```typescript
import { eventToChunk } from 'channelcoder';

const chunk = eventToChunk(event);
// Returns Chunk format used by ChannelCoder's stream mode
```

## Real-World Examples

### Cost Tracking Dashboard

```typescript
import { monitorLog, isResultEvent } from 'channelcoder';

let totalCost = 0;
const sessions: Record<string, number> = {};

monitorLog('claude.log', (event) => {
  if (isResultEvent(event) && event.cost_usd) {
    totalCost += event.cost_usd;
    
    // Track per-session costs
    const sessionId = event.data?.session_id as string;
    if (sessionId) {
      sessions[sessionId] = (sessions[sessionId] || 0) + event.cost_usd;
    }
    
    console.log(`Total cost: $${totalCost.toFixed(4)}`);
    console.log(`Sessions: ${Object.keys(sessions).length}`);
  }
});
```

### Real-time Progress Monitor

```typescript
import { monitorLog, isAssistantEvent, isToolUseEvent } from 'channelcoder';

let messageCount = 0;
let toolUseCount = 0;

const cleanup = monitorLog('active-session.log', (event) => {
  if (isAssistantEvent(event)) {
    messageCount++;
    const preview = event.message.content.slice(0, 50);
    console.log(`[Message ${messageCount}] ${preview}...`);
  } else if (isToolUseEvent(event)) {
    toolUseCount++;
    console.log(`[Tool ${toolUseCount}] ${event.tool}`);
  }
});

// Display stats every 5 seconds
setInterval(() => {
  console.log(`\nStats: ${messageCount} messages, ${toolUseCount} tool uses\n`);
}, 5000);
```

### Error Monitoring

```typescript
import { monitorLog, isErrorEvent, isToolUseEvent } from 'channelcoder';

monitorLog('session.log', (event) => {
  if (isErrorEvent(event)) {
    console.error('System error:', event.message);
    // Send alert
  } else if (isToolUseEvent(event) && event.error) {
    console.error(`Tool ${event.tool} failed:`, event.error);
    // Log to error tracking service
  }
});
```

## Building a TUI Monitor

See the complete example in `examples/task-monitor-tui.ts`:

```typescript
import blessed from 'blessed';
import { monitorLog, streamParser } from 'channelcoder';

// Create TUI screen
const screen = blessed.screen({ smartCSR: true });
const outputBox = blessed.box({
  top: 0,
  left: 0,
  width: '70%',
  height: '100%',
  content: 'Claude Output',
  scrollable: true,
  border: { type: 'line' }
});

// Monitor log and update TUI
monitorLog(logFile, (event) => {
  if (streamParser.isAssistantEvent(event)) {
    const text = streamParser.extractAssistantText(event);
    outputBox.pushLine(text);
    screen.render();
  }
});
```

## Working with Detached Sessions

The Stream Parser SDK is designed to work with detached mode:

```typescript
import { detached, monitorLog } from 'channelcoder';

// Start detached session with streaming
const result = await detached('Long analysis', {
  logFile: 'analysis.log',
  stream: true  // Enable JSON streaming
});

// Monitor the session
const cleanup = monitorLog('analysis.log', (event) => {
  // Handle events in real-time
});

// Or parse completed log
const parsed = await parseLogFile('analysis.log');
console.log('Total cost:', parsed.totalCost);
```

## Performance Considerations

### Large Log Files

```typescript
// For very large logs, use streaming
import { parseStream } from 'channelcoder';
import { createReadStream } from 'fs';

const stream = createReadStream('huge.log');
const parser = parseStream();

let eventCount = 0;
stream.pipe(parser);

for await (const event of parser) {
  eventCount++;
  // Process each event without loading entire file
}
```

### Efficient Monitoring

```typescript
// Adjust poll interval for performance
const cleanup = monitorLog('active.log', handler, {
  pollInterval: 500,  // Check every 500ms instead of 100ms
  tail: true          // Start from end for active sessions
});
```

## Integration Examples

### With Unix Tools

```bash
# Extract all assistant messages
tail -f session.log | jq -r 'select(.type=="assistant") | .message.content'

# Monitor costs
tail -f session.log | jq -r 'select(.type=="result") | .cost_usd'

# Count tool usage
grep '"type":"tool_use"' session.log | jq -r .tool | sort | uniq -c
```

### With Node.js Streams

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { parseStream } from 'channelcoder';

// Filter and save assistant messages
const input = createReadStream('full.log');
const parser = parseStream();
const output = createWriteStream('messages.txt');

await pipeline(
  input,
  parser,
  async function* (source) {
    for await (const event of source) {
      if (event.type === 'assistant') {
        yield event.message.content + '\n';
      }
    }
  },
  output
);
```

## Troubleshooting

### Common Issues

1. **Malformed JSON lines**
   ```typescript
   const result = await parseLogFile('session.log');
   if (result.errors.length > 0) {
     console.error('Parse errors:', result.errors);
   }
   ```

2. **Missing events**
   - Ensure detached mode uses `stream: true`
   - Check file permissions
   - Verify log file path

3. **Performance issues**
   - Increase poll interval for monitoring
   - Use streaming for large files
   - Consider indexing for repeated parsing

## Next Steps

- Build custom monitoring tools for your workflow
- See [Examples](/examples/task-monitor-tui.ts) for complete TUI implementation
- Explore [Session Management](./session-management.md) for creating logs
- Learn about [Docker Mode](./docker-mode.md) for isolated logging