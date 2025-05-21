# Worktree API Documentation

This document provides details on the Worktree API endpoints implemented for the Tasks UI dashboard.

## Base URL

All API endpoints are relative to the server's base URL: `http://localhost:3000/api/`

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "data": {...},
  "message": "Human-readable message",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {} // Optional additional error details
  }
}
```

- `success`: Boolean indicating if the request was successful
- `data`: Contains the response data (only present if success is true)
- `message`: Human-readable message describing the outcome (only present if success is true)
- `error`: Error details (only present if success is false)
  - `code`: Machine-readable error code
  - `message`: Human-readable error message
  - `details`: Optional additional error information

## Endpoints

### GET /api/worktrees

Returns a list of all worktrees with their details.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cache | boolean | true | Whether to use cached worktree data |
| taskInfo | boolean | true | Whether to include task metadata |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "path": "/path/to/worktree",
      "branch": "feature/branch-name",
      "headCommit": "abcd1234...",
      "status": "clean|modified|untracked|conflict|unknown",
      "lastActivity": "2023-05-21T12:34:56.789Z",
      "changedFiles": [
        {
          "path": "src/file.js",
          "status": "modified|added|deleted|untracked|renamed|conflicted",
          "oldPath": "src/old-file.js" // Only for renamed files
        }
      ],
      "taskId": "TASK-123",
      "taskTitle": "Implement feature X",
      "taskStatus": "🟡 To Do",
      "workflowStatus": "todo|in_progress|blocked|done|unknown",
      "mode": {
        "current": "typescript|ui|cli|mcp|devops|unknown"
      },
      "featureProgress": {
        "totalTasks": 10,
        "completed": 5,
        "inProgress": 2,
        "blocked": 1,
        "toDo": 2
      }
    }
  ],
  "message": "Retrieved 3 worktrees successfully"
}
```

### GET /api/worktrees/:worktreeId

Returns detailed information for a specific worktree.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| worktreeId | string | The worktree path or identifier (URL-encoded) |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cache | boolean | true | Whether to use cached worktree data |
| taskInfo | boolean | true | Whether to include task metadata |

#### Response

```json
{
  "success": true,
  "data": {
    "path": "/path/to/worktree",
    "branch": "feature/branch-name",
    "headCommit": "abcd1234...",
    "status": "clean|modified|untracked|conflict|unknown",
    "lastActivity": "2023-05-21T12:34:56.789Z",
    "changedFiles": [
      {
        "path": "src/file.js",
        "status": "modified|added|deleted|untracked|renamed|conflicted",
        "oldPath": "src/old-file.js" // Only for renamed files
      }
    ],
    "taskId": "TASK-123",
    "taskTitle": "Implement feature X",
    "taskStatus": "🟡 To Do",
    "workflowStatus": "todo|in_progress|blocked|done|unknown",
    "mode": {
      "current": "typescript|ui|cli|mcp|devops|unknown"
    },
    "featureProgress": {
      "totalTasks": 10,
      "completed": 5,
      "inProgress": 2,
      "blocked": 1,
      "toDo": 2
    }
  },
  "message": "Retrieved worktree /path/to/worktree successfully"
}
```

### GET /api/worktrees/:worktreeId/status

Returns status information for a specific worktree.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| worktreeId | string | The worktree path or identifier (URL-encoded) |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cache | boolean | true | Whether to use cached worktree data |

#### Response

```json
{
  "success": true,
  "data": {
    "status": "clean|modified|untracked|conflict|unknown"
  },
  "message": "Retrieved worktree status for /path/to/worktree successfully"
}
```

### GET /api/worktrees/:worktreeId/changes

Returns a list of changed files for a specific worktree.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| worktreeId | string | The worktree path or identifier (URL-encoded) |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cache | boolean | true | Whether to use cached worktree data |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "path": "src/file.js",
      "status": "modified|added|deleted|untracked|renamed|conflicted",
      "oldPath": "src/old-file.js" // Only for renamed files
    }
  ],
  "message": "Retrieved 3 changed files for worktree /path/to/worktree"
}
```

### GET /api/worktrees/summary

Returns summary statistics for all worktrees.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cache | boolean | true | Whether to use cached worktree data |

#### Response

```json
{
  "success": true,
  "data": {
    "totalWorktrees": 5,
    "clean": 2,
    "modified": 1,
    "untracked": 1,
    "conflict": 0,
    "unknown": 1,
    "worktrees": [
      {
        "path": "/path/to/worktree",
        "branch": "feature/branch-name",
        "headCommit": "abcd1234...",
        "status": "clean|modified|untracked|conflict|unknown"
      }
    ]
  },
  "message": "Retrieved summary for 5 worktrees"
}
```

### GET /api/worktrees/config

Returns the worktree dashboard configuration.

#### Response

```json
{
  "success": true,
  "data": {
    "refreshInterval": 30000,
    "showTaskInfo": true,
    "maxWorktrees": 20
  },
  "message": "Retrieved dashboard configuration successfully"
}
```

### POST /api/worktrees/config

Updates the worktree dashboard configuration.

#### Request Body

```json
{
  "refreshInterval": 60000,
  "showTaskInfo": false,
  "maxWorktrees": 10
}
```

All fields are optional. Only the provided fields will be updated.

#### Response

```json
{
  "success": true,
  "data": {
    "refreshInterval": 60000,
    "showTaskInfo": false,
    "maxWorktrees": 10
  },
  "message": "Updated dashboard configuration successfully"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| WORKTREE_LIST_ERROR | Error listing worktrees |
| WORKTREE_GET_ERROR | Error getting worktree details |
| WORKTREE_STATUS_ERROR | Error getting worktree status |
| WORKTREE_CHANGES_ERROR | Error getting worktree changes |
| WORKTREE_SUMMARY_ERROR | Error getting worktree summary |
| CONFIG_GET_ERROR | Error getting configuration |
| CONFIG_UPDATE_ERROR | Error updating configuration |
| INVALID_WORKTREE_ID | Invalid worktree ID provided |
| INVALID_CONFIG | Invalid configuration update |

## Security Considerations

- All worktree paths are sanitized to prevent path traversal attacks
- Input validation is performed using Zod schemas
- Error messages are structured to avoid leaking sensitive information