# Remove buggy prev/next navigation and use sibling subtasks widget

---
type: bug
status: todo
area: ui
priority: high
tags:
  - 'team:frontend'
  - 'execution:autonomous'
  - navigation
  - subtask-ui
---


## Instruction
Fix the buggy previous/next navigation in the subtask detail page by removing it and implementing the sibling subtasks widget as designed in Storybook.

The current implementation has a broken previous/next navigation in the top corner of subtask pages. This should be replaced with the proper sibling subtasks widget that's already been designed and showcased in Storybook.

## Tasks
- [ ] Locate and remove the buggy previous/next navigation from subtask detail pages
- [ ] Verify the sibling subtasks widget is properly implemented (it should already be there)
- [ ] Test navigation between sibling subtasks using the widget
- [ ] Ensure visual highlighting of current subtask works correctly
- [ ] Test with different parent tasks that have varying numbers of subtasks
- [ ] Verify mobile responsiveness of the sibling widget

## Deliverable
A fixed subtask detail page that:
- No longer has the buggy previous/next navigation in the top corner
- Uses the sibling subtasks widget for navigation as designed in Storybook
- Properly highlights the current subtask in the sibling list
- Allows smooth navigation between sibling subtasks

## Log

## Reference implementation
The correct implementation can be found in:
- **Storybook Story**: `task-ui-2/src/components/v2/V2Showcase.stories.tsx` (SubtaskDetailPage story, lines 222-435)
- **Working Example**: Shows sibling subtasks in a compact sidebar with:
  - Progress indicator (e.g., "2/5")
  - Highlighted current subtask
  - Click navigation to siblings

## Current production implementation
The actual route that needs fixing:
- **File**: `task-ui-2/src/routes/tasks/$parentId/$subtaskId.tsx`
- **Current Issue**: Has buggy previous/next navigation that needs removal
- **Good News**: Already has the sibling subtasks widget implemented (lines 266-290)

## Technical details
The sibling widget uses:
- `SubtaskList` component with `variant="compact"`
- `highlightTaskId` prop to show current subtask
- `onTaskClick` handler for navigation
