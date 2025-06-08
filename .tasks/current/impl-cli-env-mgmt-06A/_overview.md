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
### Phase 1: Requirements & Design
- [x] Create PRD document with detailed requirements
- [ ] Review PRD with stakeholders

### Gate: Design Approval
Decision point: Approve command structure and naming

### Phase 2: Core Implementation (Sequential)
- [ ] 02_impl-shar-env-utils-06P: Implement shared environment utilities → @implement-agent
- [ ] 03_implement-env-command-06K: Implement env command → @implement-agent

### Phase 3: Work Commands (Sequential)
- [ ] 04_implement-work-command-06D: Implement work command → @implement-agent
- [ ] 05_update-dispatch-command-06P: Update dispatch command → @implement-agent

### Phase 4: Testing & Documentation (Parallel)
- [ ] 06_add-integration-tests-06P: Add integration tests → @test-agent
- [ ] 07_update-cli-documentation-06O: Update CLI documentation → @docs-agent

### Gate: Integration Review
Ensure all commands work together properly

### Orchestration Flow
```
                    ┌─────────────────────────────┐
                    │  Start: CLI Commands Plan   │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 1: REQUIREMENTS      │
                    │ ✓ Create PRD               │
                    │ - Review with stakeholders │
                    └───────────┬─────────────────┘
                                │
                    ╔═══════════▼═════════════════╗
                    ║   DESIGN APPROVAL GATE      ║
                    ║   Approve command structure ║
                    ╚═══════════╤═════════════════╝
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 2: CORE IMPLEMENTATION│
                    │      (Sequential Build)     │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │   02_env-utilities          │
                    │   @implement-agent          │
                    │   (Foundation layer)        │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │   03_env-command            │
                    │   @implement-agent          │
                    │   (Uses utilities)          │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 3: WORK COMMANDS      │
                    │      (Sequential)           │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  04_work-command       │
                    │  @implement-agent      │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  05_dispatch-update    │
                    │  @implement-agent      │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 4: TEST & DOCS       │
                    │      (Parallel)            │
                    └───────────┬─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌───────────────┐     ┌────────────────┐
            │06_integration  │     │07_documentation│
            │@test-agent     │     │@docs-agent     │
            └───────┬────────┘     └───────┬────────┘
                    └───────────┬───────────┘
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
