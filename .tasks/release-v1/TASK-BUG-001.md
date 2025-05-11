+++
id = "TASK-BUG-001"
title = "Fix MCP server API tool name pattern error"
status = "🟢 Done"
type = "🐛 Bug"
priority = "🔼 High"
created_date = "2025-05-10"
updated_date = "2025-05-10"
resolved_by = "Claude"
assigned_to = ""
reporter = ""
related_docs = [ ]
tags = [ ]
template_schema_doc = ".ruru/templates/toml-md/02_mdtm_bug.README.md"
phase = "release-v1"
+++

# MCP Server API Error: Invalid Tool Name Pattern

## Description ✍️

*   **What is the problem?** The MCP server implementation is failing with an API error related to tool name pattern validation.
*   **Where does it occur?** When trying to use the MCP server functionality with Claude Code.
*   **Impact:** Users are unable to interact with the task system via Claude Code, breaking core functionality.

## Steps to Reproduce 🚶‍♀️

1.  Enable the MCP server integration in Claude Code
2.  Try to run a task-related command like listing tasks or `ls`
3.  Observe API Error with message about invalid tool name pattern

## Expected Behavior ✅

*   The MCP server should properly register tools with Claude Code and allow task operations.

## Actual Behavior ❌

*   API Error 400 is returned with message: `{"type":"error","error":{"type":"invalid_request_error","message":"tools.16.custom.name: String should match pattern '^[a-zA-Z0-9_-]{1,64}$'"}}`
*   The error indicates that one or more tool names in the MCP implementation don't match the required pattern.

## Environment Details 🖥️

*   **Browser/OS:** Claude Code in browser
*   **App Version/Commit:** Latest main branch

## Acceptance Criteria (Definition of Done) ✅

*   - [x] The bug described above is no longer reproducible.
*   - [x] The MCP tool names follow the pattern `^[a-zA-Z0-9_-]{1,64}$`.
*   - [x] Documentation is updated to reflect any changes required for Claude Code integration.

## Implementation Notes / Root Cause Analysis 📝

*   The error suggests there are custom tool method names in the MCP implementation that include invalid characters or don't match the required pattern.
*   The issue occurs because the MCP server is registering tools with method names that contain dots (e.g., `task.list`, `phase.create`, `workflow.markCompleteNext`), but Claude's tool naming pattern requires only alphanumeric characters, underscores, and hyphens (`^[a-zA-Z0-9_-]{1,64}$`).
*   This is visible in `src/mcp/sdk-server.ts` where tools are registered with names like `task.list` (line 78), `phase.list` (line 234), and `workflow.markCompleteNext` (line 307).
*   The fix simply requires renaming all tools to use compatible naming patterns (e.g., `task_list` instead of `task.list`). No backward compatibility is needed since the current implementation with dots never worked with Claude Code.

## Implementation Log 📋

*   Updated enum values in `src/mcp/types.ts` to use underscore-separated tool names that comply with Claude Code's pattern requirement
*   Modified tool registration in `src/mcp/sdk-server.ts` to use the new compliant tool names
*   Updated tool registration in `src/mcp/core-server.ts` to use the new compliant tool names
*   Updated console logging in `src/mcp/http-server.ts` to reflect the new tool names
*   Updated function comments in `src/mcp/handlers.ts` to document the new method names
*   Updated MCP documentation in `docs/mcp-sdk.md` to reflect the updated tool naming convention
*   Updated MCP examples in `CLAUDE.md` to use the new tool names

## Review Notes 👀 (For Reviewer)

*   The fix replaces all dot-separated method names (e.g., `task.list`) with underscore-separated names (e.g., `task_list`) to comply with Claude Code's tool name pattern requirements
*   All MCP SDK components and documentation have been updated to reflect the new naming convention
*   The internal method handler registry still uses the enum constants, so all method handlers continue to work without changes

## Key Learnings 💡

*   Claude Code requires tool names to match the pattern `^[a-zA-Z0-9_-]{1,64}$`, which prohibits dots in method names
*   When designing MCP tools for use with Claude Code, it's important to follow the proper naming conventions from the start
*   Using enums for method names makes it easier to update all references consistently across the codebase
