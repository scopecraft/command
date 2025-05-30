# Clean up UI components after API normalization

---
type: chore
status: To Do
area: ui
assignee: 
tags: [refactoring, cleanup, v2]
priority: High
---

## Instruction

Once the MCP team completes API response normalization, clean up all V2 UI components that currently handle data inconsistencies. This task involves removing workarounds, simplifying data access patterns, and making components more maintainable.

### Background
The current V2 UI implementation has numerous workarounds to handle inconsistent API responses:
- Different data structures between `task_list` and `parent_list`
- Inconsistent field names (`workflow_state` vs `location`, `assigned_to` vs `assignee`)
- Multiple ways to detect parent tasks
- Deep property access patterns (`task.metadata?.status` vs `task.status`)
- Type fields with emoji prefixes that need stripping

### Expected Normalized Format
The API team will provide consistent responses with:
- Flat data structure (no nested metadata/document objects)
- Consistent field names across all endpoints
- Single `task_type` field to identify parent vs simple tasks
- Normalized type values without emojis
- Progress information included in standard format

## Tasks

### Phase 1: Update Type Definitions
- [ ] Update `/src/lib/types.ts` to match new normalized API response
- [ ] Remove duplicate field definitions (workflow vs workflow_state)
- [ ] Create single Task interface that works for all endpoints
- [ ] Remove complex type unions and conditional types

### Phase 2: Clean Data Access Components
- [ ] **TaskTypeIcon** (`/src/components/v2/TaskTypeIcon.tsx`)
  - [ ] Remove `extractTaskType()` function
  - [ ] Accept simple `type` prop instead of analyzing task object
  - [ ] Remove all deep property checks
- [ ] **ParentTaskListView** (`/src/components/v2/ParentTaskListView.tsx`)
  - [ ] Remove complex data mapping in `useMemo` (lines 39-69)
  - [ ] Remove all normalization helper functions
  - [ ] Pass data directly to TaskTable
- [ ] **TaskManagementView** (`/src/components/v2/TaskManagementView.tsx`)
  - [ ] Remove data normalization in `useMemo` (lines 37-59)
  - [ ] Remove helper functions (normalizeStatus, normalizeWorkflow, normalizeType)
  - [ ] Simplify metadata extraction
- [ ] **TaskTable** (`/src/components/v2/TaskTable.tsx`)
  - [ ] Remove workflow field fallbacks
  - [ ] Simplify subtask detection logic
  - [ ] Clean up parent task checks
- [ ] **Sidebar** (`/src/components/v2/Sidebar.tsx`)
  - [ ] Remove `normalizeTaskType()` function
  - [ ] Simplify recent tasks mapping
  - [ ] Remove metadata extraction

### Phase 3: Update Route Components
- [ ] `/src/routes/tasks/index.tsx` - Simplified data handling
- [ ] `/src/routes/tasks/$taskId.tsx` - Remove content extraction, simplify parent detection
- [ ] `/src/routes/parents/index.tsx` - Direct data passing
- [ ] `/src/routes/parents/$parentId.tsx` - Cleaner document handling

### Phase 4: Clean API Hooks
- [ ] Update `/src/lib/api/hooks.ts` if any client-side transformation needed
- [ ] Simplify `useRecentTasks` sorting logic
- [ ] Remove complex data access patterns

### Phase 5: Remove Utilities
- [ ] Delete any data transformation utilities that are no longer needed
- [ ] Update or remove task routing utilities if they do type detection

### Phase 6: Testing & Verification
- [ ] Update all mock data in tests to use normalized format
- [ ] Update Storybook stories with new data structure
- [ ] Verify all features still work correctly
- [ ] Run full test suite

## Deliverable

### Completed Cleanup
- All components simplified to work with normalized data
- No more deep property access or fallback chains
- Single source of truth for data structure
- Cleaner, more maintainable codebase

### Code Quality Improvements
- ~40-50% reduction in component complexity
- Better TypeScript inference
- Elimination of `any` types
- Consistent data access patterns

### Documentation
- Updated component prop documentation
- Updated README with new data structure
- Migration notes for any breaking changes

### Specific Metrics
- Remove all instances of:
  - `task.metadata?.field` patterns
  - `task.document?.frontmatter` access
  - Multiple field name checks (`workflow` vs `workflow_state`)
  - Complex parent task detection logic
  - Type emoji stripping code

## Log
- 2025-05-30: Task created to track UI cleanup work after API normalization is complete. Detailed cleanup plan documented based on current implementation analysis.