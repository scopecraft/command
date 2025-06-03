# Brainstorm - Areas should just exist as tag + document.

---
type: feature
status: todo
area: general
priority: medium
---


## Instruction

## Tasks

## Deliverable

## Log
- 2025-05-28: Recreated from v1 system for preservation in v2 backlog

## Vision: ai-first knowledge & task management system

## Problem statement
Current task management systems force artificial hierarchies between user-facing features and technical architecture, creating organizational friction. The system lacks rich context for AI assistance and conflates delivery phases with product milestones. Areas and features operate identically but serve different conceptual purposes.

## Vision summary
Transform the current system into a dual-architecture approach with organic, AI-discoverable relationships between entities. Enable natural markdown-based entity linking while supporting progressive formalization of concepts as they prove valuable.

## Core architecture
### Two-System Separation

**Long-Lived: Knowledge System (Archivist Role)**
- Architectural patterns and decisions
- Domain models and business logic
- API specifications and contracts
- Design systems and standards
- **Stable, grows incrementally, referenced frequently**

**Short-Lived: Task System (Developer Role)**
- PRDs for specific features
- TRDs for implementation approaches
- Sprint tasks and implementation notes
- **Tactical, gets archived after delivery**

### Work Documents Structure

**Feature-level work documents alongside tasks:**
```
.tasks/FEATURE_login/
├── _overview.md              # Feature summary/epic
├── product-requirements.md   # PRD for this feature
├── technical-approach.md     # TRD for implementation
├── design-decisions.md       # Implementation-specific decisions
├── tasks/                    # Individual implementation tasks
│   ├── TASK-001.md
│   └── TASK-002.md
└── archive/                  # Completed work documents
```

**Benefits of work documents:**
- **Separation of concerns**: Tasks focus on specific work, documents provide context
- **Rich feature context**: PRD/TRD live with the feature, not mixed in task details
- **AI context loading**: Can load relevant work documents based on current task
- **Temporal documentation**: Implementation decisions captured at point-in-time
- **Archival ready**: Work documents can be archived with completed features

### Organizational Dimensions

**Replace single hierarchy with multiple orthogonal dimensions:**

1. **Product Milestones**: V1 (marketable), V2 (advanced) - *product maturity*
2. **Delivery Phases**: Sprint 1, Release 1.0, 1.1 - *timing and resources*
3. **Features**: Login Epic, Dashboard Epic - *user value groupings*
4. **Modules**: API Layer, Auth Service - *architectural boundaries*

## Natural entity linking system
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

## Ai-first design principles
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

## User experience
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

## Success criteria
- AI can automatically load relevant context for any task
- Natural markdown writing creates discoverable relationships
- Multiple organizational dimensions coexist without conflict
- System learns team vocabulary rather than forcing rigid schemas
- Zero maintenance overhead for relationship management
- Smooth transition from current system without data loss
- Work documents provide rich feature context without cluttering task details

## Implementation strategy
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

## Original brainstorm context
Areas shouldnt exist as folder that can receive features underneath.

Instead, they should be a a tag and an area could contain documents and general features inside this area (similar to module).

This way, it wouldnt be a OR. A feature is part of an area, and can be delivered inside a phase.

---

*This vision enables AI-first task management while preserving natural human workflows and supporting organic evolution of organizational patterns.*
