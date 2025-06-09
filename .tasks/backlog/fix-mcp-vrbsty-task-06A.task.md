# Fix MCP task_update verbosity - return minimal confirmation instead of full task

---
type: bug
status: done
area: mcp
tags:
  - performance
  - api
  - token-optimization
  - 'execution:autonomous'
priority: high
---


## Instruction
The MCP task_update handler currently returns the full task object after updates, consuming unnecessary tokens. This needs to be fixed to return a minimal confirmation response.

**Problem:**
- `handleTaskUpdate` in `src/mcp/handlers/write-handlers.ts` calls `createUpdateResponse`
- `createUpdateResponse` always passes `includeContent: true` to `transformTask`
- This returns the entire task content, sections, and metadata

**Solution:**
Modify the task_update handler to return a minimal response containing only:
- Task ID
- Success status  
- Summary of what was updated
- Timestamp

**Files to modify:**
- `src/mcp/handlers/write-handlers.ts` - Update response creation
- `src/mcp/schemas.ts` - Add minimal response schema
- Possibly `src/mcp/output-schemas.ts` - Update output schema

## Tasks

## Deliverable

## Log
- 2025-06-09: 2025-01-08 14:25: === AUTONOMOUS EXECUTION STARTED ===
  - Task: fix-mcp-vrbsty-task-06A
  - Analysis: type:bug in MCP area, performance/token-optimization tags
  - Selected Mode: Diagnosis Mode
  - Reasoning: Bug type task requires root cause analysis and fix
  - Loading: diagnosis mode for API performance issue
- 2025-06-09: 2025-01-08 14:27: Diagnosed issue - found root cause:
  - handleTaskUpdate in write-handlers.ts always returns full task
  - createUpdateResponse passes includeContent: true to transformTask
  - TaskUpdateOutputSchema expects full TaskSchema object
  - Need to create minimal response format
- 2025-06-09: 2025-01-08 14:30: Switching to implementation mode:
  - Analyzed createResponseSchema structure
  - Planning implementation approach:
    1. Create MinimalUpdateResponseSchema
    2. Modify createUpdateResponse to return minimal data
    3. Update TaskUpdateOutputSchema to use new schema
  - Goal: Return only id, updatedFields, timestamp
- 2025-06-09: 2025-01-08 14:35: Implementation complete:
  - Added MinimalUpdateResponseSchema to schemas.ts
  - Modified createUpdateResponse to return minimal data
  - Fixed return type in handleTaskUpdate
  - Fixed linting errors (unused parameters)
  - Response now only includes: id, updatedFields[], timestamp
- 2025-06-09: 2025-01-08 14:38: Writing deliverable and testing implementation
- 2025-06-09: 2025-01-08 14:40: === EXECUTION COMPLETE ===
  - Mode Used: Diagnosis → Implementation
  - Status: COMPLETED
  - Deliverable: READY
  - Questions: 0
  - Follow-up: None needed

## Implementation summary
Fixed the MCP task_update handler to return minimal response instead of full task object.

### Changes Made:

1. **schemas.ts** (lines 397-405):
   ```typescript
   // Minimal update response schema - for token efficiency
   export const MinimalUpdateResponseSchema = z.object({
     id: z.string(),
     updatedFields: z.array(z.string()).describe('List of fields that were updated'),
     timestamp: z.string().datetime(),
   });
   
   // task_update output schema
   export const TaskUpdateOutputSchema = createResponseSchema(MinimalUpdateResponseSchema);
   ```

2. **write-handlers.ts** (lines 348-385):
   - Modified `createUpdateResponse` function to:
     - Accept unused parameters with underscore prefix to satisfy linter
     - Extract list of updated fields from updateOptions
     - Return minimal response with only id, updatedFields[], and timestamp
   - Updated return type of `handleTaskUpdate` to match new response structure

### Response Format:

Before (verbose):
```json
{
  "success": true,
  "data": {
    "id": "task-123",
    "title": "Fix bug",
    "type": "bug",
    "status": "in_progress",
    "content": "...",
    "sections": { ... },
    // ... many more fields
  },
  "message": "Task task-123 updated successfully"
}
```

After (minimal):
```json
{
  "success": true,
  "data": {
    "id": "task-123",
    "updatedFields": ["status", "priority"],
    "timestamp": "2025-01-08T19:35:00.000Z"
  },
  "message": "Task task-123 updated successfully"
}
```

### Benefits:
- Significantly reduced token usage in AI conversations
- Faster response times
- Clear indication of what was actually updated
- Maintains backward compatibility with success/message structure
