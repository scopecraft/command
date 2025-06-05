# Fix subtask corruption during task updates

---
type: bug
status: in_progress
area: core
priority: high
---


## Instruction
Fix critical bug where subtask updates corrupt metadata and move files incorrectly.

**Problem**: Task updates on subtasks are causing:
1. Loss of `parentTask` and `sequenceNumber` metadata fields
2. Subtask files moved from parent directories to current/ folder
3. UI parsing failures due to missing metadata

**Error**: `Task fix-strybok-ci-bloc-stor-06A is not a valid subtask` - missing parentTask/sequenceNumber in transformSubTask()

**Investigation needed**:
- Identify which update operations trigger this
- Check if it's specific to certain task types/statuses
- Verify if file movement is intentional or accidental
- Determine if metadata loss happens during read/write or validation

## Tasks
- [ ] Reproduce the bug with a test subtask
- [ ] Identify which task update operations trigger corruption
- [ ] Trace through task-crud.ts update logic for subtasks
- [ ] Check if parent directory handling is correct
- [ ] Verify metadata preservation during file operations
- [ ] Fix the root cause of metadata loss
- [ ] Add validation to prevent invalid subtask states
- [ ] Test fix with affected subtask (fix-strybok-ci-bloc-stor-06A)
- [ ] Add regression test to prevent future occurrences

## Deliverable
**Root Cause Analysis**:
[Document what causes the corruption]

**Fix Implementation**:
[Code changes to prevent metadata loss and incorrect file movement]

**Validation**:
- Affected subtask restored and working
- UI can parse all subtasks correctly
- Regression test added
- No other subtasks affected

## Log
- 2025-06-05: Investigation complete - identified two related bugs:
  1. MCP incorrectly detects simple tasks in parent directories as subtasks 
  2. move() function breaks subtasks by moving them out of parent directories
- 2025-06-05: Auto-transitions disabled via .tasks/.config/project.json to prevent further subtask corruption
- 2025-06-05: Root cause: moveSimpleTask() treats subtasks as simple tasks, moving them to workflow root instead of preserving parent directory structure
