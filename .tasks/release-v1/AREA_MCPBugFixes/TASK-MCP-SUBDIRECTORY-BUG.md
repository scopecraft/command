+++
id = "TASK-MCP-SUBDIRECTORY-BUG"
title = "Fix Subdirectory Handling in MCP SDK Implementation"
type = "🐞 Bug"
status = "🟢 Done"
priority = "🔼 High"
created_date = "2025-05-11"
updated_date = "2025-05-11"
assigned_to = ""
phase = "release-v1"
tags = ["mcp", "bug", "subdirectory"]
+++

# Fix Subdirectory Handling in MCP SDK Implementation

## Description ✍️

**What is the problem?** The MCP SDK implementation (`core-server.ts`) was not correctly handling the `subdirectory` parameter when creating tasks. This caused tasks to be created in the phase directory instead of the specified subdirectory.

**Where does it occur?** When creating tasks using the MCP server with a `subdirectory` parameter specified.

**Impact:** Tasks are created in the wrong location, breaking directory structure and organization.

## Steps to Reproduce 👣

1. Create a subdirectory within a phase (e.g., `FEATURE_MCPIntegration` in `release-v1`)
2. Use the MCP interface to create a task with the `subdirectory` parameter set
3. Observe that the task is created in the phase directory, not in the subdirectory

## Expected Behavior ✅

- Tasks should be created in the specified subdirectory
- File paths in responses should include the subdirectory

## Actual Behavior ❌

- Tasks are created in the phase directory, ignoring the subdirectory parameter
- File paths in responses don't include the subdirectory

## Environment Details 🖥️

- Node.js/Bun version: Latest
- MDTM/Scopecraft Command version: 0.2.0

## Root Cause Analysis 🔍

Three issues were identified in the MCP SDK implementation (`core-server.ts`):

1. The `subdirectory` parameter was missing from the parameter schema for the `task_create` tool
2. The code did not add the `subdirectory` to the task metadata
3. The `createTask` function was called without passing the `subdirectory` parameter

The standard MCP implementation (`handlers.ts`) correctly handled subdirectories, but the SDK implementation (`core-server.ts`) did not, leading to inconsistent behavior.

## Fix Implemented 🛠️

1. Added the `subdirectory` parameter to the schema in `core-server.ts`:
```typescript
{
  // ... other parameters
  subdirectory: z.string().optional(),
  // ... other parameters
}
```

2. Added code to set the subdirectory in metadata:
```typescript
if (params.subdirectory) metadata.subdirectory = params.subdirectory;
```

3. Updated the `createTask` call to pass the subdirectory parameter:
```typescript
const result = await createTask(task, params.subdirectory);
```

## Verification Steps ✅

- Created tasks with subdirectory specified
- Verified tasks are created in the correct location
- Tested both CLI and MCP interfaces to ensure consistent behavior

## Additional Notes 📝

The server needs to be restarted after applying these changes for them to take effect. This is a standard requirement for any server code changes, but should be noted for testing.

## Lessons Learned 📚

- Ensure all interfaces (CLI, MCP handlers, MCP SDK) maintain feature parity
- When implementing multiple interfaces for the same functionality, consider using shared implementation code to avoid divergence
- Add specific unit tests for parameter handling in different interfaces