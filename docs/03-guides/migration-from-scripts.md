# Migration Guide: From Shell Scripts to Unified CLI

This guide helps you transition from the old shell scripts (`implement`, `dispatch`) to the new unified Scopecraft CLI commands.

## Overview

The new CLI provides a unified, composable command structure that replaces the old script-based approach with better error handling, session management, and explicit control over your development workflow.

## Quick Command Reference

| Old Command | New Command | Purpose |
|------------|-------------|---------|
| `./implement <mode> <taskId>` | `sc env <taskId>` | Create/switch to task environment |
| `./dispatch <taskId>` | `sc dispatch <taskId>` | Run autonomous task execution |
| *(work script missing)* | `sc work <taskId>` | Interactive development session |

## Detailed Migration Guide

### 1. Environment Management (formerly `implement`)

#### Old: `./implement` Script
```bash
# Old way - basic channelcoder execution
./implement typescript AUTH-001
./implement typescript AUTH-001 "Focus on error handling"
```

**Problems with old approach:**
- Limited to simple channelcoder execution
- No environment management
- No session tracking
- Mode hardcoded in command

#### New: `sc env` Command
```bash
# New way - comprehensive environment management
sc env AUTH-001                    # Create/switch to task environment
sc env list                       # List all active environments
sc env close AUTH-001 --force     # Clean up environment
sc env path AUTH-001              # Get path for shell integration
```

**Benefits of new approach:**
- Automatic worktree creation and management
- Parent/subtask awareness (subtasks share parent environment)
- Environment isolation and cleanup
- Shell integration support

### 2. Autonomous Execution (formerly `dispatch`)

#### Old: `./dispatch` Script
The old dispatch script was complex with tmux session management, gum UI, and mode selection.

```bash
# Old way - interactive tmux-based execution
./dispatch                        # Interactive menu
./dispatch implement AUTH-001     # Direct mode execution
./dispatch list                   # List active sessions
```

**Limitations of old approach:**
- Complex dependency on tmux, gum, and channelcoder
- Mode selection through interactive menus
- Manual worktree management
- Session management limited to tmux windows

#### New: `sc dispatch` Command
```bash
# New way - clean autonomous execution
sc dispatch AUTH-001                           # Docker execution (default)
sc dispatch AUTH-001 --mode orchestration     # Specific mode
sc dispatch AUTH-001 --exec tmux              # Tmux execution
sc dispatch AUTH-001 --exec detached          # Detached process
sc dispatch --session my-session-id           # Resume session
sc dispatch AUTH-001 --dry-run               # Preview execution
```

**Benefits of new approach:**
- Multiple execution types (docker, tmux, detached)
- Automatic environment management
- Session resumption capability
- Better error handling and validation
- Mode selection via flags rather than interactive menus

### 3. Interactive Development (new: `sc work`)

The old system didn't have a dedicated work command. This is new functionality.

```bash
# Interactive development sessions
sc work AUTH-001                               # Interactive Claude session
sc work AUTH-001 "Focus on API design"        # With additional context
sc work --mode exploration                    # Specific mode
sc work --session my-session                  # Resume session
sc work                                       # Interactive task selector
```

**New capabilities:**
- Interactive task selection when no ID provided
- Automatic environment setup
- Session management and resumption
- Mode integration with task context

## Common Migration Scenarios

### Scenario 1: Basic Task Implementation

**Old workflow:**
```bash
# 1. Manual worktree setup (if used)
git worktree add ../task-worktrees/AUTH-001 -b AUTH-001

# 2. Change directory
cd ../task-worktrees/AUTH-001

# 3. Run implement script
./implement typescript AUTH-001
```

**New workflow:**
```bash
# All-in-one command handles worktree, environment, and execution
sc env AUTH-001        # Creates environment if needed
sc work AUTH-001       # Start interactive session
# OR
sc dispatch AUTH-001   # Start autonomous execution
```

### Scenario 2: Session Management

**Old workflow:**
```bash
# Complex tmux session management
./dispatch            # Interactive menu to find sessions
# Manual tmux attach/detach
tmux attach -t scopecraft
```

**New workflow:**
```bash
# Clean session management
sc work AUTH-001 --session my-session     # Resume interactive
sc dispatch --session my-session          # Resume autonomous
sc env list                               # See all environments
```

### Scenario 3: Mode Selection

**Old workflow:**
```bash
# Mode hardcoded in script call
./implement typescript AUTH-001
./implement planning AUTH-001
```

**New workflow:**
```bash
# Mode specified via flags
sc work AUTH-001 --mode typescript
sc work AUTH-001 --mode exploration
sc dispatch AUTH-001 --mode orchestration
```

## Breaking Changes

### Command Structure Changes

1. **Unified Binary**: All commands now use `sc` instead of individual scripts
2. **Explicit Flags**: Options are now explicit flags rather than positional arguments
3. **Environment Separation**: Environment management is separate from execution

### Environment Management Changes

1. **Automatic Worktree Management**: No manual worktree setup required
2. **Parent Task Environments**: Subtasks automatically use parent task environments
3. **Environment Isolation**: Each task gets its own isolated environment

### Session Management Changes

1. **Session IDs**: Sessions are tracked by ID rather than tmux window names
2. **Cross-Execution-Type Sessions**: Sessions work across docker, tmux, and detached modes
3. **Automatic Cleanup**: Better cleanup of abandoned sessions

## New Features

### 1. Parent Task Awareness
```bash
# Subtasks automatically use parent environments
sc env PARENT-001-subtask-1  # Uses PARENT-001 environment
```

### 2. Multiple Execution Types
```bash
# Choose your execution environment
sc dispatch AUTH-001 --exec docker     # Isolated Docker execution
sc dispatch AUTH-001 --exec tmux       # Tmux window
sc dispatch AUTH-001 --exec detached   # Background process
```

### 3. Dry Run Support
```bash
# Preview what will be executed
sc work AUTH-001 --dry-run
sc dispatch AUTH-001 --dry-run
```

### 4. Enhanced Error Handling
- Clear error messages with helpful tips
- Validation before execution
- Graceful fallbacks

## Shell Integration

### Fish Shell Functions (Recommended)

Add to your Fish config:

```fish
# Quick environment switching
function sc-cd
    set path (sc env path $argv[1])
    if test $status -eq 0
        cd $path
    end
end

# Quick work session
function sc-work-cd
    sc env $argv[1]
    sc-cd $argv[1]
    sc work $argv[1] $argv[2..]
end
```

### Bash/Zsh Aliases

Add to your shell config:

```bash
# Quick commands
alias scw='sc work'
alias scd='sc dispatch'
alias sce='sc env'

# Environment switching
function sc-cd() {
    local path=$(sc env path $1)
    if [ $? -eq 0 ]; then
        cd "$path"
    fi
}
```

## Troubleshooting

### Common Issues

#### "Task not found" Error
```bash
# Old: No clear error handling
./implement typescript NONEXISTENT

# New: Clear error with suggestions
$ sc env NONEXISTENT
Error: Task 'NONEXISTENT' not found
  Task not found in any workflow location

Tip: Use "sc task list" to see available tasks
```

#### Environment Conflicts
```bash
# Old: Manual conflict resolution required
git worktree add: fatal: 'path' already exists

# New: Automatic detection with options
$ sc env AUTH-001
Error: Environment already exists
  Path: /Users/user/Projects/scope.worktrees/AUTH-001

Tip: Use --force to overwrite existing path
```

#### Session Management
```bash
# Old: Manual tmux session tracking
tmux list-sessions | grep scopecraft

# New: Built-in session management
sc env list                    # See all environments
sc dispatch --session <id>    # Resume specific session
```

### Migration Tips

1. **Start with `sc env`**: Always create your environment first
2. **Use `sc task list`**: Discover available tasks before working
3. **Try `--dry-run`**: Preview commands before execution
4. **Set up shell integration**: Use the recommended shell functions
5. **Gradual transition**: Keep old scripts during transition period

## FAQ

### Q: Can I use both old and new systems simultaneously?
A: Yes, but be careful with worktree conflicts. The new system creates worktrees in the same locations.

### Q: How do I migrate existing tmux sessions?
A: The new system uses its own session management. You'll need to complete existing tmux sessions and start fresh with the new commands.

### Q: What happened to the gum interactive menus?
A: The new CLI provides better error messages and help text instead of interactive menus. Use `sc work` without arguments for task selection.

### Q: Can I still use the old mode system?
A: Yes, modes work the same way but are specified via `--mode` flags instead of positional arguments.

### Q: How do I handle additional instructions?
A: Pass them as additional arguments: `sc work AUTH-001 "Focus on error handling"`

## Next Steps

1. **Install the new CLI**: Follow the installation guide
2. **Initialize your project**: Run `sc init` in your project root
3. **Try basic commands**: Start with `sc task list` and `sc env`
4. **Set up shell integration**: Add the recommended functions to your shell
5. **Gradually migrate workflows**: Replace old script usage with new commands
6. **Remove old scripts**: Once comfortable, remove the old scripts from your project

## Support

For additional help:
- Run any command with `--help` for detailed usage
- Check the documentation in `docs/` for comprehensive guides
- Use `sc task list` to explore available tasks
- Use `sc env list` to see active environments

The new CLI is designed to be more predictable, composable, and user-friendly than the old script-based approach while providing enhanced functionality for modern development workflows.