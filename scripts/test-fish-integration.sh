#!/bin/bash
# Test the fish function integration

echo "Testing tw-start output..."

# Run the script with a fake task ID to see the output
# We'll redirect stderr to /dev/null to only see the path output
OUTPUT=$(bun run tw-start TASK-TEST-001 2>/dev/null | tail -n 1)

echo "Output from tw-start: $OUTPUT"

# Check if the output looks like a path
if [[ "$OUTPUT" == *"/roo-task-cli.worktrees/"* ]]; then
    echo "✓ Success: Script outputs a worktree directory path"
else
    echo "✗ Error: Script did not output expected path format"
    echo "Got: $OUTPUT"
fi