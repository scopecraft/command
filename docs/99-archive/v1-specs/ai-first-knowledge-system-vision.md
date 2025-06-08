# Knowledge System: Long-Lived Wisdom for AI-Assisted Development

*Part of the [Scopecraft Vision](./scopecraft-vision.md)*

## Overview

The Knowledge System is Scopecraft's long-lived repository of wisdom, patterns, and decisions. Unlike the tactical Task System, the Knowledge System grows incrementally over time, capturing architectural decisions, design patterns, API contracts, and other reference material that transcends individual features or sprints.

## Role: The Archivist

The Knowledge System acts as an organizational archivist, preserving and organizing:
- **Architectural Patterns**: How we build things
- **Design Decisions**: Why we built them that way
- **API Specifications**: Contracts between systems
- **Domain Models**: Business logic and rules
- **Standards & Guidelines**: Team conventions
- **Technical Decisions**: ADRs and rationale

## Design Philosophy

### 1. Stability Over Speed
Knowledge artifacts are designed to last. They're updated deliberately, versioned carefully, and referenced frequently. A pattern documented today should still be valuable in two years.

### 2. Discovery Over Structure  
Rather than imposing rigid taxonomies, the Knowledge System uses natural language and entity linking to create organic relationships. AI agents discover connections through content, not through folder hierarchies.

### 3. Context Over Isolation
Every piece of knowledge exists in relation to others. Patterns reference decisions, decisions link to standards, standards connect to examples. This web of relationships provides rich context for both humans and AI.

### Work Organization Structure

**Workflow-based organization with unified documents:**
```
.tasks/
  backlog/                               # Ideas and future work
    explore-oauth2-0127-AB.task.md       # id: explore-oauth2-0127-AB
    optimize-db-0128-BC.task.md          # id: optimize-db-0128-BC
    
  current/                               # Active work
    implement-oauth2-0201-DE.task.md     # id: implement-oauth2-0201-DE
    fix-login-0202-FG.task.md            # id: fix-login-0202-FG
    dashboard-redesign/                  # Complex work as folder
      _overview.md                       # Container description
      01-user-research.task.md          
      02-create-designs.task.md
      03-implement-frontend.task.md
      
  archive/                               # Completed work
    2024-01/
      billing-integration-0115-HI.task.md  # id: billing-integration-0115-HI
      security-audit-0120-JK.task.md       # id: security-audit-0120-JK
```

**ID Resolution:**
- Task IDs are based on filename only, not folder location
- References like `@task:explore-oauth2-0127-AB` search in order: current/ → backlog/ → archive/
- Moving tasks between folders doesn't break references
- Explicit paths available when needed: `@task:archive/security-audit-0120-JK`

**Unified Document Structure:**
All task files follow a consistent section-based format:

```markdown
# Title

---
type: feature|bug|chore|spike|idea
status: 🟡 To Do | 🔵 In Progress | 🟢 Done
area: auth|billing|dashboard          # Product area (permanent)
[configurable dimensions]             # sprint, version, phase, etc.
---

## Instruction
What needs to be done (required)

## Tasks  
- [ ] Subtask breakdown (required, can be empty)
- [ ] Another subtask

## Deliverable
Work outputs, findings, code, designs (required, initially empty)

## Log
Execution history and notes (required, auto-updated by tools)
```

**Note on Document Sections:** The section structure (Instruction/Tasks/Deliverable/Log) represents our current best practice but is designed for extensibility. Teams may discover needs for additional sections or different organizations. The tooling will evolve to support these variations while maintaining the core principle of unified documents with accessible sections.

### Section Philosophy: From Freeform to Structured

The unified document model supports a spectrum of section types, each serving different needs:

**Freeform Sections** - Natural markdown for human expression
- Deliverables, context, and narrative content flow naturally
- No structure imposed, maximum flexibility
- Read and write as simple text blocks

**Semi-Structured Sections** - Conventions that emerge from usage
- Decisions might naturally evolve a pattern: date, choice, rationale
- Questions might develop states: pending, answered, blocked
- Structure emerges from practice, not prescription

**Queue-Like Sections** - Natural operations for task-like content
- Tasks as a checklist invite "next task" operations
- Questions as a queue support "pop" and "answer" patterns
- Implementation logs as a stack support "push" operations

**Data-Oriented Sections** - When patterns benefit from tables
- Progress tracking might evolve into component/status tables
- Dependencies might become structured lists
- Tools can offer richer operations while maintaining markdown readability

### Tooling Evolution Pattern

As sections mature, tooling can provide progressively richer operations:

1. **Start Simple**: Every section begins as markdown read/write
2. **Observe Patterns**: Teams develop conventions (e.g., decision format)
3. **Offer Helpers**: Tools provide templates and validation
4. **Enable Queries**: Structured sections enable cross-task insights
5. **Support Workflows**: Queue operations, next-task suggestions

This evolution happens organically based on actual usage, not predetermined design.

**Key Principles:**
- **Workflow states as folders**: Physical location shows work state
- **Single source of truth**: One file contains all related information
- **Section-based access**: Tools can read/update individual sections
- **Configurable dimensions**: Teams define their own metadata fields
- **Extensible structure**: Section patterns will evolve based on usage

### Why Unified Documents with Sections

The unified document model addresses several needs:

1. **Single Source of Truth**: Everything about a piece of work lives in one file
2. **Progressive Enhancement**: Documents start simple and grow sections as needed
3. **Tooling Flexibility**: Read/update sections independently while maintaining one file
4. **Human-Friendly**: Open one file to see the full picture
5. **AI-Friendly**: Clear sections for context extraction

### Emergent Section Patterns

As teams use the system, they may discover needs for specialized sections beyond the core four:

**Context & Memory Sections**
- Links to related work, dependencies, and constraints
- Mode-specific memory that different AI personas can reference
- Accumulated knowledge that prevents repeated discoveries

**Decision & Rationale Sections**
- Choices made during the work with their reasoning
- Trade-offs considered and why alternatives were rejected
- Creates an audit trail of thinking for future reference

**Human-in-the-Loop Sections**
- Questions that need answers before proceeding
- Approvals or reviews required at checkpoints
- Collaborative notes between human and AI

**Progress & State Sections**
- Current status beyond simple todo checkboxes
- Blockers and dependencies
- Milestones achieved and upcoming

**Learning & Patterns Sections**
- Insights discovered during implementation
- Mistakes to avoid in future similar work
- Reusable patterns or code snippets

These patterns emerge from real usage rather than upfront design. The tooling philosophy supports this emergence by starting with simple markdown and adding structure only when patterns prove valuable.

**Section-Based Access Examples:**
```bash
# Read just the deliverable
sc task read current/oauth2 --section deliverable

# Update task checklist
sc task check current/oauth2 "Complete research"

# Add to execution log
sc task log current/oauth2 "Blocked on security review"

# Export section for sharing
sc task export current/oauth2 --section deliverable > oauth2-findings.md
```

**Reference Patterns:**
- `@task:oauth2-0127-AB` - Entire document (searches current → backlog → archive)
- `@task:oauth2-0127-AB#deliverable` - Specific section
- `@task:oauth2-0127-AB#tasks[2]` - Specific checklist item

### Organizational Dimensions

**Replace single hierarchy with multiple orthogonal dimensions:**

1. **Product Milestones**: V1 (marketable), V2 (advanced) - *product maturity*
2. **Delivery Phases**: Sprint 1, Release 1.0, 1.1 - *timing and resources*
3. **Features**: Login Epic, Dashboard Epic - *user value groupings*
4. **Modules**: API Layer, Auth Service - *architectural boundaries*

## Natural Entity Linking System

### Markdown-Native Syntax
- `@entity:name` - Links to managed entities (tasks, features, milestones)
- `#tag:name` - References conceptual entities (modules, patterns, decisions)

**Example Usage:**
```markdown
This task implements `@feature:login` by building the 
`#module:auth-service` using our `#pattern:jwt-tokens` approach.

Contributes to `@milestone:v1` and relates to `@task:FEAT-122`.

See `@doc:login/technical-approach` for implementation details.
```

### Progressive Entity Evolution
1. **Start as tags**: `#module:auth-service` referenced in content
2. **AI suggests patterns**: "I notice frequent auth-service references"
3. **Promote to entities**: When full CRUD management becomes valuable
4. **Rich relationships emerge**: Without upfront over-engineering

## AI-First Design Principles

### Organic Relationship Discovery
- **No forced relationship schemas** - AI infers from natural language
- **Learning vocabulary** - System adapts to team's terminology
- **Progressive enhancement** - Formalize only proven valuable patterns
- **Context auto-loading** - AI follows entity chains for rich context

### Entity Type Dictionary (Extensible)
```yaml
# Implemented entities (full CRUD)
task, feature, phase, milestone, work_document

# Tag-only entities (referenced but not managed)  
module, pattern, decision, requirement
```

### Work Document Types
```yaml
work_document_types:
  prd: "Product Requirements Document"
  trd: "Technical Requirements Document" 
  design: "Design Document"
  decision: "Implementation Decision"
  spike: "Research/Investigation Document"
  retrospective: "Post-implementation Review"
```

### Relationship Types (AI-Inferred)
```yaml
implements, uses, contributes_to, blocks, relates_to, supersedes, documents, specifies
```

## User Experience

### Natural Writing Flow
- Write markdown naturally with entity references
- AI builds relationship graph automatically  
- No metadata overhead or schema validation
- GitHub-style auto-completion and linking

### AI Context Loading
**For current work, AI automatically loads:**
1. Current task context (what we're building)
2. Relevant knowledge modules (how we build things)
3. Related work documents (PRD/TRD for this feature)
4. Connected entities via relationship graph

### Work Document Integration
- **Contextual discovery**: AI suggests relevant work docs based on task content
- **Cross-referencing**: Work documents can reference each other and tasks
- **Temporal context**: Implementation decisions captured at feature level
- **Archive together**: Feature completion archives all related work documents

### Progressive Formalization
- Start with loose tagging and natural references
- AI suggests when concepts deserve formal entity status
- Promote high-value tags to full entities with CRUD operations
- Maintain backward compatibility with tag references

## Success Criteria

- AI can automatically load relevant context for any task
- Natural markdown writing creates discoverable relationships
- Multiple organizational dimensions coexist without conflict
- System learns team vocabulary rather than forcing rigid schemas
- Zero maintenance overhead for relationship management
- Smooth transition from current system without data loss
- Work documents provide rich feature context without cluttering task details

## Implementation Strategy

### Phase 1: Foundation
- Implement dual entity system (@entities vs #tags) 
- Add milestone dimension separate from phases
- Create markdown parsing for entity references
- Add work document support within features

### Phase 2: AI Integration
- Auto-complete entity references during writing
- Relationship inference from natural language
- Context auto-loading based on entity graphs
- Work document context suggestions

### Phase 3: Progressive Enhancement
- Tag-to-entity promotion workflows
- Rich relationship visualization
- Advanced AI context suggestions
- Work document templates and automation

## Benefits

**For Developers:**
- Natural writing experience with powerful linking
- Rich context automatically available
- No forced organizational overhead
- Clear separation between task work and feature context

**For AI:**
- Rich, structured context for better assistance
- Relationship graphs for comprehensive understanding  
- Progressive learning of team patterns and vocabulary
- Feature-level work documents for implementation context

**For Teams:**
- Multiple valid organizational views of same data
- Separation of concerns between knowledge and implementation
- Organic growth of formalized patterns as needed
- Feature-scoped work documents for better organization

## Original Brainstorm Context

Areas shouldnt exist as folder that can receive features underneath.

Instead, they should be a a tag and an area could contain documents and general features inside this area (similar to module).

This way, it wouldnt be a OR. A feature is part of an area, and can be delivered inside a phase.

---

**Source**: Originally brainstormed in task `FEAT-BRAINSTORMAREAS-0521-YU` (2025-05-21)

*This vision enables AI-first task management while preserving natural human workflows and supporting organic evolution of organizational patterns.*