+++
id = "BUG-FIXERROR-0521-V3"
title = "Fix Error Handling in feature_create MCP Tool"
type = "bug"
status = "🟢 Done"
priority = "▶️ Medium"
created_date = "2025-05-21"
updated_date = "2025-05-21"
assigned_to = ""
phase = "backlog"
tags = [ "bug", "mcp", "feature-management", "error-handling" ]
+++

# Fix Error Handling in feature_create MCP Tool

## Problem Description
The feature_create MCP tool returns an "undefined" error when called through Claude Code, even though the underlying implementation works correctly when the handler function is called directly. This issue prevents Claude Code from using the feature_create tool properly.

## Investigation Findings
After a deeper trace analysis, I've identified the root cause:

1. **Parameter Mismatch**: There's a critical mismatch between how the MCP server registers the tool and how the handler function works:

   - **MCP server registration** in `core-server.ts` (line ~550):
     ```javascript
     const result = await createFeature(
       params.name,
       params.title,
       params.phase,
       params.type || '🌟 Feature',
       params.description,
       params.assignee,
       params.tags
     );
     ```

   - **Handler function** in `handlers.ts` (line ~418):
     ```javascript
     return await createFeature(
       params.name,
       {
         title: params.title,
         phase: params.phase,
         type: params.type || '🌟 Feature',
         description: params.description,
         assignee: params.assignee,
         tags: params.tags,
         config, // Pass runtime config with tasksDir
       }
     );
     ```

   - **Core function** in `feature-crud.ts` (line ~299):
     ```javascript
     export async function createFeature(
       name: string,
       options: {
         title: string;
         phase: string;
         type?: string;
         description?: string;
         assignee?: string;
         tags?: string[];
         config?: RuntimeConfig;
       }
     ): Promise<OperationResult<Feature>> {
     ```

2. The server is calling `createFeature` with positional parameters, but the actual function expects the second parameter to be an options object. This results in the "undefined" error during object property access.

3. The MCP server's implementation includes proper error handling with `try/catch` and `formatError`, but the mismatch in parameter structure prevents it from working correctly.

## Proposed Solution
Two options to fix this issue:

### Option 1: Update the MCP server registration
Update the tool registration in `core-server.ts` to match the current handler and core function signatures:

```javascript
const result = await createFeature(
  params.name,
  {
    title: params.title,
    phase: params.phase,
    type: params.type || '🌟 Feature',
    description: params.description,
    assignee: params.assignee,
    tags: params.tags
    // No need for config in this context
  }
);
```

### Option 2: Update the handler function
Alternatively, add a try/catch block to the handler function in `handlers.ts` to catch errors from the core function:

```typescript
export async function handleFeatureCreate(params: FeatureCreateParams) {
  console.log(
    `[DEBUG] Feature Create: description=${params.description}, assignee=${params.assignee}`
  );
  
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  try {
    return await createFeature(
      params.name,
      {
        title: params.title,
        phase: params.phase,
        type: params.type || '🌟 Feature',
        description: params.description,
        assignee: params.assignee,
        tags: params.tags,
        config, // Pass runtime config with tasksDir
      }
    );
  } catch (error) {
    return {
      success: false,
      error: `Error creating feature: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
```

**Recommendation**: Implement Option 1 as the primary fix, as it addresses the root cause of the parameter mismatch. Option 2 can be added as an additional improvement for more robust error handling.

## Investigation Materials
- See scripts/test-feature-create.js for general error testing
- See scripts/test-mcp-feature-create.js for specific MCP handler testing
- Relevant files:
  - src/mcp/core-server.ts (line ~550)
  - src/mcp/handlers.ts (line ~418)
  - src/core/task-manager/feature-crud.ts (line ~299)

## Related Issues
- The feature_list tool has a separate issue with token limits that is being addressed in FEAT-ADDCONTENT-0521-AC
