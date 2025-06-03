# Parent task deletion with cascade=true fails with misleading error

---
type: bug
status: todo
area: mcp
priority: medium
tags:
  - task-delete
  - parent-tasks
  - api
---


## Instruction

## Tasks

## Deliverable
- Fix task_delete to properly handle parent task deletion when cascade=true
- Ensure error messages accurately reflect the operation state
- Consider whether the method should auto-detect parent tasks

## Log
- 2025-05-30: 2025-05-29: Created bug report after encountering issue during dry run task cleanup

## Problem
When attempting to delete a parent task using the MCP `task_delete` method with `cascade: true`, the operation fails with the error:

```
"Cannot delete parent task overview directly. Delete the entire folder."
```

This error message is misleading because:
1. The cascade parameter was explicitly set to true, which should handle folder deletion
2. The error suggests manual folder deletion is required, despite cascade being enabled

## Reproduction steps
1. Create a parent task using `mcp__scopecraft__parent_create`
2. Attempt to delete it using `mcp__scopecraft__task_delete` with:
   - `id`: parent task ID
   - `cascade`: true
3. Observe the error

## Expected behavior
When `cascade: true` is specified, the task_delete method should:
- Recognize it's a parent task
- Delete the entire folder including all subtasks
- Return success

## Actual behavior
The method returns an error suggesting manual intervention is needed, despite the cascade flag being set.

## Context
- Parent task ID: `add-conf-anmton-on-task-cret-05A`
- Location: `/Users/davidpaquet/Projects/roo-task-cli/.tasks/backlog/`
- Workaround: Manual deletion with `rm -rf` works fine
