+++
id = "BUG-BUGFEATURECREATE-0520-FW"
title = "Bug: feature_create command returns undefined error"
type = "bug"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-20"
assigned_to = ""
phase = "release-v1.1"
tags = [ "AREA:core", "MCP" ]
+++

## Bug: feature_create command returns undefined error

When attempting to create a feature using the mcp__scopecraft-cmd__feature_create tool, an undefined error is returned.

### Steps to Reproduce
1. Call feature_create with required parameters
2. Observe error response

### Actual Behavior
The command returns: `Error calling tool feature_create: undefined`

### Expected Behavior
The command should successfully create a feature and return feature details.

### Failed Command Calls

**First attempt:**
```
mcp__scopecraft-cmd__feature_create
- name: "worktree-dashboard"
- title: "Worktree Dashboard"
- phase: "release-v1.1"
```

**Second attempt:**
```
mcp__scopecraft-cmd__feature_create
- name: "worktree-dashboard"
- title: "Worktree Dashboard for Tasks UI"
- phase: "release-v1.1"
- description: "A centralized monitoring interface for active git worktrees in the Tasks UI, enabling users to efficiently monitor and switch between parallel workspaces without excessive context switching."
```

Both attempts resulted in the same error: `Error calling tool feature_create: undefined`

### Environment Information
- Command was attempted with both minimal parameters and with additional parameters
- Task creation works correctly (tested and confirmed)

### Possible Causes
- MCP tool implementation might be missing error handling
- The feature_create function might have an issue with parameter validation
- There could be a problem with the underlying API endpoint

### Additional Notes
Creating a task works correctly but feature creation fails with a non-descriptive error.
