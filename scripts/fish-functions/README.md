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
   source /path/to/roo-task-cli/scripts/fish-functions/tw-feat-start.fish
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

### tw-feat-start

Starts a feature worktree and automatically changes to its directory:

```fish
# Start a specific feature
tw-feat-start FEATURE_auth

# The function will:
# 1. Create a new worktree for the entire feature
# 2. Install dependencies
# 3. Change your terminal to the worktree directory
```

This is useful when you want to work on an entire feature rather than individual tasks. The worktree will be named after the feature, and you can use `/project:implement-next` to automatically find and implement the next task in the feature.

## How it Works

The modified worktree scripts now:
1. Create the worktree as before
2. Install dependencies
3. Output the worktree directory path to stdout (without trailing messages)

The fish functions:
1. Run the bun script and capture the last line of output (the directory path)
2. Change to that directory if the command was successful
3. Provide feedback about the directory change

This approach allows the script to change the parent shell's directory, which is not possible from within a subprocess.