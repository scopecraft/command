---
title: "Areas - Project Organization Concept"
description: "How areas organize work and connect tasks to project-specific guidance"
version: "1.0"
status: "draft"
category: "concept"
updated: "2025-01-07"
authors: ["system"]
related:
  - task-system.md
  - mode-system.md
  - ../specs/task-system-v2-specification.md
---

# Areas - Project Organization Concept

## Table of Contents

1. [Overview](#overview)
2. [What are Areas?](#what-are-areas)
3. [Common Areas](#common-areas)
4. [Areas in Tasks](#areas-in-tasks)
5. [Areas in Modes](#areas-in-modes)
6. [How Areas Connect Systems](#how-areas-connect-systems)
7. [Best Practices](#best-practices)

## Overview

Areas are a fundamental organizational concept in Scopecraft that represent different parts or domains of your codebase. They serve as a bridge between tasks (what needs to be done) and modes (how to do it), enabling project-specific guidance and better work organization.

## What are Areas?

An area is a **logical subdivision** of your project that represents:
- A technical layer (ui, core, api)
- A functional domain (auth, billing, search)
- A deployment target (mobile, web, desktop)
- Any other meaningful project division

Areas answer the question: **"What part of the codebase does this work affect?"**

## Common Areas

While areas are project-specific, common patterns include:

### Technical Layer Areas
```yaml
area: ui        # Frontend/UI components
area: core      # Business logic, domain models
area: api       # API endpoints, GraphQL resolvers
area: cli       # Command-line interface
area: mcp       # MCP server implementation
area: db        # Database schemas, migrations
area: infra     # Infrastructure, deployment
```

### Functional Domain Areas
```yaml
area: auth      # Authentication & authorization
area: billing   # Payment processing
area: search    # Search functionality
area: analytics # Analytics and metrics
area: admin     # Admin panel
```

### Mixed Approach
Many projects use a combination:
```yaml
area: ui-auth   # Auth-related UI
area: api-billing # Billing API endpoints
area: core-search # Search algorithms
```

## Areas in Tasks

Areas are specified in task metadata:

```yaml
---
type: feature
status: todo
area: ui        # This task affects the UI layer
---

# Add dark mode toggle

## Instruction
Implement a dark mode toggle in the header...
```

### Area Benefits for Tasks

1. **Organization** - Group related work together
2. **Filtering** - Find all UI tasks: `sc task list --area ui`
3. **Assignment** - Route to appropriate team/person
4. **Context** - Understand impact scope

### Multiple Areas

Some tasks span multiple areas. Current convention:
```yaml
area: ui         # Primary area
tags: ["affects:api", "affects:core"]  # Secondary areas
```

## Areas in Modes

Areas enable project-specific guidance in modes:

### Mode Directory Structure
```
.tasks/.modes/implementation/
├── base.md                  # General implementation guidance
└── area/                    # Area-specific guidance
    ├── ui.md               # UI implementation patterns
    ├── core.md             # Core implementation patterns
    ├── api.md              # API implementation patterns
    └── cli.md              # CLI implementation patterns
```

### Area-Specific Guidance Example

```markdown
# UI Area Implementation Guidance

When implementing UI features in this project:

## Tech Stack
- React 18 with TypeScript
- TanStack Router for navigation
- Tailwind CSS for styling
- Storybook for component development

## Patterns
- Create Storybook story FIRST
- Use composition over inheritance
- Follow atomic design principles
- Implement responsive by default

## File Structure
components/
├── {ComponentName}/
│   ├── {ComponentName}.tsx
│   ├── {ComponentName}.stories.tsx
│   ├── {ComponentName}.test.tsx
│   └── index.ts
```

## How Areas Connect Systems

Areas create a powerful connection between tasks and execution:

```
Task Declaration → Mode Selection → Area Guidance → Contextual Execution
       ↓                ↓                ↓                    ↓
   area: ui      Mode: implement   Load ui.md      UI-specific approach
```

### The Flow

1. **Task specifies area**: `area: ui`
2. **Mode reads area**: Checks task metadata
3. **Loads area guidance**: `.modes/implementation/area/ui.md`
4. **AI adopts patterns**: Uses UI-specific tech stack and conventions
5. **Consistent output**: All UI work follows same patterns

## Best Practices

### 1. Define Areas Early
Establish your project's areas early and document them:

```markdown
# Project Areas

## Technical Layers
- ui: React frontend application
- api: Express REST API
- core: Business logic and domain models
- db: PostgreSQL database layer

## Functional Domains
- auth: Authentication system
- billing: Stripe integration
- notifications: Email/SMS system
```

### 2. Keep Areas Focused
- One primary concern per area
- Clear boundaries between areas
- Avoid too many areas (5-10 is typical)

### 3. Area-Specific Conventions
Document conventions in area guidance files:
- Naming patterns
- File organization
- Testing approaches
- Common utilities

### 4. Use Areas for Routing
- Assign area owners/experts
- Route reviews by area
- Plan sprints by area

### 5. Evolve Areas Thoughtfully
- Start with basic technical layers
- Add functional areas as needed
- Merge areas that always change together
- Split areas that grow too large

## Area vs Tags

Understanding the difference:

| Aspect | Area | Tags |
|--------|------|------|
| Purpose | Primary domain/layer | Additional categorization |
| Cardinality | One per task | Multiple per task |
| Guidance | Loads area-specific modes | Informal grouping |
| Required | Recommended | Optional |

Example:
```yaml
area: ui                    # Primary - loads UI patterns
tags: ["react", "performance", "mobile"]  # Additional context
```

## Summary

Areas are a simple but powerful concept that:
1. **Organize work** by technical or functional boundaries
2. **Connect tasks to guidance** through the mode system
3. **Enable project-specific patterns** without hardcoding
4. **Scale naturally** as projects grow

By using areas effectively, teams can maintain consistency across different parts of their codebase while allowing each area to have its own specific patterns and practices.

## Next Steps

- Define your project's areas in `.scopecraft/areas.md`
- Create area-specific guidance in `.tasks/.modes/*/area/`
- Use areas when creating tasks
- Filter and organize work by area