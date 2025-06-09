# CLI Reference

Complete command-line interface documentation for ChannelCoder CLI.

## Installation

```bash
# Global installation
npm install -g channelcoder

# Or use with npx
npx channelcoder <command>
```

## Command Structure

```
channelcoder <command> [prompt-file] [options]
```

## Commands

### `channelcoder run`

Execute a prompt and print the result without interaction.

```bash
channelcoder run [prompt-file] [options]
```

**Examples:**
```bash
# Inline prompt
channelcoder run -p "Explain TypeScript"

# File-based prompt
channelcoder run prompts/analyze.md

# With data interpolation
channelcoder run analyze.md -d taskId=FEAT-123 -d priority=high

# JSON output
channelcoder run summary.md --json
```

**Options:**
| Option | Alias | Description |
|--------|-------|-------------|
| `--prompt` | `-p` | Inline prompt text instead of file |
| `--data` | `-d` | Data for template interpolation (repeatable) |
| `--system` | `-s` | System prompt (text or .md file path) |
| `--tools` | `-t` | Allowed tools (e.g., "Read Write") |
| `--disallowed-tools` | | Disallowed tools (comma-separated) |
| `--append-system` | | Append text to system prompt |
| `--mcp-config` | | Load MCP servers from JSON file |
| `--permission-tool` | | MCP tool for permission prompts |
| `--resume` | `-r` | Resume conversation by session ID |
| `--continue` | `-c` | Continue most recent conversation |
| `--max-turns` | | Limit agentic turns (number) |
| `--json` | | Output JSON format |
| `--verbose` | `-v` | Verbose output |
| `--worktree` | | Run in git worktree |
| `--docker` | | Run in Docker container |
| `--docker-image` | | Specify Docker image |
| `--session` | | Save to named session |
| `--load-session` | | Load and continue named session |
| `--detached` | | Run in background |
| `--log` | | Log file path (for detached mode) |

### `channelcoder interactive`

Launch Claude in interactive mode (default command).

```bash
channelcoder interactive [prompt-file] [options]
# Or simply:
channelcoder [prompt-file] [options]
```

**Examples:**
```bash
# Start interactive session
channelcoder interactive

# With initial prompt
channelcoder interactive "Help me debug this issue"

# Resume session
channelcoder interactive --resume abc123
```

**Options:** Same as `run` command

### `channelcoder stream`

Stream responses in real-time.

```bash
channelcoder stream [prompt-file] [options]
```

**Examples:**
```bash
# Stream inline prompt
channelcoder stream -p "Write a story about AI"

# Stream file prompt
channelcoder stream generate-docs.md

# Stream with data
channelcoder stream template.md -d topic="Machine Learning"
```

**Options:** Same as `run` command

### `channelcoder session`

Manage conversation sessions.

```bash
channelcoder session <subcommand>
```

#### `session list`

List all saved sessions.

```bash
channelcoder session list
```

**Output:**
```
Available sessions:
  feature-auth (5 messages, last active: 2024-01-15 10:30)
  bug-fix-123 (12 messages, last active: 2024-01-14 15:45)
  api-design (3 messages, last active: 2024-01-13 09:00)
```

#### `session load`

Load and continue a saved session.

```bash
channelcoder session load <session-name>
```

**Examples:**
```bash
# Load session interactively
channelcoder session load feature-auth

# Load and run command
channelcoder session load feature-auth -p "Add error handling"
```

#### `session remove`

Remove a saved session.

```bash
channelcoder session remove <session-name>
```

**Examples:**
```bash
# Remove single session
channelcoder session remove old-feature

# Remove with confirmation
channelcoder session remove important-session
```

### `channelcoder worktree`

Manage git worktrees for isolated development.

```bash
channelcoder worktree <subcommand>
```

#### `worktree list`

List all git worktrees.

```bash
channelcoder worktree list
```

**Output:**
```
Git worktrees:
  /Users/you/project (branch: main) [main worktree]
  /Users/you/project/.worktrees/feature-auth (branch: feature/auth)
  /Users/you/project/.worktrees/bugfix-memory (branch: bugfix/memory-leak)
```

#### `worktree create`

Create a new worktree.

```bash
channelcoder worktree create <branch-name> [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--base` | Base branch to create from (default: current) |
| `--path` | Custom worktree path |

**Examples:**
```bash
# Create from main
channelcoder worktree create feature/new-ui --base main

# Custom path
channelcoder worktree create experiment/test --path /tmp/experiment
```

#### `worktree remove`

Remove a worktree.

```bash
channelcoder worktree remove <branch-name>
```

**Examples:**
```bash
channelcoder worktree remove feature/old
```

#### `worktree cleanup`

Clean up orphaned worktrees.

```bash
channelcoder worktree cleanup
```

## Global Options

These options work with all commands:

| Option | Alias | Description |
|--------|-------|-------------|
| `--help` | `-h` | Show help for command |
| `--version` | `-v` | Show version number |

## Data Interpolation

The `--data` flag supports various formats:

```bash
# Simple key-value
channelcoder run prompt.md -d name=John

# Multiple values
channelcoder run prompt.md -d name=John -d age=30

# JSON values
channelcoder run prompt.md -d 'user={"name":"John","age":30}'

# Arrays
channelcoder run prompt.md -d 'items=["apple","banana","orange"]'

# Boolean values
channelcoder run prompt.md -d verbose=true -d debug=false
```

## Tool Patterns

The `--tools` flag supports patterns:

```bash
# Specific tools
channelcoder run task.md -t "Read Write"

# Tool with pattern
channelcoder run task.md -t "Bash(git:*)"  # All git commands

# Multiple patterns
channelcoder run task.md -t "Bash(git:*) Bash(npm:test) Read"

# Disallow specific patterns
channelcoder run task.md --disallowed-tools "Bash(rm:*),Bash(git:push)"
```

## Environment Variables

ChannelCoder respects these environment variables:

| Variable | Description |
|----------|-------------|
| `CHANNELCODER_SESSION_DIR` | Custom session storage directory |
| `CHANNELCODER_DOCKER_IMAGE` | Default Docker image |
| `ANTHROPIC_API_KEY` | Claude API key (if not configured) |

## Configuration Files

### Prompt Files

Markdown files with YAML frontmatter:

```markdown
---
systemPrompt: "You are a helpful assistant"
allowedTools:
  - Read
  - Write
  - "Bash(git:*)"
input:
  name: string
  optional?: boolean
output:
  result: string
---

# Your prompt here

Hello {name}!
```

### MCP Configuration

JSON file for MCP servers:

```json
{
  "servers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["--readonly", "/path/to/files"]
    }
  }
}
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | File not found |
| 4 | Session error |
| 5 | Docker error |
| 130 | Interrupted (Ctrl+C) |

## Examples

### Complex Workflow

```bash
# Create worktree for feature
channelcoder worktree create feature/auth --base main

# Start session in worktree
channelcoder run "Design auth system" \
  --worktree feature/auth \
  --session auth-design \
  --tools "Read Write" \
  --system "You are a security expert"

# Continue development
channelcoder run "Implement JWT tokens" \
  --load-session auth-design \
  --max-turns 10

# Run in Docker for testing
channelcoder run "Test auth system" \
  --load-session auth-design \
  --docker \
  --tools "Read Bash(npm:test)"
```

### Monitoring Background Task

```bash
# Start detached session
channelcoder run "Analyze large codebase" \
  --detached \
  --log analysis.log \
  --stream

# Monitor progress
tail -f analysis.log | jq -r '.content'

# Check completion
tail analysis.log | jq -r 'select(.type=="result")'
```

### Template Processing

```bash
# Create template file
cat > greet.md << EOF
---
input:
  name: string
  language?: string
---
Generate a greeting for {name} in {language || "English"}
EOF

# Use template
channelcoder run greet.md -d name=Alice -d language=French
```

## Tips

1. **Default Command**: `channelcoder` without a command runs `interactive`
2. **Session Persistence**: Use `--session` to save conversations
3. **Dry Run**: Set `CHANNELCODER_DRY_RUN=true` to see commands without execution
4. **Debugging**: Use `-v` or `--verbose` for detailed output
5. **JSON Output**: Use `--json` for scripting and automation

## See Also

- [Docker Mode Guide](../guides/docker-mode.md)
- [Worktree Mode Guide](../guides/worktree-mode.md)
- [Session Management Guide](../guides/session-management.md)
- [Examples](../../examples/)