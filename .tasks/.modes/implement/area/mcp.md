# MCP (Model Context Protocol) Area Guide

## Overview

The MCP area provides an API server that allows AI agents (like Claude) to interact with the task management system. It follows the Model Context Protocol specification and provides both HTTP/SSE and STDIO transports.

For detailed architecture, field transformations, and implementation details, see: `docs/mcp-architecture.md`

## Key Principles

### 1. Consistent API Design
- All operations use the same response envelope format
- Field names follow JavaScript conventions (camelCase)
- Clean enum values without decorations
- Comprehensive error messages for AI consumption

### 2. Type Safety
- Zod schemas validate all inputs and outputs
- TypeScript types generated from schemas
- Runtime validation prevents data corruption

### 3. AI-Friendly Responses
```typescript
// Always provide context in errors
{
  success: false,
  error: "Task with ID example-01A not found",
  message: "Please check the task ID and try again"
}
```

## Storage Considerations

MCP handlers don't need to know about storage paths:
- Use core layer functions that handle path resolution
- ConfigurationManager provides project root
- All path resolution happens in core layer

## Common Patterns

### Handler Structure
All handlers follow a consistent pattern:
1. Parse and validate input with Zod schema
2. Call core layer functions
3. Transform response to normalized format
4. Return consistent response envelope

### Error Handling
```typescript
// Provide actionable error messages
catch (error) {
  return {
    success: false,
    error: error.message,
    message: "Operation failed - check error details",
    metadata: { timestamp, version }
  };
}
```

### Parameter Normalization
The `ParameterTransformer` service handles all enum conversions:
- Frontend values (like "🔵 In Progress") → Internal values ("in_progress")
- Happens automatically before handlers receive data
- Handlers work with clean internal values only

## Key Files

### Handler Organization
- `src/mcp/handlers/` - All MCP handler implementations
  - `read-handlers.ts` - Query operations (list, get)
  - `write-handlers.ts` - Mutation operations (create, update, delete)
  - `shared/` - Common utilities

### Core Files
- `src/mcp/server.ts` - Server setup and registration
- `src/mcp/schemas.ts` - Zod schemas and types
- `src/mcp/parameter-transformer.ts` - Frontend↔Backend conversions
- `src/mcp/handler-wrapper.ts` - Consistent error handling

## Testing MCP Handlers

### Quick Test with cURL
```bash
# Test task list
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"task_list","params":{}}'
```

### Unit Testing Pattern
```typescript
// Test normalized output
const result = await handler(params);
expect(result.success).toBe(true);
expect(result.data).toMatchSchema(outputSchema);
```

## Do's and Don'ts

### Do's
- ✅ Use core layer functions for all business logic
- ✅ Transform responses to normalized format
- ✅ Provide helpful error messages
- ✅ Validate with Zod schemas
- ✅ Keep handlers thin

### Don'ts
- ❌ Implement business logic in handlers
- ❌ Access file system directly
- ❌ Return frontend-formatted values
- ❌ Skip validation