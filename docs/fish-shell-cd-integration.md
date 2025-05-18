# Fish Shell CD Integration for Task Worktrees

## Overview

The `tw-start` script has been modified to output the worktree directory path to stdout, allowing fish shell (or any shell) to capture this path and change to that directory.

## How It Works

1. The script creates the worktree as before
2. Installs dependencies 
3. Instead of launching Claude, it outputs the worktree path to stdout
4. The fish function captures this output and uses `cd` to change to that directory

## Fish Function

```fish
function tw-start
    # Run the bun script and capture the output
    set worktree_dir (bun run tw-start $argv | tail -n 1)
    
    # Check if the command was successful
    if test $status -eq 0
        # Change to the worktree directory
        cd $worktree_dir
        echo "Changed to worktree directory: $worktree_dir"
    else
        echo "Failed to create worktree"
        return 1
    end
end
```

## Usage

```fish
# In your fish shell
tw-start TASK-123456

# This will:
# 1. Create the worktree
# 2. Install dependencies
# 3. Change your current directory to the new worktree
```

## Installation

1. Copy the fish function to your fish config:
   ```bash
   cp scripts/fish-functions/tw-start.fish ~/.config/fish/functions/
   ```

2. Or run the setup script:
   ```bash
   bun scripts/setup-fish-integration.sh
   ```

The function will be available in all new fish shells. To use it immediately, source it:
```fish
source ~/.config/fish/functions/tw-start.fish
```