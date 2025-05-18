#!/bin/bash
# Setup script for fish shell integration with roo-task-cli

echo "Setting up fish shell integration for roo-task-cli..."

# Check if fish is installed
if ! command -v fish &> /dev/null; then
    echo "Error: fish shell is not installed"
    exit 1
fi

# Create fish functions directory if it doesn't exist
FISH_FUNCTIONS_DIR="$HOME/.config/fish/functions"
mkdir -p "$FISH_FUNCTIONS_DIR"

# Copy the tw-start function
cp scripts/fish-functions/tw-start.fish "$FISH_FUNCTIONS_DIR/"

echo "Fish function 'tw-start' has been installed!"
echo ""
echo "Usage:"
echo "  tw-start TASK-ID    # Start a task and cd to its worktree"
echo ""
echo "The function is now available in all new fish shells."
echo "To use it in the current shell, run: source ~/.config/fish/functions/tw-start.fish"