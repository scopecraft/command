# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scopecraft Command is a toolset for managing Markdown-Driven Task Management (MDTM) files with TOML or YAML frontmatter. It provides both a Command Line Interface (CLI) and a Model Context Protocol (MCP) server, both developed within this project.

The system is designed to be versatile:
- Works both with and without Roo Commander
- Automatically detects project type and adapts accordingly
- Supports the standardized MDTM format
- Provides direct CRUD operations without requiring LLM processing
- Offers the same core functionality through both CLI and MCP interfaces

## Using MCP Tools in Claude Code

**IMPORTANT: When working in Claude Code, always use MCP tools directly instead of CLI commands.**

When working in Claude Code:

- **PREFER MCP TOOLS**: Always use the MCP tools directly (e.g., `mcp__scopecraft-cmd__task_list`, `mcp__scopecraft-cmd__task_create`) for task operations
- **WHEN TO USE CLI**: Only use CLI commands through Bash for debugging or when specifically requested by the user
- **ERROR HANDLING**: If an MCP tool fails, report the error clearly and don't automatically fall back to CLI

## Local Package Publishing Workflow

After making changes to the codebase and merging to main, follow this workflow to update the local package:

1. Build and package the project:
   ```bash
   npm run publish:local
   ```
   This creates a tarball in ~/MCP/scopecraft/

2. Install the package globally:
   ```bash
   npm run install:local
   ```
   This installs the package globally and verifies CLI commands

3. Verify MCP integration:
   - Claude Code should automatically detect the `scopecraft-cmd` MCP server
   - MCP tools should be accessed using the updated prefix: `mcp__scopecraft-cmd__task_list`

### MCP Tool Examples

```
// List tasks (content and completed tasks excluded by default to reduce token usage)
mcp__scopecraft-command-mcp__task_list

// List tasks in a specific phase
mcp__scopecraft-command-mcp__task_list { "phase": "release-v1" }

// List tasks with full content included (uses more tokens)
mcp__scopecraft-command-mcp__task_list { "include_content": true }

// List completed tasks (default is to exclude them)
mcp__scopecraft-command-mcp__task_list { "include_completed": true }

// List all tasks including completed ones with full content (maximum response size)
mcp__scopecraft-command-mcp__task_list { "include_content": true, "include_completed": true }

// Get details of a specific task
mcp__scopecraft-command-mcp__task_get { "id": "TASK-123" }

// Create a new task
mcp__scopecraft-command-mcp__task_create {
  "title": "New Feature Task",
  "type": "🌟 Feature",
  "phase": "release-v1"
}

// Update a task status
mcp__scopecraft-command-mcp__task_update {
  "id": "TASK-123",
  "updates": {
    "status": "🔵 In Progress"
  }
}

// Get next task recommendation
mcp__scopecraft-command-mcp__task_next

// List all phases
mcp__scopecraft-command-mcp__phase_list

// Create a new phase
mcp__scopecraft-command-mcp__phase_create {
  "id": "phase-1",
  "name": "Planning Phase",
  "description": "Initial planning phase",
  "status": "🟡 Pending"
}

// Update a phase
mcp__scopecraft-command-mcp__phase_update {
  "id": "phase-1",
  "updates": {
    "name": "Updated Phase Name",
    "status": "🔵 In Progress"
  }
}

// Rename a phase (change ID)
mcp__scopecraft-command-mcp__phase_update {
  "id": "phase-1",
  "updates": {
    "id": "planning-phase"
  }
}

// Delete a phase
mcp__scopecraft-command-mcp__phase_delete {
  "id": "phase-1"
}

// Force delete a phase with tasks
mcp__scopecraft-command-mcp__phase_delete {
  "id": "phase-1",
  "force": true
}
```

## Session Guidelines for Claude

When starting a new session with this project, Claude should automatically:

1. Check the current active phases with `mcp__scopecraft-command-mcp__phase_list`
2. List open tasks using `mcp__scopecraft-command-mcp__task_list { "status": "🟡 To Do" }`
3. Identify the next highest priority task with `mcp__scopecraft-command-mcp__task_next`
4. Ask the user if they want to:
   - Work on the suggested next task (highest priority)
   - Choose a different task from the open tasks list
   - Create a new task for the current phase
   - Create a new phase
   - Do something else entirely

## Development Commands

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run CLI in dev mode
bun run dev:cli -- [command]  # e.g. bun run dev:cli -- list

# Run MCP server in dev mode
bun run dev:mcp

# Lint code
bun run lint

# Run tests
bun run test

# Link for development (creates scopecraft-command/sc and scopecraft-command-mcp/sc-mcp commands)
bun link
```

## Architecture

The project is organized into three main modules:

1. **Core Module** (`src/core/`)
   - `types.ts`: Data structures used throughout the application
   - `task-parser.ts`: Parses and formats TOML+Markdown files
   - `task-manager.ts`: CRUD operations for tasks and phases
   - `formatters.ts`: Formats task/phase data for various outputs

2. **CLI Module** (`src/cli/`)
   - `cli.ts`: Main entry point, sets up commands
   - `commands.ts`: Implements CLI commands by calling core functions

3. **MCP Module** (`src/mcp/`)
   - `types.ts`: MCP-specific types for method names and request/response formats
   - `handlers.ts`: Implements MCP method handlers using core functions
   - `server.ts`: HTTP server for processing MCP requests
   - `cli.ts`: CLI entry point for starting the MCP server

## Key Design Patterns

- **Separation of Concerns**: Core logic is separate from interface concerns (CLI and MCP)
- **Consistent Error Handling**: All functions return standardized `OperationResult<T>` type
- **Type Safety**: Extensive use of TypeScript types
- **Task Relationships**: Support for complex task relations (parent-child, dependencies, workflow sequencing)
- **Phase Management**: Organization of tasks into phases

## Task File Format

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

## Task Management Flow

The task management flow follows these principles:

1. **Phases** organize tasks into logical groups (e.g. "release-v1", "milestone-2")
2. **Features & Areas** group related tasks using the MDTM directory structure
3. **Tasks** represent individual units of work with metadata (status, priority, type, etc.)
4. **Workflow** connects tasks through relationships (dependencies, sequential order)
5. **Prioritization** determines which tasks should be completed first

### Flow Steps

1. **Phase Creation**: Create phases to organize related tasks
2. **Feature/Area Creation**: Create subdirectories within phases for logical grouping of related tasks
3. **Task Creation**: Create tasks within phases and features/areas
4. **Task Prioritization**: Assign priorities to tasks (🔥 Highest, 🔼 High, ▶️ Medium, 🔽 Low)
5. **Task Assignment**: Assign tasks to team members
6. **Task Execution**: Work on tasks in priority order
7. **Task Completion**: Mark tasks as done, triggering suggestions for the next task

### Workflow Intelligence

The system intelligently determines the next task based on:
- Task priority (🔥 Highest > 🔼 High > ▶️ Medium > 🔽 Low)
- Task dependencies (tasks that require other tasks to be completed first)
- Phase order (tasks in earlier phases take precedence)
- Explicit task sequences (tasks linked with previous_task/next_task relationships)

### MDTM Directory Structure

The system supports the MDTM directory structure for organizing tasks:

- **Features**: Subdirectories with prefix `FEATURE_*` (e.g., `FEATURE_Authentication`)
- **Areas**: Subdirectories with prefix `AREA_*` (e.g., `AREA_Refactoring`)
- **Overview Files**: Special files named `_overview.md` that describe the feature/area
- **Numbered Tasks**: Optionally, tasks can be named with sequence numbers (e.g., `001_login.md`)

This structure allows for better organization of related tasks. Features typically represent functional parts of the product, while Areas represent cross-cutting concerns.

## Common CLI Commands

```bash
# Basic commands (new entity-command format)
sc task list                                       # List all tasks
sc task list --status "🟡 To Do"                   # List pending tasks
sc task list --phase "release-v1"                  # List tasks in a phase
sc task get TASK-ID                                # Get details of a specific task
sc task create --id "TASK-ID" --title "Task title" --type "🌟 Feature" --priority "🔼 High" --phase "release-v1"  # Create a new task
sc task create --template "feature" --title "New Feature" --phase "release-v1"  # Create from template
sc task update TASK-ID --status "🔵 In Progress"   # Update a task
sc task delete TASK-ID                             # Delete a task

# Basic commands (legacy format - still supported)
sc list                                            # List all tasks (short alias)
scopecraft-command list                            # List all tasks (full command)
sc list --status "🟡 To Do"                        # List pending tasks
sc list --phase "release-v1"                       # List tasks in a phase
sc get TASK-ID                                     # Get details of a specific task
sc create --id "TASK-ID" --title "Task title" --type "🌟 Feature" --priority "🔼 High" --phase "release-v1"  # Create a new task
sc create --template "feature" --title "New Feature" --phase "release-v1"  # Create from template
sc update TASK-ID --status "🔵 In Progress"        # Update a task
sc delete TASK-ID                                  # Delete a task

# Status shortcuts (new format)
sc task start TASK-ID     # Mark as In Progress
sc task complete TASK-ID  # Mark as Done
sc task block TASK-ID     # Mark as Blocked
sc task review TASK-ID    # Mark as In Review

# Status shortcuts (legacy format - still supported)
sc start TASK-ID     # Mark as In Progress
sc complete TASK-ID  # Mark as Done
sc block TASK-ID     # Mark as Blocked
sc review TASK-ID    # Mark as In Review

# Phase management (new format)
sc phase list              # List all phases
sc phase create --id "phase-1" --name "Planning Phase" --description "Initial planning stage"  # Create a phase
sc phase update phase-1 --name "Updated Name" --status "🔵 In Progress"  # Update a phase
sc phase update phase-1 --new-id "planning-phase"  # Rename a phase
sc phase delete phase-1    # Delete a phase
sc phase delete phase-1 --force  # Force delete a phase with tasks
sc phase start phase-1     # Mark phase as In Progress
sc phase complete phase-1  # Mark phase as Completed
sc phase block phase-1     # Mark phase as Blocked
sc phase pending phase-1   # Mark phase as Pending

# Phase management (legacy format - still supported)
sc phases            # List all phases
sc phase-create --id "phase-1" --name "Planning Phase" --description "Initial planning stage"  # Create a phase
sc phase-update phase-1 --name "Updated Name" --status "🔵 In Progress"  # Update a phase
sc phase-update phase-1 --new-id "planning-phase"  # Rename a phase
sc phase-delete phase-1  # Delete a phase
sc phase-delete phase-1 --force  # Force delete a phase with tasks
sc phase-start phase-1   # Mark phase as In Progress
sc phase-complete phase-1  # Mark phase as Completed
sc phase-block phase-1  # Mark phase as Blocked
sc phase-pending phase-1  # Mark phase as Pending

# Feature and Area management (new)
sc feature create --name "Authentication" --title "Auth System" --phase "release-v1"  # Create a feature
sc feature list                                    # List all features
sc area create --name "Performance" --title "Performance Opt" --phase "release-v1"  # Create an area
sc area list                                       # List all areas

# Template management
sc template list          # List available templates (new format)
sc list-templates         # List available templates (legacy format)

# Workflow navigation (new format)
sc workflow next          # Find the next highest priority task
sc workflow next TASK-ID  # Find the next task after completing the specified task
sc workflow current       # Show tasks currently in progress
sc workflow mark-complete-next TASK-ID  # Mark a task as complete and show the next task

# Workflow navigation (legacy format - still supported)
sc next-task         # Find the next highest priority task
sc next-task TASK-ID # Find the next task after completing the specified task
sc current-task      # Show tasks currently in progress
sc mark-complete-next TASK-ID  # Mark a task as complete and show the next task

# Task Content Management
sc get TASK-ID --format full > task.md       # Export task to a file for editing
sc update TASK-ID --file task.md             # Update task from edited file

# Note for AI Assistants (Claude):
# When working with tasks that need substantial content:
# 1. Create the task using CLI commands to establish proper metadata
# 2. Use direct file editing capabilities to update task content in-place
# 3. Skip the export/edit/import workflow when possible for efficiency

# MDTM Directory Structure Commands (new format)
sc feature create --name "Authentication" --title "Authentication Feature" --phase "release-v1"  # Create a feature with overview file
sc area create --name "Performance" --title "Performance Optimization" --phase "release-v1"  # Create an area with overview file
sc task create --title "Login UI" --type "🌟 Feature" --phase "release-v1" --subdirectory "FEATURE_Authentication"  # Create a task within a feature
sc task list --phase "release-v1" --subdirectory "FEATURE_Authentication"  # List tasks in a feature
sc task list --overview  # List only overview files
sc feature list  # List all features (overview files in FEATURE_* directories)
sc area list  # List all areas (overview files in AREA_* directories)
sc task update TASK-ID --subdirectory "FEATURE_UserProfiles"  # Move a task to a different feature

# MDTM Directory Structure Commands (legacy format - still supported)
sc create --id "_overview" --title "Authentication Feature" --type "🌟 Feature" --phase "release-v1" --subdirectory "FEATURE_Authentication"  # Create a feature overview file
sc create --title "Login UI" --type "🌟 Feature" --phase "release-v1" --subdirectory "FEATURE_Authentication"  # Create a task within a feature
sc list --phase "release-v1" --subdirectory "FEATURE_Authentication"  # List tasks in a feature
sc list --overview  # List only overview files
sc update TASK-ID --subdirectory "FEATURE_UserProfiles"  # Move a task to a different feature

# Note: When completing tasks in Claude Code, follow these steps:
# 1. Update task content to mark checklist items as done [x]
# 2. Add an Implementation Log section with details about the work completed
# 3. Update the task status to "🟢 Done" when all checklist items are complete
```

## Initialization and Setup

Before using the task management system, you need to initialize it:

```bash
# Initialize the task system (autodetects project type)
sc init

# Force specific project mode
sc init --mode standalone  # Uses .tasks directory
sc init --mode roo         # Uses .ruru directory (Roo Commander mode)
```

This creates the necessary directory structure based on the detected or specified project mode:
- `.tasks/` (standalone mode) or `.ruru/tasks/` (Roo Commander mode) for tasks
- `.tasks/config/` or `.ruru/config/` for configuration
- `.tasks/templates/` or `.ruru/templates/` for templates

## MCP Server Usage

The Model Context Protocol (MCP) server provides the same functionality as the CLI but through an HTTP interface optimized for LLMs. **This is the preferred interface when working in Claude Code.**

```bash
# Start the MCP server on default port (3500)
sc-mcp                     # Short alias
scopecraft-command-mcp     # Full command

# Start on a custom port
sc-mcp --port 3501

# Run with verbose mode for debugging
sc-mcp --verbose
```

### MCP Tool Naming Convention

MCP tools in Claude Code follow this naming pattern:
```
mcp__scopecraft-command-mcp__method_name
```

For example:
- `mcp__scopecraft-command-mcp__task_list` - List tasks
- `mcp__scopecraft-command-mcp__task_create` - Create a task
- `mcp__scopecraft-command-mcp__phase_list` - List phases

Always use these direct tool references rather than going through the CLI.

### MCP and CLI Implementation Notes

Both interfaces provide the same core functionality but with different characteristics:

1. **MCP Benefits**:
   - Designed specifically for AI integration
   - Structured JSON responses
   - Consistent parameter naming
   - Direct tool integration in Claude Code
   - Better for programmatic access

2. **CLI Benefits**:
   - Human-friendly output format
   - Designed for terminal usage
   - More detailed error messages
   - Useful for manual debugging
   - Better for direct human interaction

3. **Development Considerations**:
   - Both implementations use the same core functions
   - Features should be implemented consistently in both
   - Error handling and validation should be equivalent
   - When fixing bugs, verify in both interfaces
   - When reporting issues, specify which interface exhibited the problem

### MCP MDTM Directory Structure Examples

The MCP server supports all MDTM directory structure features. Here are example requests:

```json
// Create a feature overview
{
  "method": "task_create",
  "params": {
    "id": "_overview",
    "title": "Authentication Feature",
    "type": "🌟 Feature",
    "phase": "release-v1",
    "subdirectory": "FEATURE_Authentication"
  }
}

// Create a task within a feature
{
  "method": "task_create",
  "params": {
    "title": "Login UI Component",
    "type": "🌟 Feature",
    "phase": "release-v1",
    "subdirectory": "FEATURE_Authentication"
  }
}

// List tasks in a feature
{
  "method": "task_list",
  "params": {
    "phase": "release-v1",
    "subdirectory": "FEATURE_Authentication"
  }
}

// List only overview files
{
  "method": "task_list",
  "params": {
    "is_overview": true
  }
}
```

## Troubleshooting Guide

### Common Issues

1. **Template Parsing Error**:
   - Error: "Failed to parse TOML frontmatter: Missing required field: id"
   - Known issue being tracked in TASK-02-TemplateParseError
   - Workaround: Create tasks without using templates for now

2. **Project Mode Detection**:
   - If wrong mode is detected, use `sc init --mode <mode>` to force mode

3. **Phase Listing Issue**:
   - System directories like 'config', 'templates' might show up as phases
   - Known issue being investigated

### Debugging Tips

- Use `bun run dev:cli -- [command]` for development to see detailed logs
- Use `bun run dev:mcp -- --verbose` for MCP server debugging
- Compare behavior between CLI and MCP interfaces to isolate issues
- Check existence of `.tasks/` or `.ruru/` directories to confirm project mode
- Examine task files directly using a text editor to check for TOML issues
- When reporting issues, specify whether the problem occurs in CLI, MCP, or both
- For MCP-specific issues, check the server logs for JSON-RPC error messages

## MDTM Directory Structure Best Practices

When working with the MDTM directory structure, follow these best practices:

1. **Feature Organization**:
   - Create feature directories using the `FEATURE_` prefix for functional components
   - Create area directories using the `AREA_` prefix for cross-cutting concerns
   - Always create an `_overview.md` file to explain the purpose of the feature/area

2. **Naming Conventions**:
   - Use CamelCase for feature and area names (e.g., `FEATURE_UserAuthentication`)
   - Use lowercase with dashes for task names within features
   - For numbered tasks, use a three-digit prefix (e.g., `001_login-form.md`)

3. **Task Relationships**:
   - Tasks within the same feature should have related tags
   - Consider using the parent-child relationship between the overview and its tasks
   - Use dependencies to represent cross-feature relationships

4. **Organization Example**:
   ```
   .tasks/
     release-v1/
       FEATURE_Authentication/
         _overview.md
         001_login-ui.md
         002_login-logic.md
       AREA_Performance/
         _overview.md
         001_frontend-optimization.md
   ```

When organizing tasks in Claude Code, first create the feature overview, then add individual tasks within that feature.

## CLI and E2E Commands

The `e2e` command is used for running end-to-end tests in the project. It provides a comprehensive testing approach that verifies the entire workflow of the Scopecraft Command system.

### Key Features of the `e2e` Command:
- Runs full end-to-end tests across CLI and MCP interfaces
- Validates task creation, update, and management workflows
- Ensures consistency between different project modes (standalone and Roo Commander)
- Checks integration points between Core, CLI, and MCP modules
- Tests both new entity-command format and legacy format commands

### Usage Examples:
```bash
# Run all end-to-end tests
sc e2e

# Run e2e tests for a specific module
sc e2e --module cli
sc e2e --module mcp

# Run tests with verbose output
sc e2e --verbose

# Run tests specifically for entity-command pattern
sc e2e --module cli --tag entity-command

# Run tests for backward compatibility
sc e2e --module cli --tag backward-compat

# Run tests and generate a detailed report
sc e2e --report
```

### Test Coverage:
- Task CRUD operations
- Phase management
- MDTM directory structure validation
- Interface consistency (CLI vs MCP)
- Command format consistency (entity-command vs. legacy format)
- Error handling scenarios
- Performance and load testing

### Entity-Command Pattern Testing:
- Verify both new format commands (e.g., `sc task list`) and legacy format commands (e.g., `sc list`) work correctly
- Test all entity command groups: task, phase, feature, area, workflow, template
- Ensure nested command help works for each entity group
- Check that feature/area commands correctly handle the MDTM directory structure
- Confirm that workflow commands maintain proper task relationships

### E2E Testing Prompt for Entity-Command Pattern

```
Verify that both new entity-command format and legacy format commands work correctly.

Test cases to cover:
1. Task commands: list, get, create, update, delete
   - New format: sc task list, sc task get, etc.
   - Legacy format: sc list, sc get, etc.

2. Phase commands: list, create, update, delete
   - New format: sc phase list, sc phase create, etc.
   - Legacy format: sc phases, sc phase-create, etc.

3. Feature/Area commands
   - sc feature create/list
   - sc area create/list

4. Workflow commands
   - New format: sc workflow next, sc workflow current, sc workflow mark-complete-next
   - Legacy format: sc next-task, sc current-task, sc mark-complete-next

5. Template commands
   - New format: sc template list
   - Legacy format: sc list-templates

For each test case:
1. Execute both the new format and legacy format commands
2. Verify they produce identical output for the same input
3. Check that help text for each command is clear and consistent
4. Confirm entity command groups properly handle --help flag

Report any discrepancies or issues encountered during testing.
```

### Best Practices:
- Run e2e tests before major releases
- Integrate e2e tests in CI/CD pipeline
- Continuously expand test scenarios to cover new features
- Test both new entity-command format and legacy commands when adding new features