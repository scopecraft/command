# Refactor task-manager.ts into Modular Architecture (Initial Phase)

## Overview

This PR begins the refactoring of the large monolithic `task-manager.ts` file (over 2700 lines) into smaller, more maintainable modules following the single responsibility principle. The refactoring improves code organization and maintainability while preserving the existing functionality.

## Changes

- Created modular structure in `src/core/task-manager/` directory:
  - `directory-utils.ts` - Directory operations
  - `utils.ts` - Shared utility functions
  - `task-crud.ts` - Task CRUD operations 
  - `task-relationships.ts` - Relationship management
  - `task-workflow.ts` - Next task finder and workflow operations
  - `phase-crud.ts` - Phase operations
  - `index.ts` - Re-exports all functions

- Updated the original `task-manager.ts` to import and re-export from these new modules
- Fixed a bug in `formatPhasesList` related to task count
- Updated the Phase interface to support task_count property

## Issues Identified

- **Task Status Update Bug**: During testing, we found that task status updates don't persist when using either the task update or start commands. The same commands work correctly on the main branch but not in the refactored code. This suggests an issue in our task update implementation.

## Testing

- Manually tested functionality:
  - Task operations (list, get, create)
  - Phase operations (list, create, update, delete)
  - Workflow operations (findNextTask)
  - Verified the application builds successfully

## Next Steps

Before proceeding with further refactoring:

1. Investigate and fix the task status update bug
2. Once fixed, continue with:
   - Implementing feature/area operations in separate modules
   - Adding unit tests for each module
   - Implementing integration tests
   - Removing the original task-manager.ts file after all imports are updated