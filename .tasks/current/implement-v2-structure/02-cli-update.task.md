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
- [x] Update feature commands to work with parent task folders (replaced with parent commands)
- [ ] Add `task move` command for workflow transitions
- [x] Update `task create` to use backlog/ by default
- [x] Add location filters (--location, --backlog, --current, --archive)
- [ ] Add type filters (--type simple/parent)
- [x] Update existing filters to work with metadata
- [ ] Add support for custom metadata filters
- [x] Update list command to search across workflow folders
- [x] Update help text for all modified commands
- [x] Implement `task update` command with v2
- [x] Implement `task get` command with v2
- [x] Implement `task delete` command with v2
- [x] Design UX for sequencing commands
- [ ] Implement subtask sequencing commands (resequence, parallelize, sequence)
- [ ] Implement task conversion commands (promote, extract, adopt)
- [ ] Enhance parent commands with sequencing options
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

4. **Init command not using v2 handler** (2025-05-28)
   - `sc init` shows v1 output despite init-v2.ts handler existing
   - The handleInitV2Command is set up but not being called
   - V1 handleInitCommand in commands.ts may be taking precedence
   - Impact: Users get v1 structure instead of v2 workflow structure

5. **Subtasks not loading in parent get command** (2025-05-28)
   - Parent task overview loads correctly but subtasks array is empty
   - Subtask file exists: 01-design-login-form-ui.task.md
   - Core issue: `getParentTask` returns empty subtasks array
   - Root cause: `getTask(projectRoot, subtaskId)` can't resolve subtask IDs
   - CLI needs core to properly load subtasks with their metadata

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

### Get Command Working (2025-05-28)

The `task get` command is now working with v2:
- `sc task get <id>` - Shows task details in default format
- `sc task get <id> --format json` - Output as JSON
- `sc task get <id> --format markdown` - Show full markdown
- `sc task get <id> --format full` - Show all sections including deliverable and log

The command now uses v2 getTask and formatTaskDetail functions.

### Delete Command Working (2025-05-28)

The `task delete` command is now working with v2:
- `sc task delete <id>` - Deletes a task by ID
- Proper error handling for non-existent tasks
- Cannot delete parent task overviews directly (must delete entire folder)

All basic CRUD operations are now complete with v2!

### Parent Commands Working (2025-05-28)

The parent task commands (replacement for features) are now working:
- `sc parent create --title "Feature name" --type feature` - Creates parent task folder with _overview.md
- `sc parent list` - Lists all parent tasks with workflow filters
- `sc parent get <id>` - Shows parent task details and subtasks
- `sc parent add-subtask <parent-id> --title "Subtask"` - Adds subtask to parent
- `sc parent move <id> <target>` - Moves parent task between workflow states
- `sc parent delete <id>` - Deletes parent task and all subtasks

Note: There's a bug where subtasks aren't being loaded in parent get command - needs investigation.

## Log

- 2025-05-27: Task created as part of V2 implementation
- 2025-05-28: Started implementation - removed phase commands, created v2 init
- 2025-05-28: Integrated v2 create and list commands with workflow filters
- 2025-05-28: Implemented v2 update command - ready for dogfooding!
- 2025-05-28: Implemented v2 get command - displays task details with proper formatting
- 2025-05-28: Implemented v2 delete command - all CRUD operations now complete!
- 2025-05-28: Implemented parent task commands to replace features - folder-based task organization
- 2025-05-28: Re-opened - Designed comprehensive UX for sequencing features added by core team

### Core Requirements from CLI Perspective

As a CLI consumer, I need the v2 core to provide:

1. **Working `getParentTask` function** that returns:
   - Complete `ParentTask` object with all subtasks loaded
   - Each subtask should have `metadata.sequenceNumber` populated
   - Subtasks should be in an array I can iterate over

2. **Sequencing operations** that handle:
   - `resequenceSubtasks(parentId, fromPositions[], toPositions[])`
   - `parallelizeSubtasks(parentId, subtaskIds[], targetSequence?)`
   - `updateSubtaskSequence(parentId, subtaskId, newSequence, options)`
   - All ID/filename transformations handled internally

3. **Task conversion operations**:
   - `promoteToParent(taskId, options)` - Convert simple → parent
   - `extractSubtask(parentId, subtaskId, targetLocation)` - Extract subtask → simple
   - `adoptTask(parentId, taskId, sequenceOptions)` - Simple → subtask

4. **Enhanced parent task operations**:
   - `addSubtask` with sequence control (after, before, parallel-with)
   - Proper subtask ID resolution within parent context
   - Sequence conflict resolution

The CLI should only handle:
- Command parsing and validation
- Display formatting (tree view, status symbols)
- User interaction (confirmations, interactive mode)
- Help text and examples

### Sequencing Features - UX Design

#### Command Summary

**Subtask Sequencing (only works within parent tasks):**
- `sc task resequence <parent-id>` - Reorder subtasks within a parent
- `sc task parallelize <subtask-id>...` - Make subtasks run in parallel (same sequence)
- `sc task sequence <subtask-id> <num>` - Change a subtask's sequence number

**Task Conversion (transforms between floating/parent/subtask):**
- `sc task promote <task-id>` - Convert floating task → parent task
- `sc task extract <subtask-id>` - Extract subtask → floating task (loses sequence)
- `sc task adopt <parent-id> <task-id>` - Move floating task → subtask (gains sequence)

**Enhanced Parent Commands:**
- `sc parent add-subtask` - Now supports --sequence, --parallel-with, --after, --before
- `sc parent show` - Now supports --tree view with parallel indicators

**Note:** Sequence numbers (01, 02, etc.) only exist for tasks within parent folders.
Floating tasks use descriptive IDs without sequences (e.g., impl-auth-05K).

#### Command Design Philosophy
- Clear, intuitive commands that match user mental models
- Show current state before destructive operations
- Provide helpful examples in help text
- Use consistent terminology (sequence, parallel, parent, subtask)

#### 1. Subtask Sequencing Commands

**Command: `sc task resequence`**
```
Usage: sc task resequence <parent-id> [options]

Reorder subtasks within a parent task by assigning new sequence numbers.

Options:
  --interactive, -i     Interactive mode to reorder tasks visually
  --from <positions>    Current positions (comma-separated)
  --to <positions>      New positions (comma-separated)
  
Examples:
  # Interactive reordering
  sc task resequence auth-feature-05K --interactive
  
  # Move task from position 3 to position 1
  sc task resequence auth-feature-05K --from 3 --to 1
  
  # Reorder multiple tasks
  sc task resequence auth-feature-05K --from 1,2,3 --to 3,1,2
  
Notes:
  - Shows current order before making changes
  - Automatically adjusts other task sequences
  - Preserves parallel execution (same numbers)
```

**Command: `sc task parallelize`**
```
Usage: sc task parallelize <subtask-id> <subtask-id>... [options]

Make multiple subtasks run in parallel by giving them the same sequence number.

Options:
  --sequence <num>      Specific sequence number to use (default: lowest)
  --parent <id>         Parent task (required if subtask IDs are ambiguous)
  
Examples:
  # Make two subtasks parallel (within same parent)
  sc task parallelize 02-impl-api 03-impl-ui
  
  # Set specific parallel sequence
  sc task parallelize 02-impl-api 03-impl-ui --sequence 02
  
  # With parent specified (for clarity)
  sc task parallelize 02-impl-api 03-impl-ui --parent auth-feature-05K
  
  # Result: both tasks get sequence 02
  
Notes:
  - Only works on subtasks within the same parent folder
  - Shows before/after sequences
  - Core handles all ID/filename updates
  - Cannot parallelize floating tasks (they don't have sequences)
```

**Command: `sc task sequence`**
```
Usage: sc task sequence <subtask-id> <new-sequence> [options]

Change the sequence number of a subtask within its parent.

Options:
  --force               Force even if sequence exists (makes parallel)
  --parent <id>         Parent task (required if subtask ID is ambiguous)
  
Examples:
  # Change subtask from sequence 03 to 01
  sc task sequence 03-write-tests 01
  
  # Force parallel execution with existing 02
  sc task sequence 04-deploy 02 --force
  
  # With parent specified
  sc task sequence 03-write-tests 01 --parent auth-feature-05K
  
Notes:
  - Only works on subtasks within parent folders
  - Automatically shifts other subtasks if needed
  - Use --force to create parallel tasks
  - Shows impact on other subtask sequences
  - Core handles all ID/filename transformations
```

#### 2. Task Conversion Commands

**Command: `sc task promote`**
```
Usage: sc task promote <task-id> [options]

Convert a simple task into a parent task with subtasks.

Options:
  --subtasks <titles>   Initial subtasks to create (comma-separated)
  --keep-original       Keep original task as first subtask
  
Examples:
  # Basic promotion
  sc task promote implement-auth-05K
  
  # Promote with initial subtasks
  sc task promote implement-auth-05K --subtasks "Design UI,Build API,Write tests"
  
  # Keep original as subtask
  sc task promote implement-auth-05K --keep-original
  
Results:
  - Creates: implement-auth-05K/
    - _overview.md (from original task)
    - 01-design-ui-05A.task.md (if --subtasks)
    - 02-build-api-05B.task.md
    - 03-write-tests-05C.task.md
  
Notes:
  - Preserves task metadata and content
  - Generates new IDs for subtasks
  - Updates any task references
```

**Command: `sc task extract`**
```
Usage: sc task extract <subtask-id> [options]

Extract a subtask from its parent to become a standalone task.

Options:
  --target <location>   Target workflow location (backlog/current/archive)
  --update-refs         Update references in other tasks
  
Examples:
  # Extract subtask to backlog
  sc task extract auth-feature/02-impl-api
  
  # Extract to current workflow
  sc task extract 02-impl-api --target current
  
Results:
  - From: auth-feature/02-impl-api-05K.task.md
  - To: backlog/impl-api-05K.task.md (keeps suffix, removes sequence)
  
Notes:
  - Preserves task content and metadata
  - Removes sequence prefix from ID
  - Updates parent task if referenced
```

**Command: `sc task adopt`**
```
Usage: sc task adopt <parent-id> <task-id> [options]

Move a standalone task into a parent as a subtask.

Options:
  --sequence <num>      Specific sequence (default: next available)
  --after <task-id>     Place after specific subtask
  --before <task-id>    Place before specific subtask
  
Examples:
  # Adopt task as next subtask
  sc task adopt auth-feature-05K login-ui-05M
  
  # Adopt at specific position
  sc task adopt auth-feature-05K login-ui-05M --sequence 02
  
  # Insert after existing subtask
  sc task adopt auth-feature-05K login-ui-05M --after 01-design
  
Results:
  - From: backlog/login-ui-05M.task.md
  - To: backlog/auth-feature-05K/03-login-ui-05M.task.md
  
Notes:
  - Adds sequence prefix to task ID
  - Adjusts other sequences if needed
  - Maintains original task suffix
```

#### 3. Enhanced Parent/Subtask Commands

**Command: `sc parent add-subtask` (enhanced)**
```
Usage: sc parent add-subtask <parent-id> --title <title> [options]

Add a new subtask to a parent task.

Options:
  --title <title>       Subtask title (required)
  --sequence <num>      Specific sequence (default: next)
  --parallel-with <id>  Make parallel with existing subtask
  --after <id>          Insert after specific subtask
  --before <id>         Insert before specific subtask
  --type <type>         Task type (inherits from parent)
  --assignee <user>     Assign to user
  
Examples:
  # Add as next sequence
  sc parent add-subtask auth-05K --title "Add OAuth support"
  
  # Insert at specific position
  sc parent add-subtask auth-05K --title "Security review" --sequence 02
  
  # Create parallel task
  sc parent add-subtask auth-05K --title "Update docs" --parallel-with 03-impl
  
  # Insert after existing task
  sc parent add-subtask auth-05K --title "Integration tests" --after 02-impl
```

**Command: `sc parent show` (enhanced)**
```
Usage: sc parent show <parent-id> [options]

Show parent task with enhanced subtask visualization.

Options:
  --tree                Show as tree with parallel indicators
  --timeline            Show execution timeline
  --dependencies        Show task dependencies
  
Examples:
  # Basic view
  sc parent show auth-feature-05K
  
  # Tree view with parallel indicators
  sc parent show auth-feature-05K --tree
  
Output:
  auth-feature-05K: User Authentication
  ├── 01-research-05A ✓ (Done)
  ├─┬ 02-impl-api-05B → (In Progress)
  │ └ 02-impl-ui-05C → (In Progress) [parallel]
  ├── 03-testing-05D ○ (To Do)
  └── 04-deploy-05E ○ (To Do)
  
  Legend: ✓ Done, → In Progress, ○ To Do, ⧗ Blocked
```

#### Key UX Principles Applied:

1. **Predictability**: Commands show what will happen before doing it
2. **Flexibility**: Multiple ways to achieve the same goal
3. **Safety**: Non-destructive by default, confirmations for big changes
4. **Clarity**: Help text includes examples and explains ID transformations
5. **Consistency**: Similar options across related commands

### Implementation Plan

1. First implement read/display commands (parent show enhancements)
2. Then implement safe operations (resequence, parallelize)
3. Finally implement transformative operations (promote, extract, adopt)
4. Add interactive modes for complex operations
5. Ensure all commands handle edge cases gracefully
