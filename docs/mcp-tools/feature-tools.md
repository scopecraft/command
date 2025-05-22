# Feature Management MCP Tools

This document provides comprehensive descriptions of Feature management tools available in the Scopecraft Command MCP server. Features represent major work items or epics that organize complex functionality into manageable subtasks.

## Overview

Feature tools provide CRUD operations for managing features within the MDTM system. Features are subdirectories within phases that group related tasks together. They're perfect for organizing epic-level work that needs to be broken down into smaller, actionable tasks. Each feature has an `_overview.md` file that describes the feature's purpose and tracks its overall progress.

## Key Concepts

- **Features as Epics**: Features serve as containers for complex work that spans multiple tasks
- **Directory Structure**: Features are directories with "FEATURE_" prefix (e.g., "FEATURE_Authentication")
- **Overview Files**: Each feature has an `_overview.md` file that acts as the feature's main documentation
- **Progress Tracking**: Feature progress is automatically calculated from its subtasks
- **Hierarchical Organization**: Phase → Feature → Tasks

## Tools

### feature_list

Lists all features in the project with optional filtering and progress tracking.

**Purpose**: Get an overview of all features across phases or within a specific phase. Essential for understanding project scope and tracking feature-level progress.

**When to use**:
- To see all major features in development
- To check feature progress across the project
- To filter features by status or phase
- For project planning and status reports

**Parameters**:
- `phase` (optional): Filter by phase ID (e.g., "release-v1")
  - Only shows features within the specified phase
- `status` (optional): Filter by feature status
  - Feature status can be explicitly set or calculated from tasks
  - Common values: "🟡 To Do", "🔵 In Progress", "🟢 Done"
- `include_tasks` (optional): Include task details in response (boolean, default: false)
  - When true, returns all task IDs within each feature
  - Useful for getting a complete feature breakdown
- `include_progress` (optional): Include progress percentage (boolean, default: true)
  - Calculates completion based on done vs total tasks
- `format` (optional): Output format (reserved for future use)

**Returns**: Array of feature objects with:
- `id`: Feature directory name (e.g., "FEATURE_Authentication")
- `name`: Clean feature name (e.g., "Authentication")
- `title`: Feature title from overview file
- `description`: Feature description
- `phase`: Which phase contains this feature
- `status`: Current feature status
- `progress`: Completion percentage (0-100)
- `tasks`: Array of task IDs (if include_tasks=true)
- `overview`: Overview task metadata

**Example**:
```json
{
  "method": "feature_list",
  "params": {
    "phase": "release-v1",
    "include_progress": true,
    "include_tasks": false
  }
}
```

### feature_get

Retrieves complete details about a specific feature including its overview and all tasks.

**Purpose**: Get full information about a feature to understand its scope, progress, and current state. Essential before updating features or when planning work.

**When to use**:
- To read a feature's complete description and goals
- Before adding tasks to understand the feature context
- To check all tasks within a feature
- For detailed status reports

**Parameters**:
- `id` (required): Feature identifier
  - Can be with or without "FEATURE_" prefix
  - Examples: "Authentication" or "FEATURE_Authentication"
- `phase` (optional): Phase to search in (helps locate feature faster)
- `format` (optional): Output format (reserved for future use)

**Returns**: Complete feature object including:
- All feature metadata
- Overview file contents
- List of all tasks within the feature
- Calculated progress metrics

**Example**:
```json
{
  "method": "feature_get",
  "params": {
    "id": "Authentication",
    "phase": "release-v1"
  }
}
```

### feature_create

Creates a new feature directory with an overview file to organize related work.

**Purpose**: Set up a new feature/epic to group related tasks. Creates the directory structure and initial overview documentation.

**When to use**:
- Starting work on a new major feature or epic
- Organizing complex work that needs multiple tasks
- Creating a container for related functionality
- Setting up feature-level documentation

**Parameters**:
- `name` (required): Feature name (without spaces)
  - Will be prefixed with "FEATURE_" if not already
  - Should be PascalCase or snake_case
  - Examples: "UserAuthentication", "PaymentProcessing"
- `title` (required): Human-readable feature title
  - Used as the main heading in the overview
  - Examples: "User Authentication System", "Payment Processing Module"
- `phase` (required): Phase to create the feature in
  - Must be an existing phase ID
  - Example: "release-v1"
- `type` (optional): Task type for the overview (default: "🌟 Feature")
  - Usually kept as default for features
- `status` (optional): Initial status (default: "🟡 To Do")
  - Valid values: "🟡 To Do", "🔵 In Progress", "🟢 Done"
- `description` (optional): Detailed feature description
  - Explains the feature's purpose and scope
  - Can include goals, requirements, or context
- `assignee` (optional): Person responsible for the feature
- `tags` (optional): Array of tags for categorization
  - Examples: ["backend", "security", "priority"]

**Returns**: Created feature object with generated overview file

**Example**:
```json
{
  "method": "feature_create",
  "params": {
    "name": "Authentication",
    "title": "User Authentication System",
    "phase": "release-v1",
    "description": "Implement secure user authentication with OAuth2 support, including login, logout, password reset, and two-factor authentication.",
    "assignee": "john.doe",
    "tags": ["security", "backend", "frontend"]
  }
}
```

### feature_update

Updates a feature's metadata through its overview file.

**Purpose**: Modify feature properties like title, description, or status. Can also rename features (changes directory name).

**When to use**:
- Updating feature status as work progresses
- Expanding or clarifying feature description
- Reassigning feature ownership
- Renaming features (use carefully)

**Parameters**:
- `id` (required): Feature ID to update
  - Can include or omit "FEATURE_" prefix
- `updates` (required): Object with fields to update
  - `name` (optional): New feature name (renames directory)
    - Use with caution as it changes task locations
  - `title` (optional): New human-readable title
  - `description` (optional): New or updated description
  - `status` (optional): New status
    - Common transitions: "🟡 To Do" → "🔵 In Progress" → "🟢 Done"
- `phase` (optional): Current phase (helps locate feature)

**Returns**: Updated feature object

**Example**:
```json
{
  "method": "feature_update",
  "params": {
    "id": "Authentication",
    "updates": {
      "title": "Enhanced Authentication System with SSO",
      "status": "🔵 In Progress",
      "description": "Updated: Now includes Single Sign-On integration"
    }
  }
}
```

### feature_delete

Deletes a feature directory and all its contents.

**Purpose**: Remove features that are no longer needed. Use with extreme caution as this deletes all tasks within the feature.

**When to use**:
- Removing cancelled features
- Cleaning up test features
- Reorganizing after feature completion (consider archiving instead)

**Parameters**:
- `id` (required): Feature ID to delete
  - Can include or omit "FEATURE_" prefix
- `phase` (optional): Phase containing the feature
- `force` (optional): Force deletion even if feature contains tasks (boolean, default: false)
  - If false and feature has tasks, deletion fails
  - If true, deletes feature and all contained tasks

**Returns**: Success confirmation

**Example**:
```json
{
  "method": "feature_delete",
  "params": {
    "id": "TestFeature",
    "force": true
  }
}
```

## Best Practices

### 1. **Feature Naming**
- Use descriptive, consistent names
- PascalCase or snake_case (avoid spaces)
- Examples: "UserAuthentication", "PaymentGateway", "DataMigration"

### 2. **Feature Organization**
- One feature = one major piece of functionality
- Keep features focused and cohesive
- Break large features into multiple smaller ones if needed

### 3. **Overview Files**
- Keep overview files updated with current goals
- Document acceptance criteria and success metrics
- Include high-level design decisions

### 4. **Task Management**
- Create tasks within features using `subdirectory` parameter
- Use consistent task ID prefixes (e.g., "AUTH-001", "AUTH-002")
- Link related tasks with dependencies

### 5. **Progress Tracking**
- Feature progress auto-calculates from task completion
- Update feature status to reflect actual state
- Use tags to mark priority features

## Common Patterns

### Creating a feature with initial tasks
```json
// 1. Create the feature
{
  "method": "feature_create",
  "params": {
    "name": "UserProfile",
    "title": "User Profile Management",
    "phase": "release-v1",
    "description": "Allow users to manage their profile information"
  }
}

// 2. Add tasks to the feature
{
  "method": "task_create",
  "params": {
    "id": "PROF-001",
    "title": "Design profile UI mockups",
    "type": "🌟 Feature",
    "phase": "release-v1",
    "subdirectory": "FEATURE_UserProfile"
  }
}
```

### Epic breakdown workflow
```json
// 1. Create the epic/feature
{
  "method": "feature_create",
  "params": {
    "name": "PaymentSystem",
    "title": "Complete Payment System",
    "phase": "release-v2",
    "description": "Full payment processing with multiple gateways"
  }
}

// 2. Create subtasks for different aspects
// - Payment gateway integration
// - Shopping cart
// - Order processing
// - Receipt generation
```

### Feature status progression
```json
// Start development
{
  "method": "feature_update",
  "params": {
    "id": "Authentication",
    "updates": { "status": "🔵 In Progress" }
  }
}

// Complete feature
{
  "method": "feature_update",
  "params": {
    "id": "Authentication",
    "updates": { 
      "status": "🟢 Done",
      "description": "Completed: All authentication features implemented and tested"
    }
  }
}
```

## Relationship to Other Tools

- **Tasks**: Create tasks within features using the `subdirectory` parameter
- **Phases**: Features exist within phases as subdirectories
- **Areas**: Features are for product functionality; areas are for cross-cutting concerns
- **Move**: Use `task_move` to reorganize tasks between features
- **Workflow**: Feature status affects task discovery and suggestions