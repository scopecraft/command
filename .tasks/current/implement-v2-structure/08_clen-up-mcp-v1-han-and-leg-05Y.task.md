# Clean up MCP V1 handlers and legacy code

---
type: feature
status: Done
area: core
---


## Instruction

Remove all V1 MCP handlers and legacy code from the MCP server. Clean up old handlers, remove phase-based operations, and ensure only V2 workflow-based handlers remain.

## Tasks

### MCP Handler Cleanup
- [x] Remove all V1 handlers from `/src/mcp/handlers.ts`
- [x] Delete old handler files (`handlers.old.ts`, `core-server.old.ts`)
- [x] Clean up phase-related MCP operations
- [x] Remove legacy feature/area management handlers
- [x] Simplify handler exports to V2 only

### Schema and Type Cleanup
- [x] Remove V1 schemas and types
- [x] Clean up MCP type definitions
- [x] Remove phase-related input/output schemas
- [x] Simplify MCP tool definitions

### Testing and Validation
- [x] Ensure all V2 MCP functionality works
- [x] Test MCP integration with cleaned handlers
- [x] Verify no V1 references remain in MCP code

## Deliverable

Clean MCP module with:
- Only V2 workflow-based handlers
- No phase or V1 legacy code
- Simplified schemas and types
- Working V2 MCP integration

## Log
- 2025-05-30: Cleaned up all V2 naming from MCP code. Changed v2 import alias to core, renamed formatV2Response to formatOperationResponse, renamed buildV2ListOptions to buildCoreListOptions, fixed all v2Task variable names, removed V2 from comments. The only remaining V2 references are in core module exports (needsV2Init, initializeV2ProjectStructure, V2Config) which are outside MCP scope.
