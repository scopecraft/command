# Redesign task create and edit UI for V2

---
type: feature
status: todo
area: ui
priority: medium
tags:
  - ui
  - v2
  - design
  - forms
---


## Instruction
Design and implement new create and edit UI patterns for tasks in the V2 UI. The current V1 implementation uses separate form pages, but we need a modern approach that fits with the V2 design language.

### Vision
Enable efficient task creation and editing in the V2 UI by moving beyond auto-generated CRUD forms to a modern, AI-assisted editing experience. Leverage the document-editor prototype's proven UX patterns while maintaining Scopecraft's design language.

### Success Criteria
- Tasks can be created in under 10 seconds for simple cases
- Section-based editing with contextual AI assistance
- Maintains Scopecraft's dark terminal aesthetic
- Seamless integration with MCP APIs
- Supports both simple tasks and parent task creation

## Tasks
### Phase 1: Research
- [ ] 01_expl-mod-ui-pat-for-cru-oprtns-06Q: Explore modern UI patterns → @research-agent

### Gate: Synthesis Review
- [ ] 02_synthsis-rev-cho-ui-app-for-06F: Choose UI approach → @human-reviewer

### Phase 2: Design (To be created after gate)
Design tasks will be created based on synthesis decisions

### Phase 3: Implementation (To be created after design)
Implementation tasks will be created based on approved design

### Phase 4: Testing & Integration
Testing begins as components become available

## Deliverable
## Orchestration Flow
```
                    ┌─────────────────────────┐
                    │ Start: UI Redesign Task │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   PHASE 1: RESEARCH     │
                    │      (Single Task)      │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │ 01: Explore UI Patterns │
                    │  (includes doc-editor)  │
                    │   @research-agent       │
                    └───────────┬─────────────┘
                                │
                    ╔═══════════▼═════════════╗
                    ║   SYNTHESIS GATE       ║
                    ║ 02: Choose UI Approach ║
                    ║   @human-reviewer      ║
                    ╚═══════════╤═════════════╝
                                │
                    ┌───────────▼─────────────┐
                    │   PHASE 2: DESIGN       │
                    │  (Task created here)    │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   Design UI Approach    │
                    │    @design-agent        │
                    └───────────┬─────────────┘
                                │
                    ╔═══════════▼═════════════╗
                    ║   DESIGN REVIEW GATE   ║
                    ║   @human-reviewer      ║
                    ╚═══╤═══════════════╤═══╝
                        │ Approved      │ Revisions
                        │               └────┐
                        ▼                    │
            ┌───────────────────────┐        │
            │  PHASE 3: PLANNING    │        │
            │  @orchestrator-agent  │◄───────┘
            │ (Creates impl tasks)  │
            └───────────┬───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   [Modal Path]   [Inline Path]   [Hybrid Path]
        │               │               │
   ┌────▼─────┐   ┌────▼──────┐   ┌───▼────┐
   │  Create  │   │  Create   │   │ Create │
   │  Modal   │   │  Inline   │   │  Both  │
   │Component │   │  Editor   │   │ Comps  │
   └────┬─────┘   └────┬──────┘   └───┬────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                    ┌───▼─────────────────┐
                    │ Implement Validation│
                    │   @frontend-agent   │
                    └───┬─────────────────┘
                        │
                    ╔═══▼═════════════════╗
                    ║ INTEGRATION GATE    ║
                    ║ All tests passing   ║
                    ╚═══╤═════════════════╝
                        │
                    ┌───▼─────────────────┐
                    │   Task Complete     │
                    └─────────────────────┘

Legend:
┌─────┐ = Task (created dynamically)
╔═════╗ = Gate (decision/review point)
──────  = Sequential flow
  │
──┼──   = Parallel paths
  │
```

### Final Deliverable (Upon Completion)
- New create/edit UI components that fit V2 design system
- Seamless integration with existing TaskTable and detail views
- Improved UX over V1 form-based approach
- Support for all task types and fields
- Proper error handling and validation

## Log
- 2025-06-05: Planned the orchestration flow and created 01_expl-mod-ui-pat-for-cru-oprtns-06Q
- 2025-06-05: Simplified orchestration to single research task followed by human review gate
