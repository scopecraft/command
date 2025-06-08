# Implement composable CLI commands for environment and work management

---
type: feature
status: in_progress
area: cli
priority: high
---


## Instruction
### Vision

Implement a set of composable CLI commands that provide clear separation of concerns for environment management and work execution. This will replace the current collection of prototype scripts with a unified, consistent interface following Unix philosophy.

### Success Criteria

1. **Clear Command Separation**: 
   - `env` manages environments (worktrees) only
   - `work` handles interactive Claude sessions
   - `dispatch` manages automated/Docker execution

2. **Composability**: Commands can be combined for custom workflows

3. **Parent Task Awareness**: Subtasks automatically use parent's environment

4. **Backwards Compatibility**: Existing workflows continue to function during migration

5. **Developer Experience**: Common operations require fewer keystrokes and less cognitive load

### Technical Context

- Leverage ChannelCoder SDK's native worktree support
- Start with worktrees as environments, extensible to Docker/cloud later
- Share environment resolution logic across all commands
- Use Commander.js for consistent CLI patterns

## Tasks
### Phase 1: Requirements & Design ✓
- [x] Create PRD document with detailed requirements
- [x] Review PRD with stakeholders

### Gate: Design Approval ✓
Decision: PRD approved, proceed to technical design

### Phase 2: Technical Design ✓
- [x] Create Technical Requirements Document (TRD)

### Gate: Technical Review ✓
Decision: TRD approved, proceed to implementation

### Phase 3: Core Implementation (IN PROGRESS)
- [ ] Implement shared environment utilities → @implement-agent
- [ ] Implement env command → @implement-agent

### Phase 4: Work Commands (To be created after core)
- [ ] Implement work command → @implement-agent
- [ ] Update dispatch command → @implement-agent

### Phase 5: Testing & Documentation (To be created)
- [ ] Add integration tests → @test-agent
- [ ] Update CLI documentation → @docs-agent

### Gate: Integration Review
Ensure all commands work together properly

### Orchestration Flow
```
                    ┌─────────────────────────────┐
                    │  Start: CLI Commands Plan   │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 1: REQUIREMENTS ✓    │
                    │ ✓ Create PRD               │
                    │ ✓ Review with stakeholders │
                    └───────────┬─────────────────┘
                                │
                    ╔═══════════▼═════════════════╗
                    ║  DESIGN APPROVAL GATE ✓     ║
                    ║  PRD Approved               ║
                    ╚═══════════╤═════════════════╝
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 2: TECHNICAL DESIGN ✓ │
                    │ ✓ Create TRD               │
                    └───────────┬─────────────────┘
                                │
                    ╔═══════════▼═════════════════╗
                    ║  TECHNICAL REVIEW GATE ✓    ║
                    ║  TRD Approved               ║
                    ╚═══════════╤═════════════════╝
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 3: CORE IMPLEMENTATION│
                    │ ➤ Shared utilities (READY)  │
                    │ - Env command (waiting)     │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 4: WORK COMMANDS      │
                    │ (To be created after core)  │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 5: TEST & DOCS        │
                    │ (To be created)             │
                    └───────────┬─────────────────┘
                                │
                    ╔═══════════▼═════════════════╗
                    ║  INTEGRATION REVIEW GATE    ║
                    ║  Verify all commands work   ║
                    ╚═══════════╤═════════════════╝
                                │
                    ┌───────────▼─────────────────┐
                    │    Complete: Ready for     │
                    │    Production Use          │
                    └─────────────────────────────┘
```

## Deliverable
1. **Three CLI Commands**:
   - `sc env <taskId>` - Environment management (create, close, list)
   - `sc work [taskId] [prompt...]` - Interactive Claude sessions
   - `sc dispatch <taskId>` - Automated Docker execution

2. **Shared Utilities**:
   - Environment resolution module
   - Task-to-worktree mapping logic
   - Mode inference system

3. **Documentation**:
   - Updated CLI help text
   - Migration guide from old scripts
   - Example workflows

4. **Tests**:
   - Unit tests for environment resolution
   - Integration tests for command interaction
   - E2E tests for common workflows

## Log
- 2025-01-08: Created proper parent task with full orchestration flow, instruction, and deliverable sections as required by planning mode
- 2025-06-08: 2025-01-08: Fixed orchestration - Phase 2 tasks are sequential, not parallel, since env command depends on shared utilities
- 2025-06-08: 2025-01-08: Passed Design Approval gate - PRD approved. Created TRD task as Phase 2.
- 2025-06-08: 2025-06-08 12:15: === ORCHESTRATION RUN ===
  - Current Phase: Phase 2: Technical Design
  - Previous Gate: Design Approval (Passed)
  - Phase Status: COMPLETED - TRD approved
  
  Current State Analysis:
  - Phase 1: Requirements & Design ✓ (PRD created and reviewed)
  - Gate: Design Approval ✓ (PRD approved)
  - Phase 2: Technical Design ✓ (TRD created and approved)
  - Gate: Technical Review (READY TO PASS)
  
  Next Step: Technical Review Gate
  - TRD has been reviewed and approved by David
  - Architecture aligned with long-term vision
  - Ready to proceed to Phase 3: Core Implementation
  
  Gate Decision: PASS Technical Review
  - TRD approved on 2025-06-08 12:00
  - All architectural concerns addressed
  - Clear implementation path defined
  
  Ready Tasks in Phase 3:
  - Implement shared environment utilities → @implement-agent
  - Implement env command → @implement-agent (depends on utilities)
  
  Note: These are sequential, not parallel. The env command depends on shared utilities being implemented first.
- 2025-06-08: 2025-06-08 12:20: Phase 3 tasks created with detailed instructions from TRD
  - Created: 04_implmnt-shar-env-utils-06U (shared utilities)
  - Created: 05_implement-env-command-06H (env command)
  - Both tasks populated with specific implementation requirements from TRD
  
  Ready to Dispatch:
  - 04_implmnt-shar-env-utils-06U → @implement-agent
  - Note: This is sequential - env command depends on utilities
  
  Dispatching with quality context:
  ```bash
  ./auto 04_implmnt-shar-env-utils-06U impl-cli-env-mgmt-06A
  ```
  - Quality Standards: Senior-level architecture required
  - Area Guidance: Core utilities need proper separation of concerns
  - Integration Context: Must align with TRD specifications
  - Expectations: Centralized configuration, no magic strings, future-proof design
- 2025-06-08: 2025-06-08 12:26: Dispatched autonomous task with quality context:
  ```bash
  ./auto 04_implmnt-shar-env-utils-06U impl-cli-env-mgmt-06A
  ```
  - Session: auto-04_implmnt-shar-env-utils-06U-1749391603810
  - Mode: Will be auto-selected based on task type and tags
  - Expected: Implementation mode with senior architecture standards
  - Next: Monitor progress and dispatch env command after utilities complete

2025-06-08 12:26: === ORCHESTRATION COMPLETE ===
  - Tasks Dispatched: 1 (shared utilities)
  - Current Status: Waiting for utilities implementation
  - Next Step: Monitor task progress, then dispatch env command
  - Resume: After utilities complete, run orchestration to dispatch env command
