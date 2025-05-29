# Fix and simplify parent add-subtask implementation

---
type: bug
status: Done
area: general
priority: Medium
---


## Instruction
The `parent add-subtask` command was failing with "Failed to read created subtask" error. Additionally, the implementation had unnecessary complexity that could be simplified after fixing the `getTask` function.

**RESOLVED**: Fixed property access error and simplified the implementation to use `getTask` with parent context.

## Tasks
- [x] Identify root cause of the error
- [x] Fix property access error (parentTask.document.title → parentTask.overview.title)
- [x] Replace manual Task construction with getTask call
- [x] Test the simplified implementation
- [x] Verify all parent commands still work

## Deliverable
A working and simplified `parent add-subtask` command that:
- Successfully creates subtasks in parent folders
- Uses the standard `getTask` function for consistency
- Has less code to maintain
- Performs better with parent context search

## Log
- 2025-05-28: Discovered while testing adoption bug fix
- 2025-05-28: Fixed property access and simplified implementation
- 2025-05-28: Tested successfully with multiple subtasks

## Issue details
**Command that failed:**
```bash
sc parent add-subtask test-parent-task-05A --title "Test Subtask"
```

**Error:**
```
Error: Failed to read created subtask
```

## Root causes
1. **Property Access Error**: The code was trying to access `parentTask.document.title` but ParentTask type has `parentTask.overview.title`
2. **Complex Workaround**: The function had 30+ lines manually constructing a Task object instead of using `getTask`

## Solution applied
1. **Fixed property access** (was already fixed when we investigated)
2. **Simplified implementation**:
   - Removed manual Task object construction
   - Replaced with: `await getTask(projectRoot, subtaskId, config, parentId)`
   - Reduced code from ~30 lines to ~8 lines

## Technical details
The `addSubtask` function in `task-operations.ts` (lines 685-725) was manually:
- Reading file content with `readFileSync`
- Parsing the document
- Constructing parent metadata
- Building the entire Task object manually

This was replaced with a simple call to `getTask` with parent context, which:
- Uses efficient parent-first search
- Returns properly constructed Task object
- Handles all edge cases

## Acceptance criteria
- [x] Parent add-subtask command works without errors
- [x] Code is simplified to use standard `getTask` function
- [x] No functionality is lost
- [x] Performance is improved (parent context search)
