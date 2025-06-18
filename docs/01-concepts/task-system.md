---
title: "Task System"
description: "How tasks work as units of work for features"
version: "1.0"
status: "draft"
category: "concept"
updated: "2025-01-07"
authors: ["system"]
related:
  - areas.md
  - feedback-loops.md
  - ../specs/task-system-v2-specification.md
  - ../00-overview/quick-start.md
---

# Task System

## Table of Contents

1. [Overview](#overview)
2. [What is a Task?](#what-is-a-task)
3. [Task Structure](#task-structure)
4. [Workflow States](#workflow-states)
5. [Task Metadata](#task-metadata)
6. [Task Sections](#task-sections)
7. [Task Types](#task-types)
8. [Task Relationships](#task-relationships)
9. [Parent Tasks](#parent-tasks)
10. [Best Practices](#best-practices)

## Overview

The Task System is the core of Scopecraft, managing units of work with full context for both human and AI collaboration. Tasks are designed to be self-contained, trackable, and AI-friendly.

**Important**: Tasks represent work FOR features, not the features themselves. They're designed to provide sufficient context for AI agents to execute work effectively.

## What is a Task?

A task is:
- **A unit of work** - Specific, actionable, completable
- **Self-contained context** - Everything needed to do the work
- **Progress tracker** - Current state and history
- **Communication hub** - Questions, decisions, feedback

Tasks are NOT:
- Project management tickets
- Feature specifications (those go in work documents)
- Long-lived documentation
- Generic todos

## Task Structure

Every task is a markdown file with YAML frontmatter:

```markdown
---
type: feature|bug|chore|spike|idea
status: todo|in_progress|done|blocked
area: ui|core|api|cli|mcp
priority?: high|medium|low
assignee?: username
tags?: ["tag1", "tag2"]
---

# Task Title

## Instruction
What needs to be done (required)

## Tasks
- [ ] Subtask checklist (required, can be empty)

## Deliverable
Work outputs (required, initially empty)

## Log
- 2024-01-15: Execution history (required, auto-updated)
```

## Workflow States

Tasks use a **two-state workflow** with **phase-based organization**:

```
.tasks/
├── current/     # All active work (phases: backlog, active)
└── archive/     # Completed or abandoned work
    └── 2024-01/ # Organized by completion date
```

### Phase-Based Organization
Within the `current/` folder, tasks use a `phase` metadata field:
- `phase: backlog` - Planned work, not yet started
- `phase: active` - Currently being worked on  
- `phase: released` - Completed features ready for deployment

### State Transitions
- **Creation**: Tasks start in `current/` with `phase: backlog`
- **Activation**: `phase: backlog → active` when work begins
- **Completion**: `current/ → archive/` when task is done
- **Phase changes**: Tasks stay in `current/` as phases change

## Task Metadata

### Required Fields

| Field | Description | Values |
|-------|-------------|--------|
| `type` | Kind of work | `feature`, `bug`, `chore`, `spike`, `idea` |
| `status` | Current state | `todo`, `in_progress`, `done`, `blocked` |
| `area` | Part of codebase | Project-specific (e.g., `ui`, `core`, `api`) |
| `phase` | Development phase | `backlog`, `active`, `released` |

### Optional Fields

| Field | Description | Example |
|-------|-------------|---------|
| `priority` | Urgency level | `high`, `medium`, `low` |
| `assignee` | Who's responsible | `"alice"`, `"bob"` |
| `tags` | Additional categorization | `["security", "performance"]` |
| `relations` | Task dependencies | See [Task Relationships](#task-relationships) |

### Areas

Areas deserve special mention as they connect tasks to project structure:
- Define what part of the codebase is affected
- Enable area-specific guidance in modes
- Help with task organization and filtering

See [Areas Concept](areas.md) for detailed explanation.

## Task Sections

### Required Sections

#### Instruction
- **Purpose**: Clear description of what needs to be done
- **Audience**: Both human and AI
- **Content**: Requirements, context, acceptance criteria

#### Tasks
- **Purpose**: Breakdown of work
- **Format**: Markdown checklist
- **Usage**: Track progress, identify subtasks

#### Deliverable
- **Purpose**: Work outputs
- **Initial**: Empty
- **Final**: Code summaries, findings, designs

#### Log
- **Purpose**: Execution history
- **Format**: Timestamped entries
- **Usage**: Track decisions, progress, issues

### Optional Sections

As patterns emerge, teams add sections:
- `## Questions` - Uncertainties needing answers
- `## Decisions` - Choices made with rationale
- `## Context` - Related work and dependencies
- `## To Investigate` - Items to research

## Task Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature` | New functionality | "Add user authentication" |
| `bug` | Fix problems | "Resolve login timeout" |
| `chore` | Maintenance | "Update dependencies" |
| `spike` | Research/exploration | "Investigate WebRTC options" |
| `idea` | Future possibilities | "Consider AI suggestions" |

## Task Relationships

Tasks can have explicit relationships:

```yaml
relations:
  - type: blocks
    target: implement-api-05C
    description: API must be ready first
  - type: relates_to
    target: design-auth-04A
```

Relationship types:
- `blocks/blocked_by` - Dependencies
- `relates_to` - Connected work
- `parent_of/child_of` - Hierarchical
- `duplicates` - Same work

## Parent Tasks

Complex work uses parent tasks with subtasks:

```
dashboard-redesign/          # Parent folder
├── _overview.md            # Parent task
├── 01-user-research.task.md
├── 02-create-designs.task.md
└── 03-implement.task.md
```

Parent tasks:
- Coordinate multi-phase work
- Define orchestration flows
- Track overall progress
- Manage dependencies

See orchestration patterns in parent tasks for complex workflows.

## Best Practices

### 1. Right-Sized Tasks
- 4-16 hours of work typically
- Clear start and end
- Single responsibility
- Testable outcome

### 2. Self-Contained Context
Include everything needed:
- Background information
- Technical constraints
- Related decisions
- Success criteria

### 3. Progressive Enhancement
- Start simple
- Add sections as needed
- Don't over-structure upfront
- Let patterns emerge

### 4. AI-Friendly Writing
- Clear, specific instructions
- Explicit success criteria
- Link related context
- Document assumptions

### 5. Active Maintenance
- Update logs regularly
- Check off completed items
- Move through workflow states
- Archive when done

### 6. Use Questions
Make uncertainty visible:
```markdown
## Questions
- [ ] Should we cache at API or DB level?
- [ ] What's the performance target?
```

### 7. Track Decisions
Document why, not just what:
```markdown
## Decisions
- Chose PostgreSQL over Redis because:
  - Already in our stack
  - Simpler operations
  - Sufficient performance
```

## Task Lifecycle Example

```bash
# 1. Create task (goes to current/ with phase=backlog)
sc task create --title "Add password reset" --type feature --area auth

# 2. Start work (changes phase to active, stays in current/)
sc task start add-password-reset-0108-AB

# 3. Work progresses
sc task check add-password-reset-0108-AB "Send reset email"
sc task log add-password-reset-0108-AB "Email service integrated"

# 4. Ready for release (change phase)
sc task update add-password-reset-0108-AB --phase released

# 5. Complete (moves to archive/)
sc task complete add-password-reset-0108-AB
```

## Summary

The task system provides:
1. **Clear structure** for work units
2. **Full context** for execution
3. **Progress tracking** through workflow
4. **AI-friendly** format
5. **Flexible sections** for different needs
6. **Natural organization** via areas

Tasks are the atomic units that make Scopecraft's collaborative development possible, providing just enough structure to be useful without being restrictive.

## Next Steps

- Learn about [Areas](areas.md) for project organization
- Explore [Feedback Loops](feedback-loops.md) for collaboration
- See [Quick Start](../00-overview/quick-start.md) for practical usage
- Read [Task System V2 Spec](../specs/task-system-v2-specification.md) for full details