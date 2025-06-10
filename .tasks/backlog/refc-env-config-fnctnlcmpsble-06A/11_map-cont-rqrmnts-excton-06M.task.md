# Map dual-context requirements across all execution scenarios

---
type: chore
status: done
area: core
assignee: research-agent
tags:
  - 'team:architecture'
  - 'expertise:researcher'
  - 'execution:autonomous'
  - 'parallel-group:research'
---


## Instruction
Map all dual-context requirements across different execution scenarios to design the proper functional API that handles both execution context (where code runs) and project context (where data lives).

### Context Scenarios to Map

1. **Main Project Execution**
   - Running from main project directory
   - All data (tasks, sessions, config) in same location
   - Simple single-context scenario

2. **Worktree Execution**
   - Running from `.worktrees/{project}.worktrees/{taskId}`
   - Tasks/docs should be local (worktree)
   - Sessions should be global (main project) for cross-worktree monitoring
   - Config should be global (main project)
   - **CRITICAL**: Orchestration dispatch should inherit parent execution context

3. **Container/Docker Execution**
   - Running inside container with mounted volumes
   - Path mapping considerations
   - Volume mount strategies

4. **CI/Remote Execution**
   - Running in CI environment
   - Temporary directories
   - Different permission models

### Known Issues to Investigate

1. **Session Monitoring Bug**
   - Sessions created globally but UI looks locally in worktrees
   - ConfigurationManager.autoDetect() using wrong process.cwd()

2. **Orchestration Execution Context Bug** 
   - Orchestration task runs in worktree
   - Dispatches subtasks in detached mode
   - Subtasks execute in main worktree instead of parent's worktree
   - Execution context not propagated through orchestration → dispatch → execution chain

### Research Areas

1. **Current Path Resolution Logic**
   - How does each execution context currently resolve paths?
   - Where does execution context get lost in the orchestration chain?
   - What other context-propagation issues might exist?

2. **Data Storage Patterns**
   - Which data should be execution-local vs project-global?
   - How does channelcoder integration handle this?
   - Cache and temporary file strategies

3. **Execution Context Propagation**
   - How should execution context flow through orchestration?
   - What context information needs to be preserved?
   - How should context detection and inheritance work?

### Deliverable Format

Create a requirements document with:
- Context scenario matrix (what data goes where, what context is inherited)
- Current vs desired behavior comparison for both bugs
- Execution context propagation requirements
- Functional API requirements specification
- Edge cases and fallback strategies

## Tasks

## Deliverable
# Dual-Context Requirements Analysis

### Executive Summary

Analysis of Scopecraft's dual-context requirements reveals critical issues in how execution context (where code runs) and project context (where data lives) are handled across different execution scenarios. The core problem is that `ConfigurationManager.autoDetect()` uses `process.cwd()` which breaks in worktree environments, and execution context is not properly propagated through the orchestration chain.

### Context Scenario Matrix

| Scenario | Execution Context | Task Data | Session Data | Config Data | Issues |
|----------|------------------|-----------|--------------|-------------|--------|
| **Main Project** | Project root | Local (.tasks/) | Local (.sessions/) | Local | ✅ Works correctly |
| **Worktree** | Worktree path | Worktree (.tasks/) | **BROKEN**: UI looks local, sessions stored global | Global (main project) | ❌ Session monitoring fails |
| **Container/Docker** | Container path | Mounted volume | Mounted .sessions/ | Mounted config | ⚠️ Path mapping issues |
| **CI/Remote** | Temporary dir | Temporary/mounted | Temporary | Environment vars | ⚠️ Permission/persistence issues |

### Current vs Desired Behavior Analysis

### Bug 1: Session Monitoring Issue

**Current Behavior:**
- Sessions created globally in main project `.sessions/` directory
- UI runs from worktree, uses `ConfigurationManager.autoDetect()`
- `autoDetect()` returns worktree path via `process.cwd()`
- UI looks for sessions in `{worktree}/.sessions/` (doesn't exist)
- Result: Sessions invisible to monitoring UI

**Root Cause:** `src/core/config/configuration-manager.ts:327-335`
```typescript
private autoDetect(): RootConfig {
  const cwd = process.cwd(); // ← PROBLEM: Uses execution context instead of project context
  const validated = this.validateRoot(cwd);
  return { path: cwd, source: 'auto_detect', validated };
}
```

**Desired Behavior:**
- Sessions should be created globally (main project)
- UI should always look globally regardless of execution location
- Context detection should distinguish execution vs project context

### Bug 2: Orchestration Execution Context Loss

**Current Behavior:**
1. Orchestration task runs in worktree
2. Dispatches subtasks via `dispatch-commands.ts`
3. Subtasks execute in detached mode
4. Detached processes inherit main project context (not parent worktree)
5. Result: Subtasks execute in wrong location

**Root Cause:** Multiple context loss points in orchestration chain:
- `src/integrations/channelcoder/helpers.ts:63-82` - Context not preserved in detached mode
- `src/integrations/channelcoder/session-storage.ts:52-99` - Session ID race condition
- No explicit execution context propagation mechanism

**Desired Behavior:**
- Parent execution context should propagate to all subtasks
- Orchestration should preserve and inherit execution environment
- Context should be explicit, not dependent on process.cwd()

### Execution Context Propagation Requirements

### 1. Context Types Definition

```typescript
interface ExecutionContext {
  // Where the process is running
  executionPath: string;
  
  // Where project data lives  
  projectRoot: string;
  
  // Where task-specific data should be read/written
  taskDataRoot: string;
  
  // Where sessions should be stored/monitored
  sessionRoot: string;
  
  // Parent context for inheritance
  parentContext?: ExecutionContext;
}
```

### 2. Context Resolution Strategy

**Priority Order:**
1. **Explicit Context** - Passed via CLI parameters or environment
2. **Parent Inheritance** - From orchestrating task
3. **Worktree Detection** - Auto-detect main project from worktree
4. **Environment Variables** - SCOPECRAFT_ROOT, etc.
5. **Config File** - ~/.scopecraft/config.json
6. **Smart Auto-detect** - Improved version that finds project root

### 3. Context Propagation Chain

```
CLI Command
  → Task Resolution (with explicit context)
    → Environment Setup (inherit or detect)
      → Session Creation (preserve context)
        → ChannelCoder Execution (context-aware)
          → Subtask Dispatch (propagate context)
```

### Functional API Requirements

### Core Context Manager Interface

```typescript
interface ContextManager {
  // Resolve context with explicit precedence
  resolveContext(options?: ContextOptions): ExecutionContext;
  
  // Detect main project from any execution location
  detectProjectRoot(currentPath?: string): string;
  
  // Get data storage locations based on context
  getTaskDataPath(context: ExecutionContext): string;
  getSessionDataPath(context: ExecutionContext): string;
  getConfigPath(context: ExecutionContext): string;
  
  // Context inheritance for orchestration
  createChildContext(parent: ExecutionContext, taskId: string): ExecutionContext;
  
  // Validation and diagnostics
  validateContext(context: ExecutionContext): boolean;
  getDiagnostics(): ContextDiagnostics;
}
```

### Enhanced Configuration Manager

```typescript
interface IConfigurationManager {
  // Replace autoDetect with context-aware resolution
  resolveProjectRoot(executionContext?: string): RootConfig;
  
  // Support explicit context override
  getRootConfig(runtime?: RuntimeConfig, context?: ExecutionContext): RootConfig;
  
  // Worktree-aware detection
  detectFromWorktree(worktreePath: string): RootConfig;
}
```

### Session Storage Interface

```typescript
interface ISessionStorage {
  // Context-aware session operations
  createSession(sessionId: string, context: ExecutionContext): void;
  getSessionPath(sessionId: string, context: ExecutionContext): string;
  
  // Global vs local session management
  listGlobalSessions(): SessionInfo[];
  listLocalSessions(context: ExecutionContext): SessionInfo[];
}
```

### Data Storage Strategy

### Execution-Local Data
- **Worktree-specific tasks** - `.tasks/` in worktree
- **Temporary execution files** - `/tmp/` or container temp
- **Task-specific logs** - Local to execution environment

### Project-Global Data
- **Session monitoring** - `.sessions/` in main project
- **Configuration** - `~/.scopecraft/config.json`
- **Project metadata** - Main project `.tasks/`
- **Cross-task state** - Shared project data

### Hybrid Data (Context-Dependent)
- **Task content** - Local in worktree, global otherwise
- **Cache files** - Local for isolation, global for sharing
- **Log aggregation** - Local write, global collection

### Edge Cases and Fallback Strategies

### 1. Nested Worktree Detection
```
/project/.worktrees/task-a/
  └── .worktrees/subtask-b/  ← Detect root project, not parent task
```

### 2. Symlink and Mount Point Handling
- Resolve real paths before context detection
- Handle Docker volume mounts correctly
- Support network filesystem scenarios

### 3. Permission and Access Issues
- Graceful degradation when global storage inaccessible
- Fallback to local storage with warnings
- Read-only environment handling

### 4. Context Migration
- Handle existing sessions during context system upgrade
- Migrate session storage locations when needed
- Preserve backward compatibility during transition

### Implementation Priority

### Phase 1: Core Context Detection
1. Implement smart project root detection
2. Fix ConfigurationManager.autoDetect() worktree issue
3. Add context propagation to dispatch commands

### Phase 2: Session Management
1. Fix session monitoring path resolution
2. Implement context-aware session storage
3. Update UI to use global session discovery

### Phase 3: Orchestration Context
1. Add execution context to ChannelCoder integration
2. Implement context inheritance in detached mode
3. Fix subtask execution context propagation

### Phase 4: Advanced Features
1. Container and CI environment support
2. Context diagnostics and debugging tools
3. Performance optimization and caching

### Conclusion

The dual-context requirements analysis reveals that Scopecraft needs a fundamental architectural enhancement to properly separate execution context from project context. The current system conflates these concepts, leading to bugs in worktree environments and orchestration scenarios. The proposed functional API provides clear interfaces for context management while maintaining backward compatibility and supporting all identified execution scenarios.

## Log
- 2025-06-09: 2025-01-28 21:14: === AUTONOMOUS EXECUTION STARTED ===
- Task: 01_map-cont-rqrmnts-excton-06M
- Analysis: type:chore + area:core + expertise:researcher + research-focused content
- Selected Mode: Exploration (research and requirements mapping)
- Reasoning: Task involves mapping requirements, investigating current behavior, and analyzing scenarios
- Loading: No mode guidance files found, proceeding with exploration principles
- 2025-06-09: 2025-01-28 21:19: Research phase complete
- Analyzed ConfigurationManager.autoDetect() logic - uses process.cwd() 
- Examined session management and storage patterns
- Identified orchestration execution context flow and loss points
- Found specific bugs: session monitoring path resolution, execution context not propagated
- Starting deliverable compilation
- 2025-06-09: 2025-01-28 21:21: === EXECUTION COMPLETE ===
- Mode Used: Exploration (research and requirements mapping)
- Status: COMPLETED
- Deliverable: READY - Comprehensive dual-context requirements analysis
- Key Findings: ConfigurationManager.autoDetect() bug, session monitoring path issue, context loss in orchestration
- Architecture: Proposed ExecutionContext interface and context propagation strategy
- Next Steps: Implementation priority defined in Phase 1-4 roadmap
