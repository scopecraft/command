# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scopecraft Command is a toolset for managing Markdown-Driven Task Management (MDTM) files with TOML or YAML frontmatter. It provides both a Command Line Interface (CLI) and a Model Context Protocol (MCP) server, both developed within this project.

The system is designed to be versatile:
- Works both with and without Roo Commander
- Automatically detects project type and adapts accordingly
- Supports the standardized MDTM format
- Provides direct CRUD operations without requiring LLM processing
- Offers the same core functionality through both CLI and MCP interfaces

## IMPORTANT: Dogfooding Our Own Tools

**We MUST use our own CLI to manage tasks in this project!** Until the MCP implementation is complete (task 03-mcp-update), use the CLI directly:

### Task Management Commands

```bash
# Always use dev:cli for immediate changes (no compilation needed)
bun run dev:cli <command>

# List tasks
bun run dev:cli task list --current  # Show active tasks
bun run dev:cli task list --backlog  # Show backlog
bun run dev:cli parent list          # Show parent tasks (features)

# Work with current parent task
bun run dev:cli parent show implement-v2-structure --tree

# Update task status
bun run dev:cli task start <task-id>     # Mark as In Progress
bun run dev:cli task complete <task-id>  # Mark as Done
bun run dev:cli task block <task-id>     # Mark as Blocked

# Create new tasks
bun run dev:cli task create --title "Fix bug in parser" --type bug
bun run dev:cli parent create --title "New Feature" --type feature

# Manage subtasks
bun run dev:cli parent add-subtask <parent-id> --title "Implement function"
bun run dev:cli task parallelize <subtask1> <subtask2> --parent <parent-id>
```

### Workflow States

Tasks follow this workflow:
1. **backlog/** - New tasks, planning stage
2. **current/** - Active development
3. **archive/** - Completed or abandoned

### Current Active Tasks

Check these regularly:
```bash
# See what's in progress
bun run dev:cli parent show implement-v2-structure --tree

# Find next task to work on
bun run dev:cli task list --current --status "To Do"
```

### Best Practices for Task Management

1. **Starting Work on a Task**:
   ```bash
   # Mark task as in progress when you start
   bun run dev:cli task start 02-cli-update
   ```

2. **Creating Related Tasks**:
   ```bash
   # If you discover a bug while working
   bun run dev:cli task create --title "Fix status truncation in v2 update" --type bug
   
   # For improvements or refactoring
   bun run dev:cli task create --title "Refactor v2 function names" --type chore
   ```

3. **Completing Work**:
   ```bash
   # Mark as complete when done
   bun run dev:cli task complete 02-cli-update
   
   # Or if blocked
   bun run dev:cli task block 03-mcp-update
   ```

4. **Organizing Complex Work**:
   ```bash
   # Convert a simple task to parent with subtasks
   bun run dev:cli task promote refactor-v2-names --subtasks "Plan changes,Update core,Update CLI,Test"
   
   # Make subtasks parallel when they can be done simultaneously
   bun run dev:cli task parallelize 02-update-core 03-update-cli --parent refactor-v2-names
   ```

### Examples for Common Scenarios

**When asked to implement a feature:**
```bash
# First, check if it exists as a task
bun run dev:cli task list --backlog | grep -i "feature-name"

# If not, create it
bun run dev:cli task create --title "Implement feature X" --type feature

# Start working on it
bun run dev:cli task start <task-id>
```

**When finding issues:**
```bash
# Document it immediately
bun run dev:cli task create --title "Issue: Task adoption fails with error" --type bug

# Or add to existing task's "To Investigate" section
bun run dev:cli task get 02-cli-update  # Review current state
# Then update the task file directly
```

**Always Update Task Logs:**
When making significant progress or changes to a task, update the Log section:
```bash
# View the task first
bun run dev:cli task get <task-id> --format full

# Then edit the file directly to add a log entry with date and what was done
# Example log entry format:
# - 2025-05-28: Implemented sequencing commands (resequence, parallelize)
# - 2025-05-28: Fixed silent task creation - now provides feedback
```

This helps track progress and provides context for future work.

## Memories

- When creating tasks for testing purposes, always create them in a TEST workflow location or with test- prefix
- The v2 system uses workflow states (backlog/current/archive) instead of phases
- Parent tasks replace the old "feature" concept
- Always mark tasks as "In Progress" when starting work
- Create bug/chore tasks immediately when issues are discovered
- Use parent tasks for any work that has 3+ subtasks
- **Always update the Log section** of tasks when making significant changes or completing work
- Log entries should include date and brief description: `- 2025-05-28: Implemented feature X`
- Use bun commands, never npm commands

## Code Quality Checks

BEFORE committing any code changes, you MUST run:

```bash
bun run code-check
```

This command will:
1. Auto-detect whether to check staged or changed files
2. Run Biome on the appropriate files
3. Run TypeScript check on the full project (to catch cross-file issues)
4. Report results in a clear format

Options:
- `--staged`: Check only staged files
- `--changed`: Check only changed files 
- `--all`: Check all files
- `--format=json`: Output results in JSON format

The build will FAIL if these checks don't pass.

(Rest of the existing content remains the same)