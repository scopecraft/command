---
title: "Scopecraft System Architecture"
description: "Complete system view showing process, practices, and tooling"
version: "1.0"
status: "draft"
category: "architecture"
updated: "2025-01-07"
authors: ["system"]
related:
  - service-architecture.md
  - ../01-concepts/philosophy.md
  - orchestration-architecture.md
---

# Scopecraft System Architecture

## Table of Contents

1. [Overview](#overview)
2. [System Philosophy](#system-philosophy)
3. [Complete System View](#complete-system-view)
4. [The Three Pillars](#the-three-pillars)
5. [Collaboration Model](#collaboration-model)
6. [Gap-Filling Philosophy](#gap-filling-philosophy)
7. [Implementation Layers](#implementation-layers)
8. [Key Principles](#key-principles)

## Overview

Scopecraft is a **system** for collaborative software development that combines process, best practices, and tooling. It's designed to fill the gaps between existing tools and enable effective collaboration between human and AI experts.

**Important Note on Tasks**: Scopecraft "tasks" represent work units FOR features, not the features themselves. While they can serve as lightweight project management for individual developers, they're designed to complement, not replace, full project management systems.

## System Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCOPECRAFT SYSTEM                             │
│         "Filling gaps between tools and solutions"               │
│                                                                  │
│  ┌─────────────┬──────────────────┬─────────────────────────┐  │
│  │   PROCESS   │  BEST PRACTICES  │       TOOLING           │  │
│  │             │                  │                         │  │
│  │ • Workflow  │ • Expert collab  │ • Unix philosophy      │  │
│  │ • Feedback  │ • Back & forth   │ • Pluggable parts      │  │
│  │ • Questions │ • Progressive    │ • Standard interfaces  │  │
│  │ • Iteration │ • Context aware  │ • AI + Human friendly  │  │
│  └─────────────┴──────────────────┴─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Complete System View

```
┌─────────────────────────────────────────────────────────────────┐
│                      SCOPECRAFT SYSTEM                           │
│                                                                  │
│   PROCESS LAYER           PRACTICE LAYER         TOOL LAYER     │
│   ─────────────           ──────────────         ──────────     │
│   How we work             What works well        What we use    │
│                                                                  │
│   • Task workflow         • Expert collab        • MCP servers  │
│   • Feedback loops        • Context building     • CLI tools    │
│   • Question flow         • Progressive work     • Integrations │
│   • Decision capture      • Learn & adapt        • Plugins      │
│                                                                  │
│   All connected by:                                              │
│   ────────────────                                              │
│   • Markdown as universal format                                 │
│   • Entity links as connective tissue                            │
│   • Feedback/questions as first-class data                       │
│   • Pluggable architecture (replace any piece)                   │
│                                                                  │
│   Result:                                                        │
│   ───────                                                        │
│   A system where experts (human or AI) can collaborate          │
│   effectively with full context and continuous feedback          │
└─────────────────────────────────────────────────────────────────┘
```

## The Three Pillars

### 1. Process - How We Work

The process layer defines flexible workflows that guide without constraining:

- **Task Workflow**: Backlog → Current → Archive movement
- **Feedback Loops**: Continuous refinement through Q&A
- **Question Flow**: First-class citizen for uncertainty
- **Decision Capture**: Why choices were made

### 2. Best Practices - What Works Well

Proven patterns for effective development:

- **Expert Collaboration**: Human and AI working as peers
- **Context Building**: Progressive knowledge accumulation
- **Progressive Work**: Start simple, enhance as needed
- **Learn & Adapt**: System evolves with usage

### 3. Tooling - What We Use

Composable tools following Unix philosophy:

- **MCP Servers**: Programmatic access to all systems
- **CLI Tools**: Command-line interface for all operations
- **Integrations**: Connect with GitHub, Linear, Jira, etc.
- **Plugins**: Extend functionality as needed

## Collaboration Model

```
┌─────────────────────────────────────────────────────────────────┐
│                  EXPERT COLLABORATION FLOW                       │
│                                                                  │
│     Human Expert                           AI Expert            │
│          │                                     │                │
│          ▼                                     ▼                │
│    ┌─────────────┐                      ┌─────────────┐       │
│    │   PROPOSE   │                      │   EXECUTE   │       │
│    │  • Ideas    │                      │  • Code     │       │
│    │  • Design   │                      │  • Research │       │
│    │  • Goals    │                      │  • Analysis │       │
│    └──────┬──────┘                      └──────┬──────┘       │
│           │                                     │               │
│           ▼                                     ▼               │
│    ┌─────────────────────────────────────────────────┐        │
│    │              FEEDBACK & QUESTIONS               │        │
│    │                (First-Class!)                   │        │
│    │                                                 │        │
│    │  • "This approach won't scale because..."      │        │
│    │  • "Should we use pattern X or Y?"            │        │
│    │  • "I need clarification on requirement Z"     │        │
│    │  • "Consider this alternative..."              │        │
│    └─────────────────────────────────────────────────┘        │
│           │                                     │               │
│           ▼                                     ▼               │
│    ┌─────────────┐                      ┌─────────────┐       │
│    │   REFINE    │                      │   ADAPT     │       │
│    │  • Iterate  │                      │  • Learn    │       │
│    │  • Improve  │                      │  • Adjust   │       │
│    │  • Decide   │                      │  • Retry    │       │
│    └─────────────┘                      └─────────────┘       │
│                                                                 │
│                     Continuous Loop                             │
└─────────────────────────────────────────────────────────────────┘
```

### Feedback as First-Class Citizen

```
┌─────────────────────────────────────────────────────────────────┐
│                 FEEDBACK AS FIRST-CLASS CITIZEN                  │
│                                                                  │
│  In Tasks:                     In Sessions:                     │
│  ─────────                     ────────────                     │
│  ## Questions                  Stream Monitoring:               │
│  - [ ] Should we use Redis?    - Real-time observation         │
│  - [x] Pattern approved         - Intervention points          │
│                                 - Course correction             │
│                                                                  │
│  ## Decisions                  Session Continuations:           │
│  - Chose PostgreSQL because... - Human provides feedback       │
│  - Rejected NoSQL due to...    - AI incorporates & continues   │
│                                                                  │
│  In Knowledge:                 In Orchestration:                │
│  ─────────────                 ─────────────────                │
│  ## Open Questions             Approval Gates:                  │
│  - Performance implications?   - Human review checkpoints      │
│  - Security considerations?    - Automated validation          │
│                                - Conditional progression        │
└─────────────────────────────────────────────────────────────────┘
```

## Gap-Filling Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILLING THE GAPS                              │
│                                                                  │
│  Traditional Tools:            Scopecraft Fills:                │
│  ─────────────────            ─────────────────                 │
│  GitHub: Code storage    →    Task context & workflow           │
│  Jira: Issue tracking    →    AI-friendly knowledge             │
│  Slack: Communication    →    Persistent Q&A in tasks           │
│  Wiki: Documentation     →    Living, linked knowledge          │
│  CI/CD: Automation       →    AI-driven orchestration          │
│                                                                  │
│  The Gap:                                                        │
│  ────────                                                        │
│  These tools don't talk to each other naturally                 │
│  They don't preserve context across boundaries                  │
│  They don't facilitate expert back-and-forth                    │
│  They weren't designed for AI collaboration                     │
│                                                                  │
│  Scopecraft's Solution:                                          │
│  ─────────────────────                                          │
│  • Universal markdown interface                                  │
│  • Entity linking across boundaries                              │
│  • Feedback/questions as structured data                         │
│  • Context preservation and propagation                          │
│  • Progressive enhancement (start simple)                        │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Layers

The system is implemented through distinct layers that can be composed:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐ │
│  │     CLI     │     MCP     │   Web UI    │     API         │ │
│  │             │   Servers   │  (tasks-ui) │   (future)      │ │
│  └──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────────┘ │
└─────────┼─────────────┼─────────────┼─────────────┼────────────┘
          │             │             │             │
          ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOMAIN SERVICES LAYER                         │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │Task Service  │Session Service│Context Service│Orchestration  │ │
│  │              │(ChannelCoder) │ (Knowledge)   │   Service     │ │
│  │• CRUD ops    │• Start/stop   │• Gather info  │• Workflows    │ │
│  │• Workflow    │• Monitor      │• Build prompts│• Automation   │ │
│  │• Relations   │• Stream logs  │• Load related │• Queues       │ │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘ │
└─────────┼──────────────┼──────────────┼──────────────┼─────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                EXECUTION ENVIRONMENT LAYER                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │  Worktrees   │    Docker    │      CI      │    Direct     │ │
│  │              │  Containers  │   Runners    │   Execution   │ │
│  │• Git isolate │• Full isolate│• Cloud exec  │• Main branch  │ │
│  │• Branch work │• Permissions │• PR trigger  │• Quick tests  │ │
│  │• Parallel    │• Resources   │• Scalable    │• No isolation │ │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘ │
└─────────┼──────────────┼──────────────┼──────────────┼─────────┘
          │              │              │              │
          └──────────────┴──────────────┴──────────────┘
                                 │
                         ┌───────▼────────┐
                         │ STORAGE LAYER  │
                         │                 │
                         │ Two Storage Modes:    │
                         │                       │
                         │ Legacy Mode:          │
                         │ • .tasks/ in repo     │
                         │ • Local to project    │
                         │                       │
                         │ Centralized Mode:     │
                         │ • ~/.scopecraft/      │
                         │   projects/           │
                         │ • Shared workspace    │
                         │ • Project isolation   │
                         │                       │
                         │ Common:               │
                         │ • Git repos           │
                         │ • File system         │
                         │ • docs/work/          │
                         └───────────────────────┘
```

### Storage Architecture

The storage layer supports two modes, controlled by feature flags:

#### Legacy Mode (Default)
- Tasks stored in `.tasks/` directory within the repository
- Simple, self-contained approach
- Good for single-project workflows
- All task data travels with the repository

#### Centralized Mode (New)
- Tasks stored in `~/.scopecraft/projects/` directory structure
- Projects identified by encoded path (base64url encoding)
- Enables cross-project workflows and shared workspaces
- Task data separate from repository (not in version control)
- Work documents remain in `docs/work/` within repository

#### Storage Path Encoding
The centralized mode uses `TaskStoragePathEncoder` to create unique project identifiers:
- Converts absolute project paths to base64url-encoded strings
- Handles path normalization and special characters
- Ensures consistent project identification across systems
- Example: `/Users/name/projects/my-app` → `dXNlcnMtbmFtZS1wcm9qZWN0cy1teS1hcHA=`

#### Migration Between Modes
- Controlled by `storageMode` configuration flag
- Migration script available for existing projects
- Both modes can coexist during transition period
- New projects use mode specified in global configuration

## Key Principles

### 1. Unix Philosophy
- Each component does one thing well
- Components communicate through standard interfaces
- Text (markdown) as universal format
- Compose simple tools for complex workflows

### 2. Progressive Enhancement
- Start with simple markdown files
- Add structure as patterns emerge
- Formalize only what provides value
- Never require upfront design

### 3. AI-Native Design
- Every feature considers AI consumption
- Natural language as primary interface
- Context gathering built into workflows
- Human maintains control and judgment

### 4. Pluggable Architecture
- Any component can be replaced
- Standard interfaces between layers
- No vendor lock-in
- Extensible through plugins

## Next Steps

- Review [Service Architecture](service-architecture.md) for detailed service boundaries
- Explore [Orchestration Architecture](orchestration-architecture.md) for automation patterns
- See [Philosophy](../01-concepts/philosophy.md) for deeper dive into principles