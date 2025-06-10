# Add work and dispatch MCP tools for parallel execution

---
type: feature
status: in_progress
area: mcp
tags:
  - mcp
  - tools
  - parallel-execution
  - orchestration
priority: medium
---


## Instruction
Add MCP tools for parallel task execution, equivalent to CLI's work and dispatch commands but adapted for MCP context.

### Context

Currently, orchestration uses the CLI commands via bash (./auto, work, dispatch). We need MCP-native tools to enable Claude and other MCP clients to:
1. Start parallel interactive sessions (work with tmux)
2. Dispatch tasks in any mode (dispatch)

### Key Differences from CLI

**Work Tool**:
- Only supports tmux option (interactive parallel sessions)
- No "replace current process" option (doesn't make sense in MCP context)
- Clear naming that it's for human-interactive parallel sessions

**Dispatch Tool**:
- Supports all modes (auto, interactive, etc.)
- Same functionality as CLI dispatch
- Enables programmatic task execution from MCP clients

### Success Criteria

- MCP clients can start parallel interactive work sessions
- MCP clients can dispatch tasks in any mode
- Tools integrate seamlessly with existing execution context
- Clear documentation for MCP tool usage

## Tasks
### Phase 1: Research & Analysis
- [ ] Analyze existing CLI work and dispatch commands → @research-agent

### Gate: Research Review
Decision: Confirm understanding of CLI behavior and MCP adaptation requirements

### Phase 2: Design (To be created after gate)
- [ ] Design MCP tool interfaces for work and dispatch

### Gate: Design Approval
Decision: Approve MCP tool interfaces before implementation

### Phase 3: Implementation (To be created after design)
- [ ] Implement work MCP tool (tmux interactive sessions)
- [ ] Implement dispatch MCP tool (all modes support)

### Gate: Implementation Review
Decision: Verify both tools work correctly

### Phase 4: Testing & Integration (To be created after implementation)
- [ ] Integration testing and documentation

### Orchestration Flow
```
┌─────────────────────────┐
│   Start: MCP Tools      │
│   Implementation        │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  PHASE 1: RESEARCH      │
│  Analyze CLI commands   │
└───────────┬─────────────┘
            │
╔═══════════▼═════════════╗
║   Research Review       ║
║   Confirm requirements  ║
╚═══════════╤═════════════╝
            │
┌───────────▼─────────────┐
│  PHASE 2: DESIGN        │
│  MCP tool interfaces    │
└───────────┬─────────────┘
            │
╔═══════════▼═════════════╗
║   Design Approval       ║
║   Review interfaces     ║
╚═══════════╤═════════════╝
            │
┌───────────▼─────────────┐
│  PHASE 3: IMPLEMENT     │
│  (Parallel Tasks)       │
└───────────┬─────────────┘
      ┌─────┴─────┐
      ▼           ▼
┌──────────┐ ┌──────────┐
│Work Tool │ │Dispatch  │
│(tmux)    │ │Tool      │
└────┬─────┘ └────┬─────┘
     └─────┬─────┘
           │
╔══════════▼══════════════╗
║  Implementation Review   ║
║  Verify functionality    ║
╚══════════╤══════════════╝
           │
┌──────────▼──────────────┐
│  PHASE 4: INTEGRATE     │
│  Testing & Docs         │
└─────────────────────────┘
```

## Deliverable

## Log
- 2025-06-09: === ORCHESTRATION START ===
  - Parent task created with 4-phase orchestration plan
  - Phase 1: Research initiated
  - Dispatched: 01_anal-exis-cli-disp-06W (Session: detached-01_anal-exis-cli-disp-06W-1749505751459, PID: 15797)
  - Purpose: Analyze CLI work and dispatch commands for MCP adaptation
  - Next: Create design task after research gate review
