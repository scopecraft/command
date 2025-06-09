# Wire up Create Task buttons to use Command Palette functionality

---
type: feature
status: todo
area: ui
tags:
  - 'team:frontend'
  - 'execution:autonomous'
  - ui-integration
priority: high
---


## Instruction
Connect the existing non-functional "Create Task" buttons throughout the UI to use the same task creation functionality that's already working in the Command Palette (Ctrl/Cmd + K).

The Command Palette has fully functional task creation with proper MCP API integration, error handling, and navigation. The goal is to make the prominent create buttons in the main UI views trigger the same workflow.

**Key Integration Points:**
1. **TaskManagementView**: "+ Create Task" buttons (header + empty state)
2. **ParentTaskListView**: "+ Create Parent Task" buttons (header + empty state) 
3. **ParentTaskView**: "+ Add Subtask" button (sidebar widget)
4. **Sidebar**: "+ New Task" button (currently points to non-existent /task/new route)

**Success Criteria:**
- All create buttons functional with proper click handlers
- Consistent user experience across all entry points
- Proper context-aware behavior (e.g., subtask creation within parent tasks)
- No regressions to existing Command Palette functionality

## Tasks
- [ ] Add click handlers to TaskManagementView create buttons
  - [ ] Header "+ Create Task" button
  - [ ] Empty state "+ Create Task" button
- [ ] Add click handlers to ParentTaskListView create buttons
  - [ ] Header "+ Create Parent Task" button  
  - [ ] Empty state "+ Create Parent Task" button
- [ ] Add subtask creation handler to ParentTaskView
  - [ ] "+ Add Subtask" button with parent context
- [ ] Fix Sidebar "+ New Task" button
  - [ ] Remove non-existent /task/new route navigation
  - [ ] Connect to task creation workflow
- [ ] Extract reusable task creation logic from CommandPalette
  - [ ] Create shared hook or utility for task creation
  - [ ] Ensure consistent behavior across all entry points
- [ ] Add context-aware task creation
  - [ ] Pre-select "parent" type in ParentTaskListView
  - [ ] Pre-fill parent ID for subtask creation
- [ ] Test all integration points
  - [ ] Verify each button opens appropriate creation flow
  - [ ] Test error handling and loading states
  - [ ] Confirm navigation after task creation

## Deliverable
All "Create Task" buttons throughout the UI are functional and provide a consistent task creation experience using the proven Command Palette integration patterns. Users can create tasks and subtasks from any relevant UI location with appropriate context pre-filled.

## Log
- 2025-06-09: Task created to integrate existing create buttons with working Command Palette functionality
