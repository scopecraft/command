---
title: "Mode System - AI Behavior and Guidance"
description: "How modes provide intelligent AI behavior through dynamic guidance composition"
version: "1.0"
status: "draft"
category: "concept"
updated: "2025-01-07"
authors: ["system"]
related:
  - ../02-architecture/orchestration-architecture.md
  - ../specs/mode-system-v2.md
  - feedback-loops.md
---

# Mode System - AI Behavior and Guidance

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Mode Philosophy](#mode-philosophy)
4. [Architecture](#architecture)
5. [Composition Mechanism](#composition-mechanism)
6. [Available Modes](#available-modes)
7. [Execution Models](#execution-models)
8. [Mode Development](#mode-development)
9. [Relationship to Other Systems](#relationship-to-other-systems)
10. [Experimental Status](#experimental-status)

## Overview

The Mode System provides intelligent AI behavior by dynamically composing guidance based on task context. It's the "brain" that determines HOW an AI should approach different types of work - whether to explore, design, implement, or orchestrate.

**Key Insight**: Instead of hardcoded rules, the system trusts AI intelligence to select and compose relevant guidance based on task metadata and content.

## Core Concepts

### What is a Mode?

A mode is a **behavioral pattern** that defines:
- The mindset the AI should adopt (researcher, implementer, designer)
- The approach to take (explore first, build incrementally, diagnose systematically)
- The tools to prioritize (research tools, code tools, diagnostic tools)
- The output structure expected (findings, implementation, design docs)

### Mode vs Session

Understanding the relationship:

```
Task Context + Mode Guidance + Execution Environment = AI Session
     │              │                    │                   │
     What          How                 Where              Runtime
```

- **Task**: Provides the WHAT (requirements, context)
- **Mode**: Provides the HOW (approach, mindset)
- **Environment**: Provides the WHERE (worktree, Docker)
- **Session**: The actual runtime execution (via ChannelCoder)

### Sessions are Resumable

A critical feature is that sessions maintain state:
- Start autonomously with full context
- Can be interrupted and resumed
- Human can take over interactively without rebuilding context
- All history preserved in the session

## Mode Philosophy

### 1. AI-Driven Composition

The system trusts AI to intelligently compose guidance:

```markdown
<compose_guidance>
Before starting, analyze the task and load relevant guidance:
1. Look at task metadata (tags, area, type)
2. Check for area-specific guidance
3. Scan instruction for keywords
4. Load relevant general guidance
Use your judgment about what's most relevant.
</compose_guidance>
```

### 2. Simple File Structure

```
.tasks/.modes/
├── exploration/
│   ├── base.md          # Core mindset
│   └── area/            # Project-specific
│       └── ui.md
├── implementation/
│   ├── base.md
│   └── autonomous.md    # Variant
├── guidance/            # Reusable patterns
│   ├── react-patterns.md
│   └── ui-research.md
└── orchestration/
    └── autonomous.md    # Router mode
```

### 3. Progressive Enhancement

- Start with minimal structure
- Let patterns emerge through usage
- Formalize what proves valuable
- No upfront over-engineering

## Architecture

### Mode Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         MODE SYSTEM                              │
├─────────────────────────┬───────────────────────────────────────┤
│      BASE MODES         │            GUIDANCE                   │
│                         │                                       │
│  Define mindsets:       │  Provide patterns:                  │
│  • Exploration         │  • Technology-specific              │
│  • Design              │  • Domain-specific                  │
│  • Implementation      │  • Tool usage                       │
│  • Diagnosis           │  • Best practices                   │
│  • Orchestration       │                                       │
│                         │                                       │
├─────────────────────────┴───────────────────────────────────────┤
│                    COMPOSITION ENGINE                            │
│                                                                  │
│  AI reads task → Selects base mode → Loads area guidance       │
│  → Identifies relevant patterns → Composes final guidance      │
└─────────────────────────────────────────────────────────────────┘
```

### Mode Structure

Each base mode follows this pattern:

```markdown
---
name: mode-name
description: What this mode does
---

<role>
Define the mindset and expertise
</role>

<compose_guidance>
Instructions for AI to load relevant guidance
</compose_guidance>

<mission>
Core guidance and phases for this mode
</mission>
```

### Area-Specific Guidance

Areas provide project-specific patterns for different parts of your codebase:

```
.tasks/.modes/implementation/area/
├── ui.md      # Frontend patterns (React components, styling)
├── core.md    # Business logic patterns (services, domain)
├── mcp.md     # MCP server patterns (handlers, protocols)
└── cli.md     # CLI patterns (commands, formatting)
```

Areas answer: "When implementing in THIS part of the codebase, follow THESE specific patterns."

Example area file:
```markdown
# UI Area Implementation Guidance

When implementing UI features:
- Use TanStack Router for navigation
- Create Storybook stories first
- Follow our component composition patterns
- Use our established React Query hooks
```

## Composition Mechanism

### How AI Selects Guidance

The AI analyzes multiple signals:

```
Task Analysis:
├── Metadata
│   ├── Tags: ["react", "security", "performance"]
│   ├── Area: "ui" | "core" | "mcp" | "cli"
│   ├── Type: "feature" | "bug" | "spike"
│   └── Mode hint: "mode:exploration"
├── Content
│   ├── Keywords in instruction
│   ├── Problem domain
│   └── Technical context
└── Decision
    ├── Select base mode
    ├── Load area-specific guidance
    └── Include relevant patterns
```

### Example Composition Flow

```yaml
Task:
  title: "Research modern data table patterns for React app"
  type: spike
  area: ui
  tags: ["react", "research", "ui-patterns"]

AI Process:
  1. Recognizes: type:spike + "research" → Exploration mode
  2. Loads:
     - exploration/base.md (mindset)
     - exploration/area/ui.md (project UI stack)
     - guidance/react-patterns.md (React patterns)
     - guidance/ui-research.md (UI research approach)
  3. Adapts for "data table" specifics
  4. Suggests Context7 for React Table docs
```

## Available Modes

### Core Modes

| Mode | Purpose | When to Use |
|------|---------|-------------|
| **Exploration** | Research and understand | Spikes, investigations, learning |
| **Design** | Make technical decisions | Architecture, approach, trade-offs |
| **Implementation** | Build solutions | Features, fixes, enhancements |
| **Diagnosis** | Find root causes | Bugs, performance, issues |
| **Planning** | Break down work | Complex features, initiatives |
| **Orchestration** | Coordinate work | Multi-phase projects |

### Special Modes

#### Autonomous Router
The `orchestration/autonomous.md` mode is special - it's a meta-mode that:
1. Reads task metadata
2. Determines appropriate mode
3. Loads that mode's guidance
4. Documents its decision
5. Executes with selected mode

```bash
# Router automatically selects mode
./auto task-id

# Logs its decision
"Analysis: React + UI research task
 Selected Mode: exploration
 Loading: exploration/base.md, ui.md, react-patterns.md"
```

## Execution Models

### Interactive Execution

Human-driven with AI assistance:

```bash
# Start interactive session with mode
dispatch implement AUTH-001

# Human and AI collaborate
# Full back-and-forth
# Session can be paused/resumed
```

### Autonomous Execution

AI-driven with human checkpoints:

```bash
# Start autonomous session
auto AUTH-001

# AI works independently
# Documents everything
# Flags decisions for review
# Human can take over if needed
```

### Key Differences

| Aspect | Interactive | Autonomous |
|--------|------------|------------|
| Control | Human drives | AI drives |
| Feedback | Real-time | Via documentation |
| Questions | Asked directly | Documented with assumptions |
| Pace | Variable | Continuous |
| Intervention | Natural | Via session takeover |

## Mode Development

### Creating New Modes

1. **Identify Pattern**: Notice repeated approach needs
2. **Create Base Mode**: Define mindset and phases
3. **Add Composition**: Tell AI how to select guidance
4. **Test with Tasks**: Try on real work
5. **Refine**: Adjust based on results

### Adding Guidance

Drop markdown files in appropriate directories:

```markdown
# guidance/new-pattern.md

## When This Applies
[Conditions where this guidance helps]

## Key Considerations
[Important questions and factors]

## Recommended Approach
[How to tackle this type of work]
```

### Mode Evolution

Modes evolve through usage:
```
Experiment → Observe → Refine → Stabilize
     └──────────┴─────────┴──────────┘
            Continuous cycle
```

## Relationship to Other Systems

### With Task System
- Tasks provide the work context
- Modes determine how to approach the work
- Task metadata influences mode selection
- Mode execution updates task sections

### With Session Management
- Sessions are the runtime containers
- Modes are loaded INTO sessions
- One session can use multiple modes (via router)
- Sessions preserve mode execution history

### With Orchestration
- Orchestration coordinates multiple sessions
- Each session can have different mode
- Orchestration mode itself coordinates others
- Gates between phases allow mode switches

### With Feedback Loops
- Modes handle uncertainty differently
- Interactive: Ask questions directly
- Autonomous: Document assumptions
- Both: Preserve decision context

## Experimental Status

### What's Working Well ✅
- AI successfully composes guidance from context
- Base mode + area + guidance pattern is flexible
- Autonomous router selects modes intelligently
- Documentation-first approach for autonomous work
- Session resumability maintains context

### Still Exploring 🚧
- Optimal guidance granularity
- Gate handling patterns
- Multi-agent mode coordination
- Mode transition strategies
- Community sharing mechanisms

### Success Metrics
- AI selects appropriate guidance 90%+ of time
- Composed guidance feels natural
- Easy to add new patterns
- Modes are reusable across projects
- Minimal configuration required

## Key Principles

1. **Trust AI Intelligence** - Let AI figure out relevance
2. **Start Simple** - Minimal structure, maximum flexibility
3. **Documentation as Communication** - Especially for autonomous
4. **Human Readable** - Anyone can understand and modify
5. **Composable Over Complete** - Small focused pieces
6. **Autonomous by Default** - Design for independence
7. **Experiment and Measure** - Learn from usage

## Summary

The Mode System provides the "how" for AI execution:
- Dynamic guidance composition based on context
- Simple markdown-based configuration
- Trusts AI intelligence over hard rules
- Supports both interactive and autonomous execution
- Evolves through real usage patterns

It's a key component that makes Scopecraft's AI collaboration natural and effective, sitting between high-level orchestration and low-level session execution.

## Next Steps

- Explore [Available Modes](../../.tasks/.modes/) in the codebase
- Read [Mode System V2 Spec](../specs/mode-system-v2.md) for detailed design
- See [Orchestration Architecture](../02-architecture/orchestration-architecture.md) for how modes fit
- Try [Quick Start](../00-overview/quick-start.md) to experience modes in action