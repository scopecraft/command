# Refactor to clean CRUD API and fix subtask operations

---
type: chore
status: To Do
area: core
---


## Instruction
Refactor the task-crud API to use clean CRUD naming conventions (create, get, update, delete) and implement a builder pattern for parent operations. This refactoring will fix several critical bugs including subtask creation/deletion issues and API inconsistencies.

## Reference Documents
- Detailed refactoring plan: `.tasks/current/implement-v2-structure/refactoring-plan-crud-api-cleanup.md`
- Original architecture analysis from conversation

## Critical Bugs This Must Fix
1. **Subtask deletion bug**: Currently fails with "Cannot delete parent task overview directly" when trying to delete subtasks
2. **Subtask creation bug**: MCP task_create with parent_id was creating simple tasks instead of subtasks (partially fixed)
3. **Inconsistent parentId support**: Some CRUD functions accept parentId, others don't
4. **API naming inconsistency**: Non-standard function names vs. industry CRUD conventions

## Major Architectural Cleanup
**Analysis**: task-operations.ts contains NO true multi-task operations - all functions operate on single parents:
- resequenceSubtasks, parallelizeSubtasks, updateSubtaskSequence → Move to parent builder
- promoteToParent, extractSubtask, adoptTask → Move to parent builder
- addSubtask → Remove (duplicate)

**Decision**: If no true multi-task operations remain, DELETE task-operations.ts entirely

## Tasks
- [ ] **Phase 1: Core CRUD Rename**
  - [ ] Use VS Code rename symbol to change createTask → create
  - [ ] Use VS Code rename symbol to change getTask → get
  - [ ] Use VS Code rename symbol to change updateTask → update
  - [ ] Use VS Code rename symbol to change deleteTask → delete
  - [ ] Use VS Code rename symbol to change moveTask → move
  - [ ] Use VS Code rename symbol to change listTasks → list
  - [ ] Add missing parentId parameters to all CRUD functions
  - [ ] Update core/index.ts exports

- [ ] **Phase 2: Update All Consumers**
  - [ ] Update MCP handlers (normalized-handlers.ts, normalized-write-handlers.ts)
  - [ ] Update CLI commands (cli/commands.ts)
  - [ ] Update parent-tasks.ts to use new CRUD functions
  - [ ] Update task-operations.ts to use new CRUD functions (before moving)

- [ ] **Phase 3: Implement Builder Pattern + File Cleanup**
  - [ ] Create parent() builder function in parent-tasks.ts
  - [ ] Move single-parent operations from task-operations.ts to parent builder:
    - [ ] resequenceSubtasks → parent().resequence()
    - [ ] parallelizeSubtasks → parent().parallelize()
    - [ ] updateSubtaskSequence → parent().updateSequence()
    - [ ] extractSubtask → parent().extractSubtask()
    - [ ] adoptTask → parent().adoptTask()
  - [ ] Remove duplicate addSubtask from task-operations.ts
  - [ ] Evaluate: DELETE task-operations.ts if no true multi-task operations remain
  - [ ] Update core/index.ts exports (remove task-operations exports if deleted)
  - [ ] Update MCP handlers to use builder for parent operations

- [ ] **Phase 4: Critical Bug Validation**
  - [ ] Test subtask creation via MCP (should create in parent folder)
  - [ ] Test subtask deletion via MCP (should delete subtask file, not fail)
  - [ ] Test parent operations resequence (should work with new API)
  - [ ] Test regular task operations still work
  - [ ] Verify no imports reference deleted task-operations.ts
  - [ ] Run full test suite to ensure no regressions

## Deliverable
- Clean CRUD API with consistent naming (create, get, update, delete, move, list)
- All CRUD functions support parentId parameter for subtask operations
- Builder pattern for parent operations: parent(projectRoot, id).create(), .get(), .delete(), .resequence(), etc.
- Fixed subtask creation bug (MCP creates subtasks correctly when parent_id provided)
- Fixed subtask deletion bug (MCP can delete subtasks without parent folder error)
- Potentially deleted task-operations.ts if no true multi-task operations exist
- All tests passing
- MCP integration working correctly with new API
- Clean file structure with clear separation of concerns
- Documentation updated (refactoring plan serves as implementation guide)

## Log

## Reference documents
- Detailed refactoring plan: `docs/refactoring-plan-crud-api-cleanup.md`
- Original architecture analysis from conversation

## Critical bugs this must fix
1. **Subtask deletion bug**: Currently fails with "Cannot delete parent task overview directly" when trying to delete subtasks
2. **Subtask creation bug**: MCP task_create with parent_id was creating simple tasks instead of subtasks (partially fixed)
3. **Inconsistent parentId support**: Some CRUD functions accept parentId, others don't
4. **API naming inconsistency**: Non-standard function names vs. industry CRUD conventions
