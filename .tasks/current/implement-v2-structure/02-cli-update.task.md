# Update CLI for V2 Structure

---
type: chore
status: 🟡 To Do
area: cli
assignee: 
---

## Instruction

Update the CLI commands to work with the new workflow-based structure. Remove phase operations and update task commands for the new system.

**IMPORTANT**: This plan is not complete. Start by reviewing all CLI commands and their implementations. Consider:
- Which commands become obsolete?
- What new commands do we need?
- How do existing workflows change?
- What about command aliases and shortcuts?
- How do we handle command deprecation gracefully?
- Don't hesitate to ask questions about user experience decisions.

### Initial Scope (to be expanded)
1. Remove phase commands entirely
2. Map feature commands to complex tasks
3. Add new filtering options
4. Update task commands for workflow operations
5. Update help text and documentation

### Key Files to Modify
- `src/cli/commands.ts`
- `src/cli/entity-commands.ts`
- Related command implementations

## Tasks

- [ ] Remove all phase-related commands (list/create/update/delete)
- [ ] Update feature commands to work with complex task folders
- [ ] Add `task move` command for workflow transitions
- [ ] Update `task create` to use backlog/ by default
- [ ] Add location filters (--location, --backlog, --current, --archive)
- [ ] Add type filters (--type simple/complex)
- [ ] Update existing filters to work with metadata
- [ ] Add support for custom metadata filters
- [ ] Update list command to search across workflow folders
- [ ] Update help text for all modified commands
- [ ] Add examples for new command patterns
- [ ] Test all command variations

## Deliverable

[To be updated as implementation progresses]

## Log

- 2025-05-27: Task created as part of V2 implementation