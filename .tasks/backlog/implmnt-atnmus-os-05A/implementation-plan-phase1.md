# Autonomous Orchestration System - Phase 1 Implementation Plan

## Overview

This document focuses on Phase 1 implementation: establishing a Docker-enabled unified session management core that leverages existing ChannelCoder capabilities and the `my-claude:authenticated` Docker image.

## Phase 1 Goals (2 weeks)

1. Create unified session management system
2. Enable Docker mode for autonomous execution
3. Implement basic queue management
4. Integrate stream monitoring for real-time observation and intervention
5. UI/UX review for improvements based on new capabilities

## Current State

### Session Types Matrix

| Feature | Autonomous | Interactive | Planning | Orchestration | Worktree |
|---------|------------|-------------|----------|---------------|----------|
| **ChannelCoder Sessions** | ✅ | ❌ (TMux) | ✅ | ✅ | ✅ |
| **Docker Mode Support** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Queue Management** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Unified Interface** | ❌ | ❌ | ❌ | ❌ | ❌ |

## Architecture

```
src/core/orchestration/
├── session-manager.ts          # Unified session management
├── executors/
│   ├── base-executor.ts        # Shared executor interface
│   └── autonomous.ts           # Docker-enabled autonomous executor
├── queue/
│   └── simple-queue.ts         # Basic FIFO with limits
├── monitoring/
│   └── stream-monitor.ts       # ChannelCoder stream parser integration
└── types.ts                    # Shared type definitions
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
    worktree?: string
    // ... other environment settings
  }
  
  // Session management
  channelCoderSession?: Session
  logFile?: string
  status: SessionStatus
  
  // Monitoring metadata
  metadata: {
    messages?: number
    lastActivity?: Date
    lastMessage?: string
    toolsUsed?: ToolUsageRecord[]
    // ... other tracking data
  }
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
    // 1. Create ChannelCoder session with auto-save
    // 2. Configure Docker with my-claude:authenticated image
    // 3. Set up appropriate volume mounts (workspace, SSH keys)
    // 4. Configure worktree if specified
    // 5. Start detached execution with stream-json output
    // 6. Return unified session record for monitoring
    
    // Example Docker configuration structure:
    const dockerConfig = {
      docker: {
        image: 'my-claude:authenticated',
        mounts: [
          // Mount workspace and necessary directories
        ]
      }
    };
    
    // Use channelcoder.session() and session.detached()
    // with appropriate configuration
  }
}
```

### 3. Simple Queue Manager (Design)

```typescript
// Queue design principles:
// - FIFO processing with configurable limits
// - Prevent resource exhaustion (max 3 concurrent)
// - Basic overflow handling (max 10 queued)
// - Automatic processing of next item when slot available

class SimpleQueue {
  // Core properties:
  // - queue array for pending items
  // - running count for active sessions
  // - configurable limits
  
  async enqueue(item: QueueItem) {
    // 1. Check if queue is full
    // 2. If slots available, execute immediately
    // 3. Otherwise, add to queue
    // 4. Return status (starting/queued with position)
  }
  
  private async processNext() {
    // Called when a session completes
    // Dequeue and execute next item if available
  }
}
```

### 4. Stream Monitor Integration (Real-time Observation)

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
- [ ] Set up exports in `src/core/index.ts`
- [ ] Create base executor abstract class

### Task 2: Session Manager (Day 3-4)
- [ ] Implement `UnifiedSessionManager` class
- [ ] Create session registry with in-memory storage
- [ ] Add session lifecycle methods (create, get, list, cancel)
- [ ] Implement session ID generation

### Task 3: Autonomous Executor (Day 5-6)
- [ ] Implement `AutonomousExecutor` with Docker support
- [ ] Add worktree support for branch isolation
- [ ] Create prompt file integration
- [ ] Handle session continuation with feedback

### Task 4: Queue Implementation (Day 7-8)
- [ ] Create `SimpleQueue` with FIFO logic
- [ ] Add concurrency limits (default: 3)
- [ ] Implement queue overflow handling
- [ ] Add queue status methods

### Task 5: Monitoring Integration (Day 9-10)
- [ ] Integrate ChannelCoder's `monitorLog` for real-time observation
- [ ] Track AI actions and tool usage for intervention decisions
- [ ] Implement error classification for severity assessment
- [ ] Create event emitter for UI live updates
- [ ] Add activity tracking (last message, tools used)
- [ ] Implement cleanup on session completion

### Task 6: Update Existing Code (Day 11-12)
- [ ] Update autonomous handlers to use new core
- [ ] Add error handling
- [ ] Basic UI integration (keep current UI functional)

### Task 7: UI/UX Review (Day 13)
- [ ] UX designer reviews current autonomous monitoring UI
- [ ] Design improvements based on new capabilities (Docker mode, worktrees, intervention)
- [ ] Mockups for enhanced monitoring dashboard

### Task 8: Testing & Documentation (Day 14)
- [ ] Basic tests to ensure it works
- [ ] Test with real Docker execution
- [ ] Quick documentation of how to use it

## Success Criteria

1. **Functional Requirements**
   - [ ] Autonomous sessions run in Docker with full permissions
   - [ ] Queue prevents resource exhaustion
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