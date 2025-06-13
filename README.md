# Scopecraft Command

A powerful command-line tool and MCP server for managing Markdown-Driven Task Management (MDTM) files. Scopecraft helps you organize tasks, features, and development workflows with a structured approach.

> **Version 2.0**: Now with workflow-based task organization (backlog → current → archive), parent tasks for complex features, and advanced subtask sequencing capabilities!

**Key Features:**
* Works with any AI IDE (Cursor, Claude Desktop, etc.) via flexible project root configuration
* Workflow-based task management with automatic state transitions
* Parent tasks with subtask sequencing and parallel execution
* Supports MDTM format with TOML/YAML frontmatter
* Provides both CLI and MCP server interfaces
* Includes specialized Claude commands for feature development
* Automated project type detection
* Multi-project support with easy switching

## Installation

### Install from NPM

#### Global Installation (Recommended)

```bash
# Install globally with npm
npm install -g @scopecraft/cmd

# Or with yarn
yarn global add @scopecraft/cmd

# Or with bun
bun install -g @scopecraft/cmd
```

After installation, these commands will be available:
- `scopecraft` / `sc` - CLI for task management
- `scopecraft-mcp` / `sc-mcp` - MCP server (HTTP/SSE)
- `scopecraft-stdio` / `sc-stdio` - MCP server (STDIO transport)

#### Using with npx (No Installation)

```bash
# Run CLI commands directly
npx @scopecraft/cmd sc task list
npx @scopecraft/cmd sc feature create "New Feature"

# Run MCP STDIO server
npx --package=@scopecraft/cmd scopecraft-stdio --root-dir /path/to/your/project
```

### Install from Source

```bash
# Clone repository
git clone https://github.com/scopecraft-ai/scopecraft-command.git
cd scopecraft-command

# Install dependencies
bun install

# Build project
bun run build

# Install globally
bun run install:global
```

## Project Root Configuration

Scopecraft now works with any AI IDE! Configure your project root using one of these methods:

### Quick Setup for AI IDEs

#### Cursor / Claude Desktop
```bash
# Start MCP server with your project
scopecraft-mcp --root-dir /path/to/your/project
```

Or add to your IDE's MCP configuration:
```json
{
  "scopecraft": {
    "command": "scopecraft-mcp",
    "args": ["--root-dir", "/path/to/your/project"]
  }
}
```

#### Multiple Projects
Create `~/.scopecraft/config.json`:
```json
{
  "projects": {
    "frontend": { "path": "/projects/myapp/frontend" },
    "backend": { "path": "/projects/myapp/backend" }
  }
}
```

Then switch projects at runtime:
```
init_root /projects/myapp/backend
```

### Configuration Methods

1. **CLI Parameter**: `--root-dir /path/to/project`
2. **MCP Command**: `init_root /path/to/project`
3. **Config File**: `~/.scopecraft/config.json`
4. **Environment**: `SCOPECRAFT_ROOT=/path/to/project`

See [Project Root Configuration Guide](docs/project-root-configuration-guide.md) for detailed setup instructions.

## Getting Started

```bash
# Initialize Scopecraft in your project
sc init

# Create your first task
sc task create --title "My first feature" --type feature

# List your tasks
sc task list
```

## Quick Start

### Basic Task Management

```bash
# List all tasks
sc task list
sc task list --current    # Show only active tasks
sc task list --backlog    # Show backlog items

# Create a new task (goes to backlog by default)
sc task create --title "Implement user authentication" --type feature

# Update task status
sc task update TASK-123 --status "In Progress"
sc task start TASK-123    # Shortcut for marking as "In Progress"
sc task complete TASK-123 # Shortcut for marking as "Done"

# View task details
sc task get TASK-123
```

### Parent Tasks (Complex Features)

```bash
# Create a parent task with subtasks
sc parent create --title "User Authentication" --type feature

# Add subtasks to a parent
sc parent add-subtask auth-05K --title "Design login UI"
sc parent add-subtask auth-05K --title "Implement API" --after 01-design

# View parent task with tree visualization
sc parent show auth-05K --tree

# Work with subtasks (use full path or --parent option)
sc task update current/auth-05K/02-impl-api --status "In Progress"
sc task complete 02-impl-api --parent auth-05K
```

### Task Sequencing

```bash
# Make subtasks run in parallel
sc task parallelize 02-api 03-ui --parent auth-05K

# Reorder subtasks
sc task resequence auth-05K --from 1,2,3 --to 3,1,2

# Convert simple task to parent with subtasks
sc task promote simple-auth-05M --subtasks "Design,Build,Test"
```

### Workflow Management

```bash
# Tasks move through workflows: backlog → current → archive
sc task create --title "New feature"          # Creates in backlog
sc task update new-feature-05A --status "In Progress"  # Moves to current
sc task complete new-feature-05A              # Marks as done

# Move parent tasks between workflows
sc parent move auth-05K current
```

### Environment and Session Management

Scopecraft provides integrated development environments and Claude session management.

#### Environment Commands

```bash
# Create or switch to task environment
sc env auth-feature-05A

# List active environments
sc env list

# Get environment path for shell integration
cd "$(sc env path auth-feature-05A)"

# Close environment when done
sc env close auth-feature-05A --force
```

#### Interactive Development (Work Command)

```bash
# Interactive task selection
sc work

# Work on specific task
sc work auth-feature-05A

# Work with additional context
sc work auth-feature-05A "Focus on security requirements"

# Resume previous session
sc work --session session-abc123
```

#### Autonomous Development (Dispatch Command)

```bash
# Autonomous execution in Docker
sc dispatch auth-feature-05A

# Execute in tmux session
sc dispatch auth-feature-05A --exec tmux

# Execute in specific mode
sc dispatch auth-feature-05A --mode implementation

# Resume autonomous session
sc dispatch --session session-xyz789
```

#### Composable Workflows

```bash
# Complete development workflow
sc task create --title "New feature" --type feature
sc env new-feature-05A
sc work new-feature-05A

# Or autonomous processing
sc dispatch new-feature-05A --exec tmux
```

### Legacy Worktree Management

For compatibility with existing workflows:

```bash
# Start a task worktree
tw-start TASK-123

# Start a feature worktree
tw-feat-start FEATURE_auth

# List active worktrees
tw-list

# Finish and merge work
tw-finish TASK-123
```

## Entity-Command Pattern

Commands follow an intuitive pattern:
```
<entity> <command> [options]
```

Entities:
- `task` - Task management (simple and subtasks)
- `parent` - Parent task management (folders with subtasks)
- `env` - Development environment management (worktrees)
- `work` - Interactive Claude development sessions
- `dispatch` - Autonomous Claude execution
- `area` - Area directories (organizational units)
- `workflow` - Task sequences and status
- `template` - Task templates

Examples:
```bash
# Task management
sc task list
sc task create --title "Feature X" --type feature

# Environment management
sc env feature-x-05A
sc env list

# Interactive development
sc work feature-x-05A

# Autonomous execution
sc dispatch feature-x-05A --exec tmux

# Legacy format (still supported)
sc list
```

## Claude Commands

Scopecraft includes specialized Claude commands for structured development:

### Available Commands

- `/project:01_brainstorm-feature` - Interactive ideation (Step 1)
- `/project:02_feature-proposal` - Create formal proposals (Step 2)
- `/project:03_feature-to-prd` - Expand to detailed PRDs (Step 3)
- `/project:04_feature-planning` - Break down into tasks (Step 4)
- `/project:05_implement {mode} {task-id}` - Execute with guidance
  - Modes: `typescript`, `ui`, `mcp`, `cli`, `devops`
- `/project:review` - Review project state

### Example Workflow

```bash
# Step 1: Start with an idea
/project:01_brainstorm-feature "better task filtering"

# Step 2: Create proposal
/project:02_feature-proposal

# Step 3: Expand to PRD
/project:03_feature-to-prd TASK-20250517-123456

# Step 4: Plan implementation
/project:04_feature-planning FEATURE-20250517-123456

# Execute tasks
/project:05_implement ui TASK-20250517-234567

# Automatically find and implement next task in feature
/project:implement-next FEATURE_auth
/project:implement-next  # Auto-detect from current worktree
```

## MCP Server Usage

### Starting the Server

```bash
# HTTP/SSE Server (default port 3000)
scopecraft-mcp

# With custom port
MCP_PORT=8080 scopecraft-mcp

# STDIO transport
scopecraft-stdio
```

### Integration with Roo Commander

Configure in your Roo Commander settings to enable LLM agents to manage tasks directly through the MCP protocol.

### Example Request

```json
{
  "method": "task.list",
  "params": {
    "status": "🔵 In Progress",
    "format": "json"
  }
}
```

## Documentation

### CLI Reference and Guides
- [CLI Reference](docs/04-reference/cli.md) - Complete command reference
- [CLI Workflows Guide](docs/03-guides/cli-workflows.md) - Workflow patterns and best practices

### Development and Integration
- [Feature Development Workflow](docs/feature-development-workflow.md)
- [Claude Commands Guide](docs/claude-commands-guide.md)
- [Organizational Structure Guide](docs/organizational-structure-guide.md)
- [Development Guide](docs/DEVELOPMENT.md)

## Integration Options

### Standalone Usage

Use Scopecraft directly to manage MDTM files in any project. Supports standard MDTM format with TOML or YAML frontmatter.

### With Roo Commander

Complements Roo Commander's LLM-based management by providing direct CRUD operations. The MCP server allows efficient task manipulation without parsing markdown.

### Project Type Detection

Automatically detects project type and adapts behavior accordingly. No special configuration needed.

## Credits

Scopecraft implements the Markdown-Driven Task Management (MDTM) format created by [Roo Commander](https://github.com/jezweb/roo-commander). We are grateful for this standardized format for task management in markdown files.

## License

MIT