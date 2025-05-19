# Claude Desktop Setup Guide

This guide helps you configure Scopecraft to work with Claude Desktop application.

## Prerequisites

- Scopecraft installed globally: `npm install -g @scopecraft/cmd`
- Claude Desktop installed
- A project with `.tasks` directory

## Configuration Steps

### Step 1: Open Claude Desktop Settings

1. Open Claude Desktop
2. Go to Preferences (Cmd+, on Mac, Ctrl+, on Windows/Linux)
3. Navigate to Developer → MCP Servers

### Step 2: Add Scopecraft Configuration

Add the following configuration:

```json
{
  "scopecraft": {
    "command": "scopecraft-mcp",
    "args": ["--root-dir", "/path/to/your/project"]
  }
}
```

### Step 3: Alternative Transport Options

#### Using STDIO Transport (Recommended)

For better performance and stability:

```json
{
  "scopecraft": {
    "command": "scopecraft-stdio",
    "args": ["--root-dir", "/path/to/your/project"],
    "transport": "stdio"
  }
}
```

#### Using Configuration File

1. Create `~/.scopecraft/config.json`:
```json
{
  "version": "1.0.0",
  "projects": {
    "main": {
      "path": "/Users/username/projects/main",
      "description": "Main project"
    },
    "docs": {
      "path": "/Users/username/projects/docs",
      "description": "Documentation project"
    }
  },
  "defaultProject": "main"
}
```

2. Update Claude Desktop config:
```json
{
  "scopecraft": {
    "command": "scopecraft-stdio",
    "args": ["--config", "/Users/username/.scopecraft/config.json"]
  }
}
```

### Step 4: Restart and Verify

1. Restart Claude Desktop
2. In a new conversation, type:
   ```
   get_current_root
   ```
3. Should see your configured project path

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

## Multiple Project Setup

### Method 1: Quick Switching

Use the `init_root` command to switch between projects:

```
# Switch to frontend project
init_root /projects/myapp/frontend

# Work on frontend tasks
task list

# Switch to backend project
init_root /projects/myapp/backend

# Work on backend tasks
task list
```

### Method 2: Multiple Instances

Configure multiple Scopecraft instances:

```json
{
  "scopecraft-frontend": {
    "command": "scopecraft-stdio",
    "args": ["--root-dir", "/projects/frontend"]
  },
  "scopecraft-backend": {
    "command": "scopecraft-stdio",
    "args": ["--root-dir", "/projects/backend"]
  }
}
```

### Method 3: Configuration File

Set up all projects in a config file and switch as needed:

```json
{
  "version": "1.0.0",
  "projects": {
    "frontend": {
      "path": "/projects/myapp/frontend",
      "description": "React frontend"
    },
    "backend": {
      "path": "/projects/myapp/backend",
      "description": "Node.js API"
    },
    "mobile": {
      "path": "/projects/myapp/mobile",
      "description": "React Native app"
    }
  }
}
```

## Tips for Claude Desktop Users

### 1. Conversation Context

Start conversations with project context:

```
I'm working on the project at /projects/myapp.
Set it as the current root: init_root /projects/myapp

Now let's look at the current tasks: task list
```

### 2. Task References

Reference tasks naturally in conversation:

```
I need to implement the feature from TASK-001. 
Can you help me understand the requirements?

task get TASK-001
```

### 3. Progress Updates

Keep tasks updated as you work:

```
I've started working on TASK-001
task update TASK-001 --status "In Progress"

Now I've completed the implementation
task update TASK-001 --status "Done"
```

## Troubleshooting

### Connection Issues

1. **Check installation**:
   ```bash
   which scopecraft-stdio
   ```

2. **Test manually**:
   ```bash
   scopecraft-stdio --root-dir /your/project
   ```

3. **Check logs**:
   - Claude Desktop logs available in Help → View Logs

### Path Resolution

1. **Use absolute paths**:
   ```json
   {
     "args": ["--root-dir", "/absolute/path/to/project"]
   }
   ```

2. **Expand home directory**:
   - Use `/Users/username` instead of `~`
   - Or use `$HOME` in environment variables

3. **Verify path exists**:
   ```bash
   ls -la /path/to/project/.tasks
   ```

### Permission Issues

1. **Check file permissions**:
   ```bash
   chmod -R u+rw /path/to/project/.tasks
   ```

2. **Ensure Claude Desktop has access**:
   - Grant file system permissions if prompted
   - Check security settings

### Performance Issues

1. **Use STDIO transport**: More efficient than HTTP
2. **Limit task queries**: Use filters to reduce data
3. **Close unused projects**: Don't keep too many projects open

## Advanced Configuration

### Environment Variables

```json
{
  "scopecraft": {
    "command": "scopecraft-stdio",
    "args": ["--root-dir", "/projects/myapp"],
    "env": {
      "NODE_ENV": "development",
      "SCOPECRAFT_LOG_LEVEL": "info"
    }
  }
}
```

### Custom Working Directory

```json
{
  "scopecraft": {
    "command": "scopecraft-stdio",
    "args": ["--root-dir", "./projects/myapp"],
    "cwd": "/Users/username"
  }
}
```

### Timeout Configuration

```json
{
  "scopecraft": {
    "command": "scopecraft-stdio",
    "args": ["--root-dir", "/projects/myapp"],
    "timeout": 30000
  }
}
```

## Best Practices

1. **Start conversations with context**: Always set or verify the project root
2. **Use descriptive task titles**: Makes conversation references clearer
3. **Update tasks regularly**: Keep status current for accurate context
4. **Organize with features**: Group related tasks for better organization
5. **Document in tasks**: Add implementation notes directly to tasks

## Quick Commands Reference

```
# Project Management
get_current_root              # Check current project
init_root /path              # Set project root
list_projects                # Show configured projects

# Task Operations
task list                    # List all tasks
task create "Title"          # Create new task
task get TASK-001           # View task details
task update TASK-001        # Update task

# Feature Management
feature list                 # List features
feature create "Name"        # Create feature
feature get FEATURE_x        # View feature
```

## Workflow Examples

### Starting a New Feature

```
# 1. Set project context
init_root /projects/myapp

# 2. Create feature
feature create "User Authentication"

# 3. List feature tasks
feature get FEATURE_auth

# 4. Work on first task
task get TASK-001
task update TASK-001 --status "In Progress"
```

### Daily Standup

```
# Check current tasks
task list --assignee me --status "In Progress"

# Review completed yesterday
task list --status "Done" --updated "yesterday"

# Plan today's work
task list --status "To Do" --priority "High"
```

## Integration Tips

### With Code Generation

```
Generate code for TASK-001 implementing the user login feature.
First, let me check the requirements:

task get TASK-001
```

### With Documentation

```
Create documentation for all completed tasks in FEATURE_auth:

feature get FEATURE_auth
task list --parent FEATURE_auth --status "Done"
```

### With Code Review

```
Review this code against the requirements in TASK-001:

task get TASK-001
[paste code here]
```

## Getting Help

- Claude Desktop documentation
- Scopecraft documentation: `docs/`
- GitHub Issues: [Report problems](https://github.com/scopecraft/cmd/issues)
- Community support: [Discord](https://discord.gg/scopecraft)