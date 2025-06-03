# MCP handleTaskList not returning parent tasks with task_type='top-level'

---
type: bug
status: Done
area: mcp
priority: High
tags:
  - v2
  - task-filtering
  - parent-tasks
---


## Instruction
The `handleTaskList` function in the MCP handlers is not returning parent tasks even when `task_type='top-level'` is specified.

## Tasks
- [x] Investigate the `filterTasksByType` function implementation
- [x] Check if parent tasks are being properly loaded in the first place
- [x] Verify the `isParent` logic in the filtering
- [x] Add unit tests for task_type filtering
- [x] Fix the filtering logic to include parent tasks
- [x] Test that both simple and parent tasks are returned

## Deliverable
The `handleTaskList` function should correctly return both simple tasks and parent tasks when `task_type='top-level'` is specified, matching the behavior described in the code comments.

## Log

- 2025-05-29: Investigated issue and found root cause in `handleTaskList` function in `src/mcp/handlers.ts`
- 2025-05-29: Issue was that `includeParentTasks` option was not being passed to `v2.listTasks()` when `task_type='top-level'`
- 2025-05-29: Fixed by adding logic to set `listOptions.includeParentTasks = true` for top-level, parent, and all task types
- 2025-05-29: Cleaned up legacy "V1 format transformation" to proper V2 format for MCP responses
- 2025-05-29: Added comprehensive test suite in `test/mcp-task-filtering.test.ts` covering all task_type values
- 2025-05-29: All tests passing - parent tasks now correctly included in top-level task lists

## Expected behavior
According to the code comment in `src/mcp/handlers.ts:63`:
```typescript
case 'top-level':
  return isSimple || isParent; // Simple tasks + Parent overviews (no subtasks)
```

The `task_type='top-level'` filter should return both simple tasks AND parent tasks.

## Actual behavior
When calling `handleTaskList` with `task_type='top-level'`, only simple tasks are returned. Parent tasks are missing from the results.

## Testing
Tested with Scopecraft MCP tools directly:
- `task_list` with `task_type='top-level'` → Only 8 simple tasks
- `task_list` with `include_parent_tasks=true` → Still only 8 simple tasks
- `parent_list` → Returns 2 parent tasks correctly

## Impact
This breaks the V2 UI which expects to get both simple and parent tasks from a single `/api/tasks` endpoint call. Currently users only see simple tasks in the task list, missing important parent task context.

## Root cause
The filtering logic in `filterTasksByType` function appears to not be correctly identifying or including parent tasks in the results.
