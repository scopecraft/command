# Complete Metadata Schema Integration Plan

## Current State Analysis

We've created the metadata schema infrastructure but only partially integrated it:

### ✅ What's Done:
1. Created `default-schema.json` with all enum definitions including workflow states
2. Built `schema-service.ts` with transformation functions
3. Updated MCP `transformers.ts` to use schema service for status/type/priority
4. Core still stores labels in files (e.g., "In Progress", "High")

### ❌ What's Missing:
1. **No UI integration** - All UI components have hardcoded labels and icons
2. **No icon support in schema** - Lucide icon names not included
3. **Incomplete core integration** - Formatters, CLI, and other core modules still hardcode values
4. **No validation everywhere** - Only MCP layer validates against schema
5. **No extensibility** - Can't add new workflow states without changing code in multiple places

## Deep Analysis of Required Changes

### 1. Schema Enhancement
The schema needs to support both emoji AND Lucide icon names:

```json
{
  "name": "in_progress",
  "label": "In Progress",
  "emoji": "🔵",
  "icon": "clock"  // Lucide icon name
}
```

### 2. Core Layer Changes

#### Files with hardcoded values:
- **`src/core/formatters.ts`**
  - Lines 92-96: Hardcoded workflow state initialization
  - Line 103: Hardcoded workflow state order
  - Line 105: Using `state.toUpperCase()` instead of label
  - Lines 25-48: Hardcoded emoji mappings for status/type/priority

- **`src/core/directory-utils.ts`**
  - Lines 12-16: `DEFAULT_WORKFLOW_FOLDERS` hardcoded
  - Should use schema to get folder names

- **`src/core/project-init.ts`**
  - Lines 41-47: Hardcoded workflow state descriptions
  - Should use schema labels and emojis

- **`src/cli/commands.ts`**
  - Various places assuming workflow state values
  - No validation against schema

- **`src/cli/validation-helpers.ts`**
  - We created this but it's not being used!

### 3. MCP Layer Changes

#### Already updated but needs review:
- **`src/mcp/transformers.ts`** - Check if fully using schema
- **`src/mcp/schemas.ts`** - Zod schemas should validate against metadata schema

### 4. UI Layer Changes (Major Work)

#### Components with hardcoded values:
- **`tasks-ui/src/lib/icons.tsx`**
  - Lines 48-82: All icon mappings hardcoded
  - Should load from schema's icon field

- **`tasks-ui/src/components/v2/WorkflowStateBadge.tsx`**
  - Lines 30-34: Hardcoded `workflowLabels`
  - Lines 75-81: Hardcoded `statusLabels`
  - Lines 139-143: Hardcoded `priorityLabels`

- **`tasks-ui/src/components/v2/Sidebar.tsx`**
  - Likely has hardcoded workflow state navigation

- **`tasks-ui/src/components/ui/filter-panel.tsx`**
  - Filter options probably hardcoded

### 5. Test Files
Many test files have hardcoded values that should use schema helpers or at least be validated.

## Updated Implementation Plan

### Phase 1: Enhance Schema Structure (30 min)
1. Add `icon` field to all enum values in `default-schema.json`
2. Update `MetadataValue` interface to include `icon?: string`
3. Add helper functions like `getStatusIcon()`, `getWorkflowStateEmoji()`

### Phase 2: Complete Core Integration (1 hour)
1. Update `formatters.ts`:
   - Import schema service functions
   - Replace emoji mappings with schema lookups
   - Use `getWorkflowStateLabel()` instead of `toUpperCase()`
   - Get workflow state order from schema
   
2. Update `directory-utils.ts`:
   - Use schema for folder names (might need new field?)
   
3. Update CLI commands:
   - Use validation helpers everywhere
   - Show allowed values from schema on errors

### Phase 3: MCP Schema Alignment (30 min)
1. Ensure Zod schemas match metadata schema values
2. Add validation that MCP enums match schema enums
3. Consider generating Zod enums from metadata schema

### Phase 4: UI Integration Strategy (2-3 hours)
1. Create `tasks-ui/src/lib/metadata-schema.ts`:
   - Import schema from core (or copy for now)
   - Export UI-friendly helpers
   
2. Update icon mappings:
   - Load icon names from schema
   - Map string names to Lucide components
   
3. Update all badge/display components:
   - Remove hardcoded label objects
   - Use schema service functions
   
4. Update filter components:
   - Generate options from schema

### Phase 5: Testing & Validation (1 hour)
1. Add tests that verify no hardcoded values
2. Test adding a new workflow state to schema
3. Ensure everything updates automatically

## Benefits of Complete Integration

1. **Single Source of Truth**: Change schema, everything updates
2. **Easy Extensibility**: Add "idea" workflow state in one place
3. **Type Safety**: TypeScript types generated from schema
4. **UI Consistency**: Icons, labels, and emojis always match
5. **Internationalization Ready**: Labels can be keys for i18n

## Migration Strategy

Since this touches many files, we should:
1. Start with read-only operations (display)
2. Then update write operations (validation)
3. Keep backward compatibility during transition
4. Use feature flags if needed

## Success Criteria

- [ ] Can add new workflow state to schema and it appears everywhere
- [ ] No hardcoded status/type/priority/workflow labels anywhere
- [ ] UI components get all display info from schema
- [ ] Tests pass with schema-driven values
- [ ] Documentation updated to explain schema usage

## Risks & Mitigation

1. **Risk**: Breaking existing functionality
   - **Mitigation**: Incremental changes, extensive testing
   
2. **Risk**: Performance impact of schema lookups
   - **Mitigation**: Cache schema in memory, optimize lookups
   
3. **Risk**: UI/Core schema sync issues
   - **Mitigation**: Share schema or generate from single source

## MVP Subtasks Based on Analysis

### Subtask 1: Core Formatters Integration
**Goal**: Remove hardcoded emojis/labels from core display logic
**Scope**:
- Update `formatters.ts` to use schema service for all emoji/label lookups
- Update `field-normalizers.ts` to validate against schema values
- Keep TypeScript types hardcoded for now (future task)
**Success**: Can add new status/type to schema and it displays correctly

### Subtask 2: Task UI Schema Integration  
**Goal**: Centralize UI metadata lookups
**Scope**:
- Create `tasks-ui/src/lib/schema-client.ts` to access core schema
- Update `icons.tsx` to generate mappings from schema
- Update `WorkflowStateBadge.tsx` to use schema labels
- Fix filter options in `TaskManagementView.tsx` and `ParentTaskListView.tsx`
**Success**: UI components use schema for all labels/icons

### Subtask 3: Template System Integration (Optional for MVP)
**Goal**: Link templates to task types via schema
**Scope**:
- Update template-manager to use schema's template field
- Move default template content to files
- Allow custom templates per project
**Success**: New task type in schema automatically uses its template

## Next Steps

1. ✅ Icons added to schema
2. Start with Subtask 1 (Core Formatters)
3. Then Subtask 2 (Task UI)
4. Document remaining TODOs
5. Consider template integration as follow-up