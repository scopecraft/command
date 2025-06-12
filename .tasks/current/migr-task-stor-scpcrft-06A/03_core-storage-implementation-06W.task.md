# Core storage implementation

---
type: feature
status: in_progress
area: core
---


## Instruction
Implement the core storage migration infrastructure for moving tasks from `.tasks/` to `~/.scopecraft/projects/{encoded}/`.

**CONTEXT**: This is the primary implementation task that builds the foundation and core functionality. The Architecture Decision Record (ADR) at `docs/adr/001-task-storage-migration.md` contains all architectural decisions.

**Key Implementation Requirements**:

1. **Path Encoding Implementation**
   - Create `TaskStoragePathEncoder` class using flat readable encoding
   - Format: `users-davidpaquet-projects-scopecraft` (lowercase, hyphens)
   - Handle edge cases and special characters

2. **ConfigurationManager Extensions**
   - Add methods: `getProjectStorageRoot()`, `getTaskStorageRoot()`, `getSessionStorageRoot()`
   - Maintain backward compatibility with existing methods
   - Leverage the functional architecture from environment refactor

3. **Directory Structure Creation**
   ```
   ~/.scopecraft/projects/{encoded}/
   ├── tasks/
   ├── sessions/
   ├── templates/
   ├── modes/
   └── config/
   ```

4. **Core Path Resolution Updates**
   - Update `directory-utils.ts` to accept optional ConfigurationManager
   - Implement dual-location support (check new location, fallback to .tasks/)
   - Add feature flag for gradual migration

5. **Task CRUD Migration**
   - Update all task create/read/update/delete operations
   - Fix critical path construction lines in task-crud.ts (155, 224, 329)
   - Ensure metadata paths work with new structure

6. **Session/Template/Mode Migration**
   - Update session storage to new location
   - Migrate templates and modes to centralized storage
   - Update ChannelCoder integration for new paths

**IMPORTANT**: 
- Study the completed environment refactor (refc-env-config-fnctnlcmpsble-06A) for patterns
- 19 source files reference `.tasks/` - update them systematically
- Maintain backward compatibility throughout
- This is a single-project migration, optimize for simplicity

## Tasks
- [ ] Create TaskStoragePathEncoder utility class with encode/decode methods
- [ ] Extend ConfigurationManager with storage root methods
- [ ] Create directory initialization and validation utilities
- [ ] Update directory-utils.ts with optional ConfigurationManager parameter
- [ ] Implement feature flag system for migration enablement
- [ ] Update task CRUD operations to use new storage paths
- [ ] Fix task metadata path construction (critical lines)
- [ ] Implement dual-location resolution (new first, .tasks/ fallback)
- [ ] Update session storage to use new paths
- [ ] Migrate template and mode storage locations
- [ ] Update ChannelCoder session integration
- [ ] Add security validation for path operations
- [ ] Create migration status tracking in ConfigurationManager
- [ ] Test all operations with both old and new storage locations

## Deliverable
### Core Storage Implementation Complete

### Implemented Components

1. **TaskStoragePathEncoder** (`src/core/task-storage-path-encoder.ts`)
   - Flat readable encoding: `/Users/alice/Projects/myapp` → `users-alice-projects-myapp`
   - Security validation for ~/.scopecraft paths
   - Helper methods for all storage subdirectories

2. **ConfigurationManager Extensions** 
   - Added 6 storage root methods: `getProjectStorageRoot()`, `getTaskStorageRoot()`, etc.
   - Full backward compatibility maintained
   - Leverages functional architecture from environment refactor

3. **Storage Utilities** (`src/core/storage-utils.ts`)
   - Feature flag system (environment-based)
   - Directory initialization with proper permissions (0o700)
   - Migration status tracking
   - Storage validation utilities

4. **Directory Utils Updates**
   - All functions now accept optional ConfigurationManager
   - Dual-location resolution implemented (new first, .tasks/ fallback)
   - Feature flag checks for gradual migration

5. **Task CRUD Migration**
   - All CRUD operations updated to support ConfigurationManager
   - Fixed critical path construction lines (155, 224, 329)
   - Maintains full backward compatibility

6. **Session Storage Updates**
   - ChannelCoder integration updated for dual-location
   - Session migration controlled by feature flag

### Directory Structure Created
```
~/.scopecraft/projects/users-davidpaquet-projects-scopecraft/
├── tasks/
│   ├── backlog/
│   ├── current/
│   └── archive/
├── sessions/
├── templates/
├── modes/
└── config/
```

### Feature Flags
- `SCOPECRAFT_ENABLE_CENTRALIZED_STORAGE` - Main migration toggle
- `SCOPECRAFT_ENABLE_SESSION_MIGRATION` - Session storage migration
- `SCOPECRAFT_ENABLE_TEMPLATE_MIGRATION` - Template migration
- `SCOPECRAFT_ENABLE_MODE_MIGRATION` - Mode migration

### Testing
- Created `test-storage-migration.ts` verification script
- All core functionality tested and working
- TypeScript compilation successful
- Ready for integration testing

### Next Steps
- Test suite updates (task 04)
- CLI/MCP integration updates (task 05)
- Migration tooling implementation (task 06)

## Log
- 2025-06-11: 2025-06-10 14:25: === AUTONOMOUS EXECUTION STARTED ===
- Task: 03_core-storage-implementation-06W (Core storage implementation)
- Analysis: type:feature, area:core, no explicit mode tags
- Context: Primary implementation task with detailed technical requirements, ADR available
- Selected Mode: Implementation Mode (Core/Infrastructure variant)
- Reasoning: Feature type + detailed implementation steps + systems-level work + architectural foundation complete
- Loading: Implementation mode with senior systems architect mindset
- Status: Starting autonomous execution with full backward compatibility focus
- 2025-06-11: 2025-06-10 14:40: === ARCHITECTURE ANALYSIS COMPLETE ===
- Studied ConfigurationManager (functional architecture from env refactor)
- Analyzed directory-utils.ts (core filesystem layer)
- Identified critical path construction lines in task-crud.ts (155, 224, 329)
- Current architecture: ConfigManager → directory-utils → task-crud
- Plan: Create PathEncoder → Extend ConfigManager → Update directory-utils → Update CRUD
- Starting implementation with TaskStoragePathEncoder utility class
- 2025-06-11: 2025-06-10 15:00: === CORE INFRASTRUCTURE COMPLETE ===
- ✅ Created TaskStoragePathEncoder utility class
- ✅ Extended ConfigurationManager with storage root methods  
- ✅ Updated directory-utils.ts with optional ConfigurationManager parameter
- ✅ Implemented dual-location support (new first, .tasks/ fallback)
- ✅ Updated all path resolution functions to support centralized storage
- Next: Update task CRUD operations to use new path resolution
- 2025-06-11: 2025-06-10 15:25: === TASK CRUD MIGRATION COMPLETE ===
- ✅ Updated all task CRUD operations to support ConfigurationManager
- ✅ Fixed critical path construction lines (155, 224, 329) in task-crud.ts
- ✅ Updated parseTaskLocation to support dual-location resolution
- ✅ Fixed resolveTaskId and related functions for centralized storage
- ✅ Updated id-generator.ts to support ConfigurationManager
- ✅ Updated template-manager.ts for dual-location support
- ✅ Updated ChannelCoder session storage to support migration
- ✅ All exports updated in core/index.ts
- Code check: TypeScript compilation successful ✅
- Next: Test with feature flags enabled
- 2025-06-11: 2025-06-10 15:35: === IMPLEMENTATION VERIFIED ===
- ✅ Path encoding works correctly (readable format)
- ✅ ConfigurationManager storage methods functional
- ✅ Feature flags working (environment-based)
- ✅ Storage initialization creates all directories with correct permissions
- ✅ Dual-location support verified (checks new location, falls back to .tasks/)
- ✅ Fixed parameter ordering in generateUniqueTaskId
- Test results: All core functionality working as designed
- Ready for integration testing and migration tooling
- 2025-06-11: 2025-06-10 15:40: === EXECUTION COMPLETE ===
- Mode Used: Implementation (Core/Infrastructure)
- Status: COMPLETED
- Deliverable: READY
- Questions: 0 (parameter order question resolved)
- Follow-up: Continue with tasks 04-06 for full migration
