# Fix MCP API Response Consistency

---
type: "\U0001F41E Bug"
status: In Progress
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
The MCP API has inconsistent response and input formats between read and write operations, creating significant UI complexity. The read operations (task_list, task_get, parent_list, parent_get) have been normalized with Zod schemas and consistent formatting, but write operations still use the old inconsistent format.

**Key Issues Identified by UI Team:**

1. **Read vs Write Format Inconsistency**
   - Read operations return normalized format with clean enums and consistent field names
   - Write operations expect old format with emoji prefixes and inconsistent field names
   - UI must handle two different formats for the same conceptual data

2. **Field Name Inconsistencies**
   - Read: workflowState, assignee, clean enums ("feature")
   - Write: location, assigned_to, emoji prefixes ("🌟 Feature")
   - Creates confusion and requires dual field mapping in UI

3. **Response Format Differences**
   - Read operations use normalized response envelope
   - Write operations use legacy response format
   - Inconsistent error handling across operations

4. **Orphaned Code Issues**
   - Old read handlers still exist alongside new normalized handlers
   - Multiple entry points confuse API consumers
   - Dead code creates maintenance burden

**Goal**: Achieve complete API consistency across ALL MCP operations (read AND write) with single entry point, consistent field names, clean enums, and unified response format.

## Tasks
- [ ] Break down into subtasks
- [ ] Create subtask files
- [ ] Track progress

## Deliverable

## Log
- 2025-05-30: Added CLI impact analysis task - core inconsistencies likely affect both MCP and CLI interfaces
- 2025-05-30: 2025-05-30: Major milestone achieved - Core implementation complete! ✅ Subtasks 01-04 done. Normalized MCP API working with Zod schemas, discriminated unions, clean enums, and efficient transformation layer. Ready for testing (05) and CLI analysis (07).
- 2025-05-30: 2025-05-30: ⏳ WAITING FOR UI TEAM FEEDBACK - Core implementation complete and pushed. Blocking remaining subtasks (05-testing, 07-CLI analysis) pending UI team integration feedback. Need to confirm normalized API meets their needs before investing time in comprehensive testing and CLI consistency work.
- 2025-05-30: 2025-05-30: 🎯 EXPANDED SCOPE - Added write operation normalization subtasks (08-11) to complete full API consistency. Current partial implementation only covers read operations, leaving UI team with inconsistent API format between read and write operations.
- 2025-05-30: 2025-05-30: ✅ UI TEAM CONFIRMED FIX - UI team successfully resolved their integration issues by using the methodRegistry approach correctly. Read operations working well. UI team will wait for write operation normalization (subtasks 08-11) before implementing create/update functionality. Clear validation that the normalized read API and single entry point architecture is working correctly.
