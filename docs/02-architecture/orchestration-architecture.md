---
title: "Orchestration & Automation Architecture"
description: "How AI sessions are coordinated and automated"
version: "1.0"
status: "draft"
category: "architecture"
updated: "2025-01-07"
authors: ["system"]
related:
  - system-architecture.md
  - service-architecture.md
  - ../specs/orchestration-automation-vision.md
---

# Orchestration & Automation Architecture

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Architecture Overview](#architecture-overview)
4. [Session Types](#session-types)
5. [Execution Flow](#execution-flow)
6. [Storage Architecture](#storage-architecture)
7. [Implementation Phases](#implementation-phases)
8. [Integration Points](#integration-points)
9. [Future Vision](#future-vision)

## Overview

The orchestration system coordinates AI sessions across different execution environments, enabling everything from simple task automation to complex multi-agent workflows. It acts as a coordinator, not a monolithic system, composing existing services to achieve automation goals.

**Key Principle**: The orchestration service coordinates but doesn't implement. It uses Task Service for data, Session Service for AI execution, Environment Service for isolation, and Context Service for information gathering.

## Core Concepts

### Orchestration vs Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│               ORCHESTRATION SERVICE                              │
│          (Coordinates services, doesn't implement them)          │
│                                                                  │
│  What it DOES:                    What it DOESN'T DO:           │
│  • Coordinate workflows           • Manage task data             │
│  • Queue operations              • Run AI sessions               │
│  • Handle retries                • Create worktrees              │
│  • Monitor progress              • Store knowledge               │
│  • Chain operations              • Implement services            │
└─────────────────────────────────────────────────────────────────┘
```

### Progressive Autonomy Levels

```
Manual → Guided → Supervised → Autonomous
  │        │          │            │
  │        │          │            └─ AI completes independently
  │        │          └───────────── AI works with checkpoints
  │        └──────────────────────── Human drives, AI assists
  └───────────────────────────────── Traditional development
```

## Architecture Overview

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                           │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Workflow   │    Queue     │   Monitor    │   Storage     │ │
│  │   Engine     │   Manager    │   System     │   Adapter     │ │
│  │              │              │              │               │ │
│  │ • Define     │ • FIFO/Pri   │ • Streams    │ • Sessions    │ │
│  │ • Execute    │ • Limits     │ • Events     │ • State       │ │
│  │ • Control    │ • Retry      │ • Alerts     │ • History     │ │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘ │
└─────────┼──────────────┼──────────────┼──────────────┼─────────┘
          │              │              │              │
          └──────────────┴──────────────┴──────────────┘
                                 │
                         Uses Services Below
                                 │
┌─────────────────────────────────────────────────────────────────┐
│  Task Service │ Session Service │ Context Service │ Env Service │
└─────────────────────────────────────────────────────────────────┘
```

### Unified Session Model

```typescript
interface UnifiedSession {
  id: string
  mode: SessionMode
  taskId?: string
  
  // Environment configuration
  environment: {
    type: 'docker' | 'worktree' | 'ci' | 'direct'
    path: string           // Always has execution context
    config: EnvironmentConfig
  }
  
  // Session state
  status: 'queued' | 'starting' | 'running' | 'completed' | 'failed'
  startedAt?: Date
  completedAt?: Date
  
  // Monitoring data
  monitoring: {
    messages: number
    lastActivity: Date
    toolsUsed: ToolUsage[]
    errors: ErrorRecord[]
  }
}
```

## Session Types

### Current State (Proof of Concepts)

```
┌─────────────────────────────────────────────────────────────────┐
│                   CURRENT SCRIPTS                                │
│                                                                  │
│  auto          → Autonomous execution experiment                │
│  plan          → Planning mode with channelcoder                │
│  dispatch      → TMux-based parallel sessions                   │
│  implement     → Implementation mode helper                     │
│                                                                  │
│  These proved the concepts, now we unify them                  │
└─────────────────────────────────────────────────────────────────┘
```

### Unified Session Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSION TYPES                                 │
│                                                                  │
│  AUTONOMOUS                      DISPATCH                        │
│  ──────────                      ────────                        │
│  • Docker isolated               • TMux windows                  │
│  • Background execution          • Parallel interactive          │
│  • Queue managed                 • Human accessible              │
│  • Stream monitored              • Task-focused                  │
│                                                                  │
│  INTERACTIVE                     PLANNING                        │
│  ────────────                    ────────                        │
│  • Direct terminal               • One-shot execution            │
│  • No isolation                  • Specialized prompts           │
│  • Human-driven                  • Document generation           │
│  • Immediate feedback            • No continuation               │
└─────────────────────────────────────────────────────────────────┘
```

## Execution Flow

### Autonomous Task Execution

```
┌─────────────────────────────────────────────────────────────────┐
│              AUTONOMOUS EXECUTION FLOW                           │
│                                                                  │
│  1. Request: "Implement AUTH-001 autonomously"                  │
│                                                                  │
│  2. Environment Setup                                           │
│     └─→ Environment.prepare({                                   │
│           type: "docker",                                       │
│           worktree: "feature/auth-001"                         │
│         })                                                      │
│                                                                  │
│  3. Context Gathering                                           │
│     └─→ Context.prepare({                                       │
│           taskId: "AUTH-001",                                   │
│           mode: "implement"                                     │
│         })                                                      │
│                                                                  │
│  4. Session Creation                                            │
│     └─→ Session.start({                                         │
│           mode: "implement",                                    │
│           environment: dockerEnv,                               │
│           context: taskContext                                  │
│         })                                                      │
│                                                                  │
│  5. Monitoring & Updates                                        │
│     ├─→ Monitor.stream(session.id)                              │
│     └─→ Task.update("AUTH-001", { section: "log", ... })      │
│                                                                  │
│  6. Completion                                                  │
│     └─→ Session.complete(session.id)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Dispatch (Parallel Interactive)

```
┌─────────────────────────────────────────────────────────────────┐
│                 DISPATCH EXECUTION FLOW                          │
│                                                                  │
│  1. Request: "Work on AUTH-001, AUTH-002, AUTH-003 in parallel"│
│                                                                  │
│  2. For each task:                                              │
│     ├─→ Environment.prepare({ type: "worktree", ... })         │
│     ├─→ Create TMux window                                     │
│     └─→ Start channelcoder with mode                           │
│                                                                  │
│  3. Result: Three TMux windows, each in own worktree           │
│     • scopecraft:AUTH-001-implement                             │
│     • scopecraft:AUTH-002-implement                             │
│     • scopecraft:AUTH-003-implement                             │
│                                                                  │
│  Human can switch between windows, AI maintains context         │
└─────────────────────────────────────────────────────────────────┘
```

## Storage Architecture

### Hybrid Storage Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE ARCHITECTURE                          │
│                                                                  │
│  Runtime State (~/.scopecraft/)     Historical State (.tasks/)  │
│  ──────────────────────────────     ──────────────────────────  │
│  • Active sessions                  • Completed sessions         │
│  • Queue status                     • Decisions made             │
│  • Monitoring data                  • Outcomes achieved          │
│  • User preferences                 • Learnings captured         │
│                                                                  │
│  Not in git                         In git                      │
│  Machine-specific                   Shareable                    │
│  Ephemeral                          Permanent                    │
└─────────────────────────────────────────────────────────────────┘

~/.scopecraft/
├── sessions/
│   ├── active.json              # Current session registry
│   └── {session-id}/
│       ├── metadata.json
│       ├── stream.log
│       └── monitoring.json
├── config/
│   └── orchestration.json       # User preferences
└── cache/
    └── contexts/                # Cached context preparations
```

### Storage Adapter Pattern

```typescript
interface StorageAdapter {
  // Runtime operations
  saveSession(session: Session): Promise<void>
  getSession(id: string): Promise<Session | null>
  listSessions(filter?: SessionFilter): Promise<Session[]>
  
  // Historical operations  
  archiveSession(session: Session): Promise<void>
  getArchivedSessions(taskId: string): Promise<Session[]>
}

// Enable local and cloud execution
const adapter = process.env.CI 
  ? new CIStorageAdapter(github)     // Store in PR
  : new LocalStorageAdapter()         // Store in ~/.scopecraft/
```

## Implementation Phases

### Phase 1: Core Foundation (2 weeks)

**Goal**: Unify existing scripts under common session management

```
Week 1:
- [ ] Storage adapter interface and local implementation
- [ ] Environment service with worktree support  
- [ ] Basic session manager
- [ ] Unified session interface

Week 2:
- [ ] Docker executor for autonomous
- [ ] TMux executor for dispatch
- [ ] Simple queue with limits
- [ ] Basic monitoring integration
```

### Phase 2: Enhanced Capabilities (2 weeks)

**Goal**: Production-ready orchestration

```
Week 3:
- [ ] Priority queue implementation
- [ ] Retry and error handling
- [ ] Stream monitoring dashboard
- [ ] MCP server for orchestration

Week 4:
- [ ] Workflow engine basics
- [ ] Approval gates
- [ ] Multi-step workflows
- [ ] Testing and documentation
```

### Phase 3: Advanced Features (Future)

- Multi-agent coordination
- Intelligent queue management
- Pattern learning
- Cloud execution via CI

## Integration Points

### With Existing Tools

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION POINTS                            │
│                                                                  │
│  ChannelCoder                    Worktree Scripts               │
│  ────────────                    ────────────────               │
│  • Provides session API          • tw-start                     │
│  • Handles modes                 • tw-feat-start                │
│  • Stream output                 • Git operations                │
│                                                                  │
│  Task System                     Mode System                    │
│  ───────────                     ───────────                    │
│  • Read task context             • .tasks/.modes/               │
│  • Update progress               • Mode prompts                  │
│  • Track relations               • Behavior config               │
└─────────────────────────────────────────────────────────────────┘
```

### MCP Interface

```typescript
// Orchestration MCP methods
orchestration_start(workflow: WorkflowConfig): Promise<Execution>
orchestration_status(executionId: string): Promise<Status>
orchestration_cancel(executionId: string): Promise<void>

session_create(config: SessionConfig): Promise<Session>
session_list(filter?: SessionFilter): Promise<Session[]>
session_logs(sessionId: string): Promise<LogEntry[]>
session_continue(sessionId: string, feedback: string): Promise<void>
```

## Future Vision

### Intelligent Orchestration

```
// Future: AI determines optimal execution strategy
await orchestrator.plan({
  goal: "Implement authentication system",
  constraints: {
    deadline: "2024-02-01",
    budget: 50.00,
    quality: "production"
  }
})

// System breaks down into tasks, schedules execution,
// monitors progress, adapts strategy
```

### Multi-Agent Collaboration

```
// Future: Specialized agents working together
await orchestrator.deployTeam({
  feature: "payment-processing",
  agents: [
    { role: "architect", model: "opus" },
    { role: "implementer", model: "sonnet", count: 2 },
    { role: "tester", model: "haiku" }
  ]
})
```

## Learnings from Claude-Code-Flow

While Scopecraft already has robust monitoring through ChannelCoder's parser and session monitoring, there are valuable patterns from Claude-Code-Flow that could enhance our orchestration:

### 1. Resource Pooling for Worktrees

Adapt terminal pooling pattern for worktree management:

```typescript
class WorktreePool {
  private available: Set<string> = new Set();
  private inUse: Map<string, SessionInfo> = new Map();
  private readonly maxWorktrees = 5;
  
  async acquire(branch: string): Promise<string> {
    // Reuse existing worktree if available
    const existing = this.findAvailable(branch);
    if (existing) return existing;
    
    // Or create new up to limit
    if (this.inUse.size < this.maxWorktrees) {
      return await this.createWorktree(branch);
    }
    
    // Otherwise recycle oldest
    return await this.recycleOldest();
  }
}
```

### 2. Circuit Breaker for Session Resilience

Prevent cascade failures with circuit breakers:

```typescript
class SessionCircuitBreaker {
  private failures = new Map<string, number>();
  private readonly threshold = 3;
  
  async executeWithBreaker(
    sessionConfig: SessionConfig,
    executor: () => Promise<void>
  ): Promise<void> {
    const key = `${sessionConfig.mode}-${sessionConfig.taskId}`;
    
    if (this.isOpen(key)) {
      throw new Error(`Circuit open for ${key}, too many failures`);
    }
    
    try {
      await executor();
      this.recordSuccess(key);
    } catch (error) {
      this.recordFailure(key);
      throw error;
    }
  }
}
```

### 3. Priority Queue Aligned with Task System

Leverage existing task priorities for queue management:

```typescript
class TaskAlignedQueue {
  private queues = new Map([
    ['high', []],     // Maps to Scopecraft's task priorities
    ['medium', []],
    ['low', []]
  ]);
  
  async enqueue(session: SessionConfig): Promise<void> {
    const task = await taskService.get(session.taskId);
    const priority = task.frontmatter.priority || 'medium';
    this.queues.get(priority).push(session);
  }
}
```

### 4. Conflict Detection for Parallel Sessions

Essential for dispatch mode with multiple worktrees:

```typescript
class WorktreeConflictResolver {
  async detectConflicts(sessions: ActiveSession[]): Promise<Conflict[]> {
    const conflicts = [];
    
    // Check for file conflicts between sessions
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const sharedFiles = this.findSharedFiles(
          sessions[i].modifiedFiles,
          sessions[j].modifiedFiles
        );
        
        if (sharedFiles.length > 0) {
          conflicts.push({
            type: 'file',
            sessions: [sessions[i].id, sessions[j].id],
            resources: sharedFiles
          });
        }
      }
    }
    
    return conflicts;
  }
}
```

### 5. Session State Machine

Formalize session lifecycle management:

```typescript
enum SessionState {
  QUEUED = 'queued',
  PREPARING = 'preparing',  // Setting up worktree/docker
  RUNNING = 'running',
  PAUSED = 'paused',       // For human intervention
  COMPLETED = 'completed',
  FAILED = 'failed'
}

class SessionStateMachine {
  private transitions = {
    [SessionState.QUEUED]: [SessionState.PREPARING],
    [SessionState.PREPARING]: [SessionState.RUNNING, SessionState.FAILED],
    [SessionState.RUNNING]: [SessionState.PAUSED, SessionState.COMPLETED, SessionState.FAILED],
    [SessionState.PAUSED]: [SessionState.RUNNING, SessionState.FAILED],
    // Terminal states
    [SessionState.COMPLETED]: [],
    [SessionState.FAILED]: []
  };
  
  canTransition(from: SessionState, to: SessionState): boolean {
    return this.transitions[from]?.includes(to) ?? false;
  }
}
```

### 6. Enhanced Monitoring Integration

Build on existing ChannelCoder monitoring with aggregation:

```typescript
// Extend existing monitoring with cross-session aggregation
class OrchestrationMonitor {
  constructor(
    private channelCoderMonitor: typeof monitoring
  ) {}
  
  async getSystemHealth(): Promise<SystemHealth> {
    const sessions = await this.channelCoderMonitor.listAutonomousSessions();
    
    return {
      activeSessions: sessions.filter(s => s.status === 'running').length,
      queuedSessions: await this.getQueueLength(),
      worktreeCount: await this.getActiveWorktrees(),
      recentFailures: sessions.filter(s => 
        s.status === 'failed' && 
        Date.now() - new Date(s.startTime).getTime() < 3600000
      ).length
    };
  }
}
```

### Implementation Recommendations

1. **Start with Queue Manager** - File-based queue using existing session storage
2. **Add Resource Limits** - Max sessions: 3, Max worktrees: 5
3. **Leverage Existing Monitoring** - Build aggregation on top of ChannelCoder
4. **Simple Retry Logic** - Exponential backoff for failed sessions
5. **Progressive Enhancement** - Start file-based, add complexity as needed

The key insight is that Scopecraft already has robust foundations (ChannelCoder monitoring, session storage, worktree management). The learnings from Claude-Code-Flow should enhance these existing capabilities rather than replace them.

## Key Takeaways

1. **Orchestration coordinates, doesn't implement** - Uses existing services
2. **Start simple, evolve complexity** - Phase 1 unifies current scripts
3. **Worktree-first execution** - All work happens in appropriate branches
4. **Hybrid storage model** - Runtime vs historical separation
5. **Progressive autonomy** - From guided to fully autonomous
6. **Build on existing strengths** - Enhance ChannelCoder monitoring and session storage

## Next Steps

- Review [Implementation Plan Phase 1](../../.tasks/backlog/implmnt-atnmus-os-05A/implementation-plan-phase1.md)
- See [Long-term Vision](../specs/orchestration-automation-vision.md)
- Explore [Service Architecture](service-architecture.md) for service details