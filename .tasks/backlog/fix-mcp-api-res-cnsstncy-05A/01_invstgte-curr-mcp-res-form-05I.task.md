# Investigate current MCP response formats

---
type: "\U0001F41E Bug"
status: Done
area: mcp
tags:
  - investigation
  - 'team:backend'
  - 'execution:autonomous'
---


## Instruction
Investigate and document the current MCP response format inconsistencies, focusing on the specific issues identified by the UI team. Document nested vs flat structure differences, field naming inconsistencies, emoji prefix issues, multiple parent detection methods, and how progress data is only added to parent_list.

## Tasks
- [x] Review all MCP endpoints (task_list, task_get, parent_list, parent_get)
- [x] Document response structure for each endpoint
- [x] Document nested vs flat structure differences
- [x] List all field naming inconsistencies (location/workflow_state, assigned_to/assignee)
- [x] Document emoji prefix issue in type field
- [x] List all 5 ways parent tasks are currently detected
- [x] Review how progress data is added only to parent_list
- [x] Identify all field naming inconsistencies
- [x] Compare with core task-parser output
- [x] Create comprehensive inconsistency report

## Deliverable
- Created comprehensive investigation report: `investigation-report.md`
- Documented all MCP response structure inconsistencies
- Analyzed impact on UI and identified root causes
- Provided clear comparison between current MCP format and UI expectations

## Log
- 2025-05-30: Completed investigation of MCP response format inconsistencies
  - Analyzed MCP handlers code (src/mcp/handlers.ts)
  - Reviewed UI mock data expectations (task-ui-2/src/lib/api/mock-data-v2.ts)
  - Documented 5 major inconsistency categories
  - Created comprehensive report in investigation-report.md
  - Key findings: deeply nested structure vs flat, field naming differences, emoji prefixes in types, complex parent detection, inconsistent progress data placement
