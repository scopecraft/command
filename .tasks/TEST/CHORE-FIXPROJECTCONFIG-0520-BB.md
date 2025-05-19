+++
id = "CHORE-FIXPROJECTCONFIG-0520-BB"
title = "Fix ProjectConfig refactor - revert incorrect function signatures and directory config"
type = "chore"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-19"
updated_date = "2025-05-20"
assigned_to = ""
phase = "test"
+++

This task is about fixing the ProjectConfig refactor that went too far. Focus on reverting incorrect changes while keeping necessary root path configuration.

#### Context

I've been getting the following error when running `task list` from outside the project scope:

```
/Users/davidpaquet/Projects/roo-task-cli/src/core/task-manager/index.ts:152:30
151 |     
152 |       const tasks = files.map((file) => {
TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
      at globToTasks (/Users/davidpaquet/Projects/roo-task-cli/src/core/task-manager/index.ts:152:30)
      at processDirectory (/Users/davidpaquet/Projects/roo-task-cli/src/core/task-manager/index.ts:221:40)
      at listTasks (/Users/davidpaquet/Projects/roo-task-cli/src/core/task-manager/index.ts:267:46)
      at CommandManager.executeInternal (/Users/davidpaquet/Projects/roo-task-cli/src/cli/commands.ts:251:38)
      at CommandManager.execute (/Users/davidpaquet/Projects/roo-task-cli/src/cli/commands.ts:107:36)
      at main (/Users/davidpaquet/Projects/roo-task-cli/src/cli/cli.ts:31:28)
```

#### Investigation Points

1. The error occurs in `globToTasks` when trying to map over `files`
2. The `files` variable is undefined, suggesting the glob call is failing or not being handled correctly
3. This seems to happen when running the command outside the project scope
4. May be related to project root detection or directory structure validation

#### Affected Functionality

- `task list` command when run outside project directories
- Project root detection logic
- Environmental variable processing
- Directory structure validation

#### Previously Found Issues

1. Project root detection needs more robust error handling
2. Environmental variables aren't properly inherited from parent configs
3. Default file generation may create invalid files

#### Template System Issue Found (New)

In `src/core/task-manager/utils.ts`, discovered an issue with the task template:  
- The `const TASK_TEMPLATE` has incorrect indentation that causes "tags" to be placed at the file level instead of inside the "metadata" section
- This makes tags parsing fail and causes tests to break
- Need to fix the template structure: https://github.com/davidpaquet/roo-task-cli/blob/main/src/core/task-manager/utils.ts#L20

#### Issues Fixed

1. ✓ Fixed template function naming: `getTemplateContent` -> `getTemplate`
2. ✓ Removed references to deleted `getMode()` method
3. ✓ Fixed undefined subdirectory issue in task creation (added `|| ''` fallback)
4. ✓ Template system now works with new root configuration

#### Issues Still to Investigate

1. **Subdirectory Path Parsing**: Task `TEST-ROOTCONFIG-001` has incorrect `subdirectory = "e2e_test"` instead of empty
   - Root cause: `parseTaskPath` incorrectly calculates relative paths
   - Phase filter fails because tasks have wrong subdirectory values
   
2. **MCP Server Issues**: Still has references to `ProjectMode` that need removal (but out of scope for this fix)

#### Proposed Solution: Simplify Path Logic

Currently, we have exceptions for special folders (config, templates) mixed with task folders. Two options:

**Option 1: Dot-prefix system folders** ⭐ Recommended
- Rename to `.config/` and `.templates/` 
- Simple filter: ignore anything starting with `.`
- Follows Unix convention
- Minimal migration effort

**Option 2: Separate content directory**
- Move all tasks under `content/` or `phases/`
- Complete separation of concerns
- Bigger structural change
- More complex migration

#### Next Steps

1. Implement Option 1 (dot-prefix for system folders)
2. Fix the `parseTaskPath` logic to correctly extract phase and subdirectory
3. Ensure subdirectory validation doesn't allow ".." values
