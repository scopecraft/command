# Add delete button with confirmation dialog for single tasks in TaskUI

---
type: feature
status: todo
area: ui
tags:
  - ui
  - delete
  - confirmation-dialog
  - task-table
  - ux
  - component
priority: medium
---


## Instruction
Implement a delete button with confirmation dialog for individual tasks in the TaskUI table view. This feature should follow UX best practices and be implemented as a reusable confirmation dialog component that can be used for other destructive actions throughout the application.

## Tasks
- [ ] Create a reusable ConfirmationDialog component in tasks-ui/src/components/ui/
- [ ] Add Storybook stories for the ConfirmationDialog component with various states
- [ ] Import and add Trash icon from lucide-react to the TaskTable component
- [ ] Add delete button to TaskTable row actions (rightmost column)
- [ ] Implement delete button click handler with confirmation dialog
- [ ] Integrate with useDeleteTask hook from api/hooks.ts
- [ ] Handle loading state during deletion
- [ ] Show success/error feedback after deletion
- [ ] Test keyboard navigation and accessibility
- [ ] Update TaskTable stories to include delete functionality
- [ ] Test with both simple tasks and parent tasks (cascade option)

## Deliverable
## Deliverables

1. **ConfirmationDialog Component**
   - Reusable dialog component for confirming destructive actions
   - Props for title, description, confirmText, cancelText, onConfirm, onCancel
   - Built on top of existing Dialog component from Radix UI
   - Follows project's Tailwind styling patterns

2. **TaskTable Enhancement**
   - Delete button (trash icon) in the rightmost column of each row
   - Hover state and proper spacing
   - Disabled state for tasks that cannot be deleted
   - Confirmation dialog integration

3. **UX Considerations**
   - Delete button positioned at the end of the row to prevent accidental clicks
   - Subtle styling (ghost button) until hovered
   - Clear confirmation message: "Are you sure you want to delete '[task title]'?"
   - For parent tasks: "This will also delete all X subtasks. Are you sure?"
   - Destructive action styling (red color) for confirm button

4. **Storybook Stories**
   - ConfirmationDialog stories with all states
   - TaskTable stories showing delete functionality
   - Interactive examples for testing

5. **Integration**
   - Full integration with existing React Query hooks
   - Proper cache invalidation after deletion
   - Loading states and error handling

## Log
