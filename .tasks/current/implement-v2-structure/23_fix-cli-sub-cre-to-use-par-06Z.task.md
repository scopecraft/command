# Fix CLI subtask creation to use parent builder

---
type: bug
status: todo
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
- [ ] Modify handleCreateCommand to check for parent option
- [ ] Use core.parent().create() when parent is specified
- [ ] Remove parent from customMetadata (not needed with parent builder)
- [ ] Test subtask creation places tasks in correct location
- [ ] Verify sequencing works correctly

## Deliverable

## Log
