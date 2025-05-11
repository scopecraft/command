+++
id = "TASK-MCP-UPDATE-DOCS"
title = "Improve Task Update Documentation in MCP"
status = "🟡 To Do"
type = "📖 Documentation"
priority = "▶️ Medium"
created_date = "2025-05-11"
updated_date = "2025-05-11"
assigned_to = ""
parent_task = ""
depends_on = [ ]
related_docs = [ "docs/mcp-sdk.md", "docs/mcp-tool-descriptions.md" ]
tags = [ "mcp", "documentation", "task-update", "file-editing" ]
template_schema_doc = ".ruru/templates/toml-md/01_mdtm_feature.README.md"
phase = "release-v1"
+++

# Improve Task Update Documentation in MCP

## Description ✍️

*   **What is this feature?** Enhance the MCP documentation for task updating to clearly differentiate between two complementary approaches:
    1. Using the `task_update` method for quick metadata updates
    2. Using file editing tools for comprehensive content changes

*   **Why is it needed?** Currently, the MCP tool descriptions don't provide clear guidance on when to use the `task_update` method versus direct file editing. This leads to clients using inefficient approaches - either using `task_update` for large content changes (which is verbose and inefficient) or manually parsing and editing files for simple metadata updates (which is complex and error-prone).

*   **Scope:**
    - Update the `task_update` tool description to clarify its intended use for metadata updates
    - Add documentation explaining how to extract file paths from task responses for direct editing
    - Provide best practice guidance for MCP clients with code editing capabilities
    - Include examples showing both approaches in different scenarios

*   **Links:** N/A

## Acceptance Criteria ✅

*   - [ ] Updated `task_update` tool description clarifies its primary purpose for metadata updates
*   - [ ] Documentation explains how to extract file paths from `task_get` responses
*   - [ ] Documentation includes clear guidance for when to use each approach:
     - Metadata updates: Use `task_update`
     - Content changes: Use file editing tools
*   - [ ] Examples demonstrate both approaches in appropriate scenarios
*   - [ ] Documentation is added to relevant MCP documentation files

## Implementation Notes / Sub-Tasks 📝

*   - [ ] Review current `task_update` tool description in `core-server.ts`
*   - [ ] Update the description to emphasize metadata updates
*   - [ ] Ensure the `task_get` response includes the file path property
*   - [ ] Add examples in MCP documentation showing:
     - Using `task_update` for status/priority changes
     - Using file editing tools for content changes
*   - [ ] Review and update MCP SDK documentation
*   - [ ] Add a "Best Practices" section to the MCP documentation

## Implementation Approach

### 1. Update Task Update Tool Description

Modify the `task_update` tool description in `core-server.ts`:

```typescript
server.tool(
  "task_update",
  {
    id: z.string(),
    updates: z.object({
      metadata: z.record(z.any()).optional(),
      content: z.string().optional()
    }).optional()
  },
  async (params) => {
    // ... existing implementation
  },
  {
    description: `Update a task's metadata or content. Optimized for quick metadata updates (status, priority, etc.).
    For extensive content changes, consider using file editing tools with the file path from task_get responses.`
  }
)
```

### 2. Document File Path Extraction

Add a section to the MCP documentation explaining how to extract file paths from task responses:

```markdown
## Task File Editing

When making substantial changes to task content, it's often more efficient to edit the task file directly
rather than using the `task_update` method.

1. First, retrieve the task with the `task_get` method
2. Extract the file path from the response's `filePath` property
3. Use your preferred file editing tools to modify the file

Example:
```json
{
  "success": true,
  "data": {
    "metadata": { /* task metadata */ },
    "content": "Task content...",
    "filePath": "/path/to/tasks/phase/TASK-ID.md"  // ← Use this path for direct editing
  }
}
```

### 3. Best Practices Documentation

Add a "Best Practices" section to the MCP documentation:

```markdown
## Best Practices for Task Updates

Choose the appropriate update method based on your needs:

### Use `task_update` when:
- Making quick metadata changes (status, priority, assignee)
- Updating small amounts of content
- Working in environments without file editing capabilities
- Ensuring proper data validation

### Use direct file editing when:
- Making extensive content changes
- Performing complex formatting or structure changes
- Working in environments with file editing capabilities (like Claude Code)
- Needing to see the full context of the task during editing

For clients with file editing capabilities, the recommended workflow is:
1. Use `task_get` to retrieve the task and its file path
2. For metadata-only changes, use `task_update`
3. For content changes, edit the file directly using the file path
```

## Review Notes 👀 (For Reviewer)

*   This documentation enhancement will help MCP clients make more efficient choices
*   It clarifies the intended purpose of the `task_update` method while still acknowledging its full capabilities
*   The guidance will be particularly helpful for AI assistants and other code-capable clients
*   No actual code changes are needed beyond updating documentation and tool descriptions
