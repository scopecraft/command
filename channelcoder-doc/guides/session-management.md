# Session Management Guide

Session management in ChannelCoder enables multi-turn conversations with Claude while preserving context across interactions. This is essential for complex tasks that require iterative development, debugging, or long-running projects.

## Overview

Sessions provide:
- **Context Preservation**: Each message builds on previous conversation
- **Persistence**: Save and resume conversations days or weeks later
- **Automatic Tracking**: Session IDs chain automatically between responses
- **Full Integration**: Works with all ChannelCoder features

## Quick Start

### Basic Session Usage

```typescript
import { session } from 'channelcoder';

// Create a new session
const s = session();

// Have a conversation
await s.claude('What is TypeScript?');
await s.claude('Show me an example');  // Remembers previous context!

// Save for later
await s.save('learning-typescript');

// Load and continue another day
const saved = await session.load('learning-typescript');
await saved.claude('What about generics?');
```

### CLI Session Usage

```bash
# Start a new session
channelcoder run "Start project" --session my-project

# Continue a session
channelcoder run "Add tests" --load-session my-project

# List all sessions
channelcoder session list

# Remove old sessions
channelcoder session remove old-project
```

## Understanding Sessions

### How Sessions Work

1. **First Message**: Creates a new conversation with Claude
2. **Response**: Claude returns a session ID
3. **Subsequent Messages**: Use the session ID to continue
4. **Context**: Each message includes the full conversation history

### Session Lifecycle

```typescript
// 1. Create session
const s = session();

// 2. First interaction - creates conversation
const result1 = await s.claude('Explain async/await');
// Session ID: abc123 (managed internally)

// 3. Continue conversation - uses session ID
const result2 = await s.claude('Show error handling');
// Automatically uses session ID from result1

// 4. Save session state
await s.save('async-tutorial');

// 5. Load later
const restored = await session.load('async-tutorial');
await restored.claude('What about Promise.all?');
```

## Session Options

### Creating Sessions

```typescript
// With auto-save enabled
const s = session({ 
  autoSave: true  // Saves after each interaction
});

// With custom storage location
const s = session({
  storageDir: './my-sessions'  // Default: ~/.channelcoder/sessions
});
```

### Session Methods

```typescript
const s = session();

// Core methods
await s.claude(prompt, options);     // Run Claude with session
await s.stream(prompt, options);     // Stream with session
await s.interactive(prompt, options); // Interactive mode

// Management methods
s.id();                   // Get current session ID
s.messages();             // Get conversation history
await s.save(name);       // Save session with name
s.setId(newId);          // Manually set session ID

// Static methods
await session.load(name);        // Load saved session
await session.list();            // List all sessions
await session.remove(name);      // Delete session
await session.exists(name);      // Check if exists
```

## Advanced Usage

### Auto-Save Sessions

```typescript
const s = session({ autoSave: true });

// Automatically saved after each interaction
await s.claude('Implement feature');
await s.claude('Add tests');
// No need to manually save!

// Session saved at: ~/.channelcoder/sessions/{sessionId}.json
```

### Session Metadata

```typescript
// List sessions with metadata
const sessions = await session.list();
/*
[{
  name: 'feature-auth',
  path: '/Users/you/.channelcoder/sessions/feature-auth.json',
  messageCount: 5,
  lastActive: '2024-01-15T10:30:00Z',
  created: '2024-01-14T09:00:00Z'
}]
*/
```

### Session Data Structure

```typescript
// Access raw session data
const s = session();
await s.claude('Hello');

console.log(s.messages());
/*
[{
  role: 'user',
  content: 'Hello'
}, {
  role: 'assistant', 
  content: 'Hello! How can I help you today?'
}]
*/
```

## Common Patterns

### Long-Running Development

```typescript
// Day 1: Start implementation
const s = session();
await s.claude('Create a REST API for user management');
await s.claude('Add authentication middleware');
await s.save('user-api-project');

// Day 2: Continue
const s = await session.load('user-api-project');
await s.claude('Add input validation');
await s.claude('Implement rate limiting');
await s.save('user-api-project'); // Overwrite with progress

// Day 3: Finish up
const s = await session.load('user-api-project');
await s.claude('Add comprehensive tests');
await s.claude('Write API documentation');
```

### Debugging Sessions

```typescript
// Start debugging session
const debug = session();
await debug.claude('Getting TypeError in production');
await debug.claude('Here is the stack trace: ...');
await debug.save('bug-12345');

// Continue investigation
const debug = await session.load('bug-12345');
await debug.claude('I found this in the logs: ...');
await debug.claude('Could this be related to recent changes?');
```

### Code Review Workflow

```typescript
const review = session();

// Review multiple files with context
await review.claude('Review src/auth.ts for security issues');
await review.claude('Now check src/database.ts');
await review.claude('Are there any inconsistencies between them?');

// Save for team discussion
await review.save('security-review-2024-01');
```

## Combining with Other Features

### Sessions + Worktrees

```typescript
// Feature-specific sessions
const s = session();
await s.claude('Start payment feature', {
  worktree: 'feature/payments'
});
await s.save('payment-implementation');

// Continue in same worktree
const saved = await session.load('payment-implementation');
await saved.claude('Add Stripe integration');
```

### Sessions + Docker

```typescript
const s = session({ autoSave: true });

// Consistent Docker environment across session
await s.claude('Analyze security vulnerabilities', {
  docker: { image: 'security-scanner' }
});
await s.claude('Fix the SQL injection issue');
// Docker config preserved in session
```

### Sessions + Streaming

```typescript
const s = session();

// Stream with session context
for await (const chunk of s.stream('Write comprehensive docs')) {
  process.stdout.write(chunk.content);
}
```

## Session Storage

### Default Location

Sessions are stored in:
- **macOS/Linux**: `~/.channelcoder/sessions/`
- **Windows**: `%USERPROFILE%\.channelcoder\sessions\`

### Storage Format

```json
{
  "id": "session_abc123",
  "messages": [
    {
      "role": "user",
      "content": "Create a React component"
    },
    {
      "role": "assistant",
      "content": "I'll help you create a React component..."
    }
  ],
  "metadata": {
    "created": "2024-01-15T10:00:00Z",
    "lastActive": "2024-01-15T11:30:00Z",
    "messageCount": 2
  }
}
```

### Custom Storage

```typescript
// Use custom directory
const s = session({
  storageDir: './project-sessions'
});

// Or implement custom storage
class CustomStorage {
  async save(name, data) { /* ... */ }
  async load(name) { /* ... */ }
  async list() { /* ... */ }
  async remove(name) { /* ... */ }
}

const s = session({
  storage: new CustomStorage()
});
```

## Best Practices

### 1. Meaningful Names

```typescript
// Good: Descriptive session names
await s.save('oauth-implementation-jan-2024');
await s.save('bug-fix-memory-leak-issue-123');
await s.save('feature-user-notifications');

// Avoid: Generic names
await s.save('session1');
await s.save('temp');
```

### 2. Session Hygiene

```typescript
// List and clean old sessions periodically
const sessions = await session.list();
const oldSessions = sessions.filter(s => 
  Date.now() - new Date(s.lastActive).getTime() > 30 * 24 * 60 * 60 * 1000
);

for (const old of oldSessions) {
  await session.remove(old.name);
}
```

### 3. Context Management

```typescript
// Start fresh when context changes significantly
const s = session();
await s.claude('Implement auth system');
// ... many messages later ...

// New feature - start fresh session
const s2 = session();
await s2.claude('Now let\'s work on the payment system');
await s2.save('payment-system');
```

## Troubleshooting

### Common Issues

1. **"Session not found"**
   ```typescript
   // Check if session exists
   if (await session.exists('my-session')) {
     const s = await session.load('my-session');
   } else {
     console.log('Session does not exist');
   }
   ```

2. **Session size limits**
   ```typescript
   // Very long sessions may hit token limits
   // Start fresh session if needed
   if (s.messages().length > 50) {
     const summary = await s.claude('Summarize our progress');
     const fresh = session();
     await fresh.claude(`Continue from: ${summary}`);
   }
   ```

3. **Concurrent session access**
   ```typescript
   // Sessions are not thread-safe
   // Use one session object per process
   ```

### Debugging Sessions

```typescript
// Inspect session state
const s = session();
console.log('Session ID:', s.id());
console.log('Message count:', s.messages().length);
console.log('Last message:', s.messages().slice(-1)[0]);

// Enable verbose mode
await s.claude('Debug this', { verbose: true });
```

## CLI Integration

### Session-Required Prompts

Create prompts that require session context:

```yaml
---
session:
  required: true
systemPrompt: "You are helping with an ongoing project"
---
Continue implementing the feature we discussed.
```

### CLI Examples

```bash
# Start named session
channelcoder run "Create TODO app" --session todo-app

# Continue with inline prompt
channelcoder run -p "Add user authentication" --load-session todo-app

# Continue with prompt file
channelcoder run continue-task.md --load-session todo-app

# Interactive mode with session
channelcoder interactive --load-session todo-app
```

## Next Steps

- Learn about [Stream Parser SDK](./stream-parser.md) for parsing session logs
- Explore [Docker Mode](./docker-mode.md) for isolated sessions
- Try [Worktree Mode](./worktree-mode.md) for branch-specific sessions
- See [Examples](/examples/session-usage.ts) for practical patterns