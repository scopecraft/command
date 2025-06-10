# Create regression test suite for current behavior

---
type: test
status: todo
area: core
assignee: test-agent
tags:
  - testing
  - regression
  - environment
---


## Instruction
Create comprehensive regression test suite to capture current behavior before refactoring.

**Context from TRD**: We need to ensure backward compatibility during the functional refactor. All CLI commands must work identically after the migration.

**Key Test Areas**:
1. CLI command signatures and options
2. Environment resolution logic (parent/subtask behavior)
3. Session storage and monitoring
4. Docker integration
5. Worktree operations

**Test Implementation**:
- Use existing e2e and unit test patterns
- Capture exact current behavior
- Test all command combinations
- Verify session persistence
- Check worktree creation/switching

**Success Criteria**:
- Full coverage of current behavior
- Tests pass with current implementation
- Tests will catch any breaking changes during refactor

## Tasks

## Deliverable

## Log
