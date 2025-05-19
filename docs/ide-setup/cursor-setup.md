# Cursor IDE Setup Guide

This guide helps you configure Scopecraft to work with Cursor IDE using the Model Context Protocol (MCP).

## Prerequisites

- Scopecraft installed globally: `npm install -g @scopecraft/cmd`
- Cursor IDE installed and configured
- A project with `.tasks` directory

## Configuration Location

Cursor supports two configuration locations:
- **Project-specific**: `.cursor/mcp.json` in your project directory
- **Global**: `~/.cursor/mcp.json` in your home directory

## Configuration Steps

### Step 1: Create Configuration File

Create the appropriate configuration file based on your needs:

```bash
# For project-specific configuration
mkdir -p .cursor
touch .cursor/mcp.json

# For global configuration
mkdir -p ~/.cursor
touch ~/.cursor/mcp.json
```

### Step 2: Add Scopecraft Server Configuration

Edit the configuration file with the following JSON structure:

#### Using CLI Server (Node.js)
```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "npx",
      "args": ["--package=@scopecraft/cmd", "scopecraft-stdio", "--root-dir", "/path/to/your/project"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Using Installed Binary
```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/path/to/your/project"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Step 3: Alternative Configuration Methods

#### Using Configuration File

1. Create `~/.scopecraft/config.json`:
```json
{
  "version": "1.0.0",
  "projects": [
    {
      "name": "my-project",
      "path": "/Users/username/projects/my-project",
      "description": "My main project"
    }
  ],
  "defaultProject": "my-project"
}
```

2. Update Cursor configuration:
```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--config", "/Users/username/.scopecraft/config.json"]
    }
  }
}
```

#### Using Environment Variables

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "env": {
        "SCOPECRAFT_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

### Step 4: Verify Configuration

1. Restart Cursor IDE
2. Navigate to Settings > MCP
3. Check that Scopecraft appears under "Available Tools"
4. In the chat interface, verify you can use Scopecraft commands

## Using Scopecraft in Cursor

The Composer Agent will automatically use Scopecraft tools when relevant. You can also explicitly request tool usage:

### Basic Commands

```
# List all tasks
Use the task list tool

# Create a new task
Use task create to add "Implement new feature"

# Get task details
Use task get to show TASK-001

# Update task status
Use task update to mark TASK-001 as "In Progress"
```

### Project Management

```
# Switch projects (if using config file)
Use init_root to set /path/to/other/project

# List available projects
Use list_projects to show configured projects

# Verify current project
Use get_current_root to check active project
```

### Feature Development

```
# Create a new feature
Use feature create to add "User Authentication"

# List features
Use feature list to show all features

# Work on a specific feature
Use feature get to show FEATURE_auth
```

## Transport Types

### stdio Transport (Default)
- Runs locally on your machine
- Managed automatically by Cursor
- Communicates via stdout
- Only accessible locally

### SSE Transport (Alternative)
```json
{
  "mcpServers": {
    "scopecraft": {
      "url": "http://localhost:3000/sse",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Tips for Cursor Users

### 1. Multiple Projects

Set up multiple projects in your config:

```json
{
  "mcpServers": {
    "scopecraft-frontend": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/projects/app/frontend"]
    },
    "scopecraft-backend": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/projects/app/backend"]
    }
  }
}
```

### 2. Workspace Configuration

For Cursor workspaces, add to `.cursor/mcp.json` in the workspace root:

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "."],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Troubleshooting

### Connection Issues

1. Check if Scopecraft is installed:
   ```bash
   which scopecraft-mcp
   ```

2. Test command manually:
   ```bash
   scopecraft-mcp --root-dir /your/project
   ```

3. Check Cursor MCP settings:
   - Settings > MCP > View available tools
   - Ensure Scopecraft appears in the list

### Permission Issues

1. Ensure Cursor has access to project directory
2. Check file permissions:
   ```bash
   ls -la /path/to/project/.tasks
   ```

### Path Issues

1. Use absolute paths in configuration
2. Avoid special characters in paths
3. Test path exists:
   ```bash
   test -d /path/to/project && echo "Path exists"
   ```

## Best Practices

1. **Use project-specific configuration**: Keep `.cursor/mcp.json` in your project
2. **Document your setup**: Add README for team members
3. **Use consistent paths**: Always use absolute paths
4. **Test configuration**: Verify before sharing with team
5. **Keep configs in version control**: Track changes over time

## Getting Help

- Check Cursor MCP documentation
- View Scopecraft logs in Cursor output panel
- Report issues: [GitHub Issues](https://github.com/scopecraft/cmd/issues)
- Join community: [Discord Server](https://discord.gg/scopecraft)