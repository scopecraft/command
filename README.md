# Scopecraft Command

A comprehensive toolset for managing Markdown-Driven Task Management (MDTM) files. This project provides both a Command Line Interface (CLI) and a Model Context Protocol (MCP) server for working with tasks directly.

**Key Features:**
* Works both with and without Roo Commander
* Supports the standardized MDTM format (with TOML/YAML frontmatter)
* Automatically detects project type and adapts accordingly
* Provides direct CRUD operations on task files without requiring LLM processing

## Architecture

The project is organized into three main components:

1. **Core** - Core task management functionality shared by both CLI and MCP server
2. **CLI** - Command-line interface for interacting with tasks
3. **MCP** - MCP-compatible server for integration with Roo Commander LLMs

The system supports the [MDTM directory structure](docs/mdtm-directory-structure.md), allowing you to organize tasks in feature-specific subdirectories:

## Installation

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Link for development (creates scopecraft-command/sc and scopecraft-command-mcp/sc-mcp commands)
bun link
```

## CLI Usage

The CLI provides a comprehensive set of commands for managing tasks:

```bash
# Basic commands
sc list                   # Short alias
scopecraft-command list   # Full command
sc get TASK-ID
sc create --title "New task" --type "🌟 Feature"
sc update TASK-ID --status "🔵 In Progress"
sc delete TASK-ID

# Status shortcuts
sc start TASK-ID     # Mark as In Progress
sc complete TASK-ID  # Mark as Done
sc block TASK-ID     # Mark as Blocked
sc review TASK-ID    # Mark as In Review
```

### Task Relationships

```bash
# Create a task with relationships
sc create \
  --title "Task with Relationships" \
  --type "🌟 Feature" \
  --phase "phase-1" \
  --parent "PARENT-TASK-ID" \
  --depends "DEPENDENCY-TASK-ID" \
  --previous "PREVIOUS-TASK-ID" \
  --next "NEXT-TASK-ID"
```

### MDTM Directory Structure

For detailed documentation, see [MDTM Directory Structure Support](docs/mdtm-directory-structure.md).

```bash
# Create a feature overview file
sc create \
  --id "_overview" \
  --title "Authentication Feature" \
  --type "🌟 Feature" \
  --phase "release-v1" \
  --subdirectory "FEATURE_Authentication"

# Create a task within a feature subdirectory
sc create \
  --title "Login Form UI" \
  --type "🌟 Feature" \
  --phase "release-v1" \
  --subdirectory "FEATURE_Authentication"

# List tasks in a specific subdirectory
sc list --phase "release-v1" --subdirectory "FEATURE_Authentication"

# List only overview files across all phases
sc list --overview

# Move a task to a different subdirectory
sc update TASK-ID --subdirectory "FEATURE_UserProfiles"
```

### Workflow Navigation

```bash
# Show tasks currently in progress
sc current-task

# Find the next task to work on
sc next-task

# Find the next task after completing a specific task
sc next-task TASK-ID

# Mark a task complete and show the next task
sc mark-complete-next TASK-ID
```

### Phase Management

```bash
# List all phases
sc phases

# Create a new phase
sc phase-create --id "phase-1" --name "Planning Phase" --description "Initial planning stage"
```

## MCP Server Usage

The MCP server provides an API that can be used by Roo Commander's LLM agents using the Model Context Protocol:

```bash
# Start the MCP server on the default port (3500)
sc-mcp                      # Short alias
scopecraft-command-mcp      # Full command

# Start on a custom port
sc-mcp --port 3501

# Start with the SDK implementation specifically (HTTP)
sc-mcp-sdk

# Start with the STDIO transport (useful for terminal-based operation)
sc-mcp-stdio
```

> **New:** The MCP server now uses the official MCP SDK with both StreamableHTTP and STDIO transport options. See [MCP SDK documentation](docs/mcp-sdk.md) for details.

### API Reference

The MCP server supports the following methods:

| Method | Description | Parameters |
|--------|-------------|------------|
| `task.list` | List all tasks | `status`, `type`, `assignee`, `tags`, `phase`, `subdirectory`, `is_overview`, `format` |
| `task.get` | Get a task by ID | `id`, `phase`, `subdirectory`, `format` |
| `task.create` | Create a new task | `id`, `title`, `type`, `status`, `priority`, `assignee`, `phase`, `subdirectory`, `parent`, `depends`, `previous`, `next`, `tags`, `content` |
| `task.update` | Update a task | `id`, `updates: { metadata, content }`, `phase`, `subdirectory` |
| `task.delete` | Delete a task | `id`, `phase`, `subdirectory` |
| `task.next` | Find the next task | `id`, `format` |
| `phase.list` | List all phases | `format` |
| `phase.create` | Create a new phase | `id`, `name`, `description`, `status`, `order` |
| `workflow.current` | Show tasks in progress | `format` |
| `workflow.markCompleteNext` | Complete task and find next | `id`, `format` |

### Example MCP Request

```json
{
  "method": "task.list",
  "params": {
    "status": "🔵 In Progress",
    "format": "json"
  }
}
```

### Example MCP Response

```json
{
  "success": true,
  "data": [
    {
      "metadata": {
        "id": "TASK-001",
        "title": "Task in progress",
        "status": "🔵 In Progress",
        "type": "🌟 Feature"
      },
      "content": "Task content here...",
      "filePath": "/path/to/task/file.md"
    }
  ],
  "message": "Listed 1 tasks"
}
```

## Development

### Running in Dev Mode

```bash
# Run CLI in dev mode
bun run dev:cli -- list

# Run MCP server in dev mode
bun run dev:mcp
```

### Code Quality Tools

The project uses Biome for linting and formatting, and TypeScript for type checking.

```bash
# Typecheck the code
bun run typecheck

# Lint the code with Biome
bun run lint

# Check code formatting with Biome
bun run format

# Format code with Biome (applies changes)
bun run format:fix

# Check (lint + format) the code with Biome
bun run check

# Run all checks and tests (CI workflow)
bun run ci
```

### Project Structure

```
src/
├── core/               # Shared core functionality
│   ├── types.ts        # Common type definitions
│   ├── task-parser.ts  # TOML+MD parsing utilities
│   ├── task-manager.ts # Core task operations
│   ├── formatters.ts   # Output formatting
│   └── index.ts        # Core module exports
├── cli/                # Command-line interface
│   ├── cli.ts          # CLI entry point
│   └── commands.ts     # CLI command handlers
└── mcp/                # MCP server
    ├── cli.ts          # MCP CLI entry point
    ├── handlers.ts     # MCP method handlers
    ├── server.ts       # HTTP server implementation
    └── types.ts        # MCP-specific types
```

## Integration Options

This project is designed to be versatile and can be used in different ways:

### Standalone Usage

You can use Scopecraft Command directly to manage MDTM task files in any project, whether or not you're using Roo Commander. The tool supports the standardized MDTM format with either TOML or YAML frontmatter.

### Integration with Roo Commander

Scopecraft Command complements Roo Commander's LLM-based task management by providing direct CRUD operations on task files. The MCP server allows Roo Commander's LLM agents to interact with tasks efficiently without having to generate and parse markdown themselves.

#### MCP Server Configuration in Roo Commander

To integrate with Roo Commander, you'll need to configure the MCP server in your Roo Commander settings. Please refer to the Roo Commander documentation for details on how to register and use an MCP server.

### Project Type Detection

The tool automatically detects whether it's being used in a Roo Commander project or a standalone project and adapts its behavior accordingly. This enables seamless operation in different environments without requiring special configuration.

## Credits and Attribution

Scopecraft Command implements the Markdown-Driven Task Management (MDTM) format, which was originally created and documented by the [Roo Commander](https://github.com/jezweb/roo-commander) project. We are grateful to the creators of Roo Commander for developing this standardized format for task management in markdown files with TOML/YAML frontmatter.

This project aims to be fully compatible with the MDTM format while providing additional tooling that can be used standalone or alongside Roo Commander.

## License

MIT