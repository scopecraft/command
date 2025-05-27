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