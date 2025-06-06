# Add autonomous session detail route with realtime log view

---
type: feature
status: todo
area: ui
tags:
  - routing
  - autonomous
  - session-view
  - realtime
  - 'team:ui'
priority: medium
---


## Instruction
Create a dedicated route for viewing individual autonomous session details at `/autonomous/$sessionId`. This route should display a complete realtime log of the session, re-using the existing prompt visualization components (PromptForm, MessageStream) that are already built and available in Storybook.

The `/autonomous` route currently shows a dashboard of all sessions, but each session should have its own dedicated page for viewing the complete session log in realtime.

## Tasks
## Implementation Plan

- [ ] Create new route file at `tasks-ui/src/routes/autonomous/$sessionId.tsx`
- [ ] Create AutonomousSessionView component at `tasks-ui/src/components/autonomous/AutonomousSessionView.tsx`
- [ ] Re-use existing components:
  - [ ] MessageStream for displaying session messages
  - [ ] PromptForm for potential session interaction (if applicable)
  - [ ] MessageDisplay for individual message rendering
- [ ] Add React Query hook for fetching session details in `tasks-ui/src/lib/api/hooks.ts`
- [ ] Update AutonomousMonitor to link to session detail routes
- [ ] Implement realtime updates (WebSocket or polling with 2s interval)
- [ ] Handle all session states (running, waiting_feedback, completed, error)
- [ ] Add loading and error states
- [ ] Create Storybook stories for AutonomousSessionView component
- [ ] Test navigation flow from dashboard to detail view

## Deliverable
## Expected Outcome

1. **New Route**: `/autonomous/$sessionId` that displays individual session details
2. **Session Detail View** showing:
   - Session metadata header (task ID, status, timing)
   - Realtime message stream using existing MessageStream component
   - Tool usage visualization
   - Session statistics (messages, cost, duration)
   - Commands section for continuing/interacting with session
3. **Updated Dashboard**: Session cards link to detail views
4. **Realtime Updates**: Auto-refresh every 2 seconds while session is active
5. **Storybook Stories**: Comprehensive stories showing all session states

## Log
- 2025-06-05: Task created from feature proposal - UI route for autonomous session details
