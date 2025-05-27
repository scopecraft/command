# Core System Refactor for V2 Structure

---
type: chore
status: 🟡 To Do
area: core
assignee: 
---

## Instruction

Refactor the core task management system to support the new workflow-based structure. This is the foundation that all other components depend on.

**IMPORTANT**: This plan is not complete. Start by reviewing the entire core codebase to understand all the implications. Pay special attention to:
- Configuration system - what should be configurable?
- Initialization process - how do we create the new folder structure?
- Migration utilities - even if manual, do we need helpers?
- Template system - how do templates work with new structure?
- Don't hesitate to ask questions about architectural decisions.

### Initial Scope (to be expanded)
1. Update directory utilities for new folder structure
2. Implement new ID generation and resolution
3. Update task CRUD operations
4. Modify task parser for unified document sections
5. Update type definitions

### Key Files to Modify
- `src/core/task-manager/directory-utils.ts`
- `src/core/task-manager/id-generator.ts`
- `src/core/task-manager/task-crud.ts`
- `src/core/task-parser.ts`
- `src/core/types.ts`

## Tasks

- [ ] Create workflow folders (backlog/current/archive) on init
- [ ] Update directory scanning to ignore phase/feature structure
- [ ] Implement new ID generation (name-MMDD-XX pattern)
- [ ] Add ID resolution with search order: current → backlog → archive
- [ ] Update task parser for required sections
- [ ] Add section-based read/write methods
- [ ] Update task create to use backlog/ by default
- [ ] Implement task move between workflow states
- [ ] Update type definitions for workflow location
- [ ] Remove phase/feature from path logic
- [ ] Add complex task detection (folders with _overview.md)
- [ ] Write tests for new functionality

## Deliverable

[To be updated as implementation progresses]

## Log

- 2025-05-27: Task created as part of V2 implementation