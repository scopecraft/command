# Scopecraft Command - Development Documentation

## Project Overview

Scopecraft Command is a toolset designed to manipulate Markdown-Driven Task Management (MDTM) files. It provides both a command-line interface (CLI) and a Model Context Protocol (MCP) server for working with tasks directly.

The system is designed to work both with and without Roo Commander:
- **Standalone Mode**: Provides direct CRUD operations on MDTM task files without requiring LLM processing
- **Integration Mode**: Can be used as an MCP server by Roo Commander's LLM agents for more efficient task management

The tool automatically detects the project type and adapts its behavior accordingly, supporting the standardized MDTM format with either TOML or YAML frontmatter.

## Architecture

The project follows a modular architecture with three main components:

### 1. Core Module (`src/core/`)

The core module implements all the business logic for task management:

- **Types** (`types.ts`): Defines all data structures used throughout the application
- **Task Parser** (`task-parser.ts`): Handles parsing and formatting TOML+Markdown files
- **Task Manager** (`task-manager.ts`): Contains all CRUD operations for tasks and phases
- **Formatters** (`formatters.ts`): Formats task and phase data for various output formats

The core is designed to be completely standalone and reusable, with no dependencies on CLI or MCP-specific code.

### 2. CLI Module (`src/cli/`)

The CLI module provides a command-line interface to the core functionality:

- **CLI Entry Point** (`cli.ts`): Sets up commands and validates environment
- **Command Handlers** (`commands.ts`): Implements each CLI command by calling core functions

The CLI uses the Commander.js library to parse commands and options, following standard CLI design patterns.

### 3. MCP Module (`src/mcp/`)

The MCP module implements a server that follows the Model Context Protocol:

- **Types** (`types.ts`): Defines MCP-specific types like method names and request/response formats
- **Handlers** (`handlers.ts`): Implements MCP method handlers by calling core functions
- **Server** (`server.ts`): HTTP server that processes and routes MCP requests
- **CLI Entry Point** (`cli.ts`): Command-line interface for starting the MCP server

The MCP server is a simple HTTP server that accepts JSON requests, processes them using the core module, and returns JSON responses.

## Design Decisions

1. **Separation of Concerns**: Core logic is completely separate from interface concerns (CLI and MCP)
2. **Consistent Error Handling**: All functions return a standardized OperationResult<T> type
3. **Type Safety**: Extensive use of TypeScript types to prevent errors
4. **Task Relationships**: Support for complex relationships between tasks (parent-child, dependencies, workflow sequencing)
5. **Phase Management**: Support for organizing tasks into phases
6. **Workflow Navigation**: Tools to navigate through task workflows (next task, mark complete and move to next, etc.)

## Development History

### Version 0.1.0

The initial implementation was a single-file CLI tool built with Bun (`bun-cli.ts`) that provided basic CRUD operations on task files. It supported:

- Creating, reading, updating, and deleting tasks
- Filtering tasks by status, type, assignee, and tags
- Various output formats (table, JSON, minimal)
- Status change shortcuts (start, complete, block)

### Version 0.2.0

The second version, also built with Bun (`bun-cli-v2.ts`), added support for:

- Task phases
- Relationships between tasks (parent-child, dependencies, workflow sequence)
- Finding the next task to work on
- Showing tasks in progress
- Organizing tasks in a visual workflow
- Marking tasks complete and moving to the next task

### Version 0.3.0 (Current)

The current version completely restructured the codebase into a modular system built with Bun that includes:

- A shared core module for task management
- A CLI interface
- An MCP server
- Improved error handling and type safety
- Comprehensive documentation
- Full Bun-based build and development workflow

## Implementation Details

### Task File Format

Tasks are stored as Markdown files with TOML frontmatter:

```md
+++
id = "TASK-AUTH-001"
title = "Implement Authentication"
status = "🔵 In Progress"
type = "🌟 Feature"
priority = "🔼 High"
// ...other metadata
+++

## Description

Implementation details here...
```

### Phase Management

Phases are stored in two places:
1. As directories under `.ruru/tasks/` (e.g., `.ruru/tasks/phase-1/`)
2. As configuration in `.ruru/config/phases.toml` (created if it doesn't exist)

### Task Relationships

Tasks can have multiple types of relationships:

- **Parent-Child**: A parent task can have multiple child tasks (`parent_task` and `subtasks` fields)
- **Dependencies**: A task can depend on other tasks (`depends_on` field)
- **Workflow Sequence**: Tasks can be arranged in a sequence (`previous_task` and `next_task` fields)

When creating or updating relationships, the system updates all related tasks to maintain consistency.

## Future Development

The following features are planned or recommended for future development:

1. **Authentication and Authorization**: Add security to the MCP server
2. **Advanced Filtering**: Implement more complex filtering and search capabilities
3. **Batch Operations**: Add support for performing operations on multiple tasks at once
4. **Performance Optimization**: Optimize for large numbers of tasks
5. **UI Integration**: Develop web or IDE-based UIs for task management
6. **Testing**: Add comprehensive unit and integration tests
7. **Docker Support**: Create Docker images for easy deployment
8. **Documentation Generation**: Automatically generate API documentation

## Testing

The project includes test scripts for the different versions:

- `test-v2.sh`: Tests the single-file v2 CLI built with Bun
- `test-v3.sh`: Tests both the CLI and MCP server in the restructured system

Tests can be run using Bun's test runner with the command `bun test`.

## Credits and Attribution

This project implements the Markdown-Driven Task Management (MDTM) format, which was originally created and documented by the [Roo Commander](https://github.com/jezweb/roo-commander) project. We extend our thanks to the Roo Commander creators for developing this standardized approach to task management.

The MDTM format specifications and guidelines provided by Roo Commander have been instrumental in the development of this project, and we strive to maintain compatibility with the format while extending it with additional tooling and capabilities.

## License

This project is licensed under the MIT License.