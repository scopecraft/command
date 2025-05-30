# Redesign task create and edit UI for V2

---
type: feature
status: To Do
area: ui
priority: Medium
tags:
  - ui
  - v2
  - design
  - forms
---


## Instruction

Design and implement new create and edit UI patterns for tasks in the V2 UI. The current V1 implementation uses separate form pages, but we need a more modern approach that fits with the V2 design language.

### Background
- V1 uses TaskFormView, FeatureFormView, and AreaFormView with traditional form pages
- V2 currently only has viewing capabilities
- Need to support both simple tasks and parent tasks
- Should integrate seamlessly with the existing V2 component library

### Design Considerations
- Inline editing vs modal dialogs vs dedicated pages
- How to handle markdown content editing
- Support for all task fields (title, type, status, priority, tags, etc.)
- Parent task creation with initial subtasks
- Validation and error handling
- Auto-save vs explicit save

## Tasks

- [ ] Research and propose UI patterns for create/edit
  - [ ] Analyze modern task management UIs (Linear, Notion, Jira, etc.)
  - [ ] Consider inline editing for simple fields
  - [ ] Design markdown editor integration
  - [ ] Mockup different approaches
- [ ] Design create task flow
  - [ ] Quick create (minimal fields)
  - [ ] Full create (all fields)
  - [ ] Parent task creation with subtasks
- [ ] Design edit task flow
  - [ ] Inline field editing
  - [ ] Full content editing
  - [ ] Bulk editing support
- [ ] Implement create functionality
  - [ ] Create button integration
  - [ ] Form/dialog components
  - [ ] API integration with MCP
  - [ ] Success/error handling
- [ ] Implement edit functionality
  - [ ] Edit triggers (buttons, keyboard shortcuts)
  - [ ] Field-level editing
  - [ ] Content editor
  - [ ] Save mechanisms
- [ ] Testing and polish
  - [ ] Keyboard navigation
  - [ ] Accessibility
  - [ ] Error states
  - [ ] Loading states

## Deliverable

- New create/edit UI components that fit V2 design system
- Seamless integration with existing TaskTable and detail views
- Improved UX over V1 form-based approach
- Support for all task types and fields
- Proper error handling and validation

## Log
- 2025-05-30: Task created to track V2 create/edit UI redesign work
