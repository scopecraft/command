# Research and implement orchestration flow alternatives to ASCII

---
type: feature
status: todo
area: core
tags:
  - orchestration
  - research
  - architecture
priority: medium
---


## Instruction
Replace ASCII orchestration diagrams with a format that enables both AI readability and programmatic execution.

### Vision
Move from ASCII art orchestration diagrams to a format that:
- Maintains readability for AI agents
- Enables programmatic execution and state tracking
- Supports future features: notifications, enforced gates, visualization
- Allows building a pattern library for different project types
- Doesn't significantly increase context size

### Context
Current ASCII diagrams are embedded in parent task markdown files and parsed by the orchestration mode. While functional, they limit our ability to add advanced features like state visualization, automated transitions, and reusable patterns.

### Success Criteria
- Format is no more than 2x verbose than current ASCII
- Can be parsed programmatically for execution
- Maintains AI readability for orchestration mode
- Supports all current orchestration concepts (phases, gates, parallel/sequential)
- Enables future pattern library capability
- Proof of concept demonstrates key advantages

## Tasks
### Phase 1: Research (Parallel)
- [ ] 01_resr-merm-orchstrton-form-06S: Research mermaid as orchestration format → @research-agent
- [ ] 01_resr-xsta-orchstrton-form-06L: Research xstate as orchestration format → @research-agent
- [ ] 01_expl-work-form-bpmn-06K: Explore other workflow formats (BPMN, custom DSL) → @research-agent

### Gate: Format Selection
Decision point: Choose format(s) for proof of concept based on:
- AI readability vs verbosity trade-off
- Programmatic execution capabilities
- Visualization potential
- Pattern library support

### Phase 2: Proof of Concept (To be created after synthesis)
Tasks will implement chosen format(s) with:
- Parser for the format
- Converter from existing ASCII
- Sample execution engine
- Comparison metrics

### Gate: Technical Review
Evaluate PoC against success criteria

### Phase 3: Implementation (To be created after PoC approval)
Full implementation based on chosen approach

### Orchestration flow
```
                    ┌─────────────────────────┐
                    │ Start: Orchestration    │
                    │   Format Research       │
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
│01_mermaid     │     │01_xstate     │      │01_other      │
│@research-agent│     │@research-agent│     │@research-agent│
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        └───────────────────────┴───────────────────────┘
                                │
                    ╔═══════════▼═════════════╗
                    ║   FORMAT SELECTION      ║
                    ║   Compare options       ║
                    ║   Choose 1-2 for PoC   ║
                    ╚═══════════╤═════════════╝
                                │
                    ┌───────────▼─────────────┐
                    │   PHASE 2: PROOF OF     │
                    │   CONCEPT               │
                    │  (Created after gate)   │
                    └───────────┬─────────────┘
                                │
                    ╔═══════════▼═════════════╗
                    ║   TECHNICAL REVIEW      ║
                    ║   Evaluate PoC          ║
                    ╚═══════════╤═════════════╝
                                │
                    ┌───────────▼─────────────┐
                    │   PHASE 3: IMPLEMENT    │
                    │  (Created after review) │
                    └─────────────────────────┘

Legend:
┌─────┐ = Task
╔═════╗ = Gate (decision point)
──────  = Sequential flow
──┼──   = Parallel paths
```

## Deliverable
- Chosen orchestration format specification
- Parser implementation for the format
- Proof that format supports all current features
- Migration tool for existing ASCII diagrams
- Documentation on how to write orchestration flows
- Sample pattern library with 3-5 common patterns

## Log
- 2025-06-10: Parent task created with 3-phase orchestration plan
- 2025-06-10: Dispatched all 3 research tasks in parallel:
  - 01_resr-merm-orchstrton-form-06S → PID 78646
  - 02_resr-xsta-orchstrton-form-06L → PID 79154
  - 03_expl-work-form-bpmn-06K → PID 79610
  Next step: Monitor research completion, then run orchestration for synthesis gate
