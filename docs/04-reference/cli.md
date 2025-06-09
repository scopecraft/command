# CLI Reference

Complete command reference for the Scopecraft CLI. The CLI follows a composable, Unix-philosophy design where commands can be chained together to create powerful workflows.

## Command Structure

Scopecraft CLI uses an entity-command pattern:

```bash
sc [entity] [command] [options]
```

## Core Entities

### Task Commands

Task management operations for individual tasks.

#### `sc task list`

List tasks with filtering options.

**Options:**
- `-s, --status <status>` - Filter by status (e.g., "To Do", "Done")
- `-t, --type <type>` - Filter by type (e.g., "feature", "bug")
- `-a, --assignee <assignee>` - Filter by assignee
- `-g, --tags <tags...>` - Filter by tags
- `-d, --subdirectory <subdirectory>` - Filter by area
- `-l, --location <location>` - Filter by workflow location: backlog, current, archive
- `--backlog` - Show only backlog tasks
- `--current` - Show only current tasks
- `--archive` - Show only archived tasks
- `--all` - Show all workflow locations
- `-f, --format <format>` - Output format: tree, table, json, minimal, workflow

**Examples:**
```bash
# List current tasks
sc task list --current

# List all feature tasks
sc task list --type feature

# List high priority tasks
sc task list --tags high-priority

# Get JSON output for scripting
sc task list --format json
```

#### `sc task get <id>`

Retrieve a specific task by ID.

**Options:**
- `-f, --format <format>` - Output format: default, json, markdown, full
- `-d, --subdirectory <subdirectory>` - Subdirectory to look in
- `--content-only` - Show only section content without metadata

**Examples:**
```bash
# Get task details
sc task get auth-feature-05A

# Get raw markdown content
sc task get auth-feature-05A --content-only

# Get JSON format for parsing
sc task get auth-feature-05A --format json
```

#### `sc task create`

Create a new task.

**Required Options:**
- `--title <title>` - Task title
- `--type <type>` - Task type (feature, bug, chore, documentation, test, spike, idea)

**Optional Options:**
- `--id <id>` - Custom task ID (auto-generated if not provided)
- `--status <status>` - Task status (default: "To Do")
- `--priority <priority>` - Task priority (default: "Medium")
- `--assignee <assignee>` - Assigned person
- `--location <location>` - Workflow location: backlog (default), current, archive
- `--subdirectory <subdirectory>` - Area/subdirectory
- `--parent <parent>` - Parent task ID for subtasks
- `--depends <depends...>` - Dependencies (task IDs)
- `--tags <tags...>` - Tags for categorization
- `--content <content>` - Initial task content
- `--template <template>` - Use predefined template

**Examples:**
```bash
# Create a feature task
sc task create --title "User authentication" --type feature

# Create with full metadata
sc task create \
  --title "Fix login bug" \
  --type bug \
  --priority high \
  --assignee "john.doe" \
  --tags "security" "urgent"

# Create subtask
sc task create \
  --title "Design login UI" \
  --type feature \
  --parent auth-feature-05A
```

#### `sc task update <id>`

Update an existing task.

**Options:**
- `--title <title>` - New task title
- `--type <type>` - New task type
- `--status <status>` - New task status
- `--priority <priority>` - New task priority
- `--assignee <assignee>` - New assignee
- `--location <location>` - Move to workflow location
- `--tags <tags...>` - New tags
- `--content <content>` - New task content

**Examples:**
```bash
# Mark task as in progress
sc task update auth-feature-05A --status "In Progress"

# Change priority
sc task update auth-feature-05A --priority high

# Move to current workflow
sc task update auth-feature-05A --location current
```

#### `sc task delete <id>`

Delete a task.

**Options:**
- `-f, --force` - Force deletion without confirmation
- `-d, --subdirectory <subdirectory>` - Subdirectory to look in

**Examples:**
```bash
# Delete with confirmation
sc task delete old-task-123

# Force delete
sc task delete old-task-123 --force
```

### Environment Commands

Environment management for development worktrees. Enables isolated development environments per task or parent task.

#### `sc env <taskId>`

Create or switch to a development environment for a task.

**Options:**
- `--base <branch>` - Base branch for the environment (default: main)
- `--force` - Force creation even if path conflicts exist

**Examples:**
```bash
# Create environment for a task
sc env auth-feature-05A

# Create with custom base branch
sc env auth-feature-05A --base develop

# Force creation
sc env auth-feature-05A --force
```

**Behavior:**
- For subtasks: Creates shared environment using parent task ID
- For parent tasks: Creates environment with parent task ID
- Automatically creates git worktree and branch
- Sets up isolated workspace for development

#### `sc env list`

List all active development environments.

**Options:**
- `-f, --format <format>` - Output format: table (default), json, minimal
- `-v, --verbose` - Show additional details like commit hashes

**Examples:**
```bash
# List environments in table format
sc env list

# Get JSON output for scripting
sc env list --format json

# Minimal output for shell integration
sc env list --format minimal

# Verbose output with commit details
sc env list --verbose
```

#### `sc env close <taskId>`

Close and cleanup a development environment.

**Options:**
- `--force` - Skip confirmation and safety checks
- `--keep-branch` - Preserve the git branch after closing

**Examples:**
```bash
# Close with confirmation
sc env close auth-feature-05A

# Force close without confirmation
sc env close auth-feature-05A --force

# Close but keep the git branch
sc env close auth-feature-05A --force --keep-branch
```

#### `sc env path <taskId>`

Output the filesystem path for an environment (useful for shell integration).

**Examples:**
```bash
# Get path for task environment
sc env path auth-feature-05A

# Shell integration example
cd "$(sc env path auth-feature-05A)"
```

### Work Command

Interactive Claude development sessions with automatic environment management.

#### `sc work [taskId] [additional-prompt...]`

Start an interactive Claude session for development work.

**Options:**
- `--mode <mode>` - Mode for Claude execution: auto (default), implementation, exploration, etc.
- `--session <sessionId>` - Resume an existing session
- `--dry-run` - Show what would be executed without running
- `--no-docker` - Force interactive mode (work is always interactive)

**Examples:**
```bash
# Interactive task selection
sc work

# Work on specific task
sc work auth-feature-05A

# Work with additional instructions
sc work auth-feature-05A "Focus on security requirements"

# Work in specific mode
sc work auth-feature-05A --mode implementation

# Resume previous session
sc work --session session-abc123

# Dry run to see what would happen
sc work auth-feature-05A --dry-run
```

**Behavior:**
- If no taskId provided: Shows interactive task selector
- Automatically creates/switches to task environment
- Launches ChannelCoder in interactive mode
- Supports session resumption for continuity
- Always runs interactively (never in Docker)

### Dispatch Command

Autonomous Claude execution for background task processing.

#### `sc dispatch <taskId>`

Execute a task autonomously using Claude in background mode.

**Options:**
- `--mode <mode>` - Execution mode: auto (default), implementation, exploration
- `--exec <type>` - Execution type: docker (default), detached, tmux
- `--session <sessionId>` - Resume an existing autonomous session
- `--dry-run` - Show what would be executed without running

**Examples:**
```bash
# Autonomous execution with Docker
sc dispatch auth-feature-05A

# Execute in tmux session
sc dispatch auth-feature-05A --exec tmux

# Execute in specific mode
sc dispatch auth-feature-05A --mode implementation

# Resume autonomous session
sc dispatch --session session-xyz789

# Dry run to preview execution
sc dispatch auth-feature-05A --dry-run
```

**Behavior:**
- Automatically creates/switches to task environment
- Executes Claude autonomously in background
- Supports Docker, detached, and tmux execution
- Returns session ID for monitoring and resumption
- Suitable for long-running, unattended execution

### Parent Commands

Management of parent tasks (complex features with multiple subtasks).

#### `sc parent create`

Create a parent task with optional initial subtasks.

**Required Options:**
- `--title <title>` - Parent task title
- `--type <type>` - Task type (typically "feature")

**Optional Options:**
- `--status <status>` - Initial status (default: "To Do")
- `--priority <priority>` - Priority level
- `--assignee <assignee>` - Assigned person
- `--location <location>` - Workflow location (default: "backlog")
- `--tags <tags...>` - Tags for categorization

**Examples:**
```bash
# Create parent task
sc parent create --title "User Authentication System" --type feature

# Create with metadata
sc parent create \
  --title "Payment Integration" \
  --type feature \
  --priority high \
  --assignee "team-lead" \
  --tags "backend" "api"
```

#### `sc parent list`

List parent tasks with progress information.

**Options:**
- `--location <location>` - Filter by workflow location
- `--include-subtasks` - Show subtasks in the listing
- `-f, --format <format>` - Output format

**Examples:**
```bash
# List all parent tasks
sc parent list

# List current parent tasks with subtasks
sc parent list --current --include-subtasks
```

#### `sc parent show <parentId>`

Show detailed parent task information.

**Options:**
- `--tree` - Display subtasks in tree format
- `-f, --format <format>` - Output format

**Examples:**
```bash
# Show parent task details
sc parent show auth-feature-05A

# Show with subtask tree
sc parent show auth-feature-05A --tree
```

### Workflow Commands

Task workflow and state management shortcuts.

#### `sc workflow next`

Find and display the next task to work on.

**Options:**
- `-f, --format <format>` - Output format

**Examples:**
```bash
# Get next task
sc workflow next

# Next task in JSON format
sc workflow next --format json
```

#### `sc workflow current`

Show tasks currently in progress.

**Examples:**
```bash
# Show current tasks
sc workflow current
```

#### `sc workflow promote <taskId>`

Move a task from backlog to current workflow.

**Examples:**
```bash
# Promote task to current
sc workflow promote auth-feature-05A
```

### Template Commands

Template management for task creation.

#### `sc template list`

List available task templates.

**Examples:**
```bash
# List templates
sc template list
```

## Global Options

Available for all commands:

- `--root-dir <path>` - Override project root directory
- `--config <path>` - Custom configuration file path
- `--help` - Show command help
- `--version` - Show CLI version

## Workflow Integration Patterns

### Basic Development Workflow

```bash
# 1. Create a task
sc task create --title "Implement feature X" --type feature

# 2. Create development environment
sc env feature-x-05A

# 3. Start working interactively
sc work feature-x-05A

# 4. Or dispatch for autonomous work
sc dispatch feature-x-05A --exec tmux
```

### Environment-First Workflow

```bash
# 1. Create and enter environment
sc env auth-feature-05A
cd "$(sc env path auth-feature-05A)"

# 2. Work on task
sc work auth-feature-05A "Implement OAuth integration"

# 3. Clean up when done
sc env close auth-feature-05A --force
```

### Session Management

```bash
# Start interactive session
sc work auth-feature-05A
# Session creates session-abc123

# Resume later
sc work --session session-abc123

# Start autonomous session
sc dispatch auth-feature-05A --exec tmux
# Returns session-xyz789

# Resume autonomous session
sc dispatch --session session-xyz789
```

## Command Composition

The CLI is designed for composability:

```bash
# Create task and immediately start working
sc task create --title "Fix bug" --type bug --location current && \
sc work $(sc task list --current --format minimal | tail -1 | cut -f1)

# Get next task and create environment
NEXT_TASK=$(sc workflow next --format json | jq -r '.metadata.id')
sc env "$NEXT_TASK"

# List environments and close oldest
OLDEST_ENV=$(sc env list --format minimal | head -1 | cut -f1)
sc env close "$OLDEST_ENV" --force
```

## Exit Codes

- `0` - Success
- `1` - General error (task not found, validation failure, etc.)
- `2` - Configuration error (missing root directory, invalid config)
- `130` - User cancellation (Ctrl+C)

## Environment Variables

- `SCOPECRAFT_ROOT` - Default project root directory
- `SCOPECRAFT_CONFIG` - Default configuration file path
- `MCP_PORT` - Port for MCP server (when applicable)

## See Also

- [CLI Workflows Guide](../03-guides/cli-workflows.md) - Workflow patterns and best practices
- [Configuration Guide](../project-root-configuration-guide.md) - Project setup and configuration
- [Claude Commands Guide](../claude-commands-guide.md) - Slash commands for Claude integration