# Update CLI commands to use new functions

---
type: chore
status: todo
area: cli
assignee: implement-agent
tags:
  - refactor
  - cli
  - integration
---


## Instruction
Update CLI commands to use new functional environment system.

**Context from TRD**: Replace class instantiation with function calls while maintaining exact same behavior.

**Changes Required**:
1. Update `work-commands.ts` to use new functions
2. Update `dispatch-commands.ts` to use new functions
3. Pass ConfigurationManager instance to functions
4. Keep all command signatures unchanged

**Implementation Pattern**:
```typescript
// Before:
const resolver = new EnvironmentResolver(worktreeManager);
const envId = await resolver.resolveEnvironmentId(taskId);

// After:
const configManager = ConfigurationManager.getInstance();
const envId = await resolveEnvironmentId(taskId, configManager);
```

**Success Criteria**:
- All CLI commands work identically
- No changes to command signatures or options
- Functions receive ConfigurationManager properly
- All existing CLI tests pass

## Tasks

## Deliverable

## Log
