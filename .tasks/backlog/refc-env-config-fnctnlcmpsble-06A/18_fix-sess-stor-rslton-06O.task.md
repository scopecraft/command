# Fix session storage root resolution bug

---
type: bug
status: todo
area: core
assignee: implement-agent
tags:
  - bugfix
  - sessions
  - environment
---


## Instruction
Fix session storage root resolution bug to ensure consistent project root across CLI and UI.

**Context from TRD**: The session monitoring bug occurs because CLI and UI may resolve project root differently in worktrees, causing UI to not find sessions created by CLI.

**Root Cause**:
- CLI in worktree: may resolve to worktree path
- UI in main: resolves to main repo path
- Sessions stored in different locations!

**Fix Implementation**:
1. Create getSessionStorageRoot function that always uses ConfigurationManager
2. Update all session storage code to use this function
3. Ensure ConfigurationManager's root is used consistently
4. Test in both main and worktree contexts

**Code Changes**:
- Add `getSessionStorageRoot(config: IConfigurationManager)` function
- Update ChannelCoder integration to use this
- Update UI session monitoring to use same resolution

**Success Criteria**:
- Sessions always stored in ConfigurationManager's resolved root
- UI finds sessions created by CLI in worktrees
- Session monitoring works across all contexts

## Tasks

## Deliverable

## Log
