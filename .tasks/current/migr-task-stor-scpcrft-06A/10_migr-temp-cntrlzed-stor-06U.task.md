# Migrate templates and modes to centralized storage

---
type: feature
status: todo
area: core
---


## Instruction
Migrate templates and modes to centralized storage following the same pattern as tasks and sessions.

### IMPORTANT: ADR Review Required First
Before implementing, we need to review and update the ADR to determine the appropriate sharing model for templates and modes:
- **User-level**: Share across all projects (e.g., ~/.scopecraft/templates/, ~/.scopecraft/modes/)
- **Project-local**: Keep in repo (e.g., .scopecraft/templates/, .scopecraft/modes/)
- **Project-shared**: Centralized per project (e.g., ~/.scopecraft/projects/{encoded}/templates/)

### Current State
- Templates are stored in repo at `.scopecraft/templates/`
- Modes are stored in repo at `.scopecraft/modes/`
- Both are currently project-specific configurations

### Considerations
- Templates might benefit from user-level sharing (common patterns across projects)
- Modes are likely project-specific (workflow configurations)
- Need to maintain backward compatibility during migration

## Tasks
- [ ] Review and update ADR with decision on templates/modes sharing model
- [ ] Implement storage layer for chosen model
- [ ] Update TemplateManager to use new storage location
- [ ] Update ModeManager to use new storage location
- [ ] Create migration logic for existing templates/modes
- [ ] Update CLI commands for template/mode management
- [ ] Test template/mode operations across worktrees
- [ ] Update documentation

## Deliverable
- Updated ADR with templates/modes storage decision
- Migrated templates and modes to appropriate centralized location
- All template/mode operations working with new storage
- Backward compatibility maintained
- Documentation updated

## Log
- 2025-06-11: Task created with note about ADR review requirement before implementation
