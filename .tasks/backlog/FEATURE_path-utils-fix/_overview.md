+++
id = "_overview"
title = "Fix Path Parsing and Refactor Directory Structure"
type = "enhancement"
status = "🟢 Done"
created_date = "2025-05-19"
updated_date = "2025-05-19"
phase = "backlog"
subdirectory = "FEATURE_path-utils-fix"
is_overview = true
assigned_to = ""
+++

# Fix: Path Parsing and Directory Structure Refactoring

## Problem Statement
The current path parsing logic in `projectConfig.parseTaskPath()` fails when using relative root paths (e.g., `./e2e_test/worktree-test`), causing incorrect subdirectory extraction and breaking phase filters. Additionally, the v0.10.0 refactor introduced unnecessary complexity with a "phases" directory concept that doesn't match the actual directory structure.

## Solution (from PRD)
Based on the detailed PRD analysis:
1. Always resolve to absolute paths before parsing
2. Remove the unnecessary phases directory concept  
3. Migrate system directories to dot-prefix convention (.config, .templates)
4. Simplify the codebase by removing special case handling

## Implementation Approach

This fix is implemented in two comprehensive tasks that preserve context:

### Task 1: Core Implementation
- Remove phases directory references
- Enhance directory-utils.ts with absolute path logic
- Update all consumers to use centralized utilities
- Implement migration functionality
- Update documentation inline

### Task 2: Comprehensive Testing
- Create E2E tests (no mocking)
- Update all existing tests
- Perform integration testing
- Validate cross-platform compatibility
- Document results

## Success Criteria
- Path operations work correctly with relative root paths
- Phase filters function properly
- System directories migrated to .config and .templates
- All tests pass
- No performance degradation

## Related Tasks
- Depends on: CHORE-FIXPROJECTCONFIG-0520-BB
- Original PRD: TASK-FEATUREPROPOSAL-0519-TX

## Task Dependencies
```
Core Implementation → Comprehensive Testing
```
