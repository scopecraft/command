# Improve subtask ID resolution for CLI commands

---
type: chore
status: Done
area: cli
priority: Medium
---


## Instruction
Currently, subtask commands require the full path including workflow state to work:
```bash
# This doesn't work:
sc task complete 02-cli-update

# This also doesn't work:
sc task complete implement-v2-structure/02-cli-update

# Only this works:
sc task complete current/implement-v2-structure/02-cli-update
```

This is confusing for users. The CLI should be smart enough to resolve subtask IDs without requiring the full path.

### Current Behavior

According to the v2 spec, subtask IDs should include the parent path:
- Subtask ID: `payment-integration/02-design-ui` (includes parent path)

However, the core's `resolveTaskId` function doesn't search inside parent task folders for subtasks.

### Proposed Solutions

1. **CLI Enhancement**: Make the CLI commands smarter about resolving subtasks:
   - When a task ID isn't found, search all parent folders for matching subtasks
   - Accept both formats: `02-cli-update` and `parent/02-cli-update`
   - Provide helpful error messages when ambiguous

2. **Core Enhancement**: Update `resolveTaskId` to search inside parent folders:
   - When searching workflow directories, also check `*/taskId.task.md`
   - Handle the parent/subtask format as specified

3. **Hybrid Approach**: CLI provides hints to core:
   - Add optional `parentId` parameter to update/complete commands
   - CLI can pass workflow state hints to core functions

## Tasks
- [ ] Analyze how other commands handle subtask resolution
- [ ] Decide on best approach (CLI-only, core change, or hybrid)
- [ ] Implement subtask search in chosen location
- [ ] Update command help text to explain ID formats
- [ ] Add examples showing both short and full ID usage
- [ ] Test with nested parent tasks and ambiguous IDs

## Deliverable
Users should be able to use simple subtask IDs for common operations:
```bash
# These should all work:
sc task complete 02-cli-update
sc task complete parent/02-cli-update
sc task complete current/parent/02-cli-update

# With helpful errors for ambiguous cases:
# "Error: Multiple tasks found with ID '02-design':
#  - current/auth-feature/02-design
#  - backlog/ui-refresh/02-design
# Please use a more specific ID"
```

## Log
- 2025-05-28: Created after discovering subtask resolution issues during CLI testing
