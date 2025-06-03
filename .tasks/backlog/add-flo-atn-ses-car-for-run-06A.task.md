# Add floating autonomous session cards for running tasks

---
type: feature
status: todo
area: ui
tags:
  - autonomous
  - monitoring
  - floating-ui
  - real-time
  - ux
  - notifications
priority: medium
---


## Instruction
Add small floating cards at the bottom of the UI that automatically show running autonomous tasks (using existing AutonomousSessionCard components). Cards appear when autonomous tasks are running and disappear when completed.

Key requirements:
1. Float at bottom-left to avoid conflict with toasts (bottom-right)
2. Show compact version of existing AutonomousSessionCard for running sessions only
3. Auto-appear when tasks start, auto-disappear when tasks complete
4. Display message count, last message, task info just like in autonomous monitor
5. Clickable to navigate to full autonomous monitor page
6. Appears on all pages (global)
7. Stack vertically if multiple autonomous tasks running

## Tasks
- [ ] Create FloatingAutonomousCards component
- [ ] Add polling logic to fetch running sessions only (status: 'running')
- [ ] Implement compact card layout with:
  - [ ] Task ID and description
  - [ ] Message count badge
  - [ ] Last message preview
  - [ ] Running indicator/spinner
  - [ ] Click to navigate to /autonomous
- [ ] Add to root layout (__root.tsx) to appear globally
- [ ] Position at bottom-left with proper z-index
- [ ] Add fade-in/fade-out animations
- [ ] Handle multiple cards stacking vertically
- [ ] Ensure no overlap with existing Toast notifications
- [ ] Add Storybook story with different session states
- [ ] Test on mobile/responsive layouts

## Deliverable

## Log

## Design approach
### Layout & Positioning:
```
Screen Layout:
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Main Content                        │
│                                     │
│                                     │
│                                     │
│ ┌─Autonomous Cards─┐    ┌─Toasts──┐ │
│ │ 🔄 task-create   │    │ ✅ Success │ │
│ │ 📝 implement-01A │    │ ❌ Error   │ │
│ └─────────────────┘    └─────────┘ │
└─────────────────────────────────────┘
 bottom-left               bottom-right
```

### Card Content (Compact):
```
┌──────────────────────────────────┐
│ 🔄 task-create-oauth-support     │
│ 💬 4 messages | Last: "Creating task..." │
│ ⏱️ 2m ago                        │
└──────────────────────────────────┘
```

### Technical Implementation:
- Reuse existing `fetchSessions()` API
- Filter for `status: 'running'` sessions only
- Use same polling interval as AutonomousMonitor (30s)
- Compact variant of AutonomousSessionCard component
- Fixed positioning with `bottom-4 left-4`
- Click handler: `navigate('/autonomous')`

### Benefits:
- Non-intrusive awareness of running tasks
- Quick access to progress without leaving current page
- Leverages existing autonomous infrastructure
- Consistent with current design patterns (similar to toasts)
