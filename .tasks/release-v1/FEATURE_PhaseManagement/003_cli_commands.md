+++
id = "003_cli_commands"
title = "Add CLI Commands for Phase Management"
status = "🟡 To Do"
type = "🌟 Feature"
priority = "🔼 High"
created_date = "2025-05-10"
updated_date = "2025-05-10"
assigned_to = ""
phase = "release-v1"
subdirectory = "FEATURE_PhaseManagement"
parent_task = "_overview"
+++

## Description

Create CLI commands to expose the new phase management functionality to users.

## Tasks

- [ ] Add CLI commands for phase management
  - Create `phase-update` command with appropriate options
  - Create `phase-archive` command to mark phases as complete
  - Add `--show-archived` flag to phase listing commands
  - Update help documentation

## Acceptance Criteria

- CLI interface provides access to all phase operations
- Command options match existing CLI patterns
- Help documentation is updated with examples
- Commands properly validate input and provide clear feedback
- Error handling follows existing patterns with clear messages

## Implementation Notes

- Follow existing CLI command patterns
- Ensure consistent flag naming across commands
- Add examples to help text