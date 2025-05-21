+++
id = "FEAT-ADDCONTENT-0521-AC"
title = "Add Content and Completed Feature Filtering to feature_list MCP Tool"
type = "feature"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-21"
updated_date = "2025-05-21"
assigned_to = ""
phase = "backlog"
tags = [ "mcp", "feature-management", "performance" ]
+++

# Add Content and Completed Feature Filtering to feature_list MCP Tool

## Problem Description
The feature_list MCP tool currently returns all features with complete content and including completed features, which can exceed the token limit when there are many features. This causes the tool to fail with an error message: "MCP tool 'feature_list' response exceeds maximum allowed tokens (25000)."

## Current Behavior
- The FeatureFilterOptions interface in core/types.ts already has `include_content` and `include_completed` parameters
- The parameters are defined but not fully implemented in the CRUD layer:
  - `include_content`: The content is always included in features regardless of this parameter
  - `include_completed`: This is only passed to `listTasks` when fetching tasks, but features themselves are not filtered based on their completion status
- In contrast, the task_list MCP tool properly implements these filters with sane defaults:
  - `include_content` defaults to false, reducing response size
  - `include_completed` defaults to false, further reducing result set size

## Required Changes

### 1. MCP Layer
Add the missing parameters to the FeatureListParams interface in mcp/types.ts:
```typescript
export interface FeatureListParams {
  root_dir?: string;
  phase?: string;
  status?: string;
  format?: string;
  include_tasks?: boolean;
  include_progress?: boolean;
  include_content?: boolean; // Add this parameter (default: false)
  include_completed?: boolean; // Add this parameter (default: false)
}
```

Update the handleFeatureList function in mcp/handlers.ts to pass these parameters to the core function:
```typescript
export async function handleFeatureList(params: FeatureListParams) {
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await listFeatures({
    phase: params.phase,
    status: params.status,
    include_tasks: params.include_tasks,
    include_progress: params.include_progress !== false, // Default to true
    include_content: params.include_content, // Only include content when explicitly set to true
    include_completed: params.include_completed, // Only include completed features when explicitly set to true
    config,
  });
}
```

### 2. Core CRUD Layer
Update the listFeatures function in src/core/task-manager/feature-crud.ts to properly implement filtering:

1. For `include_content` (prevent including description if not requested):
```typescript
// Only include description if include_content is true
feature.description = options.include_content ? (overviewTask?.content || '') : '';

// Only include the overview task if include_content is true
if (overviewTask && options.include_content) {
  feature.overview = overviewTask;
}
```

2. For `include_completed` (filter out completed features):
```typescript
// Skip completed features if include_completed is false
if (!options.include_completed && 
    (feature.status.includes('Done') || 
     feature.status.includes('🟢') || 
     feature.status.includes('Completed') || 
     feature.status.includes('Complete'))) {
  continue; // Skip this feature
}
```

## Implementation Details
- Each parameter should have a clear default value (false for both)
- Changes are needed in both the MCP interface and the core CRUD implementation
- The listFeatures function needs to actually filter completed features based on status
- For content, we need to conditionally omit description and overview data

## Expected Outcome
- Response sizes will be significantly reduced by default
- Clients can still opt-in to receive full content when needed
- Token limit errors will be avoided for most use cases
- Consistent behavior between task_list and feature_list MCP tools

## Testing Plan
1. Verify default behavior (no content, no completed features)
2. Test with include_content=true (should include content)
3. Test with include_completed=true (should include completed features)
4. Test with both parameters enabled (full response)
5. Ensure there are no regressions in existing functionality

## Implementation Notes
- This change affects both the MCP interface and the core implementation
- The default behavior change might surprise existing consumers of the API
- Consider adding a deprecation warning if include_content isn't specified explicitly
- Be careful with the implementation to maintain backward compatibility
