# MCP STDIO Transport Test Plan (Prompt-Based)

This document provides a structured, step-by-step test plan for testing the MCP server using the STDIO transport. Follow these instructions exactly to perform a comprehensive test of all MCP functionality.

## Test Environment Setup

First, we'll create a dedicated test phase to contain all our test tasks:

1. Run the following MCP command to create a test phase:

```
mcp__scopecraft-command-mcp__phase_create
Parameters:
{
  "id": "test-mcp-{current_date}",
  "name": "MCP Test Phase",
  "description": "Phase for MCP testing - safe to delete after tests",
  "status": "🟡 Pending"
}
```

Replace `{current_date}` with today's date in YYYYMMDD format.

2. Verify the phase was created by listing all phases:

```
mcp__scopecraft-command-mcp__phase_list
Parameters: {}
```

Expected result: JSON response containing the newly created test phase.

## Test Plan Execution

Follow these steps in order. For each step:
1. Run the specified MCP command with the given parameters
2. Verify the actual result matches the expected result
3. Document any discrepancies or unexpected behavior

### 1. Task Operations Tests

#### 1.1 Create a Basic Task

```
mcp__scopecraft-command-mcp__task_create
Parameters:
{
  "title": "Test Basic Task",
  "type": "🧪 Test",
  "priority": "▶️ Medium",
  "phase": "test-mcp-{current_date}"
}
```

Expected result: Success response with the created task, including auto-generated ID.

*Record the task ID for use in subsequent tests.*

#### 1.2 Create a Task with Full Metadata

```
mcp__scopecraft-command-mcp__task_create
Parameters:
{
  "id": "TEST-FULL-METADATA",
  "title": "Test Full Metadata Task",
  "type": "🧪 Test",
  "status": "🟡 To Do",
  "priority": "🔼 High",
  "assignee": "Tester",
  "phase": "test-mcp-{current_date}",
  "tags": ["test", "metadata", "full"],
  "content": "## Test Full Metadata\n\nThis task has all metadata fields populated.\n\n## Test Steps\n\n- [x] Create task\n- [ ] Verify metadata\n\n## Expected Results\n\nAll metadata fields should be correctly set."
}
```

Expected result: Success response with the task created exactly as specified.

#### 1.3 Create a Feature Overview Task

```
mcp__scopecraft-command-mcp__task_create
Parameters:
{
  "id": "_overview",
  "title": "Test Feature Overview",
  "type": "🌟 Feature",
  "phase": "test-mcp-{current_date}",
  "subdirectory": "FEATURE_TestFeature"
}
```

Expected result: Success response with an overview task in the specified subdirectory.

#### 1.4 Create a Task in the Feature

```
mcp__scopecraft-command-mcp__task_create
Parameters:
{
  "title": "Test Feature Subtask",
  "type": "🧪 Test",
  "phase": "test-mcp-{current_date}",
  "subdirectory": "FEATURE_TestFeature",
  "parent": "_overview"
}
```

Expected result: Success response with the task created in the feature subdirectory.

*Record the task ID for later tests.*

#### 1.5 List All Tasks (Default Behavior - Content and Completed Tasks Excluded)

```
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}"
}
```

Expected result: A list containing all 4 tasks created so far, but without their content. Verify that the response contains metadata but task content fields are empty strings.

#### 1.6 List Tasks with Include Content

```
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}",
  "include_content": true
}
```

Expected result: A list containing all 4 tasks created so far, with their full content included.

#### 1.7 List Completed Tasks

First, mark one task as completed (if you haven't already done so in previous steps):

```
mcp__scopecraft-command-mcp__task_update
Parameters: {
  "id": "[ID from step 1.1 or any other suitable task]",
  "updates": {
    "metadata": {
      "status": "🟢 Done"
    }
  }
}
```

Then test that completed tasks are excluded by default:

```
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}"
}
```

Expected result: A list containing only 3 tasks (the completed task should be excluded).

Now test with include_completed parameter:

```
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}",
  "include_completed": true
}
```

Expected result: A list containing all 4 tasks including the completed one.

#### 1.8 List Tasks with Filter

```
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}",
  "type": "🧪 Test"
}
```

Expected result: A list containing only the test tasks (not the feature overview).

#### 1.9 List Tasks with Combined Parameters

```
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}",
  "include_content": true,
  "include_completed": true
}
```

Expected result: A list containing all tasks for the phase, including their full content and any completed tasks.

#### 1.10 Get Specific Task

```
mcp__scopecraft-command-mcp__task_get
Parameters: {
  "id": "TEST-FULL-METADATA"
}
```

Expected result: The full metadata task with all fields intact.

#### 1.11 Update Task Metadata

```
mcp__scopecraft-command-mcp__task_update
Parameters: {
  "id": "TEST-FULL-METADATA",
  "updates": {
    "metadata": {
      "status": "🔵 In Progress",
      "priority": "🔥 Highest"
    }
  }
}
```

Expected result: Updated task with new status and priority.

#### 1.12 Update Task Content

```
mcp__scopecraft-command-mcp__task_update
Parameters: {
  "id": "TEST-FULL-METADATA",
  "updates": {
    "content": "## Test Full Metadata (Updated)\n\nThis task content has been updated.\n\n## Test Steps\n\n- [x] Create task\n- [x] Verify metadata\n- [x] Update content\n\n## Expected Results\n\nContent should be updated while preserving metadata."
  }
}
```

Expected result: Updated task with new content while metadata remains unchanged.

#### 1.13 Delete a Task

```
mcp__scopecraft-command-mcp__task_delete
Parameters: {
  "id": "[ID from step 1.1]"
}
```

Expected result: Success response indicating the task was deleted.

#### 1.14 Verify Task Deletion

```
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}"
}
```

Expected result: List now contains only 3 tasks, with the deleted task missing.

### 2. Workflow Operations Tests

#### 2.1 Create Tasks with Workflow Relationships

```
mcp__scopecraft-command-mcp__task_create
Parameters: {
  "id": "TEST-WORKFLOW-1",
  "title": "Workflow Test Task 1",
  "type": "🧪 Test",
  "status": "🟡 To Do",
  "priority": "🔼 High",
  "phase": "test-mcp-{current_date}"
}
```

```
mcp__scopecraft-command-mcp__task_create
Parameters: {
  "id": "TEST-WORKFLOW-2",
  "title": "Workflow Test Task 2",
  "type": "🧪 Test",
  "status": "🟡 To Do",
  "priority": "▶️ Medium",
  "phase": "test-mcp-{current_date}",
  "previous": "TEST-WORKFLOW-1"
}
```

```
mcp__scopecraft-command-mcp__task_create
Parameters: {
  "id": "TEST-WORKFLOW-3",
  "title": "Workflow Test Task 3",
  "type": "🧪 Test",
  "status": "🟡 To Do",
  "priority": "🔽 Low",
  "phase": "test-mcp-{current_date}",
  "previous": "TEST-WORKFLOW-2"
}
```

Expected result: Three tasks created with sequential workflow relationships.

#### 2.2 Test Next Task (No Current Task)

```
mcp__scopecraft-command-mcp__task_next
Parameters: {}
```

Expected result: The highest priority unfinished task (likely TEST-WORKFLOW-1).

#### 2.3 Test Next Task (With Current Task)

```
mcp__scopecraft-command-mcp__task_next
Parameters: {
  "id": "TEST-WORKFLOW-1"
}
```

Expected result: TEST-WORKFLOW-2 (the next task in the workflow).

#### 2.4 Test Current Workflow

```
mcp__scopecraft-command-mcp__workflow_current
Parameters: {}
```

Expected result: Empty list (since no tasks are in progress).

#### 2.5 Mark Task as In Progress

```
mcp__scopecraft-command-mcp__task_update
Parameters: {
  "id": "TEST-WORKFLOW-1",
  "updates": {
    "metadata": {
      "status": "🔵 In Progress"
    }
  }
}
```

Expected result: Task updated with in-progress status.

#### 2.6 Test Current Workflow Again

```
mcp__scopecraft-command-mcp__workflow_current
Parameters: {}
```

Expected result: List containing TEST-WORKFLOW-1.

#### 2.7 Mark Complete and Get Next

```
mcp__scopecraft-command-mcp__workflow_mark_complete_next
Parameters: {
  "id": "TEST-WORKFLOW-1"
}
```

Expected result: Success response with TEST-WORKFLOW-1 marked complete and TEST-WORKFLOW-2 as the next task.

### 3. Error Handling Tests

#### 3.1 Get Non-existent Task

```
mcp__scopecraft-command-mcp__task_get
Parameters: {
  "id": "NON-EXISTENT-TASK-ID"
}
```

Expected result: Error response indicating the task doesn't exist.

#### 3.2 Create Task with Missing Required Fields

```
mcp__scopecraft-command-mcp__task_create
Parameters: {
  "id": "TEST-MISSING-REQUIRED",
  "phase": "test-mcp-{current_date}"
}
```

Expected result: Error response indicating missing required fields (title and type).

#### 3.3 Update Non-existent Task

```
mcp__scopecraft-command-mcp__task_update
Parameters: {
  "id": "NON-EXISTENT-TASK-ID",
  "updates": {
    "metadata": {
      "status": "🔵 In Progress"
    }
  }
}
```

Expected result: Error response indicating the task doesn't exist.

### 4. Mode Detection Tests

#### 4.1 Verify Current Mode

Run a basic operation and observe which directory the files are created in:

```
mcp__scopecraft-command-mcp__task_create
Parameters: {
  "id": "TEST-MODE-DETECTION",
  "title": "Test Mode Detection",
  "type": "🧪 Test",
  "phase": "test-mcp-{current_date}"
}
```

Expected result: Success response with task created in the correct mode directory (.tasks or .ruru).

## Test Results Documentation

For each test, document:

1. Test ID and description
2. MCP command and parameters used
3. Expected result
4. Actual result
5. Pass/Fail status
6. Any observations or issues

## Cleanup Procedure

After testing is complete:

1. Note: Do not attempt to delete the test phase using MCP commands, as phase deletion is not yet implemented.
2. Instead, clean up manually by deleting the phase directory from the filesystem:
   - Standalone mode: Delete `.tasks/test-mcp-{current_date}`
   - Roo Commander mode: Delete `.ruru/tasks/test-mcp-{current_date}`

## 5. Token Optimization Tests

The following tests specifically validate the optimizations made to the MCP task_list method to reduce token usage.

#### 5.1 Response Size Comparison

Run the following tests to compare response sizes:

```
// Get counts for tasks in the test phase
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}"
}
```

Note the number of tasks returned and approximate response size.

```
// Request with full content
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}",
  "include_content": true
}
```

Note the approximate response size.

```
// Request with completed tasks
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}",
  "include_completed": true
}
```

Note the number of tasks returned and approximate response size.

```
// Request with both content and completed tasks
mcp__scopecraft-command-mcp__task_list
Parameters: {
  "phase": "test-mcp-{current_date}",
  "include_content": true,
  "include_completed": true
}
```

Note the number of tasks returned and approximate response size.

Expected result: The default response (no parameters) should be significantly smaller than responses with content included. All completed tasks should be excluded by default.

## Summary Report

After completing all tests, prepare a summary report including:

1. Total number of tests executed
2. Number of passed/failed tests
3. List of any failed tests with brief descriptions
4. Observations about MCP server functionality
5. Token optimization effectiveness (compare response sizes from section 5)
6. Recommendations for improvements or bug fixes

This structured approach will provide comprehensive testing of the MCP server's STDIO transport while maintaining isolation from production data.