# Add work document support with template discovery and UI editing

---
type: feature
status: todo
area: core
priority: high
tags:
  - unix-philosophy
  - ai-context
  - work-documents
---


## Instruction
Enable work documents (design docs, specs, meeting notes) to be created from templates, discovered automatically, and edited directly in the Task UI. Focus on MCP discovery/templates first, then UI viewing/editing.

## Context
- Supporting file discovery already exists via getSupportingFiles()
- Task UI already displays supporting files in parent task views
- SectionEditor component available for markdown editing
- @ reference pattern already established for linking

## Requirements

### MCP (Priority 1)
- Expose available document templates through MCP
- Enable template content retrieval
- **When providing templates, include instructions on WHERE to save the document**
  - Guide AI on file paths (e.g., save in parent task folder)
  - Suggest naming conventions
  - Ensure AI knows to use their Write tool with the correct path
- Ensure supporting files include type and full path in task responses
- AI agents will use existing Read/Write tools for document content

### UI (Priority 2)  
- Click supporting documents to view/edit them
- Single-section, free-form markdown editing
- Consistent editing experience with existing task sections

### Templates
- Document templates for common types (design, research, meeting notes, etc.)
- Templates should guide structure without being prescriptive
- Templates or MCP responses must include save location guidance

## Success Criteria
- AI agents can discover and use document templates
- AI agents know exactly where to save work documents
- Users can click documents in parent task view to edit them
- Document editing feels natural and consistent with task editing
- Work documents provide rich context for AI-assisted development

## Tasks
- [ ] Design MCP approach for template discovery and retrieval
- [ ] Implement document template system with initial templates
- [ ] Enhance MCP task responses to include document metadata
- [ ] Create API endpoints for document CRUD operations
- [ ] Build UI document viewer/editor using existing patterns
- [ ] Add routing for document URLs in Task UI
- [ ] Test end-to-end flow: template → create → edit → AI usage

## Deliverable
**Minimal work document system that:**
- Exposes templates through MCP for AI discovery
- Enables clicking documents in UI to view/edit them  
- Maintains simplicity and Unix philosophy
- Integrates naturally with existing task workflow

**Not included:** Complex linking system, document validation, or specialized document types - keeping it simple and flexible.

## Log
- 2025-05-28: Created feature proposal based on Unix philosophy discussion  
- 2025-05-28: Identified minimal approach: template + create + automated discovery
- 2025-05-28: Documented integration points with vision and existing specs
- 2025-05-28: Listed key design questions requiring review before implementation
- 2025-06-07: 2025-01-06: Reviewed and updated based on project changes. Core discovery already exists. Focus shifted to MCP template exposure and UI editing. Keeping linking simple with existing @ pattern.
- 2025-06-07: 2025-01-06: Added requirement for template responses to include save location guidance. AI needs to know WHERE to save documents when using their own Write tool.

## Context
- Supporting file discovery already exists via getSupportingFiles()
- Task UI already displays supporting files in parent task views
- SectionEditor component available for markdown editing
- @ reference pattern already established for linking

## Requirements
### MCP (Priority 1)
- Expose available document templates through MCP
- Enable template content retrieval
- Ensure supporting files include type and full path in task responses
- AI agents will use existing Read/Write tools for document content

### UI (Priority 2)  
- Click supporting documents to view/edit them
- Single-section, free-form markdown editing
- Consistent editing experience with existing task sections

### Templates
- Document templates for common types (design, research, meeting notes, etc.)
- Templates should guide structure without being prescriptive

## Success criteria
- AI agents can discover and use document templates
- Users can click documents in parent task view to edit them
- Document editing feels natural and consistent with task editing
- Work documents provide rich context for AI-assisted development
