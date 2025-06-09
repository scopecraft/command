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
import { session, FileSessionStorage } from 'channelcoder';

// Basic session (uses FileSessionStorage with auto-save enabled by default)
const s = session();

// With custom name
const s = session({ 
  name: 'my-project-session'
});

// With auto-save disabled
const s = session({ 
  autoSave: false  // Default: true
});

// With custom storage location
const storage = new FileSessionStorage('./my-sessions');
const s = session({ storage });

// With custom storage adapter
const s = session({
  storage: new DatabaseStorage(myDb)
});

// All options combined
const s = session({
  name: 'feature-implementation',
  autoSave: true,
  storage: new FileSessionStorage('./project-sessions')
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

## TypeScript Interfaces

### Session Types

```typescript
export interface SessionOptions {
  name?: string;
  storage?: SessionStorage;
  autoSave?: boolean; // Default: true
}

export interface SessionState {
  sessionChain: string[]; // All session IDs in order
  currentSessionId?: string; // Latest session ID
  messages: Message[]; // Conversation history
  metadata: {
    name?: string;
    created: Date;
    lastActive: Date;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId: string;
}

export interface SessionInfo {
  name: string;
  path: string;
  created: Date;
  lastActive: Date;
  messageCount: number;
}

export interface Session {
  // Wrapped functions with session context
  claude: ClaudeFunction;
  stream: typeof streamBase;
  interactive: typeof interactiveBase;
  run: typeof runBase;
  detached: typeof detachedBase;

  // Session management methods
  id(): string | undefined;
  messages(): Message[];
  save(name?: string): Promise<string>;
  clear(): void;
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

### Custom Storage Adapters

The session system supports pluggable storage through the `SessionStorage` interface:

```typescript
export interface SessionStorage {
  save(state: SessionState, name?: string): Promise<string>;
  load(nameOrPath: string): Promise<SessionState>;
  list(): Promise<SessionInfo[]>;
}
```

#### File-Based Storage (Default)

```typescript
import { FileSessionStorage } from 'channelcoder';

// Use custom directory
const storage = new FileSessionStorage('./project-sessions');
const s = session({ storage });

// Default storage location: ~/.channelcoder/sessions/
const s = session(); // Uses FileSessionStorage automatically
```

#### Custom Storage Implementation

Implement your own storage backend:

```typescript
import type { SessionStorage, SessionState, SessionInfo } from 'channelcoder';

class DatabaseStorage implements SessionStorage {
  constructor(private db: Database) {}

  async save(state: SessionState, name?: string): Promise<string> {
    const id = name || `session-${Date.now()}`;
    await this.db.sessions.upsert({
      id,
      data: JSON.stringify(state),
      updated: new Date()
    });
    return id;
  }

  async load(nameOrPath: string): Promise<SessionState> {
    const record = await this.db.sessions.findUnique({
      where: { id: nameOrPath }
    });
    if (!record) {
      throw new Error(`Session ${nameOrPath} not found`);
    }
    const state = JSON.parse(record.data) as SessionState;
    
    // Convert date strings back to Date objects
    state.metadata.created = new Date(state.metadata.created);
    state.metadata.lastActive = new Date(state.metadata.lastActive);
    state.messages.forEach(msg => {
      msg.timestamp = new Date(msg.timestamp);
    });
    
    return state;
  }

  async list(): Promise<SessionInfo[]> {
    const records = await this.db.sessions.findMany({
      orderBy: { updated: 'desc' }
    });
    
    return records.map(record => {
      const state = JSON.parse(record.data) as SessionState;
      return {
        name: state.metadata.name || record.id,
        path: record.id,
        created: new Date(state.metadata.created),
        lastActive: new Date(state.metadata.lastActive),
        messageCount: state.messages.length
      };
    });
  }
}

// Use custom storage
const dbStorage = new DatabaseStorage(myDatabase);
const s = session({ storage: dbStorage });
```

#### Cloud Storage Example

```typescript
class S3Storage implements SessionStorage {
  constructor(private s3Client: S3Client, private bucket: string) {}

  async save(state: SessionState, name?: string): Promise<string> {
    const key = name || `session-${Date.now()}.json`;
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: `sessions/${key}`,
      Body: JSON.stringify(state, null, 2),
      ContentType: 'application/json'
    }));
    return key;
  }

  async load(nameOrPath: string): Promise<SessionState> {
    const response = await this.s3Client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: `sessions/${nameOrPath}`
    }));
    
    const body = await response.Body?.transformToString();
    if (!body) {
      throw new Error(`Session ${nameOrPath} not found`);
    }
    
    const state = JSON.parse(body) as SessionState;
    // Convert dates...
    return state;
  }

  async list(): Promise<SessionInfo[]> {
    const response = await this.s3Client.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: 'sessions/'
    }));
    
    const sessions: SessionInfo[] = [];
    for (const object of response.Contents || []) {
      // Load and parse each session for metadata...
    }
    return sessions;
  }
}

const s3Storage = new S3Storage(s3Client, 'my-sessions-bucket');
const s = session({ storage: s3Storage });
```

#### Redis Storage Example

```typescript
class RedisStorage implements SessionStorage {
  constructor(private redis: RedisClient) {}

  async save(state: SessionState, name?: string): Promise<string> {
    const key = name || `session:${Date.now()}`;
    await this.redis.set(key, JSON.stringify(state));
    await this.redis.sadd('sessions:all', key);
    return key;
  }

  async load(nameOrPath: string): Promise<SessionState> {
    const data = await this.redis.get(nameOrPath);
    if (!data) {
      throw new Error(`Session ${nameOrPath} not found`);
    }
    const state = JSON.parse(data) as SessionState;
    // Convert dates...
    return state;
  }

  async list(): Promise<SessionInfo[]> {
    const keys = await this.redis.smembers('sessions:all');
    const sessions: SessionInfo[] = [];
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const state = JSON.parse(data) as SessionState;
        sessions.push({
          name: state.metadata.name || key,
          path: key,
          created: new Date(state.metadata.created),
          lastActive: new Date(state.metadata.lastActive),
          messageCount: state.messages.length
        });
      }
    }
    
    return sessions.sort((a, b) => 
      b.lastActive.getTime() - a.lastActive.getTime()
    );
  }
}

const redisStorage = new RedisStorage(redisClient);
const s = session({ storage: redisStorage });
```

#### Storage Adapter Guidelines

When implementing custom storage:

1. **Handle Date Serialization**: Convert Date objects to/from strings properly
2. **Error Handling**: Throw meaningful errors for missing sessions
3. **Atomic Operations**: Ensure save operations are atomic when possible
4. **Performance**: Consider caching for frequently accessed sessions
5. **Cleanup**: Implement garbage collection for old sessions if needed

```typescript
class CustomStorage implements SessionStorage {
  async save(state: SessionState, name?: string): Promise<string> {
    // 1. Generate unique identifier
    // 2. Serialize state (handle dates)
    // 3. Store atomically
    // 4. Return identifier
  }

  async load(nameOrPath: string): Promise<SessionState> {
    // 1. Retrieve by identifier
    // 2. Parse and validate
    // 3. Convert dates back to Date objects
    // 4. Return state
  }

  async list(): Promise<SessionInfo[]> {
    // 1. Get all session identifiers
    // 2. Load metadata efficiently (avoid full content)
    // 3. Sort by last active
    // 4. Return session info
  }
}
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