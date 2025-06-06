# Implement New Workflow-Based Task Structure

---
type: feature
status: done
area: core
priority: high
tags:
  - architecture
  - breaking-change
  - core
---


## Instruction
Implement the new workflow-based task structure for Scopecraft, replacing the rigid phase/feature hierarchy with a flexible backlog/current/archive workflow system. This is a clean-break implementation - no backwards compatibility required.

### Key Changes
1. **Workflow folders**: backlog/, current/, archive/ instead of phases
2. **Unified documents**: Tasks have sections (Instruction/Tasks/Deliverable/Log)
3. **Stable IDs**: Filename-based, not path-based
4. **Complex tasks**: Folders with _overview.md and subtasks

## Tasks
- [ ] Core refactor (01-core-refactor.task.md)
- [ ] CLI updates (02-cli-update.task.md)
- [ ] MCP updates (02-mcp-update.task.md)
- [ ] UI updates (03-ui-update.task.md)

## Deliverable
Implementation tracking:
- Core: Not started
- CLI: Not started
- MCP: Not started
- UI: Not started

## Log
- 2025-05-27 16:00: Moved from backlog to current, created subtask structure
- 2025-05-27: Extensive design discussion on new structure
- 2025-05-27: Created technical specification
- 2025-05-27: Task originally created in backlog
