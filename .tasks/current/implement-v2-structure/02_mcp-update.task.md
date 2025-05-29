# Update MCP Server for V2 Structure

---
type: chore
status: Progress
area: mcp
assignee: null
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

### API Design

The final MCP V2 API design is documented in @task:implement-v2-structure/mcp-v2-api-design

Key design decisions:
1. Minimal API surface - ~10 core tools instead of 30+
2. REST-like design with flexible parameters
3. Consistent `parent_id` parameter for subtask context
4. Extensible filtering using v2's `[key: string]: unknown`
5. Section updates fully supported via task_update

### Key Files to Modify
- `src/mcp/handlers.ts`
- `src/mcp/types.ts`
- Tool descriptions and schemas

### Critical Implementation Notes from CLI Experience

1. **Subtask ID Resolution**: Subtasks require full paths `current/parent-id/subtask-id`. The core's `resolveTaskId` doesn't search inside parent folders. Consider adding `parent_id` parameter to task tools.

2. **Known Core Issues**:
   - Task adoption fails with "Failed to get adopted task" error
   - Status values with spaces get truncated ("In Progress" → "Progress")
   - These need workarounds or clear error messages

3. **Terminology**: Use "parent tasks" not "complex tasks" throughout

4. **Function Naming**: Don't use "v2" in function names - only in temporary filenames

## Tasks
- [ ] Remove all phase_* tool handlers
- [ ] Update feature_* tools to work with parent task folders
- [ ] Update task_list to search workflow folders
- [ ] Add location parameter to task_list
- [ ] Add type filter (simple/parent) to task_list
- [ ] Update task_create to use backlog/ by default
- [ ] Add task_move handler for workflow transitions
- [ ] Update ID resolution in task_get (add parent_id parameter)
- [ ] Update task_update to support parent_id parameter for subtasks
- [ ] Update task_delete to support parent_id parameter for subtasks
- [ ] Update all tool descriptions for new behavior
- [ ] Add new parameters to tool schemas
- [ ] Update feature_list to find folders with _overview.md
- [ ] Handle parent task operations (create folder structure)
- [ ] Add clear error messages for subtask operations (suggest full path or parent_id)
- [ ] Test all MCP operations
- [ ] Add subtask sequencing tools:
  - [ ] `task_resequence` - Reorder subtasks with new sequences
  - [ ] `task_parallelize` - Make tasks run in parallel (needs parent_id param)
  - [ ] `task_sequence` - Update single task sequence number
- [ ] Add task conversion tools:
  - [ ] `task_promote` - Convert simple task to parent folder
  - [ ] `task_extract` - Extract subtask to floating task (note: adoption is broken)
  - [ ] `task_adopt` - Adopt floating task as subtask (currently broken in core)
  - [ ] Handle filename transformations in conversions
- [ ] Add parent task management tools:
  - [ ] `parent_add_subtask` - Add subtask with sequence options
  - [ ] `parent_list` - List parent tasks with subtask counts
  - [ ] `parent_get` - Get parent with tree view option
  - [ ] Include parallel execution indicators in tree view
- [ ] Implement workarounds for known issues:
  - [ ] Handle status truncation (strip emojis, handle spaces)
  - [ ] Document adoption bug in tool description
  - [ ] Provide helpful errors when subtask resolution fails

## Deliverable

### MCP V2 Implementation

The implementation follows the API design in @task:implement-v2-structure/mcp-v2-api-design with these core tools:

1. **Task CRUD**: `task_list`, `task_get`, `task_create`, `task_update`, `task_move`, `task_delete`
2. **Parent Tasks**: `parent_list`, `parent_create`, `parent_operations`
3. **Transformations**: `task_transform` (promote/extract/adopt)
4. **Legacy Support**: Feature tools mapped to parent operations

### Expected MCP Tool Structure

Based on CLI implementation, the MCP tools should mirror these patterns:

1. **Task Tools with Parent Support**:
   ```json
   {
     "tool": "task_update",
     "parameters": {
       "id": "02-cli-update",
       "parent_id": "implement-v2-structure",  // Optional, helps resolve subtasks
       "status": "In Progress"
     }
   }
   ```

2. **Parent Task Tools**:
   ```json
   {
     "tool": "parent_get",
     "parameters": {
       "id": "implement-v2-structure",
       "format": "tree"  // Shows tree view with parallel indicators
     }
   }
   ```

3. **Sequencing Tools**:
   ```json
   {
     "tool": "task_parallelize",
     "parameters": {
       "parent_id": "auth-feature",
       "subtask_ids": ["02-impl-api", "03-impl-ui"],
       "target_sequence": "02"  // Optional
     }
   }
   ```

### Error Handling Examples

When subtask not found:
```
Error: Task not found: 02-update
Hint: For subtasks, provide the full path (current/parent/02-update) or use parent_id parameter
```

When multiple tasks found:
```
Error: Multiple tasks found with ID '02-design':
  - current/auth-feature/02-design
  - backlog/ui-refresh/02-design
Please use a more specific ID or provide parent_id
```

## Log
- 2025-05-27: Task created as part of V2 implementation
- 2025-05-28: Updated with lessons learned from CLI implementation
- 2025-05-28: Created comprehensive API design document (@task:implement-v2-structure/mcp-v2-api-design)
- 2025-05-28: Identified need for tags in core v2 types (@task:add-tags-supp-to-core-v2-typs-05A)
