---
title: "Scopecraft Philosophy"
description: "Unix philosophy and core principles that guide Scopecraft"
version: "1.0"
status: "draft"
category: "concept"
updated: "2025-01-07"
authors: ["system"]
related:
  - ../02-architecture/system-architecture.md
  - ../specs/scopecraft-vision.md
---

# Scopecraft Philosophy

## Table of Contents

1. [Overview](#overview)
2. [Unix Philosophy](#unix-philosophy)
3. [Core Principles](#core-principles)
4. [Design Philosophy](#design-philosophy)
5. [Collaboration Philosophy](#collaboration-philosophy)
6. [Progressive Enhancement](#progressive-enhancement)
7. [Real-World Application](#real-world-application)

## Overview

Scopecraft embodies the Unix philosophy in a modern context, creating tools that do one thing well and compose naturally. It's designed to fill gaps between existing tools while respecting what already works.

## Unix Philosophy

### Do One Thing Well

Each Scopecraft component has a single, clear purpose:

```
Task Service      → Manage tasks and workflow
Session Service   → Run AI sessions
Context Service   → Gather information
Environment Service → Manage execution contexts
```

### Everything is a File

In Scopecraft, everything is markdown:
- Tasks are markdown files with YAML frontmatter
- Knowledge entries are markdown documents
- All data is human-readable text
- Git-friendly by design

### Composition Over Monoliths

```bash
# Unix pipeline philosophy in action
sc task get AUTH-001 | sc session start --mode implement
sc session logs SESSION-123 | sc task update AUTH-001 --section log

# Each tool can be used independently
sc task list --current
channelcoder start implement
tw-start AUTH-001
```

### Text Streams

All tools produce and consume text:
- Markdown for structured data
- JSON for API communication
- Plain text for logs
- Standard streams for piping

## Core Principles

### 1. Guide, Don't Cage

```
Traditional:                 Scopecraft:
───────────                 ──────────
Rigid workflows      →      Advisory structure
Required fields      →      Progressive requirements
Fixed schemas        →      Extensible patterns
Enforced process     →      Emergent practices
```

### 2. AI-Native, Human-Centric

AI is a first-class citizen, but humans maintain control:

```
┌─────────────────────────────────────────────────────────┐
│                 AI-HUMAN BALANCE                         │
│                                                          │
│  AI Excels At:              Humans Excel At:           │
│  ─────────────              ─────────────────           │
│  • Pattern matching         • Strategic decisions      │
│  • Code generation         • Creative solutions       │
│  • Tedious tasks           • Context understanding    │
│  • Consistency             • Judgment calls          │
│                                                          │
│  Scopecraft enables both to work at their best         │
└─────────────────────────────────────────────────────────┘
```

### 3. Progressive Enhancement

Start simple, add complexity only when needed:

```
Level 1: Markdown files
         ↓
Level 2: Add frontmatter metadata
         ↓
Level 3: Use entity linking
         ↓
Level 4: Enable automation
         ↓
Level 5: Multi-agent orchestration
```

### 4. Pluggable Architecture

Any component can be replaced:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Default Task │ OR  │ GitHub Issue │ OR  │ Linear Task  │
│   Service    │     │   Adapter    │     │   Adapter    │
└──────────────┘     └──────────────┘     └──────────────┘
         ↓                    ↓                    ↓
         └────────────────────┴────────────────────┘
                              │
                    Same Task Interface
```

## Design Philosophy

### Emergent Structure

Structure emerges from use, not upfront design:

```
Week 1:  "Let's track decisions somehow"
Week 4:  Pattern emerges: "Decision: X because Y"
Week 8:  Tool offers template for decisions
Week 12: Cross-task decision queries available
```

### Multiple Valid Perspectives

Different roles see different views of the same data:

```
Product Manager          Developer              AI Agent
───────────────         ─────────              ────────
Features & Milestones   Tasks & Code           Full Context Graph
User Stories            Implementation         Entity Relations
Progress Tracking       Technical Details      Knowledge Links
```

### Context Preservation

Context flows naturally through the system:

```
Task Context → Session Context → Execution Context → Output Context
     ↓               ↓                  ↓                ↓
  What to do    What to know      Where to run     What happened
```

## Collaboration Philosophy

### Feedback as First-Class

Feedback and questions aren't afterthoughts:

```markdown
## Questions
- [ ] Should we use Redis or PostgreSQL for caching?
- [x] Approved: Use PostgreSQL with materialized views

## Decisions
- Chose PostgreSQL because:
  - Already in our stack
  - Sufficient performance
  - Simpler operations
```

### Expert Collaboration Pattern

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│  Propose │ ──→ │ Question  │ ←── │ Execute  │
│ (Human)  │     │ (System)  │     │  (AI)    │
└──────────┘     └───────────┘     └──────────┘
      ↑                                   │
      └──────────── Refine ←─────────────┘
```

### Continuous Learning

The system learns from usage:
- Patterns become templates
- Repeated questions become checks
- Common workflows become modes
- Successful strategies become defaults

## Progressive Enhancement

### In Practice

```
Day 1:   Create task with `sc task create "Fix login bug"`
Day 5:   Add context with sections
Day 10:  Link related tasks with @mentions
Day 20:  Use AI mode for implementation
Day 30:  Automate with orchestration
```

### No Forced Adoption

Use what provides value:
- Don't need AI? Use as task tracker
- Don't need automation? Use CLI only
- Don't need knowledge base? Focus on tasks
- Need everything? It's all there

### Graceful Degradation

System works at any level:
```
Full System:     Tasks + Knowledge + AI + Automation
Degraded:        Tasks + Knowledge + AI
Minimal:         Tasks + Knowledge
Bare:            Tasks only
```

## Real-World Application

### Filling Gaps

Scopecraft fills gaps between tools:

```
GitHub Issue  ←→  [Scopecraft Task]  ←→  AI Context
     ↓                    ↓                   ↓
Code Storage      Work Management      Intelligent Help

The gap: These tools don't naturally share context
Solution: Scopecraft as connective tissue
```

### Respecting Existing Tools

We don't replace, we enhance:
- GitHub remains source of truth for code
- Jira/Linear remain project management
- Slack remains communication
- Scopecraft connects them all

### Practical Over Perfect

```
Academic:                    Scopecraft:
─────────                    ──────────
Perfect ontology      →      Good enough structure
Complete taxonomy     →      Emergent categories  
Rigid consistency     →      Local coherence
Theoretical purity    →      Practical utility
```

## Summary

Scopecraft's philosophy can be summarized as:

1. **Do one thing well** - Each tool has clear purpose
2. **Compose naturally** - Tools work together
3. **Start simple** - Complexity is optional
4. **Respect users** - Guide, don't cage
5. **Enable experts** - Human and AI collaboration
6. **Learn and adapt** - System evolves with use

This philosophy ensures Scopecraft remains a tool that empowers rather than constrains, enhances rather than replaces, and evolves rather than stagnates.

## Next Steps

- Explore [System Architecture](../02-architecture/system-architecture.md) to see philosophy in practice
- Read [Task System](task-system.md) for concrete implementation
- Try [Quick Start](../00-overview/quick-start.md) to experience it yourself