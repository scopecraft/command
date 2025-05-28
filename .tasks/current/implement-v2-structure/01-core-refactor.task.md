# Core System Refactor for V2 Structure

---
type: chore
status: 🟢 Done
area: core
assignee: 
---

## Instruction

Refactor the core task management system to support the new workflow-based structure. This is the foundation that all other components depend on.

**IMPORTANT**: This plan is not complete. Start by reviewing the entire core codebase to understand all the implications. Pay special attention to:
- Configuration system - what should be configurable?
- Initialization process - how do we create the new folder structure?
- Migration utilities - even if manual, do we need helpers?
- Template system - how do templates work with new structure?
- Don't hesitate to ask questions about architectural decisions.

### Initial Scope (to be expanded)
1. Update directory utilities for new folder structure
2. Implement new ID generation and resolution
3. Update task CRUD operations
4. Modify task parser for unified document sections
5. Update type definitions

### Key Files to Modify
- `src/core/task-manager/directory-utils.ts`
- `src/core/task-manager/id-generator.ts`
- `src/core/task-manager/task-crud.ts`
- `src/core/task-parser.ts`
- `src/core/types.ts`

## Tasks

- [x] Create comprehensive implementation plan
- [x] Create v2 type definitions
- [x] Implement v2 directory utilities
- [x] Build section-aware task parser
- [x] Create new ID generation system
- [x] Implement v2 task CRUD operations
- [x] Create v2 index file for exports
- [x] Create workflow folders (backlog/current/archive) on init
- [x] Add complex task support (folders with _overview.md)
- [x] Update template system for v2
- [x] Write tests for new functionality

## Deliverable

### Completed Components (All Core Phases)

#### 1. Implementation Plan
- Created comprehensive plan in `01-core-refactor-plan.md`
- Analyzed all core functions and identified v2 changes needed
- Preserved template functionality requirements

#### 2. V2 Type Definitions (`src/core/v2/types.ts`)
- Defined workflow states: backlog, current, archive
- Created task document structure with sections
- Simplified frontmatter to type, status, area + custom
- Added support for complex tasks and migrations

#### 3. Directory Utilities (`src/core/v2/directory-utils.ts`)
- Workflow-based directory management
- Archive date organization support
- Structure version detection (v1/v2/mixed)
- Complex task folder detection
- Task file discovery and path parsing

#### 4. Section-Aware Parser (`src/core/v2/task-parser.ts`)
- Uses gray-matter for frontmatter parsing
- Parses required sections: Instruction, Tasks, Deliverable, Log
- Section update capabilities
- Checklist parsing/formatting
- Log entry management

#### 5. ID Generation & Resolution (`src/core/v2/id-generator.ts`)
- New ID format: descriptive-MMDD-XX
- ID resolution across workflow states
- Task reference parsing (@task:id#section)
- Unique ID generation with collision detection

#### 6. Task CRUD Operations (`src/core/v2/task-crud.ts`)
- Create tasks in workflow states (default: backlog)
- Read with section support
- Update frontmatter and sections independently
- Move between workflow states with status updates
- List with comprehensive filtering
- Section-specific updates

#### 7. V2 Index (`src/core/v2/index.ts`)
- Consolidated exports for all v2 functionality
- Clean API surface for consumers

#### 8. Project Initialization (`src/core/v2/project-init.ts`)
- Creates workflow folders: backlog/, current/, archive/
- V2-specific QUICKSTART.md with workflow instructions
- Structure version detection
- Initialization status helpers

#### 9. Complex Task Support (`src/core/v2/complex-tasks.ts`)
- Create folder-based tasks with _overview.md
- Add numbered subtasks (01-, 02- prefixes)
- Move/delete entire complex task folders
- List subtasks with parallel execution info
- Convert simple tasks to complex

#### 10. Template System (`src/core/v2/template-manager.ts`)
- V2 templates with required sections
- Preserved user customization in .tasks/.templates/
- Default templates for all task types
- Template parsing into v2 sections
- Title placeholder replacement

### Code Quality
- All v2 code passes TypeScript checks
- No Biome linting issues
- Modular design for easy testing
- 10 complete modules with full functionality

### E2E Test Results (`test/e2e/v2-core-e2e.test.ts`)
Successfully created comprehensive e2e test that validates:
- ✅ Project initialization with workflow folders
- ✅ Task creation with clean status values (no emojis)
- ✅ Task listing and reading with section parsing
- ✅ Task updates (metadata and sections)
- ✅ Workflow transitions (backlog → current → archive)
- ✅ Complex task folders with numbered subtasks
- ✅ ID generation and resolution
- ✅ Document validation
- ✅ Proper file structure and content

### Design Decisions
- **No emojis in files**: Status values are plain text, emojis added in presentation layer
- **Simplified log section**: Basic implementation, full log system to be designed later
- **Temporary v2 folder**: All code in `src/core/v2/` for easy comparison and migration

### Next Steps
- Integrate v2 core with CLI commands (02-cli-update.task.md)
- Update MCP handlers for v2 (02-mcp-update.task.md)
- Migrate from temporary v2 folder to replace current core
- Document v2 API usage

## Log
- 2025-05-27: V2 core implementation complete with comprehensive e2e tests

- 2025-05-27: Task created as part of V2 implementation
- 2025-05-27: Created comprehensive implementation plan
- 2025-05-27: Implemented Phases 1-5 of core v2 functionality
- 2025-05-27: All v2 code passes quality checks
- 2025-05-27: Completed Phase 0 (project init) and Phase 6 (complex tasks)
- 2025-05-27: Updated template system for v2 sections
- 2025-05-27: Core refactor complete - 10 modules ready for integration