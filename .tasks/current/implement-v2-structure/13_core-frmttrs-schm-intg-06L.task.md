# Core formatters schema integration

---
type: chore
status: Done
area: core
---


## Instruction
Remove hardcoded emojis/labels from core display logic so adding new metadata values doesn't require code changes.

## Tasks
- [x] Update formatters.ts to import schema service functions
- [x] Replace STATUS_EMOJIS with getStatusEmoji() lookups
- [x] Replace TYPE_EMOJIS with getTypeEmoji() lookups
- [x] Replace PRIORITY_EMOJIS with getPriorityEmoji() lookups
- [x] Fix workflow state display to use getWorkflowStateLabel()
- [x] Update field-normalizers.ts to use schema lookups
- [x] Test that all existing displays work correctly
- [x] Add test value "reviewing" to schema and verify it displays
- [x] Document performance considerations if lookups are slow
- [x] **CRITICAL**: Integrate normalization into core task-crud.ts create/update functions
- [x] **CRITICAL**: Update field-normalizers to return canonical names (not labels)
- [x] **CRITICAL**: Update formatters to display labels (convert canonical->human readable)
- [x] Update spec to reflect Postel's Law approach (store canonical, accept anything)
- [x] Test core normalization working end-to-end

## Deliverable
✅ **Complete schema integration with Postel's Law normalization:**

**Core Changes:**
- Added `normalizeFrontmatter()` function in task-crud.ts that normalizes all enum values
- Applied normalization in both `create()` and `update()` functions
- Updated field-normalizers to return canonical names instead of labels

**Storage Format (Canonical Names):**
- `status: todo` (not "To Do")
- `priority: high` (not "High")
- `type: feature` (not "Feature")

**Display Format (Human Labels):**
- Shows "To Do", "High", "Feature" with correct emojis
- Formatters convert canonical names back to labels for display

**Schema Integration:**
- All emoji/label lookups use schema service dynamically
- No hardcoded mappings remain in formatters
- New enum values can be added to schema without code changes

**Architecture:**
- Consistent storage format regardless of input method
- Liberal input acceptance ("High", "high", "🔼", etc.)
- Conservative output (always canonical names)
- Clean separation: core=normalize, formatters=display

**Testing:**
- End-to-end tested: CLI input → core normalization → correct storage → correct display
- All existing functionality preserved
- Ready for cleanup task (remove CLI/MCP normalization)

## Log
- 2025-06-03: Starting implementation - will integrate schema service into core formatters to replace hardcoded emoji/label mappings. This will allow new metadata values to be added without code changes.
- 2025-06-03: Removed all hardcoded emoji constants from formatters.ts - replaced STATUS_EMOJIS, TYPE_EMOJIS, and PRIORITY_EMOJIS with direct schema service lookups. Also updated workflow state display to use getWorkflowStateLabel().
- 2025-06-03: Task completed successfully:
- Removed all hardcoded emoji/label constants from formatters.ts and field-normalizers.ts
- Replaced with direct schema service lookups (getStatusEmoji, getTypeEmoji, getPriorityEmoji, getWorkflowStateLabel)
- Updated field-normalizers.ts to use schema lookups for validation
- Updated all tests to use actual values instead of constants
- Added "reviewing" status to schema and verified it displays correctly
- Documented performance considerations in schema-service.ts
- All tests passing, code-check shows no errors in our changes
- 2025-06-03: Additional refactoring: Moved formatters.ts from core/ to cli/ since formatters are only used by CLI, not MCP. This keeps core pure (business logic only) and clarifies that formatters are CLI-specific presentation logic.
- 2025-06-03: Fixed root cause issues:
1. Priority normalization was missing in CLI commands - added normalizePriority() calls in create/update
2. Type display was wrong because some tasks had types stored with emojis (e.g., '🐞 Bug' instead of 'bug')
3. Fixed all task files using sed to remove emojis from type field
4. Removed emoji fallbacks in formatters as requested - now returns empty string if no emoji found
- 2025-06-03: Discovered missing scope: The task was focused on formatters but missed the core normalization integration. CLI is manually normalizing instead of letting core handle it consistently. Need to move normalization logic to core layer where all inputs (CLI, MCP, API) get processed uniformly.
- 2025-06-03: ✅ Core normalization implemented successfully!
- Updated spec to use Postel's Law: store canonical names, accept any input
- Modified field-normalizers to return canonical names (todo, high, feature)
- Added normalizeFrontmatter() function in task-crud.ts
- Applied normalization in both create() and update() functions
- Updated formatters to display human-readable labels
- Tested end-to-end: stores 'todo'/'high' but displays 'To Do'/'High'

## Current issues
### formatters.ts
- Lines 25-48: Hardcoded emoji mappings (STATUS_EMOJIS, TYPE_EMOJIS, PRIORITY_EMOJIS)
- Line 105: Using `state.toUpperCase()` instead of schema label
- Lines 92-96, 103: Hardcoded workflow state initialization and order

### field-normalizers.ts
- Lines 11-52: Hardcoded priority/status constants and mappings
- Lines 77-184: Hardcoded emoji mappings in normalizers

## Implementation approach
1. Import schema service functions in both files
2. Replace emoji mapping objects with lookup functions
3. Update display logic to use schema labels
4. Test with existing values
5. Add a new test value to schema and verify it works

## Out of scope (document as todos)
- Generating TypeScript types from schema
- Workflow state ordering configuration
- Custom emoji overrides per project
