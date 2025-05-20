+++
id = "_overview"
title = "Task-Aware Claude Sessions & Dispatch Modes"
type = "feature"
status = "🟡 To Do"
created_date = "2025-05-19"
updated_date = "2025-05-19"
phase = "backlog"
subdirectory = "FEATURE_tmux-claude-sessions"
is_overview = true
assigned_to = ""
tags = [ "tmux", "orchestration", "claude-integration", "subtasks" ]
+++

## Feature Document  
"Task-Aware Claude Sessions & Dispatch Modes"

### 1 Purpose
Extend the local Bun-powered application so that any task can launch, monitor, and control a Claude AI session in one of several **modes** (interactive, code-review, lint, etc.).  
Sessions run inside tmux for portability and can be opened in the user's preferred terminal application.  
Headless (non-interactive) modes must still expose status and logs to the web UI.

### Key Benefits
- **Human-in-the-loop orchestration**: Jump between sessions, answer questions, guide work
- **Parallel subtask execution**: Run multiple modes/tasks simultaneously in tmux windows
- **Unified tmux interface**: All tasks visible as tabs in a single tmux session
- **Reduced process management complexity**: Tmux handles all lifecycle management
- **Better monitoring**: Easy to see and switch between active work

---

### 2 Functional Requirements

| # | Requirement |
|---|-------------|
| FR-1 | Provide a unified CLI entry-point `dispatch <mode> <task-id> [extra-args]`. |
| FR-2 | Modes are pluggable. Initial set: `interactive`, `code-review`. |
| FR-3 | Interactive modes create/re-use a **tmux window** in the main session, named `{id}-{mode}`. |
| FR-4 | Once the session is running, open or focus the user's GUI terminal and attach to it. |
| FR-5 | Headless modes execute in the background, stream logs, and return an exit code. |
| FR-6 | Bun HTTP API exposes `/dispatch/{mode}/{id}`, `/status/{mode}/{id}`, `/stop/{mode}/{id}`, `/logs/{mode}/{id}`. |
| FR-7 | The task list and detail pages display live status badges and action buttons (Run, Stop, Attach, View Log). |

---

### 3 Non-Functional Requirements

| Category | Requirement |
|---|---|
| Portability | macOS, Linux, WSL; should work with WezTerm, iTerm2, Apple Terminal, Windows Terminal, GNOME/Konsole, etc. |
| Architecture | One tmux session with multiple windows (tabs), one window per mode + task ID combination. |
| Security    | HTTP server bound to `127.0.0.1`; validate Task IDs and mode names (`[A-Z0-9_\-]+`). |
| Extensibility | Adding a new mode requires only a new block in `dispatch` and minimal UI mapping. |
| Observability | Provide log streaming and exit status for headless runs; no duplicate windows allowed. |

---

### 4 CLI – `dispatch`

| Argument | Description |
|---|---|
| mode      | Behaviour preset (`interactive`, `code-review`, …). |
| task-id   | The Task ID exactly as shown in the UI. |
| extras    | Optional, mode-specific flags passed through to Claude. |

Behaviour overview

| Mode          | Interactive? | Claude flag | Typical extras          |
|---------------|--------------|-------------|-------------------------|
| interactive   | yes          | –           | —                       |
| code-review   | no           | `-p`        | `--save-to review.md`   |

Internal steps (all modes)

1. Verify the working directory (assumes worktree already exists).  
2. Create or reuse tmux window in the main session.  
3. Set window working directory to the task worktree.  
4. Compose the prompt template for the mode.  
5. Invoke `claude` with appropriate flags (interactive or `-p`).  

---

### 5 HTTP / WebSocket API

| Method | Path | Purpose |
|---|---|---|
| POST | `/dispatch/{mode}/{id}` | Start or reuse a run. Returns `{ session:"scopecraft", window:"{id}-{mode}" }`. |
| GET  | `/status/{mode}/{id}`   | `{ running, headless, exitCode?, startedAt }`. |
| GET  | `/stop/{mode}/{id}`     | Terminate the session or job. |
| WS   | `/logs/{mode}/{id}`     | Stream stdout/stderr (closes when job ends). |

Implementation details

• Interactive: `tmux new-window -t scopecraft -n {id}-{mode} -c {worktree-path} "claude code {id}"`.  
• Headless: spawn detached child, capture output to file, tail file over WebSocket.

---

### 6 Implementation Notes

#### TmuxLib API Signatures

```typescript
// src/core/tmux/lib.ts
export interface TmuxSessionInfo {
  name: string;
  created: Date;
  windows: TmuxWindowInfo[];
}

export interface TmuxWindowInfo {
  name: string;
  index: number;
  active: boolean;
  paneCount: number;
  workingDir: string;
}

export class TmuxLib {
  // Session management
  async createOrGetSession(sessionName: string = "scopecraft"): Promise<void>;
  async sessionExists(sessionName: string): Promise<boolean>;
  async attachSession(sessionName: string): Promise<void>;
  
  // Window management within session
  async createWindow(
    sessionName: string,
    windowName: string,
    workingDir: string,
    command?: string
  ): Promise<void>;
  
  async windowExists(sessionName: string, windowName: string): Promise<boolean>;
  async killWindow(sessionName: string, windowName: string): Promise<void>;
  async listWindows(sessionName: string): Promise<TmuxWindowInfo[]>;
  
  // Command execution
  async sendCommand(
    sessionName: string,
    windowName: string,
    command: string
  ): Promise<void>;
  
  // Pane operations (for output capture)
  async capturePane(
    sessionName: string,
    windowName: string
  ): Promise<string>;
}
```

#### Dispatcher API Signatures

```typescript
// src/core/dispatch/dispatcher.ts
export interface DispatchOptions {
  prompt?: string;
  worktreePath?: string;
  attach?: boolean;
}

export interface DispatchResult {
  session: string;
  window: string;
  attached: boolean;
  processId?: number;
}

export interface SessionStatus {
  running: boolean;
  windowName: string;
  created: Date;
  lastActivity?: Date;
  exitCode?: number;
}

export class Dispatcher {
  constructor(private tmux: TmuxLib, private sessionName: string = "scopecraft") {}
  
  async dispatch(
    mode: string,
    taskId: string,
    options?: DispatchOptions
  ): Promise<DispatchResult>;
  
  async status(mode: string, taskId: string): Promise<SessionStatus | null>;
  
  async stop(mode: string, taskId: string): Promise<void>;
  
  async listActive(): Promise<Array<{
    taskId: string;
    mode: string;
    status: SessionStatus;
  }>>;
  
  async logs(mode: string, taskId: string): Promise<AsyncGenerator<string>>;
}
```

#### Tmux Command Reference

```bash
# Create main session if it doesn't exist
tmux has-session -t scopecraft || tmux new-session -d -s scopecraft

# Create window for task
tmux new-window -t scopecraft -n "TASK123-interactive" -c "/path/to/worktree"

# Execute command in new window
tmux new-window -t scopecraft -n "TASK123-review" -c "/path/to/worktree" \
  "claude code -p 'Review this code' TASK-123"

# Send command to existing window
tmux send-keys -t "scopecraft:TASK123-interactive" "your command here" Enter

# List windows in session
tmux list-windows -t scopecraft -F "#{window_name}|#{window_active}|#{pane_current_path}"

# Check if window exists
tmux has-session -t "scopecraft:TASK123-interactive"

# Kill specific window
tmux kill-window -t "scopecraft:TASK123-interactive"

# Capture pane output
tmux capture-pane -t "scopecraft:TASK123-interactive" -p

# Attach to session (for terminal)
tmux attach -t scopecraft

# Monitor window activity
tmux set-window-option -t "scopecraft:TASK123-interactive" monitor-activity on
```

#### Mode Configurations

```typescript
interface ModeConfig {
  interactive: boolean;
  claudeFlags: string[];
  defaultPrompt?: string;
  cleanupOnExit: boolean;
}

const MODES: Record<string, ModeConfig> = {
  interactive: {
    interactive: true,
    claudeFlags: [],
    cleanupOnExit: false,
  },
  "code-review": {
    interactive: false,
    claudeFlags: ["-p"],
    defaultPrompt: "Please review this code",
    cleanupOnExit: true,
  },
  documentation: {
    interactive: false,
    claudeFlags: ["-p"],
    defaultPrompt: "Generate documentation for this task",
    cleanupOnExit: true,
  },
};
```

#### Error Handling Considerations

- Check tmux availability on startup
- Handle duplicate window names gracefully
- Implement retry logic for tmux commands
- Capture and log tmux command failures
- Provide fallback for unsupported terminals
- Clean up orphaned windows on startup

---

### 7 Implementation Sub-Tasks

| # | Title | Notes |
|---|-------|
| ST-1 | Build `dispatch` script with two starter modes. | Base on existing `tw-start`. |
| ST-2 | Create `tmux.ts` helper (create window, kill window, list windows). | Window management within single session. |
| ST-3 | Headless job manager (spawn, capture logs, track PID & exit). | Store metadata in memory or `.run/`. |
| ST-4 | Bun routes (`/dispatch`, `/status`, `/stop`). | Thin wrappers over ST-2 / ST-3. |
| ST-5 | Terminal attach utility (WezTerm → iTerm2 → Apple Terminal → xdg-terminal → Windows Terminal). | Accept session name as parameter. |
| ST-6 | Front-end integration: badges, Run/Stop/Attach/Log buttons. | Poll `/status` or subscribe WS channel. |
| ST-7 | Log viewer component (xterm.js for interactive, `<pre>` stream for headless). | Connect to `/logs`. |
| ST-8 | Validation & security hardening. | Regex on IDs, CORS, CSRF token if needed. |

Implementors may merge, split, or reorder tasks as convenient.

---

### 8 Testing Approach

**Unit Tests**:
- TmuxLib class methods (create window, kill window, list windows)
- Dispatcher logic for mode selection and validation
- Window naming collision prevention
- Error handling for missing tmux

**Integration Tests**:
- Full dispatch flow with mock tmux commands
- HTTP API endpoints with actual tmux sessions
- Concurrent window creation and management
- Session recovery after crashes

**Manual Testing Checklist**:
- [ ] Create multiple windows for different tasks
- [ ] Switch between windows using tmux keybindings
- [ ] Verify headless mode completes and cleans up
- [ ] Test terminal attachment on different platforms
- [ ] Confirm no duplicate windows for same mode/task
- [ ] Validate error messages when tmux not available

---

### 9 Open Questions

| Topic | Question |
|---|---|
| Prompt templates | Store per-mode prompts in YAML, JSON, or code? |
| Persistence | Recover job state after Bun process restart? |
| Parallel runs | Allow multiple modes on the same task simultaneously? |
| Windows native | Is WSL mandatory or will pure PowerShell be supported? |
| Session naming | Should main session name be configurable or fixed as "scopecraft"? |

---

### 10 Acceptance Criteria

1. `POST /dispatch/interactive/TASK-42` creates a tmux window in the main session, opens the terminal, and attaches.  
2. `POST /dispatch/code-review/TASK-42` runs headless; `/status` shows it as running, then finished with exit code.  
3. UI badges accurately reflect running / stopped / finished states.  
4. No duplicate windows are created for identical `{mode,id}` pairs.  
5. Works on at least:  
   • macOS + iTerm2, macOS + WezTerm  
   • Ubuntu 22.04 + GNOME Terminal  
   • WSL 2 + Windows Terminal.  

---

### 11 Future Enhancements (Backlog)

• Additional modes (`doc-gen`, `test-writer`, `release-notes`).  
• Persist run metadata to SQLite for history.  
• Remote access via SSH tunnel with token auth.  
• Per-mode resource limits (timeout, CPU quota).  

### 12 Complexity Assessment
**Overall Complexity**: Medium

Factors considered:
- Tmux window management is straightforward but requires careful session handling
- HTTP API integration with existing UI infrastructure
- Process lifecycle management delegated to tmux (reduces complexity)
- Window naming conventions must prevent collisions
- Error handling for edge cases (tmux not installed, session not found)
- Cross-platform terminal attachment utility

### 13 Human Review Required
- [ ] Single session vs multi-session architecture decision validated
- [ ] Window naming convention (`{id}-{mode}`) appropriate for all use cases
- [ ] Worktree creation timing and responsibility clearly defined
- [ ] Error recovery approach for orphaned windows
- [ ] Session name "scopecraft" acceptable (or should be configurable?)
- [ ] Headless mode implementation separate from tmux confirmed as best approach

### 14 Task Breakdown

The following tasks have been created to implement this feature:

1. **Research Phase**:
   - RESEARCH-RESEARCHTMUX-0519-VV: Research tmux API and best practices

2. **Core Implementation**:
   - FEAT-BUILDTMUXTS-0519-JJ: Build tmux.ts helper library
   - FEAT-BUILDDISPATCH-0519-35: Build dispatch script with starter modes
   - FEAT-IMPLEMENTHEADLESS-0519-J3: Implement headless job manager
   - FEAT-IMPLEMENTSUBTASK-0519-G4: Implement subtask system

3. **Integration & UI**:
   - FEAT-AUGMENTWEBSOCKET-0519-VG: Augment WebSocket server for live streaming
   - FEAT-CREATEORCHESTRATION-0519-ZB: Create orchestration UI layout
   - FEAT-ADDSUBTASK-0519-2U: Add subtask management UI

4. **Testing & Documentation**:
   - TEST-INTEGRATIONTESTING-0519-DX: Integration testing and documentation

### Task Flow Visualization:
```
Research (VV) → Build TmuxLib (JJ) → Dispatch Script (35)
                                         ↓
                              Headless Manager (J3) ⟶
                                                      Integration (DX)
                              Subtask System (G4)   ⟶
                                         ↓
                              WebSocket Server (VG) → UI Layout (ZB) → Subtask UI (2U)
```

### 15 Prototype Findings

During prototyping, we discovered several important implementation details that should be considered for the final implementation:

#### 15.1 Tmux Window Naming
Window names in tmux are subject to automatic renaming based on the running process unless explicitly disabled. This affects our ability to organize sessions by task ID and mode.

**Solution**:
```bash
# Global session settings when creating the session
tmux set-option -g -t "$SESSION_NAME" automatic-rename off
tmux set-option -g -t "$SESSION_NAME" allow-rename off

# For each new window after creation
tmux set-window-option -t "$SESSION_NAME:$window_name" automatic-rename off
tmux set-window-option -t "$SESSION_NAME:$window_name" allow-rename off
```

#### 15.2 Direct Command Execution
Claude must be executed directly as the tmux window command, not wrapped in a script or shell. Otherwise, the Claude session terminates when the parent script exits.

**Bad (causes session to terminate when dispatcher exits)**:
```bash
tmux new-window -t "$SESSION_NAME" -n "$window_name" -c "$worktree_path" \
    "echo 'Starting Claude...'; claude code"
```

**Good (session persists after dispatcher exits)**:
```bash
tmux new-window -t "$SESSION_NAME" -n "$window_name" -c "$worktree_path" "claude"
```

#### 15.3 Mode System Improvements
The prototype demonstrated several mode improvements:

1. **Dynamic Mode Loading**:
   - Load modes from `.claude/commands/*.md` files
   - Strip the `.md` extension for command names
   - Search up directory tree to find command files (works in worktrees)

2. **"None" Mode**:
   - Provide a "none" mode for basic Claude sessions without commands
   - Skip custom prompt input for "none" mode
   - Run `claude` without any arguments

3. **Command Format**:
   - Format: `claude '/project:MODE TASK-ID [USER_PROMPT]'`
   - For "none" mode: simply `claude`

These findings substantially improve the user experience and should be incorporated into the final implementation.
