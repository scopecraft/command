# Migrate task storage to ~/.scopecraft

---
type: feature
status: in_progress
area: core
tags:
  - architecture
  - breaking-change
  - storage-migration
priority: high
---


## Instruction
Migrate task storage from in-repo `.tasks/` to user directory `~/.scopecraft/projects/` following Claude's proven pattern. This eliminates git noise from AI execution logs while keeping work documents visible in repo.

### Key Decisions Made
- Tasks are AI execution instructions/logs, not source code
- Work documents stay in repo (visible to agents)
- Follow Claude's exact pattern: `~/.scopecraft/projects/{encoded-path}/`
- All operations through core layer maintain abstraction
- Simple cp migration since we're the only users

### Success Criteria
- Tasks stored in ~/.scopecraft with same structure
- Work documents remain in repo and visible to agents
- Unified task view across all worktrees
- Docker execution works with mounted ~/.scopecraft
- No regression in existing functionality

## Tasks
### Phase 1: Research (Parallel)
- [ ] 01_resr-stor-patt-implctns-06L: Research storage patterns → @research-agent
- [ ] 01_design-storage-architecture-06I: Design storage architecture → @research-agent  
- [ ] 01_analyze-integration-impacts-06O: Analyze integration impacts → @research-agent

### Gate: Synthesis Review
Decision point: Architecture decisions based on research findings

### Phase 2: Implementation Planning (To be created after gate)
Tasks will be defined based on architecture decisions

### Phase 3: Core Implementation (To be created after Phase 2)
Implementation of storage layer changes

### Phase 4: Integration Updates (To be created after Phase 3)
Update all integration points to use new storage

### Phase 5: Migration & Testing (To be created after Phase 4)
Migrate existing data and comprehensive testing

### Orchestration flow
```
                    ┌─────────────────────────┐
                    │ Start: Storage Migration│
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
│01_storage     │     │01_architecture│     │01_integration │
│patterns       │     │design         │     │impacts        │
│@research-agent│     │@research-agent│     │@research-agent│
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        └───────────────────────┴───────────────────────┘
                                │
                    ╔═══════════▼═════════════╗
                    ║   SYNTHESIS GATE        ║
                    ║   Architecture Decision ║
                    ╚═══════════╤═════════════╝
                                │
                    ┌───────────▼─────────────┐
                    │ PHASE 2: IMPLEMENTATION │
                    │   PLANNING              │
                    │  (Created after gate)   │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   PHASE 3: CORE         │
                    │   IMPLEMENTATION        │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │ PHASE 4: INTEGRATION    │
                    │   UPDATES               │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │ PHASE 5: MIGRATION      │
                    │   & TESTING             │
                    └─────────────────────────┘

Legend:
┌─────┐ = Task (created dynamically)
╔═════╗ = Gate (decision/review point)
──────  = Sequential flow
──┼──   = Parallel paths
```

### Related Tasks
- **refc-env-config-fnctnlcmpsble-06A**: Environment config refactor creating regression tests we'll leverage

## Deliverable

## Log
- 2025-06-10: 2025-06-10: Parent task created with 5-phase orchestration plan. Phase 1 research tasks created in parallel. Linked to refc-env-config-fnctnlcmpsble-06A for regression test leverage.
- 2025-06-11: 2025-06-10 10:00: === ORCHESTRATION RUN ===
  - Current Phase: Phase 1: Research (Parallel)
  - Tasks Status:
    • 01_analyze-integration-impacts-06O: ✓ DONE
    • 01_design-storage-architecture-06I: ✓ DONE  
    • 01_resr-stor-patt-implctns-06L: In Progress (but deliverable appears complete)
  - Gate Status: Synthesis Review (Pending)
  - Findings: Phase 1 research substantially complete with comprehensive deliverables
  - Note: Task 01_resr-stor-patt-implctns-06L marked as in_progress but log shows completion
