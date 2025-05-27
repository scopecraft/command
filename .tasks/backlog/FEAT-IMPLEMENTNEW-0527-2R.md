+++
id = "FEAT-IMPLEMENTNEW-0527-2R"
title = "Implement New Workflow-Based Task Structure"
type = "mdtm_feature"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-27"
updated_date = "2025-05-27"
assigned_to = ""
phase = "backlog"
tags = [ "architecture", "breaking-change", "core" ]
+++

# Implement New Workflow-Based Task Structure

## Background & Motivation

We're redesigning how Scopecraft organizes tasks to better match how teams actually work. The current system uses a rigid hierarchy (phase/feature/task) that doesn't adapt well to real workflows.

### Current Structure (Problem)
```
.tasks/
  release-v1/                    # Phase folder
    FEATURE_Authentication/      # Feature folder
      TASK-001.md               # Individual task
      auth-research.md          # Work document
```

Issues:
- Tasks and their outputs are mixed together
- Rigid hierarchy doesn't match how work flows
- Moving tasks between phases/features is complex
- IDs are tied to folder paths

### New Structure (Solution)
```
.tasks/
  backlog/                      # Ideas and future work
    explore-oauth-0127-AB.task.md
    
  current/                      # Active work  
    implement-oauth-0201-CD.task.md
    dashboard-redesign/         # Complex task as folder
      _overview.md
      01-research.task.md
      02-implement.task.md
      
  archive/                      # Completed work
    2024-01/
      auth-system-0115-EF.task.md
```

### Key Concepts

1. **Workflow States**: Tasks physically move through backlog → current → archive
2. **Unified Documents**: Each .task.md file contains sections:
   - Instruction (what to do)
   - Tasks (checklist)
   - Deliverable (outputs)
   - Log (history)
3. **Stable IDs**: Task ID is just the filename, not the path
4. **Flexible Metadata**: Sprint, version, area etc. are metadata, not folders

## Implementation Requirements

### Core Structure Changes

#### 1. Directory Structure (`task-manager/directory-utils.ts`)
- Support `backlog/`, `current/`, `archive/` as top-level folders
- Recognize both `*.task.md` files and folders with `_overview.md`
- Remove assumptions about phase/feature hierarchy

#### 2. ID System (`task-manager/id-generator.ts`)
- Generate IDs like `task-name-MMDD-XX.task.md` (no prefixes)
- ID resolution searches: current → backlog → archive
- References work without specifying folder location

#### 3. Task CRUD (`task-manager/task-crud.ts`)
- Create tasks in workflow folders
- Parse new section structure
- Support moving between workflow states

### Type System Updates

#### 4. Task Parser (`task-parser.ts`)
- Parse unified document sections
- Support reading/writing individual sections
- Remove old format parsing

#### 5. Type Definitions (`types.ts`)
- Add workflow location to task type
- Move phase/feature to metadata
- Support configurable dimensions

### Command Updates

#### 6. CLI Commands
- Add `task move` command for workflow transitions
- Update list commands to search across workflow folders
- Support metadata-based filtering

#### 7. MCP Handlers
- Update ID resolution logic
- Support new folder structure in all operations
- Add move operation handler

## Implementation Approach

### Clean Break Strategy
Since backwards compatibility is not a concern:
- Implement v2 structure directly
- Remove all v1-specific code
- Simplify implementation without dual-mode support
- Users will manually migrate existing tasks if needed

### Simplified Implementation
1. Replace existing directory structure entirely
2. Update all commands to use new structure
3. Remove phase/feature CRUD operations
4. Focus on clean, simple implementation

## References

### Technical Specification
- **@doc:specs/task-system-v2-specification** - Complete technical specification with exact implementation requirements

### Vision Documents
- @doc:specs/ai-first-knowledge-system-vision - Philosophy and concepts
- @doc:specs/scopecraft-vision - Overall system vision
- @doc:specs/mode-system-design - How modes interact with tasks

**IMPORTANT**: The technical specification is the authoritative source for implementation details. Follow it exactly for:
- File naming conventions
- Section structure and order
- ID resolution algorithm
- Error handling requirements

## Success Criteria
- All requirements in the technical specification are met
- Tasks can be created in workflow folders
- IDs work regardless of location
- Tasks can move between states
- Sections are properly parsed
- Clean implementation without legacy code
