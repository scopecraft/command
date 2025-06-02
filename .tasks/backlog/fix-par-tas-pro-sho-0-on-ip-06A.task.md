# Fix parent task progress showing 0% on individual parent pages

---
type: bug
status: To Do
area: ui
tags:
  - parent-tasks
  - progress-calculation
  - data-mismatch
  - mcp-api
priority: High
---


## Instruction
Fix the parent task progress calculation showing 0% completion on individual parent pages (/parents/$parentId) when the actual completion is higher (e.g., showing 0/13 when 11/13 are done). The parent list page (/parents) displays the correct progress.

## Root Causes Identified

1. **Status value mismatch in ParentTaskView component** (PRIMARY BUG):
   - Component checks for `status === 'Done'` (capitalized) when filtering completed subtasks
   - MCP API returns `status === 'done'` (lowercase)
   - This causes all subtasks to be counted as incomplete

2. **Field name inconsistencies**:
   - ParentTaskCard expects snake_case fields: `workflow_state`, `created_date`, `updated_date`
   - MCP API returns camelCase fields: `workflowState`, `createdDate`, `updatedDate`
   - ParentTaskListView maps these correctly, but ParentTaskCard needs to handle both

3. **Workflow state field access**:
   - ParentTaskView uses `metadata.location` which doesn't exist in the normalized API response
   - Should use `workflowState` directly from the task object

## Technical Details

- The MCP API correctly calculates progress in `transformParentTask()` (src/mcp/transformers.ts:274)
- The API normalizes status values to lowercase ('done', 'todo', etc.)
- ParentTaskListView correctly displays progress by using the pre-calculated `progress` object from the API
- ParentTaskView recalculates progress locally but uses incorrect status comparison

## Tasks
- [ ] Fix status comparison in ParentTaskView - change 'Done' to 'done'
- [ ] Update ParentTaskCard to handle both camelCase and snake_case field names
- [ ] Fix workflow state access in ParentTaskView - use workflowState instead of metadata.location
- [ ] Consider using pre-calculated progress from API instead of recalculating
- [ ] Add test to prevent regression of status case sensitivity
- [ ] Test that progress displays correctly on both list and detail views

## Deliverable
- Parent task pages show correct completion percentage and counts
- Progress bar reflects actual completion status
- Both /parents and /parents/$parentId show consistent progress data
- No regression in parent task list view functionality

## Log
