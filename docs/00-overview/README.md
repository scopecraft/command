---
title: "Scopecraft Documentation"
description: "Start here - comprehensive guide to understanding and using Scopecraft"
version: "1.0"
status: "stable"
category: "overview"
updated: "2025-01-07"
authors: ["system"]
related:
  - philosophy.md
  - quick-start.md
  - system-components.md
---

# Scopecraft Documentation

Welcome to Scopecraft - a system for collaborative software development that combines process, best practices, and tooling to enable effective collaboration between human and AI experts.

## What is Scopecraft?

Scopecraft is:
- **A Philosophy**: Unix-inspired approach to development tools
- **A System**: Process + practices + tools working together
- **A Bridge**: Filling gaps between existing tools
- **An Enabler**: Making human-AI collaboration natural

## Quick Navigation

### 🚀 Getting Started
- [Quick Start Guide](quick-start.md) - Get running in 5 minutes
- [Philosophy](philosophy.md) - Understand our approach
- [System Components](system-components.md) - High-level overview

### 📚 Core Concepts
- [Task System](../01-concepts/task-system.md) - How tasks work
- [Knowledge System](../01-concepts/knowledge-system.md) - Long-lived wisdom
- [Feedback Loops](../01-concepts/feedback-loops.md) - First-class collaboration
- [Entity Linking](../01-concepts/entity-linking.md) - Connecting information

### 🏗️ Architecture
- [System Architecture](../02-architecture/system-architecture.md) - Complete view
- [Service Architecture](../02-architecture/service-architecture.md) - Service design
- [Orchestration Architecture](../02-architecture/orchestration-architecture.md) - Automation patterns
- [Metadata Architecture](../02-architecture/metadata-architecture.md) - Schema-driven design

### 📖 Guides
- [User Guides](../03-guides/user/) - For daily users
- [Developer Guides](../03-guides/developer/) - For contributors
- [Operator Guides](../03-guides/operator/) - For deployment

### 📋 Reference
- [CLI Commands](../04-reference/cli/commands.md) - All commands
- [MCP APIs](../04-reference/mcp/) - Programmatic access
- [Schemas](../04-reference/schemas/) - Data formats

## Key Concepts at a Glance

### Tasks vs Features
- **Tasks**: Units of work FOR features (not the features themselves)
- **Purpose**: Enable AI collaboration with proper context
- **Workflow**: backlog → current → archive
- **Structure**: Unified documents with sections

### The Three Pillars

```
Process              Practices            Tooling
───────              ─────────            ───────
How we work     +    What works      +   What we use
                     well
```

### Feedback as First-Class

```markdown
## Questions
- [ ] Should we use Redis or PostgreSQL?
- [x] Approved: PostgreSQL for consistency

## Decisions  
- Chose PostgreSQL because already in stack
- Trade-off: Less flexible caching
```

## For Different Audiences

### For Individual Developers
- Lightweight task management with AI assistance
- Knowledge capture that grows with your project
- Seamless AI collaboration without context loss

### For Teams
- Shared understanding through linked entities
- Preserved decisions and rationale
- Multiple valid views of the same work

### For AI Agents
- Rich context from task relationships
- Clear structure for information extraction
- Continuous feedback for improvement

## Design Principles

1. **Unix Philosophy** - Small tools that do one thing well
2. **Progressive Enhancement** - Start simple, grow as needed
3. **Guide, Don't Cage** - Advisory structure, not rigid rules
4. **AI-Native** - Designed for AI consumption and production
5. **Human-Centric** - Humans maintain control and judgment

## Getting Help

- **Quick Start**: [Jump to Quick Start](quick-start.md)
- **Concepts**: [Understand Core Concepts](../01-concepts/)
- **Examples**: [See Real Examples](../03-guides/user/)
- **Reference**: [Look up Commands](../04-reference/)

## Contributing

See our [Development Guide](../05-development/README.md) for:
- Code style and standards
- Repository structure
- How to submit changes
- Testing guidelines

## Document Status

This documentation uses status markers:
- `draft` - Work in progress, may change
- `stable` - Ready for use, backwards compatible
- `deprecated` - Scheduled for removal

## Version

Current documentation version: 1.0
Compatible with Scopecraft: v2.x

---

Ready to dive in? Start with our [Quick Start Guide](quick-start.md) or explore the [Philosophy](philosophy.md) behind Scopecraft.