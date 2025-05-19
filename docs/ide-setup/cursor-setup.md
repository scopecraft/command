# Cursor IDE Setup Guide

This guide helps you configure Scopecraft to work with Cursor IDE.

## Prerequisites

- Scopecraft installed globally: `npm install -g @scopecraft/cmd`
- Cursor IDE installed and configured
- A project with `.tasks` directory

## Configuration Steps

### Step 1: Open Cursor Settings

1. Open Cursor IDE
2. Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
3. Search for "MCP" in settings

### Step 2: Add Scopecraft Server

Add the following configuration to your MCP servers:

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
  "projects": {
    "my-project": {
      "path": "/Users/username/projects/my-project",
      "description": "My main project"
    }
  },
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

1. Restart Cursor
2. Open the AI assistant
3. Type: `get_current_root`
4. Should see your project path

## Using Scopecraft in Cursor

### Basic Commands

```
# List all tasks
task list

# Create a new task
task create "Implement new feature"

# Get task details
task get TASK-001

# Update task status
task update TASK-001 --status "In Progress"
```

### Project Management

```
# Switch projects (if using config file)
init_root /path/to/other/project

# List available projects
list_projects

# Verify current project
get_current_root
```

### Feature Development

```
# Create a new feature
feature create "User Authentication"

# List features
feature list

# Work on a specific feature
feature get FEATURE_auth
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

For Cursor workspaces, add to `.cursor/settings.json`:

```json
{
  "mcp.servers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "${workspaceFolder}"]
    }
  }
}
```

### 3. Custom Commands

Create shortcuts in Cursor:

```json
{
  "aiAssistant.customCommands": [
    {
      "name": "List Tasks",
      "prompt": "task list --status 'In Progress'"
    },
    {
      "name": "Create Task",
      "prompt": "task create"
    }
  ]
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

3. Check Cursor logs:
   - View → Output → MCP

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

## Advanced Configuration

### Using STDIO Transport

For better performance, use STDIO transport:

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-stdio",
      "args": ["--root-dir", "/path/to/project"],
      "transport": "stdio"
    }
  }
}
```

### Environment-Specific Settings

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/path/to/project"],
      "env": {
        "NODE_ENV": "development",
        "SCOPECRAFT_LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Multiple Configurations

Create different configurations for different contexts:

```json
{
  "profiles": {
    "development": {
      "mcpServers": {
        "scopecraft": {
          "command": "scopecraft-mcp",
          "args": ["--root-dir", "/dev/project"]
        }
      }
    },
    "production": {
      "mcpServers": {
        "scopecraft": {
          "command": "scopecraft-mcp",
          "args": ["--root-dir", "/prod/project"]
        }
      }
    }
  }
}
```

## Best Practices

1. **Use project-specific configuration**: Keep settings in workspace
2. **Document your setup**: Add README for team members
3. **Use consistent paths**: Avoid mixing relative/absolute paths
4. **Test configuration**: Verify before sharing with team
5. **Keep configs in version control**: Track changes over time

## Integration with Cursor Features

### AI Code Generation

When asking Cursor to generate code:

```
Create a component for the task TASK-001 that I'm working on
```

Cursor can access task details through Scopecraft.

### Code Reviews

Reference tasks in code reviews:

```
This PR implements TASK-001. Get the task details and verify all requirements are met.
```

### Documentation

Generate documentation based on tasks:

```
Create documentation for FEATURE_auth based on all completed tasks
```

## Quick Start Template

Save this as `.cursor/mcp-scopecraft.json`:

```json
{
  "scopecraft": {
    "command": "scopecraft-mcp",
    "args": ["--root-dir", "${workspaceFolder}"],
    "env": {
      "NODE_ENV": "development"
    },
    "transport": "http",
    "description": "Scopecraft task management for this project"
  }
}
```

Then reference in your Cursor settings:

```json
{
  "mcp.servers": "$include(.cursor/mcp-scopecraft.json)"
}
```

## Getting Help

- Check Cursor MCP documentation
- View Scopecraft logs: `View → Output → MCP`
- Report issues: [GitHub Issues](https://github.com/scopecraft/cmd/issues)
- Join community: [Discord Server](https://discord.gg/scopecraft)