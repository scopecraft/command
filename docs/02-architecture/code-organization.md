---
title: "Code Organization Architecture"
description: "How the Scopecraft codebase is organized following Unix philosophy"
version: "1.0"
status: "draft"
category: "architecture"
updated: "2025-01-07"
authors: ["system"]
related:
  - system-architecture.md
  - service-architecture.md
  - ../01-concepts/philosophy.md
---

# Code Organization Architecture

## Table of Contents

1. [Overview](#overview)
2. [Package Structure](#package-structure)
3. [Design Principles](#design-principles)
4. [System vs User Assets](#system-vs-user-assets)
5. [Template System](#template-system)
6. [Package Responsibilities](#package-responsibilities)
7. [Alternative Approaches](#alternative-approaches)

## Overview

Scopecraft's codebase follows Unix philosophy principles - small, composable packages that each do one thing well. The organization separates core domain logic from interfaces, templates from user customizations, and system components from project-specific configurations.

## Package Structure

```
scopecraft-v2/                    # Current implementation structure
├── src/
│   ├── core/                    # Domain logic and business rules
│   │   ├── paths/               # Path resolution system (NEW)
│   │   │   ├── path-resolver.ts # Main resolution logic
│   │   │   ├── strategies.ts    # Storage strategies
│   │   │   ├── types.ts         # Path types & interfaces
│   │   │   ├── cache.ts         # Path caching
│   │   │   └── migration.ts     # Storage migration
│   │   ├── config/              # Configuration management (NEW)
│   │   │   ├── configuration-manager.ts
│   │   │   └── types.ts
│   │   ├── environment/         # Execution environments
│   │   ├── metadata/            # Task metadata handling
│   │   ├── worktree/            # Git worktree management
│   │   ├── task-storage-path-encoder.ts  # Path encoding (NEW)
│   │   ├── task-crud.ts         # Task operations
│   │   ├── parent-tasks.ts      # Parent task management
│   │   ├── task-parser.ts       # Markdown parsing
│   │   ├── template-manager.ts  # Template handling
│   │   └── types.ts             # Core types
│   │
│   ├── cli/                     # Command line interface
│   │   ├── commands/            # Command implementations
│   │   ├── cli.ts              # CLI entry point
│   │   ├── init.ts             # Project initialization
│   │   └── formatters.ts       # Output formatting
│   │
│   ├── mcp/                     # MCP protocol server
│   │   ├── handlers/            # Request handlers
│   │   ├── server.ts           # MCP server setup
│   │   └── schemas.ts          # Protocol schemas
│   │
│   ├── integrations/            # External integrations
│   │   └── channelcoder/        # ChannelCoder integration
│   │       ├── client.ts
│   │       ├── session-storage.ts
│   │       └── helpers.ts
│   │
│   ├── observability/           # Logging and monitoring
│   │   └── logger.ts
│   │
│   └── templates/               # Task templates
│       ├── 01_feature.md
│       ├── 02_bug.md
│       └── [other templates]
│
├── .tasks/                      # Project's own tasks
│   ├── backlog/
│   ├── current/
│   └── archive/
│
└── docs/                        # Documentation
    └── 02-architecture/         # Architecture docs
```

## Design Principles

### 1. Core is Pure Domain Logic
- No UI concerns
- No transport protocols
- No external dependencies
- Just business rules and domain models

### 2. Interfaces are Adapters
- Transform between external world and core
- Each interface owns its transport protocol
- Can be developed and deployed independently

### 3. Services Communicate Through Interfaces
```
CLI → Task Service Interface → Task Service Implementation
MCP → Task Service Interface → Task Service Implementation
UI  → Task Service Interface → Task Service Implementation
```

### 4. Templates are Content, Not Code
- Ship as markdown files
- Loaded at runtime by services
- Easy to modify without touching code
- Users can override with their own

### 5. Apps are Thin Composition Layers
- Wire up services
- Configure dependencies
- Handle startup/shutdown
- No business logic

## System vs User Assets

### System Templates (Ship with Scopecraft)

```
templates/
├── modes/                      # Base behaviors
│   ├── exploration/base.md     # Generic exploration approach
│   ├── implementation/base.md  # Generic implementation approach
│   └── orchestration/          # System-level modes
│       └── autonomous.md       # The router mode
└── guidance/                   # Reusable patterns
    ├── react-patterns.md       # General React guidance
    └── security-patterns.md    # General security guidance
```

### User's Project Structure (Created by Scopecraft)

```
their-project/
├── .tasks/
│   ├── .modes/                 # Their customizations
│   │   ├── exploration/
│   │   │   ├── base.md        # Extends system template
│   │   │   └── area/          # Their project-specific
│   │   │       └── api.md     # Their API patterns
│   │   └── guidance/          # Their patterns
│   │       └── our-style.md   # Their conventions
│   ├── backlog/
│   ├── current/
│   └── archive/
└── [their code]
```

### Loading Order

1. Check user's `.tasks/.modes/exploration/base.md`
2. Fall back to system `templates/modes/exploration/base.md`
3. Compose with user's area-specific and guidance files

This ensures:
- New users get working modes out of the box
- Advanced users can customize everything
- System modes stay consistent
- Our dogfooding doesn't confuse the system

## Template System

### Mode Template Structure

```
templates/modes/exploration/
├── base.md                     # Core exploration mindset
├── README.md                   # How to customize
└── examples/                   # Example customizations
    ├── research-heavy.md
    └── quick-spike.md
```

### Guidance Library Structure

```
templates/guidance/
├── README.md                   # How to use guidance
├── by-technology/              # Tech-specific patterns
│   ├── react-patterns.md
│   ├── vue-patterns.md
│   └── node-patterns.md
├── by-domain/                  # Domain patterns
│   ├── api-design.md
│   ├── security.md
│   └── performance.md
└── by-practice/                # Best practices
    ├── testing.md
    ├── documentation.md
    └── code-review.md
```

## Storage Architecture Components

### Path Resolution System (`core/paths/`)

The path resolution system is the single source of truth for all path operations:

- **path-resolver.ts**: Main API for resolving paths
- **strategies.ts**: Defines storage strategies (repo vs centralized)
- **types.ts**: Type definitions for path contexts and strategies
- **cache.ts**: Performance optimization for path lookups
- **migration.ts**: Handles migration between storage modes

### Configuration Management (`core/config/`)

Manages storage mode and project configuration:

- **configuration-manager.ts**: Handles storage mode flags and project settings
- **types.ts**: Configuration type definitions

### Path Encoding (`core/task-storage-path-encoder.ts`)

Encodes project paths for centralized storage:
- Converts `/Users/alice/projects/myapp` → `users-alice-projects-myapp`
- Provides methods for encoding/decoding paths
- Generates storage roots for different data types

## Package Responsibilities

### Core Packages

| Package | Responsibility | Dependencies |
|---------|----------------|--------------|
| task-service | Task CRUD, workflow, relations | None |
| session-service | AI session lifecycle | ChannelCoder SDK |
| context-service | Gather AI context | task-service |
| environment-service | Manage execution environments | None |
| orchestration | Coordinate workflows | All services |

### Interface Packages

| Package | Responsibility | Dependencies |
|---------|----------------|--------------|
| cli | Command-line interface | Core services |
| mcp-server | MCP protocol server | Core services |
| api | REST/GraphQL API | Core services |

### Storage Packages

| Package | Responsibility | Dependencies |
|---------|----------------|--------------|
| path-resolver | Centralized path resolution | None |
| task-storage-path-encoder | Project path encoding | None |
| configuration-manager | Storage mode configuration | None |

## Alternative Approaches

### Simpler Monolithic Structure

For initial implementation or smaller teams:

```
src/
├── core/
│   ├── services/        # All domain services
│   ├── types/           # Shared types
│   └── index.ts         # Public API
│
├── interfaces/
│   ├── cli/
│   ├── mcp/
│   └── api/
│
├── ui/                  # Web UIs
├── storage/             # Storage adapters
├── templates/           # System templates
└── tools/               # Utilities
```

### Microservices Structure

For larger scale deployment:

```
repos/
├── scopecraft-core/     # Core services as library
├── scopecraft-cli/      # Standalone CLI
├── scopecraft-mcp/      # Standalone MCP server
├── scopecraft-web/      # Web application
└── scopecraft-templates/# Template library
```

## Benefits of This Organization

1. **Testability**: Core logic has no external dependencies
2. **Replaceability**: Swap implementations easily
3. **Deployability**: Package apps separately
4. **Maintainability**: Clear boundaries
5. **Scalability**: Extract to separate repos later
6. **Discoverability**: Obvious where code belongs

## Key Takeaway

The organization reflects Scopecraft's philosophy:
- Small, focused packages (Unix philosophy)
- Clear separation of concerns
- Templates enable customization
- Dogfooding keeps us honest
- Structure supports growth

This architecture allows Scopecraft to start simple and grow sophisticatedly while maintaining clarity and composability throughout.