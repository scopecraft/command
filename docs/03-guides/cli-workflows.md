# CLI Workflows Guide

This guide demonstrates common workflow patterns using the Scopecraft CLI. The composable design enables powerful automation and flexible development approaches.

## Core Workflow Patterns

### 1. Task-Driven Development

Start with a task, create an environment, and begin work.

```bash
# Create a new feature task
sc task create \
  --title "Implement user dashboard" \
  --type feature \
  --priority high \
  --tags "frontend" "react"

# Create isolated development environment
sc env user-dashboard-05A

# Start interactive development
sc work user-dashboard-05A
```

**When to use:** Starting new features or bugs that need focused development.

### 2. Environment-First Development

Start with environment setup, then work on multiple related tasks.

```bash
# Create environment for a parent task
sc env auth-system-05B

# Switch to the environment
cd "$(sc env path auth-system-05B)"

# Work on different subtasks in the same environment
sc work login-ui-05C
sc work auth-api-05D
sc work session-mgmt-05E
```

**When to use:** Working on complex features with multiple related subtasks.

### 3. Autonomous Task Processing

Dispatch tasks for background processing while continuing other work.

```bash
# Queue up multiple tasks for autonomous processing
sc dispatch refactor-utils-05F --exec tmux
sc dispatch update-tests-05G --exec docker
sc dispatch optimize-db-05H --exec detached

# Monitor active environments
sc env list

# Resume or check on autonomous sessions
sc dispatch --session session-abc123
```

**When to use:** Running code generation, refactoring, or testing tasks that can run unattended.

## Advanced Workflow Patterns

### 4. Progressive Task Workflow

Move tasks through the full development lifecycle.

```bash
# Start with task in backlog
sc task create --title "Add search functionality" --type feature
# Task created: search-func-05I (in backlog)

# Promote to current when ready to work
sc workflow promote search-func-05I
# Task moved to current/

# Create environment and start work
sc env search-func-05I
sc work search-func-05I

# Mark complete when done
sc task update search-func-05I --status Done
# Task automatically archived

# Clean up environment
sc env close search-func-05I --force
```

### 5. Parent Task Management

Handle complex features with multiple subtasks.

```bash
# Create parent task with subtasks
sc parent create --title "User Management System" --type feature
# Creates: user-mgmt-05J/

# Add subtasks to parent
sc task create --title "User registration" --type feature --parent user-mgmt-05J
sc task create --title "User profile editing" --type feature --parent user-mgmt-05J
sc task create --title "Password reset" --type feature --parent user-mgmt-05J

# Create shared environment for parent
sc env user-mgmt-05J

# Work on subtasks in sequence
sc work user-mgmt-05J/01_user-registration
sc work user-mgmt-05J/02_user-profile
sc work user-mgmt-05J/03_password-reset

# View progress
sc parent show user-mgmt-05J --tree
```

### 6. Mixed Interactive and Autonomous

Combine interactive and autonomous execution for efficiency.

```bash
# Start with interactive work for planning/design
sc work complex-feature-05K "Let's plan the architecture first"

# Once planned, dispatch implementation tasks autonomously
sc dispatch implement-api-05L --mode implementation --exec tmux
sc dispatch write-tests-05M --mode test --exec docker

# Continue interactive work on UI while backend runs
sc work design-ui-05N --mode ui

# Resume autonomous sessions to check progress
sc dispatch --session session-api-abc
sc dispatch --session session-tests-def
```

## Session Management Patterns

### 7. Session Continuity

Resume work across different time periods.

```bash
# Start work session
sc work feature-x-05O "Implement the core functionality"
# Session created: session-12345

# Later, resume where you left off
sc work --session session-12345

# For autonomous work
sc dispatch feature-y-05P --exec tmux
# Session created: session-67890

# Resume autonomous session
sc dispatch --session session-67890
```

### 8. Multi-Task Sessions

Work on related tasks in a single session.

```bash
# Start with one task but include related work
sc work primary-task-05Q "Also review related-task-05R and update-docs-05S"

# Or explicitly work across task boundaries
sc work primary-task-05Q
# In Claude: "Let me also look at task related-task-05R..."
```

## Automation and Scripting

### 9. Daily Workflow Automation

Automate routine workflow operations.

```bash
#!/bin/bash
# daily-start.sh - Start daily development routine

# Get next high-priority task
NEXT_TASK=$(sc task list --current --tags "high-priority" --format json | jq -r '.[0].metadata.id')

if [ "$NEXT_TASK" != "null" ]; then
  echo "Starting work on high-priority task: $NEXT_TASK"
  sc env "$NEXT_TASK"
  sc work "$NEXT_TASK"
else
  echo "No high-priority tasks, showing current tasks:"
  sc task list --current
fi
```

### 10. Batch Environment Management

Manage multiple environments efficiently.

```bash
#!/bin/bash
# cleanup-envs.sh - Clean up old environments

# List all environments older than 7 days
OLD_ENVS=$(sc env list --format minimal | while read task_id path; do
  if [ -d "$path" ] && [ $(find "$path" -maxdepth 0 -mtime +7) ]; then
    echo "$task_id"
  fi
done)

# Close old environments
for env in $OLD_ENVS; do
  echo "Closing old environment: $env"
  sc env close "$env" --force
done
```

### 11. Task Pipeline Automation

Create automated task processing pipelines.

```bash
#!/bin/bash
# process-backlog.sh - Automatically process simple tasks

# Find simple tasks in backlog
SIMPLE_TASKS=$(sc task list --backlog --tags "automation-ready" --format json | jq -r '.[].metadata.id')

for task in $SIMPLE_TASKS; do
  echo "Auto-processing task: $task"
  
  # Move to current
  sc workflow promote "$task"
  
  # Dispatch autonomously
  sc dispatch "$task" --exec docker --mode implementation
  
  # Brief pause between dispatches
  sleep 5
done
```

## Integration Patterns

### 12. Git Integration

Combine Scopecraft with git workflows.

```bash
# Create branch-per-task workflow
sc env feature-05S
cd "$(sc env path feature-05S)"

# Work with git as normal
git add .
git commit -m "Implement feature: $(sc task get feature-05S --format json | jq -r '.document.title')"

# Clean merge back
git checkout main
git merge feature-05S
sc env close feature-05S --force
```

### 13. CI/CD Integration

Integrate with continuous integration.

```bash
# .github/workflows/scopecraft-dispatch.yml
name: Autonomous Task Processing
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  process-tasks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Scopecraft
        run: npm install -g @scopecraft/cmd
      - name: Process maintenance tasks
        run: |
          # Find and process maintenance tasks
          MAINT_TASKS=$(sc task list --backlog --tags "maintenance" --format json | jq -r '.[].metadata.id')
          for task in $MAINT_TASKS; do
            sc dispatch "$task" --exec detached --mode automation
          done
```

### 14. IDE Integration

Integrate with development environments.

```bash
# VS Code integration
function sc-code() {
  local task_id="$1"
  sc env "$task_id"
  local env_path=$(sc env path "$task_id")
  code "$env_path"
  sc work "$task_id" "I'm now working in VS Code"
}

# Cursor integration  
function sc-cursor() {
  local task_id="$1"
  sc env "$task_id"
  local env_path=$(sc env path "$task_id")
  cursor "$env_path"
  sc work "$task_id" "I'm now working in Cursor"
}
```

## Performance Optimization

### 15. Parallel Task Processing

Process multiple tasks simultaneously.

```bash
# Dispatch multiple independent tasks in parallel
sc dispatch task-a-05T --exec tmux &
sc dispatch task-b-05U --exec docker &
sc dispatch task-c-05V --exec detached &

# Wait for completion and collect results
wait
echo "All tasks dispatched"

# Check on progress
sc env list
```

### 16. Environment Pooling

Reuse environments for efficiency.

```bash
# Check for existing environment before creating
TASK_ID="new-task-05W"
if sc env list --format minimal | grep -q "$TASK_ID"; then
  echo "Reusing existing environment"
  sc work "$TASK_ID"
else
  echo "Creating new environment"
  sc env "$TASK_ID"
  sc work "$TASK_ID"
fi
```

## Troubleshooting Workflows

### 17. Session Recovery

Recover from interrupted sessions.

```bash
# List all active environments to find orphaned sessions
sc env list --verbose

# Check for session files in ChannelCoder integration
ls ~/.channelcoder/sessions/

# Resume session by ID
sc work --session session-abc123

# Or restart task if session lost
sc work task-id-05X "Please continue from where we left off"
```

### 18. Environment Debugging

Debug environment issues.

```bash
# Check environment status
sc env list --verbose

# Verify environment path
ls -la "$(sc env path task-05Y)"

# Check git status in environment
cd "$(sc env path task-05Y)" && git status

# Force clean recreation
sc env close task-05Y --force
sc env task-05Y --force
```

## Best Practices

### Command Composition Guidelines

1. **Use pipes and command substitution:**
   ```bash
   sc work "$(sc workflow next --format json | jq -r '.metadata.id')"
   ```

2. **Check exit codes:**
   ```bash
   if sc env list | grep -q "task-05Z"; then
     sc work task-05Z
   else
     sc env task-05Z && sc work task-05Z
   fi
   ```

3. **Combine with other tools:**
   ```bash
   # Combine with jq for JSON processing
   sc task list --format json | jq '.[] | select(.document.frontmatter.priority == "high")'
   
   # Combine with fzf for interactive selection
   TASK=$(sc task list --format minimal | fzf | cut -f1)
   sc work "$TASK"
   ```

### Error Handling

```bash
# Robust error handling
set -e  # Exit on error

trap 'echo "Error occurred, cleaning up..."; sc env close temp-task --force' ERR

# Your workflow commands here
sc env temp-task
sc work temp-task "Implement feature"
sc env close temp-task --force
```

### Environment Management

- Close environments when done: `sc env close <task> --force`
- Use `--dry-run` to preview actions
- Check environment status regularly: `sc env list`
- Clean up old environments periodically

This guide provides patterns for most common scenarios. The composable nature of the CLI means you can adapt and combine these patterns for your specific needs.