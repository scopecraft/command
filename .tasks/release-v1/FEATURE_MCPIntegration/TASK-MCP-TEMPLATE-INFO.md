+++
id = "TASK-MCP-TEMPLATE-INFO"
title = "Enhance MCP Template Access"
status = "🟢 Done"
type = "🌟 Feature"
priority = "▶️ Medium"
created_date = "2025-05-11"
updated_date = "2025-05-16"
assigned_to = ""
parent_task = ""
depends_on = [ ]
related_docs = [
  "docs/mcp-sdk.md",
  "docs/mcp-tool-descriptions.md",
  "docs/MCP_PROMPT_GUIDELINES.md"
]
tags = [ "mcp", "templates", "documentation", "feature" ]
template_schema_doc = ".ruru/templates/toml-md/01_mdtm_feature.README.md"
phase = "release-v1"
subdirectory = "FEATURE_MCPIntegration"
+++

# Enhance MCP Template Access

## Description ✍️

*   **What is this feature?** Provide MCP clients with access to task template information and standardized prompt guidance:
    1. Add a dedicated `template_list` method for comprehensive template details
    2. Implement standardized prompt patterns following the MCP_PROMPT_GUIDELINES.md

*   **Why is it needed?** Currently, template information is only available through the CLI (`sc list-templates`), but MCP clients have no way to discover available templates. Additionally, we need consistent prompt patterns for template usage to improve the user experience.

*   **Scope:**
    - Add a new `template_list` MCP method for detailed template information
    - Document template access for MCP clients
    - Add prompt patterns for template operations based on MCP_PROMPT_GUIDELINES.md

*   **Links:** Not applicable

## Acceptance Criteria ✅

*   - [x] New `template_list` method returns comprehensive template details
*   - [x] Documentation explains how to access and use templates via MCP
*   - [x] Template usage examples follow the MCP prompt guidelines for improved user experience
*   - [x] Implementation correctly works in both standalone and Roo Commander modes

## Implementation Notes / Sub-Tasks 📝

*   - [x] Implement the `template_list` method in the MCP server
*   - [x] Create helper functions to retrieve template details from the core module
*   - [x] Update MCP documentation to explain template usage
*   - [x] Create standard prompt patterns for template-based task creation (following MCP_PROMPT_GUIDELINES.md)

## Implementation Approach

### 1. Implement Template List Method

Add a new method in `types.ts`:

```typescript
export enum McpMethod {
  // Existing methods...
  
  // Template methods
  TEMPLATE_LIST = 'template_list'
}

// Template list request params
export interface TemplateListParams {
  format?: string;
}
```

Implement handler in `handlers.ts`:

```typescript
export async function handleTemplateList(params: TemplateListParams) {
  // Get detailed template information including descriptions
  return await listTemplatesWithDetails();
}

// Register in method registry
export const methodRegistry: McpMethodRegistry = {
  // Existing methods...
  [McpMethod.TEMPLATE_LIST]: handleTemplateList
}
```

Register the tool in `core-server.ts`:

```typescript
server.tool(
  "template_list",
  {
    format: z.string().optional()
  },
  async (params) => {
    try {
      const result = await listTemplatesWithDetails();
      return formatResponse(result);
    } catch (error) {
      return formatError(error);
    }
  },
  {
    description: "Get detailed information about available task templates, including descriptions and usage information."
  }
)
```

### 2. Standard Prompt Patterns for Templates

Create standard prompt patterns that follow the MCP_PROMPT_GUIDELINES.md:

```markdown
## Template Usage Prompts

### Template Discovery Pattern
```
I'll find available templates for your task.

*Calling template_list...*
✅ Available templates: feature, bug, documentation, chore, test

What type of task would you like to create?
```

### Template Selection Confirmation Pattern
```
I'll use the "feature" template for creating your task. This will include:
- Standard feature task metadata
- Checklist for implementation
- Areas for acceptance criteria

Does this sound right for your "Authentication System" task?
```

### Template-Based Creation Acknowledgment Pattern
```
📝 *Creating task from feature template...*
✅ Task "Authentication System" created with ID TASK-20250513T123456

The template has added standard sections for:
- Description
- Implementation checklist
- Acceptance criteria

Would you like me to customize any of these sections further?
```
```

## Review Notes 👀 (For Reviewer)

*   This implementation provides a standard way for MCP clients to access template information
*   The prompt patterns ensure a consistent and user-friendly experience when working with templates
*   This builds on our existing MCP tools implementation by adding template-specific methods and patterns
*   Follows the guidelines established in MCP_PROMPT_GUIDELINES.md for improved user experience

## Implementation Log 📊

**Date: 2025-05-16**

Completed implementation of the `template_list` MCP tool:

1. Added new `TEMPLATE_LIST` method to `McpMethod` enum in `types.ts`
2. Created `TemplateListParams` interface for the method parameters
3. Implemented the `handleTemplateList` function in `handlers.ts`
4. Registered the handler in the method registry
5. Added the tool registration in `core-server.ts`
6. Updated documentation:
   - Added template_list tool details in `mcp-tool-descriptions.md`
   - Added template usage prompt patterns in `MCP_PROMPT_GUIDELINES.md`

Verified the implementation works by directly calling the tool:
```
mcp__scopecraft-cmd__template_list
```

This yields a proper list of templates with descriptions, e.g.:
```json
{
  "success": true,
  "data": [
    {
      "id": "feature",
      "name": "feature",
      "path": "/.../01_mdtm_feature.md",
      "description": "🌟 Feature"
    },
    ...
  ],
  "message": "Found 6 templates"
}
```

The implementation leverages the existing `listTemplates()` function from the core module.
