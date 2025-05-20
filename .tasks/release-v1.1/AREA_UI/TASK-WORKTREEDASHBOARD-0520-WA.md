+++
id = "TASK-WORKTREEDASHBOARD-0520-WA"
title = "Worktree Dashboard for Tasks UI"
type = "specification"
status = "🟣 Review"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-20"
assigned_to = ""
phase = "release-v1.1"
subdirectory = "AREA_UI"
tags = [ "specification", "UI", "TaskWorktree" ]
+++

# Worktree Dashboard for Tasks UI

## Overview

The Worktree Dashboard will transform the Tasks UI home screen into a centralized monitoring interface for active git worktrees. This feature addresses the challenge of managing multiple parallel tasks by providing a card-based view with critical information about each worktree, including task metadata, git status, and activity timestamps. This enables users to efficiently monitor and switch between parallel workspaces without excessive context switching.

## Requirements

### Functional Requirements

1. **Worktree Discovery**
   - 1.1. Detect and list all active git worktrees for the current repository
   - 1.2. Extract branch names and match them to corresponding task IDs
   - 1.3. Handle edge cases where worktree branches don't match task ID pattern
   - 1.4. Auto-refresh worktree list at configurable intervals (default: 30 seconds)

2. **Worktree Information Display**
   - 2.1. Display each worktree as a card in a responsive grid layout
   - 2.2. Show task ID, title, and status from task metadata
   - 2.3. Show git branch name and current commit hash
   - 2.4. Display count of uncommitted changes, if any
   - 2.5. Show most recent commit message and timestamp
   - 2.6. Indicate last activity timestamp for the worktree

3. **Status Visualization**
   - 3.1. Use color coding to indicate worktree status (active, clean, has changes)
   - 3.2. Provide visual emphasis for worktrees with uncommitted changes
   - 3.3. Include placeholder for future Claude interaction status
   - 3.4. Implement a status indicator for each worktree (indicator icon + label)

4. **Interaction**
   - 4.1. Enable clicking a worktree card to view detailed information
   - 4.2. Provide direct links to open the task in the task detail view
   - 4.3. Allow manual refresh of worktree status
   - 4.4. Include configuration options for refresh interval

### Technical Requirements

1. **Git Integration**
   - 1.1. Use simplegit package for git operations
   - 1.2. Create backend API endpoints to safely execute git commands
   - 1.3. Implement caching to prevent excessive git operations
   - 1.4. Handle git errors gracefully with user-friendly messages

2. **Task System Integration**
   - 2.1. Fetch task metadata for corresponding worktree branches
   - 2.2. Use existing task API endpoints for metadata retrieval
   - 2.3. Handle cases where tasks may have been deleted or moved

3. **Performance & Scalability**
   - 3.1. Optimize for up to 10 concurrent worktrees
   - 3.2. Implement pagination if more than 10 worktrees exist
   - 3.3. Use efficient polling strategies to minimize resource usage
   - 3.4. Implement proper loading and error states

4. **Extensibility**
   - 4.1. Design component architecture to accommodate future enhancements
   - 4.2. Include hooks for future Claude interaction monitoring
   - 4.3. Support future feature grouping of related worktrees

## UI/UX Design

### Dashboard Layout

1. The dashboard will replace the current home view in the Tasks UI
2. A responsive grid layout will display worktree cards (3 columns on large screens, 2 on medium, 1 on small)
3. Each card will be approximately 320px wide and 200px tall
4. A top bar will include:
   - Dashboard title ("Worktree Dashboard")
   - Last refresh timestamp
   - Manual refresh button
   - Settings button for configuration options

### Worktree Card Design

1. Each card will include:
   - Header: Task ID and status indicator (color-coded)
   - Title: Task title (truncated if necessary)
   - Status section: Git status (clean/changes) with icon and count
   - Activity section: Last commit info and timestamp
   - Footer: Links to task detail and refresh button

2. Status indicators:
   - Green: Clean worktree (no uncommitted changes)
   - Yellow: Uncommitted changes present
   - Gray: Inactive/stale worktree (no recent activity)
   - Blue: Active worktree (recent activity)

3. Card interactions:
   - Hover: Subtle elevation change
   - Click: Open detailed view or expand card
   - Status icons: Show tooltips with additional information

### User Flow

1. User opens Tasks UI
2. Dashboard automatically loads and displays active worktrees
3. User can scan cards to quickly assess the status of all worktrees
4. User clicks on a specific card to see more details or follow task link
5. Dashboard automatically refreshes at the configured interval
6. User can manually refresh or configure settings as needed

## Technical Design

### Component Architecture

1. **WorktreeDashboard** (new main component)
   - Manages overall layout and data fetching
   - Implements auto-refresh logic
   - Handles loading and error states

2. **WorktreeCard** (new component)
   - Displays individual worktree information
   - Handles card-level interactions
   - Implements status visualizations

3. **WorktreeService** (new service)
   - Interfaces with git operations via API
   - Handles worktree discovery and status checks
   - Implements caching and polling strategies

4. **WorktreeDetailView** (new component)
   - Expanded view of a single worktree
   - Shows detailed git status and history
   - Provides quick actions for worktree management

### API Endpoints

1. **GET /api/worktrees**
   - Returns list of all worktrees with basic information
   - Parameters: None
   - Response: Array of worktree objects

2. **GET /api/worktrees/:worktreedId**
   - Returns detailed information for a specific worktree
   - Parameters: worktreeId (path or branch name)
   - Response: Detailed worktree object

3. **GET /api/worktrees/:worktreeId/status**
   - Returns git status for specific worktree
   - Parameters: worktreeId
   - Response: Git status object (changes, commits, etc.)

### Data Models

```typescript
// Worktree model
interface Worktree {
  id: string;            // Unique identifier (path hash or branch name)
  path: string;          // Filesystem path to worktree
  branch: string;        // Git branch name
  taskId?: string;       // Associated task ID (if available)
  lastActivity: Date;    // Timestamp of last activity
  status: WorktreeStatus; // Current status information
}

// Worktree status model
interface WorktreeStatus {
  isClean: boolean;      // No uncommitted changes
  changesCount: number;  // Number of uncommitted changes
  lastCommit?: {         // Information about last commit
    hash: string;        // Commit hash
    message: string;     // Commit message
    author: string;      // Author name
    timestamp: Date;     // Commit timestamp
  };
  isActive: boolean;     // Recent activity detected
}

// Dashboard configuration
interface WorktreeDashboardConfig {
  refreshInterval: number; // Auto-refresh interval in seconds
  maxWorktrees: number;   // Maximum worktrees to display per page
  showInactive: boolean;  // Whether to show inactive worktrees
}
```

### Integration Points

1. **Tasks UI App Layout**
   - Replace current home view with WorktreeDashboard
   - Update routing configuration

2. **Task Core System**
   - Connect to task metadata APIs
   - Link worktree branches to task IDs

3. **Git Integration**
   - Create adapter for simplegit operations
   - Implement secure API endpoints for git operations

## Implementation Notes

### Development Approach

1. **Phase 1: Core Infrastructure**
   - Implement WorktreeService with git integration
   - Create backend API endpoints
   - Develop basic data models and utilities

2. **Phase 2: UI Components**
   - Build WorktreeCard component
   - Implement WorktreeDashboard container
   - Create responsive grid layout

3. **Phase 3: Data Integration**
   - Connect components to API endpoints
   - Implement auto-refresh and polling logic
   - Add task metadata integration

4. **Phase 4: Refinement**
   - Implement status visualizations
   - Add configuration options
   - Optimize performance and error handling

### Implementation Tips

1. **Git Operations**
   - Use simplegit's `git.worktree()` methods for worktree operations
   - Cache git status results to prevent excessive operations
   - Use git hooks if possible to detect changes more efficiently

2. **React Component Design**
   - Use React Query for data fetching and caching
   - Implement throttling for update operations
   - Use React.memo to prevent unnecessary re-renders

3. **Performance Considerations**
   - Lazy load worktree details only when needed
   - Use virtualization if displaying many worktrees
   - Implement background refresh operations

4. **Security**
   - Sanitize all git command inputs to prevent injection
   - Validate worktree paths before operations
   - Add proper error boundaries around git operations

### Potential Gotchas

1. File system permissions may vary across operating systems
2. Git worktree behavior might differ between Git versions
3. Real-time updates could cause performance issues with many worktrees
4. Browser security may limit direct filesystem access

## Testing Approach

### Unit Tests

1. **WorktreeService Tests**
   - Mock git operations to test discovery logic
   - Test status parsing and error handling
   - Verify caching and polling mechanisms

2. **Component Tests**
   - Test WorktreeCard rendering with various states
   - Verify WorktreeDashboard layout and responsiveness
   - Test interaction handlers and event propagation

3. **Data Model Tests**
   - Validate data transformations and object mapping
   - Test edge cases with missing or invalid data

### Integration Tests

1. **API Integration**
   - Test API endpoints with actual git repositories
   - Verify correct error handling and response formats
   - Test polling behavior and cache invalidation

2. **UI Integration**
   - Test dashboard integration with the main application
   - Verify routing and navigation behavior
   - Test task metadata integration

### Manual Testing Checklist

1. Verify worktree discovery with various repository setups
2. Test with different numbers of worktrees (0, 1, 5, 10+)
3. Check responsiveness across different screen sizes
4. Verify status updates when git changes occur
5. Test performance with frequent polling enabled
6. Verify behavior when git operations fail

## Task Breakdown Preview

### UI Area

1. **Create WorktreeDashboard Component**
   - Complexity: Medium
   - Implement main dashboard layout and container
   - Set up data fetching and refresh logic
   - Create dashboard configuration UI

2. **Develop WorktreeCard Component**
   - Complexity: Medium
   - Design and implement card UI with status indicators
   - Add interactive elements and animations
   - Create responsive layout variants

### Core Area

3. **Implement WorktreeService**
   - Complexity: Medium
   - Create git operation adapter with simplegit
   - Implement worktree discovery and status checking
   - Add caching and polling infrastructure

4. **Build API Endpoints**
   - Complexity: Simple
   - Create REST API endpoints for worktree operations
   - Implement error handling and validation
   - Add security measures for git operations

### Integration Tasks

5. **Task Metadata Integration**
   - Complexity: Simple
   - Connect worktree branches to task IDs
   - Fetch and display task metadata in cards
   - Handle missing or invalid task references

6. **Dashboard Integration and Testing**
   - Complexity: Simple
   - Replace current home view with dashboard
   - Implement e2e tests for the feature
   - Document the feature for users

## Human Review Required

### Technical decisions needing verification:
- [ ] Component architecture and responsibilities
- [ ] Approach to git operations through API endpoints
- [ ] Data model design for worktree information
- [ ] Polling strategy and refresh intervals
- [ ] Security implementation for git operations

### Design decisions to confirm:
- [ ] Card layout and information hierarchy
- [ ] Status visualization approach (colors, icons, labels)
- [ ] Dashboard organization and responsive behavior
- [ ] Error handling and empty state designs
- [ ] Interaction patterns for worktree management

### Implementation concerns:
- [ ] Task breakdown completeness and sequencing
- [ ] Performance impact of frequent git operations
- [ ] Browser security limitations for filesystem access
- [ ] Handling of large numbers of worktrees
- [ ] Testing strategy adequacy for git integration

### Key assumptions to validate:
- [ ] Git worktree branches consistently correspond to task IDs
- [ ] The simplegit package provides all necessary git functionality
- [ ] Web UI can reliably access worktree directories via API
- [ ] Users typically work with fewer than 10 concurrent worktrees
- [ ] 30-second refresh interval balances responsiveness and performance

This section ensures critical decisions are reviewed before implementation begins.

## Related Proposals
- TASK-FEATUREPROPOSAL-0520-RQ: Original feature proposal
