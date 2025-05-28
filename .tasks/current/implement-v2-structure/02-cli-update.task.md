# Update CLI for V2 Structure

---
type: chore
status: 🔵 In Progress
area: cli
assignee: 
---

## Instruction

Update the CLI commands to work with the new workflow-based structure. Remove phase operations and update task commands for the new system.

**IMPORTANT**: This plan is not complete. Start by reviewing all CLI commands and their implementations. Consider:
- Which commands become obsolete?
- What new commands do we need?
- How do existing workflows change?
- What about command aliases and shortcuts?
- How do we handle command deprecation gracefully?
- Don't hesitate to ask questions about user experience decisions.

### Initial Scope (to be expanded)
1. Remove phase commands entirely
2. Map feature commands to parent tasks
3. Add new filtering options
4. Update task commands for workflow operations
5. Update help text and documentation

### Key Files to Modify
- `src/cli/commands.ts`
- `src/cli/entity-commands.ts`
- Related command implementations

## Tasks

- [x] Remove all phase-related commands (list/create/update/delete)
- [ ] Update feature commands to work with parent task folders
- [ ] Add `task move` command for workflow transitions
- [x] Update `task create` to use backlog/ by default
- [x] Add location filters (--location, --backlog, --current, --archive)
- [ ] Add type filters (--type simple/parent)
- [x] Update existing filters to work with metadata
- [ ] Add support for custom metadata filters
- [x] Update list command to search across workflow folders
- [x] Update help text for all modified commands
- [x] Implement `task update` command with v2
- [ ] Implement `task get` command with v2
- [ ] Implement `task delete` command with v2
- [ ] Add examples for new command patterns
- [ ] Test all command variations

## To Investigate

Non-blocking issues found during implementation:

1. **Missing template initialization in v2** (2025-05-28)
   - V1 `initializeTemplates()` copies 6 templates to .tasks/.templates/
   - V2 `initializeV2ProjectStructure()` creates the directory but doesn't copy templates
   - Impact: Users won't have starter templates available
   - Options: Reuse v1 function, create v2-specific templates, or document as known limitation

2. **Remove "v2" from all function names** (2025-05-28)
   - Currently using names like `formatV2Tasks`, `createTaskV2Adapter`, etc.
   - Bad practice to version function names - should just be `formatTasksList`, `createTask`
   - Only the temporary file names should have v2 to avoid conflicts during migration
   - TODO: Rename all functions when replacing v1 with v2

3. **Status update truncation issue** (2025-05-28)
   - When updating status to "In Progress", it's being saved as "Progress"
   - Appears to be truncating at first space
   - Need to investigate v2 update function or YAML serialization
   - Impact: Status values with spaces are not being saved correctly

## Deliverable

### Completed Integration (2025-05-28)

1. **Removed Phase System**
   - Commented out phase command setup in entity-commands.ts
   - Phase commands no longer available in CLI

2. **V2 Initialization**
   - `sc init` now creates v2 workflow structure (backlog/current/archive)
   - Creates QUICKSTART.md with v2 guidance
   - Updated help text to explain workflow-based organization

3. **Task Creation with V2**
   - `sc task create` now uses v2 core functions
   - Tasks created in `.tasks/backlog/` by default
   - New ID format: descriptive-MMDD-XX (e.g., test-v2-task-creation-0528-8P)
   - Properly creates v2 document structure with sections

4. **Task Listing with V2**
   - `sc task list` uses v2 listTasks function
   - Added workflow location filters:
     - `--backlog` - Show only backlog tasks
     - `--current` - Show only current tasks
     - `--archive` - Show only archived tasks
     - `--location <state>` - Filter by specific workflow state
   - Updated formatter to show workflow location and proper status/type emojis

### Still To Implement

- Task move/workflow transitions (promote, archive commands)
- Get/delete commands to use v2
- Parent task commands (replacement for features)
- Workflow command shortcuts
- Full command testing suite

### Update Command Working (2025-05-28)

The `task update` command is now working with v2:
- `sc task update <id> --title "New title"`
- `sc task update <id> --assignee "username"`
- `sc task update <id> --status "In Progress"`
- `sc task start <id>` - Shortcut to mark as In Progress
- `sc task complete <id>` - Shortcut to mark as Done
- `sc task block <id>` - Shortcut to mark as Blocked

Known issue: Status values with spaces are being truncated (see To Investigate section)

## Log

- 2025-05-27: Task created as part of V2 implementation
- 2025-05-28: Started implementation - removed phase commands, created v2 init
- 2025-05-28: Integrated v2 create and list commands with workflow filters
- 2025-05-28: Implemented v2 update command - ready for dogfooding!