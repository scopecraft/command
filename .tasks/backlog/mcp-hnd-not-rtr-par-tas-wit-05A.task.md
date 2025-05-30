# MCP handleTaskList not returning parent tasks with task_type='top-level'

---
type: "\U0001F41E Bug"
status: To Do
area: mcp
priority: High
tags:
  - v2
  - task-filtering
  - parent-tasks
---


## Instruction
The `handleTaskList` function in the MCP handlers is not returning parent tasks even when `task_type='top-level'` is specified.

## Expected Behavior
According to the code comment in `src/mcp/handlers.ts:63`:
```typescript
case 'top-level':
  return isSimple || isParent; // Simple tasks + Parent overviews (no subtasks)
```

The `task_type='top-level'` filter should return both simple tasks AND parent tasks.

## Actual Behavior
When calling `handleTaskList` with `task_type='top-level'`, only simple tasks are returned. Parent tasks are missing from the results.

## Testing
Tested with Scopecraft MCP tools directly:
- `task_list` with `task_type='top-level'` → Only 8 simple tasks
- `task_list` with `include_parent_tasks=true` → Still only 8 simple tasks
- `parent_list` → Returns 2 parent tasks correctly

## Impact
This breaks the V2 UI which expects to get both simple and parent tasks from a single `/api/tasks` endpoint call. Currently users only see simple tasks in the task list, missing important parent task context.

## Root Cause
The filtering logic in `filterTasksByType` function appears to not be correctly identifying or including parent tasks in the results.

## Tasks
- [ ] Investigate the `filterTasksByType` function implementation
- [ ] Check if parent tasks are being properly loaded in the first place
- [ ] Verify the `isParent` logic in the filtering
- [ ] Add unit tests for task_type filtering
- [ ] Fix the filtering logic to include parent tasks
- [ ] Test that both simple and parent tasks are returned

## Deliverable
The `handleTaskList` function should correctly return both simple tasks and parent tasks when `task_type='top-level'` is specified, matching the behavior described in the code comments.

## Log
