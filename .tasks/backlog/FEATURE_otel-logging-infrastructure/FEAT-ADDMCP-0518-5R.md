+++
id = "FEAT-ADDMCP-0518-5R"
title = "Add MCP Server Logging"
type = "implementation"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-18"
updated_date = "2025-05-18"
assigned_to = ""
phase = "backlog"
parent_task = "otel-logging-infrastructure"
previous_task = "FEAT-MIGRATECLI-0518-3V"
tags = [ "AREA:mcp", "implementation", "otel" ]
subdirectory = "FEATURE_otel-logging-infrastructure"
+++

# Add MCP Server Logging

## Objective
Integrate OTEL logging with the MCP server to provide comprehensive request/response logging, error tracking, and debugging capabilities.

## Implementation Tasks

### 1. MCP Logger Setup
- [ ] Create MCP logger instances with proper namespaces
- [ ] Configure module-specific loggers for different MCP components
- [ ] Set up appropriate log levels for MCP operations
- [ ] Add MCP-specific attributes to logs

### 2. Request/Response Middleware
- [ ] Create logging middleware for HTTP server
- [ ] Log incoming requests with method and path
- [ ] Log response status and timing
- [ ] Add request ID for correlation
- [ ] Handle error responses appropriately

### 3. Tool Operation Logging
- [ ] Log tool invocations with parameters
- [ ] Track tool execution time
- [ ] Log tool results (with size limits)
- [ ] Add error context for failures
- [ ] Implement verbose mode for debugging

### 4. Error Handling Integration
- [ ] Replace console.error with structured logging
- [ ] Add stack traces for errors
- [ ] Preserve error context through layers
- [ ] Log validation errors with details
- [ ] Handle timeout scenarios

### 5. STDIO Server Logging
- [ ] Add logging to stdio server variant
- [ ] Log message parsing and validation
- [ ] Track client connections
- [ ] Handle protocol errors
- [ ] Debug mode for message contents

## Code Structure

```typescript
// src/mcp/logging.ts
export const mcpLogger = getLogger('mcp');
export const httpLogger = getLogger('mcp.http');
export const toolLogger = getLogger('mcp.tools');

// Middleware example
export function loggingMiddleware(req, res, next) {
  const start = Date.now();
  const requestId = generateRequestId();
  
  httpLogger.info('Request received', {
    method: req.method,
    path: req.path,
    requestId
  });
  
  res.on('finish', () => {
    httpLogger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      requestId
    });
  });
  
  next();
}
```

## Migration Checklist

### MCP Files to Update
- [ ] `server.ts` - main server setup
- [ ] `http-server.ts` - HTTP server variant
- [ ] `stdio-server.ts` - STDIO server variant
- [ ] `handlers.ts` - request handlers
- [ ] `core-server.ts` - core functionality

## Acceptance Criteria

- [ ] All MCP operations have structured logging
- [ ] Request/response cycles are fully logged
- [ ] Errors include proper context
- [ ] Performance data is captured
- [ ] No sensitive data in logs
- [ ] Correlation IDs enable tracing

## Dependencies
- Depends on: FEAT-MIGRATECLI-0518-3V (to ensure core logging works)
- Critical for debugging MCP issues

## Technical Notes
- Consider log volume in production
- Implement sampling for high-frequency operations
- Ensure request bodies are truncated appropriately
- Add configuration for sensitive data filtering

## Links to Context
- **Original Proposal**: TASK-FEATUREPROPOSAL-0518-CZ
- Feature: OpenTelemetry Logging Infrastructure for All Modules
