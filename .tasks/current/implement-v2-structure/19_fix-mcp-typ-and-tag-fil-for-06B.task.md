# Fix MCP type and tag filter format mismatches

---
type: bug
status: done
area: mcp
priority: high
tags:
  - bug-fix
  - critical
---


## Instruction
Fix MCP type and tag filter format mismatches that prevent filtering from working.

**Updated Context After Task 17**:
MCP input validation now uses flexible schemas with alias support. Task creation works correctly with canonical name storage. However, filtering may still have issues.

**Type Filter Investigation Needed**:
- MCP task_list tool registration now uses TaskTypeInputSchema (flexible)
- Need to verify if task_list filtering logic properly normalizes filter inputs
- Check if there are format mismatches between filter input and stored task format
- Ensure core filtering logic handles both canonical names and potential aliases in filters

**Tag Filter Investigation Needed**:
- CLI now passes tags directly (confirmed in Task 17)
- Verify tags are consistently stored as arrays vs strings
- Check if MCP tag filtering compares arrays correctly
- Debug any serialization issues in tag comparison logic

**Potential Root Causes**:
- Task list filtering might not normalize filter inputs before comparison
- Core filtering logic might expect different format than what's provided
- Tag array vs string format inconsistencies

## Tasks
- [x] Test MCP task_list filtering with type filters (use aliases and canonical names)
- [x] Test MCP task_list filtering with tag filters
- [x] If filtering fails, debug the actual filter values vs stored task values
- [x] Check if core filtering logic normalizes filter inputs before comparison
- [x] Verify tag storage format consistency (arrays vs strings)
- [x] Fix any format mismatches found in filtering logic
- [x] Test both type and tag filtering work correctly after fixes

## Deliverable

## Log
- 2025-06-03: Updated task to reflect new canonical name architecture - removed outdated emoji-related analysis
- 2025-06-03: Updated task context after Task 17 completion - MCP input validation now works with aliases, focus shifted to filtering logic investigation
- 2025-06-03: Starting investigation - will test MCP filtering with both type and tag filters to identify format mismatches
- 2025-06-03: Fixed MCP filtering issues - type normalization now works with canonical names and aliases (emoji filtering removed as not a real requirement). Tag filtering was already working correctly.
- 2025-06-03: ✅ VERIFIED: MCP filtering now works correctly after restart. Type filtering with canonical names ('bug', 'feature') and aliases ('fix', 'feat') all return correct results. Tag filtering and combined filtering also working perfectly. The normalization fix is successfully deployed.

## Fixed mcp filtering issues
### Type Filtering
- **Issue**: MCP handlers weren't normalizing type input before passing to core
- **Fix**: Added `normalizeTaskType()` calls in `buildCoreListOptions()` function in `src/mcp/normalized-handlers.ts`
- **Result**: Type filtering now works with both canonical names ("bug", "feature") and aliases ("fix", etc.)
- **Files Modified**: `src/mcp/normalized-handlers.ts`

### Tag Filtering
- **Status**: Already working correctly
- **Verified**: Tag filtering properly handles arrays and returns correct results

### Input Schema Flexibility
- **Updated**: MCP schemas now use `TaskTypeInputSchema` and `TaskStatusInputSchema` for flexible input
- **Files Modified**: `src/mcp/schemas.ts`

### Test Results
- Canonical type filtering: ✅ ("bug" → 19 tasks, "feature" → 24 tasks)
- Alias type filtering: ✅ ("fix" → 19 tasks, same as "bug")
- Tag filtering: ✅ ("ui" → 5 tasks with correct tags)
- Combined filtering: ✅ (type + tags work together)

**Note**: Emoji filtering removed from requirements as not needed for real use cases.
