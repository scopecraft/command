# MCP Server SDK Implementation

This document describes the MCP (Model Context Protocol) server implementation using the official SDK.

## Overview

The MCP server provides a way for LLMs and other clients to interact with the Scopecraft Command task management system. The implementation has been updated to use the official `@modelcontextprotocol/sdk` package to ensure compliance with the latest MCP specification.

## Key Features

- Uses the official MCP SDK for server implementation
- Implements StreamableHTTP transport for modern HTTP connections
- Provides all CRUD operations for tasks and phases
- Supports workflow functionality for task management
- Built-in error handling and session management

## Available Methods

The following MCP tools are available:

### Task Management
- `task_list` - List tasks with powerful filtering capabilities
- `task_get` - Get complete task details including metadata and content
- `task_create` - Create new tasks with metadata and content
- `task_update` - Update existing task metadata or content
- `task_delete` - Permanently delete a task
- `task_next` - Find the next recommended task to work on
- `task_move` - Move tasks between features/areas or phases

### Workflow Management
- `workflow_current` - Get all tasks currently in progress
- `workflow_mark_complete_next` - Mark task complete and get next suggestion

### Phase Management
- `phase_list` - List all project phases
- `phase_create` - Create a new phase
- `phase_update` - Update phase properties
- `phase_delete` - Delete a phase

### Feature Management
- `feature_list` - List features with optional filtering
- `feature_get` - Get detailed feature information
- `feature_create` - Create a new feature directory
- `feature_update` - Update feature properties
- `feature_delete` - Delete a feature and its tasks

### Area Management
- `area_list` - List areas with optional filtering
- `area_get` - Get detailed area information
- `area_create` - Create a new area directory
- `area_update` - Update area properties
- `area_delete` - Delete an area and its tasks

### Template Management
- `template_list` - List available task templates

### Configuration Management
- `init_root` - Set project root directory for session
- `get_current_root` - Get current project root configuration
- `list_projects` - List all configured projects

### Debug Tools
- `debug_code_path` - Get diagnostic information about the MCP server

For detailed parameter information, see the tool descriptions exposed through the MCP interface.

## Running the MCP Server

### HTTP Transport (Default)

```bash
# Start the MCP server on the default port (3500)
bun run dev:mcp

# Start with a custom port
bun run dev:mcp -- --port 3600

# Start with the verbose flag
bun run dev:mcp -- --verbose
```

### STDIO Transport

```bash
# Start the MCP server with STDIO transport (useful for local testing)
bun run dev:mcp:stdio

# Start with the verbose flag
bun run dev:mcp:stdio -- --verbose
```

### Using the MCP Inspector

```bash
# Start the HTTP server and open the MCP Inspector
bun run mcp:debug:sdk

# Start the HTTP server and open the web inspector
bun run mcp:debug:sdk:web

# Use the MCP Inspector with STDIO transport
bun run mcp:debug:stdio
```

You can also run the STDIO server directly with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector bun run src/mcp/stdio-cli.ts
```

The MCP Inspector will spawn the server process and communicate with it via the STDIO transport.

## Technical Details

### Tool Documentation

All MCP tools are documented with comprehensive descriptions and field-level documentation using the current SDK patterns:

1. **Tool-level Documentation**:
   - `description` - Comprehensive explanation of what the tool does and when to use it
   - `annotations` - Metadata about the tool's behavior:
     - `title` - Human-readable name
     - `readOnlyHint` - Whether the tool changes system state
     - `destructiveHint` - Whether the tool performs destructive operations
     - `idempotentHint` - Whether multiple identical calls have the same effect

2. **Field-level Documentation**:
   - Use Zod's `.describe()` method to document individual parameters
   - Use `z.enum()` for fields with specific valid values
   - Dynamic enums can be generated at server initialization

#### Current Registration Pattern

```typescript
// Define raw Zod shapes (not z.object())
const taskListRawShape = {
  status: z.enum(['🟡 To Do', '🔵 In Progress', '🟢 Done'])
    .describe('Filter by task status')
    .optional(),
  type: z.string()
    .describe('Filter by task type (based on templates)')
    .optional(),
  assignee: z.string()
    .describe('Filter by assigned username')
    .optional(),
  // ... other parameters
};

// Create schema for type inference
const taskListSchema = z.object(taskListRawShape);

// Register tool with comprehensive documentation
server.registerTool(
  'task_list',
  {
    description: 'Lists tasks with powerful filtering capabilities. Use this to find specific tasks by status, type, phase, assignee, tags, or location.',
    inputSchema: taskListRawShape, // Pass raw shape, not z.object()
    annotations: {
      title: 'List Tasks',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  async (params: z.infer<typeof taskListSchema>) => {
    // Implementation...
  }
);
```

#### Schema Best Practices

1. **Use Common Enums** for consistent values across tools:
   ```typescript
   const taskStatusEnum = z.enum(['🟡 To Do', '🔵 In Progress', '🟢 Done', '⚪ Archived', '🔴 Blocked']);
   const taskPriorityEnum = z.enum(['🔼 High', '▶️ Medium', '🔽 Low']);
   ```

2. **Dynamic Enums** for template-based values:
   ```typescript
   const templates = listTemplates();
   const taskTypes = templates.map(t => t.description).filter(Boolean);
   const taskTypeEnum = z.enum(taskTypes as [string, ...string[]]);
   ```

3. **Field Descriptions** should include:
   - What the field does
   - Valid values or format
   - Examples where helpful
   - Default values if applicable

4. **Nested Objects** can also have descriptions:
   ```typescript
   updates: z.object({
     status: taskStatusEnum.describe('New task status').optional(),
     priority: taskPriorityEnum.describe('New priority level').optional(),
   }).describe('Fields to update (only specified fields are changed)')
   ```

These patterns provide crucial context for AI assistants, enabling them to:
- Discover available tools and their purposes
- Understand parameter requirements and valid values
- Get inline help for each parameter
- Make informed decisions about tool usage

### Transport Options

The MCP server supports two transport options:

#### StreamableHTTP Transport

The HTTP transport uses the StreamableHTTP implementation, which is the modern recommended approach for MCP servers when working with web clients. This transport supports:

- Session management with unique session IDs
- Server-to-client streaming (SSE-based)
- Proper request/response handling
- Event resumability using Last-Event-ID header

#### STDIO Transport

The STDIO transport provides a terminal-based interface for interacting with the MCP server. This is useful for:

- Local development and testing
- Command-line utilities and scripts
- CI/CD pipelines
- Environments where HTTP is not available or desired

### Error Handling

The SDK server implementation includes comprehensive error handling:

- Request validation using Zod schemas
- Consistent error response format
- Proper HTTP status codes
- Session validation and cleanup

### MCP Server Architecture

The MCP server architecture supports both HTTP and STDIO transports with a shared core implementation:

```
┌────────────────┐      ┌───────────────────┐      ┌─────────────────┐
│                │      │                   │      │                 │
│  Web Client    │◄────►│  StreamableHTTP   │◄────►│                 │
│  (LLM/Browser) │      │  Transport        │      │                 │
│                │      │                   │      │                 │
└────────────────┘      └───────────────────┘      │                 │
                                                   │  MCP Server     │
                                                   │  Core           │
┌────────────────┐      ┌───────────────────┐      │  Implementation │
│                │      │                   │      │                 │
│  Terminal      │◄────►│  STDIO            │◄────►│                 │
│  (CLI)         │      │  Transport        │      │                 │
│                │      │                   │      │                 │
└────────────────┘      └───────────────────┘      └────────┬────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │                 │
                                                   │  Task/Phase     │
                                                   │  Management     │
                                                   │                 │
                                                   └─────────────────┘
```

This architecture allows for maximum flexibility while maintaining a single source of truth for core server functionality.

## Migration from Custom Implementation

The MCP server implementation has been migrated from a custom HTTP server to the official SDK implementation. The key differences are:

1. **Transport Layer**: Now uses the SDK's StreamableHTTP transport instead of custom HTTP handling
2. **Method Registration**: Tools are registered via the SDK's tool API instead of the custom method registry
3. **Error Handling**: Uses the SDK's built-in error mechanisms
4. **Schema Validation**: Uses Zod schemas for input validation
5. **Tool Naming Convention**: Tool names now use underscores instead of dots (e.g., `task_list` instead of `task.list`) to comply with Claude Code's tool name pattern requirements

## Further Resources

- [MCP SDK on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [TypeScript SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)