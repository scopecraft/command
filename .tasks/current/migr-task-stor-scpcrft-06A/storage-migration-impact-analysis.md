# Task Storage Migration Impact Analysis
## Migration from .tasks/ to ~/.scopecraft/

### Document Status
- **Created**: 2025-06-10
- **Updated**: 2025-06-10 (Post environment refactor analysis)
- **Author**: Autonomous Analysis Agent
- **Task**: 01_analyze-integration-impacts-06O

## Executive Summary

The migration of task storage from project-local `.tasks/` directories to a centralized `~/.scopecraft/` location represents a **fundamental architectural shift** in how Scopecraft manages task data. This analysis, updated after the completion of the environment refactor (refc-env-config-fnctnlcmpsble-06A), shows that while the migration remains complex, it is now **significantly more feasible** due to the functional architecture patterns established by the refactor.

### Key Findings

1. **Environment refactor has simplified the migration path** by converting to functional architecture with proper dependency injection
2. **19 source files directly reference `.tasks/` directory** requiring updates
3. **All 4 E2E test suites** will need comprehensive updates
4. **Docker integration** requires dual mount strategy for container access
5. **No permission barriers** exist for MCP server access to ~/.scopecraft
6. **Fish shell integration is migration-safe** with no .tasks dependencies

## Architectural Overview

### Current State (Project-Local Storage)
```
project-root/
├── .tasks/
│   ├── backlog/
│   ├── current/
│   ├── archive/
│   ├── .templates/
│   ├── .modes/
│   └── .config/
├── .sessions/
└── src/
```

### Target State (Centralized Storage)
```
~/.scopecraft/
├── projects/
│   ├── users-alice-projects-myapp/    # Flat, encoded project paths
│   │   ├── tasks/
│   │   │   ├── backlog/
│   │   │   ├── current/
│   │   │   └── archive/
│   │   ├── sessions/
│   │   ├── templates/
│   │   ├── modes/
│   │   └── config/
│   └── users-bob-work-client-project/
│       └── ... (same structure)
├── project-mappings.json              # Optional: encoded → original paths
└── config.json                        # Global configuration
```

## Impact Analysis by Component

### 1. Core Storage Layer

#### Affected Files
- `/src/core/project-config.ts` - Contains `DEFAULT_DIRECTORIES.tasks = '.tasks'`
- `/src/core/directory-utils.ts` - All path construction functions
- `/src/core/task-crud.ts` - Task metadata path construction (critical lines: 155, 224, 329)
- `/src/core/config/configuration-manager.ts` - Project root validation logic

#### Required Changes
```typescript
// New: Path encoding utility
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

// Extended: ConfigurationManager
public getTaskStorageRoot(): string {
  const encoded = TaskStoragePathEncoder.encode(this.getRootConfig().path);
  return path.join(os.homedir(), '.scopecraft', 'projects', encoded, 'tasks');
}

// Updated: directory-utils.ts
export function getTasksDirectory(projectRoot: string, config?: ConfigurationManager): string {
  return config ? config.getTaskStorageRoot() : join(projectRoot, '.tasks');
}
```

### 2. Environment & Worktree Integration

#### Current Architecture (Post-Refactor)
- **Functional approach**: Pure functions in `resolver-functions.ts` and `worktree-functions.ts`
- **Dependency injection**: Functions accept ConfigurationManager as parameter
- **Clear separation**: Worktree paths vs task storage paths

#### Migration Impact
- ✅ **Minimal changes needed** - Functions already accept config parameter
- ✅ **Path resolution ready** - Just needs to use new storage methods
- ⚠️ **Dual-context handling** - Must maintain separation between execution context and storage location

### 3. Docker Execution

#### Current Issue
Docker containers mount only the project workspace, making `.tasks/` accessible. With centralized storage, tasks would be outside the container mount.

#### Required Configuration
```typescript
// Updated Docker mounts
mounts: [
  `${envInfo.path}:/workspace:rw`,                    // Project workspace
  `${os.homedir()}/.scopecraft:/root/.scopecraft:rw`  // Task storage
],
env: {
  SCOPECRAFT_ROOT: '/root/.scopecraft',
  SCOPECRAFT_PROJECT_PATH: '/workspace'
}
```

#### User Mapping
```bash
# Run container as host user to avoid permission issues
--user=${process.getuid()}:${process.getgid()}
```

### 4. MCP Server Integration

#### Current State
- **No permission barriers** - MCP can access any path the process can read
- **No path validation** - Full filesystem access within process permissions
- **Already uses ~/.scopecraft** - For global configuration

#### Migration Requirements
- ✅ Path resolution updates only
- ✅ No security changes needed (but should consider adding path validation)
- ⚠️ Security consideration: Should implement path validation for production

### 5. CLI Commands

#### High Impact Commands
All task CRUD operations need path updates:
- `sc task create` - File creation in new location
- `sc task list` - Directory scanning in ~/.scopecraft
- `sc task get/update/delete` - Path resolution changes
- `sc workflow promote/archive` - Cross-directory moves

#### Display Formatting
- Task paths shown to users need translation
- Relative paths should be from project root, not storage root
- Help text and examples need updates

### 6. Test Suite

#### E2E Tests Requiring Updates
- `/test/e2e/cli-integration.test.ts` (607 lines)
- `/test/e2e/dispatch-command.test.ts` (701 lines)
- `/test/e2e/env-commands.test.ts` (568 lines)
- `/test/e2e/work-command.test.ts` (679 lines)

#### Key Changes Needed
```typescript
// Current test pattern
const TEST_PROJECT = join(process.env.TMPDIR, 'scopecraft-test-*');
expect(existsSync(join(TEST_PROJECT, '.tasks/current/task.md'))).toBe(true);

// New test pattern
const STORAGE_ROOT = join(os.homedir(), '.scopecraft-test');
const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
expect(existsSync(join(STORAGE_ROOT, 'projects', encoded, 'tasks/current/task.md'))).toBe(true);
```

## Security Implementation

### Permission Model
```typescript
const PERMISSIONS = {
  DIRECTORY: 0o700,  // drwx------ (user read/write/execute only)
  FILE: 0o600,       // -rw------- (user read/write only)
};
```

### Path Validation
```typescript
export class ScopecraftSecurityManager {
  static validatePath(targetPath: string): void {
    const scopecraftRoot = path.join(os.homedir(), '.scopecraft');
    const resolved = path.resolve(targetPath);
    
    if (!resolved.startsWith(scopecraftRoot)) {
      throw new Error(`Security: Path ${targetPath} outside ~/.scopecraft`);
    }
    
    if (resolved.includes('..')) {
      throw new Error('Security: Directory traversal detected');
    }
  }
}
```

## Migration Strategy

### Phase 1: Foundation (1-2 days)
1. Implement `TaskStoragePathEncoder` utility
2. Extend `ConfigurationManager` with storage root methods
3. Add security validation utilities
4. Create directory structure initialization

### Phase 2: Core Updates (2-3 days)
1. Update `directory-utils.ts` with optional config parameter
2. Modify task CRUD operations to use new paths
3. Update task metadata construction
4. Implement backward compatibility checks

### Phase 3: Integration Updates (3-4 days)
1. Update Docker configuration for dual mounts
2. Modify CLI commands to use new storage
3. Update output formatters for path display
4. Fix MCP handlers for new paths

### Phase 4: Testing & Migration (2-3 days)
1. Update all E2E tests for new structure
2. Create migration tool for existing projects
3. Implement rollback mechanism
4. Document breaking changes

## Risk Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Task path resolution failures | High | Comprehensive test coverage before migration |
| Docker permission issues | Medium | User ID mapping in container config |
| Test suite breakage | High | Update tests incrementally with feature flag |
| Data loss during migration | Critical | Backup before migration, atomic operations |

### Rollback Strategy
1. **Feature flag**: Runtime switch between old/new storage
2. **Version detection**: Auto-detect storage format
3. **Parallel operation**: Support both locations during transition
4. **Data preservation**: Never delete .tasks/ until confirmed

## Benefits of Migration

### Immediate Benefits
1. **Unified task visibility** across all worktrees
2. **Simplified backup** - Single location for all project tasks
3. **Better isolation** - No task data in project repositories
4. **Cleaner git repos** - No need to gitignore .tasks/

### Long-term Benefits
1. **Cross-project operations** - Easy to implement project switching
2. **Global task search** - Search across all projects
3. **Centralized templates** - Share templates across projects
4. **Better permissions** - Consistent security model

## Recommendations

### Do First
1. **Create proof of concept** with one CLI command
2. **Test Docker dual-mount** strategy
3. **Validate path encoding** edge cases

### Consider Carefully
1. **Migration timing** - After current sprint completion
2. **Feature flag approach** - Gradual rollout recommended
3. **Communication plan** - Users need clear migration guide

### Future Enhancements
1. **Project switching** - `sc switch project-name`
2. **Global task search** - `sc search --all-projects`
3. **Task sharing** - Share templates between projects
4. **Multi-user support** - Shared project spaces (future)

## Work Documents Handling

### Decision: Work Documents Stay in Git

Work documents (TRDs, design docs, analysis) need to remain in the git repository for IDE and coding agent access. They will be organized using a simple folder convention:

```
docs/
└── work/
    ├── auth-feature-05A/
    │   ├── technical-requirements.md
    │   └── jwt-design.md
    └── payment-integration-06B/
        └── stripe-analysis.md
```

### Key Principles

1. **Location**: `docs/work/{task-id}/` as default convention
2. **Configuration**: Work documents path configurable via ConfigurationManager
   ```typescript
   // In ConfigurationManager
   public getWorkDocumentsRoot(): string {
     // Default: {projectRoot}/docs/work
     // Overridable in .scopecraft/config.json
     return this.config.workDocumentsPath || path.join(this.getRootConfig().path, 'docs/work');
   }
   ```
3. **Distinction**: 
   - **Related files**: Existing files that tasks reference
   - **Work documents**: Documents created BY tasks during execution
4. **No Migration**: Work documents don't move to ~/.scopecraft

### Implementation Note

The work documents path should be:
- Managed by ConfigurationManager
- Overridable in project's `.scopecraft/config.json`
- Default to `docs/work/` if not specified

## Conclusion

The environment refactor has transformed this migration from a complex architectural overhaul into a focused path resolution update. With the functional patterns now in place, the primary work is:

1. Implementing the path encoding utility
2. Extending ConfigurationManager with storage methods
3. Threading the config parameter through existing functions
4. Updating tests and integrations
5. Maintaining work documents in git with configurable location

The migration is **technically feasible** and will provide significant long-term benefits, but requires careful execution and comprehensive testing to ensure data safety and system stability.