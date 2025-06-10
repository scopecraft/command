# Design functional API patterns following channelcoder integration style

---
type: chore
status: done
area: core
assignee: design-agent
tags:
  - 'team:architecture'
  - 'expertise:designer'
  - 'execution:autonomous'
---


## Instruction
Design functional API patterns and ExecutionContext interface following the channelcoder integration style to replace the class-based environment and configuration system.

### Context from Research

Research revealed:
1. **Root Cause**: ConfigurationManager.autoDetect() uses process.cwd() incorrectly
2. **Dual-Context Need**: Separate execution context (where code runs) from project context (where data lives)
3. **Migration Strategy**: 3-phase approach from low-risk services to core infrastructure
4. **Reference Pattern**: channelcoder integration already uses functional/composable approach

**IMPORTANT**: Review the complete architecture analysis document at `architecture-analysis.md` in this parent task folder, which synthesizes findings from both research tasks and provides the gate review decision.

### Design Requirements

#### 1. ExecutionContext Interface
Design context types that distinguish:
- Execution path (where process runs)
- Project root (where data lives)
- Task data root (local vs global)
- Session root (monitoring location)
- Parent context (for inheritance)

#### 2. Functional API Patterns
Following channelcoder style, design:
- Pure functions instead of class methods
- Explicit dependencies via parameters
- Composable operations
- No singleton patterns

#### 3. Context Resolution Strategy
Design priority order:
1. Explicit context (CLI params)
2. Parent inheritance (orchestration)
3. Worktree detection (smart auto-detect)
4. Environment variables
5. Config file
6. Fallback detection

#### 4. Migration Compatibility
Design approach that:
- Maintains backward compatibility during transition
- Allows gradual migration (class wrappers around functions)
- Preserves existing CLI/MCP interfaces
- Provides clear migration path

### Key Areas to Design

#### Configuration Resolution
```typescript
// Replace ConfigurationManager singleton with:
export function resolveProjectRoot(executionContext?: string): RootConfig
export function detectFromWorktree(worktreePath: string): RootConfig
export function validateProjectRoot(path: string): ValidationResult
```

#### Environment Operations
```typescript
// Replace WorktreeManager/EnvironmentResolver with:
export function createWorktree(context: ExecutionContext, taskId: string, options?: WorktreeOptions)
export function resolveEnvironmentId(context: ExecutionContext, taskId: string)
export function ensureEnvironment(context: ExecutionContext, envId: string)
```

#### Session Management
```typescript
// Context-aware session operations:
export function createSession(sessionId: string, context: ExecutionContext)
export function getSessionPath(sessionId: string, context: ExecutionContext)
export function listGlobalSessions(): SessionInfo[]
```

#### Context Propagation
```typescript
// For orchestration context inheritance:
export function createChildContext(parent: ExecutionContext, taskId: string): ExecutionContext
export function propagateContextToDispatch(parentContext: ExecutionContext, command: string[])
```

### Deliverable Format

Create detailed design document with:
1. **TypeScript interfaces** for all context and API types
2. **Function signatures** for core operations replacing classes
3. **Context flow diagrams** showing propagation through orchestration
4. **Migration strategy** with compatibility layers
5. **Implementation sequence** aligned with 3-phase research plan
6. **Example usage** showing before/after patterns

### Integration with channelcoder
Analyze how channelcoder integration achieves functional composition and apply similar patterns to environment/config system.

### Success Criteria
- Clean functional interfaces replace all singleton usage
- Context propagation solves orchestration execution bug
- Session monitoring works across worktree scenarios
- Migration maintains backward compatibility
- Design supports all execution scenarios (main, worktree, container, CI)

## Tasks

## Deliverable
# Technical Requirements Document: Functional API Patterns for Environment & Configuration

### Executive Summary

This TRD defines the functional API design to replace Scopecraft's class-based environment and configuration system. Following the channelcoder integration style, we'll introduce an `ExecutionContext` interface and pure function APIs that solve the dual-context bug while aligning with the service-oriented architecture vision.

**Architecture Alignment**: This design strengthens service boundaries by moving from singleton patterns to explicit context passing, making future service extraction cleaner and supporting the Environment Service vision.

### Architecture Overview

### Module Structure

```
src/core/
├── execution-context/           # NEW: Context management
│   ├── types.ts                # ExecutionContext interfaces
│   ├── resolver.ts             # Context resolution logic
│   └── validation.ts           # Context validation
├── configuration/               # REFACTORED: Functional APIs
│   ├── project-resolution.ts   # Replace ConfigurationManager
│   ├── config-sources.ts       # Source priority logic
│   └── validation.ts           # Project validation
└── environment/                 # REFACTORED: Functional APIs
    ├── worktree-operations.ts   # Replace WorktreeManager
    ├── session-management.ts    # Session context operations
    └── path-resolution.ts       # Environment path logic
```

### Integration Points

1. **CLI Layer**: Accepts explicit context parameters, propagates through execution chain
2. **MCP Layer**: Context-aware handlers replace singleton dependencies
3. **Orchestration Layer**: Context inheritance for parent→child task execution
4. **ChannelCoder Integration**: Context-aware session creation and management

### Core Interfaces

### ExecutionContext Interface

```typescript
/**
 * Core execution context that distinguishes where code runs vs where data lives
 */
export interface ExecutionContext {
  // Execution environment
  executionPath: string;           // Where the process is running (cwd)
  processId?: string;              // Process identifier for tracking
  
  // Project context  
  projectRoot: string;             // Where project data lives (.tasks/)
  projectSource: ConfigSource;     // How project root was determined
  projectValidated: boolean;       // Whether project root is valid
  
  // Task context
  taskDataRoot: 'local' | 'global'; // Local .tasks/ vs global ~/.scopecraft/
  currentTaskId?: string;          // Active task context
  parentTaskId?: string;           // Parent task for inheritance
  
  // Session context
  sessionRoot?: string;            // Where sessions are monitored
  sessionId?: string;              // Active session identifier
  
  // Inheritance context
  parentContext?: ExecutionContext; // For orchestration inheritance
}

/**
 * Context resolution options
 */
export interface ContextResolutionOptions {
  explicitRoot?: string;           // CLI --root parameter
  inheritFrom?: ExecutionContext;  // Parent context
  taskId?: string;                 // Task-specific context
  sessionId?: string;              // Session-specific context
  detectWorktree?: boolean;        // Enable worktree auto-detection
}

/**
 * Project root configuration
 */
export interface RootConfig {
  path: string;
  source: ConfigSource;
  validated: boolean;
  projectName?: string;
}

/**
 * Worktree operation context
 */
export interface WorktreeContext {
  executionContext: ExecutionContext;
  taskId: string;
  branchName?: string;
  baseBranch?: string;
}
```

### Configuration Resolution API

```typescript
/**
 * Replace ConfigurationManager singleton with functional APIs
 */

// Core resolution function
export function resolveProjectRoot(
  executionPath: string,
  options?: ContextResolutionOptions
): RootConfig;

// Source-specific resolvers
export function detectFromWorktree(worktreePath: string): RootConfig | null;
export function resolveFromEnvironment(): RootConfig | null;
export function resolveFromConfigFile(executionPath: string): RootConfig | null;
export function detectFromCwd(path: string): RootConfig;

// Validation
export function validateProjectRoot(path: string): boolean;
export function validateRootConfig(config: RootConfig): ValidationResult;

// Context creation
export function createExecutionContext(
  executionPath: string,
  options?: ContextResolutionOptions
): ExecutionContext;
```

### Environment Operations API

```typescript
/**
 * Replace WorktreeManager class with functional APIs
 */

// Worktree operations
export function createWorktree(
  context: WorktreeContext,
  options?: WorktreeOptions
): Promise<WorktreeInfo>;

export function removeWorktree(
  context: ExecutionContext,
  taskId: string
): Promise<void>;

export function listWorktrees(
  context: ExecutionContext
): Promise<WorktreeInfo[]>;

export function getWorktreePath(
  context: ExecutionContext,
  taskId: string
): Promise<string>;

// Environment resolution
export function resolveEnvironmentId(
  context: ExecutionContext,
  taskId: string
): string;

export function ensureEnvironment(
  context: ExecutionContext,
  envId: string
): Promise<void>;

// Session management
export function createSession(
  sessionId: string,
  context: ExecutionContext
): Promise<SessionInfo>;

export function getSessionPath(
  sessionId: string,
  context: ExecutionContext
): string;

export function listGlobalSessions(): Promise<SessionInfo[]>;
```

### Context Propagation API

```typescript
/**
 * Context inheritance for orchestration
 */

// Child context creation
export function createChildContext(
  parent: ExecutionContext,
  taskId: string
): ExecutionContext;

// Dispatch context propagation
export function propagateContextToDispatch(
  parentContext: ExecutionContext,
  command: string[]
): string[]; // Returns command with context args

// Context serialization for process boundaries
export function serializeContext(context: ExecutionContext): string;
export function deserializeContext(serialized: string): ExecutionContext;
```

### Dependencies

### Core Dependencies (No Change)
- `simple-git` - Git operations
- `node:fs`, `node:path`, `node:os` - System operations

### New Internal Dependencies
- `execution-context` module - Context types and resolution
- Configuration services - Functional config resolution
- Environment services - Functional environment operations

### Removed Dependencies
- `ConfigurationManager` singleton
- `WorktreeManager` class
- `EnvironmentResolver` class

**Rationale**: Eliminate singleton dependencies to enable clean service boundaries and context-aware operations. This aligns with the service architecture by making dependencies explicit rather than global.

### Implementation Guidelines

### Pure Function Pattern

Following channelcoder integration style:

```typescript
// Good: Pure function with explicit dependencies
export function resolveProjectRoot(
  executionPath: string,
  options?: ContextResolutionOptions
): RootConfig {
  // All inputs explicit, no hidden state
}

// Bad: Class method with hidden singleton state
class ConfigurationManager {
  resolveRoot(): RootConfig {
    // Hidden singleton state, implicit dependencies
  }
}
```

### Context Priority Order

Implement consistent resolution priority:

```typescript
export function createExecutionContext(
  executionPath: string,
  options: ContextResolutionOptions = {}
): ExecutionContext {
  // 1. Explicit context (CLI params)
  if (options.explicitRoot) {
    return createFromExplicit(executionPath, options.explicitRoot);
  }
  
  // 2. Parent inheritance (orchestration)
  if (options.inheritFrom) {
    return createFromParent(executionPath, options.inheritFrom, options.taskId);
  }
  
  // 3. Worktree detection (smart auto-detect)
  if (options.detectWorktree) {
    const worktreeConfig = detectFromWorktree(executionPath);
    if (worktreeConfig) {
      return createFromWorktree(executionPath, worktreeConfig);
    }
  }
  
  // 4. Environment variables
  const envConfig = resolveFromEnvironment();
  if (envConfig) {
    return createFromConfig(executionPath, envConfig);
  }
  
  // 5. Config file
  const configFile = resolveFromConfigFile(executionPath);
  if (configFile) {
    return createFromConfig(executionPath, configFile);
  }
  
  // 6. Fallback detection
  return createFromFallback(executionPath);
}
```

### Error Handling

```typescript
export interface ContextResolutionError {
  code: 'INVALID_ROOT' | 'WORKTREE_NOT_FOUND' | 'CONFIG_ERROR';
  message: string;
  context: {
    executionPath: string;
    attemptedPath?: string;
    source?: ConfigSource;
  };
}

// Functions return Results, not throw exceptions
export function resolveProjectRoot(
  executionPath: string,
  options?: ContextResolutionOptions
): Result<RootConfig, ContextResolutionError>;
```

### Validation Pattern

```typescript
export function validateExecutionContext(
  context: ExecutionContext
): ValidationResult {
  const errors: string[] = [];
  
  if (!context.executionPath) {
    errors.push('Execution path is required');
  }
  
  if (!context.projectRoot) {
    errors.push('Project root is required');
  }
  
  if (!validateProjectRoot(context.projectRoot)) {
    errors.push(`Invalid project root: ${context.projectRoot}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Testing Strategy

### Unit Testing
- **Pure function testing** - All functions are easily testable
- **Context resolution testing** - Test priority order with various inputs
- **Validation testing** - Test error cases and edge conditions
- **Mock-free testing** - No singletons to mock

### Integration Testing
- **CLI integration** - Test context propagation through command chain
- **Orchestration integration** - Test parent→child context inheritance
- **Worktree integration** - Test context resolution in worktree scenarios

### Test Structure

```typescript
describe('resolveProjectRoot', () => {
  it('should prioritize explicit root over auto-detection', () => {
    const result = resolveProjectRoot('/worktree/path', {
      explicitRoot: '/explicit/root'
    });
    expect(result.path).toBe('/explicit/root');
    expect(result.source).toBe('runtime');
  });
  
  it('should inherit from parent context when provided', () => {
    const parent = createExecutionContext('/parent/path');
    const result = resolveProjectRoot('/child/path', {
      inheritFrom: parent,
      taskId: 'child-task'
    });
    expect(result.path).toBe(parent.projectRoot);
  });
});
```

### Migration Path

### Phase 1: Foundation (Week 1)

1. **Create execution-context module**
   - Define interfaces and types
   - Implement context resolution functions
   - Add validation logic

2. **Create functional configuration APIs**
   - Implement `resolveProjectRoot` and related functions
   - Maintain ConfigurationManager as wrapper around functions
   - Update low-risk services to use functional APIs

### Phase 2: Environment Operations (Week 2)

1. **Create functional environment APIs**
   - Implement worktree operations as functions
   - Implement session management functions
   - Maintain WorktreeManager as wrapper around functions

2. **Update business logic**
   - Update CLI commands to accept context parameters
   - Update MCP handlers to use context-aware functions
   - Update environment services

### Phase 3: Core Infrastructure (Week 3)

1. **Replace singleton usage**
   - Update all ConfigurationManager.getInstance() calls
   - Update WorktreeManager instantiation
   - Remove singleton patterns

2. **Enable orchestration context**
   - Implement context propagation in dispatch chain
   - Add context inheritance for parent→child tasks
   - Test orchestration context flow

### Compatibility Strategy

```typescript
// Compatibility wrapper during migration
class ConfigurationManager {
  private context: ExecutionContext;
  
  constructor() {
    this.context = createExecutionContext(process.cwd());
  }
  
  getRootConfig(): RootConfig {
    // Delegate to functional API
    return resolveProjectRoot(this.context.executionPath);
  }
  
  // Mark deprecated to guide migration
  /** @deprecated Use resolveProjectRoot() instead */
  resolveRoot(): RootConfig {
    return this.getRootConfig();
  }
}
```

### Future Extensibility

### Service Extraction Points

The functional design naturally aligns with service boundaries:

```typescript
// Environment Service API (future)
interface EnvironmentService {
  createWorktree(context: WorktreeContext): Promise<WorktreeInfo>;
  resolveEnvironment(context: ExecutionContext, taskId: string): Promise<string>;
}

// Current functional APIs become service implementation
class DefaultEnvironmentService implements EnvironmentService {
  async createWorktree(context: WorktreeContext): Promise<WorktreeInfo> {
    return createWorktree(context); // Delegate to pure function
  }
}
```

### Configuration Extension

```typescript
// New context sources can be added easily
export function resolveFromDatabase(
  executionPath: string
): RootConfig | null {
  // New resolution source
}

// Update priority order in createExecutionContext
```

### Context Enhancement

```typescript
// ExecutionContext can be extended without breaking changes
export interface ExecutionContext {
  // ... existing fields
  
  // Future additions
  dockerContext?: DockerContext;
  kubernetesContext?: K8sContext;
  remoteContext?: RemoteContext;
}
```

### Architecture Alignment Review

### What Changed and Why

1. **Singleton → Functional APIs**
   - **What**: Replaced ConfigurationManager singleton with pure functions
   - **Why**: Enables explicit dependencies, testability, and service boundaries
   - **Alignment**: Supports Environment Service extraction

2. **Implicit Context → Explicit Context**
   - **What**: Introduced ExecutionContext interface with dual-context separation
   - **Why**: Solves orchestration bugs and enables context inheritance
   - **Alignment**: Supports orchestration service coordination

3. **Class-based → Function-based**
   - **What**: Converted environment operations from classes to functions
   - **Why**: Follows channelcoder integration pattern, improves composability
   - **Alignment**: Matches Unix philosophy of composable tools

4. **Process.cwd() → Explicit Execution Path**
   - **What**: ExecutionContext separates execution path from project path
   - **Why**: Solves dual-context bug in worktree scenarios
   - **Alignment**: Enables proper context propagation through orchestration

### Service Boundary Impact

This design strengthens service boundaries by:
- Making dependencies explicit rather than hidden in singletons
- Providing clean interfaces for future service extraction
- Enabling proper context propagation between services
- Supporting pluggable implementation patterns

### Backwards Compatibility

Maintained through:
- Wrapper classes during migration period
- Gradual migration strategy (3 phases)
- Existing CLI/MCP interfaces preserved
- Clear migration path with deprecation warnings

### Example Usage

### Before (Current Class-based)

```typescript
// Hidden singleton dependencies
const config = ConfigurationManager.getInstance();
const rootConfig = config.getRootConfig();
const worktreeManager = new WorktreeManager();
const worktree = await worktreeManager.create(taskId);
```

### After (Functional with Context)

```typescript
// Explicit context and dependencies
const context = createExecutionContext(process.cwd(), {
  explicitRoot: cliArgs.root,
  taskId: 'feature-auth'
});

const worktreeContext = {
  executionContext: context,
  taskId: 'feature-auth',
  branchName: 'feature/auth-system'
};

const worktree = await createWorktree(worktreeContext);
```

### Orchestration Context Inheritance

```typescript
// Parent task execution
const parentContext = createExecutionContext('/parent/path', {
  taskId: 'parent-feature'
});

// Child task inherits context
const childContext = createChildContext(parentContext, 'child-implementation');

// Dispatch with context propagation
const dispatchCommand = propagateContextToDispatch(childContext, [
  'sc', 'task', 'start', 'child-implementation'
]);
// Result: ['sc', 'task', 'start', '--root', '/parent/path', 'child-implementation']
```

---

*This TRD provides the technical foundation for implementing functional API patterns that solve the dual-context bug while aligning with Scopecraft's service-oriented architecture vision. The design enables clean service extraction, supports context inheritance, and maintains backward compatibility during the migration.*

## Log
- 2025-06-09: 2025-06-09 15:02: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 03_desi-fnctnal-api-intg-06R
  - Analysis: Title contains "Design", type:chore with architecture focus, tags include "team:architecture" and "expertise:designer"
  - Selected Mode: design/trd.md (Technical Requirements Document variant)
  - Reasoning: Task requires creating detailed design document with TypeScript interfaces, function signatures, diagrams, and migration strategy - perfect match for TRD mode
  - Loading: design/trd.md, guidance/architecture-patterns.md
- 2025-06-09: 2025-06-09 15:07: Phase 1 Analysis Complete
  - Read architecture-analysis.md: Confirmed dual-context bug, 3-phase migration plan
  - Analyzed channelcoder integration: Pure function exports, no singletons, explicit dependencies
  - Examined ConfigurationManager: 26+ usage points, singleton pattern, problematic autoDetect()
  - Examined WorktreeManager: Class-based, depends on ConfigurationManager singleton
  - Next: Review architectural docs, design functional replacements
- 2025-06-09: 2025-06-09 15:10: Phase 2 Architecture Review Complete
  - Reviewed philosophy.md: Unix philosophy, composable tools, service boundaries
  - Reviewed architecture docs: Clear service boundaries, pluggable design, progressive enhancement
  - Identified key patterns: Environment Service manages execution contexts, services communicate via APIs
  - Ready to begin TRD Phase 3: Design functional APIs that align with service architecture
- 2025-06-09: 2025-06-09 15:15: === EXECUTION COMPLETE ===
  - Mode Used: design/trd.md (Technical Requirements Document)
  - Status: COMPLETED
  - Deliverable: READY
  - Created comprehensive TRD with:
    * ExecutionContext interface design (dual-context separation)
    * Functional API patterns replacing singletons
    * Context propagation for orchestration
    * 3-phase migration strategy with compatibility
    * Service boundary alignment
    * Example usage patterns
  - Questions: 0 (all requirements addressed)
  - Follow-up: Ready for implementation phase
