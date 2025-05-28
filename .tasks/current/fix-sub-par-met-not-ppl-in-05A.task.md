# Fix subtask parentId metadata not populated in listTasks

---
type: bug
status: Done
area: general
priority: High
---


## Instruction

## Tasks

## Deliverable

## Log

## Problem
When using `sc task list`, subtasks that are inside parent task directories are displayed as standalone tasks instead of being grouped under their parent.

Example:
```
CURRENT:
├── ✓ Update CLI for V2 Structure [02_cli-update] • Done
├── ○ Update Task UI for V2 Structure [03_ui-update] • Progress  
├── → Core System Refactor for V2 Structure [01_core-refactor] • In Progress
└── ○ Update MCP Server for V2 Structure [02_mcp-update] • 🟡 To Do
```

These are all subtasks of `implement-v2-structure` but appear as standalone tasks.

## Root cause
The `listTasks` function in core is not populating `metadata.location.parentId` for subtasks. The tree formatter expects this field to properly group subtasks under their parents.

## Impact
1. Tree view shows incorrect hierarchy
2. Can't distinguish between standalone tasks and subtasks
3. Parent tasks appear empty when they actually have subtasks

## Solution required
In `src/core/v2/task-crud.ts` or wherever task metadata is built, when a task is found inside a parent directory (e.g., `current/implement-v2-structure/01_core-refactor.task.md`), the system should:

1. Set `metadata.location.parentId = 'implement-v2-structure'`
2. Set `metadata.isSubtask = true` (if not already)

## Test case
After fix, `sc task list --current` should show:
```
CURRENT:
└── 📁 → Implement New Workflow Structure [implement-v2-structure] • In Progress • 1/4 done
    ├── → Core refactor [01_core-refactor] • In Progress
    ├─┬ [Parallel execution - 02]
    │ ├─ ✓ CLI update [02_cli-update] • Done
    │ └─ ○ MCP update [02_mcp-update] • To Do
    └── ○ UI update [03_ui-update] • To Do
```

## Fix subtask parentid metadata not populated in listtasks
Task description goes here.

## Acceptance criteria
- [ ] Criteria 1
