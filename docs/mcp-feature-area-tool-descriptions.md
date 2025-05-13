# Feature and Area MCP Tool Descriptions

This document provides detailed descriptions of the Feature and Area management tools available in the Scopecraft Command MCP server.

## Feature Management Tools

The following tools provide management capabilities for features in the MDTM directory structure.

### feature_list

Lists all features in the project with optional filtering.

**Parameters:**
- `phase` (optional): Filter features by phase
- `status` (optional): Filter features by status
- `include_tasks` (optional): Whether to include task details in the response (default: false)
- `include_progress` (optional): Whether to include calculated progress metrics (default: true)
- `format` (optional): Output format (e.g., "json", "table")

**Returns:**
Array of feature objects containing:
- `id`: Feature directory name (e.g., "FEATURE_Authentication")
- `name`: Clean feature name (e.g., "Authentication")
- `title`: Feature title from overview file
- `description`: Feature description from overview file
- `phase`: Phase this feature belongs to
- `status`: Feature status (calculated from tasks if not explicitly set)
- `progress`: Completion percentage (0-100)
- `tasks`: Array of task IDs within this feature
- `overview`: Overview task object (if include_tasks=true)

**Example:**
```json
{
  "method": "feature_list",
  "params": {
    "phase": "release-v1",
    "include_progress": true
  }
}
```

**Annotations:**
- Title: "List Features"
- Read-Only: Yes
- Idempotent: Yes

### feature_get

Gets details about a specific feature.

**Parameters:**
- `id` (required): Feature ID (with or without "FEATURE_" prefix)
- `phase` (optional): Phase to look in (if known)
- `format` (optional): Output format (e.g., "json", "default")

**Returns:**
Feature object with all details, including overview file and task list.

**Example:**
```json
{
  "method": "feature_get",
  "params": {
    "id": "Authentication"
  }
}
```

**Annotations:**
- Title: "Get Feature Details"
- Read-Only: Yes
- Idempotent: Yes

### feature_create

Creates a new feature directory with an _overview.md file.

**Parameters:**
- `name` (required): Feature name (will be prefixed with "FEATURE_" if not already)
- `title` (required): Feature title
- `phase` (required): Phase to create the feature in
- `type` (optional): Feature type (default: "🌟 Feature")
- `status` (optional): Initial status (default: "🟡 To Do")
- `description` (optional): Feature description
- `assignee` (optional): Assigned to
- `tags` (optional): Tags for the feature

**Returns:**
Created feature object with all details.

**Example:**
```json
{
  "method": "feature_create",
  "params": {
    "name": "Authentication",
    "title": "User Authentication System",
    "phase": "release-v1",
    "description": "Implement secure user authentication with OAuth2"
  }
}
```

**Annotations:**
- Title: "Create Feature"
- Read-Only: No
- Destructive: No
- Idempotent: No

### feature_update

Updates a feature's metadata via its _overview.md file.

**Parameters:**
- `id` (required): Feature ID (with or without "FEATURE_" prefix)
- `updates` (required): Object with properties to update:
  - `name` (optional): New feature name (will rename the directory)
  - `title` (optional): New feature title
  - `description` (optional): New feature description
  - `status` (optional): New feature status
- `phase` (optional): Phase to look in (if known)

**Returns:**
Updated feature object with all details.

**Example:**
```json
{
  "method": "feature_update",
  "params": {
    "id": "Authentication",
    "updates": {
      "title": "Enhanced Authentication System",
      "status": "🔵 In Progress"
    }
  }
}
```

**Annotations:**
- Title: "Update Feature"
- Read-Only: No
- Destructive: No
- Idempotent: Yes (for identical updates)

### feature_delete

Deletes a feature directory and all tasks within it.

**Parameters:**
- `id` (required): Feature ID (with or without "FEATURE_" prefix)
- `phase` (optional): Phase to look in (if known)
- `force` (optional): Whether to force deletion even if feature contains tasks (default: false)

**Returns:**
Success message if deletion was successful.

**Example:**
```json
{
  "method": "feature_delete",
  "params": {
    "id": "Authentication",
    "force": true
  }
}
```

**Annotations:**
- Title: "Delete Feature"
- Read-Only: No
- Destructive: Yes
- Idempotent: Yes (deleting already deleted feature will still report success)

## Area Management Tools

The following tools provide management capabilities for areas in the MDTM directory structure.

### area_list

Lists all areas in the project with optional filtering.

**Parameters:**
- `phase` (optional): Filter areas by phase
- `status` (optional): Filter areas by status
- `include_tasks` (optional): Whether to include task details in the response (default: false)
- `include_progress` (optional): Whether to include calculated progress metrics (default: true)
- `format` (optional): Output format (e.g., "json", "table")

**Returns:**
Array of area objects containing:
- `id`: Area directory name (e.g., "AREA_Performance")
- `name`: Clean area name (e.g., "Performance")
- `title`: Area title from overview file
- `description`: Area description from overview file
- `phase`: Phase this area belongs to
- `status`: Area status (calculated from tasks if not explicitly set)
- `progress`: Completion percentage (0-100)
- `tasks`: Array of task IDs within this area
- `overview`: Overview task object (if include_tasks=true)

**Example:**
```json
{
  "method": "area_list",
  "params": {
    "phase": "release-v1",
    "include_progress": true
  }
}
```

**Annotations:**
- Title: "List Areas"
- Read-Only: Yes
- Idempotent: Yes

### area_get

Gets details about a specific area.

**Parameters:**
- `id` (required): Area ID (with or without "AREA_" prefix)
- `phase` (optional): Phase to look in (if known)
- `format` (optional): Output format (e.g., "json", "default")

**Returns:**
Area object with all details, including overview file and task list.

**Example:**
```json
{
  "method": "area_get",
  "params": {
    "id": "Performance"
  }
}
```

**Annotations:**
- Title: "Get Area Details"
- Read-Only: Yes
- Idempotent: Yes

### area_create

Creates a new area directory with an _overview.md file.

**Parameters:**
- `name` (required): Area name (will be prefixed with "AREA_" if not already)
- `title` (required): Area title
- `phase` (required): Phase to create the area in
- `type` (optional): Area type (default: "🧹 Chore")
- `status` (optional): Initial status (default: "🟡 To Do")
- `description` (optional): Area description
- `assignee` (optional): Assigned to
- `tags` (optional): Tags for the area

**Returns:**
Created area object with all details.

**Example:**
```json
{
  "method": "area_create",
  "params": {
    "name": "Performance",
    "title": "Performance Optimization",
    "phase": "release-v1",
    "description": "Focus on improving application performance"
  }
}
```

**Annotations:**
- Title: "Create Area"
- Read-Only: No
- Destructive: No
- Idempotent: No

### area_update

Updates an area's metadata via its _overview.md file.

**Parameters:**
- `id` (required): Area ID (with or without "AREA_" prefix)
- `updates` (required): Object with properties to update:
  - `name` (optional): New area name (will rename the directory)
  - `title` (optional): New area title
  - `description` (optional): New area description
  - `status` (optional): New area status
- `phase` (optional): Phase to look in (if known)

**Returns:**
Updated area object with all details.

**Example:**
```json
{
  "method": "area_update",
  "params": {
    "id": "Performance",
    "updates": {
      "title": "System-wide Performance Optimization",
      "status": "🔵 In Progress"
    }
  }
}
```

**Annotations:**
- Title: "Update Area"
- Read-Only: No
- Destructive: No
- Idempotent: Yes (for identical updates)

### area_delete

Deletes an area directory and all tasks within it.

**Parameters:**
- `id` (required): Area ID (with or without "AREA_" prefix)
- `phase` (optional): Phase to look in (if known)
- `force` (optional): Whether to force deletion even if area contains tasks (default: false)

**Returns:**
Success message if deletion was successful.

**Example:**
```json
{
  "method": "area_delete",
  "params": {
    "id": "Performance",
    "force": true
  }
}
```

**Annotations:**
- Title: "Delete Area"
- Read-Only: No
- Destructive: Yes
- Idempotent: Yes (deleting already deleted area will still report success)

## Task Movement Tools

The following tool provides task movement capabilities within the MDTM directory structure.

### task_move

Moves a task to a different feature or area directory.

**Parameters:**
- `id` (required): Task ID to move
- `target_subdirectory` (required): Target subdirectory (e.g., "FEATURE_NewFeature", "AREA_Performance")
- `phase` (optional): Target phase (if different from current)

**Returns:**
Updated task object with new location.

**Example:**
```json
{
  "method": "task_move",
  "params": {
    "id": "TASK-123",
    "target_subdirectory": "FEATURE_Authentication"
  }
}
```

**Annotations:**
- Title: "Move Task"
- Read-Only: No
- Destructive: No
- Idempotent: Yes (for identical target location)