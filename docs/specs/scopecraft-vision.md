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

## The Feedback Pipeline: Human-in-the-Loop Evolution

### Composable Review System

Following our Unix philosophy, Scopecraft envisions feedback as a first-class, composable component:

```
work_output | aligner | reviewer | validator > refined_output
```

This enables:
- **Aligner agents**: Ensure outputs match original intent
- **Technical reviewers**: Validate correctness and patterns
- **Consistency checkers**: Maintain standards across work
- **Completeness validators**: Catch missing elements

Each feedback component can be:
- **Human-driven**: For critical decisions and nuanced review
- **AI-driven**: For routine validation and pattern checking
- **Hybrid**: AI suggests, human approves

### Integration with Workflow

Feedback isn't an interruption but a natural part of the pipeline:
- **Optional composition**: Use only the reviewers you need
- **Streaming or blocking**: Choose synchronous or async feedback
- **Context preservation**: Feedback becomes part of work history
- **Pattern learning**: Recurring feedback informs future work

This approach maintains human oversight while enabling autonomous execution, balancing quality with efficiency.

## Composition Patterns: Building Workflows from Primitives

### The Universal Interface: Section-Based References

Entity references use task IDs and sections, providing precise context access:

```
Mode A creates @task:explore-oauth2-0127-AB
    ↓
Mode B moves task to current/ and reads @task:explore-oauth2-0127-AB#deliverable
    ↓
Mode B creates @task:implement-oauth2-0201-DE
    ↓
Mode C updates @task:implement-oauth2-0201-DE#deliverable
```

### Configurable Dimensions

Following Unix philosophy, organizational dimensions are configurable like templates:

```yaml
# scopecraft.json
{
  "dimensions": {
    "sprint": {
      "type": "string",
      "label": "Sprint",
      "values": ["2024-S1", "2024-S2"]  // Optional enum
    },
    "version": {
      "type": "string", 
      "label": "Target Version"
    },
    "priority": {
      "type": "enum",
      "values": ["P0", "P1", "P2", "P3"]
    }
  }
}
```

This enables flexible queries without folder restructuring:
```bash
sc task list --sprint "2024-S1"
sc task list --version "2.0" --priority "P0"
sc task list current --area auth
```

### Interface-Specific Composition

**UI Composition** - Visual orchestration:
- Drag tasks between workflow states (backlog → current → archive)
- Split views for parallel work on related tasks
- Section editors for focused updates
- Real-time section collaboration

**CLI Composition** - Script-driven:
```bash
# Workflow progression
sc task move backlog/explore-oauth2-0127-AB current/
sc task start implement-oauth2-0201-DE

# Section-based operations
sc task update oauth2-0201-DE --section tasks --check "Research providers"
sc task read oauth2-0201-DE --section deliverable

# Configured dimension queries
sc task list current --sprint "2024-S1"
sc task list --area auth --status "In Progress"

# Parallel work on related tasks
for task in current/dashboard-redesign/*.task.md; do
  sc mode implement @task:${task%.task.md} &
done
```

**MCP Composition** - Programmatic:
```javascript
// AI agents orchestrating workflows
const tasks = await mcp.task_list({
  location: "current",
  area: "auth"
});

// Section-based updates
await mcp.task_update({
  id: "implement-oauth2-0201-DE",
  section: "deliverable",
  operation: "append",
  content: "## Implementation Complete\n..."
});

// Move completed work
await mcp.task_move({
  id: "implement-oauth2-0201-DE",
  to: "archive/2024-01"
});
```

### Composition Principles

1. **ID-based references** - Task IDs remain stable across moves
2. **Section targeting** - Precise updates to document parts
3. **Workflow progression** - Physical moves reflect state changes
4. **Configurable queries** - Filter by any defined dimension
5. **Smart resolution** - System searches current → backlog → archive

## Progressive Tooling Philosophy

### From Simple to Sophisticated

Scopecraft tools evolve with usage patterns rather than imposing structure upfront:

**Level 1: Basic Operations**
- Every section starts as simple markdown
- Tools provide read/write for entire sections
- No structure enforced or required

**Level 2: Pattern Recognition**
- Teams develop conventions naturally
- Tools observe repeated patterns
- Helper functions emerge for common operations

**Level 3: Structured Support**
- Validated operations for established patterns
- Rich queries across documents
- Specialized operations (queue, stack, etc.)

**Level 4: Intelligent Assistance**
- Pattern detection and suggestions
- Cross-document insights
- Workflow optimization

### Learning from Memory Bank and Context Portal

The community has shown two valid approaches to AI memory:

**File-First (Memory Bank)**
- Immediate, transparent, git-friendly
- Mode-specific memory slices
- Perfect for individual developers

**Service-First (Context Portal)**
- Structured, queryable, scalable
- Relationship graphs and semantic search
- Better for teams and multiple agents

Scopecraft embraces both paths:
- Start file-first with markdown sections
- Graduate to service-backed when pain appears
- Same tool interfaces work with either backend

### Section Evolution Example

A team's journey with decision tracking:

**Week 1**: Free-form notes in deliverable section
**Week 4**: Convention emerges: "Decision: X because Y"
**Week 8**: Tool offers decision template helper
**Week 12**: Cross-task decision queries available
**Month 6**: Decision impact graph visualization

The key: Tools follow practice, not vice versa.

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