# Fix subtask auto-transition when status changes to in_progress

---
type: bug
status: todo
area: core
tags:
  - subtask
  - workflow
  - transition
  - bug-fix
  - parent-task
priority: high
---


## Instruction
Fix the bug where subtasks are incorrectly moved from their parent folder to the current workflow when their status changes to "in_progress". Subtasks should always remain within their parent task folder regardless of status changes.

## Problem Description

When a subtask's status is changed to "in_progress" while its parent task is still in the backlog, the subtask gets automatically moved out of the parent folder and becomes a standalone task in the current workflow. This breaks the parent-subtask relationship and causes organizational issues.

## Root Cause Analysis

The issue is in `src/core/task-crud.ts` in the `shouldAutoTransition` function (line 341). This function applies the same auto-transition logic to all tasks without checking if a task is a subtask:

```typescript
// Main rule: backlog tasks that become "in_progress" should move to current
if (currentWorkflow === 'backlog' && newStatus === 'in_progress') {
  return 'current';
}
```

The `update` function (line 375) calls `shouldAutoTransition` and moves tasks automatically without considering the parent-subtask relationship.

## Expected Behavior

1. Subtasks should NEVER be automatically transitioned between workflows independently
2. Subtasks should always remain in their parent task folder
3. Only the parent task can be moved between workflows, taking all its subtasks with it
4. Status changes on subtasks should update the status but not trigger any workflow transitions

## Tasks
- [ ] Modify `shouldAutoTransition` function to check if task is a subtask before applying transitions
- [ ] Add condition to skip auto-transition for tasks with `parentTask` metadata
- [ ] Verify the fix doesn't break parent task transitions
- [ ] Add unit tests for subtask status updates
- [ ] Add integration test to ensure subtasks stay within parent folders
- [ ] Test that parent tasks can still auto-transition when their own status changes
- [ ] Update any related documentation about workflow transitions

## Deliverable
- Updated `shouldAutoTransition` function that respects parent-subtask relationships
- Unit and integration tests confirming subtasks remain in parent folders
- Parent tasks continue to auto-transition normally
- No regression in existing workflow transition behavior

## Log
- 2025-06-05: Task created from bug report - analyzed root cause in task-crud.ts
