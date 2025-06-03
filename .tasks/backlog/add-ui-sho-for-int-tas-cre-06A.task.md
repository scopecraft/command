# Add UI shortcut for intelligent task creation using task-create logic

---
type: feature
status: todo
area: ui
tags:
  - 'team:ui'
  - 'integration:cli'
  - 'feature:ux'
  - shortcut
  - task-creation
  - autonomous
priority: medium
---


## Instruction
Convert the existing Sidebar 'New Task' button to trigger intelligent auto-classification task creation using the task-create autonomous tool logic.

Key requirements:
1. Reuse existing 'New Task' button in Sidebar (already surrounded by automation links)
2. Keep table's create task button for manual creation
3. Open a dialog with:
   - Text input for task description
   - Optional quick type filters (idea, feature, bug, etc.) to guide creation
   - Submit triggers autonomous creation with auto-classification
4. Show progress in autonomous monitor
5. Notify user when task is created with link to view it

The quick type filters are hints/suggestions but the autonomous tool will still do full classification based on the description.

## Tasks
- [ ] Modify Sidebar 'New Task' button click handler
- [ ] Create QuickTaskDialog component with:
  - [ ] Task description input field
  - [ ] Optional type filter buttons (idea, feature, bug, etc.)
  - [ ] Submit and Cancel buttons
- [ ] Add server endpoint `/api/autonomous/task-create`
- [ ] Integrate with task-creator-autonomous.ts logic
- [ ] Connect to autonomous monitor for progress tracking
- [ ] Add success notification with task link
- [ ] Add Storybook story for QuickTaskDialog
- [ ] Test the flow end-to-end
- [ ] Keep existing table create button unchanged (manual creation)

## Deliverable

## Log

## Updated analysis
### Existing UI Elements:
- **Sidebar**: Already has 'New Task' button - perfect for autonomous creation
- **Task Table**: Has create button - keep for manual creation
- Sidebar is already in automation context (near other autonomous features)

### Design Approach:
1. Click Sidebar 'New Task' → Opens QuickTaskDialog
2. Dialog shows:
   ```
   [Task description input field]
   
   Quick type hints (optional):
   [💡 Idea] [✨ Feature] [🐛 Bug] [🔧 Chore] [📚 Docs]
   
   [Create with AI] [Cancel]
   ```
3. User can:
   - Just type description and submit
   - Or click a type hint to add context (e.g., "Bug: ")
   - AI still does full classification

### Benefits:
- Leverages existing UI elements
- Clear separation: Sidebar = AI, Table = Manual
- Optional guidance without forcing structure
- Maintains autonomous classification power

## Impact analysis
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
