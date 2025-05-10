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
| `task.list` | List tasks with optional filtering |
| `task.get` | Get a specific task by ID |
| `task.create` | Create a new task |
| `task.update` | Update an existing task |
| `task.delete` | Delete a task |
| `task.next` | Find the next highest priority task |
| `phase.list` | List all phases |
| `phase.create` | Create a new phase |
| `workflow.current` | Get the current in-progress tasks |
| `workflow.markCompleteNext` | Mark a task as complete and get the next task |

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

## Further Resources

- [MCP SDK on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [TypeScript SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)