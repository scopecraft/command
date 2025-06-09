# Quick Reference: Script to CLI Migration

This is a condensed reference for quickly translating old script commands to new CLI commands.

## Command Translation Table

| Old Script | New CLI Command | Options Available |
|-----------|----------------|-------------------|
| `./implement <mode> <taskId>` | `sc env <taskId>` | `--force`, `--base` |
| `./implement <mode> <taskId> "<instructions>"` | `sc work <taskId> "<instructions>"` | `--mode`, `--session`, `--dry-run` |
| `./dispatch` *(interactive)* | `sc work` *(interactive task selector)* | `--mode`, `--session` |
| `./dispatch <mode> <taskId>` | `sc dispatch <taskId>` | `--mode`, `--exec`, `--session`, `--dry-run` |
| `./dispatch list` | `sc env list` | `--format`, `--verbose` |
| *(no equivalent)* | `sc env close <taskId>` | `--force`, `--keep-branch` |
| *(no equivalent)* | `sc env path <taskId>` | *(outputs path for shell integration)* |

## Feature Comparison Chart

| Feature | Old Scripts | New CLI | Benefits |
|---------|------------|---------|----------|
| **Environment Management** | Manual worktree setup | Automatic with `sc env` | ✅ Integrated, safer, parent-aware |
| **Session Management** | Tmux windows only | Cross-platform sessions | ✅ Docker, tmux, detached modes |
| **Mode Selection** | Interactive gum menus | Flag-based `--mode` | ✅ Scriptable, explicit |
| **Error Handling** | Basic bash errors | Rich validation & tips | ✅ User-friendly, actionable |
| **Resumption** | Manual tmux attach | Session IDs | ✅ Cross-execution-type resume |
| **Dry Run** | Not available | `--dry-run` flag | ✅ Preview before execution |
| **Parent Tasks** | Not supported | Automatic detection | ✅ Subtasks share environments |

## Common Command Patterns

### Environment Setup
```bash
# Old: Manual process
git worktree add ../worktrees/TASK-123 -b TASK-123
cd ../worktrees/TASK-123
./implement typescript TASK-123

# New: One command
sc env TASK-123
```

### Interactive Development
```bash
# Old: Limited options
./implement typescript TASK-123 "Focus on API design"

# New: Rich options
sc work TASK-123 "Focus on API design" --mode exploration
sc work TASK-123 --session my-session  # Resume existing
sc work  # Interactive task selector
```

### Autonomous Execution
```bash
# Old: Complex dispatch script
./dispatch implement TASK-123

# New: Clean dispatch
sc dispatch TASK-123                    # Docker (default)
sc dispatch TASK-123 --exec tmux       # Tmux window
sc dispatch TASK-123 --exec detached   # Background
```

### Session Management
```bash
# Old: Manual tmux
./dispatch list
tmux attach -t scopecraft

# New: Built-in
sc env list
sc dispatch --session <session-id>
sc work --session <session-id>
```

## Essential Flags Reference

### Environment Commands (`sc env`)
- `--force` - Overwrite existing environment
- `--base <branch>` - Base branch for new worktree
- `--format json|table|minimal` - Output format for list
- `--verbose` - Show additional details

### Work Commands (`sc work`)
- `--mode <mode>` - Override mode (auto, exploration, implementation, etc.)
- `--session <id>` - Resume existing session
- `--dry-run` - Preview without execution
- `--no-docker` - Force interactive mode (default for work)

### Dispatch Commands (`sc dispatch`)
- `--mode <mode>` - Execution mode
- `--exec docker|tmux|detached` - Execution type
- `--session <id>` - Resume existing session
- `--dry-run` - Preview without execution

## Shell Integration Snippets

### Fish Shell
```fish
# Quick environment switching
function sc-cd
    set path (sc env path $argv[1])
    if test $status -eq 0
        cd $path
    end
end

# Quick work session with cd
function scw
    sc env $argv[1]
    sc-cd $argv[1]
    sc work $argv[1] $argv[2..]
end

# Quick dispatch
alias scd='sc dispatch'
```

### Bash/Zsh
```bash
# Environment switching
function sc-cd() {
    local path=$(sc env path $1)
    [ $? -eq 0 ] && cd "$path"
}

# Quick commands
alias scw='sc work'
alias scd='sc dispatch'
alias sce='sc env'

# Work with auto-cd
function scwork() {
    sc env $1 && sc-cd $1 && sc work $1 "${@:2}"
}
```

## Troubleshooting Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| "Task not found" | `sc task list` to see available tasks |
| "Environment already exists" | Use `--force` or `sc env close <taskId> --force` first |
| "No active environments" | Run `sc env <taskId>` to create one |
| "Session not found" | Check `sc env list` for active environments |
| "Worktree conflict" | Use `sc env close` to clean up conflicting paths |

## Migration Checklist

- [ ] Install new CLI (`npm install -g scopecraft`)
- [ ] Initialize project (`sc init`)
- [ ] Test basic commands (`sc task list`, `sc env list`)
- [ ] Set up shell integration (copy functions above)
- [ ] Migrate one workflow at a time
- [ ] Update team documentation
- [ ] Remove old scripts when comfortable

## Most Common Migrations

1. **Basic Implementation**
   - Old: `./implement typescript AUTH-001`
   - New: `sc env AUTH-001 && sc work AUTH-001`

2. **Autonomous Task**
   - Old: `./dispatch implement AUTH-001`
   - New: `sc dispatch AUTH-001`

3. **Session Resume**
   - Old: `tmux attach -t scopecraft`
   - New: `sc work --session <id>` or `sc dispatch --session <id>`

4. **Environment Cleanup**
   - Old: Manual worktree removal
   - New: `sc env close AUTH-001 --force`

## Tips for Success

1. **Start Simple**: Begin with `sc env` and `sc work` for basic workflows
2. **Use --dry-run**: Preview commands before running them
3. **Leverage Help**: Every command has `--help` for detailed options
4. **Shell Integration**: Set up the shell functions - they're game-changers
5. **One Task at a Time**: Migrate workflows gradually rather than all at once

## Need Help?

- `sc --help` - General help
- `sc <command> --help` - Command-specific help
- `docs/03-guides/migration-from-scripts.md` - Full migration guide
- `sc task list` - See what tasks are available to work on