+++
id = "CHORE-FIXPROJECTCONFIG-0520-BB"
title = "Fix ProjectConfig refactor - revert incorrect function signatures and directory config"
type = "chore"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "test"
+++

This task is about fixing errors in the project configuration (project root and environmental variable processing).

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

#### Subdirectory ".." Issue Found

During E2E testing, discovered that tasks with `subdirectory = ".."` are not being listed correctly. This affects:
- Task listing (task not shown at all)
- Phase filtering (task missing from TEST phase)

The file `TEST-ROOTCONFIG-001.md` has this invalid subdirectory value which needs investigation:
- Why is ".." being set as subdirectory?
- How should the system handle parent directory references?
- Should we validate subdirectory values?

#### To Fix

1. Add proper null/undefined checks in `globToTasks` function
2. Improve error handling for glob operations
3. Make project root detection more robust
4. Fix environment variable inheritance from parent configs
5. Validate generated files to prevent creation of invalid templates
6. Fix the task template in utils.ts to have correct TOML structure
7. Investigate and fix the subdirectory ".." issue
