# Project Root Configuration Guide

This guide explains how to configure project roots in Scopecraft for different AI IDEs and development environments. With these configuration methods, you can use Scopecraft in Cursor, Claude Desktop, and other AI IDEs that spawn MCP servers from the application location rather than the project directory.

## Quick Start

### For Cursor/Claude Desktop Users

The quickest way to start using Scopecraft in your AI IDE:

1. **Using CLI parameters (Recommended)**:
   ```bash
   scopecraft-mcp --root-dir /path/to/your/project
   ```

2. **Using MCP commands**:
   ```
   # In your AI IDE chat:
   init_root /path/to/your/project
   ```

3. **Using configuration file**:
   Create `~/.scopecraft/config.json`:
   ```json
   {
     "projects": {
       "my-project": {
         "path": "/path/to/your/project"
       }
     }
   }
   ```

## Configuration Methods

### Method 1: CLI Parameters

Use the `--root-dir` parameter when starting the MCP server:

```bash
# For MCP server
scopecraft-mcp --root-dir /path/to/project

# For STDIO transport
scopecraft-stdio --root-dir /path/to/project

# In your MCP configuration (Claude Desktop, Cursor, etc.)
{
  "command": "scopecraft-mcp",
  "args": ["--root-dir", "/Users/username/projects/my-project"]
}
```

**Benefits:**
- Simple and direct
- No additional configuration files needed
- Works immediately

### Method 2: MCP Commands

Use MCP commands to set the project root at runtime:

```
# Set project root
init_root /path/to/your/project

# Verify current root
get_current_root

# List configured projects
list_projects
```

**Benefits:**
- Change projects without restarting the server
- Interactive project switching
- Session-specific configuration

### Method 3: Configuration File

Create a configuration file at `~/.scopecraft/config.json`:

```json
{
  "version": "1.0.0",
  "projects": {
    "web-app": {
      "path": "/Users/username/projects/web-app",
      "description": "Main web application"
    },
    "api-server": {
      "path": "/Users/username/projects/api-server",
      "description": "Backend API service"
    }
  },
  "defaultProject": "web-app"
}
```

You can also specify a custom config file:

```bash
scopecraft-mcp --config /path/to/custom/config.json
```

**Benefits:**
- Manage multiple projects
- Set default project
- Share configuration across team

### Method 4: Environment Variable

Set the `SCOPECRAFT_ROOT` environment variable:

```bash
export SCOPECRAFT_ROOT=/path/to/project
scopecraft-mcp
```

**Benefits:**
- System-wide configuration
- Works with all Scopecraft commands
- Good for CI/CD environments
- Gracefully falls back if invalid path

**Verified Features:**
- ✅ Environment variable is respected
- ✅ CLI parameters override environment variable
- ✅ Graceful fallback when path is invalid
- ✅ Works with both CLI and MCP servers

## Configuration Precedence

Scopecraft uses this precedence order (highest to lowest):

1. **Runtime**: Per-request override (future enhancement)
2. **Session**: Set via `init_root` command
3. **CLI**: Command-line `--root-dir` parameter
4. **Environment**: `SCOPECRAFT_ROOT` environment variable
5. **Config File**: Projects in `~/.scopecraft/config.json`
6. **Auto-detect**: Current working directory

## IDE-Specific Setup

### Cursor

1. Open Cursor settings
2. Navigate to MCP configuration
3. Add Scopecraft with root directory:

```json
{
  "mcpServers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/path/to/your/project"]
    }
  }
}
```

### Claude Desktop

1. Open Claude Desktop preferences
2. Go to Developer → MCP Servers
3. Add configuration:

```json
{
  "scopecraft": {
    "command": "scopecraft-mcp",
    "args": ["--root-dir", "/path/to/your/project"]
  }
}
```

### Other AI IDEs

For IDEs that support MCP, add similar configuration pointing to:
- Command: `scopecraft-mcp` or `scopecraft-stdio`
- Arguments: `["--root-dir", "/your/project/path"]`

## Multi-Project Workflows

### Using Configuration File

Set up multiple projects in your config file:

```json
{
  "projects": {
    "frontend": {
      "path": "/projects/app/frontend"
    },
    "backend": {
      "path": "/projects/app/backend"
    },
    "docs": {
      "path": "/projects/app/docs"
    }
  }
}
```

### Switching Projects

```
# List available projects
list_projects

# Switch to a different project
init_root /projects/app/backend

# Verify the switch
get_current_root
```

### Project Templates

Create project templates in your config:

```json
{
  "projects": {
    "template-react": {
      "path": "/templates/react-starter",
      "description": "React project template"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Invalid project root" error**
   - Ensure the directory contains `.tasks` or `.ruru` folder
   - Check directory permissions
   - Verify the path is absolute, not relative

2. **"Cannot find project" error**
   - Check if SCOPECRAFT_ROOT is set incorrectly
   - Verify the current working directory
   - Use `get_current_root` to check active configuration

3. **Configuration not loading**
   - Check config file syntax (valid JSON)
   - Verify file permissions
   - Use `--config` to specify custom location

### Debugging Steps

1. Check current configuration:
   ```
   get_current_root
   ```

2. Verify project structure:
   ```bash
   ls -la /your/project/.tasks
   ```

3. Test with explicit path:
   ```bash
   scopecraft-mcp --root-dir /absolute/path/to/project
   ```

4. Check environment:
   ```bash
   echo $SCOPECRAFT_ROOT
   ```

## Best Practices

1. **Use absolute paths**: Always use absolute paths in configuration
2. **Validate projects**: Ensure projects have proper `.tasks` directory
3. **Document configuration**: Keep notes on project setup for team
4. **Test changes**: Verify configuration works before committing
5. **Use descriptive names**: Name projects clearly in config file

## Examples

### Basic Setup

```bash
# Install Scopecraft
npm install -g @scopecraft/cmd

# Start with specific project
scopecraft-mcp --root-dir /Users/me/projects/my-app

# Or use config file
echo '{
  "projects": {
    "my-app": {
      "path": "/Users/me/projects/my-app"
    }
  }
}' > ~/.scopecraft/config.json

scopecraft-mcp
```

### Team Setup

Share a configuration file with your team:

```json
{
  "version": "1.0.0",
  "projects": {
    "main-app": {
      "path": "${HOME}/work/main-app",
      "description": "Primary application"
    },
    "shared-libs": {
      "path": "${HOME}/work/shared-libs",
      "description": "Shared libraries"
    }
  },
  "defaultProject": "main-app"
}
```

### CI/CD Setup

```yaml
# GitHub Actions example
env:
  SCOPECRAFT_ROOT: ${{ github.workspace }}

steps:
  - uses: actions/checkout@v3
  - run: npm install -g @scopecraft/cmd
  - run: scopecraft task list
```

## Migration Guide

### From Manual Directory Navigation

Before:
```bash
cd /path/to/project
scopecraft task list
```

After:
```bash
scopecraft task list --root-dir /path/to/project
# Or set in config once
```

### From Environment Variables

Before:
```bash
export PROJECT_DIR=/path/to/project
cd $PROJECT_DIR
```

After:
```bash
export SCOPECRAFT_ROOT=/path/to/project
# Works from any directory
```

## Security Considerations

1. **Path validation**: Scopecraft validates all paths before use
2. **Permission checks**: Ensures read/write access to project directories
3. **No arbitrary execution**: Only accesses task-related files
4. **Sandboxed operations**: MCP server runs with limited permissions

## Performance Tips

1. **Use session configuration**: Reduces path resolution overhead
2. **Avoid switching frequently**: Each switch requires validation
3. **Keep projects local**: Network paths may slow operations
4. **Use SSD storage**: Improves task file access speed

## Future Enhancements

Planned improvements to project root configuration:

1. **Automatic project discovery**: Find projects without manual configuration
2. **Per-request overrides**: Switch projects for individual operations
3. **Workspace support**: Handle multi-root workspaces
4. **Project templates**: Initialize new projects from templates
5. **Smart switching**: Auto-detect project from context

## Get Help

- GitHub Issues: [Report bugs or request features](https://github.com/scopecraft/cmd/issues)
- Documentation: [Full documentation](https://docs.scopecraft.ai)
- Community: Join our Discord server