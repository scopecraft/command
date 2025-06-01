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

### Response Format
```typescript
// All responses use this structure
{
  success: boolean,
  data?: T,
  error?: string,
  message: string,
  metadata?: { timestamp, version }
}
```

## Do's and Don'ts

### Do's
- ✅ Use the method registry for all operations
- ✅ Validate inputs with Zod schemas
- ✅ Return consistent response formats
- ✅ Include helpful context in error messages
- ✅ Handle edge cases gracefully
- ✅ Document new operations thoroughly

### Don'ts
- ❌ Return raw errors from core layer
- ❌ Mix transport logic with business logic
- ❌ Assume AI knows internal details
- ❌ Return null/undefined without explanation
- ❌ Break existing response contracts

## Testing Approach

### Manual Testing
```bash
# Start MCP server
bun run mcp:stdio

# Test operations through Claude or other MCP clients
```

### Unit Testing
- Test handlers with mock data
- Verify schema validation
- Check error handling paths

## Common Tasks

- **Adding new operations**: Define schema, create handler, add to registry
- **Enhancing existing operations**: Update schema, modify handler logic
- **Improving error messages**: Make them more actionable for AI
- **Optimizing performance**: Use appropriate filters and projections

## Related Documentation
- Architecture Details: `docs/mcp-architecture.md`
- Tool Descriptions: `docs/mcp-tool-descriptions.md`
- Core Task System: `docs/specs/task-system-design.md`