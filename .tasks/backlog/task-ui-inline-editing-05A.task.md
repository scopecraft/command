# Task UI Inline Editing

---
type: feature
status: To Do
area: general
priority: Medium
tags: ["idea", "exploration", "ui", "ux", "productivity"]
---

Enable inline editing for task fields (status, priority, assignee) directly in the task list and detail views to reduce navigation and improve efficiency.

## Overview

Currently, editing tasks requires navigating to a separate edit page, which disrupts the user's workflow. This feature would allow users to edit common task fields directly in the task list view or detail view without leaving the current context.

## Benefits
- Faster task updates without page navigation
- Maintain context while making quick changes
- Reduce clicks for common operations
- Improve overall user productivity

## Fields for Inline Editing
- Status (dropdown with emoji statuses)
- Priority (dropdown)
- Assignee (text input with autocomplete)
- Due date (date picker)
- Tags (multi-select or chip input)
- Title (in detail view only)

## Implementation Approaches

### Option 1: Click-to-Edit
- Fields appear as normal text
- Single click transforms field into editable input
- Auto-save on blur or Enter key
- Escape key cancels edit

### Option 2: Always-Editable
- Fields always displayed as styled inputs/dropdowns
- Minimal visual distinction from read-only state
- Immediate save on change
- More discoverable but potentially cluttered

### Option 3: Edit Mode Toggle
- Edit button/icon per row or section
- Enables all fields for editing at once
- Save/Cancel buttons appear
- Good for batch updates

## Technical Considerations
- Use React Table's built-in inline editing support
- Create reusable inline edit components (InlineSelect, InlineText, etc.)
- Implement optimistic updates with rollback on error
- Add loading states during save
- Consider debouncing for text inputs
- Ensure keyboard navigation works properly

## Related Patterns in Codebase
- TaskMoveDropdown shows custom dropdown implementation
- PhaseSelector demonstrates button-based selection
- Filter panel has reusable filter components
- Task form has all the field editors already

## Questions to Resolve
1. Which fields should support inline editing?
2. Which interaction pattern (click-to-edit vs always-editable)?
3. How to handle validation errors inline?
4. Should we show save/cancel buttons or auto-save?
5. How to indicate which fields are editable?

## Log
- 2025-05-28: Recreated from v1 system for preservation in v2 backlog
