---
title: "Service Layer Architecture"
description: "How domain services interact and their boundaries"
version: "1.0"
status: "draft"
category: "architecture"
updated: "2025-01-07"
authors: ["system"]
related:
  - system-architecture.md
  - orchestration-architecture.md
  - mcp-architecture.md
---

# Service Layer Architecture

## Table of Contents

1. [Overview](#overview)
2. [Service Design Principles](#service-design-principles)
3. [Core Services](#core-services)
4. [Service Interactions](#service-interactions)
5. [Service Boundaries](#service-boundaries)
6. [Extension Points](#extension-points)
7. [Implementation Guidelines](#implementation-guidelines)

## Overview

Scopecraft's service layer provides clean separation of concerns through well-defined domain services. Each service has a single responsibility and communicates through standard interfaces.

## Service Design Principles

### 1. Single Responsibility
Each service owns one domain and does it well:
- Task Service → Task management
- Session Service → AI session lifecycle
- Context Service → Information gathering
- Environment Service → Execution environments

### 2. Clear Boundaries
Services communicate through defined interfaces:
- No direct database access across services
- No shared internal state
- All communication through public APIs

### 3. Pluggable Design
Any service can be replaced with an alternative implementation that maintains the same interface.

## Core Services

### Task Service

```
┌─────────────────────────────────────────────────────────────────┐
│                        TASK SERVICE                              │
│                                                                  │
│  Responsibility: Manage tasks and their lifecycle               │
│                                                                  │
│  Core Operations:                                                │
│  • create(task) → Task                                          │
│  • get(id) → Task                                               │
│  • update(id, changes) → Task                                   │
│  • list(filter) → Task[]                                        │
│  • move(id, workflow) → Task                                    │
│                                                                  │
│  Domain Objects:                                                 │
│  • Task (work unit for a feature)                              │
│  • Section (instruction, tasks, deliverable, log)              │
│  • Workflow State (backlog, current, archive)                  │
│  • Relations (blocks, depends_on, relates_to)                  │
│                                                                  │
│  Does NOT:                                                       │
│  • Execute AI sessions                                          │
│  • Manage git operations                                        │
│  • Handle authentication                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Session Service (ChannelCoder)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SESSION SERVICE                              │
│                 (ChannelCoder Integration)                       │
│                                                                  │
│  Responsibility: Manage AI session lifecycle                     │
│                                                                  │
│  Core Operations:                                                │
│  • start(config) → Session                                      │
│  • stop(sessionId) → void                                       │
│  • status(sessionId) → SessionStatus                            │
│  • logs(sessionId) → LogStream                                  │
│  • continue(sessionId, feedback) → Session                      │
│                                                                  │
│  Configuration:                                                  │
│  • mode: "implement" | "explore" | "design" | ...              │
│  • environment: Environment                                      │
│  • context: Context                                             │
│  • taskId?: string  // Optional task binding                   │
│                                                                  │
│  Does NOT:                                                       │
│  • Manage tasks                                                 │
│  • Create worktrees                                            │
│  • Define modes (reads from .tasks/.modes/)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Context Service

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTEXT SERVICE                              │
│              (AI Context - Information Gathering)                │
│                                                                  │
│  Responsibility: Gather and prepare AI context                  │
│                                                                  │
│  Core Operations:                                                │
│  • prepare(options) → Context                                   │
│  • resolve(reference) → Entity                                  │
│  • search(query) → Entity[]                                    │
│  • buildPrompt(context) → string                                │
│                                                                  │
│  Context Sources:                                                │
│  • Task information                                             │
│  • Knowledge base entries                                       │
│  • Related entities (@task, #pattern)                          │
│  • Historical decisions                                         │
│  • Mode-specific memory                                         │
│                                                                  │
│  Does NOT:                                                       │
│  • Execute sessions                                             │
│  • Modify data (read-only)                                     │
│  • Manage execution environments                                │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Service

```
┌─────────────────────────────────────────────────────────────────┐
│                   ENVIRONMENT SERVICE                            │
│           (Execution Environment Management)                     │
│                                                                  │
│  Responsibility: Manage where code executes                     │
│                                                                  │
│  Core Operations:                                                │
│  • prepare(config) → Environment                                │
│  • cleanup(environmentId) → void                                │
│  • list() → Environment[]                                       │
│                                                                  │
│  Environment Types:                                              │
│  • Worktree: Git branch isolation                              │
│  • Docker: Container isolation                                  │
│  • CI: Cloud runner                                            │
│  • Direct: No isolation                                        │
│                                                                  │
│  Configuration:                                                  │
│  • type: "worktree" | "docker" | "ci" | "direct"              │
│  • branch?: string                                              │
│  • image?: string                                               │
│  • resources?: ResourceLimits                                  │
│                                                                  │
│  Does NOT:                                                       │
│  • Run AI sessions                                              │
│  • Manage task data                                            │
│  • Handle authentication                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Orchestration Service

```
┌─────────────────────────────────────────────────────────────────┐
│                  ORCHESTRATION SERVICE                           │
│              (Workflow Coordination)                             │
│                                                                  │
│  Responsibility: Coordinate multi-step workflows                 │
│                                                                  │
│  Core Operations:                                                │
│  • execute(workflow) → WorkflowExecution                        │
│  • pause(executionId) → void                                    │
│  • resume(executionId) → void                                   │
│  • status(executionId) → ExecutionStatus                        │
│                                                                  │
│  Uses Other Services:                                            │
│  • Environment.prepare() for execution context                  │
│  • Context.prepare() for AI information                        │
│  • Session.start() for AI execution                            │
│  • Task.update() for progress tracking                         │
│                                                                  │
│  Workflow Features:                                              │
│  • Sequential & parallel execution                              │
│  • Conditional branching                                        │
│  • Approval gates                                               │
│  • Error handling & retry                                       │
│                                                                  │
│  Does NOT:                                                       │
│  • Implement services (only coordinates)                        │
│  • Store task data                                              │
│  • Manage environments directly                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Storage Service

```
┌─────────────────────────────────────────────────────────────────┐
│                     STORAGE SERVICE                              │
│              (Task Storage Management)                           │
│                                                                  │
│  Responsibility: Manage task storage location & access           │
│                                                                  │
│  Core Operations:                                                │
│  • getStoragePath(projectPath) → string                         │
│  • resolveTaskPath(projectPath, taskId) → string               │
│  • encodeProjectPath(path) → string                             │
│  • decodeProjectPath(encoded) → string                          │
│  • ensureStorageStructure(projectPath) → void                  │
│                                                                  │
│  Storage Modes:                                                  │
│  • Legacy: .tasks/ in repository                                │
│  • Centralized: ~/.scopecraft/projects/<encoded-path>/         │
│                                                                  │
│  Key Components:                                                 │
│  • TaskStoragePathEncoder: Path encoding/decoding               │
│  • ConfigurationManager: Storage mode configuration             │
│  • storage-utils: Path resolution utilities                     │
│                                                                  │
│  Does NOT:                                                       │
│  • Read/write task content (Task Service handles that)         │
│  • Manage git operations                                        │
│  • Handle authentication                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Service Interactions

```
┌─────────────────────────────────────────────────────────────────┐
│              SERVICE INTERACTION EXAMPLE                         │
│         "Implement AUTH-001 autonomously"                        │
│                                                                  │
│  Orchestration Service                                          │
│       │                                                         │
│       ├─1→ Environment.prepare({                                │
│       │      type: "docker",                                    │
│       │      worktree: "feature/auth-001"                      │
│       │    })                                                   │
│       │                                                         │
│       ├─2→ Context.prepare({                                    │
│       │      taskId: "AUTH-001",                                │
│       │      mode: "implement",                                │
│       │      depth: "full"                                     │
│       │    })                                                   │
│       │                                                         │
│       ├─3→ Session.start({                                      │
│       │      mode: "implement",                                 │
│       │      environment: env,                                  │
│       │      context: ctx,                                      │
│       │      taskId: "AUTH-001"                                │
│       │    })                                                   │
│       │                                                         │
│       └─4→ Task.update("AUTH-001", {                           │
│             section: "log",                                     │
│             content: "Session started..."                       │
│           })                                                    │
│                                                                  │
│  Key: Services don't call each other directly                   │
│       Orchestration coordinates the flow                        │
└─────────────────────────────────────────────────────────────────┘
```

## Service Boundaries

### What Services Own

| Service | Owns | Does Not Own |
|---------|------|--------------|
| Task | Task data, sections, workflow states | Session execution, git operations |
| Session | AI session lifecycle, logs | Task data, execution environments |
| Context | Information gathering, prompt building | Data modification, session execution |
| Environment | Execution contexts, isolation | AI sessions, task management |
| Orchestration | Workflow coordination, queuing | Service implementation, data storage |
| Storage | Path resolution, storage mode logic | Task content, file I/O operations |

### Communication Rules

1. **No Direct Database Access**: Services access only their own data
2. **Public APIs Only**: Services communicate through defined interfaces
3. **Event-Driven Updates**: Services emit events, don't poll
4. **Stateless Operations**: Each operation is independent

## Extension Points

### Adding New Services

New services can be added by:
1. Defining clear responsibility
2. Creating public interface
3. Implementing service contract
4. Registering with service registry

Example: Adding a Metrics Service
```typescript
interface MetricsService {
  track(event: MetricEvent): void
  query(filter: MetricFilter): Metric[]
  aggregate(metrics: Metric[]): Summary
}
```

### Replacing Existing Services

Services can be replaced by:
1. Implementing same interface
2. Maintaining contract semantics
3. Supporting same events
4. Handling migration if needed

## Implementation Guidelines

### Service Structure

```
src/services/
├── task/
│   ├── task.service.ts        # Service implementation
│   ├── task.interface.ts      # Public interface
│   ├── task.types.ts          # Domain types
│   └── task.test.ts           # Service tests
├── session/
│   ├── session.service.ts
│   ├── session.interface.ts
│   ├── session.types.ts
│   └── session.test.ts
├── storage/
│   ├── storage.service.ts
│   ├── TaskStoragePathEncoder.ts
│   ├── storage-utils.ts
│   └── storage.test.ts
└── [other services...]
```

### Interface Example

```typescript
// task.interface.ts
export interface TaskService {
  create(input: CreateTaskInput): Promise<Task>
  get(id: string): Promise<Task | null>
  update(id: string, updates: TaskUpdates): Promise<Task>
  list(filter?: TaskFilter): Promise<Task[]>
  move(id: string, workflow: WorkflowState): Promise<Task>
}

// Service registration
export const taskService: TaskService = new TaskServiceImpl()
```

### Testing Services

Each service should be tested in isolation:
```typescript
describe('TaskService', () => {
  it('creates tasks with required sections', async () => {
    const task = await taskService.create({
      title: 'Test task',
      type: 'feature'
    })
    
    expect(task.sections).toContain('instruction')
    expect(task.sections).toContain('tasks')
    expect(task.sections).toContain('deliverable')
    expect(task.sections).toContain('log')
  })
})
```

## Next Steps

- Review [System Architecture](system-architecture.md) for complete system view
- See [MCP Architecture](mcp-architecture.md) for service exposure via MCP
- Explore [Orchestration Architecture](orchestration-architecture.md) for workflow patterns