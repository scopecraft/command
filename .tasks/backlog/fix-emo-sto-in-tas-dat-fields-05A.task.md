# Fix emoji storage in task data fields

---
type: bug
status: To Do
area: general
priority: High
---


## Instruction
## Problem

The field normalizers in `src/core/field-normalizers.ts` are adding emojis to the actual data values:

- Priority: "High" becomes "🔼 High"  
- Status: "To Do" becomes "🟡 To Do"
- etc.

This violates our design principle that emojis are a presentation concern and should not be stored in the data itself.

## Current Impact

1. Display code shows duplicate symbols: `○ To Do • 🟡 To Do`
2. Data comparisons fail: `priority === 'High'` doesn't work
3. Formatters have to clean data before display

## Files to Fix

- `src/core/field-normalizers.ts` - Remove emojis from PRIORITY_VALUES, TASK_STATUS_VALUES, PHASE_STATUS_VALUES
- `src/core/task-manager/task-crud.ts` - Check usage of normalizers
- `src/mcp/handlers.ts` - Check MCP usage

## Solution

1. Change normalizers to return clean values:
   - PRIORITY_VALUES.HIGH = 'High' (not '🔼 High')
   - TASK_STATUS_VALUES.TODO = 'To Do' (not '🟡 To Do')

2. Add migration script to clean existing task data

3. Ensure formatters add emojis only at display time

## Testing

After fix:
- `sc task create --priority High` should store "High" not "🔼 High"
- Tree view should still show symbols but from formatter only
- All status/priority comparisons should work without emoji considerations

## Tasks

## Deliverable

## Log

## Fix emoji storage in task data fields
Task description goes here.

## Acceptance criteria
- [ ] Criteria 1
