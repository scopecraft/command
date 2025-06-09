# Integrate Agent mode UI with channelcoder backend

---
type: feature
status: todo
area: ui
priority: high
---


## Instruction
Restore and enhance Agent mode functionality in the UI by integrating the existing ClaudeAgentButton with the channelcoder backend. This includes both assistant mode (real-time streaming) and agent mode (background execution) with proper mode and execution type selection.

### Success Criteria
- ClaudeAgentButton connects to real channelcoder sessions
- Users can select modes (auto, implement, plan, research) and execution types (docker, tmux, detached)
- Real-time streaming works for assistant mode
- Background session monitoring works for agent mode
- Integration follows existing patterns in dispatch-commands.ts and work-commands.ts

### Scope
- UI components for mode/execution selection
- Backend integration with channelcoder client
- Session state management and monitoring
- Real-time streaming infrastructure (assistant mode)
- Background task execution (agent mode)

### Out of Scope (Future)
- Actions concept (focused background tasks like "generate diagram")
- Advanced session management features
- Multi-session orchestration

## Tasks
### Phase 1: Research (Parallel)
- [ ] 01_resr-exis-chnnlcder-intg-06S: Research existing channelcoder integration patterns → @research-agent
- [ ] 01_anal-ui-sess-mgmt-06X: Analyze archived UI patterns for streaming and session management → @research-agent
- [ ] 01_desi-slcton-sess-mntrng-06Y: Design mode selection UX and session monitoring approach → @design-agent

### Gate: Research Synthesis
Decision point: Choose implementation approach based on findings
- Determine streaming vs background execution priority
- Select UI patterns for mode selection
- Define session management architecture

### Phase 2: Core Implementation (To be created after gate)
Implementation tasks depend on synthesis decisions:
- Backend integration approach
- UI component structure
- Session management strategy

### Phase 3: Integration & Testing (To be created after Phase 2)
Integration and testing tasks based on implementation:
- End-to-end testing
- Session state management validation
- Performance optimization

### Orchestration flow
```
                    ┌─────────────────────────┐
                    │ Start: Agent Mode UI    │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   PHASE 1: RESEARCH     │
                    │   (Parallel Tasks)      │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌──────────────┐      ┌──────────────┐
│01_channelcoder│     │01_archived-ui│     │01_ux-design  │
│@research-agent│     │@research-agent│     │@design-agent │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        └───────────────────────┴───────────────────────┘
                                │
                    ╔═══════════▼═════════════╗
                    ║   SYNTHESIS GATE        ║
                    ║   Choose approach       ║
                    ╚═══════════╤═════════════╝
                                │
                    ┌───────────▼─────────────┐
                    │  PHASE 2: IMPLEMENT     │
                    │  (Created after gate)   │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │ PHASE 3: INTEGRATION    │
                    │ (Created after Phase 2) │
                    └─────────────────────────┘

Legend:
┌─────┐ = Task (created dynamically)
╔═════╗ = Gate (decision/review point)
──────  = Sequential flow
──┼──   = Parallel paths
```

## Deliverable

## Log
