# Fish Shell Functions for Task Worktree Management

This directory contains fish shell functions that integrate with the roo-task-cli's worktree management system.

## Installation

1. Copy the fish functions to your fish configuration directory:
   ```fish
   cp scripts/fish-functions/*.fish ~/.config/fish/functions/
   ```

2. Or source them directly in your fish configuration:
   ```fish
   source /path/to/roo-task-cli/scripts/fish-functions/tw-start.fish
   ```

## Usage

### tw-start

Starts a task worktree and automatically changes to its directory:

```fish
# Start a specific task
tw-start TASK-20241231T123456

# The function will:
# 1. Create a new worktree for the task
# 2. Install dependencies
# 3. Change your terminal to the worktree directory
```

The function captures the worktree directory path output by the bun script and uses fish's built-in `cd` command to change to that directory in your current shell.

## How it Works

The modified `tw-start` bun script now:
1. Creates the worktree as before
2. Installs dependencies
3. Outputs the worktree directory path to stdout (without trailing messages)

The fish function:
1. Runs the bun script and captures the last line of output (the directory path)
2. Changes to that directory if the command was successful
3. Provides feedback about the directory change

This approach allows the script to change the parent shell's directory, which is not possible from within a subprocess.