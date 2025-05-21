+++
id = "FEAT-CREATEAPI-0520-QW"
title = "Create API Endpoints for Worktree Operations"
type = "implementation"
status = "🟢 Done"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-21"
assigned_to = ""
phase = "backlog"
parent_task = "worktree-dashboard"
depends_on = [ "FEAT-IMPLEMENTWORKTREESERVICE-0520-88" ]
tags = [ "AREA:core", "AREA:UI", "TaskWorktree" ]
subdirectory = "FEATURE_worktree-dashboard"
+++

# Create API Endpoints for Worktree Operations

This task involves creating the necessary API endpoints to expose git worktree operations to the Tasks UI dashboard, as defined in the architecture document `docs/worktree-dashboard-architecture.md`.

## Requirements

### API Endpoints to Implement

1. **GET /api/worktrees**
   - Returns list of all worktrees with basic information
   - Parameters: None
   - Response: Array of worktree objects
   - Maps to: `WorktreeService.listWorktrees()`

2. **GET /api/worktrees/:worktreeId**
   - Returns detailed information for a specific worktree
   - Parameters: worktreeId (path or branch name)
   - Response: Detailed worktree object
   - Maps to: `WorktreeService.getWorktree(worktreePath)`

3. **GET /api/worktrees/:worktreeId/status**
   - Returns git status for specific worktree
   - Parameters: worktreeId
   - Response: Git status object (changes, commits, etc.)
   - Maps to: `WorktreeService.getWorktreeStatus(worktreePath)`

4. **GET /api/worktrees/:worktreeId/changes**
   - Returns list of changed files for a specific worktree
   - Parameters: worktreeId
   - Response: Array of changed file objects
   - Maps to: `WorktreeService.getChangedFiles(worktreePath)`

5. **GET /api/worktrees/summary**
   - Returns summary statistics for all worktrees
   - Parameters: None
   - Response: Summary object with counts by status
   - Maps to: `WorktreeService.getWorktreeSummary()`

6. **GET /api/worktrees/config**
   - Returns dashboard configuration
   - Parameters: None
   - Response: Dashboard config object

7. **POST /api/worktrees/config**
   - Updates dashboard configuration
   - Parameters: Config object in request body
   - Response: Updated config object

### Implementation Details

- Integrate with WorktreeService for git operations
- Implement proper error handling and validation
- Add security measures for input sanitization
- Implement response caching for performance
- Create API documentation

## Technical Approach

- Use existing API framework in the project
- Implement RESTful design patterns
- Add proper logging for debugging
- Create interface types for request/response objects
- Follow the server implementation approach defined in the architecture document (lines 556-585)

## Security Considerations

- Sanitize all input parameters
- Validate worktree paths before operations
- Restrict operations to safe, read-only commands
- Add error boundaries around git operations

## Dependencies

- WorktreeService implementation (FEAT-IMPLEMENTWORKTREESERVICE-0520-88)
- Tasks UI API framework

## Implementation Log

### 2025-05-21: API Endpoints Implemented

1. **Server Integration**
   - Added worktree API routes to the existing Bun server
   - Created `src/tasks-ui/server/worktree-api.ts` for handling worktree endpoints
   - Used the singleton pattern for WorktreeService and TaskCorrelationService instances

2. **Implemented Endpoints**
   - Created all 7 required API endpoints as defined in the architecture document
   - Implemented proper route parameter handling and query parameter parsing
   - Added proper error handling for all endpoints

3. **Validation and Security**
   - Used Zod schemas for input validation
   - Implemented path sanitization to prevent path traversal attacks
   - Added proper error messages and error codes
   - Structured response formats for consistency

4. **Performance Optimizations**
   - Implemented caching support via query parameters
   - Added caching for configuration
   - Used the existing caching in WorktreeService

5. **Documentation**
   - Created comprehensive API documentation in `docs/worktree-api.md`
   - Included example request/response structures
   - Added error codes and their meanings
   - Documented security considerations

## Acceptance Criteria

- [x] All API endpoints are implemented and functional
- [x] Endpoints return correct data in expected format
- [x] Error handling provides clear, actionable messages
- [x] Security measures prevent injection or unsafe operations
- [x] Performance is optimized with proper caching
- [x] API is documented for frontend developers
- [x] Endpoints are tested with appropriate test coverage
