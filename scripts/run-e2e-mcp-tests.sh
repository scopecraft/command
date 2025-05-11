#!/bin/bash
# Script to run MCP end-to-end tests and save results to a timestamped file

# Change to the project directory
cd "$(dirname "$0")/.."

# Create results directory if it doesn't exist
RESULTS_DIR="test/mcp/results"
mkdir -p "$RESULTS_DIR"

# Generate timestamp for unique filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_FILE="$RESULTS_DIR/e2e_mcp_test_$TIMESTAMP.json"

echo "Starting MCP end-to-end tests..."
echo "Results will be saved to: $RESULTS_FILE"

# Run the Claude CLI command and save output to the results file
claude -p "/project:e2e-mcp-test" --output-format stream-json \
  --allowedTools \
  "mcp__scopecraft-command-mcp__task_list" \
  "mcp__scopecraft-command-mcp__task_get" \
  "mcp__scopecraft-command-mcp__task_create" \
  "mcp__scopecraft-command-mcp__task_update" \
  "mcp__scopecraft-command-mcp__task_delete" \
  "mcp__scopecraft-command-mcp__task_next" \
  "mcp__scopecraft-command-mcp__phase_list" \
  "mcp__scopecraft-command-mcp__phase_create" \
  "mcp__scopecraft-command-mcp__workflow_current" \
  "mcp__scopecraft-command-mcp__workflow_mark_complete_next" \
  "Batch" \
  "Read" \
  "LS" > "$RESULTS_FILE"

echo "Tests completed successfully!"
echo "Results saved to: $RESULTS_FILE"

# Optionally add a command to view or process the results file
# For example, to extract just the final summary:
# echo "Test Summary:"
# cat "$RESULTS_FILE" | grep -A 20 "Summary Report" | tail -20