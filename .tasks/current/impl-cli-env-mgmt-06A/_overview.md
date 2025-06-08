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

### Phase 2: Technical Design
- [ ] Create Technical Requirements Document (TRD)

### Gate: Technical Review
Decision point: Approve technical approach and architecture

### Phase 3: Core Implementation (To be created after TRD)
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
                    │ PHASE 2: TECHNICAL DESIGN   │
                    │ - Create TRD (current)      │
                    └───────────┬─────────────────┘
                                │
                    ╔═══════════▼═════════════════╗
                    ║  TECHNICAL REVIEW GATE      ║
                    ║  Approve implementation     ║
                    ╚═══════════╤═════════════════╝
                                │
                    ┌───────────▼─────────────────┐
                    │ PHASE 3: CORE IMPLEMENTATION│
                    │ (To be created after TRD)   │
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
