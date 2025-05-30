# MCP (Model Context Protocol) Area Guide

## Quick Architecture Overview
The MCP area provides an API server that allows AI agents (like Claude) to interact with the task management system. It follows the Model Context Protocol specification and provides both HTTP/SSE and STDIO transports.

## Key Files and Utilities

### Core MCP Files
- `src/mcp/server.ts` - Main server setup and initialization
- `src/mcp/handlers.ts` - All MCP method implementations (task_list, parent_list, etc.)
- `src/mcp/types.ts` - TypeScript types for requests/responses
- `src/mcp/http-server.ts` - HTTP/SSE transport implementation
- `src/mcp/stdio-server.ts` - STDIO transport implementation

### Handler Pattern
```typescript
// All handlers follow this pattern in handlers.ts
export async function handleMethodName(
  params: MethodParams,
  context: HandlerContext
): Promise<MethodResponse> {
  // 1. Validate params
  // 2. Call core functions
  // 3. Transform to MCP response
  // 4. Handle errors gracefully
}
```

## Common Patterns

### Response Building
```typescript
// Always return consistent response structure
return {
  success: true,
  data: transformedData,
  error: null
};
```

### Error Handling
```typescript
// Always provide AI-friendly error messages
catch (error) {
  return {
    success: false,
    data: null,
    error: {
      code: 'TASK_NOT_FOUND',
      message: 'Task with ID example-01A not found. Please check the ID and try again.',
      details: error.message
    }
  };
}
```

### Core Integration
```typescript
// Always use the v2 core functions
import { taskOperations } from '../core/v2';

// Transform core responses to MCP format
const coreTasks = await taskOperations.listTasks(filters);
return coreTasks.map(transformToMCPFormat);
```

## Do's and Don'ts

### Do's
- ✅ Validate all input parameters
- ✅ Return consistent response formats across all methods
- ✅ Provide helpful error messages for AI consumption
- ✅ Include examples in error messages when possible
- ✅ Use TypeScript types for all requests/responses
- ✅ Handle edge cases (empty results, not found, etc.)
- ✅ Document response format in method comments

### Don'ts
- ❌ Return raw core errors to the API
- ❌ Use different response structures for similar methods
- ❌ Assume AI knows internal implementation details
- ❌ Return null/undefined without explanation
- ❌ Mix transport logic with business logic

## Testing Approach

### E2E Testing
```bash
# Test actual MCP methods via CLI
bun run dev:cli task list --format json
bun run dev:cli parent list --format json

# Validate response consistency
# Check for required fields
# Ensure proper error messages
```

### Manual Testing
```bash
# Start MCP server
bun run mcp:http

# Test with curl
curl http://localhost:3000/mcp/v1/task/list
```

## Related Documentation
- MCP Protocol Spec: `docs/mcp-sdk.md`
- Tool Descriptions: `docs/mcp-tool-descriptions.md`
- API Testing: `test/mcp/`

## Common Tasks for MCP Area
- Adding new MCP methods
- Ensuring response consistency
- Improving error messages
- Adding method parameters
- Optimizing query performance
- Enhancing AI agent experience