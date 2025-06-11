# Design storage architecture

---
type: spike
status: done
area: core
---


## Instruction
Design the new storage architecture for tasks in ~/.scopecraft/projects/.

Key design decisions:
1. **Directory structure**: Mirror current .tasks/ structure or optimize?
2. **Work documents**: Where in repo should they live? How to make them discoverable?
3. **Migration strategy**: How to move existing tasks safely
4. **Backwards compatibility**: Support both locations during transition?
5. **Configuration**: How to configure storage location per project

Consider how this integrates with existing ConfigurationManager and project root resolution.

## Tasks
- [x] Design ~/.scopecraft/projects/{encoded-path}/ structure
- [x] Define work documents location and naming convention in repo
- [x] Create migration algorithm (handling conflicts, preserving history)
- [x] Design configuration schema for storage location
- [x] Plan abstraction layer changes in core modules
- [x] Consider caching strategy for performance

## Deliverable
# Storage Architecture Design Document

## Log
- 2025-06-10: === AUTONOMOUS EXECUTION STARTED ===
- Task: 01_design-storage-architecture-06I
- Analysis: type:spike + "Design" in title + architecture focus
- Selected Mode: Design Mode (architectural decision-making)
- Reasoning: Task requires technical design decisions and deliverable is architecture document
- Loading: Proceeding with design approach (mode guidance not accessible)
- 2025-06-10: Found completed research task 01_resr-stor-patt-implctns-06L with comprehensive technical analysis
- Claude's path encoding scheme: '/' → '-' with '-' prefix
- Security, Docker, cross-platform considerations documented
- Backup/sync implications analyzed
- This provides excellent foundation for architectural design
- 2025-06-10: Creating comprehensive architecture design document
- Synthesizing current system analysis with research findings
- Designing directory structure, migration strategy, configuration schema
- Addressing all key design decisions from instruction
- 2025-06-10: ✓ Comprehensive architecture design document completed
- Directory structure: Centralized ~/.scopecraft/projects/ with path encoding
- Work documents: Lightweight .scopecraft/work/ in repo with bidirectional linking
- Migration: Full algorithm with conflict resolution and git integration
- Configuration: Multi-level schemas (global, project, storage metadata)
- Core API: Storage abstraction layer with Legacy/Centralized/Hybrid providers
- Performance: Multi-level caching and indexing system
- Security: Access controls, credential sanitization, encrypted backups
- Implementation: 4-phase rollout plan with success metrics
- 2025-06-10: === EXECUTION COMPLETE ===
- Mode Used: Design Mode (architectural decision-making)
- Status: COMPLETED
- Deliverable: READY
- All key design decisions addressed:
  • Directory structure: Centralized ~/.scopecraft/projects/ with Claude's path encoding
  • Work documents: Lightweight .scopecraft/work/ in repo with bidirectional linking
  • Migration: Comprehensive algorithm with backup, conflict resolution, git integration
  • Backwards compatibility: 90-day hybrid transition with rollback support
  • Configuration: Multi-level schemas (global, project, storage metadata)
  • Core API: Storage abstraction layer (Legacy/Centralized/Hybrid providers)
  • Performance: Multi-level caching, indexing, lazy loading
  • Security: Access controls, credential sanitization, encrypted backups
- Implementation roadmap: 4-phase rollout with success metrics and risk mitigation
- Architecture ready for implementation phase

## Executive summary
This document defines the new storage architecture for migrating Scopecraft tasks from project-local `.tasks/` directories to centralized `~/.scopecraft/projects/` storage. The design preserves existing workflow patterns while addressing security, performance, and maintainability concerns.

## 1. directory structure design
### 1.1 Centralized Storage Layout

```
~/.scopecraft/
├── config.json                    # Global configuration (existing)
├── projects/
│   ├── {encoded-project-path}/     # Project-specific task storage
│   │   ├── .config/
│   │   │   ├── project.json        # Project configuration
│   │   │   └── storage.json        # Storage metadata
│   │   ├── .modes/                 # AI mode configurations
│   │   ├── .templates/             # Task templates
│   │   ├── archive/
│   │   │   └── 2025-06/           # Date-organized archived tasks
│   │   ├── backlog/               # Future tasks
│   │   └── current/               # Active tasks
│   └── cache/
│       ├── project-index.json     # Fast project lookup
│       └── task-index.json        # Cross-project task search
└── logs/
    └── migration.log             # Migration operation logs
```

### 1.2 Path Encoding Algorithm

**Adopted from Claude's proven scheme:**
- Replace all forward slashes (`/`) with hyphens (`-`)
- Prefix with `-` to avoid conflicts
- Examples:
  - `/Users/name/Projects/foo` → `-Users-name-Projects-foo`
  - `/Users/name/Projects/scopecraft.worktrees/feature-branch` → `-Users-name-Projects-scopecraft.worktrees-feature-branch`

### 1.3 Task File Structure (Preserved)

**Current structure is preserved within each project:**
```
{encoded-project-path}/
├── backlog/
│   ├── simple-task-id.task.md
│   └── parent-task-id/
│       ├── _overview.md
│       ├── 01_subtask-name.task.md
│       └── 02_subtask-name.task.md
├── current/
│   └── (same structure)
└── archive/
    └── 2025-06/
        └── (same structure)
```

## 2. work documents organization strategy
### 2.1 In-Repository Work Documents

**Decision:** Keep lightweight work documents in repository, move task storage to `~/.scopecraft/`

**Repository Structure:**
```
.scopecraft/
├── .project-id              # Links to ~/.scopecraft/projects/{encoded-path}
├── work/                    # Lightweight work documents
│   ├── current-focus.md     # Current development focus
│   ├── decisions/           # Architectural decisions
│   ├── plans/              # Planning documents
│   └── notes/              # Development notes
└── README.md               # Project task management guide
```

### 2.2 Document Linking Strategy

**Bidirectional Links:**
- Tasks reference work documents: `See [Decision Log](../../work/decisions/auth-flow.md)`
- Work documents reference tasks: `Implements task: [auth-feature-05A]`
- CLI commands resolve references automatically

**Discoverability:**
- `scopecraft work list` - Show all work documents
- `scopecraft work link <task-id>` - Show linked documents
- Git hooks validate document links on commit

## 3. migration strategy
### 3.1 Migration Algorithm

```mermaid
flowchart TD
    A[Start Migration] --> B[Scan Project for .tasks/]
    B --> C{.tasks/ exists?}
    C -->|No| D[Initialize empty storage]
    C -->|Yes| E[Create backup]
    E --> F[Encode project path]
    F --> G[Create ~/.scopecraft/projects/{encoded}/]
    G --> H[Copy directory structure]
    H --> I[Migrate tasks with metadata]
    I --> J[Update task references]
    J --> K[Create .scopecraft/ link]
    K --> L[Verify migration integrity]
    L --> M{Verification passed?}
    M -->|No| N[Restore from backup]
    M -->|Yes| O[Archive original .tasks/]
    O --> P[Update configuration]
    P --> Q[Complete migration]
    N --> R[Report errors]
```

### 3.2 Conflict Resolution

**Strategy:** Preserve both versions, require manual resolution
```typescript
interface MigrationConflict {
  type: 'task_exists' | 'metadata_mismatch' | 'content_conflict';
  sourcePath: string;
  targetPath: string;
  resolution: 'merge' | 'replace' | 'skip' | 'manual';
}
```

**Conflict Handling:**
1. **Task ID conflicts:** Append `-migrated-{timestamp}` suffix
2. **Content conflicts:** Create `.conflict` files for manual review
3. **Metadata mismatches:** Log differences, use source metadata

### 3.3 History Preservation

**Git Integration:**
- Preserve original `.tasks/` in git history
- Migration creates commit: `"Migrate tasks to ~/.scopecraft (migration-id: {uuid})"`
- Backup includes git metadata for full restoration

## 4. backwards compatibility strategy
### 4.1 Transition Period Support

**Dual Location Support (90-day transition):**
```typescript
export enum StorageLocation {
  LEGACY = 'project-local',    // .tasks/ in project
  CENTRALIZED = 'home-based',  // ~/.scopecraft/projects/
  HYBRID = 'transitional'      // Check both locations
}
```

**Resolution Order:**
1. Check `~/.scopecraft/projects/{encoded}/` (primary)
2. Check `.tasks/` in project (fallback)
3. Prompt for migration if legacy found

### 4.2 Gradual Migration

**Opt-in Migration:**
- `scopecraft migrate --project .` - Migrate current project
- `scopecraft migrate --all` - Migrate all configured projects
- `scopecraft config storage-location centralized` - Set default for new projects

**Rollback Support:**
- `scopecraft migrate --rollback` - Restore from backup
- Maintain backup for 30 days post-migration

## 5. configuration schema
### 5.1 Global Configuration (`~/.scopecraft/config.json`)

```json
{
  "version": "2.0.0",
  "storage": {
    "defaultLocation": "centralized",
    "migrationStatus": {
      "enabled": true,
      "warningThreshold": 90
    },
    "backup": {
      "retentionDays": 30,
      "autoBackup": true
    }
  },
  "projects": {
    "/Users/name/Projects/foo": {
      "encodedPath": "-Users-name-Projects-foo",
      "storageLocation": "centralized",
      "migratedAt": "2025-06-10T17:30:00Z",
      "backupPath": "~/.scopecraft/backups/migration-abc123.tar.gz"
    }
  },
  "performance": {
    "cacheEnabled": true,
    "indexingEnabled": true,
    "maxCacheSize": "100MB"
  }
}
```

### 5.2 Project Configuration (`projects/{encoded}/config/project.json`)

```json
{
  "version": "1.0.0",
  "project": {
    "originalPath": "/Users/name/Projects/foo",
    "encodedPath": "-Users-name-Projects-foo",
    "name": "Foo Project",
    "type": "git"
  },
  "storage": {
    "createdAt": "2025-06-10T17:30:00Z",
    "migratedFrom": "/Users/name/Projects/foo/.tasks",
    "lastAccessed": "2025-06-10T17:45:00Z"
  },
  "features": {
    "workDocuments": true,
    "aiModes": true,
    "templates": true
  }
}
```

### 5.3 Storage Metadata (`projects/{encoded}/config/storage.json`)

```json
{
  "version": "1.0.0",
  "statistics": {
    "totalTasks": 45,
    "tasksByStatus": {
      "todo": 20,
      "in_progress": 5,
      "done": 15,
      "archived": 5
    },
    "tasksByWorkflow": {
      "backlog": 20,
      "current": 10,
      "archive": 15
    }
  },
  "integrity": {
    "lastVerified": "2025-06-10T17:45:00Z",
    "checksum": "sha256:abc123...",
    "taskCount": 45
  }
}
```

## 6. core layer api changes
### 6.1 Storage Abstraction Layer

**New Interface:**
```typescript
export interface StorageProvider {
  resolveTaskPath(taskId: string, projectPath: string): Promise<string>;
  listTasks(projectPath: string, workflow?: WorkflowState): Promise<TaskMetadata[]>;
  createTask(task: TaskData, projectPath: string): Promise<string>;
  updateTask(taskId: string, updates: Partial<TaskData>, projectPath: string): Promise<void>;
  deleteTask(taskId: string, projectPath: string): Promise<void>;
  migrateProject(sourcePath: string, targetLocation: StorageLocation): Promise<MigrationResult>;
}
```

**Implementations:**
- `LegacyStorageProvider` - Existing `.tasks/` logic
- `CentralizedStorageProvider` - New `~/.scopecraft/projects/` logic
- `HybridStorageProvider` - Transition period dual-location support

### 6.2 Configuration Manager Updates

**Enhanced ConfigurationManager:**
```typescript
export class ConfigurationManager {
  // Existing methods...
  
  async getStorageProvider(projectPath: string): Promise<StorageProvider> {
    const config = await this.getProjectConfig(projectPath);
    switch (config.storage.location) {
      case StorageLocation.LEGACY:
        return new LegacyStorageProvider();
      case StorageLocation.CENTRALIZED:
        return new CentralizedStorageProvider();
      case StorageLocation.HYBRID:
        return new HybridStorageProvider();
    }
  }
  
  async migrateProject(projectPath: string): Promise<MigrationResult> {
    // Migration logic
  }
}
```

### 6.3 Directory Utils Updates

**Path Resolution:**
```typescript
export class PathResolver {
  static encodeProjectPath(projectPath: string): string {
    return '-' + projectPath.replace(/\//g, '-');
  }
  
  static decodeProjectPath(encodedPath: string): string {
    return encodedPath.substring(1).replace(/-/g, '/');
  }
  
  static getCentralizedStoragePath(projectPath: string): string {
    const encoded = this.encodeProjectPath(projectPath);
    return path.join(os.homedir(), '.scopecraft', 'projects', encoded);
  }
}
```

## 7. performance optimization
### 7.1 Caching Strategy

**Multi-level Caching:**
1. **Memory Cache:** Recent tasks and metadata (LRU, 50MB limit)
2. **Disk Cache:** Project index and task summaries
3. **Lazy Loading:** Load task content on demand

**Cache Invalidation:**
- File system watchers for task modifications
- Timestamp-based validation
- Manual cache clearing commands

### 7.2 Indexing System

**Search Index:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-06-10T17:45:00Z",
  "projects": {
    "-Users-name-Projects-foo": {
      "taskCount": 45,
      "lastModified": "2025-06-10T17:30:00Z",
      "tags": ["backend", "api", "frontend"],
      "areas": ["core", "ui", "cli"]
    }
  },
  "globalIndex": {
    "tasksByTag": { "backend": ["task-1", "task-2"] },
    "tasksByArea": { "core": ["task-3", "task-4"] },
    "tasksByStatus": { "in_progress": ["task-5"] }
  }
}
```

## 8. security considerations
### 8.1 Access Control

**File Permissions:**
- `~/.scopecraft/`: 700 (owner read/write/execute only)
- Task files: 600 (owner read/write only)
- Config files: 600 (owner read/write only)

**Credential Sanitization:**
- Scan task content for potential secrets
- Warn before storing sensitive data
- Integration with git-secrets patterns

### 8.2 Backup Security

**Encrypted Backups:**
- Optional encryption for backup files
- Integration with system keychain for backup passwords
- Secure deletion of temporary files

## 9. implementation phases
### Phase 1: Foundation (Week 1-2)
- [ ] Implement path encoding/decoding utilities
- [ ] Create storage abstraction interfaces
- [ ] Add centralized storage provider
- [ ] Update configuration schema

### Phase 2: Migration (Week 3-4)
- [ ] Implement migration algorithm
- [ ] Add conflict resolution logic
- [ ] Create backup/restore functionality
- [ ] Build migration CLI commands

### Phase 3: Integration (Week 5-6)
- [ ] Update core CRUD operations
- [ ] Implement hybrid storage provider
- [ ] Add performance optimizations
- [ ] Update MCP server integration

### Phase 4: Validation (Week 7-8)
- [ ] Comprehensive testing
- [ ] Performance benchmarking
- [ ] Security audit
- [ ] Documentation updates

## 10. success metrics
**Technical Metrics:**
- Migration success rate: >99%
- Performance impact: <10% slower than current
- Storage space reduction: >30% (due to deduplication)
- Cache hit rate: >80%

**User Experience Metrics:**
- Migration time: <5 minutes for typical project
- Zero data loss during migration
- Backwards compatibility maintained during transition
- CLI command response time unchanged

## 11. risk mitigation
**High-Risk Scenarios:**
1. **Data Loss During Migration**
   - Mitigation: Mandatory backups, verification steps, rollback capability

2. **Performance Degradation**
   - Mitigation: Caching, indexing, lazy loading, benchmarking

3. **Cross-Platform Compatibility Issues**
   - Mitigation: Path abstraction, cross-platform testing, platform-specific handling

4. **Configuration Conflicts**
   - Mitigation: Schema validation, migration verification, conflict resolution

## Conclusion
This architecture design provides a robust foundation for migrating Scopecraft task storage to a centralized location while maintaining compatibility, security, and performance. The phased implementation approach ensures minimal disruption to existing workflows while delivering significant long-term benefits.
