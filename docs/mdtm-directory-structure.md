# MDTM Directory Structure Support

Scopecraft Command (sc) fully supports MDTM-style directory structures with feature folders and overview files. This enables organizing tasks in a hierarchical manner following the MDTM standard conventions.

## Directory Structure Conventions

The MDTM standard organizes tasks in the following directory structure:

```
tasks/
  FEATURE_authentication/  # Feature directory
    _overview.md           # Epic/feature overview
    001_login_ui.md        # Individual tasks
    002_login_logic.md
  AREA_refactoring/        # Another organizational directory
    ...
```

Scopecraft Command supports this structure through the following conventions:

1. **Feature Directories**: Subdirectories within a phase using the `FEATURE_*` or `AREA_*` prefix
2. **Overview Files**: Special `_overview.md` files that describe the feature
3. **Task Files**: Individual task files within feature directories 

## Using Subdirectory Features

### Creating Feature Directories

Feature directories are automatically created when you create a task with a subdirectory:

```bash
# Create a feature directory with an overview file
sc create \
  --id "_overview" \
  --title "Authentication Feature" \
  --type "🌟 Feature" \
  --phase "release-v1" \
  --subdirectory "FEATURE_Authentication"
```

### Creating Tasks Within Feature Directories

Tasks can be created within feature directories using the `--subdirectory` option:

```bash
# Create a task in a feature directory
sc create \
  --title "Login Form UI" \
  --type "🌟 Feature" \
  --phase "release-v1" \
  --subdirectory "FEATURE_Authentication"
```

### Listing Tasks in Feature Directories

You can list tasks within a specific feature directory:

```bash
# List tasks in a specific feature
sc list --phase "release-v1" --subdirectory "FEATURE_Authentication"

# List only overview files across all phases and directories
sc list --overview
```

### Moving Tasks Between Directories

Tasks can be moved between directories:

```bash
# Move a task to a different feature directory
sc update TASK-ID --subdirectory "FEATURE_UserProfiles"

# Use search-phase and search-subdirectory if the task is hard to find
sc update TASK-ID \
  --search-phase "release-v1" \
  --search-subdirectory "FEATURE_Authentication" \
  --subdirectory "FEATURE_UserProfiles"
```

## Special Handling for Overview Files

Files named `_overview.md` receive special treatment:

1. They are marked with `is_overview: true` in their metadata
2. They can be easily filtered using the `--overview` option
3. They receive a different default content template focusing on feature description

To create an overview file, use `--id "_overview"` when creating a task.

## MCP Support

All subdirectory features are also available through the MCP server:

```json
{
  "method": "task.create",
  "params": {
    "id": "_overview",
    "title": "Authentication Feature",
    "type": "🌟 Feature",
    "phase": "release-v1",
    "subdirectory": "FEATURE_Authentication",
    "priority": "🔥 Highest"
  }
}
```

## Implementation Details

The implementation:

1. Extends the task metadata schema to include `subdirectory` and `is_overview` fields
2. Updates path handling to support nested directories
3. Adds subdirectory-specific filtering to task listing
4. Handles task movement between subdirectories
5. Provides special content templates for overview files

## Compatibility

Tasks created with or without subdirectories are fully compatible. The system works with both flat task lists and hierarchical directory structures, allowing for progressive adoption of the MDTM directory structure.