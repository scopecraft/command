# Task System Design

*Part of the [Scopecraft Vision](./scopecraft-vision.md)*

## Overview

The Task System is Scopecraft's tactical work management layer, designed for the day-to-day activities of building software. Unlike the long-lived Knowledge System, the Task System focuses on short-lived, goal-oriented work that moves through phases from conception to completion and eventual archival.

## Role: The Developer's Assistant

The Task System acts as a development workflow coordinator, managing:
- **Features**: User-facing functionality and epics
- **Tasks**: Specific work items to implement features
- **Work Documents**: PRDs, TRDs, and implementation notes
- **Phases**: Organizational containers (sprints, releases)
- **Dependencies**: Relationships between work items
- **Progress**: Status tracking and completion

## Design Philosophy

### 1. Feature-Centric Organization
Work is organized around features that deliver user value, not technical components. Each feature contains all related tasks, documents, and context needed for implementation.

### 2. Rich Context Preservation  
Work documents (PRDs, TRDs, decisions) live alongside tasks, providing AI and humans with full context. Implementation decisions are captured at the point in time they were made.

### 3. Progressive Lifecycle
Work items move through a natural lifecycle: planning → implementation → completion → archival. Each stage has appropriate tools and workflows.

### 4. Flexible Structure
No rigid hierarchy or workflow is imposed. Teams can organize by phases, features, or any other dimension that makes sense for their work.

## Structure

### Directory Organization

```
.tasks/
├── phase-current/
│   ├── FEATURE_user-auth/
│   │   ├── _overview.md              # Feature summary/epic
│   │   ├── product-requirements.md   # PRD for this feature  
│   │   ├── technical-approach.md     # TRD for implementation
│   │   ├── implementation-notes.md   # Decisions during build
│   │   ├── TASK-AUTH-001.md         # Individual tasks
│   │   ├── TASK-AUTH-002.md
│   │   └── TASK-AUTH-003.md
│   └── FEATURE_dashboard/
│       ├── _overview.md
│       ├── design-mockups.md
│       └── tasks/
├── phase-next/
│   └── FEATURE_reporting/
└── archive/
    └── 2024-Q4/
        └── FEATURE_onboarding/
```

### Task Structure

Each task follows a consistent format:

```markdown
---
id: TASK-AUTH-001
title: Implement JWT token generation
type: feature
status: 🔵 In Progress
assignee: @alice
priority: 🔥 High
size: M
feature: FEATURE_user-auth
tags: [backend, security, api]
depends_on:
  - TASK-AUTH-002  # Database schema must be ready
blocks:
  - TASK-API-005   # API gateway needs auth tokens
created: 2024-01-15
updated: 2024-01-16
---

# Implement JWT token generation

## Context
As part of `@feature:user-auth`, we need to generate secure JWT tokens
following `#pattern:jwt-auth` from our knowledge base.

## Requirements
- Generate access tokens (15min expiry)
- Generate refresh tokens (7 day expiry)  
- Include user roles in token claims
- Sign with RS256 algorithm

## Technical Approach
Implementing using `#library:jsonwebtoken` with our existing
`@module:auth-service` architecture...

## Progress Notes
- 2024-01-16: Created token service class
- 2024-01-16: Added unit tests for token generation

## Completion Criteria
- [ ] Token generation service implemented
- [ ] Unit tests passing
- [ ] Integration with auth endpoints
- [ ] Security review completed
```

### Work Documents

Feature-level documents provide rich context:

#### Product Requirements (PRD)
```markdown
---
document: product-requirements
feature: FEATURE_user-auth
created: 2024-01-10
status: approved
---

# User Authentication PRD

## Problem Statement
Users cannot securely access their accounts...

## User Stories
1. As a user, I want to log in with email/password
2. As a user, I want to reset my forgotten password
3. As a user, I want to stay logged in on trusted devices

## Success Metrics
- Login success rate > 95%
- Password reset completion < 2 minutes
- Session duration P50 > 7 days
```

#### Technical Requirements (TRD)
```markdown
---
document: technical-requirements  
feature: FEATURE_user-auth
created: 2024-01-12
implements: ./product-requirements.md
---

# User Authentication TRD

## Architecture Overview
Implementing OAuth2-compatible authentication using JWT tokens...

## Component Design
- Auth Service: Token generation and validation
- User Service: Credential management
- API Gateway: Token verification middleware

## Security Considerations
Following OWASP guidelines for authentication...
```

## Entity Relationships

### Natural Linking

Tasks create rich relationship networks:

```markdown
This `@task:AUTH-001` implements the token generation portion of 
`@feature:user-auth` using `#pattern:jwt-auth`. 

It depends on `@task:DB-SCHEMA-001` for the user tables and blocks
`@task:API-GATEWAY-001` which needs tokens for request validation.

See `@doc:auth/technical-requirements` for full architecture.
```

### Relationship Types

- **Implements**: Task implements feature
- **Depends On**: Task requires another task first
- **Blocks**: Task must complete before another can start
- **Related To**: Tasks share context or domain
- **Child Of**: Subtask relationship

### Task Hierarchies

Tasks can be organized hierarchically:

```
FEATURE_user-auth/
  ├── EPIC-AUTH-001 (Design authentication system)
  │   ├── TASK-AUTH-001 (JWT implementation)
  │   ├── TASK-AUTH-002 (Database schema)
  │   └── TASK-AUTH-003 (API endpoints)
  └── EPIC-AUTH-002 (Password management)
      ├── TASK-PWD-001 (Reset flow)
      └── TASK-PWD-002 (Strength validation)
```

## AI Integration

### Context Gathering

AI agents working on tasks automatically gather:

1. **Feature Context**: PRD, TRD, and related documents
2. **Knowledge References**: Patterns, standards, decisions
3. **Dependency Chain**: Required and blocked tasks
4. **Historical Context**: Previous related work

### Work Document Generation

AI can help create work documents:

```bash
# Generate PRD from initial idea
sc mode planning "User authentication with social login"
# Creates: FEATURE_social-auth/product-requirements.md

# Generate TRD from PRD
sc mode design FEATURE_social-auth
# Creates: FEATURE_social-auth/technical-approach.md

# Break down into tasks
sc mode planning FEATURE_social-auth --breakdown
# Creates: Multiple TASK-*.md files
```

### Progress Tracking

AI maintains task state:

```markdown
## Progress Notes
- 2024-01-16 09:00: Started implementation
- 2024-01-16 11:30: Question: Should we use RS256 or HS256?
- 2024-01-16 14:00: Decision: RS256 for better security
- 2024-01-16 16:00: Basic implementation complete, starting tests
```

## Lifecycle Management

### Active Development

During active work, tasks and documents are frequently updated:
- Status changes as work progresses
- Progress notes capture decisions and blockers  
- Dependencies are discovered and documented
- New related tasks are created as needed

### Completion

When features complete:
- All tasks marked as done
- Work documents finalized
- Lessons learned captured
- Ready for archival

### Archival

Completed work moves to archive:
- Preserves historical context
- Reduces active directory clutter
- Remains searchable for future reference
- Can be restored if needed

## Integration Points

### With Knowledge System

Tasks reference and contribute to knowledge:
- Apply patterns from Knowledge System
- Document new patterns discovered during implementation  
- Create ADRs for significant decisions
- Update standards based on learnings

### With External Tools

Tasks sync naturally with other systems:
- GitHub issues and PRs
- Linear/Jira tickets
- CI/CD pipelines
- Documentation systems

### With Mode System

Modes operate on tasks to guide work:
- Planning mode creates tasks
- Implementation mode completes tasks
- Diagnosis mode investigates issues
- Evolution mode improves existing work

## Best Practices

### 1. Feature-First Thinking
Organize work around user value, not technical components. A "login feature" is better than separate "database", "API", and "UI" tasks.

### 2. Rich Context
Include enough context in tasks that someone (human or AI) can understand the work without extensive background knowledge.

### 3. Progressive Detail
Start with high-level features and break down into tasks as understanding improves. Don't over-plan upfront.

### 4. Natural Language
Write tasks in natural language. The system learns your vocabulary rather than forcing rigid schemas.

### 5. Regular Archival
Move completed work to archive quarterly. This keeps the active workspace focused while preserving history.

## Examples

### Simple Feature
```
FEATURE_user-profile/
  ├── _overview.md (50 lines)
  ├── product-requirements.md (100 lines)
  ├── TASK-PROFILE-001.md (Update profile endpoint)
  └── TASK-PROFILE-002.md (Profile UI component)
```

### Complex Feature
```
FEATURE_payment-system/
  ├── _overview.md (200 lines)
  ├── product-requirements.md (500 lines)
  ├── technical-approach.md (800 lines)
  ├── security-review.md (300 lines)
  ├── implementation-notes.md (ongoing)
  ├── EPIC-PAYMENT-001/ (Payment processing)
  │   ├── TASK-PAY-001.md
  │   ├── TASK-PAY-002.md
  │   └── TASK-PAY-003.md
  └── EPIC-PAYMENT-002/ (Subscription management)
      ├── TASK-SUB-001.md
      └── TASK-SUB-002.md
```

## Future Enhancements

### Automated Workflows
- Task creation from PRDs
- Status updates from git commits
- Archival based on completion criteria

### Enhanced AI Integration  
- Predictive task breakdown
- Automatic dependency detection
- Progress estimation based on historical data

### Visualization
- Dependency graphs
- Feature progress tracking
- Team workload distribution

---

The Task System provides the tactical layer of Scopecraft, managing the day-to-day work of building software while maintaining rich context for both humans and AI agents.