#!/usr/bin/env fish
# Fish shell function to start a feature worktree and change to its directory

function tw-feat-start
    # Run the bun script and capture the output
    set worktree_dir (bun run tw-feat-start $argv | tail -n 1)
    
    # Check if the command was successful
    if test $status -eq 0
        # Change to the worktree directory
        cd $worktree_dir
        echo "Changed to feature worktree directory: $worktree_dir"
    else
        echo "Failed to create feature worktree"
        return 1
    end
end