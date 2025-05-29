# Refactor: Move task resolution functions from id-generator to directory-utils

---
type: chore
status: To Do
area: general
priority: Medium
---


## Instruction

Move task resolution functions from `id-generator.ts` to `directory-utils.ts` where they logically belong. These functions deal with finding task files in the directory structure, not with ID generation or parsing.

## Background

While fixing the task adoption bug, we discovered that `resolveTaskId` and related functions are in the wrong module. The `id-generator.ts` file should focus on:
- Generating IDs (`generateTaskId`, `generateSubtaskId`)
- Parsing IDs (`parseTaskId`)
- Validating ID format (`isValidTaskId`)

But `resolveTaskId` is about finding files on disk - it's doing file system operations, searching through directories, checking if files exist. This is more of a "file system navigation" concern.

## Technical Details

Functions that need to move from `id-generator.ts` to `directory-utils.ts`:
1. `resolveTaskId` - Main function that finds a task file by ID
2. `findTaskInWorkflow` - Helper that searches in a specific workflow state
3. `searchForSubtask` - Helper that searches for subtasks in parent folders
4. `searchArchive` - Helper that searches archive subdirectories
5. `taskIdExists` - Uses resolveTaskId to check if a task exists

Dependencies to handle:
- `resolveTaskId` calls itself recursively (for parent path resolution)
- `id-generator.ts` itself uses `resolveTaskId` internally at line 152
- `task-crud.ts` imports `resolveTaskId`
- `index.ts` exports `resolveTaskId`

## Implementation Plan

1. Copy the functions to `directory-utils.ts`:
   - Add imports for types they need
   - Ensure they have access to other directory utilities

2. Update `id-generator.ts`:
   - Remove the moved functions
   - Import `resolveTaskId` and `taskIdExists` from `./directory-utils.js`
   - Keep other ID-related functions

3. Update imports in other files:
   - `task-crud.ts`: Change import source for `resolveTaskId`
   - Any other files that import these functions

4. Update exports:
   - `index.ts`: Export these functions from `directory-utils` instead

5. Test thoroughly:
   - Task resolution still works
   - Parent task operations work
   - Archive searching works

## Benefits

- Better code organization - directory operations grouped together
- Clearer module responsibilities
- Easier to find related functions
- More intuitive for future developers

## Risks

- Need to ensure all imports are updated
- Circular dependency risk if not careful
- May reveal other misplaced functions

## Acceptance Criteria

- [ ] All task resolution functions moved to directory-utils.ts
- [ ] No circular dependencies introduced
- [ ] All imports updated correctly
- [ ] All tests pass
- [ ] Task operations work as before (create, get, adopt, etc.)

## Tasks

- [ ] Analyze all usages of the functions to be moved
- [ ] Move functions to directory-utils.ts with proper imports
- [ ] Update id-generator.ts to import what it needs
- [ ] Update task-crud.ts imports
- [ ] Update index.ts exports
- [ ] Test all task operations
- [ ] Check for any other misplaced functions

## Deliverable

A cleaner codebase with better module organization where:
- `id-generator.ts` only contains ID generation/parsing/validation
- `directory-utils.ts` contains all directory traversal and file finding logic
- No functionality is broken

## Log
- 2025-05-28: Task created after discovering this issue while fixing the adoption bug
