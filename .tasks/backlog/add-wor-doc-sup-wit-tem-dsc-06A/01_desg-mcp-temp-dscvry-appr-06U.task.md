# Design MCP template discovery approach

---
type: feature
status: todo
area: mcp
tags:
  - design
  - mcp
  - templates
  - 'team:architect'
---


## Instruction
Design the approach for exposing document templates through MCP, ensuring AI agents can discover available templates and understand where to save documents.

## Context
- MCP already exposes task templates via template_list and template_get
- AI agents use their own Read/Write tools, not MCP-specific document methods
- Templates need to guide both content structure AND save location

## Requirements to Address

### Discovery Mechanism
- How should document templates be exposed? (separate method or extend existing?)
- What information should the list include? (type, description, use cases?)
- How to differentiate document templates from task templates?

### Template Retrieval  
- What should the response format be?
- How to include save location guidance in the response?
- Should templates include example usage?

### Save Location Guidance
- How to communicate WHERE to save (e.g., "Save as design.md in parent task folder")
- Should paths be relative or absolute?
- How to handle different contexts (parent task vs standalone task)?

## Design Considerations
- Keep it simple - AI uses existing Read/Write tools
- Make save instructions crystal clear
- Consider how this integrates with task context
- Think about future extensibility

## Tasks
- [ ] Research existing template system implementation
- [ ] Define MCP method signatures for document templates
- [ ] Design response format including save location guidance
- [ ] Consider integration with existing task context
- [ ] Document the proposed approach
- [ ] Identify any technical constraints or dependencies

## Deliverable
A design document that specifies:
- MCP method names and signatures
- Response formats with examples
- How save location guidance is communicated
- Integration approach with existing systems
- Any identified risks or constraints

## Log
