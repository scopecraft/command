+++
id = "CHORE-ADDPROPER-0519-2T"
title = "Add proper TypeScript schema definitions to MCP server tools"
type = "chore"
status = "🟢 Done"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-22"
assigned_to = ""
phase = "backlog"
depends_on = [ "TASK-20250517T185634" ]
tags = [ "typescript", "mcp", "schema" ]
+++

# Add proper TypeScript schema definitions to MCP server tools

Many of the MCP server tools are currently generating TypeScript errors due to missing or incorrect type schema definitions.

### Current Issues
- MCP tool responses need structuredContent property
- Type definitions for MCP tools are mismatched
- Missing outputSchema for tools that return structured data
- Incompatible type definitions for content arrays

### Tasks
- [ ] Review MCP SDK documentation to understand correct type definitions
- [ ] Add proper inputSchema and outputSchema to all MCP tools
- [ ] Implement proper CallToolResult interface support
- [ ] Update formatResponse and formatError to match expected types
- [ ] Ensure consistent type handling across all MCP tools
- [ ] Test MCP tools with updated schema definitions
- [ ] Run TypeScript checks to verify resolved errors

### Suggested Approach
First, thoroughly understand the MCP type system requirements by studying the SDK documentation. Then systematically update each tool definition to include proper schema definitions.

Start with the simpler tools like get_current_root and list_projects, then move on to more complex tools.

### Example schema format (preliminary)
```typescript
server.tool(
  'get_current_root', 
  {
    description: 'Gets the current project root configuration',
    inputSchema: z.object({}), // Empty schema for no parameters
    outputSchema: z.object({
      path: z.string(),
      source: z.string(),
      validated: z.boolean(),
      projectName: z.string().optional(),
    }),
  },
  async () => {
    // Tool implementation
  }
);
```
