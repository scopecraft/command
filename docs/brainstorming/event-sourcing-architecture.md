# Event Sourcing Architecture for Scopecraft

## Overview

This document explores adding an event sourcing layer to Scopecraft's orchestration system. The goal is to provide a unified way to handle all system events while maintaining flexibility for file-based or database storage.

## Core Architecture

### Event Store Interface

```typescript
// Event store that can use file-based or DB backend
interface EventStore {
  append(event: DomainEvent): Promise<void>
  getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]>
  getEventsByType(type: string, since?: Date): Promise<DomainEvent[]>
  subscribe(handler: EventHandler): () => void
}

// Base event structure
interface DomainEvent {
  id: string
  streamId: string           // e.g., "session-123", "task-AUTH-001"
  type: string              // e.g., "SessionStarted", "TaskStatusChanged"
  version: number
  timestamp: Date
  data: unknown
  metadata: {
    userId?: string
    correlationId?: string
    causationId?: string
  }
}
```

### File-Based Implementation (Start Simple)

```typescript
// Simple file-based event store using JSONL
class FileEventStore implements EventStore {
  private eventDir = '~/.scopecraft/events'
  private subscribers: EventHandler[] = []
  
  async append(event: DomainEvent): Promise<void> {
    // Store events in date-based folders for easy archival
    const dateFolder = new Date().toISOString().split('T')[0]
    const eventFile = `${this.eventDir}/${dateFolder}/${event.streamId}.jsonl`
    
    // Append to JSONL file
    await fs.appendFile(eventFile, JSON.stringify(event) + '\n')
    
    // Notify subscribers
    this.subscribers.forEach(handler => handler(event))
  }
  
  async getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]> {
    // Read from JSONL files
    const files = await this.findStreamFiles(streamId)
    const events = []
    
    for (const file of files) {
      const lines = await fs.readFile(file, 'utf-8').split('\n')
      const fileEvents = lines
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .filter(e => !fromVersion || e.version > fromVersion)
      
      events.push(...fileEvents)
    }
    
    return events.sort((a, b) => a.version - b.version)
  }
}
```

## Event Types for Scopecraft

### Task Events

```typescript
// Task lifecycle events
type TaskCreated = DomainEvent & {
  type: 'TaskCreated'
  data: {
    taskId: string
    title: string
    workflowState: WorkflowState
    parentId?: string
  }
}

type TaskStatusChanged = DomainEvent & {
  type: 'TaskStatusChanged'
  data: {
    taskId: string
    oldStatus: TaskStatus
    newStatus: TaskStatus
    reason?: string
  }
}

type TaskMoved = DomainEvent & {
  type: 'TaskMoved'
  data: {
    taskId: string
    fromWorkflow: WorkflowState
    toWorkflow: WorkflowState
  }
}

type TaskSectionUpdated = DomainEvent & {
  type: 'TaskSectionUpdated'
  data: {
    taskId: string
    section: string
    content: string
    previousContent?: string
  }
}
```

### Session Events

```typescript
// Session lifecycle events
type SessionQueued = DomainEvent & {
  type: 'SessionQueued'
  data: {
    sessionId: string
    taskId: string
    mode: SessionMode
    priority: Priority
  }
}

type SessionStarted = DomainEvent & {
  type: 'SessionStarted'
  data: {
    sessionId: string
    environment: EnvironmentConfig
    pid?: number
  }
}

type SessionToolUsed = DomainEvent & {
  type: 'SessionToolUsed'
  data: {
    sessionId: string
    tool: string
    input: unknown
    output?: unknown
    duration: number
  }
}

type SessionCompleted = DomainEvent & {
  type: 'SessionCompleted'
  data: {
    sessionId: string
    result: 'success' | 'failure'
    duration: number
    toolsUsed: string[]
    tokensUsed?: number
    cost?: number
  }
}
```

### Worktree Events

```typescript
// Worktree management events
type WorktreeCreated = DomainEvent & {
  type: 'WorktreeCreated'
  data: {
    branch: string
    path: string
    taskId?: string
  }
}

type WorktreeRecycled = DomainEvent & {
  type: 'WorktreeRecycled'
  data: {
    oldBranch: string
    newBranch: string
    path: string
  }
}

type WorktreeConflictDetected = DomainEvent & {
  type: 'WorktreeConflictDetected'
  data: {
    worktrees: string[]
    conflictingFiles: string[]
    sessions: string[]
  }
}
```

## Event Handlers and Projections

### Projection Pattern

```typescript
// Update read models based on events
class ProjectionManager {
  constructor(
    private eventStore: EventStore,
    private projections: Projection[]
  ) {}
  
  async start() {
    // Replay events to build projections
    for (const projection of this.projections) {
      await projection.rebuild(this.eventStore)
    }
    
    // Subscribe to new events
    this.eventStore.subscribe(async (event) => {
      for (const projection of this.projections) {
        await projection.handle(event)
      }
    })
  }
}
```

### Example Projections

```typescript
// Active sessions projection
class ActiveSessionsProjection implements Projection {
  private sessions = new Map<string, SessionInfo>()
  
  async handle(event: DomainEvent) {
    switch (event.type) {
      case 'SessionQueued':
        this.sessions.set(event.streamId, {
          id: event.streamId,
          status: 'queued',
          queuedAt: event.timestamp
        })
        break
        
      case 'SessionStarted':
        const session = this.sessions.get(event.streamId)
        if (session) {
          session.status = 'running'
          session.startedAt = event.timestamp
        }
        break
        
      case 'SessionCompleted':
        this.sessions.delete(event.streamId)
        break
    }
  }
  
  getActiveSessions(): SessionInfo[] {
    return Array.from(this.sessions.values())
  }
}

// Task statistics projection
class TaskStatisticsProjection implements Projection {
  private stats = new Map<string, TaskStats>()
  
  async handle(event: DomainEvent) {
    switch (event.type) {
      case 'TaskCreated':
        this.stats.set(event.data.taskId, {
          created: event.timestamp,
          statusChanges: 0,
          sessionsRun: 0,
          totalDuration: 0
        })
        break
        
      case 'TaskStatusChanged':
        const stats = this.stats.get(event.data.taskId)
        if (stats) {
          stats.statusChanges++
          stats.lastModified = event.timestamp
        }
        break
        
      case 'SessionCompleted':
        if (event.data.taskId) {
          const stats = this.stats.get(event.data.taskId)
          if (stats) {
            stats.sessionsRun++
            stats.totalDuration += event.data.duration
          }
        }
        break
    }
  }
}
```

## Integration with Existing Services

### Wrapping Existing Services

```typescript
// Wrap existing services to emit events
class EventedTaskService {
  constructor(
    private taskService: TaskService,
    private eventStore: EventStore
  ) {}
  
  async create(options: TaskCreateOptions): Promise<Task> {
    const task = await this.taskService.create(options)
    
    await this.eventStore.append({
      id: generateId(),
      streamId: `task-${task.metadata.id}`,
      type: 'TaskCreated',
      version: 1,
      timestamp: new Date(),
      data: {
        taskId: task.metadata.id,
        title: task.document.title,
        workflowState: task.metadata.location.workflowState,
        parentId: task.metadata.parentTask
      },
      metadata: {}
    })
    
    return task
  }
  
  async updateStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
    const task = await this.taskService.get(taskId)
    const oldStatus = task.document.frontmatter.status
    
    await this.taskService.update(taskId, {
      frontmatter: { status: newStatus }
    })
    
    await this.eventStore.append({
      id: generateId(),
      streamId: `task-${taskId}`,
      type: 'TaskStatusChanged',
      version: await this.getNextVersion(`task-${taskId}`),
      timestamp: new Date(),
      data: { taskId, oldStatus, newStatus },
      metadata: {}
    })
  }
}
```

### Event-Driven Policies

```typescript
// Automated reactions to events
class PolicyEngine {
  constructor(private eventStore: EventStore) {
    this.registerPolicies()
  }
  
  private registerPolicies() {
    // Auto-move tasks when status changes
    this.eventStore.subscribe(async (event) => {
      if (event.type === 'TaskStatusChanged') {
        const { taskId, newStatus } = event.data
        
        if (newStatus === 'in_progress') {
          // Emit TaskMoved event if in backlog
          const task = await taskService.get(taskId)
          if (task.location.workflowState === 'backlog') {
            await this.eventStore.append({
              type: 'TaskMoved',
              data: {
                taskId,
                fromWorkflow: 'backlog',
                toWorkflow: 'current'
              }
            })
          }
        }
      }
    })
    
    // Auto-retry failed sessions
    this.eventStore.subscribe(async (event) => {
      if (event.type === 'SessionCompleted' && event.data.result === 'failure') {
        const retryCount = await this.getRetryCount(event.streamId)
        
        if (retryCount < 3) {
          setTimeout(() => {
            this.eventStore.append({
              type: 'SessionQueued',
              data: {
                ...event.data,
                retryAttempt: retryCount + 1
              }
            })
          }, Math.pow(2, retryCount) * 1000) // Exponential backoff
        }
      }
    })
  }
}
```

## Storage Options

### File-Based Storage Structure

```
~/.scopecraft/events/
├── 2024-01-27/
│   ├── task-AUTH-001.jsonl
│   ├── session-abc123.jsonl
│   └── worktree-feature-auth.jsonl
├── 2024-01-28/
│   └── ...
└── indexes/
    ├── by-type/
    │   ├── TaskCreated.idx
    │   └── SessionStarted.idx
    └── by-stream.idx
```

### Optional SQLite Backend

```typescript
class SQLiteEventStore implements EventStore {
  private db: Database
  
  async initialize() {
    this.db = new Database('~/.scopecraft/events.db')
    
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        stream_id TEXT NOT NULL,
        type TEXT NOT NULL,
        version INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        data TEXT NOT NULL,
        metadata TEXT,
        INDEX idx_stream_version (stream_id, version),
        INDEX idx_type_timestamp (type, timestamp)
      )
    `)
  }
  
  async append(event: DomainEvent): Promise<void> {
    await this.db.prepare(`
      INSERT INTO events (id, stream_id, type, version, timestamp, data, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.streamId,
      event.type,
      event.version,
      event.timestamp.toISOString(),
      JSON.stringify(event.data),
      JSON.stringify(event.metadata)
    )
    
    this.notifySubscribers(event)
  }
}
```

## CLI Integration

```bash
# View recent events
sc events list --type SessionStarted --last 10

# Follow events in real-time
sc events follow --type TaskStatusChanged

# Export events for analysis
sc events export --from 2024-01-01 --format jsonl > events.jsonl

# Query event patterns
sc events query "SessionFailed followed by SessionQueued" --within 5m

# Replay events to rebuild state
sc events replay --from 2024-01-01

# Show event statistics
sc events stats --group-by type --period today
```

## Benefits for Scopecraft

1. **Audit Trail** - Complete history of what happened
2. **Debugging** - Can replay events to understand issues
3. **Flexibility** - Easy to add new projections/views
4. **Integration** - Other tools can subscribe to events
5. **Testing** - Can test with event sequences
6. **Analytics** - Query patterns over time
7. **Resilience** - Can rebuild state from events

## Implementation Path

### Phase 1: Basic Event Store
- File-based JSONL storage
- Simple append/read operations
- Basic CLI for viewing events

### Phase 2: Core Events
- Wrap task service to emit events
- Add session lifecycle events
- Create active sessions projection

### Phase 3: Advanced Features
- Policy engine for automated reactions
- Complex event pattern matching
- Performance optimizations

### Phase 4: Optional Enhancements
- SQLite backend option
- Distributed event streaming
- Event sourcing UI

## Design Decisions

### Why JSONL?
- Human-readable
- Appendable
- Grep-able
- Standard format

### Why Date-Based Folders?
- Easy archival
- Natural partitioning
- Simple cleanup

### Why Projections?
- Separate write/read models
- Optimized queries
- Rebuild from events

## Future Explorations

1. **Git as Event Store** - Each event as a commit
2. **Distributed Tracing** - Correlation IDs across events
3. **Event-Driven Knowledge Graph** - Build relationships from events
4. **AI Learning from Events** - Pattern recognition and optimization

## References

- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS with Event Sourcing](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Domain Events](https://martinfowler.com/eaaDev/DomainEvent.html)