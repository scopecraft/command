# Update MCP Server for V2 Structure

---
type: chore
status: 🟡 To Do
area: mcp
assignee: 
---

## Instruction

Update the MCP server handlers to work with the new workflow-based structure. Remove phase operations and update all handlers for the new system.

**IMPORTANT**: This plan is not complete. Start by reviewing all MCP handlers and tool definitions. Consider:
- Which tools need to be removed vs repurposed?
- How do we maintain compatibility with existing Claude prompts?
- What new tools might be needed?
- How does error handling change?
- What about tool descriptions and documentation?
- Don't hesitate to ask questions about API design decisions.

### Initial Scope (to be expanded)
1. Remove phase-related MCP tools
2. Update feature tools to work with complex tasks
3. Update task tools for new structure
4. Add workflow state support
5. Update filtering capabilities

### Key Files to Modify
- `src/mcp/handlers.ts`
- `src/mcp/types.ts`
- Tool descriptions and schemas

## Tasks

- [ ] Remove all phase_* tool handlers
- [ ] Update feature_* tools to work with complex task folders
- [ ] Update task_list to search workflow folders
- [ ] Add location parameter to task_list
- [ ] Add type filter (simple/complex) to task_list
- [ ] Update task_create to use backlog/ by default
- [ ] Add task_move handler for workflow transitions
- [ ] Update ID resolution in task_get
- [ ] Update all tool descriptions for new behavior
- [ ] Add new parameters to tool schemas
- [ ] Update feature_list to find folders with _overview.md
- [ ] Handle complex task operations (create folder structure)
- [ ] Test all MCP operations
- [ ] Add subtask sequencing tools:
  - [ ] `task_reorder` - Reorder subtasks with new sequences
  - [ ] `task_make_parallel` - Make tasks run in parallel
  - [ ] `task_update_sequence` - Update task sequence numbers
- [ ] Add task conversion tools:
  - [ ] `task_convert_to_parent` - Convert simple task to parent folder
  - [ ] `task_extract_subtask` - Extract subtask to floating task
  - [ ] Handle filename transformations in task_move
- [ ] Add subtask management tools:
  - [ ] `subtask_add` - Add subtask with auto-sequence
  - [ ] `subtask_list` - List subtasks with sequence info
  - [ ] Include parallel execution info in responses

## Deliverable

[To be updated as implementation progresses]

## Log

- 2025-05-27: Task created as part of V2 implementation