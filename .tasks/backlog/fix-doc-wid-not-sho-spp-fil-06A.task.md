# Fix documents widget not showing supporting files in parent task view

---
type: bug
status: todo
area: core
tags:
  - regression
  - parent-tasks
  - ui-integration
priority: high
---


## Instruction
The documents widget in the parent task view (ParentTaskView component) is not displaying any supporting files. Investigation reveals that the core implementation in `src/core/parent-tasks.ts` has a TODO comment and returns an empty array for `supportingFiles` instead of scanning the parent task folder for non-task markdown files.

## Root Cause
In the `getParentTaskWithSubtasks` function in `src/core/parent-tasks.ts`, the supportingFiles array is hardcoded:
```typescript
const parentTask: ParentTask = {
  metadata: task.metadata,
  overview: task.document,
  subtasks,
  supportingFiles: [], // TODO: Implement supporting files detection
};
```

## Expected Behavior
The function should scan the parent task folder and return all non-task markdown files (files that don't match the task file pattern like `*.task.md` or `_overview.md`) such as:
- plan.md
- architecture.md  
- design.md
- analysis.md
- Any other .md files that are documentation

## Impact
- Users cannot see supporting documentation files in the UI
- The documents widget appears empty even when files exist
- This is a regression from the recent core/MCP refactoring

## Tasks
- [ ] Implement file scanning logic in `getParentTaskWithSubtasks` to find supporting files
- [ ] Filter out task files (*.task.md) and _overview.md from the results  
- [ ] Return relative filenames (not full paths) in the supportingFiles array
- [ ] Test with various parent task folders containing different document types
- [ ] Verify the documents widget displays the files correctly in the UI

## Deliverable
- Fixed `supportingFiles` implementation that correctly scans and returns non-task markdown files
- Documents widget in parent task view shows all supporting documentation files
- No regression in other parent task functionality

## Log
