+++
id = "003_cli_commands"
title = "Add CLI Commands for Phase Management"
status = "🟢 Done"
type = "🌟 Feature"
priority = "🔼 High"
created_date = "2025-05-10"
updated_date = "2025-05-13"
assigned_to = ""
phase = "release-v1"
subdirectory = "FEATURE_PhaseManagement"
parent_task = "_overview"
+++

## Phase Management CLI Commands

Add CLI commands to enhance phase management functionality, providing a complete set of commands for creating, updating, and deleting phases.

## Acceptance Criteria

- [x] Implement CLI command to update existing phases
- [x] Implement CLI command to delete phases
- [x] Implement convenience commands for changing phase status (start, complete, block, pending)
- [x] Add support for phase renaming (changing phase ID)
- [x] Add tests for new phase management functions
- [x] Implement safety checks when deleting phases with tasks

## Implementation Log

### Changes

- Added `updatePhase` function to the core task-manager module 
- Added `deletePhase` function with safety check for phases containing tasks
- Implemented `handlePhaseUpdateCommand` for updating phase properties
- Implemented `handlePhaseDeleteCommand` for phase deletion
- Added CLI commands in cli.ts:
  - `phase-update`: Update phase properties including name, description, status
  - `phase-delete`: Delete a phase with optional force parameter
  - Added status shortcuts: `phase-start`, `phase-complete`, `phase-block`, `phase-pending`
- Added tests for phase management functionality

### Approach

The implementation follows the existing pattern in the codebase, extending the phase management functionality with update and delete capabilities. The approach prioritizes:

1. **Type safety**: All functions use proper typing for parameters and return values
2. **Consistency**: CLI commands match existing patterns for task management
3. **Error handling**: Comprehensive validation and error reporting
4. **Data integrity**: Safety checks when deleting phases with tasks
5. **User experience**: Shortcut commands for common operations like changing phase status

The implementation maintains backward compatibility with existing code while enhancing the functionality with a complete set of phase management commands. All commands have been manually tested to verify their functionality.
