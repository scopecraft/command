# Task UI schema integration

---
type: chore
status: To Do
area: ui
---


## Instruction
Replace all hardcoded metadata values in Task UI with schema-driven lookups.

## Current Issues

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

## Implementation Approach

1. Create schema client for UI to access metadata
2. Generate icon/label mappings from schema
3. Update components to use schema-driven values
4. Handle UI-specific values gracefully
5. Test all components render correctly

## Challenges
- Schema lives in core, UI needs access
- UI has extra values not in schema (enhancement, parent_task)
- Icon names in schema need mapping to Lucide components

## Tasks
- [ ] Create tasks-ui/src/lib/schema-client.ts
- [ ] Copy or import schema data into UI
- [ ] Update icons.tsx to generate mappings from schema
- [ ] Update WorkflowStateBadge to use schema labels
- [ ] Update filter options in TaskManagementView
- [ ] Update filter options in ParentTaskListView
- [ ] Handle UI-specific values (enhancement, parent_task)
- [ ] Test all badge components render correctly
- [ ] Test filter dropdowns show correct options
- [ ] Verify adding new value to schema updates UI

## Deliverable
- UI components using schema for all metadata display
- No hardcoded labels or icon mappings in UI
- Filter options generated from schema
- Graceful handling of UI-specific values
- All components rendering correctly

## Log
