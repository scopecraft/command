+++
id = "FEAT-BUILDTMUXTS-0519-JJ"
title = "Build tmux.ts helper library"
type = "implementation"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "backlog"
parent_task = "tmux-claude-sessions"
previous_task = "RESEARCH-RESEARCHTMUX-0519-VV"
tags = [ "implementation", "tmux", "AREA:core" ]
subdirectory = "FEATURE_tmux-claude-sessions"
+++

Create the core TmuxLib helper with window management within single session

## Implementation Tasks
- [ ] Create TmuxLib class at `src/core/tmux/lib.ts`
- [ ] Implement session management methods
  - [ ] createOrGetSession()
  - [ ] sessionExists()
  - [ ] attachSession()
- [ ] Implement window management
  - [ ] createWindow()
  - [ ] windowExists()
  - [ ] killWindow()
  - [ ] listWindows()
- [ ] Implement command execution
  - [ ] sendCommand()
  - [ ] capturePane()
- [ ] Add error handling and retry logic
- [ ] Write unit tests
- [ ] Add integration tests with mock tmux

## Key Requirements
- Use single tmux session with multiple windows
- Window naming: `{taskId}-{mode}`
- Handle tmux not installed gracefully
- Support cross-platform execution
- Implement retry logic for tmux commands
