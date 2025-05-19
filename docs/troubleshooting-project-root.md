# Troubleshooting Project Root Configuration

This guide helps you resolve common issues when configuring project roots in Scopecraft for different AI IDEs.

## Common Issues and Solutions

### 1. "Invalid project root" Error

**Symptoms:**
```
Error: Invalid project root: /path/to/project does not contain .tasks or .ruru directory
```

**Solutions:**

1. **Verify directory structure**:
   ```bash
   ls -la /path/to/project/.tasks
   ```
   
2. **Initialize the project**:
   ```bash
   cd /path/to/project
   mkdir .tasks
   # Or use Scopecraft init command
   scopecraft init
   ```

3. **Check path format**:
   - Use absolute paths: `/Users/username/project`
   - Avoid relative paths: `./project` or `../project`
   - Expand home directory: Use `/Users/username` instead of `~`

### 2. Configuration Not Loading

**Symptoms:**
- Commands use wrong project directory
- Config file settings ignored
- `get_current_root` shows unexpected path

**Solutions:**

1. **Check config file syntax**:
   ```bash
   # Validate JSON syntax
   cat ~/.scopecraft/config.json | jq .
   ```

2. **Verify file permissions**:
   ```bash
   ls -la ~/.scopecraft/config.json
   # Should be readable by current user
   ```

3. **Use explicit config path**:
   ```bash
   scopecraft-mcp --config /absolute/path/to/config.json
   ```

### 3. MCP Server Connection Issues

**Symptoms:**
- AI IDE can't connect to Scopecraft
- Commands timeout or fail
- "Server not responding" errors

**Solutions:**

1. **Check server is running**:
   ```bash
   # Check if process is running
   ps aux | grep scopecraft-mcp
   ```

2. **Verify MCP configuration**:
   ```json
   {
     "scopecraft": {
       "command": "scopecraft-mcp",
       "args": ["--root-dir", "/absolute/path/to/project"]
     }
   }
   ```

3. **Test with simple command**:
   ```bash
   # Test basic functionality
   scopecraft-mcp --root-dir /path/to/project --help
   ```

### 4. Wrong Project Directory

**Symptoms:**
- Tasks from wrong project appear
- Changes saved to incorrect location
- Unexpected file paths in results

**Solutions:**

1. **Check current configuration**:
   ```
   get_current_root
   ```

2. **Verify precedence order**:
   - Session (init_root) overrides all
   - CLI parameters override environment
   - Environment overrides config file
   
3. **Clear session configuration**:
   - Restart MCP server
   - Use new `init_root` command

### 5. Permission Denied Errors

**Symptoms:**
```
Error: Permission denied accessing /path/to/project
```

**Solutions:**

1. **Check directory permissions**:
   ```bash
   ls -la /path/to/project
   # User should have read/write access
   ```

2. **Fix permissions**:
   ```bash
   chmod -R u+rw /path/to/project/.tasks
   ```

3. **Run with correct user**:
   - Ensure AI IDE runs as your user
   - Check process ownership

### 6. Environment Variable Issues

**Symptoms:**
- `SCOPECRAFT_ROOT` not recognized
- Environment settings ignored
- Inconsistent behavior

**Solutions:**

1. **Verify environment variable**:
   ```bash
   echo $SCOPECRAFT_ROOT
   ```

2. **Set correctly for your shell**:
   ```bash
   # Bash/Zsh
   export SCOPECRAFT_ROOT=/path/to/project
   
   # Fish
   set -x SCOPECRAFT_ROOT /path/to/project
   ```

3. **Check IDE environment**:
   - Some IDEs don't inherit shell environment
   - Set in IDE configuration instead

### 7. Multi-Project Confusion

**Symptoms:**
- Projects mixed up
- Wrong project selected
- Switching doesn't work

**Solutions:**

1. **List available projects**:
   ```
   list_projects
   ```

2. **Explicitly set project**:
   ```
   init_root /specific/project/path
   ```

3. **Check config file**:
   ```json
   {
     "projects": {
       "project1": { "path": "/path1" },
       "project2": { "path": "/path2" }
     },
     "defaultProject": "project1"
   }
   ```

## Debugging Steps

### 1. Enable Verbose Logging

```bash
# Run with debug output
SCOPECRAFT_DEBUG=true scopecraft-mcp --root-dir /path/to/project
```

### 2. Test Configuration Layers

Test each configuration method separately:

```bash
# 1. Test CLI parameter
scopecraft task list --root-dir /test/path

# 2. Test environment variable
export SCOPECRAFT_ROOT=/test/path
scopecraft task list

# 3. Test config file
echo '{"projects":{"test":{"path":"/test/path"}}}' > test-config.json
scopecraft task list --config test-config.json
```

### 3. Verify File System

```bash
# Check if path exists
test -d /path/to/project && echo "Directory exists"

# Check if .tasks exists
test -d /path/to/project/.tasks && echo ".tasks exists"

# Check permissions
ls -la /path/to/project/.tasks
```

### 4. Test MCP Commands

```javascript
// Test basic MCP functionality
await mcp.get_current_root();
await mcp.list_projects();
await mcp.init_root({ path: "/test/path" });
```

## IDE-Specific Issues

### Cursor

**Issue**: Configuration not loaded
```json
// Check .cursor/mcp.json
{
  "servers": {
    "scopecraft": {
      "command": "scopecraft-mcp",
      "args": ["--root-dir", "/absolute/path"]
    }
  }
}
```

### Claude Desktop

**Issue**: STDIO transport problems
```json
// Use STDIO-specific server
{
  "scopecraft": {
    "command": "scopecraft-stdio",
    "args": ["--root-dir", "/absolute/path"]
  }
}
```

### VS Code

**Issue**: Extension conflicts
- Disable conflicting extensions
- Check extension settings
- Verify MCP extension configuration

## Performance Issues

### Slow Performance

1. **Check network paths**:
   - Avoid network drives
   - Use local paths when possible

2. **Reduce task count**:
   - Archive old tasks
   - Use phase filtering

3. **Optimize file system**:
   - Use SSD storage
   - Avoid deep nesting

### Memory Issues

1. **Large projects**:
   - Increase IDE memory limits
   - Use filtering in queries

2. **Too many open files**:
   - Close unused projects
   - Restart MCP server periodically

## Getting Help

### Collect Debug Information

When reporting issues, include:

1. **System information**:
   ```bash
   scopecraft --version
   node --version
   echo $SHELL
   ```

2. **Configuration**:
   ```bash
   cat ~/.scopecraft/config.json
   echo $SCOPECRAFT_ROOT
   ```

3. **Error messages**:
   - Full error text
   - Command that caused error
   - Steps to reproduce

### Report Issues

- GitHub: [Create an issue](https://github.com/scopecraft/cmd/issues)
- Include debug information
- Describe expected vs actual behavior

## Prevention Tips

1. **Always use absolute paths**
2. **Test configuration before committing**
3. **Document your setup for team**
4. **Keep backups of config files**
5. **Use version control for configs**

## Quick Reference

### Check Current Setup
```bash
# Current configuration
get_current_root

# Available projects
list_projects

# Test connection
scopecraft-mcp --help
```

### Reset Configuration
```bash
# Clear environment
unset SCOPECRAFT_ROOT

# Remove config
rm ~/.scopecraft/config.json

# Restart server
# (Kill process and restart)
```

### Common Fixes
```bash
# Fix permissions
chmod -R u+rw .tasks

# Create missing directory
mkdir -p .tasks

# Validate JSON config
cat config.json | jq .

# Test with explicit path
scopecraft --root-dir $(pwd) task list
```