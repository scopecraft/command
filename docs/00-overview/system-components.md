---
title: "System Components Overview"
description: "High-level overview of Scopecraft's components and how they work together"
version: "1.0"
status: "stable"
category: "overview"
updated: "2025-01-07"
authors: ["system"]
related:
  - ../02-architecture/system-architecture.md
  - ../02-architecture/service-architecture.md
  - philosophy.md
---

# System Components Overview

## Table of Contents

1. [Component Overview](#component-overview)
2. [Core Components](#core-components)
3. [Supporting Components](#supporting-components)
4. [Integration Layer](#integration-layer)
5. [How Components Work Together](#how-components-work-together)
6. [Extension Points](#extension-points)

## Component Overview

Scopecraft consists of loosely coupled components that work together to enable collaborative development:

```
┌─────────────────────────────────────────────────────────────────┐
│                      SCOPECRAFT SYSTEM                           │
├─────────────────────────┬───────────────────────────────────────┤
│     CORE COMPONENTS     │        SUPPORTING COMPONENTS         │
│                         │                                       │
│  • Task System          │  • Session Management (AI)           │
│  • Knowledge System     │  • Execution Environments           │
│  • Entity Linking       │  • Orchestration Engine             │
│  • Feedback Loops       │  • Monitoring & Logging             │
│                         │                                       │
├─────────────────────────┴───────────────────────────────────────┤
│                    INTEGRATION LAYER                             │
│                                                                  │
│  • CLI Interface        • MCP Servers      • Web UI             │
│  • File System          • Git Integration  • External Tools     │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### Task System

**Purpose**: Manage units of work with full context

```
Features:
• Workflow states (backlog → current → archive)
• Unified document structure with sections
• Task relationships and dependencies
• Progress tracking and logging

Key Files:
• .tasks/backlog/     - Planned work
• .tasks/current/     - Active work
• .tasks/archive/     - Completed work
```

### Knowledge System

**Purpose**: Capture and organize long-lived wisdom

```
Features:
• Patterns and architectures
• Decisions and rationale
• Standards and guidelines
• Cross-project learnings

Key Concepts:
• Stable, growing repository
• Referenced frequently
• Updated deliberately
• AI-consumable format
```

### Entity Linking

**Purpose**: Create relationships between information

```
Syntax:
• @entity:name    - Managed entities (tasks, features)
• #tag:name       - Conceptual references (patterns, modules)

Example:
"Task @task:AUTH-001 implements #pattern:jwt-auth"

Benefits:
• Natural knowledge graph
• Cross-boundary references
• Progressive formalization
• AI-traversable relationships
```

### Feedback Loops

**Purpose**: Enable expert collaboration

```
Mechanisms:
• Questions in tasks
• Decision tracking
• Session interventions
• Approval gates

First-Class Features:
• Visible uncertainty
• Tracked resolutions
• Preserved context
• Continuous refinement
```

## Supporting Components

### Session Management

**Purpose**: Manage AI collaboration sessions

```
Powered by: ChannelCoder
Environments: Docker, TMux, Direct
Modes: explore, design, implement, plan

Features:
• Mode-based behavior
• Stream monitoring
• Session continuation
• Context preservation
```

### Execution Environments

**Purpose**: Isolate and manage where code runs

```
Types:
• Worktrees - Git branch isolation
• Docker - Full containerization  
• CI - Cloud execution
• Direct - No isolation

Selection Criteria:
• Safety requirements
• Resource needs
• Collaboration model
• Performance goals
```

### Orchestration Engine

**Purpose**: Coordinate multi-step workflows

```
Capabilities:
• Workflow definitions
• Queue management
• Parallel execution
• Error handling

Use Cases:
• Autonomous task execution
• Multi-agent coordination
• Complex feature delivery
• Batch operations
```

### Monitoring & Logging

**Purpose**: Observe and track system activity

```
Features:
• Real-time stream monitoring
• Activity logging
• Performance metrics
• Intervention points

Storage:
• Runtime: ~/.scopecraft/
• Historical: .tasks/archive/
• Metrics: Optional external
```

## Integration Layer

### CLI Interface

```bash
# Primary user interface
sc task create        # Task management
sc task list         # View work
dispatch implement   # AI sessions
plan "feature"       # AI planning
```

### MCP Servers

```typescript
// Programmatic access
task_get(id)         // Task operations
session_start(...)   // AI sessions
context_prepare(...) // Information gathering
```

### File System

```
Project/
├── .tasks/          # Task storage
├── .scopecraft/     # Configuration
├── knowledge/       # Knowledge base
└── [code files]     # Your project
```

### Git Integration

```
Features:
• Version control for tasks
• Branch-based workflows
• Worktree management
• History preservation
```

## How Components Work Together

### Example: Implementing a Feature

```
1. Task Creation
   └─> Task System creates work unit
   
2. Context Gathering
   ├─> Entity Linking resolves references
   └─> Knowledge System provides patterns
   
3. AI Collaboration
   ├─> Session Management starts AI
   ├─> Execution Environment provides isolation
   └─> Feedback Loops enable interaction
   
4. Orchestration
   ├─> Orchestration Engine coordinates steps
   └─> Monitoring tracks progress
   
5. Completion
   └─> Task System archives work
```

### Data Flow

```
User Input → CLI/MCP → Core Components → Storage
    ↓                         ↓              ↓
Commands              Business Logic    File System
                                          Git Repo
```

### Component Independence

Each component:
- Has single responsibility
- Communicates through interfaces
- Can be used independently
- Can be replaced/extended

## Extension Points

### Adding Components

New components can be added by:

```
1. Define clear responsibility
2. Create standard interface
3. Integrate with existing components
4. Document usage patterns

Example: Adding Analytics Component
- Responsibility: Track usage patterns
- Interface: Analytics API
- Integration: Subscribe to events
- Usage: Improve workflows
```

### Replacing Components

Components can be replaced:

```
Default Task Service → GitHub Issues Adapter
File-based Knowledge → Database-backed Knowledge
Local Execution → Cloud Execution
CLI Interface → GUI Application
```

### Custom Integrations

```
External Tools:
• Jira/Linear - Task sync
• Slack - Notifications
• GitHub - Code integration
• CI/CD - Automation triggers
```

## Key Principles

### 1. Loose Coupling
- Components don't depend on internals
- Communication through interfaces
- Change one without breaking others

### 2. Progressive Enhancement  
- Start with basics
- Add components as needed
- System works at any level

### 3. Tool Philosophy
- Each component does one thing well
- Compose for complex behavior
- Text/markdown as universal format

### 4. Extensibility
- Plugin architecture
- Standard interfaces
- Configuration over code
- Community contributions

## Component Status

| Component | Status | Stability |
|-----------|--------|-----------|
| Task System | ✅ Active | Stable |
| Knowledge System | 🚧 Building | Beta |
| Entity Linking | ✅ Active | Stable |
| Feedback Loops | ✅ Active | Stable |
| Session Management | ✅ Active | Stable |
| Environments | 🚧 Building | Beta |
| Orchestration | 📋 Planned | Alpha |
| Monitoring | 🚧 Building | Beta |

## Next Steps

- Deep dive into [System Architecture](../02-architecture/system-architecture.md)
- Explore [Service Architecture](../02-architecture/service-architecture.md)
- Learn about specific components in [Core Concepts](../01-concepts/)
- See components in action with [Quick Start](quick-start.md)