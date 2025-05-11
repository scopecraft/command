# Task Worktree Usage Guide

This utility allows you to work on multiple tasks in parallel with git worktrees, each with its own isolated environment.

## Setup

The task worktree utility is built into Scopecraft Command. To use it:

1. Make sure the Claude slash command is set up:
   ```bash
   mkdir -p .claude/commands
   ```

2. The `.claude/commands/task-context.md` slash command is already created and will help provide task context to Claude.

## Commands

### List Tasks and Worktrees

```bash
# List available tasks
bun run dev:cli -- list --status "🟡 To Do"
bun run dev:cli -- next-task

# List existing worktrees
bun run tw-list
```

### Start Working on a Task

```bash
# Start working on a specific task
bun run tw-start TASK-ID

# Without a task ID, it will show available tasks and prompt for selection
bun run tw-start
```

This command will:
1. Create a new git worktree in `../roo-task-cli.worktrees/TASK-ID/`
2. Create a new branch named after the task ID
3. Mark the task as "In Progress"
4. Launch Claude Code in the worktree directory

When Claude Code launches, use this slash command to get task context:
```
/project:task-context TASK-ID
```

### Finish Working on a Task

```bash
# Recommended: Finish the task from the main repository
cd /Users/davidpaquet/Projects/roo-task-cli
bun run tw-finish TASK-ID

# Alternative: You can also run from within the worktree
# The script will delegate to the main repository automatically
cd /Users/davidpaquet/Projects/roo-task-cli.worktrees/TASK-ID
bun run tw-finish
```

This command will:
1. Check for uncommitted changes
2. Remove the worktree
3. Provide instructions for updating the task status in your branch
4. Provide instructions for creating a PR

## Options

The `start` command supports these options:
- `--no-claude`: Create the worktree but don't launch Claude automatically

## Workflow Example

```bash
# Start working on a task (installs dependencies and launches Claude)
bun run tw-start TASK-MCP-ERROR-HANDLING

# Work on the task in Claude using the task context command
/project:task-context TASK-MCP-ERROR-HANDLING

# When done, update the task status in your branch
cd /Users/davidpaquet/Projects/roo-task-cli.worktrees/TASK-MCP-ERROR-HANDLING
bun run dev:cli -- update TASK-MCP-ERROR-HANDLING --status "🟢 Done"

# Commit your changes in the worktree
git add .
git commit -m "Implement error handling for MCP server and mark task as completed"
git push -u origin TASK-MCP-ERROR-HANDLING

# Remove the worktree when done
cd /Users/davidpaquet/Projects/roo-task-cli
bun run tw-finish TASK-MCP-ERROR-HANDLING

# Create a PR using GitHub CLI (if installed)
gh pr create --base main --head TASK-MCP-ERROR-HANDLING
```

## Best Practices

1. **Commit often**: Make frequent, small commits to save your progress
2. **Push before finishing**: Always push your branch before removing the worktree
3. **One task at a time**: Try to complete tasks before starting new ones
4. **Clean up**: Use `git worktree prune` occasionally to clean up stale worktree metadata

## Troubleshooting

- **Error creating worktree**: Ensure you don't already have a worktree for the same task
- **Cannot remove worktree**: Make sure there are no uncommitted changes
- **Claude not launching**: Ensure Claude Code is installed and accessible in your PATH