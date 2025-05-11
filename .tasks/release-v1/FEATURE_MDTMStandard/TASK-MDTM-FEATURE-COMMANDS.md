+++
id = "TASK-MDTM-FEATURE-COMMANDS"
title = "Implement MDTM Feature Management Commands"
type = "🌟 Feature"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-10"
updated_date = "2025-05-10"
assigned_to = ""
is_overview = false
phase = "release-v1"
+++

## Description

Implement a set of high-level commands to simplify working with MDTM feature directories and task organization. These commands will act as wrappers around existing CLI functionality, handling the subdirectory naming conventions and special file types automatically.

## Background & Analysis

Now that the system supports MDTM directory structures with subdirectories, we need user-friendly commands to work with features, areas, and epics following the MDTM standard without requiring users to manually handle all the underlying parameters.

The MDTM specification organizes tasks in feature directories with special naming conventions and overview files:

```
tasks/
  FEATURE_authentication/  # Feature directory
    _overview.md           # Epic/feature overview
    001_login_ui.md        # Individual tasks
  AREA_refactoring/        # Another organizational directory
    ...
```

These high-level commands will make it easier for users to follow these conventions without having to remember all the specific parameters for subdirectory creation, naming standards, etc.

## Tasks

- [ ] Implement feature commands
  - [ ] `feature create <name>` - Create a new feature directory with overview
  - [ ] `feature task <feature> <title>` - Add a task to a feature
  - [ ] `features` - List all features
  - [ ] `feature tasks <feature>` - List tasks in a feature
  - [ ] `feature status <feature>` - Show feature status

- [ ] Implement area commands
  - [ ] `area create <name>` - Create a new area directory with overview
  - [ ] `area task <area> <title>` - Add a task to an area
  - [ ] `areas` - List all areas
  - [ ] `area tasks <area>` - List tasks in an area
  - [ ] `area status <area>` - Show area status

- [ ] Implement epic commands
  - [ ] `epic create <name>` - Create a new epic (special task type)
  - [ ] `epic task <epic> <title>` - Add a task to an epic
  - [ ] `epics` - List all epics

- [ ] Update documentation
  - [ ] Update README.md with new commands
  - [ ] Update feature management documentation

## Command Specifications

### Feature Management

```bash
# Create a new feature with overview file
roo-task feature create <name> --phase <phase> [--description <desc>]

# Add a task to a feature
roo-task feature task <feature-name> --title <title> --type <type> [--seq <number>] [--phase <phase>]

# List all features
roo-task features [--phase <phase>]

# List tasks in a feature
roo-task feature tasks <feature-name> [--phase <phase>]

# Show feature status and progress
roo-task feature status <feature-name> [--phase <phase>]
```

### Area Management

```bash
# Create a new area with overview file
roo-task area create <name> --phase <phase> [--description <desc>]

# Add a task to an area
roo-task area task <area-name> --title <title> --type <type> [--seq <number>] [--phase <phase>]

# List all areas
roo-task areas [--phase <phase>]

# List tasks in an area
roo-task area tasks <area-name> [--phase <phase>]
```

### Epic Management

```bash
# Create a new epic
roo-task epic create <name> --phase <phase> [--feature <feature>]

# Add a task to an epic
roo-task epic task <epic-name> --title <title> --type <type> [--phase <phase>]

# List all epics
roo-task epics [--phase <phase>]
```

## Implementation Notes

1. These commands will be wrappers that use the existing CLI functionality:
   - They'll map to `create`, `list`, etc. with appropriate parameters
   - They'll handle the MDTM directory naming convention (`FEATURE_*`, `AREA_*`)
   - They'll automatically create `_overview.md` files when needed

2. Feature and area commands should follow similar patterns for consistency
   - Both should create subdirectories with the appropriate prefix
   - Both should handle the creation of overview files in the same way
   - Both should provide status and listing commands

3. For tasks within features/areas, sequence numbers should be optional
   - If provided, format task IDs as `001_task-name`, `002_task-name`, etc.
   - If not provided, fall back to the standard ID generation

## Acceptance Criteria

- [ ] All feature management commands are implemented and working correctly
- [ ] All area management commands are implemented and working correctly
- [ ] All epic management commands are implemented and working correctly
- [ ] Commands handle errors gracefully (e.g., when a feature doesn't exist)
- [ ] Documentation is updated with the new commands
- [ ] Manual testing confirms the commands work as expected
- [ ] Commands maintain backward compatibility with existing functionality

