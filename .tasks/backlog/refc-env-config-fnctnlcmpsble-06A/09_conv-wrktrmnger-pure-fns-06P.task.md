# Convert WorktreeManager to pure functions

---
type: feature
status: todo
area: core
assignee: implement-agent
tags:
  - refactor
  - functional
  - worktree
---


## Instruction
Convert WorktreeManager class to pure functions that use ConfigurationManager.

**Context from TRD**: WorktreeManager handles git worktree operations. Convert to functions while maintaining all current behavior.

**Key Changes**:
1. Convert class methods to pure functions
2. Accept ConfigurationManager for root resolution
3. Keep git operations unchanged (using simple-git)
4. Maintain worktree naming patterns

**Implementation Details**:
- Functions: createWorktree, listWorktrees, removeWorktree, getWorktreePath
- Export from `src/core/environment/worktree-functions.ts`
- Use simple-git library as before
- Accept git instance as parameter for testability

**Success Criteria**:
- All WorktreeManager functionality as pure functions
- Functions accept dependencies as parameters
- All worktree operations work identically
- No breaking changes to CLI behavior

## Tasks

## Deliverable

## Log
