+++
id = "TASK-IMPLEMENTUNIFIED-0520-2K"
title = "Implement Unified WorktreeService for Claude Session Management"
type = "task"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-21"
updated_date = "2025-05-21"
assigned_to = ""
phase = "backlog"
subdirectory = "FEATURE_tmux-claude-sessions"
depends_on = [ "FEAT-IMPLEMENTWORKTREESERVICE-0520-88" ]
tags = [ "AREA:core", "worktree", "claude-integration", "refactoring" ]
+++

## Task: Implement Unified WorktreeService for Claude Session Management

### Description
This task involves enhancing the Claude Session system to leverage the WorktreeService being developed as part of the worktree-dashboard feature. The current implementation creates sessions but doesn't properly handle the scenario where a worktree exists but the session doesn't, requiring a refactor to use a centralized WorktreeService.

### Problem Statement
The current Claude session implementation handles session creation and discovery, but when a user has exited a project and wants to restart a Claude session, the system should detect the existing worktree and attach to it rather than attempting to recreate it. Currently, this functionality exists as a separate flow in the `dispatch` script's "Start from existing worktree" option but isn't integrated into the main workflow.

### Objectives
1. Integrate with the WorktreeService being developed in the worktree-dashboard feature
2. Modify the Claude session creation process to:
   - First check if a worktree exists for the task/feature
   - Use it if found rather than attempting to create a new one
   - Provide better error messaging when a worktree exists but creation fails
3. Refactor the dispatch script and ClaudeSessionButton handlers to use the unified WorktreeService
4. Streamline the user experience when reattaching to existing worktrees

### Technical Details

#### Current Flow
1. ClaudeSessionButton triggers startClaudeSession
2. Server-side handler uses task-worktree.ts to create a worktree
3. If worktree already exists but session doesn't, a new session is created
4. If worktree creation fails, the session creation fails with an error

#### Proposed Flow
1. ClaudeSessionButton triggers startClaudeSession
2. Server queries WorktreeService to check if worktree exists for task
3. If exists, use existing worktree path without recreating
4. Create tmux session using the correct path
5. Provide appropriate feedback in UI

#### Implementation Tasks
1. **Refactor API Dependencies**:
   - Update `claude-session-handlers.ts` to import and use WorktreeService
   - Replace direct calls to task-worktree scripts with WorktreeService methods
   - Add better error handling for worktree lookup failures

2. **Enhance Session Creation Logic**:
   - Modify `handleSessionStart` to first check for existing worktree
   - Update worktree path resolution to use WorktreeService APIs
   - Add logging for the worktree detection flow

3. **Update API Response Structure**:
   - Enhance response to include worktree status (new/existing)
   - Add appropriate status messages for UI feedback

4. **Improve Session Button Component**:
   - Update to handle enhanced API responses
   - Show appropriate UI feedback based on worktree status

### Dependencies
- Depends on worktree-dashboard feature, specifically the WorktreeService implementation
- Requires the WorktreeService to expose methods for:
  - Checking if a worktree exists for a task/feature ID
  - Getting the path to an existing worktree
  - Creating a new worktree if one doesn't exist

### Testing Plan
1. Test session creation when:
   - No worktree or session exists
   - Worktree exists but session doesn't
   - Both worktree and session exist
2. Test error handling for various failure scenarios
3. Verify the UI feedback is appropriate for each scenario

### Success Criteria
- Claude sessions can be started for tasks with existing worktrees without errors
- The system properly reuses existing worktrees without trying to recreate them
- Users receive clear feedback about the worktree/session status
- The implementation is well-structured, leveraging the common WorktreeService

### Notes
- This refactoring provides a more centralized approach to worktree management
- The changes should simplify the codebase by removing duplicate worktree handling logic
- Will improve the user experience for working across multiple sessions

### Related Features/Areas
- FEATURE_worktree-dashboard
- FEATURE_tmux-claude-sessions
