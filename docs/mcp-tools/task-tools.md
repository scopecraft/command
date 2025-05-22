# Task Management MCP Tools

This document provides comprehensive descriptions of Task management tools available in the Scopecraft Command MCP server. These tools enable AI agents to effectively manage tasks within the Markdown-Driven Task Management (MDTM) system.

## Overview

Task tools provide CRUD (Create, Read, Update, Delete) operations for managing individual tasks within the MDTM directory structure. Tasks are the fundamental units of work and can be organized within features, areas, or phases.

## Tools

### task_list

Lists tasks with powerful filtering capabilities to help find specific tasks or groups of tasks.

**Purpose**: Retrieve tasks based on various criteria like status, type, phase, or location. This is the primary tool for discovering and monitoring tasks across the project.

**When to use**:
- To find tasks with specific status (e.g., all "In Progress" tasks)
- To get an overview of tasks in a phase or subdirectory
- To filter tasks by type, assignee, or tags
- To check completed vs incomplete tasks

**Parameters**:
- `status` (optional): Filter by task status
  - Valid values: "🟡 To Do", "🔵 In Progress", "🟢 Done", "⚪ Archived", "🔴 Blocked"
  - Example: `"status": "🔵 In Progress"`
- `type` (optional): Filter by task type
  - Valid values depend on available templates in the project
  - Common types: "🌟 Feature", "🐞 Bug", "🧹 Chore", "📚 Documentation", "🧪 Test", "🔬 Spike"
  - Example: `"type": "🌟 Feature"`
  - Note: Use `template_list` tool to see all available types
- `assignee` (optional): Filter by assigned user (string)
- `tags` (optional): Array of tags to filter by
  - Example: `"tags": ["backend", "api"]`
- `phase` (optional): Filter by phase ID
  - Example: `"phase": "release-v1"`
- `subdirectory` (optional): Filter by subdirectory (feature/area)
  - Example: `"subdirectory": "FEATURE_Authentication"`
- `is_overview` (optional): Filter for overview files only (boolean)
  - Example: `"is_overview": true`
- `include_content` (optional): Include full task content in response (boolean, default: false)
- `include_completed` (optional): Include completed tasks (boolean, default: false)
- `format` (optional): Output format (for future use)

**Returns**: Array of task objects with metadata and optionally content

**Example**:
```json
{
  "method": "task_list",
  "params": {
    "status": "🔵 In Progress",
    "phase": "release-v1",
    "include_content": false
  }
}
```

### task_get

Retrieves complete details of a specific task including metadata and content.

**Purpose**: Get full information about a single task when you know its ID. Essential for reading task details before updates or for displaying task information.

**When to use**:
- To read a task's full content and metadata
- Before updating a task (to see current state)
- To check task relationships (dependencies, parent/child)
- To view task history (created/updated dates)

**Parameters**:
- `id` (required): Task ID
  - Example: `"id": "TASK-001"`
- `format` (optional): Output format (for future use)

**Returns**: Complete task object with metadata and content

**Example**:
```json
{
  "method": "task_get",
  "params": {
    "id": "FEAT-AUTH-001"
  }
}
```

### task_create

Creates a new task with specified metadata and content.

**Purpose**: Add new tasks to the project. Tasks can be standalone or part of features/areas, and can have relationships to other tasks.

**When to use**:
- To add a new work item to the project
- To create subtasks under a parent task
- To add tasks to a specific feature or area
- To establish task dependencies or sequences

**Parameters**:
- `title` (required): Task title (string)
  - Example: `"title": "Implement user login"`
- `type` (required): Task type
  - Valid values depend on available templates in the project
  - Common types: "🌟 Feature", "🐞 Bug", "🧹 Chore", "📚 Documentation", "🧪 Test", "🔬 Spike"
  - Example: `"type": "🌟 Feature"`
  - Note: Use `template_list` tool to see all available types with their exact emoji/text format
- `id` (optional): Custom task ID (auto-generated if not provided)
  - Example: `"id": "AUTH-LOGIN-001"`
- `status` (optional): Initial status (default: "🟡 To Do")
  - Valid values: "🟡 To Do", "🔵 In Progress", "🟢 Done", "⚪ Archived", "🔴 Blocked"
- `priority` (optional): Task priority (default: "▶️ Medium")
  - Valid values: "🔼 High", "▶️ Medium", "🔽 Low"
- `assignee` (optional): Username of assigned person
- `phase` (optional): Phase to create task in
  - Example: `"phase": "release-v1"`
- `subdirectory` (optional): Feature/area subdirectory
  - Example: `"subdirectory": "FEATURE_Authentication"`
- `parent` (optional): Parent task ID for subtasks
- `depends` (optional): Array of task IDs this task depends on
- `previous` (optional): Previous task ID in sequence
- `next` (optional): Next task ID in sequence
- `tags` (optional): Array of tags
- `content` (optional): Task content/description (markdown)

**Returns**: Created task object with generated ID and metadata

**Example**:
```json
{
  "method": "task_create",
  "params": {
    "title": "Implement OAuth2 login flow",
    "type": "🌟 Feature",
    "phase": "release-v1",
    "subdirectory": "FEATURE_Authentication",
    "priority": "🔼 High",
    "tags": ["oauth", "security"],
    "content": "## Description\n\nImplement OAuth2 authentication flow...\n\n## Acceptance Criteria\n\n- [ ] Users can login with Google\n- [ ] Tokens are securely stored"
  }
}
```

### task_update

Updates an existing task's metadata and/or content.

**Purpose**: Modify task properties or content. Supports partial updates - only specified fields are changed.

**When to use**:
- To change task status (e.g., mark as "In Progress")
- To update task content or description
- To reassign tasks or change priority
- To move tasks between phases or subdirectories
- To rename tasks (change ID)

**Parameters**:
- `id` (required): Task ID to update
- `updates` (required): Object containing updates
  - `metadata` (optional): Object with metadata fields to update
    - Any valid task metadata field can be updated
  - `content` (optional): New task content (replaces existing)
  - `status` (optional): Shorthand for updating status
  - `priority` (optional): Shorthand for updating priority
  - `phase` (optional): Move to different phase
  - `subdirectory` (optional): Move to different subdirectory
  - `new_id` (optional): Rename task (change ID)
- `phase` (optional): Current phase (helps locate task)
- `subdirectory` (optional): Current subdirectory (helps locate task)

**Returns**: Updated task object

**Example**:
```json
{
  "method": "task_update",
  "params": {
    "id": "AUTH-001",
    "updates": {
      "status": "🔵 In Progress",
      "metadata": {
        "assigned_to": "john.doe",
        "priority": "🔼 High"
      }
    }
  }
}
```

### task_delete

Deletes a task and its file from the project.

**Purpose**: Remove tasks that are no longer needed. Use with caution as this is destructive.

**When to use**:
- To remove cancelled or obsolete tasks
- To clean up test or temporary tasks
- To remove duplicates

**Parameters**:
- `id` (required): Task ID to delete

**Returns**: Success confirmation

**Example**:
```json
{
  "method": "task_delete",
  "params": {
    "id": "TEMP-TASK-001"
  }
}
```

### task_next

Finds the next recommended task to work on.

**Purpose**: Helps with task workflow by suggesting the next task based on dependencies, priorities, and current progress.

**When to use**:
- After completing a task, to find what to work on next
- To get started when no tasks are in progress
- To respect task dependencies and sequences

**Parameters**:
- `id` (optional): Current task ID (to find next in sequence)
- `format` (optional): Output format

**Returns**: Next task object or null if none found

**Example**:
```json
{
  "method": "task_next",
  "params": {
    "id": "AUTH-001"
  }
}
```

### task_move

Moves a task to a different feature/area subdirectory or phase.

**Purpose**: Reorganize tasks by moving them between features, areas, or phases while preserving all metadata and relationships.

**When to use**:
- To reassign tasks to different features/areas
- To move tasks between phases
- To organize tasks into newly created features/areas

**Parameters**:
- `id` (required): Task ID to move
- `target_subdirectory` (required): Target subdirectory
  - Example: `"target_subdirectory": "FEATURE_Authentication"`
- `target_phase` (optional): Target phase (if different)
- `search_phase` (optional): Current phase (helps locate task)
- `search_subdirectory` (optional): Current subdirectory (helps locate task)

**Returns**: Updated task object in new location

**Example**:
```json
{
  "method": "task_move",
  "params": {
    "id": "TASK-123",
    "target_subdirectory": "FEATURE_Security",
    "search_subdirectory": "FEATURE_Authentication"
  }
}
```

## Workflow Tools

These tools help manage task workflows and status transitions.

### workflow_current

Shows all tasks currently in progress.

**Purpose**: Get a quick view of active work across the project. Useful for status updates and finding what's being worked on.

**When to use**:
- To see all active/in-progress work
- For daily standups or status reports
- To check if anyone is working on related tasks

**Parameters**:
- `format` (optional): Output format

**Returns**: Array of tasks with status "🔵 In Progress"

**Example**:
```json
{
  "method": "workflow_current",
  "params": {}
}
```

### workflow_mark_complete_next

Marks a task as complete and suggests the next task to work on.

**Purpose**: Streamline workflow by completing current task and immediately getting the next recommendation. Combines task completion with workflow continuation.

**When to use**:
- When finishing a task and ready for the next one
- To maintain workflow momentum
- To ensure proper task completion and transitions

**Parameters**:
- `id` (required): Task ID to mark as complete
- `format` (optional): Output format

**Returns**: Object with completed task and next task suggestion

**Example**:
```json
{
  "method": "workflow_mark_complete_next",
  "params": {
    "id": "AUTH-001"
  }
}
```

## Related Tools

### template_list

Lists available task templates which determine the valid task types for your project.

**Purpose**: Discover available task types and their templates. Since task types are template-driven, this tool helps you understand what types can be used when creating or filtering tasks.

**When to use**:
- Before creating tasks to see available types
- When filtering tasks by type to know valid values
- To understand the task type options in your project

**Parameters**: None required

**Returns**: Array of template objects with id, name, path, and description

**Example**:
```json
{
  "method": "template_list",
  "params": {}
}
```

## Best Practices

1. **Task IDs**: Use meaningful, unique IDs that indicate the task's purpose or location
2. **Status Management**: Always check current status before updates to avoid conflicts
3. **Dependencies**: Set up task dependencies to ensure work happens in the correct order
4. **Organization**: Use subdirectories (features/areas) to group related tasks
5. **Filtering**: Use task_list with filters rather than getting all tasks and filtering client-side
6. **Workflow**: Use workflow tools to maintain smooth task transitions

## Common Patterns

### Finding work to do
```json
// First check what's in progress
{ "method": "workflow_current", "params": {} }

// If nothing in progress, find next task
{ "method": "task_next", "params": {} }
```

### Creating related tasks
```json
// Create parent task
{
  "method": "task_create",
  "params": {
    "id": "EPIC-001",
    "title": "Authentication System",
    "type": "🌟 Feature"
  }
}

// Create subtasks
{
  "method": "task_create",
  "params": {
    "title": "Design login UI",
    "type": "🌟 Feature",
    "parent": "EPIC-001"
  }
}
```

### Task status workflow
```json
// Start work
{
  "method": "task_update",
  "params": {
    "id": "TASK-001",
    "updates": { "status": "🔵 In Progress" }
  }
}

// Complete and get next
{
  "method": "workflow_mark_complete_next",
  "params": { "id": "TASK-001" }
}
```