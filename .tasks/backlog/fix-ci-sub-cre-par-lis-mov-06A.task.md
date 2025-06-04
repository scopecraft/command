# Fix CLI issues: subtask creation, parent list/get, move syntax

---
type: bug
status: todo
area: cli
priority: high
---


## Instruction
Fix multiple CLI issues discovered during v2 implementation:

1. **Subtask Creation** (COMPLETED in task 23_fix-cli-sub-cre-to-use-par-06Z)
   - Issue: CLI create command used core.create() even when --parent was specified
   - Fixed: Now uses core.parent().create() when parent is specified
   - Location: src/cli/commands.ts:232-238

2. **Parent Create Command** (NOT IMPLEMENTED)
   - Current state: Just logs options and exits
   - Location: src/cli/entity-commands.ts:241-243
   - Needs: Full implementation using core.createParent()

3. **Parent List Command** (PARTIALLY IMPLEMENTED)
   - Current state: Calls handleFeatureListCommand which prints "not yet implemented"
   - Location: src/cli/entity-commands.ts:258, src/cli/commands.ts:613
   - Needs: Implementation using core parent operations

4. **Parent Get Command** (NOT IMPLEMENTED)
   - Current state: Prints "not yet implemented"
   - Location: src/cli/commands.ts:617
   - Needs: Implementation using core.parent().get()

5. **Task Move Command Syntax** (NEEDS REVIEW)
   - Current implementation uses flags: --to-backlog, --to-current, --to-archive
   - Consider simpler syntax: sc task move <id> backlog|current|archive
   - Location: src/cli/entity-commands.ts:136-145

6. **Parent Update/Delete Commands** (NOT IMPLEMENTED)
   - Both print "not yet implemented"
   - Locations: src/cli/commands.ts:621, 625

## Tasks
- [x] Fix subtask creation to use parent builder (completed in 23_fix-cli-sub-cre-to-use-par-06Z)
- [ ] Implement parent create command
- [ ] Implement parent list command
- [ ] Implement parent get command
- [ ] Implement parent update command
- [ ] Implement parent delete command
- [ ] Review and possibly simplify task move command syntax
- [ ] Add parent add-subtask command implementation (currently partial)

## Deliverable
Fully functional CLI commands for:
- Creating parent tasks with proper folder structure
- Listing parent tasks with progress information
- Getting parent task details with subtasks
- Updating parent task metadata
- Deleting parent tasks (with cascade option)
- Simplified task move syntax
- All commands properly integrated with core v2 API

## Log
- 2025-06-04: Created task to track CLI issues found during v2 implementation
- 2025-06-04: Subtask creation fix completed in task 23_fix-cli-sub-cre-to-use-par-06Z
