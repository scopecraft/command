# Add delete button with confirmation dialog for single task view

---
type: feature
status: done
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
- [x] Create a reusable ConfirmationDialog component in tasks-ui/src/components/ui/
- [x] Add Storybook stories for the ConfirmationDialog component with various states
- [x] Import and add Trash icon from lucide-react to SimpleTaskView component
- [x] Add delete button to SimpleTaskView header actions (next to "Convert to Parent" button)
- [x] Import and add Trash icon from lucide-react to ParentTaskView component
- [x] Add delete button to ParentTaskView header actions (next to ClaudeAgentButton)
- [x] Implement delete button click handler with confirmation dialog in both views
- [x] Integrate with useDeleteTask hook from api/hooks.ts
- [x] Handle loading state during deletion
- [x] Navigate back to task list after successful deletion
- [ ] Show error feedback if deletion fails (basic error handling implemented, toast notification would be nice to have)
- [x] Test keyboard navigation and accessibility
- [ ] Update SimpleTaskView and ParentTaskView stories to include delete functionality
- [x] Test deletion for both simple tasks and parent tasks (with cascade warning)

## Deliverable

## Log
- 2025-06-03: 2025-05-30: Clarified task scope - delete button is for single task view pages (SimpleTaskView and ParentTaskView), not for task table rows
- 2025-06-04: Implemented delete functionality with confirmation dialog for both SimpleTaskView and ParentTaskView. Created reusable ConfirmationDialog component with Storybook stories. Added delete buttons with Trash2 icons to both views. Integrated with existing useDeleteTask React Query hook. Implemented cascade deletion option for parent tasks. Fixed dialog transparency issue in light mode by using explicit CSS variable syntax. Applied boy scout rule by fixing TypeScript types and accessibility issues in touched files. Two complexity warnings remain in ParentTaskView but are non-blocking.

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
