# Update UI to display session history for resumed sessions

---
type: feature
status: todo
area: ui
tags:
  - ui
  - session-management
  - monitoring
priority: medium
---


## Instruction
### Context

The session storage system now tracks session history when sessions are resumed. The info.json file contains a `sessionHistory` array that tracks all sessions associated with a task, including when they were started and which session they resumed from.

### Goal

Update the UI components to display this session history information, showing users:
- How many sessions have been run for a task
- When sessions were resumed
- The relationship between original and resumed sessions
- Current/active session ID

### Technical Details

The session info structure now includes:
```typescript
export interface SessionInfo {
  taskId: string;
  sessionName: string;
  sessionId: string;  // Current/latest session ID
  startTime: string;
  executionType: 'detached' | 'docker' | 'tmux';
  status: 'running' | 'completed' | 'failed';
  logFile: string;
  sessionHistory?: SessionHistoryEntry[];  // New field
}

export interface SessionHistoryEntry {
  sessionId: string;
  startTime: string;
  resumedFrom?: string;  // Previous session ID if this is a resume
}
```

## Tasks
- [ ] Update AutonomousSessionCard to display session count
- [ ] Add visual indicator for resumed sessions vs new sessions
- [ ] Show resume timestamp in session details
- [ ] Update AutonomousMonitor to handle sessionHistory array
- [ ] Add tooltip or expandable section to show full session history
- [ ] Update session status display to show current active session from history
- [ ] Add session timeline visualization (optional enhancement)
- [ ] Test UI updates with multi-session tasks

## Deliverable
1. **Enhanced Session Card Display**:
   - Session count badge: "Sessions: 3"
   - Resume indicator with timestamp
   - Current session ID from latest history entry

2. **Session History Details**:
   - Expandable history section showing all sessions
   - Visual timeline of session relationships
   - Clear indication of which session resumed from which

3. **Updated Type Definitions**:
   - UI components handle optional sessionHistory field
   - Backward compatible with tasks without history

4. **User Experience**:
   - Users can see at a glance if a task has been resumed
   - Clear understanding of session progression
   - No confusion about which session is currently active

## Log
