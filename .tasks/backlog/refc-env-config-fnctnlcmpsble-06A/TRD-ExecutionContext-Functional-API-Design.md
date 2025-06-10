# Technical Requirements Document: Environment System Integration and Functional Refactor

### Executive Summary

This TRD defines how to properly integrate the environment system with ConfigurationManager and convert only the environment components to a functional architecture. **This document is grounded in the actual implementation from impl-cli-env-mgmt-06A** and recognizes ConfigurationManager as the established foundation.

**Core Principle**: Better integrate the environment system with the existing ConfigurationManager foundation while improving composability.

**Problems Solved**: 
1. **Session Monitoring Bug**: Fix project root resolution inconsistency between CLI and UI by properly using ConfigurationManager
2. **Poor Integration**: Environment system creates its own ConfigurationManager instance internally instead of receiving it as a dependency
3. **Improve Composability**: Make environment resolution functions while preserving ConfigurationManager as the configuration authority

### Current Architecture Analysis

Based on the actual implementation in impl-cli-env-mgmt-06A, the system currently uses:

### Current Class-Based Implementation

**Core Classes**:
- `ConfigurationManager` (singleton) - **FOUNDATION** - Project root resolution with precedence hierarchy, config file support
- `EnvironmentResolver` - Task to environment ID resolution, parent/subtask logic (needs better ConfigurationManager integration)
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

### Proposed Integration Strategy

```typescript
/**
 * ConfigurationManager STAYS AS-IS
 * It's the foundation that works across MCP and CLI
 * DO NOT convert to functions - it's already well-designed
 */

// Keep ConfigurationManager as the source of truth
const configManager = ConfigurationManager.getInstance();

/**
 * Environment System Integration
 * Make environment system properly consume ConfigurationManager
 */

// Option 1: Keep ConfigurationManager, make environment functions
// Environment functions that properly use ConfigurationManager
export async function resolveEnvironmentId(
  taskId: string,
  config: IConfigurationManager
): Promise<string> {
  const rootConfig = config.getRootConfig();
  // ... rest of logic
}

// Option 2: If we must have classes, at least inject dependencies
// But prefer Option 1 for composability

/**
 * Environment Resolution Functions  
 * Make these functions but they MUST use ConfigurationManager
 */

// These functions should accept config as a parameter
export async function resolveEnvironmentId(
  taskId: string, 
  config: IConfigurationManager
): Promise<string>;

export async function ensureEnvironment(
  envId: string,
  config: IConfigurationManager,
  worktreeManager: WorktreeManager
): Promise<EnvironmentInfo>;

/**
 * Session Storage Fix
 * CRITICAL: Always use ConfigurationManager's root for sessions
 */

export function getSessionStorageRoot(config: IConfigurationManager): string {
  // MUST use ConfigurationManager's resolved root
  // This ensures CLI and UI always find sessions in same place
  const rootConfig = config.getRootConfig();
  return rootConfig.path;
}
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

### 2. Environment System Integration (ACTUAL ISSUE) 

**Problem**: Environment system doesn't properly use ConfigurationManager

```typescript
// Current: Environment system creates its own ConfigurationManager instance
class EnvironmentResolver {
  constructor(worktreeManager: WorktreeManager) {
    // Creates internal instance instead of receiving it
    this.config = ConfigurationManager.getInstance();
  }
}

// Issues:
// - Hidden dependency on ConfigurationManager singleton
// - Can't test with different configurations  
// - Tight coupling between systems
```

**Fix**: Make environment functions accept ConfigurationManager as parameter

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

### Phase 1: Keep ConfigurationManager AS-IS

**Goal**: Recognize ConfigurationManager as the working foundation

```typescript
// ConfigurationManager STAYS as singleton - it works well!
const configManager = ConfigurationManager.getInstance();
const rootConfig = configManager.getRootConfig();

// This is NOT changing - it's the foundation
// Works across MCP and CLI with proper precedence
```

**Why Keep It**:
- Already handles configuration precedence correctly
- Supports config files and personalization
- Works consistently across MCP and CLI
- Well-tested and stable

### Phase 2: Convert Environment System to Functions

**Goal**: Make EnvironmentResolver and WorktreeManager into functions that properly use ConfigurationManager

```typescript
// Before: Class with internal ConfigurationManager coupling
const resolver = new EnvironmentResolver(worktreeManager);
const envId = await resolver.resolveEnvironmentId(taskId);

// After: Functions that accept ConfigurationManager
const configManager = ConfigurationManager.getInstance();
const envId = await resolveEnvironmentId(taskId, configManager);
```

**Benefits**:
- Better integration with ConfigurationManager
- More composable and testable
- Explicit dependencies

### Phase 3: Fix Session Storage Bug

**Goal**: Ensure sessions always use ConfigurationManager's root

```typescript
// Fix: Always use ConfigurationManager's resolved root
function getSessionStorageRoot(config: IConfigurationManager): string {
  // ConfigurationManager already handles root resolution correctly
  const rootConfig = config.getRootConfig();
  return rootConfig.path; // This is consistent across CLI and UI
}

// Update session storage to always use ConfigurationManager
const configManager = ConfigurationManager.getInstance();
const sessionsDir = path.join(getSessionStorageRoot(configManager), '.sessions');
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
1. **ConfigurationManager** → Remains as-is (the foundation)
2. **EnvironmentResolver** → Pure functions that use ConfigurationManager  
3. **WorktreeManager** → Pure functions that use ConfigurationManager
4. **Session monitoring bug fixed** (always uses ConfigurationManager's root)
5. **All CLI commands work identically**
6. **All tests pass**
7. **No breaking changes for users**
8. **Better integration** between environment system and ConfigurationManager

### Constraints

**DO NOT**:
- Change CLI command signatures
- Modify environment resolution logic  
- Break session storage format
- Remove Docker integration
- Change worktree naming patterns

**DO**:
- Keep ConfigurationManager as the foundation
- Convert only environment classes to pure functions  
- Make environment functions properly use ConfigurationManager
- Fix session root resolution bug using ConfigurationManager
- Maintain exact same behavior

## Key Principles Summary

### 1. Reality-Grounded Design
- Build on what actually exists and works
- Fix specific identified bugs
- Avoid "architecture astronaut" features

### 2. Strategic Functional Conversion
- Keep ConfigurationManager class (it works well)
- Convert only environment system to functions
- Functions must properly use ConfigurationManager
- Improve testability and composability

### 3. Bug Fixes Through Better Integration
- Session monitoring: use ConfigurationManager's root consistently
- Environment system: properly consume ConfigurationManager instead of internal coupling
- Keep everything else working exactly the same

### 4. Backward Compatibility First
- CLI commands must work identically
- Existing patterns and conventions preserved
- No breaking changes for users

*This refactor properly integrates the environment system with ConfigurationManager while converting only the environment components to functions. ConfigurationManager remains the foundation, and the focus is on fixing integration issues and the session monitoring bug through better architecture, not radical redesign.*