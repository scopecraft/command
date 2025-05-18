# Scopecraft Organizational Structure Guide

## Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
   - [Hierarchy Levels](#hierarchy-levels)
   - [Key Principles](#key-principles)
3. [File System Structure](#file-system-structure)
   - [Phase-Based Organization](#phase-based-organization)
   - [Feature and Area Duplication](#feature-and-area-duplication)
   - [File Naming Conventions](#file-naming-conventions)
4. [Phases: Project and Release Management](#phases-project-and-release-management)
   - [Example Phases](#example-phases)
   - [Phase Usage Guidelines](#phase-usage-guidelines)
5. [Task Statuses: Work Progress Tracking](#task-statuses-work-progress-tracking)
   - [Standard Statuses](#standard-statuses)
   - [Special Statuses](#special-statuses)
   - [Status Usage Guidelines](#status-usage-guidelines)
6. [Areas: Functional Domains](#areas-functional-domains)
   - [Technical Areas](#technical-areas)
   - [Orchestrator Area](#orchestrator-area)
   - [Area Guidelines](#area-guidelines)
7. [Features: Deliverable Capabilities](#features-deliverable-capabilities)
   - [Feature Characteristics](#feature-characteristics)
   - [Feature Examples](#feature-examples)
   - [Feature Planning](#feature-planning)
8. [Tasks: Atomic Work Units and Communication Logs](#tasks-atomic-work-units-and-communication-logs)
   - [Task Dual Purpose](#task-dual-purpose)
   - [Task Properties](#task-properties)
   - [Task Internal Structure](#task-internal-structure)
   - [Task Relationships](#task-relationships)
   - [Task Lifecycle](#task-lifecycle)
9. [Organizational Examples](#organizational-examples)
   - [Simple Feature](#simple-feature)
   - [Complex Cross-Area Feature](#complex-cross-area-feature)
   - [Orchestrated Workflow](#orchestrated-workflow)
   - [File System Example](#file-system-example)
10. [Best Practices](#best-practices)
    - [When to Create Features](#when-to-create-features)
    - [Area Assignment](#area-assignment)
    - [Status Transitions](#status-transitions)
    - [Task Sizing](#task-sizing)
11. [Integration with Tools](#integration-with-tools)
    - [CLI Commands](#cli-commands)
    - [MCP Tools](#mcp-tools)
    - [Claude Commands](#claude-commands)
12. [Important Distinctions](#important-distinctions)
    - [Scopecraft Phases = MDTM Phases](#scopecraft-phases--mdtm-phases)
    - [Features vs Areas](#features-vs-areas)
    - [Tasks vs Documentation](#tasks-vs-documentation)

## Overview

Scopecraft uses a multi-dimensional organizational structure to manage development work efficiently. This structure provides both technical organization (through areas) and delivery organization (through features) while maintaining clear task lifecycle management (through phases).

## Core Concepts

### Hierarchy Levels

The Scopecraft organizational structure operates at four distinct levels:

1. **Project Level**: Phases (releases, initiatives, milestones)
2. **Delivery Level**: Features (user capabilities)  
3. **System Level**: Areas (functional domains)
4. **Work Level**: Tasks (atomic units with statuses)

### Key Principles

- **Phases** organize work into project milestones or releases (v1, v1.1, backlog)
- **Features** group related work toward user-facing goals
- **Areas** represent technical boundaries and expertise domains
- **Tasks** are the atomic units of work that progress through statuses

## File System Structure

### Phase-Based Organization

Scopecraft organizes all tasks under phase directories, creating a structure that mirrors project progression:

```
.tasks/
├── backlog/          # Future work not yet scheduled
├── v1/               # Initial release
├── v1.1/            # Point release
└── performance-opt/  # Special initiative
```

### Feature and Area Duplication

When features or areas span multiple phases, they are duplicated in the file system:

```
.tasks/
├── backlog/
│   ├── FEATURE_user-auth/
│   │   ├── _overview.md
│   │   └── TASK-20250101-120000.md
│   └── AREA_Core/
│       └── TASK-20250102-150000.md
├── v1/
│   ├── FEATURE_user-auth/    # Same feature, different phase
│   │   ├── _overview.md      # Phase-specific overview
│   │   └── TASK-20250110-090000.md
│   └── AREA_Core/           # Same area, different phase
│       └── TASK-20250111-140000.md
└── v1.1/
    └── FEATURE_user-auth/    # Feature continues across phases
        ├── _overview.md
        └── TASK-20250120-110000.md
```

Key points:
- Each phase maintains its own directory structure
- Features/areas are duplicated when work spans phases
- The `_overview.md` file in each phase is unique to that phase's scope
- This structure allows clear phase-based planning while maintaining feature continuity

### File Naming Conventions

- **Features**: `FEATURE_[descriptive-name]/`
- **Areas**: `AREA_[technical-domain]/`
- **Tasks**: `TASK-YYYYMMDD-HHMMSS.md`
- **Overviews**: `_overview.md` (within feature/area folders)

## Phases: Project and Release Management

Phases represent high-level project milestones, releases, or initiatives. They organize work at a project level, similar to MDTM's concept.

### Example Phases

1. `backlog` - Future work not yet assigned to a release
2. `v1` - Initial version milestone
3. `v1.1` - Point release
4. `brand-refresh` - Major initiative to update branding
5. `performance-optimization` - Focused initiative

### Phase Usage Guidelines

- Phases group related features and tasks toward a common milestone
- Tasks and features are assigned to phases based on release planning
- Phases help prioritize and schedule work
- New phases are created for major releases or initiatives

## Task Statuses: Work Progress Tracking

Task statuses (not phases) track the lifecycle of individual tasks:

### Standard Statuses

1. `planning` - Requirements gathering, design, architecture decisions
2. `implementation` - Active development and coding  
3. `testing` - Testing, QA, and validation
4. `review` - Code review, refinement, and quality checks
5. `deployment` - Release preparation and deployment
6. `done` - Completed work
7. `maintenance` - Bug fixes, updates, and ongoing support

### Special Statuses

- `spike` - Research, experimentation, and proof of concepts
- `blocked` - Tasks waiting on dependencies or external factors

### Status Usage Guidelines

- Tasks move through statuses sequentially (though some may be skipped)
- A task has exactly one status at a time
- Status transitions should be explicit and documented
- Use `blocked` when external dependencies prevent progress

## Areas: Functional Domains

Areas represent major technical or functional boundaries within the system. They help organize work by expertise and system architecture.

### Technical Areas

1. **`cli`** - Command-line interface functionality
   - CLI commands and subcommands
   - Command parsing and validation
   - Output formatting for terminal

2. **`mcp`** - MCP server and AI integration
   - MCP protocol implementation
   - Tool handlers
   - AI assistant integration

3. **`ui`** - Web interface (tasks-ui)
   - React components
   - User interface logic
   - WebSocket client integration

4. **`core`** - Core task management logic
   - Task CRUD operations
   - Business logic
   - Data models and types

5. **`docs`** - Documentation and guides
   - User documentation
   - Developer guides
   - API documentation

6. **`devops`** - Build, deployment, testing infrastructure
   - CI/CD pipelines
   - Testing frameworks
   - Build configuration

### Orchestrator Area

**`orchestrator`** - Work coordination and parallel task management
- Git worktree management
- Parallel task execution
- Context switching between tasks
- Work dispatching and coordination
- Integration management across areas

The orchestrator area is unique because it doesn't implement features directly but enables efficient management of work across all other areas.

### Area Guidelines

- Assign tasks to areas based on primary technical domain
- Cross-area work should be coordinated through integration tasks
- Areas should maintain clear boundaries and interfaces
- New areas should represent significant architectural boundaries

## Features: Deliverable Capabilities

Features represent user-facing capabilities that deliver value. They typically span multiple areas and contain multiple tasks.

### Feature Characteristics

- Has clear user value and outcomes
- Can be completed and shipped as a unit
- May touch multiple technical areas
- Contains related tasks working toward a common goal
- Has measurable success criteria

### Feature Examples

1. **"Real-time collaboration"**
   - Spans: core, mcp, ui areas
   - Delivers: Multi-user task editing

2. **"Task dependencies visualization"**
   - Spans: core, ui areas
   - Delivers: Visual dependency graphs

3. **"AI-assisted planning"**
   - Spans: mcp, core areas
   - Delivers: Automated task breakdown

### Feature Planning

- Define clear user outcomes before creating features
- Break features into tasks by area and phase
- Consider dependencies between tasks
- Document feature requirements and success criteria

## Tasks: Atomic Work Units and Communication Logs

Tasks are the fundamental units of work in Scopecraft. They serve a dual purpose as both work units and persistent logs.

### Task Dual Purpose

Tasks fulfill two critical functions:

1. **Work Unit**: 
   - Scoped to fit within a single AI session
   - Sized appropriately for the context window
   - Represents a discrete piece of functionality

2. **Communication Log**:
   - Records decisions made during implementation
   - Captures work done for future reference
   - Provides context for related tasks
   - Serves as a knowledge base across sessions

### Task Properties

- **ID**: Unique identifier (format: `TASK-YYYYMMDDHMMSS`)
- **Title**: Clear, action-oriented description
- **Type**: Category (feature, bug, enhancement, etc.)
- **Status**: Current lifecycle state (planning, implementation, done, etc.)
- **Phase**: Project/release milestone (v1, v1.1, backlog, etc.)
- **Area**: Primary functional domain
- **Feature**: Parent feature (if applicable)

### Task Internal Structure

Tasks contain sequential todo lists that guide AI execution:

```markdown
# Task: Implement User Authentication

## Todo List
- [ ] 1. Design authentication schema
- [ ] 2. Implement database models
- [ ] 3. Create authentication API endpoints
- [ ] 4. Write unit tests for auth logic
- [ ] 5. Document API endpoints
- [ ] 6. Update developer guide with auth flow
```

Key aspects:
- Todos are completed sequentially due to dependencies
- Each todo represents a specific action the AI should take
- The list provides structure for work that's too large for a single step
- Avoids confusion with "phases" by using the term "todo list"

### Task Relationships

- **Dependencies**: Tasks that must complete before this one
- **Parent-Child**: Hierarchical breakdown of work
- **Previous-Next**: Sequential ordering within a workflow

### Task Lifecycle

1. Created with `planning` status in appropriate phase
2. Status changes to `implementation` when work begins
3. Progresses through `testing` and `review` statuses
4. Reaches `done` status when complete
5. May enter `maintenance` status for ongoing support

## Organizational Examples

### Simple Feature

```
Phase: v1.1
└── Feature: "Add dark mode toggle"
    ├── Task: Design dark mode UI (Area: ui, Status: planning)
    ├── Task: Implement theme context (Area: core, Status: implementation)
    ├── Task: Create toggle component (Area: ui, Status: implementation)
    └── Task: Test theme switching (Area: ui, Status: testing)
```

### Complex Cross-Area Feature

```
Phase: v2.0
└── Feature: "Real-time collaboration"
    ├── Task: Define collaboration protocol (Area: core, Status: planning)
    ├── Task: Design UI for live updates (Area: ui, Status: planning)
    ├── Task: Implement WebSocket server (Area: mcp, Status: implementation)
    ├── Task: Add collaboration hooks (Area: core, Status: implementation)
    ├── Task: Build presence indicators (Area: ui, Status: implementation)
    ├── Task: Create conflict resolution (Area: core, Status: implementation)
    ├── Task: Integration tests (Area: core, Status: testing)
    └── Task: UI testing (Area: ui, Status: testing)
```

### Orchestrated Workflow

```
Orchestrator Management:
├── Active Worktrees
│   ├── TASK-001 (Feature A, Area: ui)
│   ├── TASK-002 (Feature A, Area: core)
│   └── TASK-003 (Feature B, Area: mcp)
└── Coordination Tasks
    ├── Integration planning
    └── Dependency management
```

### File System Example

```
.tasks/
├── backlog/
│   ├── FEATURE_real-time-collab/
│   │   ├── _overview.md
│   │   ├── TASK-20250115-100000.md  # Research collaboration protocols
│   │   └── TASK-20250116-140000.md  # Design system architecture
│   └── AREA_Core/
│       └── TASK-20250117-090000.md  # Refactor event system
│
├── v1/
│   └── FEATURE_real-time-collab/
│       ├── _overview.md              # v1 scope-specific overview
│       ├── TASK-20250120-110000.md  # Implement WebSocket server
│       └── TASK-20250121-150000.md  # Create presence tracking
│
└── v1.1/
    ├── FEATURE_real-time-collab/
    │   ├── _overview.md              # v1.1 enhancements
    │   └── TASK-20250201-130000.md  # Add conflict resolution
    └── AREA_UI/
        └── TASK-20250202-100000.md  # Improve collaboration indicators
```

## Best Practices

### When to Create Features

- Multiple related tasks serving a common user goal
- Deliverable functionality that can be shipped
- Work spanning multiple areas requiring coordination
- Significant user-facing capabilities

### Area Assignment

- Assign based on primary technical domain
- Create integration tasks for cross-area work
- Consider expertise required for implementation
- Maintain clear area boundaries

### Status Transitions

- Document reasons for status changes
- Ensure prerequisites are met before transitions
- Use `blocked` status to indicate dependencies
- Complete status requirements before moving forward

### Task Sizing

- Size tasks to fit within a single AI session
- Consider context window limitations
- Break large work into sequential todo lists
- Create separate tasks when work spans sessions

## Integration with Tools

### CLI Commands

```bash
# Area-specific queries
scopecraft task list --area ui
scopecraft task list --area core

# Feature management
scopecraft feature create "New Feature"
scopecraft feature list --status active

# Status transitions
scopecraft task update TASK-001 --status implementation

# Phase assignment
scopecraft task create --phase v1.1 --status planning
```

### MCP Tools

```
mcp__scopecraft-cmd__task_list --area=ui --status=implementation --phase=v1
mcp__scopecraft-cmd__feature_create --name="Feature Name" --phase=v1.1
mcp__scopecraft-cmd__task_update --id=TASK-001 --status=testing
```

### Claude Commands

- `/project:review` - Review tasks by phase
- `/project:feature-planning` - Plan features across areas
- `/project:orchestrate` - Manage parallel workflows

## Important Distinctions

### Scopecraft Phases = MDTM Phases

- **Phases**: Project-level milestones (v1, v1.1, backlog, initiatives)
- **Statuses**: Task-level lifecycle stages (planning → implementation → done)

Scopecraft follows the MDTM standard where phases organize work at the project/release level, while task statuses track individual work item progress.

### Features vs Areas

- **Features**: What we deliver (user capabilities)
- **Areas**: How we organize work (technical domains)

Features cross areas to deliver value, while areas maintain technical boundaries and expertise domains.

### Tasks vs Documentation

- **Tasks**: Session-scoped work units that create logs and artifacts
- **Documentation**: Permanent references created from task outcomes

Tasks serve as both work units and communication logs, but dedicated documentation tasks create the permanent documentation that lives outside the task system.

## Summary

The Scopecraft organizational structure provides a flexible yet structured approach to managing development work. By understanding the relationships between phases, areas, features, and tasks, teams can efficiently organize work, maintain context across sessions, and deliver value consistently.

Key takeaways:
- Use phases to organize releases and initiatives
- Features and areas duplicate across phases in the file system
- Tasks serve dual purposes as work units and communication logs
- Use statuses to track individual task progress
- Organize work by technical areas
- Group deliverables as features
- Size tasks for AI sessions with sequential todo lists
- Leverage orchestrator for parallel work
- Maintain clear boundaries and documentation