# Scopecraft Command

A powerful command-line tool and MCP server for managing Markdown-Driven Task Management (MDTM) files. Scopecraft helps you organize tasks, features, and development workflows with a structured approach.

**Key Features:**
* Works both standalone or with Roo Commander
* Supports MDTM format with TOML/YAML frontmatter
* Provides both CLI and MCP server interfaces
* Includes specialized Claude commands for feature development
* Automated project type detection

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
# Run commands directly
npx @scopecraft/cmd task list
npx @scopecraft/cmd feature create "New Feature"
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

## Quick Start

### Basic Task Management

```bash
# List all tasks
sc task list

# Create a new task
sc task create "Implement user authentication" --type feature --status planning

# Update task status
sc task update TASK-123 --status implementation

# View task details
sc task get TASK-123
```

### Feature Development Workflow

```bash
# Create and manage features
sc feature create "Real-time collaboration"
sc feature list --phase v1

# Work with areas (technical domains)
sc area create "api" --title "API Backend"
sc area list
```

### Phase Management

```bash
# Create project phases
sc phase create --id v1 --name "Version 1.0"
sc phase list

# Move tasks between phases
sc task move TASK-123 --target-phase v1.1
```

## Entity-Command Pattern

Commands follow an intuitive pattern:
```
<entity> <command> [options]
```

Entities:
- `task` - Task management
- `phase` - Phase management
- `feature` - Feature directories
- `area` - Area directories
- `workflow` - Task sequences
- `template` - Templates

Example:
```bash
# New format
sc task list

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
- `/project:implement {mode} {task-id}` - Execute with guidance
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
/project:implement ui TASK-20250517-234567
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

- [Feature Development Workflow](docs/feature-development-workflow.md)
- [Claude Commands Guide](docs/claude-commands-guide.md)
- [Organizational Structure Guide](docs/organizational-structure-guide.md)
- [MDTM Directory Structure](docs/mdtm-directory-structure.md)
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