# Fix MCP API Response Consistency

---
type: bug
status: done
area: mcp
priority: high
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
- 2025-05-30: 2025-05-30: Major milestone achieved - Core implementation complete! ✅ Subtasks 01-04 done. Normalized MCP API working with Zod schemas, discriminated unions, clean enums, and efficient transformation layer. Ready for testing (05) and CLI analysis (07).
- 2025-05-30: Completed subtask 10 - Implemented write operation normalization in MCP handlers. All write operations now use consistent field names and response formats. Fixed parallel_with bug in normalization layer and created bug report for core team regarding parallelizeSubtasks timing issue.
