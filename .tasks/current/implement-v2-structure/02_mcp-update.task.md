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
- [x] Remove all phase_* tool handlers
- [x] Remove feature_* tools completely (not repurposing)
- [x] Update task_list to search workflow folders
- [x] Add location parameter to task_list (via phase mapping)
- [ ] Add type filter (simple/parent) to task_list
- [x] Update task_create to use backlog/ by default
- [x] Add task_move handler for workflow transitions
- [x] Update ID resolution in task_get (add parent_id parameter)
- [x] Update task_update to support parent_id parameter for subtasks
- [x] Update task_delete to support parent_id parameter for subtasks
- [x] Update all tool descriptions for new behavior
- [x] Add new parameters to tool schemas
- [x] Update feature_list to find folders with _overview.md
- [x] Handle parent task operations (create folder structure)
- [ ] Add clear error messages for subtask operations (suggest full path or parent_id)
- [x] Test all MCP operations (basic functionality: 15/16 tests passing)
- [ ] Add subtask sequencing tools:
  - [x] `task_resequence` - Reorder subtasks with new sequences (via parent_operations)
  - [x] `task_parallelize` - Make tasks run in parallel (via parent_operations)
  - [ ] `task_sequence` - Update single task sequence number
- [x] Add task conversion tools:
  - [x] `task_promote` - Convert simple task to parent folder
  - [x] `task_extract` - Extract subtask to floating task (note: adoption is broken)
  - [x] `task_adopt` - Adopt floating task as subtask (currently broken in core)
  - [x] Handle filename transformations in conversions (done in core)
- [x] Add parent task management tools:
  - [x] `parent_add_subtask` - Add subtask with sequence options (via parent_operations)
  - [x] `parent_list` - List parent tasks with subtask counts
  - [ ] `parent_get` - Get parent with tree view option (using task_get with format)
  - [x] Include parallel execution indicators in tree view
- [ ] Implement workarounds for known issues:
  - [ ] Handle status truncation (strip emojis, handle spaces)
  - [x] Document adoption bug in tool description
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
- 2025-05-28: Completed phase/feature removal and basic v2 task handlers implementation
- 2025-05-28: Renamed handlers.ts to handlers.old.ts and created fresh v2 implementation
- 2025-05-28: Implemented complete parent task handlers (parent_list, parent_create, parent_operations)
- 2025-05-28: Added task transformation handlers (task_transform with promote/extract/adopt)
- 2025-05-28: Updated core-server.ts with detailed Zod schemas for all new tools
- 2025-05-28: Removed backward compatibility handlers as requested
- 2025-05-28: Created comprehensive test suite test/mcp-v2-complete-system.test.ts covering all V2 MCP functionality including CRUD, parent operations, transformations, workflows, error handling, and performance
- 2025-05-28: Fixed core TypeScript errors in handlers (parameter mapping, function signatures)
- 2025-05-28: Created focused test suite test/mcp-v2-basic-functionality.test.ts - **15/16 tests passing** ✅
- 2025-05-28: Verified core V2 MCP functionality working: task CRUD, parent tasks, workflow states, legacy compatibility
- 2025-05-28: **CRITICAL FIX**: Refactored MCP tool registration to use proper handler pattern from .old file - fixed "no outputSchema" error by adding formatResponse() calls
- 2025-05-28: **COMPLETED**: Removed ALL V2 terminology from user-facing descriptions, tool titles, server name - clean end-user experience
- 2025-05-28: **CRITICAL FIX #3**: Completely removed ALL backward compatibility fields (phase, subdirectory) from MCP schemas and handlers - NO deprecation warnings, clean V2-only API
- 2025-05-28: **BUG FIX**: Fixed include_completed parameter to filter by task status (not workflow location) for MCP token efficiency - added excludeStatuses support to V2 core
