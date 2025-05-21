+++
id = "FEAT-INTEGRATEWORKTREE-0520-D3"
title = "Integrate Worktree Dashboard Components with APIs"
type = "implementation"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-22"
assigned_to = ""
phase = "backlog"
parent_task = "worktree-dashboard"
depends_on = [
  "FEAT-CREATEWORKTREEDASHBOARD-0520-ZB",
  "FEAT-CREATEAPI-0520-QW"
]
tags = [ "AREA:UI", "AREA:integration", "TaskWorktree" ]
subdirectory = "FEATURE_worktree-dashboard"
+++

# Integrate Worktree Dashboard Components with APIs

This task covers the integration of the previously developed visual Worktree Dashboard components with the real API endpoints that provide git worktree data.

## Requirements

### Component Integration
- Connect the WorktreeCard and WorktreeDashboard components to real data sources
- Implement data fetching and transformation from APIs to component props
- Add real-time refresh functionality (using appropriate polling/subscription pattern)
- Handle error states and edge cases with real API responses

### State Management Implementation
- Implement proper state management based on project patterns
- Add caching and persistence for worktree status data
- Optimize refresh cycles to minimize resource usage
- Implement loading and error states with real data

### Task Metadata Integration
- Connect worktree branch names with task metadata
- Implement proper linking between worktrees and task details
- Handle cases where branch names don't match task IDs

### Performance Optimization
- Implement throttling for API requests
- Add pagination or virtualization if needed for large numbers of worktrees
- Optimize rendering performance for status updates
- Implement efficient caching strategy

### User Preferences
- Add user configuration options for refresh interval
- Implement persistence of dashboard settings
- Add options to filter or sort worktrees

## Implementation Details

### API Client Updates
- Update `worktree-client.ts` to replace mock data with real API calls:
  - Uncomment and update the existing fetch code blocks in `fetchWorktrees()`
  - Uncomment and update the existing fetch code in `fetchWorktree()`
  - Update the `getWorktreeSummary()` function to use the API endpoint instead of calculating locally
  - Update the `getDashboardConfig()` and `saveDashboardConfig()` functions to use API endpoints

### Data Mapping
- Ensure API responses are correctly mapped to UI component props:
  - Map WorktreeStatus enum values correctly
  - Map WorkflowStatus enum values as expected by UI
  - Ensure timestamps are properly formatted for display
  - Handle null or undefined values gracefully

### Error Handling
- Implement specific error handling for each API endpoint
- Add retry logic or fallback behavior for critical API calls
- Display user-friendly error messages in the UI

### Testing Approach
- Test each API integration endpoint individually with the UI
- Verify data is displayed correctly in all component states
- Test refresh functionality with real Git changes
- Validate error states with simulated API failures

## Technical Approach
- Use the API interfaces designed in earlier tasks
- Follow project patterns for data fetching and state management
- Ensure proper error handling and loading states
- Add comprehensive logging for debugging

## Dependencies
- Completed WorktreeCard and WorktreeDashboard visual components
- Implemented WorktreeService and API endpoints

## Acceptance Criteria
- [ ] Dashboard loads real worktree data from APIs
- [ ] Status updates are correctly displayed when git changes occur
- [ ] Task metadata is properly linked with worktree branches
- [ ] Refresh functionality works with configurable intervals
- [ ] Error handling gracefully manages API failures
- [ ] Performance remains good with 10+ worktrees
- [ ] All interactive elements (links, buttons) function properly
- [ ] Dashboard correctly updates when worktrees are added/removed
- [ ] Settings and preferences are properly persisted
- [ ] Integration tests pass for all connected components
