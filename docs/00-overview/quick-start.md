---
title: "Quick Start Guide"
description: "Get running with Scopecraft in 5 minutes"
version: "1.0"
status: "stable"
category: "overview"
updated: "2025-01-07"
authors: ["system"]
related:
  - philosophy.md
  - ../01-concepts/task-system.md
  - ../03-guides/user/getting-started.md
---

# Quick Start Guide

Get up and running with Scopecraft in 5 minutes. This guide covers the essential commands to start managing tasks and collaborating with AI.

## Table of Contents

1. [Installation](#installation)
2. [Your First Task](#your-first-task)
3. [Working with AI](#working-with-ai)
4. [Essential Commands](#essential-commands)
5. [Next Steps](#next-steps)

## Installation

### Prerequisites
- Node.js 18+ or Bun
- Git
- ChannelCoder (for AI sessions)

### Install Scopecraft

```bash
# Clone the repository
git clone https://github.com/scopecraft/scopecraft-v2
cd scopecraft-v2

# Install dependencies
bun install  # or npm install

# Install globally
bun run install-local  # or npm run install-local

# Verify installation
sc --version
```

### Install ChannelCoder (for AI features)

```bash
npm install -g channelcoder
```

## Your First Task

### 1. Create a Task

```bash
# Create a simple task
sc task create --title "Add user authentication" --type feature

# Output: Created task add-user-authentication-0108-AB in backlog/
```

### 2. View Your Task

```bash
# List all tasks
sc task list

# View specific task
sc task get add-user-authentication-0108-AB
```

### 3. Start Working

```bash
# Move to current (active work)
sc task start add-user-authentication-0108-AB

# This moves the task from backlog/ to current/
```

### 4. Update Progress

```bash
# Check off a subtask
sc task check add-user-authentication-0108-AB "Research auth providers"

# Add a log entry
sc task log add-user-authentication-0108-AB "Decided to use JWT with refresh tokens"
```

## Working with AI

### Interactive AI Session

```bash
# Start an AI session for your task
dispatch implement add-user-authentication-0108-AB

# This opens an interactive session with:
# - Full task context loaded
# - Appropriate AI mode (implement)
# - Git worktree isolation
```

### Planning with AI

```bash
# Get AI help planning a feature
plan "Add social login with Google and GitHub"

# Creates a comprehensive plan with:
# - Technical approach
# - Task breakdown  
# - Implementation steps
```

### Autonomous Execution

```bash
# Let AI work autonomously
auto add-user-authentication-0108-AB "Focus on JWT implementation first"

# Monitor progress
sc task get add-user-authentication-0108-AB --follow
```

## Essential Commands

### Task Management

```bash
# Create tasks
sc task create --title "Fix login bug" --type bug --area auth

# List tasks  
sc task list --current              # Active work
sc task list --backlog              # Planned work
sc task list --area auth            # By area

# Update tasks
sc task update AUTH-001 --status in_progress
sc task update AUTH-001 --add-tag security

# Complete tasks
sc task complete AUTH-001
```

### Working with Sections

Tasks have four main sections:

```bash
# Read specific section
sc task get AUTH-001 --section deliverable

# Update deliverable
sc task update AUTH-001 --section deliverable --content "API implemented and tested"

# Append to log
sc task log AUTH-001 "Security review completed"
```

### AI Collaboration

```bash
# Interactive modes
dispatch explore AUTH-001    # Research and exploration
dispatch design AUTH-001     # Technical design
dispatch implement AUTH-001  # Code implementation

# One-shot planning
plan "Implement real-time notifications"

# Autonomous execution
auto AUTH-001 "Implement according to the design doc"
```

### Knowledge Management

```bash
# Search for patterns
sc search "authentication"

# Link entities in markdown
@task:AUTH-001 implements #pattern:jwt-auth
Uses @decision:use-postgresql for session storage
```

## Example Workflow

Here's a typical development flow:

```bash
# 1. Create a feature task
sc task create --title "Add password reset" --type feature --area auth

# 2. Plan with AI
plan "Password reset via email with secure tokens"

# 3. Start work
sc task start add-password-reset-0108-CD

# 4. Interactive implementation
dispatch implement add-password-reset-0108-CD

# 5. Track progress
sc task check add-password-reset-0108-CD "Create reset token model"
sc task log add-password-reset-0108-CD "Email service integrated"

# 6. Complete
sc task complete add-password-reset-0108-CD
```

## Task Structure

Every task follows this structure:

```markdown
---
type: feature
status: in_progress
area: auth
---

# Add password reset

## Instruction
What needs to be done (requirements)

## Tasks
- [ ] Create token model
- [ ] Build reset endpoint
- [ ] Send email with link
- [ ] Create reset form

## Deliverable
Code, designs, or outputs produced

## Log
- 2024-01-08: Started implementation
- 2024-01-08: Email service configured
```

## Tips for Success

### 1. Start Simple
- Begin with basic task creation
- Add complexity as needed
- Don't worry about perfect structure

### 2. Use Questions
```markdown
## Questions
- [ ] How long should reset tokens last?
- [ ] Should we notify users of password changes?
```

### 3. Track Decisions
```markdown
## Decisions
- Token lifetime: 1 hour for security
- Email notification: Yes, for security alerts
```

### 4. Let AI Help
- Use `plan` for breaking down complex features
- Use `dispatch` for interactive development
- Use `auto` for well-defined tasks

## Next Steps

Now that you've got the basics:

1. **Learn More Concepts**
   - [Task System](../01-concepts/task-system.md) - Deep dive into tasks
   - [Feedback Loops](../01-concepts/feedback-loops.md) - Collaboration patterns
   - [Philosophy](philosophy.md) - Understand the why

2. **Explore Guides**
   - [User Guide](../03-guides/user/getting-started.md) - Comprehensive usage
   - [AI Collaboration](../03-guides/user/ai-collaboration.md) - Advanced AI usage

3. **Reference Material**
   - [All Commands](../04-reference/cli/commands.md) - Complete CLI reference
   - [Task Schema](../04-reference/schemas/task-schema.md) - Task format details

## Getting Help

- **In CLI**: `sc help [command]`
- **Examples**: `sc examples`
- **Documentation**: This guide and linked resources

Welcome to Scopecraft! Remember: start simple, enhance progressively, and let the system grow with your needs.