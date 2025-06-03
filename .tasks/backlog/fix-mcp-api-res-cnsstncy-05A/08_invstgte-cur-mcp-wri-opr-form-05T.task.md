# Investigate current MCP write operation formats

---
type: bug
status: Done
area: mcp
tags:
  - investigation
  - 'team:backend'
  - 'execution:autonomous'
  - write-operations
parent: fix-mcp-api-res-cnsstncy-05A
---


## Instruction
Investigate and document the current MCP write operation format inconsistencies, focusing on how write operations (create, update, delete, move, transform) use different field names, parameter formats, and response structures compared to the normalized read operations. Document inconsistencies with the already-implemented normalized read schema.

**Key Focus Areas:**
- Input parameter field naming (location vs workflowState, assigned_to vs assignee)
- Response format differences between write vs read operations  
- Type field handling (emoji prefixes in write inputs vs clean enums in read outputs)
- Status and priority field formats
- Response envelope inconsistencies
- Error handling format differences

**Write Operations to Analyze:**
- task_create, task_update, task_delete, task_move, task_transform
- parent_create, parent_operations
- All supporting CRUD operations

## Tasks
- [x] Review all MCP write endpoints (task_create, task_update, task_delete, task_move, task_transform)
- [x] Review parent write operations (parent_create, parent_operations)
- [x] Document input parameter field naming inconsistencies with read operations
- [x] Document response format differences between write vs read operations
- [x] Compare write operation input schemas vs normalized read output schemas
- [x] List all field name mismatches (location/workflowState, assigned_to/assignee)
- [x] Document emoji prefix handling differences
- [x] Analyze error response format consistency
- [x] Compare response envelope structures
- [x] Create comprehensive write operation inconsistency report

## Deliverable
- ✅ Comprehensive investigation report: `write-operations-inconsistency-report.md`
- ✅ Documented all write vs read format inconsistencies
- ✅ Clear comparison between current write inputs and normalized read outputs
- ✅ Analysis of impact on UI team trying to use consistent API

## Log
- 2025-05-30: Completed comprehensive investigation of MCP write operation format inconsistencies. Created detailed report documenting all field naming mismatches (location vs workflowState), response format differences, schema validation gaps, and impact on UI teams. Key findings: write operations lack Zod schema validation, use inconsistent field names, have no standardized response envelopes, and mix legacy patterns with v2 implementation. Report saved to write-operations-inconsistency-report.md (src/mcp/handlers.ts, src/mcp/types.ts, src/mcp/schemas.ts)
