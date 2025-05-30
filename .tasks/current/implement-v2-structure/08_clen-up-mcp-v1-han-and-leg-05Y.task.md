# Clean up MCP V1 handlers and legacy code

---
type: feature
status: To Do
area: core
---


## Instruction

Remove all V1 MCP handlers and legacy code from the MCP server. Clean up old handlers, remove phase-based operations, and ensure only V2 workflow-based handlers remain.

## Tasks

### MCP Handler Cleanup
- [ ] Remove all V1 handlers from `/src/mcp/handlers.ts`
- [ ] Delete old handler files (`handlers.old.ts`, `core-server.old.ts`)
- [ ] Clean up phase-related MCP operations
- [ ] Remove legacy feature/area management handlers
- [ ] Simplify handler exports to V2 only

### Schema and Type Cleanup
- [ ] Remove V1 schemas and types
- [ ] Clean up MCP type definitions
- [ ] Remove phase-related input/output schemas
- [ ] Simplify MCP tool definitions

### Testing and Validation
- [ ] Ensure all V2 MCP functionality works
- [ ] Test MCP integration with cleaned handlers
- [ ] Verify no V1 references remain in MCP code

## Deliverable

Clean MCP module with:
- Only V2 workflow-based handlers
- No phase or V1 legacy code
- Simplified schemas and types
- Working V2 MCP integration

## Log
