# Refactor Environment & Configuration to Functional/Composable Architecture

---
type: chore
status: in_progress
area: core
priority: high
---


## Instruction
Refactor the heavy OOP-based environment and configuration system to follow the same functional/composable pattern as the channelcoder integration. The current system uses 15+ classes with complex dependencies that violate our Unix philosophy of simple, composable tools.

### Context & Problems

Current architecture has several issues:
1. **Dual-Context Problem**: ConfigurationManager assumes single execution context, but worktrees create legitimate dual-context needs (execution vs project data)
2. **Heavy OOP Structure**: 15+ classes create complex dependency chains 
3. **Scattered Logic**: Path resolution logic spread across multiple services
4. **Session Monitoring Bug**: Symptom of deeper architectural mismatch - sessions created globally but UI looks locally in worktrees

### Success Criteria

- Replace class-based architecture with functional/composable approach
- Cleanly handle dual-context scenarios (worktree execution vs main project data)
- Session monitoring works seamlessly across all execution contexts
- Maintain backward compatibility during transition
- Follow channelcoder integration pattern as reference

### Key Design Principles

- **Function-based exports**: No heavyweight classes, just composable functions
- **Context-aware resolution**: Smart functions that understand execution vs project contexts
- **Single responsibility**: Each function does one thing well
- **Progressive enhancement**: Existing functionality continues working

## Tasks
### Phase 1: Research & Analysis (Parallel) ✓
- [x] 10_anal-curr-envi-06J: Analyze current environment/config class dependencies and usage patterns → @research-agent
- [x] 11_map-cont-rqrmnts-excton-06M: Map dual-context requirements across all execution scenarios → @research-agent

### Gate: Architecture Review ✓
Decision: Proceed with functional architecture design based on research findings

### Phase 2: Design ✓
- [x] 12_desi-fnctnal-api-intg-06R: Design functional API patterns following channelcoder integration style → @design-agent
- [x] 13_revi-agai-archtctre-desi-06B: Review TRD against architecture docs → @architect-agent
- [x] 14_simp-feat-pari-exis-06W: Simplify TRD to feature parity → @design-agent
- [x] 15_rewr-clea-excton-cont-06N: Rewrite with clearer execution context → @design-agent  
- [x] 16_stud-actu-impl-real-06X: Study actual implementation and ground TRD → @design-agent

### Gate: TRD Approval ✓
TRD finalized and grounded in actual implementation - ready for Phase 3

### Phase 3: Implementation
- [ ] 17_cret-rgrsson-test-curr-06K: Create regression test suite for current behavior → @test-agent
- [ ] 09_conv-envrnmntrslver-pure-fns-06D: Convert EnvironmentResolver to pure functions → @implement-agent
- [ ] 09_conv-wrktrmnger-pure-fns-06P: Convert WorktreeManager to pure functions → @implement-agent (parallel)
- [ ] 18_fix-sess-stor-rslton-06O: Fix session storage root resolution bug → @implement-agent
- [ ] 19_updt-cli-comm-fns-06G: Update CLI commands to use new functions → @implement-agent

### Gate: Implementation Review
Verify all functions work correctly and tests pass

### Phase 4: Migration & Testing
- [ ] 20_run-full-regression-test-suite-06G: Run full regression test suite → @test-agent

### Gate: Final Validation
Confirm no breaking changes and session monitoring bug is fixed

## Deliverable

## Log
- 2025-06-09: CRITICAL FINDING: Orchestration execution context bug discovered. When orchestration task runs in worktree and dispatches subtasks in detached mode, the subtasks execute in main worktree instead of inheriting the parent task's worktree context. This indicates the environment/execution context is not being properly propagated through the orchestration → dispatch → execution chain. This is likely another symptom of the same dual-context architectural mismatch affecting session monitoring.
- 2025-06-09: === ORCHESTRATION RUN ===
  - Current Phase: Phase 1: Research & Analysis (Parallel)
  - Phase Status: 2 tasks dispatched with quality standards
  - Dispatched Tasks:
    * 01_anal-curr-envi-06J → Session: detached-01_anal-curr-envi-06J-1749491562784 (PID: 85442)
    * 01_map-cont-rqrmnts-excton-06M → Session: detached-01_map-cont-rqrmnts-excton-06M-1749491563775 (PID: 85493)
  - Quality Standards: Senior-level systems architecture research required
  - Focus Areas: Critical dual-context bugs affecting orchestration and session monitoring
  - Next Gate: Architecture Review (pending research completion)
  - Resume: Monitor research progress, run orchestration after Phase 1 completion
- 2025-06-09: === ARCHITECTURE REVIEW GATE PASSED ===
  - Research Phase: COMPLETED ✓
  - Gate Decision: APPROVED - Proceed with functional architecture design
  - Key Findings: ConfigurationManager singleton root cause confirmed, dual-context bugs identified
  - Phase 2 Created: 03_desi-fnctnal-api-intg-06R (functional API design)
  - Supporting Document: architecture-analysis.md created with gate synthesis
  - Next Action: Design functional API patterns and ExecutionContext interface
  - Status: Ready for Phase 2 dispatch
- 2025-06-09: - 2025-06-09: Cleaned up duplicate task 02_desi-fnctnal-api-intg-06Q (replaced by 03_desi-fnctnal-api-intg-06R with full context)
- 2025-06-09: === PHASE 2 DISPATCH ===
  - Task Dispatched: 03_desi-fnctnal-api-intg-06R → Session: detached-03_desi-fnctnal-api-intg-06R-1749498565990 (PID: 2546)
  - Mode: design-agent (autonomous)
  - Quality Standards: Senior architecture design with ExecutionContext interface
  - Context Provided: Reference to architecture-analysis.md synthesis document
  - Focus: Functional API patterns following channelcoder integration style
  - Next Step: Monitor design task completion, then create implementation tasks
- 2025-06-09: === TRD REVIEW DISPATCH ===
  - Created Review Task: 04_revi-agai-archtctre-desi-06B
  - Purpose: Review TRD against /docs/02-architecture/ for alignment
  - Focus Areas: Service boundaries, orchestration patterns, system integration
  - Dispatched: Session detached-04_revi-agai-archtctre-desi-06B-1749500487212 (PID: 6699)
  - Mode: architect-agent (autonomous review)
  - Action: Will refine TRD document directly based on architecture alignment
- 2025-06-09: === TRD SIMPLIFICATION DISPATCH ===
  - Task: 05_simp-feat-pari-exis-06W - Remove overengineered features, keep alignment
  - Purpose: Bring TRD back to earth - feature parity only
  - Dispatched: Session detached-05_simp-feat-pari-exis-06W-1749501380185 (PID: 8594)
  - Mode: design-agent (autonomous)
  - Action: Will remove feature creep while keeping good naming/structure improvements
- 2025-06-09: === TRD CONCEPT CLARIFICATION ===
  - Task: 06_rewr-clea-excton-cont-06N - Rewrite with clearer concepts
  - Purpose: Simplify to "sensible defaults with overrides" model
  - Key Changes: Replace complex ExecutionContext with simple location rules
  - Dispatched: Session detached-06_rewr-clea-excton-cont-06N-1749505174364 (PID: 14561)
  - Mode: design-agent (autonomous)
  - Philosophy: "Context is where you are" - composable, not prescriptive
- 2025-06-09: === TRD REALITY CHECK ===
  - Task: 07_stud-actu-impl-real-06X - Study actual implementation
  - Purpose: Ground TRD in reality, not design in vacuum
  - Key Focus: Study impl-cli-env-mgmt-06A lessons, actual CLI commands, channelcoder
  - Dispatched: Session detached-07_stud-actu-impl-real-06X-1749505913952 (PID: 16449)
  - Expected: TRD that matches how system actually works
- 2025-06-10: === ORCHESTRATION RUN - PHASE 3 CREATION ===
  - Current State: Design Phase COMPLETED ✓
  - TRD Status: Finalized and grounded in reality
  - Phase 3 Created: 6 implementation tasks
  - Task Breakdown:
    * Regression test creation (prerequisite)
    * Convert EnvironmentResolver and WorktreeManager (parallel)
    * Fix session storage bug
    * Update CLI integration
    * Final validation testing
  - Ready for Dispatch: 17_cret-rgrsson-test-curr-06K (regression tests)
  - Next Step: Create regression tests before starting refactor
- 2025-06-10: === ORCHESTRATION COMPLETE ===
  - Tasks Created: 6 implementation tasks for Phase 3
  - Tasks Dispatched: 1
    * 17_cret-rgrsson-test-curr-06K → Session: detached-17_cret-rgrsson-test-curr-06K-1749523701977 (PID: 46571)
  - Current Status: Regression test creation in progress
  - Next Steps: After regression tests complete, dispatch parallel conversion tasks
  - Resume: Monitor test creation, then dispatch 09_conv-envrnmntrslver-pure-fns-06D and 09_conv-wrktrmnger-pure-fns-06P in parallel
