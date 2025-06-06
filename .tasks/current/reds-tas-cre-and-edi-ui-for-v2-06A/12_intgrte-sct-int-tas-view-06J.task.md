# Integrate SectionEditor into task views

---
type: feature
status: done
area: general
---


## Instruction
Integrate the SectionEditor component (created in Storybook) into the task detail views within the V2 UI application.

### Context
- SectionEditor component was successfully created in Storybook (task 05_cret-sctndtor-ci-strybok-06G)
- CommandPalette integration was just completed (20_intgrte-ci-app-06U)
- This is Phase 4 App Integration - sequential execution required
- Component needs to work with existing task detail views

### Requirements
- Integrate SectionEditor for inline editing of task sections (Instruction, Tasks, Deliverable, Log)
- Follow hover-to-edit pattern established in Storybook
- Maintain proper React architecture with schema-driven types
- Ensure seamless integration with existing task views
- Support optimistic updates for immediate UI feedback
- Preserve Scopecraft's dark terminal aesthetic

### Integration Points
- Task detail views (SimpleTaskView, ParentTaskView)
- Section-specific editing for markdown content
- MCP API integration for persistence

### Quality Standards
- Senior-level React integration
- Type safety with proper TypeScript
- Component reusability
- Proper error handling
- Accessibility compliance

## Tasks
- [ ] Analyze existing task detail view components
- [ ] Import SectionEditor from Storybook components
- [ ] Integrate SectionEditor into SimpleTaskView for each section
- [ ] Integrate SectionEditor into ParentTaskView for each section
- [ ] Implement hover-to-edit behavior
- [ ] Connect to MCP APIs for saving changes
- [ ] Add proper TypeScript types
- [ ] Test inline editing functionality
- [ ] Ensure proper styling consistency
- [ ] Add error handling for save failures
- [ ] Test integration with existing workflows
- [ ] Update component exports if needed

## Deliverable
SectionEditor component fully integrated into task detail views with:
- Inline editing capability for all task sections
- Hover-to-edit UX pattern
- MCP API connectivity for persistence
- Type-safe implementation
- Consistent styling with V2 design
- Error handling and user feedback
- Seamless integration with existing task management flows

## Log
- 2025-06-06: 2025-06-05 18:15: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 12_intgrte-sct-int-tas-view-06J
  - Analysis: Feature implementation in Phase 4 App Integration
  - Selected Mode: Implementation Mode
  - Reasoning: Integration task following successful Storybook component creation
  - Context: SectionEditor component exists in Storybook, needs integration into task detail views
  - Quality Standard: Senior-level React integration required
  - Loading: Implementation guidance for UI area
- 2025-06-06: 2025-06-05 18:25: === ARCHITECTURE ANALYSIS COMPLETE ===
  - Current: Single markdown content area with textarea editor
  - Target: Four SectionEditor components for instruction, tasks, deliverable, log
  - Plan: 1) Content parser utility 2) Replace editor in SimpleTaskView 3) Update MCP calls 4) Apply to ParentTaskView
  - Integration points: SimpleTaskView.tsx:114-162, route handler save logic
  - Backward compatibility: Handle content without explicit section headers
- 2025-06-06: 2025-06-05 18:35: === IMPLEMENTATION PHASE STARTED ===
  - API Analysis Complete: MCP supports section-specific updates (instruction, tasks, deliverable, add_log_entry)
  - Foundation Ready: SectionEditor + content parser + API hooks all available  
  - Plan: Replace SimpleTaskView single textarea with four SectionEditor components
  - Current: Lines 114-162 in SimpleTaskView.tsx contain the edit/view logic to replace
  - Next: Implement section-based editing with individual save handlers
- 2025-06-06: 2025-06-05 18:45: === SIMPLETASKVIEW INTEGRATION COMPLETE ===
  - ✅ SimpleTaskView.tsx: Replaced single textarea with 4 SectionEditor components
  - ✅ Route component: Updated to work with section-based editing
  - ✅ API Integration: Section-specific saves using MCP instruction/tasks/deliverable/add_log_entry
  - ✅ Code Quality: All linting and TypeScript checks passing
  - Architecture: Content parsed into sections, individual save handlers, optimistic updates
  - Next: Apply same integration to ParentTaskView component
- 2025-06-06: 2025-06-05 18:55: === INTEGRATION COMPLETE ===
  - ✅ ParentTaskView.tsx: Applied same SectionEditor integration pattern
  - ✅ Both SimpleTaskView and ParentTaskView now use section-based editing
  - ✅ Hover-to-edit UX pattern working in both components
  - ✅ MCP API integration: instruction/tasks/deliverable/add_log_entry fields
  - ✅ TypeScript: 0 errors in changed files
  - ✅ Content parser: Handles legacy content without section headers
  - Architecture: Clean separation of concerns, optimistic updates, error handling
  - Note: Minor complexity warnings in existing code (separate refactoring task)
