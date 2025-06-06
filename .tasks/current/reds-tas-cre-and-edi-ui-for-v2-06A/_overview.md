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

### Phase 3: Implementation (Storybook Components) ✓
- [x] 09_cret-cmmndpltte-ci-strybok-06V: Create CommandPalette component in Storybook → @implementation-agent
- [x] 05_cret-sctndtor-ci-strybok-06G: Create SectionEditor component in Storybook → @implementation-agent (parallel)
- [x] 05_cret-mtdtdtor-ci-strybok-06K: Create MetadataEditor components in Storybook → @implementation-agent (parallel)
- [x] 10_fix-strybok-ci-bloc-stor-06A: Fix Storybook component issues → @diagnosis-agent

### Gate: Storybook Review ✓
Human approval received - all components reviewed and approved

### Phase 4: App Integration
- [ ] 11_intgrte-ci-app-06U: Integrate CommandPalette into app → @implementation-agent
- [ ] 12_intgrte-sct-int-tas-view-06J: Integrate SectionEditor into task views → @implementation-agent
- [ ] 13_intgrte-mtd-int-tas-view-06X: Integrate MetadataEditor into task views → @implementation-agent
- [ ] 14_wire-up-mcp-api-cal-for-all-06Y: Wire up MCP API calls for all components → @implementation-agent

### Gate: Integration Testing
All components integrated and working with real data

### Phase 5: Testing & Polish
- [ ] Test all CRUD operations end-to-end
- [ ] Polish animations and transitions
- [ ] Add error handling and edge cases

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
- 2025-06-06: 2025-06-05 11:30: === ORCHESTRATION RUN ===
  - Current Phase: Phase 3 Implementation complete ✓
  - Previous Gate: Design Review (Passed)
  - Status Analysis:
    - Phase 3: All Storybook components completed
      - 09_cret-cmmndpltte-ci-strybok-06V: Done ✓
      - 05_cret-sctndtor-ci-strybok-06G: Done ✓ (parallel)
      - 05_cret-mtdtdtor-ci-strybok-06K: Done ✓ (parallel)
    - Additional bug fix task completed:
      - 10_fix-strybok-ci-bloc-stor-06A: Done ✓
  - Next Gate: Storybook Review (Pending)
  - Ready Actions:
    - All Storybook components are complete and working
    - Storybook is accessible at http://localhost:6006/
    - Ready for human review of all components
  - Next Step: Human must review all components in Storybook
  - Resume: After human approval, create Phase 4 app integration tasks
- 2025-06-06: 2025-06-05 11:35: === ORCHESTRATION COMPLETE ===
  - Tasks Dispatched: 0 (no new tasks to dispatch)
  - Current Status: Waiting for Storybook Review Gate
  - All Phase 3 components successfully implemented:
    - CommandPalette: Quick task creation with keyboard shortcuts
    - SectionEditor: Inline editing with hover-to-edit pattern
    - MetadataEditor: Optimistic updates for all task metadata
  - Next Step: Human review required at http://localhost:6006/
  - Resume: After human approval, run orchestration to create Phase 4 app integration tasks
- 2025-06-06: 2025-06-05 11:40: === ORCHESTRATION RUN ===
  - Current Phase: Storybook Review Gate
  - Previous Phase: Phase 3 Implementation complete ✓
  - Gate Decision: APPROVED ✓
    - Human confirmed all components reviewed
    - 10_fix-strybok-ci-bloc-stor-06A confirmed complete
  - Status Analysis:
    - All Storybook components approved
    - Ready to proceed to Phase 4: App Integration
  - Ready Actions:
    - Need to create Phase 4 app integration tasks
    - Components ready for integration:
      - CommandPalette for task creation
      - SectionEditor for inline editing
      - MetadataEditor for task properties
  - Next Step: Create app integration tasks
- 2025-06-06: 2025-06-05 11:45: Created Phase 4 app integration tasks:
  - 11_intgrte-ci-app-06U: Integrate CommandPalette into app
  - 12_intgrte-sct-int-tas-view-06J: Integrate SectionEditor into task views (parallel)
  - 12_intgrte-mtd-int-tas-view-06X: Integrate MetadataEditor into task views (parallel)
  - 21_wire-up-mcp-api-cal-for-all-06Y: Wire up MCP API calls for all components
  - Ready for dispatch to implementation agents
- 2025-06-06: 2025-06-05 11:50: Corrected Phase 4 sequencing:
  - SectionEditor and MetadataEditor cannot be parallel
  - Both integrate into same task detail views
  - Updated to sequential execution:
    - 11_intgrte-ci-app-06U: CommandPalette (first)
    - 12_intgrte-sct-int-tas-view-06J: SectionEditor (second)
    - 13_intgrte-mtd-int-tas-view-06X: MetadataEditor (third)
    - 14_wire-up-mcp-api-cal-for-all-06Y: Wire up APIs (last)
- 2025-06-06: 2025-06-05 11:55: Dispatching Phase 4 integration task:
  ```bash
  ./auto 20_intgrte-ci-app-06U reds-tas-cre-and-edi-ui-for-v2-06A
  ```
  - Task: CommandPalette integration
  - Mode: implementation (automatic selection)
  - Next tasks will be dispatched sequentially after completion
- 2025-06-06: 2025-06-05 12:00: === ORCHESTRATION COMPLETE ===
  - Tasks Dispatched: 1 (20_intgrte-ci-app-06U)
  - Current Status: Phase 4 App Integration in progress
  - Session: auto-20_intgrte-ci-app-06U-1749172748450
  - Next Step: Monitor CommandPalette integration
  - Resume: After completion, dispatch SectionEditor integration task
- 2025-06-06: 2025-06-05 17:30: Task 20_intgrte-ci-app-06U completed successfully
  - CommandPalette fully integrated with proper React architecture
  - Schema-driven types, auto-focus UX, accessibility compliance
  - All code quality checks passing, committed to git
  - Ready for production use with Cmd/Ctrl+K global shortcut
- 2025-06-06: 2025-06-05 18:05: === ORCHESTRATION RUN ===
  - Current Phase: Phase 4 App Integration
  - Previous Gate: Storybook Review (Passed ✓)
  - Status Analysis:
    - Phase 3: All Storybook components completed ✓
    - Gate: Storybook Review ✓ Human approved
    - CommandPalette integration (20_intgrte-ci-app-06U): Done ✓
  - Ready Actions:
    - Next task in sequence: 12_intgrte-sct-int-tas-view-06J (SectionEditor integration)
    - Sequential execution required (both tasks integrate into same views)
  - Next Step: Dispatch SectionEditor integration task
- 2025-06-06: 2025-06-05 18:05: Dispatching autonomous task with quality context:
  ```bash
  ./auto 12_intgrte-sct-int-tas-view-06J reds-tas-cre-and-edi-ui-for-v2-06A
  ```
  - Task: SectionEditor integration into task views
  - Session: auto-12_intgrte-sct-int-tas-view-06J-1749176953930
  - Mode: implementation (automatic selection)
  - Quality Standards: Senior-level React integration required
  - Integration Context: Must work seamlessly with existing task detail views
  - Next: MetadataEditor integration (13_intgrte-mtd-int-tas-view-06X) after completion

2025-06-05 18:05: === ORCHESTRATION COMPLETE ===
  - Tasks Dispatched: 1 (12_intgrte-sct-int-tas-view-06J)
  - Current Status: Phase 4 App Integration continuing
  - Sequential Work: SectionEditor integration in progress
  - Next Step: Monitor SectionEditor integration completion
  - Resume: After completion, dispatch MetadataEditor integration task
- 2025-06-06: 2025-06-05 18:20: === TASK REDISPATCH ===
  - Task: 12_intgrte-sct-int-tas-view-06J (SectionEditor integration)
  - Reason: Previous session was terminated
  - New Session: auto-12_intgrte-sct-int-tas-view-06J-1749177244656
  - Status: Task now has complete content and proper guidance
  - Context: SectionEditor integration with detailed instructions and task breakdown
  - Next: Continue sequential execution to MetadataEditor after completion

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
