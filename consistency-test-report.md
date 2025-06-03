=== CLI/MCP Consistency Test Report ===
Date: Mon 2 Jun 2025 23:52:00 EDT

## Data Consistency Issues

### 1. Workflow State Filtering
**CRITICAL ISSUE**: MCP task_list with location="backlog" returns tasks from other locations

CLI command: `task list --backlog`
- Returns: 5 tasks (all in backlog)

MCP command: `task_list` with location="backlog"  
- Returns: 8 tasks including "test-feature-task-06A" which has workflowState="current"

This is a critical data consistency bug where MCP filtering is not working correctly.

### 2. Priority Display
CLI shows priority correctly:
- "High Priority Feature" displays with ↑ High indicator

MCP returns all tasks with priority="medium" even though some were created with high priority.

### 3. Tags Display
CLI shows tags inline:
- "High Priority Feature" shows #urgent,backend,api

MCP returns tags as comma-separated string in array:
- tags: ["urgent,backend,api"] instead of ["urgent", "backend", "api"]
