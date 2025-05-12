+++
id = "TASK-MCP-WORKFLOW-METHODS"
title = "Implement Missing MCP Workflow Methods"
type = "🐞 Bug"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-11"
updated_date = "2025-05-12"
assigned_to = ""
phase = "release-v1"
subdirectory = "FEATURE_MCPIntegration"
+++

## Description

Implement or fix the missing workflow methods in the MCP server, particularly `workflow_mark_complete_next`. During testing, it was discovered that this method is either not fully implemented or has issues.

## Issues Identified

During MCP testing, the following issues were discovered with workflow methods:

1. The `workflow_mark_complete_next` method doesn't function correctly
2. When marking a task as complete and requesting the next task, the operation doesn't work as expected
3. The workflow operations may not be fully compatible with the MCP SDK format

## Steps to Reproduce

1. Create a series of related tasks with workflow relationships (previous/next)
2. Call `workflow_mark_complete_next` with a task ID
3. Observe that the operation doesn't properly mark the task as complete and/or doesn't return the correct next task

## Tasks

- [ ] Review implementation of `workflow_mark_complete_next` in `src/mcp/handlers.ts`
- [ ] Check if the method is properly using the core functionality
- [ ] Fix the implementation to properly mark tasks as complete
- [ ] Ensure the method correctly identifies and returns the next task
- [ ] Verify that the response format is compatible with the MCP SDK
- [ ] Add comprehensive tests for this method
- [ ] Check other workflow methods for similar issues

## Acceptance Criteria

- The `workflow_mark_complete_next` method correctly marks tasks as complete
- The method returns the appropriate next task based on task relationships
- The response format is consistent with other MCP methods
- All workflow methods function correctly when accessed through the MCP interface
- The functionality matches the equivalent CLI commands
