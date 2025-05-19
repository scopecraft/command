+++
id = "FEAT-BUILDDISPATCH-0519-35"
title = "Build dispatch script with starter modes"
type = "implementation"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "backlog"
parent_task = "tmux-claude-sessions"
depends_on = [ "FEAT-BUILDTMUXTS-0519-JJ" ]
tags = [ "implementation", "cli", "AREA:core" ]
subdirectory = "FEATURE_tmux-claude-sessions"
+++

Build dispatch script with two starter modes based on existing tw-start

## Implementation Tasks
- [ ] Create Dispatcher class at `src/core/dispatch/dispatcher.ts`
- [ ] Implement core dispatch logic
  - [ ] Mode configuration system
  - [ ] dispatch() method with mode handling
  - [ ] status() method for checking sessions
  - [ ] stop() method for cleanup
  - [ ] listActive() for monitoring
- [ ] Create dispatch CLI script
  - [ ] Parse command line arguments
  - [ ] Validate mode and task ID
  - [ ] Handle worktree path discovery
- [ ] Implement initial modes
  - [ ] interactive mode (no -p flag)
  - [ ] code-review mode (with -p flag)
- [ ] Add mode configuration system
- [ ] Write tests for dispatcher logic
- [ ] Add integration tests

## Key Requirements
- Build on existing tw-start patterns
- Support pluggable modes
- Handle both interactive and headless execution
- Integrate with TmuxLib for session management
