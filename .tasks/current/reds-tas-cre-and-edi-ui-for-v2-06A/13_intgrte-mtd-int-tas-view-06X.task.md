# Integrate MetadataEditor into task views

---
type: feature
status: todo
area: general
---


## Instruction
Integrate the MetadataEditor components (created in Storybook) into the task detail views within the V2 UI application.

### Context
- MetadataEditor components were successfully created in Storybook (task 05_cret-mtdtdtor-ci-strybok-06K)
- SectionEditor integration will be completed before this task (12_intgrte-sct-int-tas-view-06J)
- This is Phase 4 App Integration - sequential execution after SectionEditor
- Components need to work with existing task detail views and newly integrated SectionEditor

### Requirements
- Integrate MetadataEditor components for inline editing of task metadata
- Support all metadata fields: status, priority, type, area, tags, assignee
- Implement optimistic updates with immediate UI feedback
- Follow established UX patterns from Storybook implementation
- Maintain proper React architecture with schema-driven types
- Ensure seamless integration with existing task views and SectionEditor
- Preserve Scopecraft's dark terminal aesthetic

### Integration Points
- Task detail views (SimpleTaskView, ParentTaskView)
- Metadata fields editing (dropdowns, inputs, tag management)
- MCP API integration for persistence
- Coordination with SectionEditor component

### Quality Standards
- Senior-level React integration
- Type safety with proper TypeScript
- Component reusability and modularity
- Proper error handling and validation
- Accessibility compliance
- Performance optimization for real-time updates

## Tasks
- [ ] Analyze existing task detail view components and SectionEditor integration
- [ ] Import MetadataEditor components from Storybook
- [ ] Integrate StatusDropdown into task views
- [ ] Integrate PriorityDropdown into task views
- [ ] Integrate AssigneeInput into task views
- [ ] Integrate TagInput with tag management into task views
- [ ] Implement optimistic update patterns
- [ ] Connect all components to MCP APIs for persistence
- [ ] Add proper TypeScript types and interfaces
- [ ] Implement validation for metadata fields
- [ ] Test real-time metadata editing functionality
- [ ] Ensure proper styling consistency with V2 design
- [ ] Add error handling for save failures and network issues
- [ ] Test integration with both SectionEditor and existing workflows
- [ ] Update component exports and organize imports
- [ ] Add loading states and feedback for async operations

## Deliverable
MetadataEditor components fully integrated into task detail views with:
- Inline editing capability for all metadata fields
- Optimistic updates with immediate UI feedback
- MCP API connectivity for persistence
- Type-safe implementation with proper validation
- Consistent styling with V2 design and SectionEditor integration
- Comprehensive error handling and user feedback
- Seamless coordination with SectionEditor component
- Performance-optimized real-time updates
- Full accessibility compliance
- Proper component organization and reusability

## Log
