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

The following MCP tools (methods) are available:

| Tool Name | Description |
|-----------|-------------|
| `task_list` | List tasks in the system with optional filtering based on status, type, assignee, tags, or phase. Returns an array of tasks matching the specified criteria. Results are sorted by priority by default. |
| `task_get` | Get detailed information about a specific task by its ID. Returns the complete task object including both metadata and content. |
| `task_create` | Create a new task with the specified properties. Required fields are title and type. Other fields are optional with sensible defaults. Returns the created task object. |
| `task_update` | Update a task's metadata or content. Requires the task ID and an updates object with metadata and/or content changes. Returns the updated task object. |
| `task_delete` | Delete a task by its ID. This operation permanently removes the task file from the system. Returns a success status. |
| `task_next` | Find the next task to work on based on priority and dependencies. If an ID is provided, finds the next task after the specified one. Returns the next highest priority task that's ready to be started. |
| `phase_list` | List all phases in the system. Phases represent logical groupings of tasks such as releases, milestones, or sprints. Returns an array of phase objects. |
| `phase_create` | Create a new phase with the specified properties. Required fields are id and name. A phase represents a logical grouping of tasks such as a release, milestone, or sprint. Returns the created phase object. |
| `workflow_current` | Get all tasks that are currently in progress (tasks with status '🔵 In Progress'). Returns an array of tasks that are actively being worked on. |
| `workflow_mark_complete_next` | Mark a task as complete and find the next task to work on. Requires the ID of the task to mark as complete. Updates the task's status to '🟢 Done' and returns both the updated task and the next suggested task. |

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

All MCP tools are now documented with comprehensive descriptions and annotations that help AI assistants and other clients understand how to use them. Each tool includes:

1. **Description** - A clear, concise explanation of what the tool does
2. **Annotations** - Metadata about the tool's behavior:
   - `title` - Human-readable name
   - `readOnlyHint` - Whether the tool changes system state
   - `destructiveHint` - Whether the tool performs destructive operations
   - `idempotentHint` - Whether multiple identical calls have the same effect

Example tool registration with documentation:

```typescript
server.tool(
  "task_list",
  {
    status: z.string().optional(),
    type: z.string().optional(),
    // Other parameters...
  },
  async (params) => {
    // Implementation...
  },
  {
    description: "List tasks in the system with optional filtering based on status, type, assignee, tags, or phase.",
    annotations: {
      title: "List Tasks",
      readOnlyHint: true,
      idempotentHint: true
    }
  }
);
```

These descriptions and annotations provide crucial context for AI assistants like Claude, enabling them to:
- Discover available tools
- Understand which parameters are required vs. optional
- Know what kind of data to expect in responses
- Make informed decisions about when to use each tool

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