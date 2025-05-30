# Investigate current MCP response formats

---
type: "\U0001F41E Bug"
status: Progress
area: mcp
tags:
  - investigation
  - 'team:backend'
  - 'execution:autonomous'
---


## Instruction
Investigate and document the current MCP response format inconsistencies, focusing on the specific issues identified by the UI team. Document nested vs flat structure differences, field naming inconsistencies, emoji prefix issues, multiple parent detection methods, and how progress data is only added to parent_list.

## Tasks
- [ ] Review all MCP endpoints (task_list, task_get, parent_list, parent_get)
- [ ] Document response structure for each endpoint
- [ ] Document nested vs flat structure differences
- [ ] List all field naming inconsistencies (location/workflow_state, assigned_to/assignee)
- [ ] Document emoji prefix issue in type field
- [ ] List all 5 ways parent tasks are currently detected
- [ ] Review how progress data is added only to parent_list
- [ ] Identify all field naming inconsistencies
- [ ] Compare with core task-parser output
- [ ] Create comprehensive inconsistency report

## Deliverable

## Log
