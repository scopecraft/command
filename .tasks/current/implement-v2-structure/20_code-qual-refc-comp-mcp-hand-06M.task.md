# Refactor MCP handlers and core functions to reduce complexity violations

---
type: chore
status: todo
area: mcp
priority: high
tags:
  - code-quality
  - complexity
  - refactoring
  - technical-debt
---


## Instruction
Refactor MCP handlers and core functions to resolve excessive cognitive complexity violations found during code quality checks. Multiple functions exceed the maximum complexity limit of 15.

**Context**: After implementing MCP filtering fixes, code quality checks revealed 8 functions with excessive complexity (scores 17-58). These need to be broken down into smaller, more maintainable functions.

**Code Quality Rule**: Biome lint rule `noExcessiveCognitiveComplexity` requires functions to have complexity ≤ 15.

**Impact**: High complexity makes code hard to understand, test, and maintain. The worst offender (`handleParentCreateNormalized`) has complexity 58 - nearly 4x the limit.

## Tasks

## Deliverable

## Log

## Critical priority (complexity 50+)
- [ ] **handleParentCreateNormalized** (58→15) - `src/mcp/normalized-write-handlers.ts:519`
  - Extract subtask creation logic into separate function
  - Extract metadata building into helper function
  - Extract validation logic into separate function
  - Split parent vs simple task creation paths

## High priority (complexity 25+)
- [ ] **handleTaskUpdateNormalized** (28→15) - `src/mcp/normalized-write-handlers.ts:171`
  - Extract input validation and normalization
  - Extract update options building logic
  - Separate metadata vs content updates

- [ ] **handleTaskCreateNormalized** (26→15) - `src/mcp/normalized-write-handlers.ts:53`
  - Separate subtask creation from simple task creation
  - Extract options building into helper function
  - Extract response transformation logic

- [ ] **core create function** (24→15) - `src/core/task-crud.ts:80`
  - Extract file validation logic
  - Extract metadata preparation
  - Separate creation from validation

## Medium priority (complexity 20-24)
- [ ] **handleParentOperationsNormalized** (24→15) - `src/mcp/normalized-write-handlers.ts:656`
  - Extract individual operation handlers (resequence, parallelize, add_subtask)
  - Create operation-specific validation functions

- [ ] **transformMcpParams** (21→15) - `src/mcp/parameter-transformer.ts:11`
  - Break into type-specific transformation functions
  - Extract nested object handling logic

- [ ] **handleTaskTransformNormalized** (20→15) - `src/mcp/normalized-write-handlers.ts:401`
  - Extract operation-specific logic (promote, extract, adopt)
  - Create transformation helper functions

## Low priority (complexity 17-19)
- [ ] **handleTaskListNormalized** (17→15) - `src/mcp/normalized-handlers.ts:111`
  - Extract filter building logic to separate function
  - Simplify conditional branching

## Related issues
- [ ] **Fix worktree TypeScript errors** - 18 errors in `src/core/worktree/task-correlation-service.ts`
  - Property access errors on TaskMetadata type
  - Type mismatch between RuntimeConfig and ProjectConfig
  - Missing properties: tags, status, title, id, overview

## Expected deliverables
### Code Quality Improvements
- All 8 functions reduced to complexity ≤ 15
- Biome code quality checks passing without complexity violations
- Improved code maintainability and testability

### Specific Function Targets
1. **handleParentCreateNormalized**: 58 → ≤ 15 (4 smaller functions)
2. **handleTaskUpdateNormalized**: 28 → ≤ 15 (3 smaller functions)
3. **handleTaskCreateNormalized**: 26 → ≤ 15 (3 smaller functions)
4. **core create function**: 24 → ≤ 15 (2-3 smaller functions)
5. **handleParentOperationsNormalized**: 24 → ≤ 15 (operation handlers)
6. **transformMcpParams**: 21 → ≤ 15 (type-specific transformers)
7. **handleTaskTransformNormalized**: 20 → ≤ 15 (operation handlers)
8. **handleTaskListNormalized**: 17 → ≤ 15 (filter extraction)

### Documentation
- Updated function documentation for new smaller functions
- Clear separation of concerns documented
- Refactoring decisions documented for future reference

### Testing
- All existing functionality preserved
- No regressions in MCP filtering or CRUD operations
- Code quality checks passing
