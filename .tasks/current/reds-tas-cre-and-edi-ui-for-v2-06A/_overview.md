# Redesign task create and edit UI for V2

---
type: feature
status: in_progress
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
### Phase 1: Research ✓
- [x] 06_expl-mod-ui-pat-for-cru-oprtns-06Q: Explore modern UI patterns → @research-agent

### Gate: Synthesis Review ✓
- [x] 07_synthsis-rev-cho-ui-app-for-06F: Choose UI approach → @human-reviewer
Decision: Hybrid approach approved (modal + inline editing)

### Phase 2: Design ✓
- [x] 08_desg-ui-appr-and-cret-mock-06T: Design UI approach and create mockups → @design-agent

### Gate: Design Review ✓
Human approval received - proceed with storybook-first implementation

### Phase 3: Implementation (Storybook Components)
- [ ] 09_cret-cmmndpltte-ci-strybok-06V: Create CommandPalette component in Storybook → @implementation-agent
- [ ] 05_cret-sctndtor-ci-strybok-06G: Create SectionEditor component in Storybook → @implementation-agent (parallel)
- [ ] 05_cret-mtdtdtor-ci-strybok-06K: Create MetadataEditor components in Storybook → @implementation-agent (parallel)

### Gate: Storybook Review (Pending)
Human approval of all components in Storybook before app integration

### Phase 4: App Integration (To be created after storybook review)
Integration tasks will be created after storybook components approved

### Phase 5: Testing & Integration
Testing begins as components become available

## Deliverable

## Log
- 2025-06-05: Planned the orchestration flow and created 01_expl-mod-ui-pat-for-cru-oprtns-06Q
- 2025-06-05: Simplified orchestration to single research task followed by human review gate
- 2025-06-05: Synthesis review completed - Decisions made:
  - UI Pattern: Hybrid approach (modal for create, inline for edit)
  - Technical: Build new components inspired by document-editor
  - Scope: MVP with command palette, inline editing, optimistic updates
  - Ready to create Phase 2 design tasks based on decisions
- 2025-06-05: 2025-06-05 08:38: === ORCHESTRATION RUN ===
  - Current Phase: Phase 1 completed (Research + Synthesis Gate)
  - Previous Gate: Synthesis Review (Passed - Human approved)
  - Status Analysis:
    - Phase 1: Research ✓ Complete
    - Gate: Synthesis Review ✓ Approved by human
    - Phase 2: Design (To be created)
  - Ready Actions:
    - Need to create Phase 2 design tasks based on synthesis decisions
    - Decisions approved: Hybrid UI, DualUseMarkdown adaptation, shadcn/ui components
  - Next Step: Create design tasks per synthesis deliverable
- 2025-06-05: 2025-06-05 08:40: Created Phase 2 design task:
  - 03_desg-ui-appr-and-cret-mock-06T → Design UI approach and create mockups
  - Configured with synthesis decisions and constraints
  - Ready for dispatch to @design-agent
- 2025-06-05: 2025-06-05 08:42: Dispatching autonomous task:
  ```bash
  ./auto 03_desg-ui-appr-and-cret-mock-06T reds-tas-cre-and-edi-ui-for-v2-06A
  ```
  - Session: auto-03_desg-ui-appr-and-cret-mock-06T-1749150131949
  - Mode: design (interactive)
  - Next Gate: Design Review

2025-06-05 08:42: === ORCHESTRATION COMPLETE ===
  - Tasks Dispatched: 1 (03_desg-ui-appr-and-cret-mock-06T)
  - Current Status: Phase 2 Design in progress
  - Next Step: Monitor design task completion
  - Resume: After design complete, run orchestration to check Design Review Gate
- 2025-06-05: 2025-06-05 09:45: === ORCHESTRATION RUN ===
  - Current Phase: Phase 2 Design complete
  - Previous Gate: Design Review (Passed - Human approved)
  - Status Analysis:
    - Phase 2: Design ✓ Complete
    - Gate: Design Review ✓ Approved by human
    - Human requirement: All components must be created in Storybook ONLY
    - No app code to be touched until Storybook review complete
  - Ready Actions:
    - Creating Phase 3 implementation tasks for Storybook components
  - Next Step: Create storybook-only implementation tasks
- 2025-06-05: 2025-06-05 09:50: Created Phase 3 implementation tasks:
  - 09_cret-cmmndpltte-ci-strybok-06V (CommandPalette)
  - 05_cret-sctndtor-ci-strybok-06G (SectionEditor) - parallel
  - 05_cret-mtdtdtor-ci-strybok-06K (MetadataEditor) - parallel
  - All tasks configured for Storybook-only implementation
  - Ready for dispatch to implementation agents
- 2025-06-05: 2025-06-05 09:55: Dispatching autonomous tasks:
  ```bash
  ./auto 09_cret-cmmndpltte-ci-strybok-06V reds-tas-cre-and-edi-ui-for-v2-06A
  ./auto 05_cret-sctndtor-ci-strybok-06G reds-tas-cre-and-edi-ui-for-v2-06A
  ./auto 05_cret-mtdtdtor-ci-strybok-06K reds-tas-cre-and-edi-ui-for-v2-06A
  ```
  - Sessions:
    - CommandPalette: auto-09_cret-cmmndpltte-ci-strybok-06V-1749151310313
    - SectionEditor: auto-05_cret-sctndtor-ci-strybok-06G-1749151316944
    - MetadataEditor: auto-05_cret-mtdtdtor-ci-strybok-06K-1749151323138
  - Mode: implementation (all tasks)
  - Next Gate: Storybook Review

2025-06-05 09:55: === ORCHESTRATION COMPLETE ===
  - Tasks Dispatched: 3 (all Phase 3 implementation tasks)
  - Current Status: Phase 3 Implementation in progress
  - Parallel Work: SectionEditor and MetadataEditor running concurrently
  - Next Step: Monitor implementation tasks
  - Resume: After all components complete, run orchestration for Storybook Review Gate

## Orchestration flow
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
