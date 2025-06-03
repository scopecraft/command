# Core: parallelizeSubtasks fails silently when called during parent_create

---
type: bug
status: todo
area: core
priority: high
tags:
  - core
  - subtasks
  - sequencing
  - parent-tasks
---


## Instruction
The `parallelizeSubtasks` function in core fails silently when called immediately after creating subtasks during parent_create. This prevents the `parallel_with` feature from working in the MCP parent_create operation.

## Tasks
- [ ] Add logging to makeTasksParallel to debug file matching
- [ ] Check if files exist and are readable when parallelizeSubtasks is called
- [ ] Consider adding a small delay or file system sync before calling makeTasksParallel
- [ ] Make makeTasksParallel return error when no files are renamed
- [ ] Add integration test for parent_create with parallel subtasks

## Deliverable
Fixed `parallelizeSubtasks` function that correctly renames subtask files when called immediately after creation

## Log
- 2025-05-30: Created from MCP normalization testing - discovered during parallel_with implementation

## Research summary
### The Issue
When creating a parent task with subtasks that should be parallel (using `parallelWith` parameter), the subtasks are created with sequential numbers (01, 02, 03) instead of sharing the same sequence number.

### Code Flow
1. MCP `parent_create` handler creates subtasks sequentially using `core.addSubtask`
2. After all subtasks are created, it calls `core.parallelizeSubtasks` with the correct IDs
3. `parallelizeSubtasks` (in `src/core/v2/task-operations.ts:150`) calls `makeTasksParallel`
4. `makeTasksParallel` (in `src/core/v2/subtask-sequencing.ts:170`) should rename the files
5. The function appears to execute but files are NOT renamed

### Evidence
Test case that demonstrates the issue:
```typescript
// Create parent with parallel subtasks
await mcp.parent_create({
  title: "TEST: Fixed parallel subtask creation",
  type: feature,
  subtasks: [
    {title: "First subtask"}, 
    {title: "Second subtask", parallelWith: "First subtask"}, 
    {title: "Third subtask", parallelWith: "First subtask"}
  ]
});
```

Expected result: All three subtasks should have sequence "01"
Actual result: Subtasks have sequences "01", "02", "03"

### Potential Causes
1. **File system timing**: Files might not be fully written when `parallelizeSubtasks` is called
2. **ID matching issue**: The `makeTasksParallel` function looks for files that include the taskId (line 191 in subtask-sequencing.ts):
   ```typescript
   const file = currentFiles.find(f => {
     const filename = basename(f);
     return filename.includes(taskId) || filename === `${taskId}.task.md`;
   });
   ```
3. **Silent failure**: The function returns success even when no files are renamed

### Workaround
The `parent_operations` parallelize command works correctly when called separately after parent creation, suggesting the issue is timing-related.
