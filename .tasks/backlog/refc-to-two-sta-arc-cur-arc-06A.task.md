# Refactor to two-state architecture (current + archive only)

---
type: feature
status: todo
area: core
tags:
  - architecture
  - breaking-change
  - simplification
  - workflow-states
priority: high
---


## Instruction
Simplify the task management system from three workflow states (backlog/current/archive) to just two states (current/archive). Move workflow concepts like 'backlog', 'in-progress', 'release' to metadata fields that can be filtered, eliminating file movement complexity and parent-subtask split issues.

**Problem with current system:**
- Auto-transitions cause subtask corruption when files move between states
- Parent tasks can be split across multiple workflow directories
- Complex logic to maintain parent-subtask relationships during moves
- Workflow state changes require physical file movements

**Benefits of two-state system:**
- Simpler file organization - tasks are either active (current) or archived
- No split parent issues - parent and subtasks always stay together
- More flexible workflow - status/phase becomes metadata, easily filtered
- No auto-transition complexity - tasks only move when explicitly archived
- Better for filtering - multiple views without moving files

**Key design decisions:**
- `current/` - All active work regardless of status
- `archive/YYYY-MM/` - Completed/abandoned work organized by date
- Add 'phase' or 'workflow' metadata field for backlog/active/release states
- Update all list/filter operations to use metadata instead of directories

## Tasks
- [ ] Design migration strategy and data model changes
- [ ] Create migration script to move backlog/* → current/*
- [ ] Update core types to remove WorkflowState or simplify to current/archive
- [ ] Remove auto-transition logic completely
- [ ] Update directory-utils.ts to support two-state model
- [ ] Refactor task-crud.ts move operations for simplicity
- [ ] Add phase/workflow metadata field to frontmatter
- [ ] Update all list/filter operations to use metadata
- [ ] Update CLI commands to work with new model
- [ ] Update MCP handlers for new model
- [ ] Update UI to show phase filters instead of workflow navigation
- [ ] Update documentation and examples
- [ ] Test migration with real task data
- [ ] Create rollback plan if needed

## Deliverable
A simpler, more robust task management system where:
- Tasks live in just two places: current (active) or archive (done)
- Workflow states (backlog/in-progress/release) are metadata filters
- No more file movement bugs or split parent issues
- More flexible workflow customization through metadata
- Backwards compatible migration path

## Log
