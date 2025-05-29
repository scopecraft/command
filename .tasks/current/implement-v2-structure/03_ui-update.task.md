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

### Phase 0: Storybook Groundwork (1-2 days)
- [x] Set up Storybook in tasks-ui project
- [x] Configure Storybook with Tailwind styles and essential addons
- [x] Create story for filter-panel (pure component)
- [ ] Create stories for other pure components (TaskContent, TaskMetadata)
- [ ] Establish component development pattern (story-first)

### Completed Analysis & Planning
- [x] Review entire tasks-ui codebase for impact analysis
- [x] Document all components that reference phases
- [x] Document all API calls that need updating
- [x] Update TypeScript types to match new structure
- [x] Create comprehensive migration analysis document
- [x] Update implementation plan with Storybook-first approach
### Phase 1: Foundation & Core V2 Components
- [ ] Create ParentTaskCard component with Storybook stories
- [ ] Create SubtaskList component with sequence/parallel examples
- [ ] Create WorkflowStateBadge component
- [ ] Update API client for new MCP endpoints
- [ ] Create new context providers (Workflow, ParentTask)
- [ ] Implement basic routing structure

### Phase 2: Navigation & Core Views  
- [ ] Build ParentTaskDetailPage component (review in Storybook first)
- [ ] Build WorkflowDetailPage component (review in Storybook first)
- [ ] Update routing structure (remove /phase/feature pattern)
- [ ] Replace Sidebar navigation
- [ ] Update URL patterns with redirects

### Phase 3: Task Management UI
- [ ] Create TaskListV2 with parent task icons (📁 vs 📄)
- [ ] Update task move/filter components for V2
- [ ] Remove phase selector component
- [ ] Add workflow state filters to task list
- [ ] Update task creation UI for backlog default
- [ ] Implement basic subtask sequencing UI
- [ ] Add task conversion UI (simple ↔ parent)
### Phase 4: Advanced Features & Polish
- [ ] Add drag-and-drop subtask reordering (with Storybook interaction testing)
- [ ] Implement parallel task management UI:
  - [ ] Visual indicators for parallel tasks (same sequence)
  - [ ] Bulk selection for making tasks parallel
  - [ ] "Insert task here" buttons between sequences
- [ ] Enhanced task conversion UI:
  - [ ] "Extract to Task" option for subtasks
  - [ ] Confirmation dialogs for conversions
- [ ] Advanced subtask display features:
  - [ ] Sequence number display with edit capability
  - [ ] Group parallel tasks visually
  - [ ] Quick actions for sequence operations
- [ ] Integration testing and polish
- [ ] Storybook documentation for V2 design system

## Deliverable
[To be updated as implementation progresses]

## Log
- 2025-05-27: Task created as part of V2 implementation
- 2025-05-28: Completed comprehensive UI migration analysis
  - Reviewed entire tasks-ui codebase (20+ components)
  - Documented all phase/feature references and API changes needed
  - Updated TypeScript types to import v2 core types
  - Created detailed migration analysis with mockups and implementation strategy
  - Identified 4-phase implementation approach with risk assessment
  - Generated 15 design questions for review and decision-making
- 2025-05-29: Set up Storybook development environment
  - Successfully installed Storybook with React Vite support
  - Configured preview.ts to include Tailwind CSS styles
  - Created first story for FilterPanel component (pure component)
  - Demonstrated various filter states and interactive behavior
  - Established foundation for component-first development
