# Investigate dynamic vs hardcoded task types consistency

---
type: chore
status: done
area: core
priority: medium
tags:
  - templates
  - task-types
  - consistency
  - investigation
---


## Instruction
The MCP API currently uses hardcoded task type enums in schemas.ts, while the core system dynamically loads templates to determine available task types. This creates a potential consistency issue where:

1. Core templates define what task types are available (feature.md, bug.md, etc.)
2. MCP schemas hardcode these types in TaskTypeSchema
3. If templates are added/removed, schemas may become out of sync

This investigation should:
- Map current template files to hardcoded schema types
- Identify any mismatches or missing types
- Propose a solution for keeping them in sync
- Consider whether schemas should be generated from templates or templates should be validated against schemas

## Tasks
- [x] Analyze current template files in src/templates/
- [x] Compare with TaskTypeSchema enum in src/mcp/schemas.ts
- [x] Check how core system loads and validates task types
- [x] Identified any inconsistencies or missing mappings
- [x] Research best practices for template/schema synchronization
- [x] Document findings and recommend solution approach
- [x] Consider impact on both CLI and MCP interfaces

## Deliverable
# Investigation Report: Dynamic vs Hardcoded Task Types Consistency

## Log

## Current state analysis
### Template Files (src/templates/)
- `01_feature.md`
- `02_bug.md` 
- `03_chore.md`
- `04_documentation.md`
- `05_test.md`
- `06_spike.md`
**Missing**: `07_idea.md`

### V2 Core Types (src/core/v2/types.ts)
```typescript
export type TaskType = 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike' | 'idea';
```

### MCP Schema (src/mcp/schemas.ts)
```typescript
export const TaskTypeSchema = z.enum(['feature', 'bug', 'chore', 'documentation', 'test', 'spike']);
```
**Missing**: `'idea'` type

### Template Loading Logic
- **V1**: Uses hardcoded type mapping with emoji prefixes
- **V2**: Dynamically extracts types from filenames, includes 'idea' type
- **Pattern**: `NN_type.md` format

## Identified inconsistencies
1. **Critical Mismatch**: V2 core supports `'idea'` type but MCP schema excludes it
2. **Missing Template**: No `07_idea.md` template file exists
3. **Validation Gap**: V2 template manager doesn't validate template existence, just casts filenames to types
4. **Schema Drift**: Different type definitions across core/MCP boundaries

## Best practices research findings
### Key Principles
- **Use hardcoded enums** when values are stable and rarely change
- **Use dynamic values** when list is unknown or changes frequently
- **API design**: Start with strings, migrate to enums only when values prove stable
- **Synchronization**: Choose code-first or database-first approach consistently

### Recommended Patterns
1. **Code Generation**: Auto-generate schemas from templates at build time
2. **Runtime Sync**: Load available types at application startup
3. **Source of Truth**: Choose either templates or schemas as authoritative

## Impact analysis
### CLI Interface
- Currently passes through types without validation
- Relies on core V2 type definitions
- Would break if user specifies 'idea' type without template

### MCP Interface  
- Strict Zod validation rejects 'idea' type
- Creates inconsistency where CLI accepts types MCP rejects
- API consumers get different behavior than CLI users

## Recommended solution approach
### Option 1: Template-First (Recommended)
**Make templates the source of truth**

**Immediate fixes:**
1. Remove `'idea'` from V2 core TaskType (or create missing template)
2. Update MCP schema to dynamically read available templates
3. Add template existence validation in V2 template manager

**Implementation:**
```typescript
// Generate schema from actual template files
function getAvailableTaskTypes(): TaskType[] {
  const templates = fs.readdirSync(templatesDir)
    .filter(f => f.match(/^\d+_(\w+)\.md$/))
    .map(f => f.match(/^\d+_(\w+)\.md$/)![1] as TaskType);
  return templates;
}

// Dynamic MCP schema
export const TaskTypeSchema = z.enum(getAvailableTaskTypes());
```

### Option 2: Schema-First
**Make schemas authoritative, validate templates exist**

**Implementation:**
- Keep hardcoded schema as-is
- Add startup validation that required templates exist
- Remove unsupported types from core definitions

### Option 3: Hybrid Approach
**Separate core types from template types**

**Implementation:**
- Core supports basic types (feature, bug, chore, documentation, test)
- Templates can extend with additional types (spike, idea)
- MCP schema validates against core + available templates

## Recommendation
**Choose Option 1 (Template-First)** because:
1. Templates are user-facing and should drive available functionality
2. Allows easy extensibility by adding template files
3. Eliminates schema drift issues
4. Follows principle of configuration over convention

**Implementation Priority:**
1. **High**: Remove 'idea' from core types or create template
2. **Medium**: Add template existence validation
3. **Low**: Implement dynamic schema generation

This ensures immediate consistency while enabling future extensibility.
