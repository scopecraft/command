# Task UI schema integration

---
type: feature
status: done
area: ui
---


## Instruction
Replace all hardcoded metadata values in Task UI with schema-driven lookups.

## Tasks
- [x] Create tasks-ui/src/lib/schema-client.ts
- [x] Copy or import schema data into UI
- [x] Update icons.tsx to generate mappings from schema
- [x] Update WorkflowStateBadge to use schema labels
- [x] Update filter options in TaskManagementView
- [x] Update filter options in ParentTaskListView
- [x] Handle UI-specific values (enhancement, parent_task)
- [x] Test all badge components render correctly
- [x] Test filter dropdowns show correct options
- [x] Verify adding new value to schema updates UI

## Deliverable
- ✅ UI components using schema for all metadata display
- ✅ No hardcoded labels or icon mappings in UI
- ✅ Filter options generated from schema
- ✅ Graceful handling of UI-specific values
- ✅ All components rendering correctly
- ✅ Created schema-client.ts that wraps core schema service
- ✅ Updated icons.tsx with schema-driven mappings
- ✅ Updated WorkflowStateBadge components to use schema labels
- ✅ Updated filter components to use schema-generated options
- ✅ Integration tested successfully with code quality checks

## Log
- 2025-06-03: Starting implementation - adopting frontend developer mindset for UI schema integration
- 2025-06-03: Paused implementation - need to rethink approach after reviewing architecture. The UI shouldn't directly access core schema but should get metadata through MCP API or other proper channel.
- 2025-06-03: Restarting with correct approach - UI will use core schema service (not direct JSON import) for metadata lookups
- 2025-06-03: Successfully implemented schema integration. Created schema-client.ts wrapper around core schema service. Updated icons.tsx, WorkflowStateBadge.tsx, TaskManagementView.tsx, and ParentTaskListView.tsx to use schema-driven metadata instead of hardcoded values. All components now use schema for labels, icons, and filter options. UI-specific values (enhancement, parent_task) handled gracefully with fallbacks.
- 2025-06-03: Fixed runtime errors: replaced LucideIcon type import with local type definition, corrected import paths to core schema service, fixed UI fallback icon imports
- 2025-06-03: Fixed Vite import resolution: added @core alias to vite.config.js and updated imports to use @core/metadata/schema-service instead of relative paths
- 2025-06-03: Fixed critical bugs: 1) TaskTable showing 'Task' for all simple tasks instead of actual type (bug/feature/etc) - now uses getTypeLabel(task.type), 2) Filter icons missing - fixed by using createStatusFilterOptions() etc from icons.tsx instead of schema-only functions, 3) MCP cleanTaskType incorrectly transforming canonical names through getTypeName - fixed to validate types without transformation
- 2025-06-03: Completed successfully and committed. All UI components now use schema-driven metadata. Fixed critical bugs and verified everything works correctly.

## Current issues
### icons.tsx
- Lines 48-82: All icon mappings hardcoded (statusIcons, typeIcons, priorityIcons, workflowStateIcons)
- Extra values like 'enhancement' and 'parent_task' not in schema

### WorkflowStateBadge.tsx
- Lines 30-34: Hardcoded workflowLabels
- Lines 75-81: Hardcoded statusLabels
- Lines 139-143: Hardcoded priorityLabels

### Filter Components
- TaskManagementView.tsx (lines 127-145): Hardcoded filter options
- ParentTaskListView.tsx (lines 117-130): Hardcoded filter options

## Implementation approach
1. Create schema client for UI to access metadata
2. Generate icon/label mappings from schema
3. Update components to use schema-driven values
4. Handle UI-specific values gracefully
5. Test all components render correctly

## Challenges
- Schema lives in core, UI needs access
- UI has extra values not in schema (enhancement, parent_task)
- Icon names in schema need mapping to Lucide components
