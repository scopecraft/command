# Design consistent API response schema

---
type: "\U0001F41E Bug"
status: To Do
area: mcp
tags:
  - design
  - 'team:architect'
  - 'execution:interactive'
---


## Instruction
Design a consistent API response schema for all MCP endpoints, implementing the UI team's suggested flat format. The schema should provide a unified structure that works for all task types while being easy to consume by UI clients.

## Tasks
- [ ] Define standard response envelope structure
- [ ] Decide on consistent field naming conventions
- [ ] Document where data should be nested vs flat
- [ ] Create TypeScript interfaces for response types
- [ ] Consider versioning strategy for breaking changes

## Deliverable
Normalized task format schema:

```json
{
  id: "task-id",
  title: "Task Title", 
  type: "feature", // normalized without emojis
  task_type: "parent" | "simple", // explicit task type
  status: "in_progress", // lowercase, underscored
  priority: "high",
  workflow_state: "current", // consistent naming
  area: "ui",
  assignee: "username", // consistent field name
  tags: ["frontend"],
  created_date: "2025-05-30",
  updated_date: "2025-05-30",
  
  // Parent-specific fields (null for simple tasks)
  subtask_count: 5,
  subtask_completed: 2,
  progress_percentage: 40,
  
  // Optional fields
  parent_task_id: "parent-id", // for subtasks
  content: "...", // when requested with include_content
}
```

This format ensures:
- Flat structure (no nested metadata/document)
- Consistent field naming across all endpoints
- Normalized type values without emojis
- Explicit task_type field for parent detection
- Progress fields available for all parent tasks
- Optional fields clearly marked

## Log
