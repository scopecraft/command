# Convert EnvironmentResolver to pure functions

---
type: feature
status: todo
area: core
assignee: implement-agent
tags:
  - refactor
  - functional
  - environment
---


## Instruction
Convert EnvironmentResolver class to pure functions that properly use ConfigurationManager.

**Context from TRD**: EnvironmentResolver currently creates its own ConfigurationManager instance internally. This creates tight coupling and makes testing difficult.

**Key Changes**:
1. Convert class methods to pure functions
2. Accept ConfigurationManager as parameter
3. Keep exact same behavior for environment ID resolution
4. Maintain parent/subtask logic unchanged

**Implementation Details**:
- Current: `resolver.resolveEnvironmentId(taskId)`
- New: `resolveEnvironmentId(taskId, configManager)`
- Functions: resolveEnvironmentId, ensureEnvironment, getEnvironmentInfo
- Export from `src/core/environment/functions.ts`

**Success Criteria**:
- All EnvironmentResolver functionality as pure functions
- Functions accept ConfigurationManager as parameter
- All existing tests pass
- No breaking changes to CLI commands

## Tasks

## Deliverable

## Log
