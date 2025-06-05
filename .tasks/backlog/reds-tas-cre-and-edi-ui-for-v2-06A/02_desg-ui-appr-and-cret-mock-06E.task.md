# Design UI approach and create mockups

---
type: feature
status: todo
area: ui
priority: high
tags:
  - design
  - ui
  - mockups
  - 'team:ux'
  - 'execution:interactive'
  - design-phase
---


## Instruction
Design the UI approach for task creation and editing based on research findings. Create mockups that demonstrate the hybrid approach combining DualUseMarkdown patterns for editing with modal/slide-out panels for creation.

### Context from Research Phase:
- DualUseMarkdown component from document-editor prototype provides proven section-based editing
- Hybrid approach recommended: modals for creation, inline for editing
- Must support both simple tasks and parent task orchestration
- Maintain Scopecraft's dark terminal aesthetic

### Design Requirements:
1. **Task Creation Flow**:
   - Quick creation for simple tasks (under 10 seconds)
   - Guided creation for parent tasks with orchestration
   - Progressive disclosure of advanced options

2. **Task Editing Experience**:
   - Section-based editing matching task structure (Instruction, Tasks, Deliverable, Log)
   - Contextual AI actions per section
   - Inline editing with hover actions
   - Auto-save with conflict resolution

3. **Visual Design**:
   - Dark terminal aesthetic from SCOPECRAFT_STYLE_GUIDE.md
   - Consistent with existing V2 components
   - Accessible color contrast and keyboard navigation

4. **Component Architecture**:
   - Shared primitives between task and document editing
   - Reusable section components
   - Flexible layout system

## Tasks
- [ ] Review research findings and synthesis decisions
- [ ] Sketch initial wireframes for creation flow
- [ ] Design modal/slide-out panel for task creation
- [ ] Adapt DualUseMarkdown for task section editing
- [ ] Design AI action integration for each section
- [ ] Create high-fidelity mockups in Figma/design tool
- [ ] Design responsive layouts for mobile/tablet
- [ ] Document component hierarchy and shared primitives
- [ ] Create interactive prototype for key flows
- [ ] Prepare design rationale document

## Deliverable
Design package including:
- Wireframes for task creation and editing flows
- High-fidelity mockups showing all states
- Interactive prototype demonstrating key interactions
- Component architecture diagram
- Design rationale document
- Accessibility considerations
- Implementation notes for developers

## Log
