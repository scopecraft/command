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
## Orchestration Plan

### Phase 1: Research (Parallel) ✓
- [x] Research UI patterns → @research-agent
- [x] Analyze document-editor → @research-agent

### Gate: Synthesis Review ✓
Decision: Use DualUseMarkdown as base pattern, hybrid approach for creation

### Phase 2: Design
- [ ] Design UI approach → @design-agent

### Gate: Design Review (Pending)
Approval required before implementation planning

### Phase 3: Implementation (To be planned after design)
Tasks will be created dynamically based on design decisions

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
                    │      (Parallel)         │
                    └───────────┬─────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
    ┌───────────▼──────────┐       ┌──────────▼────────────┐
    │ Research UI Patterns │       │ Analyze Document      │
    │   @research-agent    │       │   Editor Prototype    │
    │                      │       │   @research-agent     │
    └───────────┬──────────┘       └──────────┬────────────┘
                │                               │
                └───────────────┬───────────────┘
                                │
                    ╔═══════════▼═════════════╗
                    ║   SYNTHESIS GATE       ║
                    ║   Findings Review       ║
                    ║ @orchestrator-agent    ║
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
                    ║   @reviewer-agent      ║
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
- 2025-05-30: Task created to track V2 create/edit UI redesign work
- 2025-05-30: MCP API has been normalized! See docs/mcp-api-consumer-guide.md for complete API reference
- 2025-06-03: Research phase completed - identified document-editor prototype as key reference
- 2025-06-03: Synthesis gate passed - decision to use DualUseMarkdown pattern with hybrid approach
- 2025-06-03: Design task created based on research findings
- 2025-06-03: Updated parent task to use orchestration-focused structure
