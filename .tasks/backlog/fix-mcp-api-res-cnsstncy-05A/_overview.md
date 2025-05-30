# Fix MCP API Response Consistency

---
type: "\U0001F41E Bug"
status: To Do
area: mcp
priority: High
tags:
  - api-consistency
  - developer-experience
  - 'team:backend'
  - ui-feedback
  - high-priority
---


## Instruction
The MCP API returns inconsistent response formats between task_list and parent_list methods, creating significant UI complexity. These core-level inconsistencies likely also affect the CLI, requiring a comprehensive fix across all interfaces.

**Key Issues Identified by UI Team:**

1. **Data Structure Differences**
   - task_list returns nested structure with metadata and document objects
   - parent_list adds progress fields directly to root
   - Inconsistent nesting makes UI components complex

2. **Field Name Inconsistencies**
   - location vs workflow_state (for backlog/current/archive)
   - assigned_to vs assignee
   - Type field contains emoji prefixes ("🌟 Feature") requiring normalization

3. **Parent Task Detection Complexity**
   - UI checks 5 different properties: metadata.isParentTask, task_type, subtasks array, type === 'parent_task', etc.
   - No single source of truth for task type

4. **Progress Information**
   - Only available in parent_list responses
   - Added to root object rather than structured location
   - Missing when fetching individual parents

**Important**: If these issues originate in the core layer, they likely affect the CLI as well, requiring fixes across all consumer interfaces.

**Goal**: Implement the UI team's suggested normalized flat format for consistent, predictable API responses across MCP, CLI, and any future interfaces.

## Tasks
- [ ] Break down into subtasks
- [ ] Create subtask files
- [ ] Track progress

## Deliverable

## Log

- 2025-05-30: Added CLI impact analysis task - core inconsistencies likely affect both MCP and CLI interfaces
