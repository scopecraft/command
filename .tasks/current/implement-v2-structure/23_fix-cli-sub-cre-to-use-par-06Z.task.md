# Fix CLI subtask creation to use parent builder

---
type: bug
status: done
area: cli
priority: high
tags:
  - bug-fix
---


## Instruction
Fix CLI subtask creation to properly place tasks in parent folders.

**Root Cause**:
- CLI create command uses core.create() even when --parent is specified
- It passes parent in customMetadata, but should use core.parent().create()
- Result: Subtasks are created in backlog root instead of parent folder

**Fix Required**:
- Check if parent option is provided
- Use core.parent(parentId).create() for subtask creation
- Ensure proper sequencing and placement

## Tasks
- [x] Modify handleCreateCommand to check for parent option
- [x] Use core.parent().create() when parent is specified
- [x] Remove parent from customMetadata (not needed with parent builder)
- [x] Test subtask creation places tasks in correct location
- [x] Verify sequencing works correctly

## Deliverable
Fixed CLI subtask creation to use parent builder pattern:
- Modified `handleCreateCommand` in src/cli/commands.ts (lines 232-238)
- Now checks if `--parent` option is provided
- Uses `core.parent(projectRoot, parentId).create()` for subtask creation
- Removed parent from customMetadata (no longer needed)
- Tested and verified subtasks are created in parent folders with proper sequencing

## Log
- 2025-06-04: Starting implementation - will analyze current CLI create command and fix to use parent builder pattern
- 2025-06-04: Modified handleCreateCommand to check for parent option and use core.parent().create() when parent is specified (src/cli/commands.ts:232-238)
- 2025-06-04: Completed implementation and testing. Subtasks now correctly created in parent folders with proper sequencing (tested with sequence 30→31)
- 2025-06-04: Reopening - need to verify the implementation more thoroughly and address related parent command issues
- 2025-06-04: Task complete. Created comprehensive tracking task fix-ci-sub-cre-par-lis-mov-06A for remaining CLI parent command implementations
