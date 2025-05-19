+++
id = "TASK-FEATUREPROPOSAL-0519-TX"
title = "Feature Proposal: Fix Path Parsing with Centralized PathUtils"
type = "proposal"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "backlog"
subdirectory = "AREA_Core"
tags = [ "proposal", "core", "path-management", "refactor" ]
depends_on = [ "CHORE-FIXPROJECTCONFIG-0520-BB" ]
+++

# Feature Proposal: Fix Path Parsing in Existing Directory Utils

## Problem Statement
Path parsing logic is scattered across multiple files and fails when using relative paths with --root-dir (e.g., `./e2e_test/worktree-test`). This causes incorrect subdirectory extraction, breaking phase filters and task listing. The bug manifests as TEST-ROOTCONFIG-001 having `subdirectory = "e2e_test"` instead of empty string.

## Proposed Solution
Enhance the existing `directory-utils.ts` to handle all path operations with absolute paths internally while accepting relative paths at the API boundary. This consolidates path logic in the appropriate existing module rather than creating a new one.

## Key Benefits
- Fix immediate bug with relative --root-dir paths
- Consolidate path operations in existing utility module
- No new files or modules needed
- Maintains current architecture

## Scope
### Included
- Enhance directory-utils.ts with path parsing logic
- Move getTaskFilePath and parseTaskPath logic to directory-utils
- Convert all paths to absolute internally
- Update ProjectConfig to use directory-utils for path operations
- Update all direct path operations to use enhanced utils

### Not Included
- Full adapter pattern implementation
- Database storage support
- Changing directory structure
- Creating new modules or files

## Technical Approach
Extend the existing directory-utils.ts module with path resolution and parsing methods that work with absolute paths internally:

```typescript
// In existing directory-utils.ts
export function getTaskPath(id: string, phase?: string, subdirectory?: string, config?: RuntimeConfig): string {
  const root = getTasksDirectory(config);
  const absoluteRoot = path.resolve(root);
  // Build absolute path
}

export function parseTaskPath(filePath: string, config?: RuntimeConfig): { phase?: string; subdirectory?: string } {
  const root = getTasksDirectory(config);
  const absoluteRoot = path.resolve(root);
  const absoluteFile = path.resolve(filePath);
  // Work with absolute paths for reliable parsing
}
```

## Complexity Assessment
**Overall Complexity**: Medium

Factors:
- Working within existing module structure
- Clear solution pattern from v0.9.0
- Multiple files need updating to use directory-utils
- Requires careful testing with relative paths

## Dependencies & Risks
- Risk: Breaking existing path operations during migration
- Risk: Edge cases with unusual path configurations
- Dependency: All task CRUD operations rely on path logic
- Benefit: Using existing module reduces architectural changes

## Open Questions
- Should system directories (.config, .templates) be prefixed with dot for cleaner filtering?
- How to handle backward compatibility if path structure changes?
- Should we add path validation for security (prevent ../ traversal)?

### Human Review Required
- [ ] Verify all path operations are captured
- [ ] Check for hidden path dependencies
- [ ] Validate testing approach for edge cases
- [ ] Consider security implications of path handling
- [ ] Review impact on existing integrations
