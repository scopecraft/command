# ADR-001: Migrate Task Storage to ~/.scopecraft

**Status:** Implemented (Centralized-Only)  
**Date:** 2025-06-10  
**Updated:** 2025-06-11  
**Authors:** Autonomous Architecture Synthesis  
**Reviewers:** User Consolidated Analysis  

## Context

Scopecraft currently stores task data in project-local `.tasks/` directories, creating git noise from AI execution logs and limiting cross-project task management capabilities. This ADR documents the decision to migrate task storage to a centralized `~/.scopecraft/projects/` location following Claude's proven pattern.

### Research Foundation

This decision is based on comprehensive research from three parallel analysis tasks and leverages the completed environment refactor (refc-env-config-fnctnlcmpsble-06A) that created the functional architecture foundation necessary for this migration.

**Research Sources:**
- **User's consolidated analysis** (storage-migration-impact-analysis.md) - PRIMARY
- Storage patterns and implications research (01_resr-stor-patt-implctns-06L)
- Storage architecture design research (01_design-storage-architecture-06I)  
- Integration impacts analysis (01_analyze-integration-impacts-06O)
- Environment refactor functional architecture (refc-env-config-fnctnlcmpsble-06A)

## Decision

We will use centralized-only task storage at `~/.scopecraft/projects/{encoded-path}/`, completely replacing project-local `.tasks/` directories. This decision simplifies the implementation by avoiding dual-location complexity.

### 1. Path Encoding Strategy

**Decision:** Use flat, readable path encoding  
**Format:** `users-alice-projects-myapp` (not Claude's `-Users-alice-Projects-myapp`)  
**Rationale:** More readable than Claude's dash-prefixed scheme while maintaining uniqueness

### 2. Directory Structure

**Decision:** Centralized structure with tasks subdirectory
```
~/.scopecraft/
├── projects/
│   └── users-davidpaquet-projects-scopecraft/
│       ├── tasks/           # Task storage (migrated from .tasks/)
│       │   ├── backlog/
│       │   ├── current/
│       │   └── archive/
│       ├── sessions/        # Session storage (migrated from .sessions/)
│       ├── templates/       # Template storage (migrated from .templates/)
│       ├── modes/          # Mode storage (migrated from .modes/)
│       └── config/         # Project-specific configuration
└── config.json            # Global configuration
```

**Rationale:** Clear separation of concerns with dedicated subdirectories for each data type

### 3. Sessions Migration

**Decision:** YES - Migrate sessions to `~/.scopecraft/projects/{encoded}/sessions/`  
**Rationale:** Unified storage location eliminates current session monitoring bugs across worktrees

### 4. Templates and Modes Migration  

**Decision:** YES - Migrate to centralized storage  
**Rationale:** Enables sharing templates/modes across projects and eliminates duplication

### 5. Work Documents Location

**Decision:** Work documents stay in repository at `docs/work/{task-id}/`  
**Rationale:** Maintains IDE and coding agent accessibility while keeping task execution logs separate

### 6. Docker Integration Approach

**Decision:** Handle Docker mounting as separate task after core migration  
**Rationale:** Focus on core migration first, then address container access patterns

### 7. Migration Scope

**Decision:** Single project, single developer focused migration  
**Rationale:** This is not an enterprise rollout - optimize for simplicity over scalability

## Architecture Decisions Matrix

| Decision Point | Options Considered | Selected | Rationale |
|---|---|---|---|
| **Path Encoding** | Claude's `-Users-name-Projects-foo` vs flat `users-name-projects-foo` | Flat readable | More readable, less cryptic |
| **Directory Structure** | Flat vs nested with subdirectories | Nested with `/tasks/` subdir | Clear separation, better organization |
| **Sessions Location** | Keep global vs migrate with tasks | Migrate with tasks | Unified storage, fixes monitoring bugs |
| **Work Documents** | Migrate vs stay in repo | Stay in repo | Maintains IDE/agent accessibility |
| **Migration Strategy** | Big bang vs incremental | Centralized-only (simplified) | Simplicity over gradual rollout |
| **Implementation Scope** | Full enterprise vs focused | Single project focused | Pragmatic scope matching user needs |

## Implementation Plan

### Phase 2: Foundation (2-3 AI task hours)

**Task:** `impl-storage-foundation-{id}`
- Create `TaskStoragePathEncoder` utility class
- Extend `ConfigurationManager` with storage root methods:
  - `getProjectStorageRoot()` → `~/.scopecraft/projects/{encoded}/`
  - `getTaskStorageRoot()` → `{project}/tasks/`
  - `getSessionStorageRoot()` → `{project}/sessions/`
- Add security validation and directory creation
- Update `directory-utils.ts` to accept optional ConfigurationManager

**Task:** `impl-path-resolution-update-{id}`
- Update core path resolution functions to use centralized storage
- Update task metadata path construction (critical lines in task-crud.ts)

### Phase 3: Core Migration (2-3 AI task hours)

**Task:** `impl-task-crud-migration-{id}`
- Update all task CRUD operations to use new storage paths
- Implement dual-location support during transition
- Update CLI commands for new path resolution
- Add migration status tracking

**Task:** `impl-sessions-modes-migration-{id}`
- Migrate session storage to new location
- Move templates and modes to centralized storage
- Update ChannelCoder integration for new session paths
- Ensure UI session monitoring works with new structure

### Phase 4: Integration Updates (3-4 AI task hours)

**Task:** `impl-test-suite-updates-{id}`
- Update all 4 E2E test suites for new storage structure
- Modify test project setup for centralized storage
- Update path assertions and cleanup logic
- Ensure test isolation from user data

**Task:** `impl-mcp-cli-integration-{id}`
- Update MCP handlers for new storage paths
- Modify CLI output formatters for path display
- Update help text and examples
- Ensure consistent user experience

### Phase 5: Migration Tooling (2-3 AI task hours)

**Task:** `impl-migration-tooling-{id}`
- Create migration command: `sc migrate --project .`
- Implement conflict resolution and backup creation
- Add migration verification and rollback capability
- Create user migration guide documentation

**Task:** `impl-docker-integration-{id}`
- Update Docker configuration for dual mount strategy
- Handle user permission mapping in containers
- Test container access to centralized storage
- Document Docker integration changes

## Technical Implementation Details

### Path Encoder Implementation
```typescript
export class TaskStoragePathEncoder {
  static encode(projectPath: string): string {
    const resolved = path.resolve(projectPath);
    const parts = resolved.split(path.sep).filter(Boolean);
    
    // Convert to lowercase, readable format
    return parts
      .join('-')
      .replace(/[^a-zA-Z0-9-]/g, '_')
      .toLowerCase();
  }
  
  static decode(encodedPath: string): string {
    // Implementation for reverse mapping
    return encodedPath.replace(/-/g, path.sep);
  }
}
```

### ConfigurationManager Extensions
```typescript
public getProjectStorageRoot(): string {
  const encoded = TaskStoragePathEncoder.encode(this.getRootConfig().path);
  return path.join(os.homedir(), '.scopecraft', 'projects', encoded);
}

public getTaskStorageRoot(): string {
  return path.join(this.getProjectStorageRoot(), 'tasks');
}

public getSessionStorageRoot(): string {
  return path.join(this.getProjectStorageRoot(), 'sessions');
}
```

### Security Implementation
```typescript
const PERMISSIONS = {
  DIRECTORY: 0o700,  // drwx------ (user only)
  FILE: 0o600,       // -rw------- (user only)
};

export function validateScopecraftPath(targetPath: string): void {
  const scopecraftRoot = path.join(os.homedir(), '.scopecraft');
  const resolved = path.resolve(targetPath);
  
  if (!resolved.startsWith(scopecraftRoot)) {
    throw new Error(`Security: Path ${targetPath} outside ~/.scopecraft`);
  }
}
```

## Risk Assessment

### High Risk
- **Task path resolution failures** → Comprehensive test coverage before migration
- **Data loss during migration** → Mandatory backups, atomic operations, rollback capability

### Medium Risk  
- **Docker permission issues** → User ID mapping in container configuration
- **Cross-platform path differences** → Use Node.js path utilities, test on all platforms

### Low Risk
- **Performance degradation** → Caching and indexing strategies available
- **Configuration conflicts** → Schema validation and migration verification

## Migration Approach

Since we've chosen centralized-only storage, migration is straightforward:
1. **One-time migration**: Move existing `.tasks/` content to centralized location
2. **Clean break**: No dual-location support or gradual rollout
3. **Simple implementation**: All new operations use centralized storage

## Success Metrics

- **Migration Success Rate**: >99% of projects migrate without data loss
- **Performance Impact**: <10% performance degradation during transition
- **User Experience**: No breaking changes to CLI commands
- **Test Coverage**: All E2E tests pass with new storage structure

## Benefits Realized

### Immediate Benefits
- Unified task visibility across all worktrees
- Cleaner git repositories (no .tasks/ noise)
- Simplified backup (single location for all project tasks)
- Better task data isolation from source code

### Long-term Benefits  
- Cross-project task operations and search capabilities
- Centralized template and mode sharing
- Consistent security model across all projects
- Foundation for future multi-project features

## Dependencies

- **Environment Refactor**: refc-env-config-fnctnlcmpsble-06A (COMPLETED ✓)
- **Functional Architecture**: ConfigurationManager dependency injection (AVAILABLE ✓)
- **Test Infrastructure**: Regression test patterns (AVAILABLE ✓)

## Related Documents

- [Task Storage Migration Impact Analysis](../.tasks/current/migr-task-stor-scpcrft-06A/storage-migration-impact-analysis.md)
- [Environment Refactor TRD](../.tasks/backlog/refc-env-config-fnctnlcmpsble-06A/_overview.md)
- [Storage Architecture Design](../.tasks/current/migr-task-stor-scpcrft-06A/01_design-storage-architecture-06I.task.md)

## Approval

This ADR has been approved based on:
- ✅ Comprehensive research analysis across three parallel tasks  
- ✅ User's consolidated analysis taking precedence over research findings
- ✅ Completed environment refactor providing functional foundation
- ✅ Risk mitigation strategies for all identified concerns
- ✅ Incremental implementation plan with realistic AI task sizing
- ✅ Clear rollback strategy and success metrics

**Status**: Ready for Phase 2 implementation

---

*This ADR documents the final architecture decisions for migrating Scopecraft task storage from project-local `.tasks/` directories to centralized `~/.scopecraft/projects/` storage, synthesizing findings from comprehensive research and the user's consolidated analysis.*