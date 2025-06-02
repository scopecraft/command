# Add UI shortcut for intelligent task creation using task-create logic

---
type: feature
status: To Do
area: ui
tags:
  - 'team:ui'
  - 'integration:cli'
  - 'feature:ux'
  - shortcut
  - task-creation
  - autonomous
priority: Medium
---


## Instruction
Add a UI shortcut (keyboard shortcut and/or button) that allows users to quickly create tasks with intelligent auto-classification directly from the Task UI, using the same logic as the task-create autonomous tool.

Key requirements:
1. Quick access via keyboard shortcut (e.g., Cmd/Ctrl+N) or button in Sidebar
2. Simple input dialog for task description
3. Triggers autonomous task creation with auto-classification
4. Shows progress in autonomous monitor
5. Notifies user when task is created

## Tasks
- [ ] Add keyboard shortcut handler to root layout
- [ ] Create quick input modal/dialog component
- [ ] Add server endpoint `/api/autonomous/task-create`
- [ ] Integrate with task-creator-autonomous.ts logic
- [ ] Add progress tracking to autonomous monitor
- [ ] Add success notification when task is created
- [ ] Update Sidebar with quick action button
- [ ] Add Storybook stories for new components
- [ ] Test keyboard shortcut across different pages
- [ ] Document the feature in UI guide

## Deliverable
## Impact Analysis

### Files to modify:
- `tasks-ui/src/components/v2/Sidebar.tsx` - Add quick action button
- `tasks-ui/src/routes/__root.tsx` - Add global keyboard shortcut handler
- `tasks-ui/server.ts` - Add new autonomous endpoint
- `tasks-ui/server/autonomous-handlers.ts` - Add task creation handler
- New: `tasks-ui/src/components/v2/QuickTaskDialog.tsx` - Input dialog component

### Integration points:
- Reuse `scripts/task-creator-autonomous.ts` logic via server
- Use existing autonomous monitoring infrastructure
- Leverage existing API client methods

### Technical approach:
1. Server endpoint spawns task-create process
2. Returns session ID for monitoring
3. UI polls autonomous monitor for progress
4. Notification when complete with task ID

### No breaking changes - purely additive feature

## Log
