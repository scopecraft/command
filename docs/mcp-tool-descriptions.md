# MCP Tool Descriptions Guide

This document provides guidelines for implementing descriptive help text for MCP tools in the Scopecraft Command project, as part of the TASK-MCP-TOOL-DESCRIPTIONS enhancement.

## Purpose

Adding comprehensive descriptions to MCP tools serves several critical purposes:
- Improves discoverability for users and AI assistants
- Clarifies required and optional parameters
- Provides usage examples
- Ensures consistent usage patterns

## Documentation Structure

Each MCP tool should include the following documentation components:

### 1. Core Description
- A clear, one-line summary of what the tool does
- Should be concise yet descriptive

### 2. Parameter Documentation
For each parameter, include:
- Description of the parameter's purpose
- Whether it's required or optional
- Default value (if applicable)
- Valid value formats or ranges

### 3. Return Value Documentation
- Format of the returned data
- Key fields in the response

### 4. Usage Examples
- Practical examples showing how to use the tool
- Examples for common use cases
- Examples for both basic and advanced usage

### 5. Additional Notes
- Common errors and troubleshooting tips
- Important caveats or limitations
- Related tools or alternative approaches

## Implementation Guidelines

When implementing tool descriptions in the SDK server:

1. Use the official MCP annotations standard
2. Provide comprehensive descriptions for all parameters
3. Include clear examples
4. Indicate read-only vs. state-modifying tools appropriately

## Standard Tool Description Template

Here's a template for documenting each MCP tool:

```typescript
server.tool(
  "tool_name",
  {
    // Parameter definitions with zod validation
    param1: z.string().optional(),
    param2: z.number(),
    // ...more parameters
  },
  async (params) => {
    // Implementation...
  },
  {
    description: "Brief description of what the tool does",
    annotations: {
      title: "Human-Readable Tool Name",
      readOnlyHint: true, // Set to false for state-modifying operations
      destructiveHint: false, // Set to true if can destroy/delete data
      idempotentHint: true, // Set to true if repeated calls don't change result
      openWorldHint: false // Set to true if interacts with external systems
    }
  }
);
```

## Example Implementations

Below are examples of well-documented MCP tools:

### Example 1: task_list Tool

```typescript
server.tool(
  "task_list",
  {
    status: z.string().optional(),
    type: z.string().optional(),
    assignee: z.string().optional(),
    tags: z.array(z.string()).optional(),
    phase: z.string().optional(),
    format: z.string().optional()
  },
  async (params) => {
    // Implementation...
  },
  {
    description: "List tasks in the system with optional filtering",
    annotations: {
      title: "List Tasks",
      readOnlyHint: true,
      idempotentHint: true
    }
  }
);
```

### Example 2: task_update Tool

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
    // Implementation...
  },
  {
    description: "Update a task's metadata or content by ID",
    annotations: {
      title: "Update Task",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false
    }
  }
);
```

## Implementation Checklist

When implementing descriptions for each tool, ensure:

- [ ] All tools have a clear description
- [ ] All parameters are documented properly
- [ ] Return value format is documented
- [ ] Appropriate examples are provided
- [ ] Annotations reflect actual tool behavior
- [ ] Description is concise but comprehensive
- [ ] Consistent style across all tools

## Testing

After implementation, test with Claude Code to verify:
- Tool discoverability has improved
- AI can correctly identify required and optional parameters
- AI can use the tools correctly based on descriptions alone

## Related Documentation

- [MCP SDK Documentation](https://modelcontextprotocol.io/docs/concepts/tools)
- [MDTM Standard](./specs/mdtm_standard.md)
- [MDTM Workflow](./specs/mdtm_workflow-init.md)