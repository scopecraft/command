# Core Refactor Implementation Plan (01-core-refactor.task.md)

## Scope Analysis

Based on the task instructions, this core refactor focuses specifically on:
1. Directory structure management (workflow folders)
2. ID generation and resolution system
3. Task CRUD operations for v2
4. Section-based task parser
5. Type definitions update

## Complete Core Functionality Analysis

### Functions That Need V2 Updates

1. **Initialization System**
   - `initializeProjectStructure()` - Must create backlog/current/archive instead of phases
   - `initializeTemplates()` - Keep but update template format for v2 sections
   - Update QUICKSTART.md for v2 workflow
   - Keep .config directory for project settings
   - Keep .templates directory for user customization

2. **Template System** 
   - `listTemplates()` - Keep as is (reads from .tasks/.templates/)
   - `getTemplate()` - Keep as is
   - `applyTemplate()` - Update to:
     - Generate v2 frontmatter (type, status, area)
     - Ensure all required sections exist
     - Place template content in appropriate sections
   - Update bundled templates to v2 format with sections
   - Preserve user customization in .tasks/.templates/

2. **Task CRUD** 
   - `createTask()` - Default to backlog/, use new ID format
   - `getTask()` - Search workflow folders instead of phases
   - `updateTask()` - Support section updates
   - `deleteTask()` - Remove from workflow folder
   - `listTasks()` - Search all workflow states
   - `parseTaskFile()` - Parse sections instead of single content
   - `generateTaskContent()` - Generate with required sections

3. **To Be Removed Entirely**
   - All phase management functions (create/update/delete/list)
   - All feature/area management functions  
   - Complex subdirectory logic

4. **Task Movement**
   - `moveTask()` - Simplified to move between workflow states
   - Auto-update status on workflow transitions

5. **ID System**
   - `generateTaskId()` - New format: descriptive-MMDD-XX
   - ID resolution with workflow search order

6. **Directory Utilities**
   - `getTasksDirectory()` - Keep as is
   - Add `getWorkflowDirectory(state)` 
   - Add `getArchiveDirectory(date?)`
   - Remove phase/subdirectory path logic

7. **Workflow Functions**
   - `findNextTask()` - Adapt for workflow states
   - `getCurrentTasks()` - Look in current/ folder
   - Add workflow transition helpers

## Current State Review

### Existing Core Components
```
src/core/
├── task-manager/
│   ├── directory-utils.ts    # Phase/feature based paths
│   ├── id-generator.ts       # TASK-001 style IDs
│   ├── task-crud.ts         # Current CRUD operations
│   ├── task-parser.ts       # YAML/TOML frontmatter parsing
│   └── types.ts             # V1 type definitions
├── config/
│   ├── configuration-manager.ts  # Runtime config
│   └── types.ts                  # Config types
├── task-parser.ts           # Uses gray-matter
└── template-manager.ts      # Task templates
```

### Key Questions to Address

1. **Configuration System**
   - Should workflow folder names be configurable?
   - Should archive date format be configurable?
   - Should default workflow state be configurable?

2. **Initialization Process**
   - How do we detect v1 vs v2 structure?
   - Should init create example tasks?
   - What about `.tasks/templates/` directory?

3. **Migration Utilities**
   - Should core provide migration helpers?
   - Validation for v1 → v2 conversion?
   - Backup mechanisms?

4. **Template System**
   - How do templates specify sections?
   - Do we need section templates?
   - Template location in v2 structure?

## Implementation Plan

### Phase 0: Project Initialization Updates
**Files**: `src/core/task-manager/index.ts`, `src/cli/commands.ts`

1. **Update `initializeProjectStructure()`**
   ```typescript
   - Create .tasks/backlog/
   - Create .tasks/current/
   - Create .tasks/archive/
   - Keep .tasks/.templates/ directory (REQUIRED for user customization)
   - Keep .tasks/.config/ directory (for project settings)
   - Remove/update QUICKSTART.md for v2 workflow
   ```

2. **Update template system for v2**
   - Keep template discovery in `.tasks/.templates/`
   - Update bundled templates in `src/templates/` to include v2 sections
   - Template format for v2:
     ```markdown
     ## Instruction
     [Feature description for << FEATURE TITLE >>]
     
     ## Tasks
     - [ ] Initial task item
     
     ## Deliverable
     
     ## Log
     - YYYY-MM-DD HH:MM: Task created
     ```
   - Keep `applyTemplate()` but update to:
     - Generate v2 simplified frontmatter
     - Ensure all required sections exist
     - Replace title placeholders in section content
   - Preserve user customization capability

### Phase 1: Type Definitions & Interfaces
**Files**: `src/core/types.ts`

1. **Define v2 types**
   ```typescript
   - WorkflowState: 'backlog' | 'current' | 'archive'
   - TaskLocation: { state: WorkflowState, archiveDate?: string }
   - TaskSections: { instruction, tasks, deliverable, log, [custom] }
   - V2Task: Simplified structure with sections
   ```

2. **Update existing types**
   - Remove phase-specific fields
   - Remove feature/area references
   - Add workflow location info

### Phase 2: Directory Utilities
**Files**: `src/core/task-manager/directory-utils.ts`

1. **New functions needed**
   ```typescript
   - getWorkflowPath(state: WorkflowState): string
   - getArchivePath(date?: string): string
   - ensureWorkflowFolders(): void
   - detectStructureVersion(): 'v1' | 'v2' | 'none'
   ```

2. **Update existing functions**
   - Remove phase/feature path logic
   - Add workflow state awareness
   - Handle archive date folders

### Phase 3: Task Parser v2
**Files**: `src/core/task-parser.ts` (new v2 version)

1. **Section parsing**
   ```typescript
   - parseSections(content: string): TaskSections
   - serializeSections(sections: TaskSections): string
   - updateSection(content: string, section: string, newContent: string): string
   ```

2. **Integration with gray-matter**
   - Use gray-matter for frontmatter
   - Custom section parsing after frontmatter
   - Preserve formatting and whitespace

### Phase 4: ID Generation & Resolution
**Files**: `src/core/task-manager/id-generator.ts`

1. **New ID format**
   ```typescript
   - generateV2Id(title: string): string  // returns "kebab-case-MMDD-XX"
   - parseV2Id(filename: string): { name, date, suffix }
   - validateV2Id(id: string): boolean
   ```

2. **ID resolution**
   ```typescript
   - resolveTaskId(id: string): string | null  // searches workflow folders
   - searchOrder: current → backlog → archive
   - Support explicit paths: "current/task-0127-AB"
   ```

### Phase 5: Task CRUD v2
**Files**: `src/core/task-manager/task-crud.ts`

1. **Create operations**
   - Default to backlog/
   - Generate v2 ID
   - Create with required sections
   - **Preserve template functionality**:
     - Support `--template` option
     - Apply templates using updated `applyTemplate()`
     - Ensure template content populates correct sections
   - Support initial content for sections

2. **Read operations**
   - Parse sections separately
   - Support section-only reads
   - Handle complex tasks

3. **Update operations**
   - Update individual sections
   - Preserve other sections
   - Update frontmatter independently

4. **Move operations**
   - Move between workflow states
   - Auto-update status on move
   - Archive with date organization

### Phase 6: Complex Task Support
**New file**: `src/core/task-manager/complex-tasks.ts`

1. **Detection**
   - Identify folders with _overview.md
   - List subtasks with sequence numbers
   - Detect parallel tasks (same prefix)

2. **Operations**
   - Create complex task folder
   - Add/remove subtasks
   - Update overview

### Phase 7: Configuration Updates
**Files**: `src/core/config/configuration-manager.ts`

1. **New config options**
   ```typescript
   - workflowFolders?: { backlog, current, archive }
   - archiveDateFormat?: string  // default "YYYY-MM"
   - defaultWorkflowState?: WorkflowState
   - v2Mode?: boolean  // feature flag during transition
   ```

2. **Backwards compatibility**
   - Detect structure version
   - Warn on v1 operations in v2
   - Migration prompts

## Testing Strategy

1. **Unit tests for each component**
   - ID generation edge cases
   - Section parsing variations
   - Path resolution scenarios

2. **Integration tests**
   - Full CRUD cycle
   - Workflow transitions
   - Complex task operations

3. **Migration scenarios**
   - v1 detection
   - Structure validation
   - Error handling

## Risk Mitigation

1. **Backwards Compatibility**
   - Feature flag for v2 mode
   - Structure version detection
   - Clear migration warnings

2. **Data Integrity**
   - Validate before destructive ops
   - Preserve original on errors
   - Transaction-like operations

3. **Performance**
   - Efficient archive searching
   - Caching for repeated lookups
   - Lazy loading for lists

## Success Criteria

1. All v2 operations work correctly
2. Section updates preserve content
3. ID generation is reliable
4. No regression in performance
5. Clear migration path from v1

## Functions to Remove Entirely

The following v1-specific functions should be removed:

1. **Phase Management** (phase-crud.ts)
   - `createPhase()`
   - `updatePhase()` 
   - `deletePhase()`
   - `listPhases()`
   - `getPhaseMetadata()`
   - `savePhaseMetadata()`

2. **Feature/Area Management** (feature-crud.ts, area-crud.ts)
   - `createFeature()`
   - `updateFeature()`
   - `deleteFeature()` 
   - `listFeatures()`
   - `getFeature()`
   - `createArea()`
   - `updateArea()`
   - `deleteArea()`
   - `listAreas()`
   - `getArea()`

3. **Complex Path Logic**
   - `getPhasesDirectory()`
   - `parseTaskPath()` (phase/subdirectory parsing)
   - Phase/feature specific ID generators

## Next Steps

1. Review and clarify questions about architecture:
   - Should .config directory remain?
   - Should workflow folder names be configurable?
   - How should templates work with sections?
   - Migration strategy for existing projects?
2. Implement Phase 0: Update initialization
3. Create v2 types and interfaces
4. Implement directory utilities
5. Build section-aware parser
6. Update all affected functions
7. Remove deprecated functions
8. Test each component thoroughly