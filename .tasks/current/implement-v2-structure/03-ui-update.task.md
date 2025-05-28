# Update Task UI for V2 Structure

---
type: chore
status: Progress
area: ui
assignee: null
parent: implement-v2-structure
---


## Instruction
Update the Task UI to work with the new workflow-based structure. This includes updating components, API calls, and navigation to match the new system.

**IMPORTANT**: This plan is not complete. Start by reviewing the entire tasks-ui codebase to understand all the places that need updating. Look for phase/feature references, navigation patterns, and API calls. Don't hesitate to ask questions about design decisions.

### Initial Scope (to be expanded)
1. Update task list to show both simple and complex tasks
2. Repurpose feature view as complex task view
3. Simplify sidebar to show current work only
4. Remove phase-related components
5. Update API client for new MCP structure

### Key Areas to Review
- React components using phase/feature
- API client code
- Routing and navigation
- Context providers
- Type definitions

## Tasks
- [ ] Review entire tasks-ui codebase for impact analysis
- [ ] Document all components that reference phases
- [ ] Document all API calls that need updating
- [ ] Update task list to display folders as complex tasks
- [ ] Add icons to distinguish task types (📄 vs 📁)
- [ ] Convert feature view to complex task view
- [ ] Remove phase selector component
- [ ] Update sidebar to show current/ contents only
- [ ] Update API client for new MCP endpoints
- [ ] Update TypeScript types to match new structure
- [ ] Update routing (remove /phase/feature pattern)
- [ ] Add workflow state filters to task list
- [ ] Update task creation UI for backlog default
- [ ] Test all UI interactions
- [ ] Add subtask sequencing UI:
  - [ ] Drag-and-drop reordering for subtasks
  - [ ] Visual indicators for parallel tasks (same sequence)
  - [ ] Sequence number display with edit capability
  - [ ] Bulk selection for making tasks parallel
- [ ] Add task conversion UI:
  - [ ] "Convert to Parent" button for simple tasks
  - [ ] "Extract to Task" option for subtasks
  - [ ] Confirmation dialogs for conversions
- [ ] Update subtask display:
  - [ ] Show sequence numbers prominently
  - [ ] Group parallel tasks visually
  - [ ] Add "Insert task here" buttons between sequences
  - [ ] Quick actions for sequence operations

## Deliverable
[To be updated as implementation progresses]

## Log
- 2025-05-27: Task created as part of V2 implementation
