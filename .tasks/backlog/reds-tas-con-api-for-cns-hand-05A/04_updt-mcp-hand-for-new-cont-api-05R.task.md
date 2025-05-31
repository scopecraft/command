# Update MCP handlers for new content API

---
type: feature
status: To Do
area: mcp
tags:
  - mcp
  - ai-integration
---


## Instruction
Update MCP handlers and transformers to use the new content API, ensuring AI agents get clean content.

### Key Updates
1. Update transformers to use new content serialization
2. Add content control parameters to task_get
3. Update task_update to handle custom sections
4. Ensure parent_get uses new content format
5. Update schemas for new parameters

### Files to Update
- `src/mcp/transformers.ts`: Content transformation
- `src/mcp/normalized-handlers.ts`: Read operations
- `src/mcp/normalized-write-handlers.ts`: Write operations
- `src/mcp/schemas.ts`: Schema definitions

## Tasks
- [ ] Update transformTask to use new content fields
- [ ] Add includeMetadata parameter to task_get
- [ ] Update schemas with new content parameters
- [ ] Modify transformers to handle content options
- [ ] Update write handlers for custom sections
- [ ] Add MCP integration tests
- [ ] Update MCP documentation

## Deliverable
- Updated MCP handlers with content control
- Clean content for AI agents (no frontmatter)
- Support for custom section updates
- MCP integration tests

## Log
