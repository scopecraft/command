# Add work document support with template discovery and UI editing

---
type: feature
status: todo
area: core
tags:
  - unix-philosophy
  - ai-context
  - work-documents
  - orchestrated-feature
priority: high
---


## Instruction
Enable work documents (design docs, specs, meeting notes) to be created from templates, discovered automatically, and edited directly in the Task UI. Focus on MCP discovery/templates first, then UI viewing/editing.

## Tasks
### Phase 1: MCP Foundation (Parallel)
- [ ] 01_design-mcp-template-approach: Design how templates are exposed via MCP
- [ ] 01_create-document-templates: Build initial template collection  

### Gate: MCP Design Review
Ensure template approach includes save location guidance

### Phase 2: Core Implementation (To be created after gate)
- Build MCP template discovery/retrieval methods
- Add metadata to supporting files in responses
- Create API endpoints for document operations

### Phase 3: UI Implementation (To be created after Phase 2)
- Build document viewing/editing components
- Implement navigation to documents

### Phase 4: Integration & Testing (To be created after Phase 3)
- Test complete flow from AI discovery to UI editing

### Orchestration flow
```
┌─────────────────────────────────┐
│  Work Document Support Feature  │
└────────────┬────────────────────┘
             │
  ┌──────────▼──────────┐
  │ PHASE 1: FOUNDATION │
  │    (Parallel)       │  
  └──────────┬──────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──────┐   ┌─────▼──────┐
│01_design │   │01_templates│
│   MCP    │   │  creation  │
└───┬──────┘   └─────┬──────┘
    └────────┬────────┘
             │
    ╔════════▼════════╗
    ║  DESIGN REVIEW  ║
    ║ Validate approach║
    ╚════════╤════════╝
             │
  ┌──────────▼──────────┐
  │ PHASE 2: CORE IMPL │
  │ (Created after gate)│
  └──────────┬──────────┘
             │
  ┌──────────▼──────────┐
  │ PHASE 3: UI BUILD  │
  │ (Created after P2) │
  └──────────┬──────────┘
             │
  ┌──────────▼──────────┐
  │ PHASE 4: INTEGRATE │
  │ (Created after P3) │
  └─────────────────────┘
```

## Deliverable
**Minimal work document system that:**
- Exposes templates through MCP for AI discovery with save location guidance
- Enables clicking documents in UI to view/edit them  
- Maintains simplicity and Unix philosophy
- Integrates naturally with existing task workflow

**Not included:** Complex linking system, document validation, or specialized document types - keeping it simple and flexible.

## Log
- 2025-06-07: 2025-01-06: Created parent task with phased orchestration. Phase 1 tasks created, future phases to be created after gates.

## Context
- Supporting file discovery already exists via getSupportingFiles()
- Task UI already displays supporting files in parent task views  
- SectionEditor component available for markdown editing
- @ reference pattern already established for linking

## Core requirements
### MCP Template System
- AI agents need to discover what document templates are available
- AI agents need to get template content with save location guidance
- Templates should guide document structure without being prescriptive
- Save location instructions must be clear (e.g., "Save as design.md in parent task folder")

### Enhanced Discovery
- Supporting files in task responses should include type and full path
- Document types inferred from filename patterns (design.md → type: "design")
- AI agents use their own Read/Write tools with provided paths

### UI Document Experience
- Click documents in parent task view to open editor
- Single-section, free-form markdown editing
- Consistent experience with existing task editing patterns
- Navigate to documents via dedicated routes

## Success criteria
- AI can ask "What document templates are available?" and get useful response
- AI knows exactly where to save documents after getting template
- Users can seamlessly view and edit work documents in the UI
- Work documents provide rich context alongside tasks
