# Content Serialization Analysis

## Issue Discovery

While implementing task `quic-fix-rem-frn-fro-srl-cont-05A`, we discovered a critical architectural issue with the `serializeTaskDocument()` function in the v2 system.

## The Problem

The `serializeTaskDocument()` function serves dual purposes that have conflicting requirements:

1. **File Creation**: Used in `task-crud.ts:107` to generate complete task files
   - Requires: Title line (`# Title`) + Frontmatter + Sections
   - Without these, files cannot be parsed by `parseTaskDocument()`

2. **UI Content Display**: Used in `transformers.ts:174,197` to provide content to MCP/UI
   - Requires: Only section content (no title, no frontmatter)
   - Including metadata causes UI to display duplicate information

## Root Cause

The same serialization function cannot satisfy both use cases:
- If we include title/frontmatter → UI displays unwanted metadata
- If we exclude title/frontmatter → New task files are invalid and unparseable

## Evidence

### File Creation Flow
```typescript
// src/core/v2/task-crud.ts:107
const content = serializeTaskDocument(document);
writeFileSync(filepath, content, 'utf-8');
```

### UI Content Flow
```typescript
// src/mcp/transformers.ts:174
content: includeContent ? core.serializeTaskDocument(task.document) : undefined,
```

### Parser Expectation
```typescript
// src/core/v2/task-parser.ts:27-29
const titleMatch = lines[0]?.match(/^# (.+)$/);
if (!titleMatch) {
  throw new Error('Task document must start with # Title');
}
```

## Impact

This issue affects:
- Task creation (any new task would be unreadable)
- UI content display (shows metadata that should be hidden)
- API consistency (same function returns different content for different purposes)

## Proposed Solutions

### Option 1: Separate Functions
Create distinct functions for each use case:
- `serializeTaskDocument()` - Full document for file creation
- `serializeTaskContent()` - Sections only for UI display

### Option 2: Parameter Control
Add a parameter to control serialization:
```typescript
serializeTaskDocument(task: TaskDocument, options?: { 
  includeMetadata?: boolean 
}): string
```

### Option 3: Transform at API Layer
Keep `serializeTaskDocument()` as-is, but strip metadata in the MCP transformer layer.

## Recommendation

Option 1 (Separate Functions) provides the clearest separation of concerns and makes the intent explicit in the code. This aligns with the principle of having functions do one thing well.

## Related Tasks

- `quic-fix-rem-frn-fro-srl-cont-05A` - The original bug fix attempt that revealed this issue
- `01_resr-and-des-con-api-spcfcton-05A` - Should incorporate this analysis into API design
- Parent task `reds-tas-con-api-for-cns-hand-05A` - Overall content API redesign

## Lessons Learned

1. Quick fixes can reveal deeper architectural issues
2. Functions serving multiple purposes often indicate a design problem
3. File format requirements must be considered when modifying serialization logic
4. Testing file creation paths is as important as testing read paths