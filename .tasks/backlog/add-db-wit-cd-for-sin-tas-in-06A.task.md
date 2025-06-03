# Add delete button with confirmation dialog for single task view

---
type: feature
status: todo
area: ui
tags:
  - ui
  - delete
  - confirmation-dialog
  - task-detail
  - ux
  - component
priority: medium
---


## Instruction
Implement a delete button with confirmation dialog for the single task view pages (when viewing an individual task). This feature should be added to both SimpleTaskView and ParentTaskView components, appearing in the header action buttons area. The implementation should follow UX best practices and use a reusable confirmation dialog component.

## Tasks
- [ ] Create a reusable ConfirmationDialog component in tasks-ui/src/components/ui/
- [ ] Add Storybook stories for the ConfirmationDialog component with various states
- [ ] Import and add Trash icon from lucide-react to SimpleTaskView component
- [ ] Add delete button to SimpleTaskView header actions (next to "Convert to Parent" button)
- [ ] Import and add Trash icon from lucide-react to ParentTaskView component
- [ ] Add delete button to ParentTaskView header actions (next to ClaudeAgentButton)
- [ ] Implement delete button click handler with confirmation dialog in both views
- [ ] Integrate with useDeleteTask hook from api/hooks.ts
- [ ] Handle loading state during deletion
- [ ] Navigate back to task list after successful deletion
- [ ] Show error feedback if deletion fails
- [ ] Test keyboard navigation and accessibility
- [ ] Update SimpleTaskView and ParentTaskView stories to include delete functionality
- [ ] Test deletion for both simple tasks and parent tasks (with cascade warning)

## Deliverable
## Deliverables

1. **ConfirmationDialog Component**
   - Reusable dialog component for confirming destructive actions
   - Props for title, description, confirmText, cancelText, onConfirm, onCancel
   - Built on top of existing Dialog component from Radix UI
   - Follows project's Tailwind styling patterns

2. **SimpleTaskView Enhancement**
   - Delete button (trash icon) in the header actions area
   - Positioned after existing action buttons with consistent spacing
   - Ghost button style that becomes visible on hover
   - Confirmation dialog integration
   - Navigation to task list after deletion

3. **ParentTaskView Enhancement**
   - Delete button (trash icon) in the header actions area
   - Same styling and behavior as SimpleTaskView
   - Special confirmation message for parent tasks with subtask count
   - Cascade deletion handling

4. **UX Considerations**
   - Delete button uses ghost variant to prevent accidental clicks
   - Clear confirmation message: "Are you sure you want to delete '[task title]'?"
   - For parent tasks: "This parent task has X subtasks that will also be deleted. Are you sure?"
   - Destructive action styling (red color) for confirm button
   - Loading state during deletion process
   - Error toast if deletion fails

5. **Navigation Flow**
   - After successful deletion, navigate to appropriate task list:
     - For tasks in 'current': navigate to /workflow/current
     - For tasks in 'backlog': navigate to /workflow/backlog
     - For subtasks: navigate to parent task view

6. **Storybook Stories**
   - ConfirmationDialog stories with all states
   - Updated SimpleTaskView stories showing delete functionality
   - Updated ParentTaskView stories showing delete with cascade warning
   - Interactive examples for testing

## Log
- 2025-06-03: 2025-05-30: Clarified task scope - delete button is for single task view pages (SimpleTaskView and ParentTaskView), not for task table rows

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
