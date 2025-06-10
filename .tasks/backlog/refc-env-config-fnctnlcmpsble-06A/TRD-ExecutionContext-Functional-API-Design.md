# Technical Requirements Document: Environment Configuration Functional Refactor

### Executive Summary

This TRD defines the conversion of Scopecraft's current class-based environment system to a functional architecture. **This document is grounded in the actual implementation from impl-cli-env-mgmt-06A**, not theoretical design.

**Core Principle**: Convert existing classes to functions while maintaining exact same behavior and fixing identified bugs.

**Problems Solved**: 
1. **Session Monitoring Bug**: Fix project root resolution inconsistency between CLI and UI
2. **Class-to-Function Migration**: Replace classes with composable functions  
3. **Maintain Compatibility**: Keep all existing CLI command signatures and behavior

### Current Architecture Analysis

Based on the actual implementation in impl-cli-env-mgmt-06A, the system currently uses:

### Current Class-Based Implementation

**Core Classes**:
- `ConfigurationManager` (singleton) - Project root resolution with precedence hierarchy
- `EnvironmentResolver` - Task to environment ID resolution, parent/subtask logic  
- `WorktreeManager` - Git worktree operations using simple-git
- `BranchNamingService`, `DockerConfigService` - Configuration utilities

**Command Handlers** (`src/cli/commands/`):
- `handleWorkCommand(taskId, additionalPromptArgs, options)` - Interactive sessions
- `handleDispatchCommand(taskId, options)` - Autonomous/Docker execution

**Environment Resolution Logic** (Already Working):
- Parent tasks → Use task ID as environment ID
- Subtasks → Use parent task ID as environment ID  
- Environment ID → Worktree path via WorktreeManager

**Session Management** (Already Working):
- Sessions stored in `.sessions/` directory structure
- Metadata in `.sessions/*.info.json` files
- Logs in `.sessions/logs/` directory  
- Real-time monitoring through ChannelCoder integration

### Current Interface Analysis

### Actual Command Signatures (Keep These)

```typescript
// work-commands.ts - ACTUAL signature to maintain
export async function handleWorkCommand(
  taskId: string | undefined,
  additionalPromptArgs: string[],
  options: WorkCommandOptions
): Promise<void>

export interface WorkCommandOptions {
  mode?: string;
  docker?: boolean;
  session?: string;
  dryRun?: boolean;
  data?: string | Record<string, unknown>;
}

// dispatch-commands.ts - ACTUAL signature to maintain  
export async function handleDispatchCommand(
  taskId: string | undefined,
  options: DispatchCommandOptions
): Promise<void>

export interface DispatchCommandOptions {
  mode?: string;
  exec?: ExecutionType; // 'docker' | 'detached' | 'tmux'
  rootDir?: string;
  session?: string;
  dryRun?: boolean;
  data?: string | Record<string, unknown>;
}
```

### Current Core Interfaces (Convert to Functions)

```typescript
// From configuration-manager.ts - Convert to functions
export interface RootConfig {
  path: string;
  source: ConfigSource;
  validated: boolean;
  projectName?: string;
}

// From environment/types.ts - Keep interface, convert implementation
export interface EnvironmentInfo {
  id: string;
  path: string;
  branch: string;
  exists: boolean;
  isActive: boolean;
}
```

### Proposed Functional API (Convert From Classes)

```typescript
/**
 * Configuration Resolution Functions
 * Convert ConfigurationManager to functional equivalents
 */

// Replace ConfigurationManager.getRootConfig()
export function resolveProjectRoot(runtime?: { rootPath?: string }): RootConfig;

// Replace ConfigurationManager methods - keep exact behavior  
export function setRootFromCLI(path: string): void;
export function setRootFromEnvironment(): void;
export function setRootFromSession(path: string): void;
export function validateRoot(rootPath: string): boolean;
export function getProjectRoot(): string | null;

/**
 * Environment Resolution Functions  
 * Convert EnvironmentResolver to functional equivalents
 */

// Replace EnvironmentResolver.resolveEnvironmentId() - EXACT same logic
export async function resolveEnvironmentId(taskId: string): Promise<string>;

// Replace EnvironmentResolver.ensureEnvironment() - EXACT same logic
export async function ensureEnvironment(envId: string): Promise<EnvironmentInfo>;

// Replace EnvironmentResolver.getEnvironmentInfo() - EXACT same logic  
export async function getEnvironmentInfo(envId: string): Promise<EnvironmentInfo | null>;

/**
 * Worktree Management Functions
 * Convert WorktreeManager to functional equivalents
 */

// Replace WorktreeManager methods - keep exact behavior
export async function createWorktree(taskId: string): Promise<EnvironmentInfo>;
export async function removeWorktree(taskId: string): Promise<void>;
export async function listWorktrees(): Promise<EnvironmentInfo[]>;
export async function worktreeExists(taskId: string): Promise<boolean>;
```

### Current Environment Resolution Logic (Keep This)

Based on `EnvironmentResolver.resolveEnvironmentId()` - **THIS WORKS CORRECTLY**:

```typescript
// From src/core/environment/resolver.ts - ACTUAL working implementation
export async function resolveEnvironmentId(taskId: string): Promise<string> {
  // Load the task to check if it's a subtask
  const taskResult = await getTask(rootConfig.path, taskId);
  
  if (!taskResult.success) {
    throw new EnvironmentError(`Task not found: ${taskId}`);
  }
  
  const task = taskResult.data;
  
  // If this is a subtask (has a parent), use the parent's ID as the environment
  if (task?.metadata.parentTask) {
    return task.metadata.parentTask;
  }
  
  // Otherwise (parent task or simple task), use the task ID itself
  return taskId;
}

// This logic creates the correct behavior:
// - Parent tasks: environment ID = task ID  
// - Subtasks: environment ID = parent task ID
// - Simple tasks: environment ID = task ID
//
// All tasks with same environment ID share the same worktree
```

### Actual Command Flow (Don't Change This)

```typescript
// From work-commands.ts and dispatch-commands.ts - WORKING flow
async function handleCommand(taskId: string, options: CommandOptions) {
  // 1. Get project root from ConfigurationManager
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = configManager.getProjectRoot();
  
  // 2. Initialize services
  const worktreeManager = new WorktreeManager();
  const resolver = new EnvironmentResolver(worktreeManager);
  
  // 3. Resolve environment ID (parent/subtask logic)
  const envId = await resolver.resolveEnvironmentId(taskId);
  
  // 4. Ensure environment exists (create worktree if needed)
  const envInfo = await resolver.ensureEnvironment(envId);
  
  // 5. Execute with ChannelCoder integration
  // Session stored in `.sessions/` with proper metadata
}
```

### Identified Bugs to Fix

### 1. Session Monitoring Bug (ACTUAL PROBLEM)

**Root Cause**: Project root resolution inconsistency between CLI and UI

```typescript
// Problem: CLI and UI may resolve project root differently in worktrees
// CLI (in worktree): ConfigurationManager.getProjectRoot() 
// UI (in main): Different resolution logic

// Current session storage path calculation:
SESSION_STORAGE.getBaseDir(projectRoot) → `${projectRoot}/.sessions`

// If CLI resolves to worktree path: `/path/to/worktree/.sessions`  
// If UI resolves to main repo path: `/path/to/main-repo/.sessions`
// → UI can't find sessions created by CLI!
```

**Fix**: Ensure consistent project root resolution across CLI/UI contexts

### 2. Configuration State Management (ACTUAL ISSUE) 

**Problem**: ConfigurationManager singleton state can become inconsistent

```typescript
// Current: Singleton with mutable state
const configManager = ConfigurationManager.getInstance();
configManager.setRootFromCLI(path); // Mutates global state

// Issues:
// - Global mutable state across different command invocations
// - Cache invalidation complexity  
// - Difficult to test with different configurations
```

**Fix**: Convert to pure functions with explicit state passing

### Current Docker Integration (Keep This)

**Already Working** - From `dispatch-commands.ts`:

```typescript
// Current Docker execution setup (DO NOT CHANGE)
const result = await executeAutonomousTask(promptOrFile, {
  taskId: taskId || 'session-resume',
  parentId,
  execType, // 'docker' | 'detached' | 'tmux'
  projectRoot,
  worktree: envInfo ? {
    branch: envInfo.branch,
    path: envInfo.path,
  } : undefined,
  docker: execType === 'docker' && envInfo ? {
    image: dockerConfig.getDefaultImage(),
    mounts: [`${envInfo.path}:/workspace:rw`],
    env: {
      TASK_ID: taskId || options.session || '',
      WORK_MODE: mode,
    },
  } : undefined,
});

// This already handles:
// - Worktree mounting to /workspace
// - Environment variable passing
// - Docker image configuration
// - Session persistence
```

### Migration Strategy

### Phase 1: Configuration Functions

**Goal**: Replace ConfigurationManager singleton with pure functions

**Current Class → Functional Equivalent**:

```typescript
// Before: ConfigurationManager singleton
const configManager = ConfigurationManager.getInstance();
const rootConfig = configManager.getRootConfig();

// After: Pure functions with explicit state
const rootConfig = resolveProjectRoot({ 
  cliRoot: options.rootDir,
  envVar: process.env.SCOPECRAFT_ROOT 
});
```

**Benefits**:
- No global state mutations
- Explicit dependencies
- Easier testing
- Thread-safe

### Phase 2: Environment Resolution Functions  

**Goal**: Replace EnvironmentResolver class with functions

```typescript
// Before: Class instantiation 
const resolver = new EnvironmentResolver(worktreeManager);
const envId = await resolver.resolveEnvironmentId(taskId);

// After: Pure functions
const envId = await resolveEnvironmentId(taskId, { projectRoot });
```

**Keep Exact Same Logic**: Parent/subtask resolution works correctly

### Phase 3: Session Storage Fix

**Goal**: Fix session monitoring bug with consistent root resolution

```typescript
// Fix: Always resolve to main repository root for session storage
function getSessionStorageRoot(projectRoot: string): string {
  // Always use main repository root, not worktree path
  return detectMainRepositoryRoot(projectRoot);
}

// Ensures CLI and UI always use same session directory
const sessionsDir = path.join(getSessionStorageRoot(projectRoot), '.sessions');
```

### Implementation Requirements

### Backward Compatibility (CRITICAL)

**Must Not Break**:
- All CLI command signatures (`sc work`, `sc dispatch`)
- All existing options and flags
- Environment resolution behavior (parent/subtask logic)
- Session storage and monitoring
- ChannelCoder integration

### Testing Requirements

**Before Migration**:
```typescript
// Capture current behavior as regression tests
describe('Environment System Regression Tests', () => {
  it('should maintain exact CLI command behavior', async () => {
    // Test all current command combinations
  });
  
  it('should preserve parent/subtask resolution', async () => {
    // Test environment ID resolution logic
  });
  
  it('should keep session storage working', async () => {
    // Test session creation and monitoring
  });
});
```

**After Migration**:
- All existing tests must still pass
- New functional tests for pure functions
- Integration tests for CLI compatibility

### Success Criteria

**✅ Migration Complete When**:
1. **ConfigurationManager** → Pure functions (no global state)
2. **EnvironmentResolver** → Pure functions (same logic)  
3. **WorktreeManager** → Pure functions (same operations)
4. **Session monitoring bug fixed** (consistent root resolution)
5. **All CLI commands work identically**
6. **All tests pass**
7. **No breaking changes for users**

### Constraints

**DO NOT**:
- Change CLI command signatures
- Modify environment resolution logic  
- Break session storage format
- Remove Docker integration
- Change worktree naming patterns

**DO**:
- Convert classes to pure functions
- Fix session root resolution bug
- Improve testability
- Maintain exact same behavior

## Key Principles Summary

### 1. Reality-Grounded Design
- Build on what actually exists and works
- Fix specific identified bugs
- Avoid "architecture astronaut" features

### 2. Functional Conversion
- Replace classes with pure functions
- Eliminate global mutable state
- Improve testability and composability

### 3. Bug Fixes, Not Redesigns
- Session monitoring: consistent root resolution
- Configuration: remove singleton state issues
- Keep everything else working exactly the same

### 4. Backward Compatibility First
- CLI commands must work identically
- Existing patterns and conventions preserved
- No breaking changes for users

*This functional refactor maintains all current functionality while fixing identified bugs and improving the codebase architecture. The focus is on incremental improvement, not radical redesign.*