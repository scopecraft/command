# Add parent_get MCP method

---
type: "\U0001F31F Feature"
status: In Progress
area: mcp
---


## Instruction
Add parent_get MCP method to properly handle parent task retrieval with subtasks

## Tasks
- [ ] Remove parent_id from TaskListParams interface
- [ ] Add PARENT_GET to McpMethod enum
- [ ] Create ParentGetParams interface
- [ ] Create handleParentGet handler using v2.getParentTask
- [ ] Add handler to method registry
- [ ] Test parent_get returns parent with all subtasks

## Deliverable
Clean separation of concerns: task_list for general queries, parent_get for parent-specific data with complete subtask information

## Log
