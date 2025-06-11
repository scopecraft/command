# Analyze integration impacts

---
type: spike
status: done
area: core
---


## Instruction
Analyze how the storage migration impacts existing integrations and workflows.

Key integration points:
1. **Worktree workflows**: How worktrees will share task visibility
2. **Docker execution**: Container access to ~/.scopecraft
3. **Session management**: Impact on .sessions/ storage (should it move too?)
4. **MCP server**: Changes needed for AI agents to access external paths
5. **CLI commands**: Impact on task listing, creation, updates
6. **Fish shell integration**: Updates to tw-start.fish and related scripts

**Important**: Review task refc-env-config-fnctnlcmpsble-06A which is refactoring the ConfigurationManager/env system. Their regression tests and patterns will be crucial for our migration.

Focus on identifying breaking changes and mitigation strategies.

## Tasks
- [x] Map all code touching .tasks/ directory
- [x] Review refc-env-config-fnctnlcmpsble-06A implementation and tests
- [x] Analyze worktree service integration points
- [x] Review Docker mode implementation for volume mounting
- [x] Check MCP permission model for external file access
- [x] List affected CLI commands and their changes
- [x] Review fish shell scripts that assume .tasks/ location
- [x] Identify test suite impacts

## Deliverable
# Task Storage Migration Impact Analysis (UPDATED)
### Executive Summary

Migrating task storage from `.tasks/` to `~/.scopecraft/` remains a **significant system-wide change**, but the completed environment refactor has **substantially simplified** the migration path. The functional architecture and dependency injection patterns are now in place.

### Key Change from Environment Refactor
- **Environment system now uses functional architecture** with proper dependency injection
- **ConfigurationManager remains as singleton** (correctly - it's the foundation)
- **Path resolution still assumes .tasks/** but architecture is ready for change

### Updated Storage Architecture

### Flat Folder Structure (Like Claude)
```
~/.scopecraft/
├── projects/
│   ├── users-davidpaquet-projects-scopecraft/
│   │   ├── tasks/
│   │   │   ├── backlog/
│   │   │   ├── current/
│   │   │   └── archive/
│   │   ├── sessions/
│   │   ├── templates/
│   │   ├── modes/
│   │   └── config/
│   └── users-alice-projects-my-app/
│       └── ... (same structure)
├── project-mappings.json
└── config.json
```

### Path Encoding Strategy
```typescript
// Example transformations:
/Users/alice/projects/my-app → users-alice-projects-my-app
/home/bob/work/client-project → home-bob-work-client-project
```

### Simplified Migration Path

### Phase 1: Core Infrastructure
1. **Create TaskStoragePathEncoder** utility class
2. **Extend ConfigurationManager** with:
   - `getProjectStorageRoot()` - Base path for project
   - `getTaskStorageRoot()` - Returns `{project}/tasks`
   - `getSessionStorageRoot()` - Returns `{project}/sessions`
   - `getModesStorageRoot()` - Returns `{project}/modes`
3. **Security implementation**:
   - Simple permissions: 0o700 for directories, 0o600 for files
   - Path validation to prevent directory traversal
   - All operations restricted to ~/.scopecraft

### Phase 2: Update Path Resolution
1. **Modify directory-utils.ts** to accept optional ConfigurationManager
2. **Thread config parameter** through functions (mostly done!)
3. **Maintain backward compatibility** with fallback to `.tasks/`

### Phase 3: Update Integrations
1. **Docker**: Add ~/.scopecraft mount to containers
2. **MCP**: Already has access (no permission barriers)
3. **CLI**: Update commands to use new paths
4. **Tests**: Update E2E tests for new structure

### What's Easier Now

### Thanks to Environment Refactor:
1. **No more singleton coupling** - Functions accept ConfigurationManager
2. **Clean dependency injection** - Config flows through properly
3. **Worktree integration ready** - Already separated from task storage
4. **Session bug fixed** - Consistent path resolution in place

### Reduced Complexity:
- **No class refactoring needed** - Environment already functional
- **ConfigurationManager stays as-is** - Just needs extension
- **Path threading mostly done** - Refactor established the pattern

### Critical Implementation Details

### 1. Path Encoder Utility
```typescript
export class TaskStoragePathEncoder {
  static encode(projectPath: string): string {
    return path.resolve(projectPath)
      .split(path.sep)
      .filter(Boolean)
      .join('-')
      .replace(/[^a-zA-Z0-9-]/g, '_')
      .toLowerCase();
  }
}
```

### 2. ConfigurationManager Extension
```typescript
public getTaskStorageRoot(): string {
  const encoded = TaskStoragePathEncoder.encode(this.getRootConfig().path);
  return path.join(os.homedir(), '.scopecraft', 'projects', encoded, 'tasks');
}
```

### 3. Directory Utils Update
```typescript
export function getTasksDirectory(projectRoot: string, config?: ConfigurationManager): string {
  return config ? config.getTaskStorageRoot() : join(projectRoot, '.tasks');
}
```

### Remaining Challenges

### Technical:
1. **Task metadata paths** - Lines 155, 224, 329 in task-crud.ts
2. **E2E test updates** - All 4 test files need path changes
3. **Migration tooling** - Move existing .tasks data

### Architectural Decisions:
1. **Session storage location** - Keep in project or separate?
2. **Rollback strategy** - Runtime flag vs version detection
3. **Permission model** - Simple 0o700/0o600 approach chosen

### Risk Assessment (Updated)

### Reduced Risks:
- ✅ Architecture coupling eliminated by refactor
- ✅ Dependency injection patterns established
- ✅ Session resolution bugs already fixed

### Remaining Risks:
- ⚠️ Task CRUD operations need careful updates
- ⚠️ Test suite requires comprehensive changes
- ⚠️ Docker integration needs dual mounts

### Recommendations

### Immediate Actions:
1. **Implement TaskStoragePathEncoder** utility
2. **Extend ConfigurationManager** with new methods
3. **Create proof-of-concept** with one command

### Migration Strategy:
1. **Feature flag approach** for gradual rollout
2. **Parallel operation** during transition period
3. **Automated migration tool** for existing projects

The environment refactor has transformed this from a complex architectural overhaul into a focused path resolution update. The migration is now **significantly more feasible**.

## Log
- 2025-06-10: 2025-06-10 15:30: === AUTONOMOUS EXECUTION STARTED ===
- Task: 01_analyze-integration-impacts-06O
- Analysis: type:spike, area:core, focuses on "Analyze integration impacts" with research keywords
- Selected Mode: exploration (type:spike + research/analysis keywords)
- Reasoning: This is a spike task focused on understanding and documenting impacts across the system
- Loading: No mode guidance files found, proceeding with exploration approach
- Focus: Map all integration points, identify breaking changes, document mitigation strategies
- 2025-06-10: 2025-06-10 16:00: Integration analysis COMPLETE ✓
- Mapped all code touching .tasks/ directory (19 source files)
- Analyzed environment refactor task (refc-env-config-fnctnlcmpsble-06A) - critical dual-context insights
- Examined worktree integration points - storage separation needed
- Analyzed Docker mode - requires dual mount strategy + permission fixes
- Verified MCP permissions - no security barriers to ~/.scopecraft access
- Identified CLI command impacts - significant changes across task CRUD
- Reviewed Fish shell integration - migration-safe (no .tasks dependencies)
- Analyzed test suite impacts - comprehensive E2E test updates required
- Creating comprehensive impact analysis document...
- 2025-06-10: 2025-06-10 16:15: === EXECUTION COMPLETE ===
- Mode Used: exploration
- Status: COMPLETED
- Deliverable: READY
- Questions: Session storage decision needed (move to ~/.scopecraft/sessions/?)
- Follow-up: Wait for environment refactor completion before implementation
- Key Finding: Migration is technically feasible but requires major architectural coordination
- Critical Blocker: Must complete refc-env-config-fnctnlcmpsble-06A first
- 2025-06-11: 2025-06-10 17:00: === RE-ANALYSIS AFTER ENV REFACTOR ===
- Environment refactor (refc-env-config-fnctnlcmpsble-06A) is now COMPLETE
- Key finding: Functional architecture already implemented for environment system
- ConfigurationManager remains as singleton (good - it's the foundation)
- Task storage still hardcoded to .tasks/ in directory-utils.ts
- New simplified migration path identified

2025-06-10 17:15: === REFINED STORAGE ARCHITECTURE ===
- Flat folder structure: ~/.scopecraft/projects/users-alice-projects-myapp/
- Path encoding utility needed (like Claude's approach)
- Subdirectories: tasks/, sessions/, templates/, modes/, config/
- Simple permissions: 0o700 for dirs, 0o600 for files (user-only access)
- No magic permission patterns - keep it consistent

2025-06-10 17:20: === UPDATED MIGRATION APPROACH ===
1. Create TaskStoragePathEncoder utility for flat paths
2. Extend ConfigurationManager with storage root methods
3. Update directory-utils.ts to use new paths when config provided
4. Thread config parameter through (mostly done by env refactor!)
5. Implement security: path validation + consistent permissions
- Migration is NOW MORE FEASIBLE due to cleaner architecture

## Executive summary
Migrating task storage from `.tasks/` to `~/.scopecraft/` will have **significant system-wide impact** requiring coordinated changes across 7 major integration areas. The migration is **technically feasible** but requires careful sequencing and comprehensive testing.

## Complete list of affected modules/files
### Core Storage Layer (Critical Path)
- `/src/core/project-config.ts` - DEFAULT_DIRECTORIES.tasks = '.tasks'
- `/src/core/directory-utils.ts` - getTasksDirectory() function
- `/src/core/task-crud.ts` - Task metadata path construction (lines 155, 224, 329)
- `/src/core/config/configuration-manager.ts` - Root validation logic

### Environment & Worktree Integration (19 files)
- `/src/core/environment/` - All files (EnvironmentResolver, WorktreeManager)
- `/src/core/worktree/` - Worktree service and cache management
- `/src/core/parent-tasks.ts` - Parent task operations

### CLI Interface (High Impact)
- `/src/cli/commands.ts` - All task commands and path display
- `/src/cli/entity-commands.ts` - Command routing and validation
- `/src/cli/formatters.ts` - Task path display formatting
- `/src/cli/init.ts` - Project structure initialization

### MCP Server Integration
- `/src/mcp/handlers/shared/config-utils.ts` - Project config loading
- `/src/mcp/normalized-handlers.ts` - All MCP operations
- `/src/integrations/channelcoder/utils.ts` - Mode prompt paths

### Test Suite (4 E2E + 3 Unit)
- `/test/e2e/*.test.ts` - All E2E tests (607-701 lines each)
- `/test/unit/core/environment/*.test.ts` - Environment tests
- `/test/unit/mcp/section-sanitization.test.ts` - MCP tests

### Supporting Infrastructure
- `/scripts/normalize-all-tasks.ts` - Task processing scripts
- `/scripts/utils/claude-helper.ts` - Exclusion patterns

## Breaking changes by integration
### 1. Worktree Workflows - CRITICAL ARCHITECTURE CHANGE
**Current**: Each worktree has independent `.tasks/` directory
**After**: Unified `~/.scopecraft/projects/{project-id}/` storage

**Breaking Changes**:
- Task isolation per worktree eliminated → unified visibility
- WorktreeManager path resolution breaks
- EnvironmentResolver task lookup fails
- Dual-context problem exposed (execution vs project contexts)

**Critical Dependency**: Environment refactor (refc-env-config-fnctnlcmpsble-06A) must complete first

### 2. Docker Execution - REQUIRES INFRASTRUCTURE UPDATE
**Current**: Single mount `/workspace` includes `.tasks/`
**After**: Dual mount strategy required

**Breaking Changes**:
- Tasks inaccessible to containers without new mount
- Permission mapping issues (host user vs container user)
- Environment variable updates needed

**Required Docker Config**:
```typescript
mounts: [
  `${envInfo.path}:/workspace:rw`,           // Project workspace  
  `${os.homedir()}/.scopecraft:/root/.scopecraft:rw`  // Task storage
],
env: { SCOPECRAFT_ROOT: '/root/.scopecraft' }
```

### 3. Session Management - ARCHITECTURE DECISION NEEDED
**Current**: Sessions stored globally at `~/.sessions/`
**Question**: Should sessions move to `~/.scopecraft/sessions/`?

**Impact**: Affects ChannelCoder integration and UI session monitoring

### 4. MCP Server - NO PERMISSION BARRIERS
**Finding**: MCP already has full access to `~/.scopecraft/` paths
**Breaking Changes**: None - path resolution updates only
**Security Note**: No access controls exist (potential security concern)

### 5. CLI Commands - COMPREHENSIVE CHANGES REQUIRED
**Breaking Changes**:
- Task metadata path construction (task-crud.ts:155,224,329)
- All task CRUD operations (create, get, list, update, delete)
- Project initialization and structure validation
- Path display in formatters and help text
- Workflow promotion/archiving operations

### 6. Fish Shell Integration - MIGRATION SAFE ✓
**Finding**: No `.tasks/` dependencies in Fish functions
**Issue Found**: Missing `feat-start` command in `task-worktree.ts`
**Breaking Changes**: None for storage migration

### 7. Test Suite - COMPREHENSIVE UPDATES REQUIRED
**Breaking Changes**:
- All E2E tests fail without path updates
- Test project setup assumes `.tasks/` structure  
- Path assertions hardcoded to old locations
- Cleanup logic needs complete rework
- Test isolation from user data required

## Mitigation strategies
### Phase 1: Foundation (Prerequisite)
1. **Complete environment refactor** (refc-env-config-fnctnlcmpsble-06A)
2. **Update core path resolution** (project-config.ts, directory-utils.ts)
3. **Implement project → storage mapping** in ConfigurationManager

### Phase 2: Core Operations
1. **Update task CRUD operations** with new path resolution
2. **Fix task metadata construction** (3 critical lines in task-crud.ts)
3. **Update CLI command handlers** for new storage paths

### Phase 3: Integration Updates
1. **Update Docker configuration** for dual mount strategy
2. **Fix MCP handler path resolution**
3. **Update all test suites** for new storage location

### Phase 4: Migration & Validation
1. **Create migration tooling** for existing `.tasks/` data
2. **Implement backward compatibility** detection
3. **Comprehensive regression testing**

## Testing requirements
### Critical Test Updates
1. **E2E Test Infrastructure**: Update all 4 E2E test files
2. **Environment Tests**: Leverage refc-env regression tests
3. **Docker Integration**: Test dual mount strategy
4. **Migration Testing**: Validate data migration from `.tasks/`
5. **Isolation Testing**: Ensure tests don't affect user data

### Test Strategy
1. **Before**: Run full regression suite on current system
2. **During**: Incremental testing after each phase
3. **After**: Comprehensive E2E validation of all workflows

## Rollback considerations
### Rollback Complexity: HIGH
**Why**: Migration affects core path resolution throughout system

### Rollback Strategy
1. **Configuration Flag**: Runtime switch between storage locations
2. **Migration Detection**: Auto-detect old vs new storage format
3. **Data Preservation**: Keep original `.tasks/` during migration
4. **Version Pinning**: Lock to pre-migration version if needed

### Rollback Risks
- Task data created post-migration inaccessible to old system
- Configuration format changes
- Test suite modifications may not be backward compatible

## Critical dependencies
1. **Environment Refactor** (refc-env-config-fnctnlcmpsble-06A) - MUST complete first
2. **ConfigurationManager Functional Refactor** - Required for dual-context support
3. **Docker Infrastructure** - Container runtime environment updates

## Recommendations
### High Priority
1. **Wait for environment refactor completion** before starting migration
2. **Create comprehensive test coverage** before any changes
3. **Implement runtime configuration flag** for safe rollback

### Technical Approach
1. **Gradual migration** with backward compatibility
2. **Leverage existing configuration patterns** from refc-env work
3. **Maintain separation** between project root and task storage paths

### Risk Mitigation
1. **Test in isolated environment** first
2. **Create automated migration tooling**
3. **Document all breaking changes** for users

This migration represents a **major architectural change** requiring careful planning and execution across the entire system.
