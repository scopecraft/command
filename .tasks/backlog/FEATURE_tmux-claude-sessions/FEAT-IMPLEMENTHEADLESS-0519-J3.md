+++
id = "FEAT-IMPLEMENTHEADLESS-0519-J3"
title = "Implement headless job manager"
type = "implementation"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "backlog"
parent_task = "tmux-claude-sessions"
depends_on = [ "FEAT-BUILDDISPATCH-0519-35" ]
tags = [ "implementation", "AREA:core" ]
subdirectory = "FEATURE_tmux-claude-sessions"
+++

Create headless job manager for non-interactive modes

## Implementation Tasks
- [ ] Create job manager module
  - [ ] Spawn detached child processes
  - [ ] Capture logs to files
  - [ ] Track process PIDs and exit codes
  - [ ] Store metadata in memory or `.run/` directory
- [ ] Implement log streaming
  - [ ] Tail log files
  - [ ] Stream over WebSocket when requested
  - [ ] Handle log rotation and cleanup
- [ ] Add process lifecycle management
  - [ ] Start/stop processes
  - [ ] Monitor process health
  - [ ] Clean up on exit
- [ ] Write tests for job manager
- [ ] Test log streaming functionality

## Key Requirements
- Support headless execution for -p modes
- Capture output to files for later streaming
- Clean exit code handling
- Integrate with Dispatcher for unified interface
