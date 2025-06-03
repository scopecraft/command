# Fix parent_get token limit failures for tasks with many subtasks

---
type: bug
status: todo
area: mcp
tags:
  - performance
  - token-limit
  - api
  - parent-tasks
priority: high
---


## Instruction
The `parent_get` MCP operation currently returns the full content of all subtasks when retrieving a parent task. For parent tasks with many subtasks (10+), this can easily exceed Claude Code's token processing limits, causing the operation to fail.

The issue stems from `transformParentTaskDetail` always passing `includeContent = true` when transforming subtasks, and there's no way for the MCP client to request a truncated version.

### Proposed Solutions (from easier to better UX):

1. **Quick Fix - Add includeContent parameter** (Easiest)
   - Add optional `includeContent: boolean` to ParentGetInputSchema
   - Default to true for backwards compatibility
   - Pass this through to transformParentTaskDetail
   - Users can manually set to false when needed

2. **Smart Truncation - Auto-detect large responses** (Medium)
   - Add `maxTokens: number` parameter with sensible default (e.g., 10000)
   - Count approximate tokens in response (chars/4 as rough estimate)
   - If exceeding limit, automatically exclude subtask content
   - Return metadata indicating truncation occurred

3. **Granular Control - Section-based truncation** (Best UX)
   - Add `truncateOptions` object parameter with:
     - `maxTokens: number` (default 10000)
     - `includeSections: string[]` (e.g., ["instruction", "deliverable"])
     - `maxSubtaskContent: number` (chars per subtask)
     - `summaryOnly: boolean` (only metadata, no content)
   - Dynamically adjust content based on total size
   - Prioritize showing all subtask metadata over content

## Tasks
- [ ] Update ParentGetInputSchema in `/src/mcp/schemas.ts` to add truncation parameters
- [ ] Modify handleParentGetNormalized in `/src/mcp/normalized-handlers.ts` to pass truncation options
- [ ] Update transformParentTaskDetail in `/src/mcp/transformers.ts` to handle truncation logic
- [ ] Add token counting utility function (can use simple chars/4 estimate)
- [ ] Test with parent tasks containing many subtasks
- [ ] Update MCP documentation to describe new parameters
- [ ] Consider adding similar truncation to parent_list for consistency

## Deliverable
MCP parent_get operation that gracefully handles parent tasks with many subtasks by providing truncation options, preventing token limit failures while maintaining backwards compatibility.

## Log
- 2025-06-03: 2025-01-03: Created task based on issue report. Analyzed codebase and identified root cause in transformParentTaskDetail always including full content. Proposed three solutions ranging from simple to comprehensive.
