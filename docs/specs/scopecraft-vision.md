# Scopecraft Vision: Unix Philosophy for AI-Assisted Development

## Executive Summary

Scopecraft is an open, composable system for AI-assisted software development that follows the Unix philosophy: small tools that do one thing well, connected through universal interfaces (markdown and natural language). It provides a coordination layer for managing knowledge and tasks while remaining open to integration with any external tool or service.

## Core Philosophy

### 1. Guide, Don't Cage
- All structure is advisory, never mandatory
- Teams adapt the system to their workflow, not vice versa
- Progressive formalization: start simple, evolve what proves valuable
- Multiple valid perspectives on the same data

### 2. Unix-Inspired Design
- **Do One Thing Well**: Scopecraft manages tasks and knowledge, nothing more
- **Universal Interface**: Everything is markdown text
- **Composability**: Integrate with GitHub, Jira, Linear, or any tool via MCP
- **Pipeline-Friendly**: Output from one tool feeds naturally into another

### 3. AI-First, Human-Centric
- Designed for AI agents to consume and produce content
- Natural language as the primary interface
- Humans maintain control and context
- AI amplifies human capability, doesn't replace judgment

## System Architecture

### The Dual-System Core

Scopecraft separates concerns into two complementary systems:

```
┌─────────────────────────────────────────────────────────┐
│                   SCOPECRAFT CORE                       │
├─────────────────────────┬───────────────────────────────┤
│   KNOWLEDGE SYSTEM      │      TASK SYSTEM             │
│   (Archivist Role)      │      (Developer Role)        │
│                         │                               │
│   • Patterns            │      • Features              │
│   • Architectures       │      • Tasks                 │
│   • Decisions           │      • Work Documents        │
│   • Standards           │      • Sprints               │
│                         │                               │
│   Long-lived           │      Short-lived             │
│   Reference material   │      Tactical work           │
└─────────────────────────┴───────────────────────────────┘
```

**Knowledge System** ([Details](./ai-first-knowledge-system-vision.md))
- Stable, growing repository of wisdom
- Architectural patterns, API contracts, design standards
- Referenced frequently, updated deliberately
- Lives in `/knowledge` directory

**Task System**
- Tactical, feature-focused work
- Tasks, PRDs, implementation notes
- Created for delivery, archived when complete
- Lives in `/.tasks` directory

### Natural Entity Linking

Scopecraft uses markdown-native syntax for creating relationships:

- `@entity:name` - Managed entities (tasks, features, milestones)
- `#tag:name` - Conceptual references (modules, patterns)

Example:
```markdown
This `@task:AUTH-001` implements `@feature:oauth-login` 
using `#pattern:jwt-tokens` in the `#module:auth-service`.
```

These links create an organic knowledge graph that AI agents can traverse to gather context.

### Progressive Formalization

```
Tag Usage → Pattern Recognition → Entity Promotion → Rich Relationships
    └─────────────┴──────────────────┴─────────────────┘
              AI assists at each transition
```

1. **Start Simple**: Use `#auth` tag casually
2. **Notice Patterns**: AI identifies frequent usage
3. **Promote When Valuable**: Create `@module:auth-service` entity
4. **Build Relationships**: Connect to features, tasks, patterns

## Integration Philosophy

### Open Ecosystem

Scopecraft is designed to integrate, not isolate:

```
         External Tools                    Scopecraft
    ┌──────────────────┐            ┌────────────────────┐
    │   GitHub         │◄──────────►│                    │
    │   • Issues       │            │   Task System      │
    │   • PRs          │            │                    │
    │   • Projects     │            │   Knowledge System │
    ├──────────────────┤            │                    │
    │   Linear/Jira    │◄──────────►│   Mode System      │
    │   • Tickets      │            │                    │
    │   • Epics        │            │   Natural Linking  │
    ├──────────────────┤            │                    │
    │   Slack          │◄──────────►│                    │
    │   • Threads      │            └────────────────────┘
    │   • Decisions    │                      ▲
    └──────────────────┘                      │
                                              ▼
                                    ┌────────────────────┐
                                    │   AI Agents        │
                                    │   • Claude         │
                                    │   • GPT            │
                                    │   • Local LLMs     │
                                    └────────────────────┘
```

### Integration Examples

**GitHub Integration**:
```bash
# Pull GitHub issue context into Scopecraft task
sc task create --from-github-issue 123

# Sync task status back to GitHub
sc task complete AUTH-001 --update-github
```

**AI Agent Integration**:
```markdown
# Agent reads task with full context
task = mcp__scopecraft__task_get("AUTH-001")
# Follows links to load patterns, decisions, related work
context = mcp__scopecraft__context_load(task.links)
```

**Custom Tool Integration**:
```javascript
// Any tool can read/write markdown files
const task = parseMarkdown(fs.readFileSync('.tasks/AUTH-001.md'))
// Process with your tool
const enriched = myTool.analyze(task)
// Write back
fs.writeFileSync('.tasks/AUTH-001.md', stringifyMarkdown(enriched))
```

## Composable Components

### 1. Core Systems
- **Task Management**: Create, track, complete work items
- **Knowledge Base**: Capture and reference long-lived wisdom
- **Natural Linking**: Connect any entity to any other

### 2. Optional Enhancements
- **Mode System**: Guided workflows for common patterns
- **Work Documents**: Rich context for features
- **UI Interfaces**: Visual task boards, relationship graphs
- **MCP Servers**: Programmatic access for AI agents

### 3. External Integrations
- **Version Control**: Git, GitHub, GitLab
- **Project Management**: Jira, Linear, Asana
- **Communication**: Slack, Discord, Teams
- **AI Platforms**: OpenAI, Anthropic, local models

## User Workflows

### The Developer Experience

```bash
# Morning: Check what needs doing
sc task next

# Start work: Gather context
sc mode explore @feature:oauth-login

# Design: Make decisions
sc mode design @feature:oauth-login
# Creates technical-approach.md

# Implement: Build with AI assistance
sc mode implement @task:AUTH-001
# AI has full context from exploration and design

# Complete: Update and sync
sc task complete AUTH-001
gh pr create --body "$(sc task export AUTH-001)"
```

### The AI Experience

AI agents see a rich, interconnected graph:
- Current task with full context
- Related patterns from knowledge base
- Previous decisions and their rationale
- Connected work across the system

This enables AI to provide contextually aware assistance without repeated explanations.

### The Team Experience

Multiple valid views of the same work:
- **Product Manager**: Features and milestones
- **Tech Lead**: Modules and architectures  
- **Developer**: Tasks and implementations
- **Stakeholder**: Progress and blockers

No forced hierarchy - each role sees their natural organization.

## Success Metrics

### For Developers
- Less context switching between tools
- AI understands project context without repeated explanation
- Natural workflow with progressive enhancement
- Find any information within seconds

### For Teams  
- Knowledge captured naturally during work
- Decisions traceable to their context
- Onboarding time reduced by 50%
- Cross-functional visibility without extra process

### For AI Agents
- 90%+ context accuracy on first attempt
- Natural language queries resolve correctly
- Relationship inference matches human understanding
- Progressive learning of team patterns

## Implementation Strategy

### Phase 1: Foundation (Current)
- [x] Basic task and phase management
- [x] MCP server for AI access
- [ ] Work document support
- [ ] Natural entity linking parser

### Phase 2: Integration
- [ ] GitHub MCP integration  
- [ ] Multi-tool sync protocols
- [ ] Relationship graph builder
- [ ] Context auto-loading

### Phase 3: Intelligence
- [ ] Pattern recognition for tag→entity promotion
- [ ] Workflow learning and suggestion
- [ ] Cross-tool relationship mapping
- [ ] Advanced AI context preparation

### Phase 4: Ecosystem
- [ ] Plugin architecture for custom tools
- [ ] Public MCP server registry
- [ ] Community workflow sharing
- [ ] Enterprise integration patterns

## Design Principles

### 1. Text-First
- Markdown as source of truth
- No proprietary formats
- Git-friendly diffing and merging
- Human-readable without tools

### 2. Loose Coupling
- Components communicate through files and MCP
- No hard dependencies between systems
- Graceful degradation when components unavailable
- Easy to replace any component

### 3. Progressive Enhancement
- Start with simple markdown files
- Add structure as patterns emerge
- Formalize only what provides value
- Never require upfront schema design

### 4. AI-Native
- Every feature considers AI consumption
- Natural language as first-class interface
- Context gathering built into workflows
- Learning and adaptation over enforcement

## The Scopecraft Promise

We believe development tools should:
- **Amplify** human capability, not constrain it
- **Connect** naturally with existing workflows
- **Learn** from usage patterns, not dictate them
- **Open** possibilities, not close them off

Scopecraft embodies these beliefs through its Unix-inspired, AI-first, human-centric design. It's not another project management tool - it's a philosophy for how humans and AI can work together effectively.

## Next Steps

- Explore the [Knowledge System Design](./ai-first-knowledge-system-vision.md)
- Learn about the Task System (coming soon)
- Understand the [Mode System](../development-modes-guide.md)
- Try the [Getting Started Guide](../README.md)

---

*"The best tool is the one that gets out of your way while making you more capable."*