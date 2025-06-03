# V2 Integration Test - Root Cause Analysis

Date: Mon 2 Jun 2025

## 1. MCP Filtering Bugs

### Issue: Location filter not working
**Root Cause**: Parameter name mismatch
- MCP server (core-server.ts:144) defines parameter as `location`
- Handler schema (schemas.ts:141) expects `workflowState`
- Parameter transformer doesn't map `location` → `workflowState`
- Result: Filter is ignored, returns tasks from all locations

**Fix Required**: Either rename server parameter to `workflowState` OR add mapping in parameter transformer

### Issue: Type filter not working
**Root Cause**: Format mismatch between clean enums and stored values
- MCP converts clean enum (e.g., "feature") to emoji format (e.g., "🌟 Feature") in normalized-handlers.ts:84
- But core might be storing tasks with clean enums now due to schema integration
- Filter comparison fails because formats don't match

**Fix Required**: Ensure consistent format between stored values and filter values

### Issue: Tag filter not working
**Root Cause**: Array comparison logic issue
- Core list function (task-crud.ts:654) checks if ANY requested tag exists in task tags
- This logic seems correct, so issue might be in how tags are passed or stored

**Fix Required**: Debug the actual tag comparison logic

## 2. Metadata Persistence Issues

### Issue: Priority always shows as "medium"
**Root Cause**: Priority not included in output transformation
- Priority IS correctly stored in files (verified in high-priority-feature-06A.task.md)
- Priority IS correctly read by transformBaseTask (transformers.ts:124)
- But task creation output (normalized-write-handlers.ts:137) doesn't include priority field
- MCP response only includes: id, title, type, status, workflowState, area, path, createdAt

**Fix Required**: Add priority to task creation output schema and response

### Issue: Status updates being ignored
**Root Cause**: Automatic workflow transitions may be overriding explicit status
- When updating status, automatic transitions might move task to different workflow
- The transition logic might reset status based on workflow rules

**Fix Required**: Review automatic transition logic to respect explicit status updates

## 3. CLI Missing Features

### Issue: Parent list/get not implemented
**Root Cause**: Placeholder implementations
- Functions exist but only print "not yet implemented" (commands.ts:611, 615)

**Fix Required**: Implement actual functionality using core.parent() methods

### Issue: Area assignment confusion
**Root Cause**: Documentation/user error
- CLI uses `--subdirectory` flag, not `--area`
- User was trying to use non-existent `--area` flag
- UPDATE: User clarified --subdirectory is for workflowState, area is just metadata

**Fix Required**: Update documentation to clarify flag usage

### Issue: Subtask creation in wrong location
**Root Cause**: Wrong core method used
- CLI create command uses `core.create()` even when parent is specified
- It passes parent in customMetadata, but should use `core.parent().create()` instead

**Fix Required**: Check for parent option and use appropriate core method

## 4. Tag Storage Format

### Issue: Tags stored as comma-separated string
**Root Cause**: CLI passing tags incorrectly
- CLI passes tags to customMetadata (commands.ts:215)
- But core expects tags as direct option, not in customMetadata
- When tags come through customMetadata, they might be stringified

**Fix Required**: Pass tags directly in createOptions, not in customMetadata

## Summary of Required Fixes

1. **MCP location filter**: Add `location` → `workflowState` mapping
2. **MCP type filter**: Ensure consistent enum format
3. **MCP tag filter**: Debug comparison logic
4. **Priority in output**: Add to creation response schema
5. **Status updates**: Fix automatic transition logic
6. **CLI parent commands**: Implement list/get handlers
7. **CLI subtask creation**: Use parent().create() when parent specified
8. **CLI tag handling**: Pass tags directly, not via customMetadata