# Add sorting and column configuration to TaskTable component

---
type: feature
status: To Do
area: ui
tags:
  - tanstack-table
  - table
  - sorting
  - ui-enhancement
  - refactor
priority: Medium
---


## Instruction
The TaskTable component currently has a static column implementation without sorting or column configuration capabilities. This task involves refactoring the existing table to use TanStack Table and implementing sorting and column configuration features.

## Requirements

### 1. Sorting Capabilities
- Click column headers to sort ascending/descending/unsorted
- Visual indicators for sort direction (up/down arrows)
- Support sorting by: title, status, priority, area, type, createdDate, updatedDate
- Multi-column sorting with shift+click
- Persist sort preferences in URL params (following existing pattern with Zod validation)

### 2. Column Configuration
- Allow users to show/hide columns via dropdown menu
- Add date columns (createdDate, updatedDate) that are hidden by default
- Save column visibility preferences to localStorage
- Consider column reordering via drag and drop (stretch goal)

### 3. Technical Implementation
- Install and integrate @tanstack/react-table
- Maintain backward compatibility with existing TaskTable props
- Follow Storybook-first development approach
- Ensure responsive behavior on mobile (horizontal scroll)
- Use existing UI components (Button, DropdownMenu) for controls

## Current State
- TaskTable uses a custom implementation with hardcoded columns
- No sorting functionality exists
- Date fields are available in Task schema but not displayed
- Column definitions are already structured in an array

## Tasks
- [ ] Install @tanstack/react-table dependency
- [ ] Create TaskTable.stories.tsx story for table with sorting
- [ ] Refactor TaskTable to use TanStack Table
- [ ] Implement column sorting with visual indicators
- [ ] Add URL param persistence for sort state
- [ ] Create story demonstrating column visibility controls
- [ ] Implement column visibility toggle UI
- [ ] Add createdDate and updatedDate columns (hidden by default)
- [ ] Implement localStorage persistence for column preferences
- [ ] Update existing TaskTable stories with new features
- [ ] Test responsive behavior on mobile
- [ ] Update TaskManagementView integration if needed
- [ ] Document sorting and column configuration in stories

## Deliverable
- Refactored TaskTable component using TanStack Table
- Full sorting support with visual indicators and URL persistence  
- Column visibility configuration with localStorage persistence
- Updated Storybook stories demonstrating all features
- Maintained backward compatibility with existing usage
- Mobile-responsive implementation
- No breaking changes to parent components

## Log
