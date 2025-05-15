+++
id = "TASK-MCP-ERROR-HANDLING"
title = "Enhance MCP Error Handling for Non-existent Resources"
type = "🐞 Bug"
status = "🔵 In Progress"
priority = "🔼 High"
created_date = "2025-05-11"
updated_date = "2025-05-15"
assigned_to = ""
phase = "release-v1.1"
subdirectory = "AREA_MCPBugFixes"
+++

## Description

Improve error handling in the MCP server for non-existent resources. Currently, when requesting operations on resources that don't exist (like getting a non-existent task), the MCP server is throwing actual error objects instead of returning properly formatted error responses.

## Issues Identified

During MCP testing, the following error handling issues were discovered:

1. When requesting a non-existent task, the server throws an actual error object rather than returning a formatted response object with error information
2. This causes Claude Code to display the error as "Error calling tool task_get: undefined" rather than showing the detailed error information
3. The raw error content is actually well-formed (showing `{"success": false, "error": "Task with ID XYZ not found"}`) but not being properly returned as a response

## Investigation Results

When testing with non-existent resource IDs:

- The server generates good error content: `{"success": false, "error": "Task with ID FAKE-TASK-ABC not found"}`
- However, this is thrown as an actual JavaScript error object rather than being returned as the response payload
- Claude Code shows: `Error calling tool task_get: undefined`
- The actual error content appears in server logs or error traces but not in the structured response

According to MCP best practices, tool errors should be reported within the result object, not as protocol-level errors. This allows the LLM to see and potentially handle the error appropriately.

## First Implementation Attempt

We implemented a solution to modify the `formatError` and `formatResponse` functions in `core-server.ts` to handle error cases more gracefully.

Specifically, we:

1. Modified `formatError` to detect "not found" errors and transform them to success responses with null data
2. Ensured all error responses include a message field for consistency
3. Made the formatting consistent between errors and success cases

```typescript
export function formatError(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  
  // Check if this is a "not found" type error, and transform it to a success response with null data
  if (errorMessage.includes('not found')) {
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({ 
          success: true, 
          data: null,
          message: errorMessage
        }, null, 2) 
      }]
    };
  }
  
  // Handle normal errors
  return {
    content: [{ 
      type: "text", 
      text: JSON.stringify({ 
        success: false, 
        error: errorMessage,
        message: `Error: ${errorMessage}`
      }, null, 2) 
    }],
    isError: true
  };
}
```

## Current Hypothesis

After testing, we've determined that the error handling improvements to `formatError` may not be sufficient. The errors are likely being thrown before they reach our error formatting function. Our current hypothesis is:

1. Errors are bubbling up from deeper layers before reaching our `formatError` function
2. The MCP SDK might be intercepting errors at a higher level than our handler
3. There may be places in the codebase where errors are thrown rather than returned as `OperationResult` objects

To fully solve this issue, we likely need to:

1. Ensure ALL operations are wrapped in try/catch blocks
2. Prevent any errors from bubbling up to the MCP SDK layer
3. Ensure error handling is consistent across all layers of the application

## Next Steps

- [ ] Investigate how errors are propagating through the MCP SDK
- [ ] Add additional error catching at the integration point between our handlers and the SDK
- [ ] Ensure all handler functions properly catch and format errors
- [ ] Test with various error conditions to ensure consistent behavior

## Acceptance Criteria

- Error responses for non-existent resources follow a consistent format
- Error messages clearly indicate the nature of the error (e.g., "Task with ID 'XYZ' not found")
- Error responses are returned as regular response objects, not thrown as errors
- Error handling is consistent across all MCP methods
- Claude Code properly displays the error details instead of showing "undefined"
- MCP server logs still capture the error information for debugging
- Documentation is updated to describe error handling behavior
