# MCP Configuration Commands

This document describes the Model Context Protocol (MCP) commands available for configuring project roots in Scopecraft. These commands enable AI IDEs to manage project contexts dynamically.

## Overview

The MCP configuration commands allow you to:
- Set project root directories for the current session
- Query the current root configuration
- List available projects from configuration files

## Available Commands

### init_root

Sets the project root directory for the current MCP session.

**Parameters:**
- `path` (string, required): Absolute path to the project directory

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "/path/to/project",
    "source": "session",
    "validated": true
  },
  "message": "Successfully set project root to: /path/to/project"
}
```

**Example:**
```json
{
  "method": "init_root",
  "params": {
    "path": "/Users/username/projects/my-project"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid project root: /invalid/path does not contain .tasks or .ruru directory"
}
```

### get_current_root

Retrieves the current project root configuration, including its source and validation status.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "/current/project/path",
    "source": "session|cli|environment|config_file|auto_detect",
    "validated": true,
    "projectName": "optional-project-name"
  },
  "message": "Current root: /current/project/path (source: session)"
}
```

**Example:**
```json
{
  "method": "get_current_root",
  "params": {}
}
```

### list_projects

Lists all projects configured in the Scopecraft configuration file.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "project1",
      "path": "/path/to/project1",
      "description": "First project"
    },
    {
      "name": "project2",
      "path": "/path/to/project2",
      "description": "Second project"
    }
  ],
  "message": "Found 2 configured projects"
}
```

**Example:**
```json
{
  "method": "list_projects",
  "params": {}
}
```

## Configuration Precedence

When determining the project root, Scopecraft follows this precedence order:

1. **Runtime**: Per-request override (if implemented)
2. **Session**: Set via `init_root` command
3. **CLI**: Command-line `--root-dir` parameter
4. **Environment**: `SCOPECRAFT_ROOT` environment variable
5. **Config File**: Projects in `~/.scopecraft/config.json`
6. **Auto-detect**: Current working directory

## Configuration File Format

The configuration file is located at `~/.scopecraft/config.json`:

```json
{
  "version": "1.0.0",
  "projects": [
    {
      "name": "project-name",
      "path": "/absolute/path/to/project",
      "description": "Optional project description"
    }
  ],
  "defaultProject": "project-name"
}
```

## Use Cases

### Switching Between Projects

```javascript
// List available projects
const projects = await mcp.list_projects();

// Switch to a specific project
await mcp.init_root({ path: projects.data[0].path });

// Verify the switch
const currentRoot = await mcp.get_current_root();
console.log(`Now working in: ${currentRoot.data.path}`);
```

### Validating Project Directories

```javascript
// Attempt to set an invalid root
const result = await mcp.init_root({ path: "/invalid/directory" });

if (!result.success) {
  console.error(result.error);
  // Output: Invalid project root: /invalid/directory does not contain .tasks or .ruru directory
}
```

### Working with Multiple AI IDEs

Each AI IDE can maintain its own session configuration:

1. Cursor IDE connects and sets root to `/projects/cursor-project`
2. Claude Desktop connects and sets root to `/projects/claude-project`
3. Each maintains independent session configuration

## Error Handling

All configuration commands return consistent error responses:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

Common errors:
- Invalid project path (missing .tasks or .ruru directory)
- Path does not exist
- Permission denied
- Configuration file parsing errors

## Integration with Task Operations

Once a root is configured, all task operations use that root:

```javascript
// Set project root
await mcp.init_root({ path: "/my/project" });

// Now task operations use the configured root
const tasks = await mcp.task_list();
// Returns tasks from /my/project/.tasks/
```

## Best Practices

1. **Always validate paths**: Use `init_root` to ensure the path contains a valid project structure
2. **Check current configuration**: Use `get_current_root` to verify the active project
3. **Handle errors gracefully**: Check the `success` field in responses
4. **Use config files**: Store frequently used projects in the configuration file
5. **Session persistence**: Remember that `init_root` configuration persists only for the current MCP session

## Testing

A test script is available at `scripts/test-mcp-config.ts` that demonstrates all configuration commands.

Run it with:
```bash
bun scripts/test-mcp-config.ts
```

## Future Enhancements

- Per-request root override support (pending MCP protocol capabilities)
- Automatic project discovery
- Project templates and initialization
- Multi-root workspace support