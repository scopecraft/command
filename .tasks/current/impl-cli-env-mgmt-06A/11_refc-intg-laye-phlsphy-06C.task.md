# Refactor integration layer to follow Unix philosophy

---
type: chore
status: todo
area: core
---


## Instruction
### Problem Statement

The current integration layer (`src/integrations/channelcoder/`) violates core Unix philosophy principles and creates immediate technical debt. Instead of providing simple, composable primitives that mirror the ChannelCoder SDK, it forces rigid workflows with hardcoded assumptions about tasks, sessions, and execution patterns.

### Architecture Violations

1. **Monolithic Methods**: `executeInteractive()`, `executeDocker()`, etc. bundle multiple concerns
2. **Task-Centric Assumptions**: Everything requires a taskId, even exploratory planning
3. **Rigid Workflows**: Forces specific prompt loading, session creation, and data structures
4. **Not Composable**: Cannot be used for simple use cases like the `plan` command
5. **Violates "Do One Thing Well"**: Each method does prompt loading + session management + execution + logging

### Required Reading

**CRITICAL**: Review these documents before starting:
- `docs/01-concepts/philosophy.md` - Core Unix philosophy principles
- `docs/02-architecture/system-architecture.md` - System architecture patterns
- `integration-refactoring-plan.md` - Detailed refactoring plan (in parent task folder)

### Solution Approach

Refactor the integration layer to provide simple, composable primitives that:
- Mirror ChannelCoder SDK's clean API (`claude(prompt, options)`)
- Have no hardcoded workflow assumptions
- Support dry-run as a first-class feature for easy comparison
- Enable flexible composition for any use case
- Follow Unix philosophy: small tools that do one thing well

### Success Criteria

1. **Simplicity**: A basic `claude()` call requires minimal setup
2. **Composability**: Complex workflows built from simple primitives
3. **Flexibility**: No forced patterns or required fields
4. **Dry-Run Integration**: Built-in support for command inspection
5. **Backward Compatibility**: Existing commands continue working
6. **Architecture Compliance**: Follows documented philosophy and patterns

## Tasks
### Phase 1: Foundation
- [ ] Create `src/integrations/channelcoder/core.ts` with simple wrapper interface
- [ ] Implement unified dry-run execution handler in `executor.ts`
- [ ] Create primitive utility functions (prompt-utils.ts, session-utils.ts)
- [ ] Add structured dry-run output formatting
- [ ] Write unit tests for all primitives

### Phase 2: Command Comparison
- [ ] Implement side-by-side testing framework for old vs new
- [ ] Create comparison helper to measure implementation differences
- [ ] Verify equivalent command generation in dry-run mode
- [ ] Document complexity reduction metrics

### Phase 3: Migration Implementation
- [ ] Keep existing integration layer (mark as deprecated)
- [ ] Implement new primitive-based approach in parallel
- [ ] Refactor `plan` command as proof of concept using new primitives
- [ ] Refactor `work` command to use composition instead of monolithic method
- [ ] Refactor `dispatch` command to use new approach
- [ ] Create migration guide and examples

### Phase 4: Validation & Cleanup
- [ ] Run comprehensive test suite comparing old vs new implementations
- [ ] Verify all commands produce equivalent results
- [ ] Update integration tests to use new interface
- [ ] Remove deprecated monolithic methods
- [ ] Update documentation with composition patterns

### Phase 5: Documentation
- [ ] Document new integration patterns with examples
- [ ] Create composition cookbook for common workflows
- [ ] Update architecture docs to reflect new approach
- [ ] Add philosophy compliance validation

## Deliverable
A refactored integration layer that:

1. **Clean Architecture**: Simple, composable primitives that mirror ChannelCoder SDK
2. **No Assumptions**: Works for any use case (tasks, planning, exploration)
3. **Built-in Dry-Run**: First-class support for command inspection and comparison
4. **Reduced Complexity**: Demonstrably simpler code with lower cyclomatic complexity
5. **Backward Compatibility**: All existing commands continue working
6. **Philosophy Compliance**: Follows Unix principles and documented architecture

### Key Files Delivered:
- `src/integrations/channelcoder/core.ts` - Simple wrapper interface
- `src/integrations/channelcoder/executor.ts` - Unified execution with dry-run
- `src/integrations/channelcoder/prompt-utils.ts` - Composable prompt utilities
- `src/integrations/channelcoder/session-utils.ts` - Optional session helpers
- `test/integration/implementation-comparison.test.ts` - Validation framework
- `docs/integration-patterns.md` - Usage examples and patterns

### Validation Criteria:
- Side-by-side dry-run comparison shows equivalent commands
- Complexity metrics show significant reduction
- All existing commands pass tests
- New `plan` command works without task assumptions
- Philosophy compliance validated

## Log
- 2025-06-09: Subtask created to address critical architecture violations in integration layer. The current implementation forces rigid workflows and violates Unix philosophy, making simple use cases like planning unnecessarily complex. This refactoring will provide clean, composable primitives that enable flexible composition while maintaining backward compatibility.
- 2025-06-09: Phase 1 Foundation completed successfully:
- Created core.ts with simple primitives that mirror ChannelCoder SDK
- Implemented unified dry-run support at the primitive level
- Built composable utility functions (prompt-utils.ts, session-utils.ts, composers.ts)
- Created plan command as proof of concept using new architecture
- All code compiles and plan command works with dry-run support

Key accomplishments:
- Clean separation: core primitives vs optional composers
- No hardcoded assumptions - works for any use case
- Dry-run built into the foundation, not bolted on
- Plan command demonstrates Unix philosophy compliance
- 40+ lines vs 500+ lines in old approach

Next: Phase 2 comparison framework to validate equivalence
