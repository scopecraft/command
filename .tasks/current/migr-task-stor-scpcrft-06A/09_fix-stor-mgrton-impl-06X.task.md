# Fix storage migration feature flag implementation

---
type: bug
status: todo
area: core
---


## Instruction
Fix the critical bug where storage migration feature flags are non-functional.

**CRITICAL BUG DISCOVERED**: The test task found that setting `SCOPECRAFT_ENABLE_CENTRALIZED_STORAGE = 'true'` has NO EFFECT. Tasks are still being created in `.tasks/` instead of `~/.scopecraft/projects/{encoded}/`.

**Root Cause Analysis**:
The implementation task (03_core-storage-implementation-06W) created the infrastructure but the feature flag is not actually being used in the task CRUD operations. The flag is read but the logic doesn't redirect storage operations to the new location.

**What Needs Fixing**:

1. **Task CRUD Operations**
   - The task create/update/delete operations need to check the feature flag
   - When flag is enabled, use the new storage paths
   - Ensure ConfigurationManager is passed through properly

2. **Directory Utils Integration**
   - Verify `getTasksDirectory()` actually uses ConfigurationManager when provided
   - Ensure dual-location resolution works (check new location first)

3. **Feature Flag Check Points**
   - `createTask()` - must create in new location when flag enabled
   - `updateTask()` - must update in correct location
   - `deleteTask()` - must delete from correct location
   - `listTasks()` - must list from correct location

**Test Evidence**:
```
✅ Storage migration tests: 4/12 pass (33%)
```
Only 4 out of 12 storage migration tests pass because the feature flag doesn't work.

**Example of What's Broken**:
```typescript
// This should create task in ~/.scopecraft/projects/{encoded}/tasks/
process.env.SCOPECRAFT_ENABLE_CENTRALIZED_STORAGE = 'true';
await createTask(taskData, config);
// But it still creates in .tasks/!
```

**IMPORTANT**:
- The infrastructure code is correct (path encoder, storage utils, etc.)
- The issue is that the CRUD operations don't use the feature flag
- Focus on wiring up the existing infrastructure, not rewriting it
- Test with the storage migration tests after fixing

## Tasks
- [ ] Analyze task-crud.ts to understand current create/update/delete flow
- [ ] Identify where feature flag check should happen in CRUD operations
- [ ] Update createTask to use centralized storage when flag enabled
- [ ] Update updateTask to check correct location based on flag
- [ ] Update deleteTask to remove from correct location
- [ ] Update listTasks to scan correct location
- [ ] Ensure parseTaskLocation handles both storage locations
- [ ] Verify dual-location resolution works (new first, fallback to old)
- [ ] Run storage migration tests to verify fix
- [ ] Ensure backward compatibility when flag is disabled

## Deliverable
### Centralized-Only Storage Implementation

### Core Change
Hardcode `getTasksDirectory()` to always use centralized storage:
```typescript
export function getTasksDirectory(projectRoot: string): string {
  const encoded = TaskStoragePathEncoder.encode(projectRoot);
  const centralizedPath = join(
    process.env.HOME || require('os').homedir(),
    '.scopecraft',
    'projects',
    encoded,
    'tasks'
  );
  
  if (!existsSync(centralizedPath)) {
    mkdirSync(centralizedPath, { recursive: true });
  }
  
  return centralizedPath;
}
```

### What to Remove (Carefully)

#### 1. Feature Flag Infrastructure
- **Delete entirely**: `src/core/storage-utils.ts` (all feature flag logic)
- **Remove imports**: Any imports of `getStorageFeatureFlags`, `StorageFeatureFlags`, etc.
- **Remove exports**: From `src/core/index.ts` lines ~124-140 (storage-utils exports)

#### 2. ConfigurationManager Storage Methods (if not used elsewhere)
- `getProjectStorageRoot()` 
- `getTaskStorageRoot()`
- `getSessionStorageRoot()`
- `getTemplateStorageRoot()` 
- `getModeStorageRoot()`
- `getConfigStorageRoot()`

#### 3. Test Files
- **Delete entirely**: `test/e2e/storage-migration.test.ts` (tests feature flags)

#### 4. Documentation
- **Delete entirely**: `docs/adr/001-task-storage-migration.md` (obsolete)

#### 5. Environment Variables (remove all references)
- `SCOPECRAFT_ENABLE_CENTRALIZED_STORAGE`
- `SCOPECRAFT_ENABLE_SESSION_MIGRATION`
- `SCOPECRAFT_ENABLE_TEMPLATE_MIGRATION`
- `SCOPECRAFT_ENABLE_MODE_MIGRATION`

### What MUST Stay
- `TaskStoragePathEncoder` class - NEEDED for path encoding
- `validateScopecraftPath()` - NEEDED for security
- `STORAGE_PERMISSIONS` - NEEDED for file permissions
- All other directory functions (workflow, archive, etc.)
- ProjectConfig interface (but no storageMode field needed)

### Update Imports
In `directory-utils.ts` add:
```typescript
import { TaskStoragePathEncoder } from './task-storage-path-encoder.js';
```

### Result
- ALL projects use `~/.scopecraft/projects/{encoded}/tasks/`
- No `.tasks/` directories in projects
- No configuration needed
- No dual location checking
- Clean, simple, centralized-only

## Log
- 2025-06-12: 2025-06-11 13:30: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 09_fix-stor-mgrton-impl-06X
  - Analysis: type:bug, area:core, critical storage migration issue
  - Selected Mode: diagnosis/implementation hybrid
  - Reasoning: Bug fix requiring root cause analysis and implementation
  - Loading: No .modes directory found, proceeding with standard bug fix approach
- 2025-06-12: 2025-06-11 13:35: Mode guidance loaded successfully
  - Using: implement/autonomous.md + implement/area/core.md
  - Focus: Bug fix in core area, storage migration feature flag
  - Approach: Diagnose root cause, implement fix, verify with tests
- 2025-06-12: 2025-06-11 13:40: Root cause analysis complete
  - Feature flag is correctly read in storage-utils.ts line 37
  - getTasksDirectory() in directory-utils.ts DOES check the flag (lines 38-47)
  - BUT: It only uses centralized storage if the directory already exists!
  - The issue: ConfigurationManager is not being passed through CRUD operations
  - Key finding: All CRUD operations call getTasksDirectory() without configManager parameter
- 2025-06-12: 2025-06-11 13:45: DECISION: Fix approach identified
  - Context: ConfigurationManager exists but isn't passed to CRUD operations
  - Options considered: 1) Pass configManager from CLI, 2) Auto-detect in CRUD, 3) Global singleton
  - Chosen because: Option 1 is cleanest - explicit dependency injection
  - Impact: CLI commands need to pass configManager to core functions
  - Review needed: Verify all CLI commands are updated consistently
- 2025-06-12: 2025-06-11 13:50: Comprehensive analysis based on ADR-001
  - ADR specifies ConfigurationManager dependency injection (line 251)
  - Phase 2 Foundation tasks were completed (task 03)
  - Phase 3 Core Migration is partially done but broken
  - The issue: ConfigurationManager exists but isn't threaded through the system
- 2025-06-12: 2025-06-11 13:55: Complete analysis summary
  - Infrastructure EXISTS: ConfigurationManager has storage methods (lines 279-326)
  - TaskStoragePathEncoder provides path encoding (working correctly)
  - Feature flag check exists in storage-utils.ts
  - getTasksDirectory() does check the flag BUT requires configManager param
  - ROOT CAUSE: CLI/MCP don't pass configManager to CRUD operations
  - Secondary issue: getTasksDirectory only uses centralized if dir exists
  - Need to ensure storage initialization when flag is enabled
- 2025-06-12: 2025-06-11 14:00: ARCHITECT MODE: Rethinking configuration propagation
  - Context: User requests architectural perspective on config handling
  - Current: Singleton ConfigurationManager with optional parameter passing
  - Philosophy: Functional/composable approach (from env refactor)
  - Challenge: How to propagate config without explicit threading everywhere
- 2025-06-12: 2025-06-11 14:05: Analyzing refactoring impact of context pattern
  - Need to assess: How many files would change?
  - Current surface area: CLI commands, MCP handlers, core CRUD
  - Risk assessment: Breaking changes vs incremental adoption
- 2025-06-12: 2025-06-11 14:10: DECISION POINT: Storage strategy discussion
  - User insight: Storage location should be per-project config, not global
  - Options: 1) Dual support (complex), 2) Hard migration (simple), 3) Quick fix
  - Key question: Is dual support worth the complexity?
- 2025-06-12: 2025-06-11 14:15: Analyzing dead code removal opportunity
  - User wants detailed plan of what can be removed
  - Need to identify: feature flags, dual support logic, migration code
  - Goal: Clean implementation without dead code
- 2025-06-12: 2025-06-11 14:20: User checkpoint - verifying requirement understanding
  - Concern: Do I understand why path encoding is needed?
  - Need to clarify: What centralized storage actually means
- 2025-06-12: 2025-06-11 14:25: Starting implementation with corrected approach
  - Approach: Per-project storage mode in ProjectConfig
  - Keep: Path encoding for centralized storage
  - Remove: Feature flags and dual-location complexity
  - Created 10-item todo list for implementation
- 2025-06-12: 2025-06-11 14:30: DECISION: Core loads ProjectConfig internally
  - Context: User corrected my approach - ProjectConfig is core responsibility
  - Options considered: 1) Pass from CLI/MCP, 2) Load in core
  - Chosen because: ProjectConfig is project-specific, not client-specific
  - Impact: Core functions load config based on projectRoot
  - Review needed: Ensure consistent config loading pattern
- 2025-06-12: 2025-06-11 14:35: Modified directory-utils.ts
  - Lines changed: ~30 functions updated
  - What: Removed all ConfigurationManager parameters
  - Why: Core loads ProjectConfig internally from .tasks/.config/project.json
  - Added loadProjectConfig() function to read config
- 2025-06-12: 2025-06-11 14:40: CORRECTION: ConfigurationManager still needed
  - Misunderstanding: I was removing ConfigurationManager everywhere
  - Reality: ConfigurationManager determines projectRoot (from CLI/env/etc)
  - Correct flow: ConfigManager->projectRoot->ProjectConfig->storageMode
  - Need to revert some changes and fix properly
- 2025-06-12: 2025-06-11 14:45: Back on track - simple 2-line fix
  - The fix: ProjectConfig.storageMode determines storage location
  - Already done: Added storageMode to ProjectConfig type
  - Already done: Updated getTasksDirectory to check it
  - Still need: Remove all the dead feature flag code
- 2025-06-12: 2025-06-11 14:50: === FRESH START AFTER RESET ===
  - Git reset completed - starting with clean slate
  - Clear understanding: ProjectConfig controls storage location
  - Simple 2-line fix + dead code removal
- 2025-06-12: 2025-06-11 14:52: Final implementation plan
  - THE CORE FIX (2 lines):
    1. Add storageMode: 'local' | 'centralized' to ProjectConfig interface ✓
    2. Update getTasksDirectory() to load ProjectConfig and check storageMode
  
  - THE CLEANUP:
    - Remove storage-utils.ts entirely (172 lines)
    - Remove feature flag checks from everywhere
    - Remove ConfigurationManager storage methods
    - Remove storage migration tests
    - Update imports/exports
  
  - WHAT STAYS:
    - TaskStoragePathEncoder (needed for path encoding)
    - Basic directory creation logic
  
  - RESULT: Simple per-project storage configuration
- 2025-06-12: 2025-06-11 14:55: MAJOR PIVOT: Centralized-only storage
  - Decision: Remove ALL dual storage support
  - Go all-in on centralized storage in ~/.scopecraft/projects/{encoded}/
  - Much simpler than trying to support both modes
