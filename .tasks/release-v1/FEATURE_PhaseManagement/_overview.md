+++
id = "_overview"
title = "Phase Management Feature"
type = "🌟 Feature"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-10"
updated_date = "2025-05-10"
assigned_to = ""
is_overview = true
phase = "release-v1"
subdirectory = "FEATURE_PhaseManagement"
subtasks = [
  "001_update_phase",
  "002_archive_phase",
  "003_cli_commands",
  "004_mcp_methods",
  "005_named_filters",
  "006_documentation"
]
+++

## Description

Add missing phase management operations to provide full CRUD functionality for phases. Currently, the system only supports creating and listing phases, but lacks update and archive capabilities. This task aims to complete the phase management functionality and add task filtering enhancements.

## Background & Analysis

The current phase management implementation has these limitations:

1. **Missing Phase Operations:**
   - No way to update phase properties (name, description, status)
   - No way to archive phases when they're complete
   - Phase renaming or reorganization requires manual file manipulation

2. **Task Filtering Limitations:**
   - Current filtering requires specifying exact property values
   - No predefined/named filters for common queries (open tasks, high priority, etc.)
   - No easy way to combine multiple filter conditions
   - No built-in way to exclude archived content from listings

3. **Directory Structure Limitations:**
   - Current structure doesn't fully align with MDTM standard
   - No support for FEATURE_*/AREA_* subdirectories within phases
   - Missing _overview.md file support for feature documentation
   - Limited flexibility in task organization

Phases are stored in two locations:
- As directories in the task directory structure
- As entries in a phase configuration file (config/phases.toml)

Any solution must maintain both representations in sync while enhancing the directory structure to better align with MDTM standard practices.

> **Important Note**: The system follows a "never delete" policy. Content should be archived rather than deleted, and archived content should only be displayed when explicitly requested.

## Subtasks

This feature has been broken down into the following subtasks:

1. [001_update_phase](001_update_phase.md) - Implement Phase Update Operation
2. [002_archive_phase](002_archive_phase.md) - Implement Phase Archive Operation
3. [003_cli_commands](003_cli_commands.md) - Add CLI Commands for Phase Management
4. [004_mcp_methods](004_mcp_methods.md) - Add MCP Methods for Phase Operations
5. [005_named_filters](005_named_filters.md) - Implement Named Filters for Task Listing
6. [006_documentation](006_documentation.md) - Update Documentation for Phase Management

## Acceptance Criteria

- Phase update operation allows changing name, description, and status
- Phase archive operation marks a phase as complete but preserves all content
- Archived phases are hidden from default listings but accessible with a flag
- CLI and MCP interfaces support all phase operations
- Task list filter supports common filter presets (open, high priority, etc.)
- Directory structure supports both phase-based and MDTM-standard organization
- Tasks can be organized by feature/area within phases
- Support for _overview.md files in feature/area directories
- All operations maintain data integrity and prevent invalid states
- Error handling follows existing patterns with clear messages
- Directory structure and configuration files remain in sync
- System preserves the "never delete" policy for all content

## Implementation Notes

The implementation should follow existing patterns in the codebase:
- Use `OperationResult<T>` for consistent error handling
- Maintain separation between core functions and CLI/MCP handlers
- Follow existing naming conventions
- Add appropriate validation to prevent data corruption

The archive feature should:
- Use a status field to mark phases as "✅ Complete" or "🗄️ Archived"
- Add an `archived` boolean property to phase objects if needed
- Implement show/hide behaviors in list functions with a parameter

Decisions to be made during implementation:
- Whether phase ID changes should rename directories
- Format and location of filter definitions
- Whether to add a "complete" vs "archive" distinction or use a single state

## MDTM Compatibility

This feature must maintain compatibility with the MDTM standard and Roo Commander:

1. **Status Field Terminology:**
   - Ensure our status values match the MDTM standard values (🟡 To Do, 🔵 In Progress, 🟢 Done, etc.)
   - Consider "Archived" as a special status value or property

2. **Directory Structure:**
   - Support a hybrid directory structure that accommodates both concepts:
     - Phases as workflow stages (our current implementation)
     - FEATURE_*/AREA_* as functional groupings (MDTM standard)
   - Allow tasks to be organized both by phase and by feature/area
   - Support MDTM naming conventions (FEATURE_*, AREA_*, etc.) as subdirectories within phases
   - Implement support for _overview.md files in feature/area directories
   - Allow for sequence-based naming (001_task_name.md) as an option

3. **File Operations:**
   - Follow the "never delete" principle to maintain compatibility with MDTM workflows
   - Archive operations should only change metadata, not move files
   - Ensure file path consistency between CLI and MCP operations

4. **Integration with Roo Commander:**
   - Ensure our tools can be invoked from Roo Commander's `apply_diff` or `search_and_replace` methods
   - MCP methods should provide equivalent functionality to manual file edits
   - Support the workflow described in the MDTM workflow init document
