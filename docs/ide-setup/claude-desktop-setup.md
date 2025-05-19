# Claude Desktop Setup Guide

This guide helps you configure Scopecraft to work with Claude Desktop application.

## Prerequisites

- Scopecraft installed globally: `npm install -g @scopecraft/cmd`
- Claude Desktop installed
- A project with `.tasks` directory

## Configuration File Location

The `claude_desktop_config.json` file is located at:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
  
  On Windows, you can access this location by:
  1. Press Windows Key + R
  2. Type `%APPDATA%\Claude`
  3. Press Enter

## Configuration Steps

### Step 1: Create or Edit Configuration File

1. Navigate to the configuration directory
2. Create `claude_desktop_config.json` if it doesn't exist
3. Open the file in your text editor

### Step 2: Add Scopecraft Configuration

Add the following configuration to the file:

#### Basic Configuration with Absolute Path

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/absolute/path/to/your/project"]
    }
  }
}
```

#### Using npx (no global install needed)

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "npx",
      "args": ["-y", "@scopecraft/cmd", "mcp", "--root-dir", "/absolute/path/to/your/project"]
    }
  }
}
```

#### With Environment Variables

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/path/to/project"],
      "env": {
        "NODE_ENV": "production",
        "SCOPECRAFT_ROOT": "/path/to/project"
      }
    }
  }
}
```

### Step 3: Using Configuration File

1. Create `~/.scopecraft/config.json`:
```json
{
  "version": "1.0.0",
  "projects": [
    {
      "name": "main",
      "path": "/Users/username/projects/main",
      "description": "Main project"
    },
    {
      "name": "docs",
      "path": "/Users/username/projects/docs",
      "description": "Documentation project"
    }
  ],
  "defaultProject": "main"
}
```

2. Update Claude Desktop config:
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

### Step 4: Apply Configuration

1. Save the configuration file
2. Restart Claude Desktop completely
3. The MCP UI elements will only show if at least one server is properly configured

## Platform-Specific Configurations

### Windows with WSL

If using Node.js through WSL:

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "wsl.exe",
      "args": [
        "bash",
        "-c",
        "/home/username/.nvm/versions/node/v20.12.1/bin/node /usr/local/bin/scopecraft-mcp --root-dir /home/username/projects/myproject"
      ]
    }
  }
}
```

### Multiple Projects

Configure multiple Scopecraft instances:

```json
{
  "mcpServers": {
    "scopecraft-frontend": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/projects/myapp/frontend"]
    },
    "scopecraft-backend": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/projects/myapp/backend"]
    }
  }
}
```

## Using Scopecraft in Claude Desktop

### Basic Task Management

```
# List all tasks
task list

# Create a new task
task create "Implement user authentication" --type feature

# View task details
task get TASK-001

# Update task status
task update TASK-001 --status "In Progress"
```

### Project Navigation

```
# Check current project
get_current_root

# Switch to different project
init_root /path/to/another/project

# List all configured projects
list_projects
```

### Feature Development

```
# Create a feature
feature create "User Authentication System"

# View feature tasks
feature get FEATURE_auth

# List all features
feature list
```

## Troubleshooting

### MCP UI Not Showing

1. Ensure at least one server is properly configured
2. Check that all paths are absolute paths
3. Verify the JSON syntax is correct
4. Restart Claude Desktop after configuration changes

### Connection Issues

1. **Verify Installation**:
   ```bash
   which scopecraft-mcp
   # Should show installation path
   ```

2. **Test Command Manually**:
   ```bash
   scopecraft-mcp --root-dir /your/project
   # Should start without errors
   ```

3. **Check Configuration File**:
   - Ensure valid JSON syntax
   - Use absolute paths only
   - Check file permissions

### Path Resolution

1. **Use Absolute Paths**: Always use full paths starting with `/` (Unix) or `C:\` (Windows)
2. **Escape Backslashes on Windows**: Use `\\` or forward slashes `/`
3. **Verify Path Exists**:
   ```bash
   ls -la /path/to/project/.tasks
   ```

### Permission Issues

1. Ensure Claude Desktop can access your project directory
2. Check file permissions on configuration file
3. On macOS, grant file access permissions if prompted

## Configuration Generator

You can use the Claude Desktop MCP Config Generator at [claudedesktopconfiggenerator.com](https://claudedesktopconfiggenerator.com/) to automatically generate configurations.

## Best Practices

1. **Use Absolute Paths**: Always specify full paths to avoid resolution issues
2. **Test Commands First**: Verify commands work in terminal before adding to config
3. **One Project Per Server**: Use separate server instances for different projects
4. **Keep It Simple**: Start with basic configuration and add complexity as needed
5. **Document Your Setup**: Keep notes on your configuration for team sharing

## Advanced Configuration

### Using STDIO Transport

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

### With Docker

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "docker",
      "args": ["run", "-v", "/path/to/project:/project", "scopecraft/mcp", "--root-dir", "/project"]
    }
  }
}
```

## Getting Help

- Claude Desktop documentation
- Scopecraft documentation: `docs/`
- GitHub Issues: [Report problems](https://github.com/scopecraft/cmd/issues)
- Community support: [Discord](https://discord.gg/scopecraft)