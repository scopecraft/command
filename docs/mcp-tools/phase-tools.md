# Phase Management MCP Tools

This document provides comprehensive descriptions of Phase management tools available in the Scopecraft Command MCP server. Phases represent logical groupings of tasks such as releases, milestones, or sprints.

## Overview

Phase tools provide CRUD operations for managing project phases within the MDTM system. Phases are top-level organizational units that contain tasks, features, and areas. They help organize work into time-based or goal-based segments.

## Tools

### phase_list

Lists all phases in the project with their current status and metadata.

**Purpose**: Get an overview of all project phases to understand the project timeline and structure. Essential for navigation and planning.

**When to use**:
- To see all available phases in the project
- To check phase statuses and order
- Before creating tasks to know which phase to use
- For project timeline overview

**Parameters**:
- `format` (optional): Output format (reserved for future use)

**Returns**: Array of phase objects with id, name, description, status, order, and task count

**Example**:
```json
{
  "method": "phase_list",
  "params": {}
}
```

### phase_create

Creates a new phase with specified properties.

**Purpose**: Add new phases to organize future work. Phases typically represent releases, sprints, or major milestones in your project.

**When to use**:
- Starting a new release cycle
- Planning a new sprint or iteration
- Creating a milestone-based timeline
- Organizing work into logical time periods

**Parameters**:
- `id` (required): Unique phase identifier (e.g., "release-v2", "sprint-23", "q4-2024")
  - Should be URL-safe (lowercase, hyphens instead of spaces)
  - Will be used as directory name
- `name` (required): Human-readable phase name (e.g., "Release 2.0", "Sprint 23")
- `description` (optional): Detailed description of the phase goals and scope
- `status` (optional): Initial phase status
  - Valid values: "🟡 Pending", "🔵 In Progress", "🟢 Completed", "⚪ Blocked", "🗄️ Archived"
  - Default: "🟡 Pending"
- `order` (optional): Numeric order for sorting phases (lower numbers appear first)

**Returns**: Created phase object

**Example**:
```json
{
  "method": "phase_create",
  "params": {
    "id": "release-v2",
    "name": "Release 2.0",
    "description": "Major feature update including new UI and performance improvements",
    "status": "🟡 Pending",
    "order": 2
  }
}
```

### phase_update

Updates an existing phase's properties.

**Purpose**: Modify phase metadata such as name, description, status, or order. Can also be used to rename a phase (change its ID).

**When to use**:
- Changing phase status (e.g., marking as "In Progress")
- Updating phase description or goals
- Reordering phases
- Renaming a phase

**Parameters**:
- `id` (required): Current phase ID to update
- `updates` (required): Object containing fields to update
  - `id` (optional): New phase ID (renames the phase and its directory)
  - `name` (optional): New human-readable name
  - `description` (optional): New description
  - `status` (optional): New status
    - Valid values: "🟡 Pending", "🔵 In Progress", "🟢 Completed", "⚪ Blocked", "🗄️ Archived"
  - `order` (optional): New numeric order

**Returns**: Updated phase object

**Example**:
```json
{
  "method": "phase_update",
  "params": {
    "id": "release-v2",
    "updates": {
      "status": "🔵 In Progress",
      "description": "Updated: Now includes authentication system rewrite"
    }
  }
}
```

### phase_delete

Deletes a phase and optionally all its contents.

**Purpose**: Remove phases that are no longer needed. Use with caution as this can delete many tasks.

**When to use**:
- Removing cancelled or obsolete phases
- Cleaning up test phases
- Archiving completed work (consider updating status to "Archived" instead)

**Parameters**:
- `id` (required): Phase ID to delete
- `force` (optional): Force deletion even if phase contains tasks (boolean, default: false)
  - If false and phase has tasks, deletion will fail
  - If true, phase and all its contents will be deleted

**Returns**: Success confirmation

**Example**:
```json
{
  "method": "phase_delete",
  "params": {
    "id": "test-phase",
    "force": true
  }
}
```

## Phase Status Values

Phases use the following standardized status values:

- **🟡 Pending** - Phase is planned but not yet started
- **🔵 In Progress** - Phase is currently active
- **🟢 Completed** - Phase has been completed
- **⚪ Blocked** - Phase is blocked by dependencies or issues
- **🗄️ Archived** - Phase is archived (kept for reference but not active)

The system normalizes various input formats to these standard values (e.g., "active" → "🔵 In Progress", "done" → "🟢 Completed").

## Best Practices

1. **Phase IDs**: Use descriptive, URL-safe IDs that indicate the phase purpose
   - Good: "release-v2", "2024-q1", "sprint-23"
   - Avoid: spaces, special characters, or generic names

2. **Phase Organization**: Common patterns include:
   - Release-based: "release-v1", "release-v2", "release-v3"
   - Time-based: "2024-q1", "2024-q2", "sprint-01"
   - Milestone-based: "mvp", "beta", "ga"

3. **Status Management**: Update phase status to reflect actual progress
   - Start with "🟡 Pending" for planning
   - Move to "🔵 In Progress" when work begins
   - Mark "🟢 Completed" when all tasks are done

4. **Order**: Use the order field to control phase display sequence
   - Lower numbers appear first
   - Leave gaps (10, 20, 30) for future phases

## Common Patterns

### Creating a release cycle
```json
// Create the phase
{
  "method": "phase_create",
  "params": {
    "id": "release-v2",
    "name": "Version 2.0 Release",
    "description": "Major update with new features and improvements",
    "order": 20
  }
}

// Later, mark it as active
{
  "method": "phase_update",
  "params": {
    "id": "release-v2",
    "updates": { "status": "🔵 In Progress" }
  }
}
```

### Organizing sprints
```json
// Create multiple sprint phases
{
  "method": "phase_create",
  "params": {
    "id": "sprint-23",
    "name": "Sprint 23 (Jan 15-29)",
    "order": 23
  }
}
```

### Archiving completed work
```json
// Archive instead of delete to preserve history
{
  "method": "phase_update",
  "params": {
    "id": "release-v1",
    "updates": { "status": "🗄️ Archived" }
  }
}
```

## Relationship to Other Tools

- **Tasks**: Tasks are created within phases using the `phase` parameter
- **Features/Areas**: These subdirectories exist within phase directories
- **Workflow**: Phase status affects task discovery and workflow suggestions
- **Templates**: Task templates work across all phases