# Autonomous Orchestration System - Phase 1 Implementation Plan

## Overview

This document focuses on Phase 1 implementation: establishing a Docker-enabled unified session management core that leverages existing ChannelCoder capabilities and the `my-claude:authenticated` Docker image.

## Phase 1 Goals (2 weeks)

1. Create unified session management system with hybrid storage
2. Enable Docker mode for autonomous execution
3. Support parallel interactive sessions via tmux (dispatch integration)
4. Implement worktree-first execution (all sessions run in appropriate worktree)
5. Implement basic queue management
6. Integrate stream monitoring for real-time observation and intervention
7. UI/UX review for improvements based on new capabilities

## Current State

### Session Types Matrix

| Feature | Autonomous | Interactive | Dispatch | Planning | Orchestration | Worktree |
|---------|------------|-------------|----------|----------|---------------|----------|
| **ChannelCoder Sessions** | ✅ | ❌ (TMux) | ✅ (in TMux) | ✅ | ✅ | ✅ |
| **Docker Mode Support** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Parallel Execution** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Queue Management** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Unified Interface** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Architecture

```
src/core/orchestration/
├── session-manager.ts          # Unified session management
├── executors/
│   ├── base-executor.ts        # Shared executor interface
│   ├── autonomous.ts           # Docker-enabled autonomous executor
│   └── dispatch.ts             # TMux-based parallel interactive sessions
├── queue/
│   └── simple-queue.ts         # Basic FIFO with limits
├── monitoring/
│   └── stream-monitor.ts       # ChannelCoder stream parser integration
├── storage/
│   ├── storage-adapter.ts      # Storage adapter interface
│   └── local-adapter.ts        # ~/.scopecraft/ implementation
├── worktree/
│   └── worktree-resolver.ts    # Find/create appropriate worktrees
└── types.ts                    # Shared type definitions

~/.scopecraft/                  # Runtime state (not in git)
├── sessions/
│   ├── active.json            # Active session registry
│   └── {session-id}/          # Per-session data
│       ├── metadata.json
│       └── stream.log
└── config/
    └── orchestration.json     # User preferences
```

## Core Components

### 1. Unified Session Interface (Conceptual)

```typescript
// Key concepts for the unified session interface:
// - Single interface for all session types
// - Docker configuration for autonomous execution
// - Metadata for monitoring and intervention
// - ChannelCoder session integration

interface UnifiedSession {
  id: string
  mode: SessionMode
  taskId?: string
  parentId?: string
  
  // Environment configuration
  environment: {
    docker: boolean
    dockerImage: string         // 'my-claude:authenticated'
    worktree: string            // Required! Every session runs in a worktree
    worktreePath: string        // Absolute path to the worktree
    // ... other environment settings
  }
  
  // Session management
  channelCoderSession?: Session
  logFile?: string
  status: SessionStatus
  
  // Storage location
  storagePath: string           // ~/.scopecraft/sessions/{id}/
  
  // Monitoring metadata
  metadata: {
    messages?: number
    lastActivity?: Date
    lastMessage?: string
    toolsUsed?: ToolUsageRecord[]
    // ... other tracking data
  }
}

enum SessionMode {
  AUTONOMOUS = 'autonomous',    // Docker-based background execution
  DISPATCH = 'dispatch'         // TMux-based parallel interactive
}
```

### 2. Docker-Enabled Autonomous Executor (Approach)

```typescript
// Key implementation considerations:
// - Extends a base executor for shared functionality
// - Uses ChannelCoder's session API with Docker configuration
// - Supports optional worktree isolation
// - Returns unified session record

class AutonomousExecutor extends BaseExecutor {
  async create(options: CreateSessionOptions) {
    // 1. Resolve worktree for task (find or create)
    const worktree = await this.worktreeResolver.resolveForTask(options.taskId);
    
    // 2. Create ChannelCoder session with auto-save
    // 3. Configure Docker with my-claude:authenticated image
    // 4. Mount the specific worktree as workspace
    // 5. Start detached execution with stream-json output
    // 6. Save session info to ~/.scopecraft/sessions/
    // 7. Return unified session record
    
    // Example Docker configuration:
    const dockerConfig = {
      docker: {
        image: 'my-claude:authenticated',
        mounts: [
          `${worktree.path}:/workspace:rw`,  // Mount worktree!
          `${homedir()}/.ssh:/home/claude/.ssh:ro`
        ]
      }
    };
    
    // Worktree is always used, never main branch
  }
}
```

### 3. Dispatch Executor for TMux Sessions (Approach)

```typescript
// Key implementation considerations:
// - Creates tmux windows for parallel interactive sessions
// - Each task gets its own tmux window
// - Supports worktree integration for isolated development
// - Allows human interaction while maintaining context

class DispatchExecutor extends BaseExecutor {
  async create(options: CreateSessionOptions) {
    // 1. Resolve worktree for task (find or create)
    const worktree = await this.worktreeResolver.resolveForTask(options.taskId);
    
    // 2. Check/create tmux session (e.g., "scopecraft")
    // 3. Create tmux window named "{taskId}-{mode}"
    // 4. Change to worktree directory in the window
    // 5. Start channelcoder in that worktree
    // 6. Save session info to ~/.scopecraft/sessions/
    // 7. Return unified session record
    
    // Key differences from autonomous:
    // - No Docker (human needs direct access)
    // - Interactive terminal session
    // - Still requires worktree (no main branch work!)
    // - Can run multiple in parallel
  }
  
  async attach(sessionId: string) {
    // Load session info from ~/.scopecraft/
    // Attach to tmux window in correct worktree
  }
}
```

### 4. Simple Queue Manager (Design)

```typescript
// Queue design principles:
// - FIFO processing with configurable limits
// - Prevent resource exhaustion (max 3 concurrent autonomous)
// - Dispatch sessions don't count against queue (interactive)
// - Basic overflow handling (max 10 queued)

class SimpleQueue {
  // Core properties:
  // - Separate limits for autonomous vs dispatch
  // - Autonomous: queued and limited (resource intensive)
  // - Dispatch: unlimited (human manages resources)
  
  async enqueue(item: QueueItem) {
    // Only queue autonomous sessions
    if (item.mode === SessionMode.DISPATCH) {
      return { status: 'starting', session: await this.execute(item) };
    }
    
    // Queue logic for autonomous sessions
    // Check limits, queue if needed
  }
}
```

### 5. Storage Adapter (Hybrid Storage)

```typescript
// Storage adapter for runtime state in ~/.scopecraft/
// Prepares for future CI/cloud execution

interface StorageAdapter {
  saveSession(session: UnifiedSession): Promise<void>
  getSession(id: string): Promise<UnifiedSession | null>
  listSessions(): Promise<UnifiedSession[]>
  updateStatus(id: string, status: SessionStatus): Promise<void>
}

class LocalStorageAdapter implements StorageAdapter {
  private basePath = path.join(homedir(), '.scopecraft');
  
  async saveSession(session: UnifiedSession) {
    // Save to ~/.scopecraft/sessions/{id}/metadata.json
    // Create directory structure if needed
    // Store session metadata, worktree info, etc.
  }
  
  // Archive completed sessions to git
  async archiveSession(session: UnifiedSession) {
    // Copy important artifacts to .tasks/archive/
    // Create summary.md with decisions/outcomes
  }
}
```

### 6. Worktree Resolver (Task-Worktree Binding)

```typescript
// Ensures every session runs in appropriate worktree
// Convention: feature/auth-05A branch → *-auth-05A tasks

class WorktreeResolver {
  async resolveForTask(taskId: string): Promise<WorktreeInfo> {
    // 1. Check if worktree exists by convention
    const candidates = await this.findByConvention(taskId);
    
    if (candidates.length === 1) {
      return this.getWorktreeInfo(candidates[0]);
    }
    
    // 2. Create worktree if needed
    const branch = this.generateBranchName(taskId);
    return await this.createWorktree(branch);
  }
  
  private findByConvention(taskId: string): Promise<string[]> {
    // Extract suffix (e.g., "05A" from "implement-auth-05A")
    // Find worktrees matching pattern
  }
}
```

### 7. Stream Monitor Integration (Real-time Observation)

```typescript
// Monitoring goals:
// - Observe what AI is doing in real-time
// - Enable intervention when AI goes off track
// - Track tool usage patterns
// - Classify errors by severity

class StreamMonitor {
  async monitorSession(session: UnifiedSession) {
    // Use ChannelCoder's monitorLog function
    const cleanup = monitorLog(session.logFile, (event) => {
      // Key monitoring actions:
      
      // 1. Track AI messages and activity
      //    - Update last activity timestamp
      //    - Store recent messages for context
      
      // 2. Monitor tool usage (critical for intervention)
      //    - Which tools are being used
      //    - What inputs are provided
      //    - Detect potentially dangerous operations
      
      // 3. Error tracking and classification
      //    - Identify critical errors (permission denied)
      //    - Warnings (file not found)
      //    - Info level issues
      
      // 4. Emit events for UI updates
      //    - Real-time activity stream
      //    - Tool usage notifications
      //    - Error alerts
    });
    
    // Store cleanup function for session termination
  }
}
```

## Implementation Tasks

### Task 1: Core Module Structure (Day 1-2)
- [ ] Create folder structure in `src/core/orchestration/`
- [ ] Define TypeScript interfaces in `types.ts`
- [ ] Create ~/.scopecraft directory structure
- [ ] Set up exports in `src/core/index.ts`
- [ ] Create base executor abstract class
- [ ] Define storage adapter interface

### Task 2: Storage & Worktree (Day 3-4)
- [ ] Implement `LocalStorageAdapter` for ~/.scopecraft/
- [ ] Implement `WorktreeResolver` with convention-based detection
- [ ] Update task-crud to be worktree-aware
- [ ] Create session archival logic for completed sessions

### Task 3: Session Manager (Day 5-6)
- [ ] Implement `UnifiedSessionManager` class
- [ ] Integrate with storage adapter
- [ ] Add session lifecycle methods (create, get, list, cancel)
- [ ] Ensure all sessions have worktree assignment

### Task 4: Session Executors (Day 7-9)
- [ ] Implement `AutonomousExecutor` with Docker + worktree
- [ ] Implement `DispatchExecutor` with TMux + worktree
- [ ] Integrate worktree resolver in both executors
- [ ] Create prompt file integration
- [ ] Handle session continuation for autonomous
- [ ] Handle attach/detach for dispatch sessions

### Task 5: Queue Implementation (Day 10)
- [ ] Create `SimpleQueue` with FIFO logic
- [ ] Add concurrency limits for autonomous (default: 3)
- [ ] Skip queue for dispatch sessions (unlimited)
- [ ] Implement queue overflow handling
- [ ] Add queue status methods

### Task 6: Monitoring Integration (Day 11)
- [ ] Integrate ChannelCoder's `monitorLog` for real-time observation
- [ ] Track AI actions and tool usage for intervention decisions
- [ ] Implement error classification for severity assessment
- [ ] Create event emitter for UI live updates
- [ ] Add activity tracking (last message, tools used)
- [ ] Implement cleanup on session completion

### Task 7: Update Existing Code (Day 12)
- [ ] Update autonomous handlers to use new core
- [ ] Add error handling
- [ ] Basic UI integration (keep current UI functional)

### Task 8: UI/UX Review (Day 13)
- [ ] UX designer reviews current autonomous monitoring UI
- [ ] Design improvements based on new capabilities (Docker mode, worktrees, intervention)
- [ ] Consider multi-worktree dashboard view
- [ ] Mockups for enhanced monitoring dashboard

### Task 9: Testing & Documentation (Day 14)
- [ ] Basic tests to ensure it works
- [ ] Test with real Docker execution
- [ ] Test worktree resolution and creation
- [ ] Quick documentation of how to use it

## Success Criteria

1. **Functional Requirements**
   - [ ] All sessions run in appropriate worktrees (never main branch)
   - [ ] Autonomous sessions run in Docker with worktree mounted
   - [ ] Dispatch sessions run in tmux in correct worktree
   - [ ] Runtime state stored in ~/.scopecraft/, not git
   - [ ] Queue prevents resource exhaustion for autonomous
   - [ ] Real-time monitoring shows AI progress and actions
   - [ ] Intervention possible when AI goes off track
   - [ ] UI/UX improvements designed based on new capabilities

2. **Performance Requirements**
   - [ ] Session start time <3 seconds
   - [ ] Queue operations <100ms
   - [ ] Monitor updates in real-time

3. **Quality Requirements**
   - [ ] Basic tests for core functionality
   - [ ] Error handling for common cases

## Implementation Approach

Direct replacement:
1. Build the new core module
2. Update the autonomous handlers to use it
3. Test it works
4. Done

## Dependencies

- ChannelCoder SDK (existing)
- Docker with `my-claude:authenticated` image
- Node.js fs/path modules
- EventEmitter for compatibility

## Risks & Mitigations

1. **Docker Performance**
   - Risk: Slow container startup
   - Mitigation: Image is already pulled and authenticated

2. **Queue Memory Usage**
   - Risk: Queue grows unbounded
   - Mitigation: Hard limit of 10 items, reject when full

This Phase 1 implementation provides the foundation for unified session management with Docker support, setting the stage for future enhancements described in the long-term vision document.