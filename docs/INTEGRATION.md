# Integrating Scopecraft Command with Roo Commander

This document provides guidance on how to effectively use Scopecraft Command (sc) alongside the existing Roo Commander LLM-based workflow.

## Intended Workflow

Scopecraft Command is designed to complement Roo Commander's LLM-powered task management by providing direct CRUD operations on task files without requiring LLM processing. This is particularly useful for:

1. **Quick Status Updates**: Quickly mark tasks as in-progress, done, or blocked
2. **Batch Operations**: List, filter, and update multiple tasks efficiently
3. **Automation**: Enable scripting and automation of task management
4. **Offline Work**: Update tasks when you don't need or have access to the LLM

## Best Practices

### 1. Task Creation

You can use both approaches:

- **LLM-Based**: Let Roo Commander's LLM create structured tasks with detailed content when you need assistance generating acceptance criteria, implementation steps, etc.
- **CLI-Based**: Use the CLI to quickly create task skeletons, especially for routine or well-defined tasks.

Example:
```bash
# Create a quick feature task
sc create --title "Update footer links" --type "🌟 Feature" --tags ui footer
```

### 2. Status Updates

The CLI excels at quick status updates:

```bash
# Mark a task as in progress
sc start TASK-123

# Mark a task as complete
sc complete TASK-123
```

### 3. Task Review and Planning

Use the CLI to quickly get an overview of all tasks or filter by specific criteria:

```bash
# List all in-progress tasks
sc list --status "🔵 In Progress"

# List all tasks assigned to a specific specialist
sc list --assignee "dev-react"
```

### 4. Automation

The CLI enables task automation through scripts:

```bash
# Example script: Mark all "Ready for Review" tasks as "In Review"
for task_id in $(sc list --status "Ready for Review" --format minimal | cut -f1); do
  sc update $task_id --status "In Review"
done
```

## File Format Compatibility

The CLI and LLM use the same TOML+Markdown file format for tasks. Key points to maintain compatibility:

1. **Standard Metadata Fields**: Stick to the standard metadata fields (id, title, status, etc.)
2. **Status Values**: Use consistent status values across both tools (e.g., "🟡 To Do", "🔵 In Progress", "🟢 Done")
3. **Task Structure**: Maintain the consistent Markdown structure in the content section

## Integration with MCP Servers

In the future, this CLI may be extended to operate as an MCP (Model Context Protocol) server, providing the LLM with a more efficient way to perform task operations directly, without having to generate and parse Markdown itself.

## Troubleshooting

If you encounter issues with the CLI not seeing tasks created by the LLM (or vice versa):

1. Verify both tools are looking at the same `.ruru/tasks` directory
2. Check file permissions and ownership
3. Ensure task files follow the expected TOML+Markdown format
4. Refresh the Roo Code LLM session after making CLI-based changes