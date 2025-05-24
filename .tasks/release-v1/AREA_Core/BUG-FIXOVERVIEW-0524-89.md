+++
id = "BUG-FIXOVERVIEW-0524-89"
title = "Fix Overview Files Appearing in Task Lists"
type = "🐞 Bug"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-24"
updated_date = "2025-05-24"
assigned_to = ""
phase = "release-v1"
subdirectory = "AREA_Core"
tags = [ "bug", "task-listing", "overview-files", "filtering" ]
+++

# Fix Overview Files Appearing in Task Lists

## Description

Overview files (`_overview.md`) are feature/area descriptions and should not be returned in task listing operations. They are currently polluting task lists and making it difficult to see actual actionable tasks.

## Problem

When using `task_list` or similar operations, overview files are returned alongside regular tasks, which is confusing and clutters the interface. Overview files have `is_overview: true` in their metadata but this flag is not being used to filter them out properly.

## Expected Behavior

- Overview files should not appear in standard task lists
- Only actual actionable tasks should be returned
- Overview files should only be accessible when specifically requesting feature/area details

## Reproduction

1. Run `task_list` with any filter
2. Notice `_overview` files appear in results
3. These files have `is_overview: true` in metadata but still show up

## Acceptance Criteria

- [ ] Task listing operations exclude overview files by default
- [ ] Add optional parameter to include overview files if needed
- [ ] MCP task_list method respects this filtering
- [ ] CLI task list commands respect this filtering
- [ ] Overview files remain accessible via feature_get/area_get operations

## Technical Notes

The filtering should happen in:
- `src/core/task-manager.ts` - `listTasks` function
- MCP handlers that call task listing functions
- CLI commands that display task lists

Check the `is_overview` metadata field to identify overview files.
