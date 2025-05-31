# Autonomous Orchestration System - Implementation Plan

## Overview

This document outlines the implementation plan for moving autonomous session orchestration from the task-ui-2 server to the core module, enabling universal access across CLI, MCP, and UI interfaces while adding advanced features like queuing, resource management, and event-driven workflows.

## Current State Analysis

### Existing Components
- **`task-ui-2/server/autonomous-handlers.ts`**: API handlers with mixed business logic
- **`scripts/implement-autonomous.ts`**: CLI script for starting autonomous sessions
- **`task-ui-2/src/components/autonomous/`**: UI components for monitoring
- **`task-ui-2/server/claude-session-handlers.ts`**: Interactive tmux session management
- **Session Storage**: `.tasks/.autonomous-sessions/` directory structure
- **Custom Prompts**: Task UI ability to send custom prompts to sessions
- **Interactive Sessions**: tmux-based sessions viewable from terminal
- **Channelcoder SDK**: Pluggable session management with customizable adapters

### Current Limitations
- Business logic tied to UI server
- No queuing or resource management
- CLI and MCP cannot access orchestration features
- No event system for extensibility
- Resource usage unconstrained
- **Session types siloed**: Autonomous and interactive sessions managed separately
- **Prompt system fragmented**: Custom prompts only available through UI
- **Session visibility limited**: Interactive sessions not integrated with monitoring

## Target Architecture

### Core Module Structure
```
src/core/orchestration/
├── orchestrator.ts              # Main orchestration engine
├── session-manager.ts           # Session lifecycle management
├── queue-manager.ts             # Queue and scheduling logic
├── resource-manager.ts          # Resource allocation and limits
├── events/
│   ├── event-bus.ts             # Event system core
│   ├── handlers/
│   │   ├── session-events.ts    # Session lifecycle handlers
│   │   ├── queue-events.ts      # Queue event handlers
│   │   └── cleanup-events.ts    # Cleanup and maintenance
│   └── types.ts                 # Event type definitions
├── services/
│   ├── autonomous-service.ts    # Core business logic (from handlers)
│   ├── interactive-service.ts   # Interactive tmux session management
│   ├── prompt-service.ts        # Custom prompt handling and dispatch
│   ├── monitoring-service.ts    # Unified session monitoring and stats
│   ├── feedback-service.ts      # Human feedback management
│   └── persistence-service.ts   # Session persistence
├── adapters/
│   ├── channelcoder-adapter.ts  # Custom channelcoder session adapter
│   ├── task-storage-adapter.ts  # Store sessions within task files
│   └── session-adapter.ts       # Base adapter interface
├── policies/
│   ├── queue-policy.ts          # Queue rules and priorities
│   ├── resource-policy.ts       # Resource allocation rules
│   ├── retry-policy.ts          # Failure and retry handling
│   └── cleanup-policy.ts        # Session cleanup rules
└── types/
    ├── session.ts               # Unified session interfaces (autonomous + interactive)
    ├── prompt.ts                # Custom prompt and message interfaces
    ├── queue.ts                 # Queue interfaces
    ├── events.ts                # Event interfaces
    └── config.ts                # Configuration interfaces
```

### Unified Session Management
The orchestration system will support multiple session types through a unified interface:

```typescript
enum SessionType {
  AUTONOMOUS = 'autonomous',    # Detached, self-executing sessions
  INTERACTIVE = 'interactive'  # tmux sessions for human interaction
}

interface Session {
  id: string
  type: SessionType
  taskId: string
  parentId?: string
  status: SessionStatus
  startTime: Date
  metadata: SessionMetadata
  
  // Type-specific properties
  tmuxSession?: string      # For interactive sessions
  processId?: number        # For autonomous sessions
  customPrompts?: string[]  # Custom prompts sent to session
  
  // Adapter-specific storage
  adapterData?: any         # Storage adapter can use this for custom data
}
```

### Channelcoder Adapter Integration
The system will provide a custom channelcoder session adapter that integrates deeply with the task system:

```typescript
interface TaskSessionAdapter extends SessionAdapter {
  // Store session data directly in task files
  saveSessionToTask(taskId: string, sessionData: SessionData): Promise<void>
  loadSessionFromTask(taskId: string): Promise<SessionData | null>
  
  // Enhanced session lifecycle events
  onSessionStart(session: Session): Promise<void>
  onSessionComplete(session: Session, result: SessionResult): Promise<void>
  onSessionError(session: Session, error: Error): Promise<void>
  
  // Custom prompt handling
  sendPromptToSession(sessionId: string, prompt: string): Promise<void>
  getSessionHistory(sessionId: string): Promise<SessionMessage[]>
}
```

**Benefits of Custom Adapter**:
- **Task Integration**: Session data stored directly in task markdown files
- **Persistence**: Sessions survive system restarts and can be resumed
- **History**: Complete session history available through task files
- **Audit Trail**: All session activities logged in task context
- **Backup**: Sessions backed up with task data automatically

**Example Task File with Session Data**:
```markdown
# Fix authentication bug

---
type: bug
status: in_progress
area: auth
assignee: claude
sessions:
  - id: session-auth-fix-001
    type: autonomous
    status: running
    startTime: 2025-05-30T10:00:00Z
    tmuxSession: claude-auth-fix-001
    customPrompts:
      - "Focus on the JWT token validation logic"
      - "Check the middleware chain for auth errors"
---

## Instruction
Fix the authentication middleware that's causing 401 errors...

## Tasks
- [x] Identify the root cause
- [ ] Implement the fix
- [ ] Test the solution

## Session History
### Session: session-auth-fix-001 (Autonomous)
- 2025-05-30 10:00:15: Session started with autonomous mode
- 2025-05-30 10:01:30: Custom prompt: "Focus on the JWT token validation logic"
- 2025-05-30 10:05:45: Found issue in middleware/auth.ts:42
- 2025-05-30 10:10:00: Implementing fix for token expiry check
- 2025-05-30 10:15:20: Custom prompt: "Check the middleware chain for auth errors"

## Log
- 2025-05-30: Started investigating authentication issue
- 2025-05-30: Autonomous session identified token validation bug
```

### Interface Integration
```
├── cli/orchestration-commands.ts          # CLI command handlers (both types)
├── mcp/orchestration-handlers.ts          # MCP method handlers (both types)
└── task-ui-2/server/api/orchestration.ts  # HTTP API endpoints (both types)
```

## Implementation Phases

### Phase 1: Foundation (Tasks 01-02)
**Goal**: Establish core module structure and interfaces

#### Task 01: Design Core Architecture
- Define all TypeScript interfaces and types
- Design event system contracts
- Plan configuration schema
- Create module boundaries and dependencies

#### Task 02: Create Module Structure  
- Set up folder structure in `src/core/orchestration/`
- Create placeholder files with interfaces
- Set up exports in `src/core/index.ts`
- Add basic configuration loading

**Deliverables**:
- Complete type definitions
- Module structure with exports
- Configuration schema
- Architecture documentation

### Phase 2: Core Services (Tasks 03-06)
**Goal**: Implement core orchestration logic

#### Task 03: Session Manager
- Implement unified session lifecycle management (autonomous + interactive)
- Add session state tracking for both session types
- Create session persistence layer
- Add session validation and security
- Migrate existing tmux session logic from `claude-session-handlers.ts`
- Design adapter interface for pluggable session storage

**Key Features**:
```typescript
interface SessionManager {
  createSession(config: SessionConfig): Promise<Session>
  startSession(sessionId: string, type: SessionType): Promise<void>
  stopSession(sessionId: string): Promise<void>
  getSession(sessionId: string): Promise<Session | null>
  listSessions(filter?: SessionFilter): Promise<Session[]>
  updateSession(sessionId: string, updates: SessionUpdate): Promise<void>
  
  // Custom prompt support
  sendPrompt(sessionId: string, prompt: string): Promise<void>
  getPromptHistory(sessionId: string): Promise<string[]>
  
  // Interactive session specific
  attachToTmux(sessionId: string): Promise<string>  # Returns tmux session name
  detachFromTmux(sessionId: string): Promise<void>
  
  // Autonomous session specific  
  continueAutonomous(sessionId: string, feedback: string): Promise<void>
  getAutonomousLogs(sessionId: string): Promise<LogEntry[]>
}
```

#### Task 04: Queue Manager
- Implement priority-based queue
- Add queue persistence
- Create scheduling algorithms
- Add queue capacity management

**Key Features**:
```typescript
interface QueueManager {
  enqueue(request: SessionRequest, priority?: Priority): Promise<QueuePosition>
  dequeue(): Promise<SessionRequest | null>
  removeFromQueue(sessionId: string): Promise<boolean>
  getQueueStatus(): Promise<QueueStatus>
  setQueuePolicy(policy: QueuePolicy): void
  processQueue(): Promise<void>
}
```

#### Task 05: Resource Manager
- Implement resource tracking (CPU, memory, sessions)
- Add resource allocation policies
- Create resource usage monitoring
- Add resource cleanup

**Key Features**:
```typescript
interface ResourceManager {
  allocateResources(request: ResourceRequest): Promise<ResourceAllocation>
  releaseResources(allocationId: string): Promise<void>
  getResourceUsage(): Promise<ResourceUsage>
  setResourceLimits(limits: ResourceLimits): void
  canAllocate(request: ResourceRequest): boolean
}
```

#### Task 06: Event Bus System
- Implement event bus with pub/sub
- Add event persistence for debugging
- Create event handler registration
- Add event filtering and routing

**Key Features**:
```typescript
interface EventBus {
  emit<T>(event: Event<T>): Promise<void>
  subscribe<T>(eventType: string, handler: EventHandler<T>): Subscription
  unsubscribe(subscription: Subscription): void
  getEventHistory(filter?: EventFilter): Promise<Event[]>
}
```

### Phase 3: Adapter & Migration (Tasks 07-07B)
**Goal**: Create custom session adapter and migrate existing logic

#### Task 07: Create Channelcoder Task Adapter
- Implement custom channelcoder session adapter
- Add task-integrated session storage
- Create session persistence in task markdown files
- Add session history and audit trail features
- Design adapter configuration and policies

**Adapter Features**:
```typescript
interface TaskSessionAdapter {
  // Session-task integration
  createSessionInTask(taskId: string, sessionConfig: SessionConfig): Promise<Session>
  updateTaskWithSession(taskId: string, sessionUpdate: SessionUpdate): Promise<void>
  getSessionFromTask(taskId: string): Promise<Session | null>
  
  // Session history in task files
  addSessionLogToTask(taskId: string, logEntry: LogEntry): Promise<void>
  getSessionHistoryFromTask(taskId: string): Promise<LogEntry[]>
  
  // Lifecycle hooks
  onSessionStart(session: Session): Promise<void>
  onSessionComplete(session: Session, result: SessionResult): Promise<void>
}
```

#### Task 07B: Migrate Existing Handlers
- Extract business logic from `autonomous-handlers.ts` and `claude-session-handlers.ts`
- Move to respective services in core
- Update to use new task adapter
- Maintain API compatibility during transition

**Migration Strategy**:
1. Create task adapter with current session storage logic
2. Create new services with existing business logic
3. Update services to use task adapter
4. Update API handlers to use services
5. Test compatibility and remove old logic

### Phase 4: Interface Integration (Tasks 08-10)
**Goal**: Enable orchestration across all interfaces

#### Task 08: CLI Integration
- Create unified orchestration commands for both session types
- Update `implement-autonomous.ts` to use core
- Migrate interactive session logic to use core
- Add queue management commands
- Add session monitoring commands

**New/Updated CLI Commands**:
```bash
# Unified session management
scopecraft session start <taskId> [--type=autonomous|interactive] [--priority=high] [--queue]
sc session start <taskId> [--type=autonomous|interactive] [--priority=high] [--queue]
sc session list [--type=autonomous|interactive] [--status=running] [--format=table|json]
sc session attach <sessionId>        # Attach to interactive session
sc session prompt <sessionId> "prompt text"  # Send custom prompt
sc session cancel <sessionId>
sc session logs <sessionId> [--follow]

# Queue management  
sc queue status [--format=table|json]
sc queue clear [--type=autonomous|interactive]

# Legacy autonomous commands (maintained for compatibility)
sc autonomous start <taskId> [--priority=high] [--queue]
sc autonomous list [--status=running]
sc autonomous cancel <sessionId>

# Configuration
sc session config [--set-limits] [--policy]
```

#### Task 09: MCP Handlers
- Create unified MCP methods for both session types
- Add to existing MCP server
- Implement parameter validation
- Add comprehensive error handling
- Maintain backward compatibility with existing autonomous methods

**New/Updated MCP Methods**:
```typescript
# Unified session methods
session_start(taskId, type?, parentId?, priority?) -> SessionResponse
session_list(type?, filter?) -> SessionInfo[]
session_get(sessionId) -> SessionInfo
session_cancel(sessionId) -> boolean
session_prompt(sessionId, prompt) -> boolean
session_attach(sessionId) -> AttachInfo  # Returns tmux session name for interactive
session_logs(sessionId, limit?) -> LogEntry[]

# Queue management
queue_status(type?) -> QueueStatus  
queue_clear(type?) -> boolean

# Legacy autonomous methods (maintained for compatibility)
autonomous_start(taskId, parentId?, priority?) -> SessionResponse
autonomous_list(filter?) -> SessionInfo[]
autonomous_cancel(sessionId) -> boolean
autonomous_logs(sessionId, limit?) -> LogEntry[]

# Configuration
session_config(limits?, policies?) -> ConfigStatus
```

#### Task 10: UI Integration
- Update UI to use core orchestration
- Replace autonomous-handlers.ts with API calls to core
- Add queue management UI
- Add resource usage visualization

### Phase 5: Testing & Documentation (Tasks 11-12)
**Goal**: Ensure reliability and usability

#### Task 11: Comprehensive Testing
- Unit tests for all core modules
- Integration tests across interfaces
- Performance testing with multiple sessions
- Error handling and edge case testing

**Test Coverage**:
- Session lifecycle edge cases
- Queue overflow scenarios
- Resource exhaustion handling
- Event system reliability
- Cross-interface consistency

#### Task 12: Documentation & Examples
- API documentation for all interfaces
- Configuration guide
- Migration guide from current system
- Examples for common use cases

## Technical Specifications

### Event System Design
```typescript
// Core event types
interface SessionStartedEvent {
  type: 'session.started'
  sessionId: string
  taskId: string
  timestamp: Date
  metadata: SessionMetadata
}

interface SessionQueuedEvent {
  type: 'session.queued'
  sessionId: string
  position: number
  priority: Priority
  estimatedStart?: Date
}

interface ResourceExhaustedEvent {
  type: 'resource.exhausted'
  resourceType: ResourceType
  currentUsage: number
  limit: number
  affectedSessions: string[]
}
```

### Configuration Schema
```typescript
interface OrchestrationConfig {
  resources: {
    maxConcurrentSessions: number
    maxMemoryPerSession: string
    maxQueueSize: number
    sessionTimeoutMs: number
  }
  
  queue: {
    defaultPriority: Priority
    enablePriorities: boolean
    processingIntervalMs: number
    retryPolicy: RetryConfig
  }
  
  events: {
    enablePersistence: boolean
    maxEventHistory: number
    enableMetrics: boolean
  }
  
  cleanup: {
    autoCleanupCompletedSessions: boolean
    cleanupIntervalMs: number
    retainSessionLogsForMs: number
  }
}
```

### Queue Priority System
```typescript
enum Priority {
  LOWEST = 0,
  LOW = 1,
  MEDIUM = 2,     // Default
  HIGH = 3,
  HIGHEST = 4,
  URGENT = 5      // Reserved for system operations
}

interface QueuePolicy {
  maxSize: number
  maxPerUser?: number
  priorityWeights: Record<Priority, number>
  timeoutMs: number
  retryAttempts: number
}
```

## Risk Mitigation

### Technical Risks
1. **Breaking Changes**: Maintain API compatibility during migration
2. **Performance**: Implement incremental loading and pagination
3. **Resource Leaks**: Add comprehensive cleanup and monitoring
4. **Concurrency**: Use proper locking and transaction handling

### Implementation Risks
1. **Scope Creep**: Focus on core functionality first, defer advanced features
2. **Complex Migration**: Implement feature flags for gradual rollout
3. **Testing Coverage**: Require 90%+ test coverage before release
4. **Documentation Lag**: Write docs alongside implementation

## Success Metrics

### Functional Metrics
- [ ] All existing autonomous features work through core
- [ ] CLI, MCP, and UI have feature parity
- [ ] Queue handles 50+ concurrent session requests
- [ ] Resource limits prevent system overload
- [ ] Event system supports 1000+ events/minute

### Quality Metrics
- [ ] 95%+ test coverage on core modules
- [ ] <100ms response time for orchestration API calls
- [ ] Zero memory leaks in 24-hour tests
- [ ] Complete API documentation
- [ ] Migration guide with examples

### User Experience Metrics
- [ ] Session start time <3 seconds
- [ ] Queue position updates in real-time
- [ ] Clear error messages for all failure modes
- [ ] Consistent behavior across all interfaces
- [ ] Intuitive configuration and policies

## Future Enhancements

### Phase 6+ Features (Post-MVP)

#### Intelligent Prompt Selection Engine
A rule-based system for automatically selecting and customizing prompts based on task context:

**Rule Engine Capabilities**:
```typescript
interface PromptRule {
  id: string
  name: string
  conditions: RuleCondition[]
  promptTemplate: string
  priority: number
  enabled: boolean
}

interface RuleCondition {
  field: 'status' | 'area' | 'type' | 'tags' | 'assignee' | 'priority'
  operator: 'equals' | 'contains' | 'in' | 'not_in' | 'matches'
  value: string | string[]
}

// Example rules
const rules: PromptRule[] = [
  {
    id: 'bug-debugging-rule',
    name: 'Bug Debugging Focus',
    conditions: [
      { field: 'type', operator: 'equals', value: 'bug' },
      { field: 'status', operator: 'in', value: ['todo', 'in_progress'] }
    ],
    promptTemplate: 'Focus on debugging methodically. Check logs, reproduce the issue, then implement a fix.',
    priority: 10
  },
  {
    id: 'frontend-review-rule', 
    name: 'Frontend Code Review',
    conditions: [
      { field: 'area', operator: 'equals', value: 'ui' },
      { field: 'tags', operator: 'contains', value: 'review' }
    ],
    promptTemplate: 'Review UI components for accessibility, performance, and design consistency.',
    priority: 8
  }
]
```

**Human-Configurable Parameters**:
- Rule creation and editing through UI
- Priority adjustment for rule conflicts
- Rule enabling/disabling
- Custom prompt templates
- Condition builder with visual interface

**Auto-Selection Logic**:
- Evaluate rules based on task metadata (status, tags, area, type, assignee, priority)
- Support compound conditions (AND/OR logic)
- Rule prioritization for conflicts
- Fallback to default prompts
- Context-aware prompt customization

**Integration Points**:
- Session start: Auto-select initial prompt
- Mid-session: Suggest prompts based on progress
- Custom prompts: Rule-based suggestions
- Feedback loop: Learn from successful prompt combinations

#### Other Advanced Features
- **Advanced Scheduling**: Cron-like scheduling for recurring tasks
- **Session Templates**: Predefined session configurations with rule-based prompts
- **Distributed Orchestration**: Multi-node session distribution
- **AI-Powered Queue Optimization**: Machine learning for queue prioritization and prompt selection
- **Workflow Orchestration**: Multi-step autonomous workflows with intelligent transitions
- **Integration APIs**: Webhooks and external system integration
- **Advanced Monitoring**: Metrics, alerting, and dashboards
- **Session Sharing**: Collaborative autonomous sessions
- **Prompt Analytics**: Track prompt effectiveness and suggest improvements

This implementation plan provides a comprehensive roadmap for building a robust, scalable autonomous orchestration system that will serve as the foundation for advanced automation features in the task management system.