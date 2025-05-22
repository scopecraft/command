# Scopecraft Command - Development Documentation

This guide is for developers contributing to Scopecraft Command. For user documentation, see the main README.

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
- Biome for linting and formatting
- TypeScript strict type checking

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

## Testing and Code Quality

### Testing

The project includes test scripts for the different versions:

- `test-v2.sh`: Tests the single-file v2 CLI built with Bun
- `test-v3.sh`: Tests both the CLI and MCP server in the restructured system

Tests can be run using Bun's test runner with the command `bun test`.

### Code Quality Tools

The project uses several tools to ensure code quality:

1. **Biome** - For linting and formatting
   - `bun run lint`: Run linting checks
   - `bun run format`: Check code formatting without making changes
   - `bun run format:fix`: Format code and apply changes
   - `bun run check`: Run both linting and formatting checks

2. **TypeScript** - For type checking
   - `bun run typecheck`: Run TypeScript type checks

3. **Continuous Integration**
   - `bun run ci`: Run all checks and tests (typecheck, lint, test)

The configuration for Biome is in `biome.json` in the project root.

## Development Setup

### Prerequisites

- Node.js 16+ or Bun 1.0+
- Git for version control
- TypeScript knowledge

### Getting Started

```bash
# Clone repository
git clone https://github.com/scopecraft-ai/scopecraft-command.git
cd scopecraft-command

# Install dependencies
bun install

# Run development mode
bun run dev:cli -- list
bun run dev:mcp
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test task-parser.test.ts

# Watch mode
bun test --watch
```

## Code Quality

The project uses Biome for linting and formatting, and TypeScript for type checking.

### Available Commands

```bash
# Run quality checks (auto-detects staged/changed files)
bun run code-check

# Check all files
bun run code-check --all

# Check specific files
bun run code-check --staged   # Only staged files
bun run code-check --changed  # Only changed files

# Individual tools
bun run typecheck               # TypeScript only
bun run check                   # Biome only

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

### Before Committing

Always run code quality checks before committing:

```bash
bun run code-check
```

This command will:
1. Auto-detect whether to check staged or changed files
2. Run Biome on the appropriate files
3. Run TypeScript check on the full project
4. Report results in a clear format

## Project Structure

```
src/
├── core/                  # Shared core functionality
│   ├── types.ts           # Common type definitions
│   ├── task-parser.ts     # TOML+MD parsing utilities
│   ├── task-manager/      # Modular task operations
│   │   ├── index.ts       # Re-exports from all modules
│   │   ├── directory-utils.ts  # Directory operations
│   │   ├── task-crud.ts   # Basic task CRUD operations
│   │   ├── task-relationships.ts # Relationship management
│   │   ├── task-workflow.ts # Next task finder and workflow
│   │   ├── phase-crud.ts  # Phase management
│   │   ├── feature-crud.ts # Feature operations
│   │   ├── area-crud.ts   # Area operations
│   │   ├── task-move.ts   # Task movement operations
│   │   └── utils.ts       # Shared utilities
│   ├── formatters.ts      # Output formatting
│   └── index.ts           # Core module exports
├── cli/                   # Command-line interface
│   ├── cli.ts             # CLI entry point
│   ├── commands.ts        # CLI command handlers
│   └── entity-commands.ts # Entity-command pattern implementation
└── mcp/                   # MCP server
    ├── cli.ts             # MCP CLI entry point
    ├── handlers.ts        # MCP method handlers
    ├── server.ts          # HTTP server implementation
    └── types.ts           # MCP-specific types
```

### Module Architecture

The project follows a modular architecture:

1. **Core Module**: All business logic, completely standalone
2. **CLI Module**: Command-line interface using Commander.js
3. **MCP Module**: Server implementing Model Context Protocol

Each module has clear boundaries and responsibilities. The core module has no dependencies on CLI or MCP code.

## Entity-Command Pattern

The CLI follows an intuitive entity-command pattern:

```
<entity> <command> [options]
```

Entity types:
- `task` - Task management operations
- `phase` - Phase management operations
- `feature` - Feature directory operations
- `area` - Area directory operations
- `workflow` - Task workflow and sequence operations
- `template` - Template management operations

Implementation in `entity-commands.ts` provides:
- Automatic command grouping
- Consistent error handling
- Shared options across commands
- Backward compatibility with legacy format

## Building and Publishing

### Build Process

```bash
# Clean build
bun run clean
bun run build

# Watch mode
bun run build:watch
```

### Testing Locally

```bash
# Install globally from local build
bun run install:global

# Test CLI
sc task list

# Test MCP server
scopecraft-mcp
```

### AI-Assisted Release Process

The project includes an automated release system that combines mechanical tasks with AI-assisted content generation using Claude. The release script provides a structured workflow for creating releases.

#### Release Commands

```bash
# Using npm scripts (recommended)
bun run precheck                    # Pre-flight checks
bun run release:analyze [version]   # Analyze changes
bun run release:execute             # Execute release  
bun run release:publish             # Publish release
bun run release:full [version]      # Complete workflow
bun run release:dry                 # Dry-run full workflow

# Direct script calls (with more options)
bun scripts/release.ts precheck
bun scripts/release.ts analyze [version] [--verbose]
bun scripts/release.ts execute [--dry-run] [--skip-build]
bun scripts/release.ts publish [--otp <code>]
bun scripts/release.ts full [version] [--dry-run] [--otp <code>] [--verbose]
```

#### Recommended Workflow

1. **Pre-flight Checks**: Always run first to ensure code quality
   ```bash
   bun run precheck
   ```
   This runs:
   - Code quality checks (linting, formatting, TypeScript)
   - Security checks
   - Unit tests

2. **Clean Git State**: Ensure working directory is clean
   ```bash
   git status  # Should show no changes
   ```

3. **Analyze Release**: Let Claude analyze changes and create release plan
   ```bash
   bun run release:analyze
   # Or specify version: bun run release:analyze 1.2.3
   ```
   This creates:
   - `.release/version.json` - Version bump analysis
   - `.release/changelog.md` - Generated changelog entry
   - `.release/metadata.json` - Release metadata

4. **Review Analysis**: Check the generated files before proceeding
   ```bash
   cat .release/version.json
   cat .release/changelog.md
   ```

5. **Execute Release**: Build and create git release
   ```bash
   bun run release:execute
   # Or dry-run first: bun run release:dry
   ```
   This:
   - Updates `package.json` version
   - Updates `CHANGELOG.md` with new entry
   - Builds and validates the project
   - Creates git commit and tag

6. **Publish**: Push and publish to registries
   ```bash
   bun run release:publish --otp <your-2fa-code>
   ```
   This:
   - Pushes to GitHub with tags
   - Creates GitHub release
   - Publishes to npm with 2FA support

#### Version Detection

The system automatically analyzes git history to determine the appropriate version bump:

- **Patch**: Bug fixes, small improvements
- **Minor**: New features, backward-compatible changes  
- **Major**: Breaking changes, major rewrites

You can override by specifying a version: `analyze 1.2.3`

#### Resuming Failed Releases

If a release fails partway through, you can resume from any step:

```bash
# If analysis completed but execution failed
bun run release:execute

# If execution completed but publish failed  
bun run release:publish --otp <code>
```

The script gracefully handles already-completed steps.

#### Troubleshooting

- **Git not clean**: Commit or stash changes before releasing
- **npm OTP required**: Always use `--otp <code>` for 2FA-enabled accounts
- **GitHub release exists**: The script will warn but continue (this is normal for retries)
- **Build failures**: Run `bun run precheck` first to catch issues early

### Manual Publishing (Legacy)

If you need to publish manually without the AI-assisted process:

```bash
# Update version
bun run version:patch  # or minor/major

# Build and publish
bun run build
npm publish --otp <code>
```

## Task Worktree Management

The project includes specialized scripts for managing task-specific Git worktrees, allowing you to work on multiple tasks in isolation.

### Commands

- `bun run tw-start [taskId]` - Create a worktree for a task and set it to "In Progress"
- `bun run tw-finish [taskId]` - Complete a task, merge changes, and clean up the worktree
- `bun run tw-list` - List all active task worktrees

### Fish Shell Integration

For fish shell users, there's a special integration that allows the `tw-start` command to change your terminal's directory to the new worktree:

1. Install the fish function:
   ```bash
   bun scripts/setup-fish-integration.sh
   ```

2. Use the function:
   ```fish
   tw-start TASK-20241231T123456
   # Your terminal will automatically cd to the worktree directory
   ```

The integration works by having the bun script output the worktree path, which the fish function captures and uses with `cd`.

## Contributing Guidelines

1. **Code Style**: Run `bun run format:fix` before committing
2. **Type Safety**: Ensure no TypeScript errors with `bun run typecheck`
3. **Testing**: Add tests for new features
4. **Documentation**: Update docs for API changes
5. **Commit Messages**: Follow conventional commits format

## Credits and Attribution

This project implements the Markdown-Driven Task Management (MDTM) format, which was originally created and documented by the [Roo Commander](https://github.com/jezweb/roo-commander) project. We extend our thanks to the Roo Commander creators for developing this standardized approach to task management.

The MDTM format specifications and guidelines provided by Roo Commander have been instrumental in the development of this project, and we strive to maintain compatibility with the format while extending it with additional tooling and capabilities.

## License

This project is licensed under the MIT License.