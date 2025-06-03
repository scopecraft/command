# Add bulk delete functionality for tasks in UI

---
type: feature
status: todo
area: ui
tags:
  - bulk-actions
  - delete
  - confirmation-dialog
  - task-management
priority: medium
---


## Instruction
Add the ability to delete multiple tasks at once through the bulk actions section in the Task Management View. When users select tasks and click the Delete button, show a confirmation dialog before performing the deletion.

## Requirements

1. **Confirmation Dialog**
   - Show number of tasks to be deleted
   - Display warning about permanent deletion
   - List selected task titles (truncate if more than 5)
   - Provide Cancel and Confirm Delete buttons
   - Use existing Dialog component from Radix UI

2. **Delete Implementation**
   - Add onClick handler to existing Delete button in bulk actions
   - Execute deletions sequentially to avoid overwhelming the system
   - Handle partial failures gracefully
   - Show success/error toast notifications
   - Clear selection after successful deletion
   - Refresh task list to reflect changes

3. **API Integration**
   - Add bulkDelete method to API client
   - Create bulk delete endpoint in worktree API server
   - Optionally: Add bulk delete MCP handler for efficiency

## UI Flow

1. User selects multiple tasks via checkboxes
2. Bulk actions section appears with Delete button
3. User clicks Delete button
4. Confirmation dialog appears with task count and titles
5. User confirms or cancels
6. If confirmed, tasks are deleted with progress feedback
7. Success/error message shown, list refreshes

## Tasks
- [ ] Add confirmation dialog state management to TaskManagementView
- [ ] Create DeleteConfirmationDialog component
- [ ] Wire up Delete button onClick handler
- [ ] Add bulkDelete method to API client
- [ ] Implement bulk delete endpoint in worktree-api.ts
- [ ] Add sequential deletion logic with error handling
- [ ] Integrate toast notifications for success/failure
- [ ] Clear selection and refresh list after deletion
- [ ] Add loading state during deletion process
- [ ] Write Storybook story for DeleteConfirmationDialog
- [ ] Test partial failure scenarios
- [ ] Optional: Add MCP bulk delete handler

## Deliverable
- Functional bulk delete with confirmation dialog in Task Management View
- DeleteConfirmationDialog component with Storybook story
- API client bulkDelete method
- Server endpoint for bulk deletion
- Proper error handling and user feedback
- Documentation of the bulk delete flow

## Log
