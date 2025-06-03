# Fix MCP location filter parameter mismatch

---
type: bug
status: done
area: mcp
priority: high
tags:
  - bug-fix
  - critical
---


## Instruction
Fix the MCP location filter parameter mismatch that causes filtering to fail.

**Root Cause**: 
- MCP server (core-server.ts:144) defines parameter as `location`
- Handler schema (schemas.ts:141) expects `workflowState`
- Parameter transformer doesn't map `location` → `workflowState`

**Impact**: task_list with location filter returns tasks from all locations, breaking data integrity

## Tasks
- [ ] Add mapping in parameter transformer to convert `location` to `workflowState`
- [ ] Test that location filtering works correctly after fix
- [ ] Verify no other MCP methods are affected by similar parameter mismatches

## Deliverable

## Log
- 2025-06-03: Task completed - location → workflowState mapping was implemented in parameter-transformer.ts:19-23 during the normalization refactor
