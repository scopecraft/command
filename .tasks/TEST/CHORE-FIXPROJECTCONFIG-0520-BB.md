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

### Implementation Log (2025-05-19)

#### Completed Work

1. **Reverted Function Signatures** ✅
   - Changed `getTask`, `updateTask`, `deleteTask` back to original signatures
   - Updated all call sites in handlers.ts, commands.ts, task-move.ts
   - Removed options pattern that was incorrectly added

2. **Removed Directory Configuration** ✅
   - Removed `directories` field from `ProjectDefinition` interface
   - Updated `ProjectConfig` to use only `DEFAULT_DIRECTORIES`
   - Kept directory structure hardcoded as intended

3. **Fixed Compilation Issues** ✅
   - Deleted unused `task-crud-debug.ts` file
   - Fixed syntax error in task-crud.ts (extra `});`)
   - Resolved immediate TypeScript errors related to refactor

4. **Comprehensive E2E Testing** ✅
   - Created test plan documenting all scenarios
   - Built automated test script (run-root-dir-e2e.sh)
   - Successfully tested:
     - CLI parameter (--root-dir)
     - Environment variable (SCOPECRAFT_ROOT)
     - Config file (--config)
     - Auto-detection
     - Precedence (CLI > ENV > Config)
     - CRUD operations
     - Worktree simulation
     - Error handling

#### Key Findings

1. Root configuration works correctly for all methods
2. Function signatures are back to original API
3. Directory structure remains fixed (only root is configurable)
4. Git worktree scenario works as intended

#### Template System Issue Found

The template system has two problems:
1. `template-manager.ts` still references `projectConfig.getMode()` which was removed
2. `commands.ts` is importing `getTemplateContent` but the function is actually called `getTemplate`

This needs to be fixed as part of the remaining work.

### What's Left to Complete

#### 1. Fix Template System Integration 🔴
- [ ] Investigate getTemplateContent missing export error
- [ ] Ensure template system works with configurable root paths
- [ ] Update template directory resolution to use runtime config
- [ ] Test template operations with different roots

#### 2. Update Unit Tests 🟡
- [ ] Fix tests that reference removed ProjectMode enum
- [ ] Update test mocks to not use ProjectMode
- [ ] Add tests for RuntimeConfig parameter flow
- [ ] Ensure all existing tests pass

#### 3. MCP Server Testing 🟡
- [ ] Build MCP server with latest changes
- [ ] Test init_root command
- [ ] Test get_current_root command
- [ ] Test list_projects command
- [ ] Verify MCP works with git worktrees
- [ ] Create dedicated testing session

#### 4. Documentation Updates 🟢
- [ ] Update README if needed
- [ ] Review and update project configuration guide
- [ ] Add notes about worktree support
- [ ] Document template system changes (if any)

#### 5. Final Cleanup 🟢
- [ ] Remove any remaining ProjectMode references
- [ ] Clean up any dead code
- [ ] Run linting on affected files
- [ ] Prepare for merge

### Current Status

The core refactor is complete and tested. Main remaining issues:
1. Template system integration needs investigation
2. Unit tests need updates for ProjectMode removal
3. MCP server needs dedicated testing session

The refactor successfully achieved its goals:
- Removed ProjectMode enum
- Integrated ConfigurationManager
- Made only root path configurable
- Maintained backward compatibility
