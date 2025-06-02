# Metadata Schema Registry MVP Implementation Plan

## Context
- **Architecture Specification**: `/docs/specs/metadata-architecture.md`
- **Parent Task**: `16_refc-to-cle-cru-api-and-fix-06W.task.md` (CRUD API refactoring)

## Goal
Unblock the CRUD refactoring by fixing the status/type format mismatch between Core and MCP layers. Implement just enough to get clean boundaries working.

## MVP Scope (80%)
- Centralized metadata definitions
- Basic transformation between layers
- Fix current TypeScript errors
- Maintain backward compatibility

## Out of Scope (20% - Leave TODOs)
- Project-specific configuration
- Dynamic schema loading
- Complex validation rules
- UI for configuration
- Schema inheritance

## Implementation Steps

### Phase 1: Create Schema Structure (30 min)
1. Create `src/core/metadata/default-schema.json`
   ```json
   {
     "metadata": {
       "enums": {
         "status": {
           "values": [
             { "name": "todo", "label": "To Do" },
             { "name": "in_progress", "label": "In Progress" },
             { "name": "done", "label": "Done" },
             { "name": "blocked", "label": "Blocked" },
             { "name": "archived", "label": "Archived" }
           ]
         },
         "type": {
           "values": [
             { "name": "feature", "label": "Feature", "template": "01_feature.md" },
             { "name": "bug", "label": "Bug", "template": "02_bug.md" },
             { "name": "chore", "label": "Chore", "template": "03_chore.md" },
             { "name": "documentation", "label": "Documentation", "template": "04_documentation.md" },
             { "name": "test", "label": "Test", "template": "05_test.md" },
             { "name": "spike", "label": "Spike", "template": "06_spike.md" }
           ]
         },
         "priority": {
           "values": [
             { "name": "highest", "label": "Highest" },
             { "name": "high", "label": "High" },
             { "name": "medium", "label": "Medium" },
             { "name": "low", "label": "Low" }
           ]
         }
       }
     }
   }
   ```

2. Create TypeScript interfaces in `src/core/metadata/types.ts`
   ```typescript
   export interface MetadataValue {
     name: string;      // e.g., "in_progress"
     label: string;     // e.g., "In Progress"
     emoji?: string;    // TODO: Add later
     aliases?: string[]; // TODO: Add later
   }
   
   export interface MetadataSchema {
     metadata: {
       enums: {
         status: { values: MetadataValue[] };
         type: { values: MetadataValue[] };
         priority: { values: MetadataValue[] };
       };
     };
   }
   ```

### Phase 2: Simple Schema Service (45 min)
1. Create `src/core/metadata/schema-service.ts`
   ```typescript
   import defaultSchema from './default-schema.json';
   
   // Simple functions, no classes
   export function getSchema(): MetadataSchema {
     // TODO: Later support loading project schema
     return defaultSchema;
   }
   
   export function getStatusLabel(name: string): string {
     const schema = getSchema();
     const status = schema.metadata.enums.status.values
       .find(s => s.name === name);
     return status?.label || name;
   }
   
   export function getStatusName(label: string): string {
     const schema = getSchema();
     const status = schema.metadata.enums.status.values
       .find(s => s.label === label);
     return status?.name || 'todo';
   }
   
   // Similar for type and priority...
   ```

### Phase 3: Update Transformers (30 min)
1. Update `src/mcp/transformers.ts`
   - Import schema service
   - Replace hardcoded normalizeStatus with schema lookup
   - Add denormalizeStatus using schema
   - Same for priority

2. Keep existing validation logic but use schema values

### Phase 4: Fix MCP Write Handlers (1 hour)
1. Update `src/mcp/normalized-write-handlers.ts`
   - Import denormalizeStatus
   - Transform MCP status → Core format before create/update
   - Remove quickfixes and metadata properties
   
2. Key changes:
   ```typescript
   // When creating task
   status: denormalizeStatus(params.status),
   
   // When returning response
   status: normalizeStatus(result.data.document.frontmatter.status),
   ```

### Phase 5: Update Core Types (30 min)
1. Generate types from schema in `src/core/types.ts`
   ```typescript
   import { getSchema } from './metadata/schema-service.js';
   
   const schema = getSchema();
   const statusValues = schema.metadata.enums.status.values
     .map(v => v.label) as const;
   
   export type TaskStatus = typeof statusValues[number];
   // Results in: 'To Do' | 'In Progress' | 'Done' | 'Blocked' | 'Archived'
   ```

### Phase 6: Fix CLI Display (30 min)
1. Update `src/core/formatters.ts`
   - Use schema for status/type display
   - Can add emoji later (TODO)

2. Update `src/cli/commands.ts`
   - Show available options from schema on errors

### Phase 7: Test & Validate (30 min)
1. Run `bun run code-check` - should have fewer errors
2. Test create task via CLI
3. Test MCP create/update operations
4. Ensure existing tests pass

## Total Time Estimate: 4-5 hours

## Success Criteria
- No more TypeScript errors about status mismatches
- MCP accepts "todo" and stores "To Do" in files
- CLI shows "In Progress" not "in_progress"
- All existing functionality works

## TODOs for Later
```typescript
// TODO: Load project-specific schemas from .scopecraft/schemas/
// TODO: Add emoji and color properties
// TODO: Implement alias support for flexible input
// TODO: Add schema validation
// TODO: Support schema inheritance/extension
// TODO: Generate Zod schemas from metadata schemas
// TODO: Add autocomplete data for free-form fields
```

## Rollback Plan
If this causes issues:
1. Keep the schema structure
2. Revert to hardcoded transformers
3. Fix forward with more targeted changes

## Notes
- This is intentionally minimal - just fixing the immediate problem
- We're keeping the same data flow, just centralizing the definitions
- No breaking changes to any APIs or file formats
- Can enhance incrementally once working

## IMPORTANT: Workflow States Consideration

The current plan only covers status, type, and priority enums but **misses workflow states** which are a separate concept:

- **WorkflowState**: Directory location ('backlog' | 'current' | 'archive' | potentially 'idea')
- **TaskStatus**: Task progress ('To Do' | 'In Progress' | 'Done' | 'Blocked' | 'Archived')

These are distinct concepts that should not be conflated. The metadata schema should include workflow states as a separate enum:

```json
{
  "metadata": {
    "enums": {
      "workflowState": {
        "values": [
          { "name": "backlog", "label": "Backlog", "emoji": "📋" },
          { "name": "current", "label": "Current", "emoji": "🎯" },
          { "name": "archive", "label": "Archive", "emoji": "📦" }
        ]
      },
      "status": { /* existing status values */ },
      "type": { /* existing type values */ },
      "priority": { /* existing priority values */ }
    }
  }
}
```

Without this, adding new workflow states (like "idea") will require hardcoded changes across multiple files:
- `src/core/types.ts` - WorkflowState type
- `src/mcp/schemas.ts` - WorkflowStateSchema 
- `tasks-ui/src/lib/icons.tsx` - workflowStateIcons
- `tasks-ui/src/components/v2/WorkflowStateBadge.tsx` - workflowLabels

Including workflow states in the metadata architecture will make the system truly extensible.