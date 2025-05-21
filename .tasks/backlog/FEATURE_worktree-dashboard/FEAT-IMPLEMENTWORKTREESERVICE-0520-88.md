+++
id = "FEAT-IMPLEMENTWORKTREESERVICE-0520-88"
title = "Implement WorktreeService for Git Operations"
type = "implementation"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-21"
assigned_to = ""
phase = "backlog"
parent_task = "worktree-dashboard"
depends_on = [ "RESEARCH-RESEARCHGIT-0520-JB" ]
tags = [ "AREA:core", "TaskWorktree" ]
subdirectory = "FEATURE_worktree-dashboard"
+++

# Implement WorktreeService for Git Operations

This task covers the implementation of the core service that will handle git worktree operations using simplegit.

## Requirements

### Worktree Discovery
- Implement functions to list all active git worktrees for a repository
- Extract path, branch name, and basic information
- Create utilities to match branch names with task IDs

### Git Status Monitoring
- Create functions to check git status (uncommitted changes)
- Implement last commit retrieval and parsing
- Add timestamp tracking for worktree activity

### Data Model Implementation
- Create the Worktree and WorktreeStatus interfaces
- Implement serialization/deserialization methods
- Add utility functions for data transformations

### Caching and Performance
- Implement caching strategy to minimize redundant operations
- Create throttling mechanisms for frequent status checks
- Add utilities for detecting significant changes only

## Technical Approach
- Use simplegit package for git operations
- Create a service class with clear interface
- Implement proper error handling and logging
- Use TypeScript for strong typing

## API Design
- `listWorktrees()`: Returns array of worktree objects
- `getWorktreeStatus(worktreePath)`: Returns detailed status
- `getLastCommit(worktreePath)`: Returns last commit info
- `getChangesCount(worktreePath)`: Returns count of uncommitted changes

## Dependencies
- simplegit package for git operations
- Task metadata API for task ID correlation

## Acceptance Criteria
- [ ] WorktreeService correctly discovers all active worktrees
- [ ] Git status information is accurately retrieved
- [ ] Branch names are properly correlated with task IDs when possible
- [ ] Caching strategy prevents redundant operations
- [ ] Error handling is robust and user-friendly
- [ ] Performance is optimized for up to 10 concurrent worktrees
- [ ] Code is well tested with unit tests
