+++
id = "TASK-MCP-TEMPLATE-INFO"
title = "Enhance MCP Template Access"
status = "🟡 To Do"
type = "🌟 Feature"
priority = "▶️ Medium"
created_date = "2025-05-11"
updated_date = "2025-05-11"
assigned_to = ""
parent_task = ""
depends_on = [ ]
related_docs = [ "docs/mcp-sdk.md", "docs/mcp-tool-descriptions.md" ]
tags = [ "mcp", "templates", "documentation", "feature" ]
template_schema_doc = ".ruru/templates/toml-md/01_mdtm_feature.README.md"
phase = "release-v1"
+++

# Enhance MCP Template Access

## Description ✍️

*   **What is this feature?** Provide MCP clients with access to task template information through two complementary approaches:
    1. Basic template information in the `task_create` tool description
    2. A dedicated `template_list` method for comprehensive template details

*   **Why is it needed?** Currently, template information is only available through the CLI (`sc list-templates`), but MCP clients have no way to discover available templates. This makes it difficult for AI assistants and other clients to create tasks using appropriate templates, especially when templates vary by project.

*   **Scope:**
    - Update the `task_create` tool description to include basic template information
    - Add a new `template_list` MCP method for detailed template information
    - Ensure the template parameter works with the task creation process
    - Document both approaches for MCP clients

*   **Links:** Not applicable

## Acceptance Criteria ✅

*   - [ ] MCP tool description for `task_create` includes a list of available templates
*   - [ ] New `template_list` method returns comprehensive template details
*   - [ ] Templates can be used when creating tasks via the MCP interface
*   - [ ] Documentation explains both approaches for accessing template information
*   - [ ] Implementation correctly works in both standalone and Roo Commander modes

## Implementation Notes / Sub-Tasks 📝

*   - [ ] Identify how to modify MCP tool descriptions in `core-server.ts`
*   - [ ] Create a function to retrieve available templates from the core module
*   - [ ] Update the `task_create` tool description to include basic template info
*   - [ ] Implement the `template_list` method for detailed template information
*   - [ ] Update the task creation handler to support template-based creation
*   - [ ] Test both approaches with various templates
*   - [ ] Update MCP documentation to explain template usage

## Implementation Approach

The implementation will provide both quick reference and detailed template information:

### 1. Enhanced Tool Description for Quick Reference

Update the `task_create` tool registration in `core-server.ts`:

```typescript
import { listTemplates } from '../core/template-manager.js';

// Get available templates for quick reference
const templates = listTemplates();
const templateHelp = templates.map(t => `${t.id} - ${t.type}`).join(', ');

server.tool(
  "task_create",
  {
    id: z.string().optional(),
    title: z.string(),
    type: z.string(),
    status: z.string().optional(),
    priority: z.string().optional(),
    assignee: z.string().optional(),
    phase: z.string().optional(),
    template: z.string().optional(), // <-- Add template parameter
    // ... other parameters
  },
  async (params) => {
    // ... implementation (see below)
  },
  {
    description: `Create a new task. Available templates: ${templateHelp}. For detailed template information, use template_list.`
  }
)
```

### 2. Dedicated Template List Method for Detailed Information

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

Add tool registration in `core-server.ts`:

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

### 3. Update Task Creation to Support Templates

Update the task creation handler to support template-based creation:

```typescript
async (params) => {
  try {
    let task;

    if (params.template) {
      // Create from template
      task = await createTaskFromTemplate(params.template, {
        title: params.title,
        id: params.id,
        status: params.status,
        priority: params.priority,
        assignee: params.assignee,
        phase: params.phase,
        // ... other parameters
      });
    } else {
      // Create directly as before
      // ... existing implementation
    }

    return formatResponse(result);
  } catch (error) {
    return formatError(error);
  }
}
```

## Review Notes 👀 (For Reviewer)

*   This dual approach provides both quick access to basic template info and comprehensive details when needed
*   The basic info in the tool description helps with simple task creation
*   The dedicated method provides detailed information when templates are complex or nuanced
*   This fully encapsulates the template functionality in the MCP server, matching the CLI capabilities


