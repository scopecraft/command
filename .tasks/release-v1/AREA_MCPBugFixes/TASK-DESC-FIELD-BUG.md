+++
id = "TASK-DESC-FIELD-BUG"
title = "Fix Description Field Handling in Feature/Area Creation"
type = "🐞 Bug"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-14"
updated_date = "2025-05-14"
assigned_to = "Bug Fixer"
phase = "release-v1"
subdirectory = "AREA_MCPBugFixes"
tags = [
  "bug",
  "refactoring",
  "feature-crud",
  "area-crud",
  "description-field"
]
+++

## Bug: Description Field Handling in Feature/Area Creation

The refactored feature-crud.ts and area-crud.ts modules have an issue with how they handle the `description` parameter in the create operations.

### Current Behavior

When creating a feature or area with a description:
```
mcp__scopecraft-cmd__feature_create
{
  "name": "TestFeature",
  "title": "Test Feature",
  "phase": "release-v1",
  "description": "This is a test feature created for testing."
}
```

1. The description is incorrectly assigned to the `assigned_to` field in the overview file's metadata
2. The content field of the overview is set to just the status value (e.g., "🟡 To Do")

### Expected Behavior

1. The description parameter should be used as the content of the overview file
2. The assigned_to field should remain empty unless explicitly set

### Root Cause Analysis

The issue was likely introduced during the refactoring of task-manager.ts into separate modules. The feature-crud.ts and area-crud.ts modules are not properly handling the description parameter when creating the overview task.

### Steps to Reproduce

1. Use the feature_create MCP operation with a description parameter
2. Verify that the description appears in the assigned_to field of the overview metadata
3. Note that the content field contains only the status value

### Impact

This issue affects the creation of features and areas through both the MCP interface and potentially the CLI interface, resulting in incorrectly structured overview files.

### Proposed Fix

Review the code in:
1. src/core/task-manager/feature-crud.ts
2. src/core/task-manager/area-crud.ts

Specifically focus on the createFeature and createArea functions to ensure they correctly assign the description parameter to the content field of the overview task.
