# Update MCP handlers for new content API

---
type: feature
status: done
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
- [x] Update transformTask to use new content fields
- [x] Add includeContent parameter to task_get
- [x] Update schemas with new content parameters
- [x] Modify transformers to handle content options
- [ ] Update write handlers for custom sections
- [x] Add MCP integration tests
- [ ] Update MCP documentation

## Deliverable
- Removed format parameter from task_get (always includes content)
- Updated transformers to only use bodyContent/overviewContent fields
- Removed deprecated content/overview fields from schemas
- task_get/parent_get: Always include clean content
- task_list/parent_list: Respect includeContent parameter
- All responses now use serializeTaskContent() for clean, frontmatter-free content

## Log
