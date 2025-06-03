# Fix channelcoder command syntax in autonomous monitor UI

---
type: bug
status: todo
area: ui
tags:
  - cli
  - channelcoder
  - autonomous
  - ui
  - documentation
priority: medium
---


## Instruction
Fix the incorrect channelcoder command syntax displayed in the autonomous monitor UI component. The command currently shows `channelcoder -r {sessionName}` but should be `channelcoder --load-session {sessionName}` according to the channelcoder SDK documentation.

This bug affects users trying to resume autonomous sessions interactively from the UI, as they'll copy an incorrect command that won't work.

## Tasks
- [ ] Update line 279 in `tasks-ui/src/components/autonomous/AutonomousMonitor.tsx` to use correct syntax
- [ ] Verify the fix in the UI by running `bun run ui:dev` and checking the autonomous monitor
- [ ] Check if help text in `scripts/implement-autonomous.ts` needs updating for consistency
- [ ] Check if help text in `scripts/task-creator-autonomous.ts` needs updating for consistency
- [ ] Test that the displayed command works correctly with channelcoder

## Deliverable
- Updated AutonomousMonitor component showing correct `channelcoder --load-session` command
- Consistent help text across all autonomous tools
- Verified working command that users can copy and use successfully

## Log
- 2025-06-02: 2025-06-02: Task created with auto-classification as bug in UI area. Identified incorrect command syntax in AutonomousMonitor.tsx line 279.
