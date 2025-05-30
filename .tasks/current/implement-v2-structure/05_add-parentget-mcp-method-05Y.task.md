# Add parent_get MCP method

---
type: "\U0001F31F Feature"
status: Done
area: mcp
---


## Instruction
Add parent_get MCP method to properly handle parent task retrieval with subtasks

## Tasks
- [x] Remove parent_id from TaskListParams interface
- [x] Add PARENT_GET to McpMethod enum
- [x] Create ParentGetParams interface
- [x] Create handleParentGet handler using v2.getParentTask
- [x] Add handler to method registry
- [x] Test parent_get returns parent with all subtasks
- [x] Remove deprecated task_next and workflow_mark_complete_next tools

## Deliverable
Clean separation of concerns: task_list for general queries, parent_get for parent-specific data with complete subtask information

## Log

- 2025-05-30: Implemented parent_get MCP method for clean separation of concerns. Also removed deprecated V1 tools.
