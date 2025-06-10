# Run full regression test suite

---
type: test
status: todo
area: core
assignee: test-agent
tags:
  - testing
  - validation
  - regression
---


## Instruction
Run full regression test suite to verify no breaking changes.

**Context**: After all refactoring is complete, run comprehensive tests to ensure backward compatibility.

**Test Execution**:
1. Run all unit tests
2. Run all e2e tests
3. Run new regression tests
4. Manual testing of key workflows

**Key Verification Points**:
- All CLI commands work identically
- Environment resolution unchanged
- Session monitoring fixed and working
- Docker integration intact
- Worktree operations normal

**Manual Test Scenarios**:
- Create task and work in worktree
- Dispatch autonomous task
- Resume sessions
- UI monitors sessions correctly

**Success Criteria**:
- All automated tests pass
- Manual testing confirms no breaking changes
- Session monitoring bug is fixed
- Ready for production use

## Tasks

## Deliverable

## Log
