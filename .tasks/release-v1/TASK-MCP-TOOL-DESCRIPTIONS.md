+++
id = "TASK-MCP-TOOL-DESCRIPTIONS"
title = "Add Descriptive Help Text to MCP Tools"
type = "🔄 Enhancement"
status = "🟢 Done"
priority = "🔼 High"
created_date = "2025-05-10"
updated_date = "2025-05-11"
assigned_to = "claude"
phase = "release-v1"
tags = [ "mcp", "documentation", "llm-integration" ]
parent_task = "TASK-20250510T140853"
+++

# Add Descriptive Help Text to MCP Tools

## Description ✍️

* **What is this enhancement?** Add comprehensive descriptions, parameter documentation, and usage examples to all MCP tools to improve discoverability and usability.
* **Why is it needed?** Currently, all MCP tools have empty descriptions, making them difficult to discover and use correctly, especially for LLMs like Claude.
* **Scope:** Update all MCP tool registrations to include proper descriptions, parameter documentation, and usage examples.

## Problem Analysis 🔍

When examining the MCP tools available in the project, we found that all tools have empty "Usage:" and "Description:" fields. This lack of documentation creates several problems:

1. **Poor discoverability**: Without descriptions, users (both human and AI) can't easily discover which tools are available and what they do.
2. **Unclear parameter requirements**: There's no indication of which parameters are required vs. optional or what their types should be.
3. **Lack of examples**: No usage examples to guide correct implementation.
4. **Inconsistent usage patterns**: Without clear documentation, users may use parameters inconsistently.

This issue directly impacts the quality of LLM integration with our MCP server, as even AI assistants like Claude struggle to use tools effectively without proper descriptions.

## Tasks ✅

- [x] Analyze the current MCP tool implementations to understand parameter requirements
- [x] Design a standard documentation template for MCP tools that includes:
  - Clear description of the tool's purpose
  - Required and optional parameters with types
  - Return value format
  - Usage examples
- [x] Update all task-related MCP tools:
  - task_list
  - task_get
  - task_create
  - task_update
  - task_delete
  - task_next
- [x] Update all phase-related MCP tools:
  - phase_list
  - phase_create
- [x] Update all workflow-related MCP tools:
  - workflow_current
  - workflow_mark_complete_next
- [x] Test integration with Claude Code to verify improved usability
- [x] Update MCP server implementation documentation

## Implementation Details 🛠️

The implementation should follow these guidelines:

1. **Consistent Format**: All tool descriptions should follow a consistent format.
2. **Comprehensive Content**: Each description should include:
   - One-line summary of what the tool does
   - Required parameters with types and descriptions
   - Optional parameters with types, descriptions, and default values
   - Return value format and examples
   - Common errors and troubleshooting tips
3. **Parameter Documentation**: Each parameter should include:
   - Type information (string, number, boolean, array, object)
   - Required vs. optional status
   - Default value (if any)
   - Description of purpose
   - Valid value ranges or formats (if applicable)
4. **Examples**: Include practical examples showing how to use the tool

## Code Example

Current MCP tool in TypeScript SDK (schematic):

```typescript
server.tool(
  "task_list",
  {
    status: z.string().optional(),
    phase: z.string().optional(),
    // other parameters...
  },
  async (params) => {
    // implementation...
  }
);
```

With improved description (conceptual):

```typescript
server.tool(
  "task_list",
  {
    description: "List tasks in the system with optional filtering",
    parameters: {
      status: {
        type: "string",
        required: false,
        description: "Filter tasks by status (e.g., '🟡 To Do', '🔵 In Progress')"
      },
      phase: {
        type: "string",
        required: false,
        description: "Filter tasks by phase name"
      },
      // other parameters with descriptions...
    },
    returns: "Array of task objects matching the filter criteria",
    examples: [
      "List all tasks: task_list",
      "List pending tasks: task_list with status='🟡 To Do'",
      // more examples...
    ]
  },
  {
    status: z.string().optional(),
    phase: z.string().optional(),
    // other parameters...
  },
  async (params) => {
    // implementation...
  }
);
```

## Acceptance Criteria ✅

- [x] All MCP tools have clear, comprehensive descriptions
- [x] All parameters are documented with types and descriptions
- [x] Required vs. optional parameters are clearly indicated
- [x] Return value format is documented
- [x] Claude Code can effectively discover and use the tools based on descriptions alone
- [x] Documentation is consistent across all tools

## Dependencies 🔄

- Depends on TASK-20250510T140853 "Configure MCP Integration for LLMs" as this is a subtask

## Testing Plan 🧪

- Manually verify each tool description for completeness
- Test with Claude Code to ensure tools can be discovered and used correctly
- Verify parameter validation works as documented

## Implementation Log 📝

- **2025-05-11**: Completed implementation of all MCP tool descriptions
  - Created comprehensive documentation in `docs/mcp-tool-descriptions.md` outlining the documentation structure and guidelines
  - Added detailed descriptions to all 10 MCP tools in `sdk-server.ts`
  - Implemented proper annotations (readOnlyHint, destructiveHint, idempotentHint) for each tool based on its behavior
  - Updated the MCP SDK documentation in `docs/mcp-sdk.md` to reflect the new tool descriptions
  - Verified that all MCP tools properly expose their descriptions to Claude through the MCP protocol
  - The implementation follows the official MCP annotations standard as documented at modelcontextprotocol.io
