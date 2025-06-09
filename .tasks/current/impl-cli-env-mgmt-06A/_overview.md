# Implement composable CLI commands for environment and work management

---
type: feature
status: in_progress
area: cli
priority: high
assignee: architect
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

### Phase 3: Core Implementation ✓
- [x] Implement shared environment utilities → @implement-agent
- [x] Implement env command → @implement-agent

### Phase 4: Work Commands ✓
- [x] Implement work command → @implement-agent
- [x] Update dispatch command → @implement-agent

### Phase 4.5: Enhancement & Architecture Fix (NEW)
- [ ] Enhance dispatch with session management and tmux → @implement-agent

### Phase 5: Testing & Documentation (To be created)
- [ ] Add integration tests → @test-agent
- [ ] Update CLI documentation → @docs-agent
- [ ] Create migration guide from old scripts → @docs-agent

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
                    │ ✓ Shared utilities          │
                    │ ✓ Env command               │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 4: WORK COMMANDS ✓    │
                    │ ✓ Work command              │
                    │ ✓ Dispatch command          │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 4.5: ENHANCEMENT      │
                    │ ➤ Session mgmt & tmux       │
                    │ ➤ Architecture fixes        │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 5: TEST & DOCS        │
                    │ (To be created after Ph4.5) │
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
- 2025-06-08: 2025-06-08 12:42: === ORCHESTRATION RUN ===
  - Current Phase: Phase 3: Core Implementation
  - Previous Gate: Technical Review (Passed)
  - Phase Transition: Shared utilities completed, proceeding to env command
  
  Current State Analysis:
  - Phase 1: Requirements & Design ✓ (PRD created and reviewed)
  - Phase 2: Technical Design ✓ (TRD created and approved)
  - Phase 3: Core Implementation (IN PROGRESS)
    - ✅ 04_implmnt-shar-env-utils-06U (COMPLETED)
    - ⏳ 05_implement-env-command-06H (READY TO DISPATCH)
  
  Ready Tasks:
  - 05_implement-env-command-06H → @implement-agent (dependencies met: shared utilities complete)
  
  Dispatched autonomous task with quality context:
  ```bash
  ./auto 05_implement-env-command-06H impl-cli-env-mgmt-06A
  ```
  - Session: auto-05_implement-env-command-06H-1749397371702
  - Mode: Will be auto-selected based on task type and tags
  - Expected: Implementation mode with CLI command expertise
  - Integration Context: Uses completed shared environment utilities
  - Quality Standards: Senior-level CLI implementation required
  
  Next Steps:
  - Monitor env command implementation progress
  - After completion, create Phase 4 tasks (work commands)
  - Proceed to final testing and documentation phases
- 2025-06-08: 2025-06-08 18:44: === ORCHESTRATION RUN ===
  - Current Phase: Phase 3: Core Implementation (COMPLETED with ISSUES)
  - Previous Gate: Technical Review (Passed)
  - Phase Status: Implementation completed but critical flaws discovered
  
  Current State Analysis:
  - Phase 1: Requirements & Design ✓ (PRD created and reviewed)
  - Phase 2: Technical Design ✓ (TRD created and approved)
  - Phase 3: Core Implementation ✓ but with CRITICAL ISSUES:
    - ✅ 04_implmnt-shar-env-utils-06U (COMPLETED)
    - ✅ 05_implement-env-command-06H (COMPLETED but FLAWED)
  
  Critical Finding:
  - env list command doesn't show current worktree
  - WorktreeManager.list() filters out non-task branches
  - Implementation violated Unix philosophy of transparency
  - Tool unusable in primary use case
  
  Actions Taken:
  - TRD task (03_cret-tchncal-rqrmnts-doc-06M) REOPENED for architecture review
  - Implementation needs fundamental redesign per findings
  - Phase 4 tasks ON HOLD pending architecture decision
  
  Next Steps:
  - Await architect review of TRD and implementation
  - Decision needed: refactor existing or start fresh
  - Phase 4 cannot proceed until core issues resolved
  
  Gate Status: Technical Review Gate (Re-evaluation Needed)
  - Original approval based on design, not implementation
  - Implementation revealed design gaps
  - Need architect to reassess and provide direction
- 2025-06-08: 2025-06-08 18:49: Dispatched TRD architect review task:
  ```bash
  ./auto 03_cret-tchncal-rqrmnts-doc-06M impl-cli-env-mgmt-06A
  ```
  - Session: auto-03_cret-tchncal-rqrmnts-doc-06M-1749404164258
  - Mode: Design/Architecture review mode expected
  - Task: Review implementation findings and recommend path forward
  - Critical Decision: Refactor existing implementation or start fresh
  
  === ORCHESTRATION PAUSED ===
  - Waiting for architect decision on implementation approach
  - Phase 4 creation blocked until core issues resolved
  - Resume orchestration after architect provides direction
- 2025-06-08: 2025-06-08 18:55: === ARCHITECT REVIEW COMPLETE ===
  - Review completed by architect-agent
  - Report: architecture-review-report.md
  - Finding: 30% TRD fault (rigid assumptions), 70% implementation fault (added constraints)
  
  Key Findings:
  - Core architecture is SOUND
  - Main bug already FIXED (WorktreeManager now shows all worktrees)
  - Centralization of configuration EXCELLENT
  - Module structure and separation of concerns SUCCESSFUL
  
  Recommendation: REFACTOR (Don't Restart)
  - Issues are fixable and mostly fixed
  - Architecture aligns with long-term vision
  - Learning captured for future work
  
  Decision: PROCEED with Phase 4
  - Core implementation issues resolved
  - Ready to build work and dispatch commands
  - Additional testing can happen in parallel
- 2025-06-08: 2025-06-08 19:02: === ORCHESTRATION RUN - PHASE 4 CREATION ===
  - Current Phase: Moving to Phase 4: Work Commands
  - Previous Status: Phase 3 completed with issues resolved
  - Architect Decision: REFACTOR approach approved
  
  Phase 4 Tasks Created:
  - 06_implement-work-command-06Y → @implement-agent
  - 07_update-dispatch-command-06U → @implement-agent
  
  Ready to Dispatch:
  - Work command can be implemented immediately
  - Dispatch command depends on work command (shares mode inference)
  
  Dispatching work command with quality context:
  ```bash
  ./auto 06_implement-work-command-06Y impl-cli-env-mgmt-06A
  ```
  - Quality Standards: Senior CLI developer with ChannelCoder expertise
  - Integration Context: Use completed environment utilities from Phase 3
  - Key Requirements: Interactive task selection, automatic env setup, mode inference
  - Expectations: Seamless user experience from task selection to Claude session
- 2025-06-08: 2025-06-08 19:45: === PHASE 4 EXTENDED ===
  - Testing revealed missing features in dispatch command
  - Created combined task: 09_enha-sess-mgmt-excton-06C
  - Features to add:
    1. Session management integration (like auto-autonomous.ts)
    2. Tmux execution mode for attachable sessions
  - Decision: Combined into single task for cohesive implementation
  - Task includes research phase requirement
  - Ready to dispatch after current Phase 4 tasks complete
- 2025-06-09: 2025-06-08 20:05: === PHASE 4 COMPLETED, PHASE 4.5 ADDED ===
  - Phase 4 work and dispatch commands COMPLETED
  - Testing revealed architectural issues and missing features
  - Created Phase 4.5 for enhancement task: 09_enha-sess-mgmt-excton-06C
  - Enhancement includes:
    - Session management integration for monitoring
    - Tmux execution mode for hybrid sessions  
    - Architecture fix: proper integration layer usage
    - Cleanup: move claude-command-utils.ts to integration layer
  - Progress: 9/11 subtasks complete (82%)
  - Next: Dispatch enhancement task, then create Phase 5 tasks
- 2025-06-09: 2025-06-09 00:10: === ORCHESTRATION RUN ===
  - Current Phase: Phase 4.5 Enhancement COMPLETED
  - Previous Status: All subtasks (10/10) completed
  - Phase Transition: Moving to Phase 5: Testing & Documentation
  
  Current State Analysis:
  - Phase 1: Requirements & Design ✓
  - Phase 2: Technical Design ✓
  - Phase 3: Core Implementation ✓
  - Phase 4: Work Commands ✓
  - Phase 4.5: Enhancement & Architecture Fix ✓
    - ✅ 09_enha-sess-mgmt-excton-06C (DONE)
  - Phase 5: Testing & Documentation (NEW)
  
  Phase 5 Tasks Created:
  - 12_add-intg-test-comm-06J → @test-agent (integration tests)
  - 13_updt-cli-docs-comm-06B → @docs-agent (CLI documentation)
  - 14_cret-mgrton-scri-cli-06L → @docs-agent (migration guide)
  
  All tasks populated with detailed instructions from parent context:
  - Testing task includes coverage for all three commands
  - Documentation tasks cover reference, guides, and migration
  - Ready for dispatch to appropriate agents
  
  Progress: 10/13 subtasks complete (77%)
  - Phase 5 adds final 3 tasks for quality assurance
  - Next: Dispatch testing and documentation tasks
  - Then: Integration Review gate before completion
- 2025-06-09: 2025-06-09 00:17: Dispatched Phase 5 tasks with quality standards:
  ```bash
  ./auto 12_add-intg-test-comm-06J impl-cli-env-mgmt-06A
  ./auto 13_updt-cli-docs-comm-06B impl-cli-env-mgmt-06A
  ./auto 14_cret-mgrton-scri-cli-06L impl-cli-env-mgmt-06A
  ```
  - 12: Test-agent creating comprehensive test suite (session: auto-12_add-intg-test-comm-06J-1749482298749)
  - 13: Docs-agent updating CLI documentation (session: auto-13_updt-cli-docs-comm-06B-1749482306517)
  - 14: Docs-agent creating migration guide (session: auto-14_cret-mgrton-scri-cli-06L-1749482315817)
  - All tasks include detailed requirements from parent context
  - Monitoring: Use monitor-auto to track progress

2025-06-09 00:17: === ORCHESTRATION COMPLETE ===
  - Tasks Dispatched: 3 (all Phase 5 tasks)
  - Current Status: Waiting for testing and documentation completion
  - Progress: 10/13 tasks complete (77%)
  - Next Gate: Integration Review after Phase 5 completes
  - Resume: Run orchestration after all tasks complete to assess Integration Review gate
