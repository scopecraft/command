# Fix task adoption error: Failed to get adopted task

---
type: bug
status: To Do
area: core
priority: Medium
---

## Instruction

The `task adopt` command fails with "Failed to get adopted task" error when trying to adopt a floating task into a parent task. This happens after the adoption operation appears to complete but fails when trying to retrieve the newly adopted task.

### Bug Details

**Command that fails:**
```bash
sc task adopt test-promotion-task-05C test-05A --after design-05C
```

**Error message:**
```
Error: Failed to get adopted task
```

**Context:**
- The adoptTask function is in `src/core/v2/task-operations.ts` (lines 442-564)
- The CLI handler is in `src/cli/commands.ts` (handleTaskAdoptCommand, lines 1938-1970)
- The error occurs at line 549 in task-operations.ts when calling `getTask(projectRoot, subtaskId, config)`

### Technical Analysis

The adoptTask function flow:
1. Gets the floating task successfully
2. Validates it's not a parent task
3. Gets the parent task successfully
4. Creates the subtask with addSubtask
5. Deletes the original floating task
6. **FAILS HERE**: Tries to get the adopted task with the new subtaskId
7. Returns the error "Failed to get adopted task"

### Suspected Root Causes

1. **ID Mismatch**: The subtaskId used to retrieve the adopted task might not match the actual ID created
   - addSubtask might be generating a different ID than expected
   - The sequence prefix might not be applied correctly

2. **File Location Issue**: The adopted task file might not be where getTask expects it
   - The file might be created in the wrong location
   - The path resolution in getTask might not handle subtasks correctly

3. **Timing Issue**: The file might not be fully written when getTask tries to read it
   - No fsync or delay between write and read operations

### Code References

Key functions to investigate:
- `src/core/v2/task-operations.ts:adoptTask()` - Main function with the bug
- `src/core/v2/task-operations.ts:addSubtask()` - Creates the subtask (line 537)
- `src/core/v2/task-crud.ts:getTask()` - Fails to find the adopted task
- `src/core/v2/id-generator.ts:resolveTaskId()` - Might not resolve subtask IDs correctly

### Reproduction Steps

1. Create a parent task: `sc parent create --title "Test Parent" --type feature`
2. Create a floating task: `sc task create --title "Test Float" --type feature`
3. Try to adopt: `sc task adopt <parent-id> <float-id>`
4. Observe the error

### Related Information

- This is a v2 core issue, not a CLI issue
- The CLI is correctly calling the core adoptTask function
- Other similar operations (promote, extract) work correctly
- The issue was discovered during CLI v2 integration testing on 2025-05-28

## Tasks

- [ ] Set up test environment with parent and floating tasks
- [ ] Add debug logging to trace the exact IDs being used
- [ ] Investigate if addSubtask returns the correct subtask information
- [ ] Check if getTask can properly resolve subtask IDs within parent folders
- [ ] Verify the file is actually created in the expected location
- [ ] Test the fix with various adoption scenarios
- [ ] Add unit tests to prevent regression

## Deliverable

A working `task adopt` command that successfully:
1. Moves a floating task into a parent task as a subtask
2. Assigns the correct sequence number
3. Returns the adopted task information
4. Properly handles all ID transformations

## Log

- 2025-05-28: Bug discovered during CLI v2 integration testing
- 2025-05-28: Created detailed bug report with technical analysis
