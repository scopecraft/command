+++
id = "CHORE-FIXPROJECTCONFIG-0520-BB"
title = "Fix ProjectConfig refactor - revert incorrect function signatures and directory config"
type = "chore"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "test"
+++

## Current State Summary

### What Was Done Correctly
1. ✅ Removed ProjectMode enum
2. ✅ Integrated ConfigurationManager into ProjectConfig  
3. ✅ Removed hardcoded .ruru directory logic
4. ✅ Created WIP commit with core changes

### What Was Done Incorrectly
1. ❌ Changed function signatures to options pattern (getTask, updateTask, deleteTask)
2. ❌ Added configurable directories to ProjectDefinition
3. ❌ Misunderstood the purpose of phase/subdirectory parameters

### What Needs to Be Fixed

#### 1. Revert Function Signatures
- Change back: `getTask(id, { phase?, subdirectory? })` → `getTask(id, phase?, subdirectory?)`
- Same for: `updateTask`, `deleteTask`, and all related functions
- Update all call sites in handlers.ts, commands.ts, etc.
- The phase and subdirectory parameters are for querying, not configuration

#### 2. Remove Configurable Directories
- Remove `directories` field from `ProjectDefinition` interface in types.ts
- Keep directory structure hardcoded:
  - Tasks root: `.tasks`
  - Phases: `.tasks/phases`
  - Config: `.tasks/config`
  - Templates: `.tasks/templates`

#### 3. Fix ProjectConfig
- Keep ConfigurationManager integration for root path only
- Remove any directory configuration logic
- Ensure only the root path is configurable (for git worktree support)

### Implementation Steps

1. **Revert function signatures in task-crud.ts and related files**
2. **Update all call sites to use original signatures**
3. **Remove directories configuration from types.ts**
4. **Fix compilation errors**
5. **Update tests for ProjectMode removal**
6. **Test manually with git worktrees**

### Key Insight
We only need to make the root path configurable (for scenarios like git worktrees), not the entire internal directory structure. The phase/subdirectory parameters in functions are for querying within the fixed structure, not for configuration.

### Testing Plan
1. Ensure function signatures match original API
2. Verify directory structure remains fixed
3. Test root path configuration with worktrees
4. Run existing tests and fix failures
