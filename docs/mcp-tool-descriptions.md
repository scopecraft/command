# MCP Tool Descriptions

This document provides detailed descriptions of all MCP tools available in the Scopecraft Command MCP server. Each tool is documented with its parameters, return values, and example usage.

## Task Management Tools

### task_list

Lists tasks with optional filtering.

**Parameters:**
- `status` (optional): Filter by task status (e.g., "🟡 To Do", "🔵 In Progress", etc.)
- `type` (optional): Filter by task type (e.g., "🌟 Feature", "🐞 Bug", etc.)
- `assignee` (optional): Filter by assigned user
- `tags` (optional): Array of tags to filter by
- `phase` (optional): Filter by phase
- `format` (optional): Output format
- `include_content` (optional): Whether to include task content (default: false)
- `include_completed` (optional): Whether to include completed tasks (default: false)
- `subdirectory` (optional): Filter by subdirectory
- `is_overview` (optional): Filter for overview files only

**Example:**
```json
{
  "method": "task_list",
  "params": {
    "status": "🟡 To Do",
    "phase": "release-v1",
    "include_content": false
  }
}
```

### task_get

Gets details of a specific task.

**Parameters:**
- `id` (required): Task ID
- `format` (optional): Output format

**Example:**
```json
{
  "method": "task_get",
  "params": {
    "id": "TASK-001"
  }
}
```

### task_create

Creates a new task.

**Parameters:**
- `id` (optional): Task ID (generated if not provided)
- `title` (required): Task title
- `type` (required): Task type
- `status` (optional): Task status (default: "🟡 To Do")
- `priority` (optional): Task priority (default: "▶️ Medium")
- `assignee` (optional): Assigned user
- `phase` (optional): Phase
- `subdirectory` (optional): Subdirectory
- `parent` (optional): Parent task ID
- `depends` (optional): Array of task IDs this task depends on
- `previous` (optional): Previous task ID
- `next` (optional): Next task ID
- `tags` (optional): Array of tags
- `content` (optional): Task content

**Example:**
```json
{
  "method": "task_create",
  "params": {
    "title": "New Feature Task",
    "type": "🌟 Feature",
    "phase": "release-v1",
    "priority": "🔼 High"
  }
}
```

### task_update

Updates an existing task.

**Parameters:**
- `id` (required): Task ID
- `updates` (required): Object with metadata and/or content to update

**Example:**
```json
{
  "method": "task_update",
  "params": {
    "id": "TASK-001",
    "updates": {
      "metadata": {
        "status": "🔵 In Progress"
      }
    }
  }
}
```

### task_delete

Deletes a task.

**Parameters:**
- `id` (required): Task ID

**Example:**
```json
{
  "method": "task_delete",
  "params": {
    "id": "TASK-001"
  }
}
```

### task_next

Finds the next task to work on.

**Parameters:**
- `id` (optional): Current task ID to find the next task after
- `format` (optional): Output format

**Example:**
```json
{
  "method": "task_next",
  "params": {}
}
```

### task_move

Moves a task to a different feature/area subdirectory.

**Parameters:**
- `id` (required): Task ID
- `target_subdirectory` (required): Target subdirectory to move the task to
- `target_phase` (optional): Target phase (if moving between phases)
- `search_phase` (optional): Source phase to search for the task
- `search_subdirectory` (optional): Source subdirectory to search for the task

**Example:**
```json
{
  "method": "task_move",
  "params": {
    "id": "TASK-001",
    "target_subdirectory": "FEATURE_UserProfile"
  }
}
```

## Feature Management Tools

### feature_list

Lists features with optional filtering.

**Parameters:**
- `phase` (optional): Filter by phase
- `status` (optional): Filter by feature status
- `format` (optional): Output format
- `include_tasks` (optional): Whether to include tasks in features (default: false)
- `include_progress` (optional): Whether to include progress percentage (default: true)

**Example:**
```json
{
  "method": "feature_list",
  "params": {
    "phase": "release-v1",
    "include_tasks": true
  }
}
```

### feature_get

Gets details of a specific feature.

**Parameters:**
- `id` (required): Feature ID (directory name)
- `phase` (optional): Phase to look in
- `format` (optional): Output format

**Example:**
```json
{
  "method": "feature_get",
  "params": {
    "id": "FEATURE_Authentication"
  }
}
```

### feature_create

Creates a new feature with an overview file.

**Parameters:**
- `name` (required): Feature name (will be prefixed with FEATURE_)
- `title` (required): Feature title for the overview
- `phase` (required): Phase to create the feature in
- `type` (optional): Feature type (default: "🌟 Feature")
- `status` (optional): Initial status (default: "🟡 To Do")
- `description` (optional): Feature description
- `assignee` (optional): Assigned user
- `tags` (optional): Array of tags

**Example:**
```json
{
  "method": "feature_create",
  "params": {
    "name": "Authentication",
    "title": "User Authentication",
    "phase": "release-v1",
    "description": "Implement user authentication including login, logout, and password reset"
  }
}
```

### feature_update

Updates an existing feature.

**Parameters:**
- `id` (required): Feature ID (directory name)
- `updates` (required): Object with properties to update
  - `name` (optional): New name
  - `title` (optional): New title
  - `description` (optional): New description
  - `status` (optional): New status
- `phase` (optional): Phase to look in

**Example:**
```json
{
  "method": "feature_update",
  "params": {
    "id": "FEATURE_Authentication",
    "updates": {
      "title": "Updated Authentication Feature",
      "status": "🔵 In Progress"
    }
  }
}
```

### feature_delete

Deletes a feature.

**Parameters:**
- `id` (required): Feature ID (directory name)
- `phase` (optional): Phase to look in
- `force` (optional): Whether to force delete if the feature contains tasks

**Example:**
```json
{
  "method": "feature_delete",
  "params": {
    "id": "FEATURE_Authentication",
    "force": true
  }
}
```

## Area Management Tools

### area_list

Lists areas with optional filtering.

**Parameters:**
- `phase` (optional): Filter by phase
- `status` (optional): Filter by area status
- `format` (optional): Output format
- `include_tasks` (optional): Whether to include tasks in areas (default: false)
- `include_progress` (optional): Whether to include progress percentage (default: true)

**Example:**
```json
{
  "method": "area_list",
  "params": {
    "phase": "release-v1",
    "include_tasks": true
  }
}
```

### area_get

Gets details of a specific area.

**Parameters:**
- `id` (required): Area ID (directory name)
- `phase` (optional): Phase to look in
- `format` (optional): Output format

**Example:**
```json
{
  "method": "area_get",
  "params": {
    "id": "AREA_Performance"
  }
}
```

### area_create

Creates a new area with an overview file.

**Parameters:**
- `name` (required): Area name (will be prefixed with AREA_)
- `title` (required): Area title for the overview
- `phase` (required): Phase to create the area in
- `type` (optional): Area type (default: "🧹 Chore")
- `status` (optional): Initial status (default: "🟡 To Do")
- `description` (optional): Area description
- `assignee` (optional): Assigned user
- `tags` (optional): Array of tags

**Example:**
```json
{
  "method": "area_create",
  "params": {
    "name": "Performance",
    "title": "Performance Optimization",
    "phase": "release-v1",
    "description": "Optimize application performance across all modules"
  }
}
```

### area_update

Updates an existing area.

**Parameters:**
- `id` (required): Area ID (directory name)
- `updates` (required): Object with properties to update
  - `name` (optional): New name
  - `title` (optional): New title
  - `description` (optional): New description
  - `status` (optional): New status
- `phase` (optional): Phase to look in

**Example:**
```json
{
  "method": "area_update",
  "params": {
    "id": "AREA_Performance",
    "updates": {
      "title": "Updated Performance Area",
      "status": "🔵 In Progress"
    }
  }
}
```

### area_delete

Deletes an area.

**Parameters:**
- `id` (required): Area ID (directory name)
- `phase` (optional): Phase to look in
- `force` (optional): Whether to force delete if the area contains tasks

**Example:**
```json
{
  "method": "area_delete",
  "params": {
    "id": "AREA_Performance",
    "force": true
  }
}
```

## Phase Management Tools

### phase_list

Lists all phases.

**Parameters:**
- `format` (optional): Output format

**Example:**
```json
{
  "method": "phase_list",
  "params": {}
}
```

### phase_create

Creates a new phase.

**Parameters:**
- `id` (required): Phase ID
- `name` (required): Phase name
- `description` (optional): Phase description
- `status` (optional): Initial status (default: "🟡 Pending")
- `order` (optional): Phase order

**Example:**
```json
{
  "method": "phase_create",
  "params": {
    "id": "release-v2",
    "name": "Release v2.0",
    "description": "Second major release"
  }
}
```

### phase_update

Updates an existing phase.

**Parameters:**
- `id` (required): Phase ID
- `updates` (required): Object with properties to update
  - `id` (optional): New ID (rename)
  - `name` (optional): New name
  - `description` (optional): New description
  - `status` (optional): New status
  - `order` (optional): New order

**Example:**
```json
{
  "method": "phase_update",
  "params": {
    "id": "release-v2",
    "updates": {
      "name": "Release 2.0",
      "status": "🔵 In Progress"
    }
  }
}
```

### phase_delete

Deletes a phase.

**Parameters:**
- `id` (required): Phase ID
- `force` (optional): Whether to force delete if the phase contains tasks

**Example:**
```json
{
  "method": "phase_delete",
  "params": {
    "id": "release-v2",
    "force": true
  }
}
```

## Workflow Tools

### workflow_current

Shows tasks currently in progress.

**Parameters:**
- `format` (optional): Output format

**Example:**
```json
{
  "method": "workflow_current",
  "params": {}
}
```

### workflow_mark_complete_next

Marks a task as complete and suggests the next task.

**Parameters:**
- `id` (required): Task ID to mark as complete
- `format` (optional): Output format

**Example:**
```json
{
  "method": "workflow_mark_complete_next",
  "params": {
    "id": "TASK-001"
  }
}
```

## Template Management Tools

### template_list

Lists available task templates with their descriptions.

**Parameters:**
- `format` (optional): Output format

**Example:**
```json
{
  "method": "template_list",
  "params": {}
}
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "feature",
      "name": "feature",
      "path": "/path/to/templates/01_mdtm_feature.md",
      "description": "🌟 Feature"
    },
    {
      "id": "bug",
      "name": "bug",
      "path": "/path/to/templates/02_mdtm_bug.md",
      "description": "🐞 Bug"
    },
    {
      "id": "chore",
      "name": "chore",
      "path": "/path/to/templates/03_mdtm_chore.md",
      "description": "🧹 Chore"
    }
  ],
  "message": "Found 3 templates"
}
```

## Debugging Tools

### debug_code_path

Returns diagnostic information about the MCP server.

**Parameters:**
- None

**Example:**
```json
{
  "method": "debug_code_path",
  "params": {}
}
```