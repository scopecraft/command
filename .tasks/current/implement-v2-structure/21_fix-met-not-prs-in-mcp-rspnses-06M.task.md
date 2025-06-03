# Fix metadata not persisting in MCP responses

---
type: bug
status: todo
area: mcp
priority: high
tags:
  - bug-fix
---


## Instruction
Fix metadata (priority, status) not appearing correctly in MCP responses.

**Priority Issue Root Cause**:
- Priority IS correctly stored in files
- Priority IS correctly read by transformBaseTask
- But task creation output schema doesn't include priority field
- Response only includes: id, title, type, status, workflowState, area, path, createdAt

**Status Update Issue Root Cause**:
- Automatic workflow transitions may be overriding explicit status updates
- Need to respect explicit status when provided

## Tasks
- [ ] Add priority field to TaskCreateOutput schema
- [ ] Include priority in task creation response
- [ ] Review automatic transition logic in task updates
- [ ] Ensure explicit status updates are respected
- [ ] Test that priority and status persist correctly

## Deliverable

## Log
