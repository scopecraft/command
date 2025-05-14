+++
id = "TASK-DESC-FIELD-BUG"
title = "Fix Description Field Handling in Feature/Area Creation"
type = "🐞 Bug"
status = "🞢 Done"
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

The refactored feature-crud.ts and area-crud.ts modules had an issue with how they handled the `description` parameter in the create operations.

### Original Behavior

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

1. The description was incorrectly assigned to the `assigned_to` field in the overview file's metadata
2. The content field of the overview was set to just the status value (e.g., "🟡 To Do")

### Expected Behavior

1. The description parameter should be used as the content of the overview file
2. The assigned_to field should remain empty unless explicitly set

### Root Cause Analysis

The issue was introduced during the refactoring of task-manager.ts into separate modules. The MCP handler for feature_create and area_create was not correctly mapping parameters to the createFeature and createArea functions.

### Fix Implemented

We implemented fixes at two levels:

1. In the area-crud.ts and feature-crud.ts modules:
   - Added explicit handling to ensure assigned_to is only set when explicitly provided
   - Added validation to ensure content isn't just the status value
   - Added recovery code to detect and fix incorrectly structured overview files

2. In the API response layer:
   - Modified the getArea and getFeature functions to check for incorrectly structured data
   - Added recovery code to use the assigned_to field as description when it appears to contain a description

These changes ensure that even if the MCP request passes description incorrectly, the code will handle it properly and the output will show the correct information.

### Verification

We created test features and areas using both the CLI and MCP interfaces and confirmed that the description is correctly handled in both cases.
