# Core formatters schema integration

---
type: chore
status: To Do
area: core
---


## Instruction
Remove hardcoded emojis/labels from core display logic so adding new metadata values doesn't require code changes.

## Current Issues

### formatters.ts
- Lines 25-48: Hardcoded emoji mappings (STATUS_EMOJIS, TYPE_EMOJIS, PRIORITY_EMOJIS)
- Line 105: Using `state.toUpperCase()` instead of schema label
- Lines 92-96, 103: Hardcoded workflow state initialization and order

### field-normalizers.ts
- Lines 11-52: Hardcoded priority/status constants and mappings
- Lines 77-184: Hardcoded emoji mappings in normalizers

## Implementation Approach

1. Import schema service functions in both files
2. Replace emoji mapping objects with lookup functions
3. Update display logic to use schema labels
4. Test with existing values
5. Add a new test value to schema and verify it works

## Out of Scope (Document as TODOs)
- Generating TypeScript types from schema
- Workflow state ordering configuration
- Custom emoji overrides per project

## Tasks
- [ ] Update formatters.ts to import schema service functions
- [ ] Replace STATUS_EMOJIS with getStatusEmoji() lookups
- [ ] Replace TYPE_EMOJIS with getTypeEmoji() lookups
- [ ] Replace PRIORITY_EMOJIS with getPriorityEmoji() lookups
- [ ] Fix workflow state display to use getWorkflowStateLabel()
- [ ] Update field-normalizers.ts to use schema lookups
- [ ] Test that all existing displays work correctly
- [ ] Add test value "reviewing" to schema and verify it displays
- [ ] Document performance considerations if lookups are slow

## Deliverable
- Core formatters using schema service for all metadata display
- No hardcoded emoji or label mappings in core
- Ability to add new enum values to schema without code changes
- All existing tests passing
- Performance acceptable (with caching if needed)

## Log
