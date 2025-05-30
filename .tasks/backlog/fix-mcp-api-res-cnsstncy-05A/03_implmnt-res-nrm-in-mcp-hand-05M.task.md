# Implement response normalization in MCP handlers

---
type: "\U0001F41E Bug"
status: To Do
area: mcp
tags:
  - implementation
  - 'team:backend'
  - 'execution:autonomous'
---


## Instruction
Implement response normalization in MCP handlers to ensure consistent output across all endpoints. Specifically: flatten nested metadata/document structure, normalize field names (location→workflow_state, assigned_to→assignee), strip emoji prefixes from type field, add single task_type field for parent detection, and include progress fields for all parent task responses.

## Tasks
- [ ] Create response normalization utilities
- [ ] Update task_list handler to use new format
- [ ] Update parent_list handler to use new format
- [ ] Ensure proper error handling
- [ ] Maintain backward compatibility if needed

## Deliverable

## Log
