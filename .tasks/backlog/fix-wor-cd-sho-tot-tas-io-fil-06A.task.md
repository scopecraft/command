# Fix workflow count display showing total tasks instead of filtered counts in UI Sidebar

---
type: bug
status: todo
area: ui
tags:
  - ui
  - sidebar
  - workflow
  - filtering
  - bug-fix
priority: medium
---


## Instruction
The workflow section in the Task UI Sidebar is displaying incorrect counts for each workflow state (backlog, current, archive). Currently, all three counts show the total number of tasks across all workflow states instead of showing the specific count for each individual state.

The issue is in the useWorkflowCounts hook implementation. While the hook correctly fetches tasks for each workflow state separately, there might be an issue with how the API filters tasks or how the counts are calculated.

Current behavior:
- Backlog count shows total tasks (incorrect)
- Current count shows total tasks (incorrect) 
- Archive count shows total tasks (incorrect)

Expected behavior:
- Backlog count should only show tasks in backlog workflow state
- Current count should only show tasks in current workflow state
- Archive count should only show tasks in archive workflow state

## Tasks
- [ ] Debug the useWorkflowCounts hook to verify API calls are using correct filters
- [ ] Check if the API endpoint correctly filters tasks by location parameter
- [ ] Verify the apiClient.getTasks method properly passes location filter
- [ ] Test the workflow counts with known task data
- [ ] Fix the filtering logic if needed
- [ ] Create workflow-specific route components if missing (backlog, current, archive)
- [ ] Update tests to verify workflow counts are correct

## Deliverable
- Working workflow counts in the sidebar that accurately reflect the number of tasks in each workflow state
- Clicking on each workflow state navigates to a filtered view showing only tasks in that state
- No regression in other parts of the UI
- Tests confirming the fix works correctly

## Log
