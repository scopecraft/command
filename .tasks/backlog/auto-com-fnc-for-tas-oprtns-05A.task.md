# Auto-commit functionality for task operations

---
type: feature
status: todo
area: general
priority: medium
tags:
  - idea
  - exploration
  - git-integration
  - configuration
---


## Instruction

## Tasks

## Deliverable

## Log
- 2025-05-28: Recreated from v1 system for preservation in v2 backlog

## Overview
Add automatic git commit functionality for task create/update operations to reduce manual overhead and ensure all task changes are version controlled.

## Background
Currently, every task creation or update requires a manual git commit since tasks are stored as markdown files. This creates friction in the workflow, especially when making multiple task updates in succession.

## Proposed solution
1. **Global Configuration**: Add `autoCommit` boolean to `scopecraft.json` configuration
2. **Runtime Override**: Allow per-operation control via:
   - CLI flag: `--auto-commit` / `--no-auto-commit`
   - MCP parameter: `auto_commit?: boolean` in task_create/update tools
3. **Smart Defaults**:
   - Default to false to maintain backward compatibility
   - Allow project-level configuration override

## Implementation points
- Add git operations to `task-crud.ts` after successful file writes
- Extend `RuntimeConfig` interface with `autoCommit?: boolean`
- Update CLI commands in `commands.ts` to accept auto-commit flags
- Extend MCP handlers to pass through auto-commit parameter
- Use simple, descriptive commit messages:
  - Create: `task: Create [TASK-ID] - [title]`
  - Update: `task: Update [TASK-ID] - [brief description of changes]`

## Technical considerations
- Check if git is available before attempting commits
- Handle cases where working directory is dirty
- Consider batching multiple operations into single commit
- Provide clear feedback about commit status
- Handle commit failures gracefully (log but don't fail operation)

## User experience
- Seamless integration - works transparently when enabled
- Clear feedback about what was committed
- Option to disable per-operation for sensitive changes
- Commit messages follow conventional commit format
