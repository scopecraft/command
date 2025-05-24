+++
id = "FEAT-MIGRATETOML-0524-UH"
title = "Migrate from TOML to YAML frontmatter with dual-format support"
type = "mdtm_feature"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-24"
updated_date = "2025-05-24"
assigned_to = "🤖 AI"
phase = "release-v1"
subdirectory = "AREA_Core"
tags = [ "architecture", "migration", "parser", "breaking-change" ]
+++

# Migrate from TOML to YAML frontmatter with dual-format support

## Overview

Migrate the task file format from TOML frontmatter (using `+++` delimiters) to YAML frontmatter (using `---` delimiters) to improve ecosystem compatibility and AI/LLM familiarity. Implement dual-format support to allow gradual migration of existing files.

## Background & Motivation

### Current State
- Tasks use TOML frontmatter with `+++` delimiters
- Parsing uses `@iarna/toml` library
- All serialization is centralized in `task-parser.ts`

### Problems
1. **Ecosystem incompatibility**: Most tools expect YAML frontmatter (Obsidian, Fumadocs, Docusaurus, etc.)
2. **AI/LLM unfamiliarity**: LLMs have much more training data on YAML frontmatter
3. **Inconsistent with docs**: MDTM standard specifies YAML but implementation uses TOML

### Solution
- Migrate to YAML frontmatter using `gray-matter` (already installed)
- Implement dual-format support for backward compatibility
- Mark TOML format as deprecated

## Technical Design

### Architecture Changes

#### 1. **Update `src/core/task-parser.ts`**

**Current implementation locations:**
- `parseTaskFile()` function (lines ~15-35)
- `formatTaskFile()` function (lines ~40-60)

**Changes needed:**

```typescript
// Add import
import matter from 'gray-matter';

// Update parseTaskFile() to support both formats
export function parseTaskFile(content: string): { metadata: TaskMetadata; body: string } {
  // Try YAML first (new format)
  if (content.startsWith('---')) {
    try {
      const parsed = matter(content);
      // Normalize the parsed data to ensure compatibility
      const metadata = normalizeMetadata(parsed.data);
      return { metadata, body: parsed.content };
    } catch (error) {
      throw new Error(`Failed to parse YAML frontmatter: ${error.message}`);
    }
  }
  
  // Fallback to TOML (legacy format - deprecated)
  if (content.startsWith('+++')) {
    console.warn('TOML frontmatter is deprecated and will be removed in a future version. Please migrate to YAML frontmatter.');
    const match = content.match(/^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/);
    if (!match) {
      throw new Error('Invalid TOML frontmatter format');
    }
    try {
      const metadata = parseToml(match[1]) as TaskMetadata;
      return { metadata: normalizeMetadata(metadata), body: match[2] };
    } catch (error) {
      throw new Error(`Failed to parse TOML frontmatter: ${error.message}`);
    }
  }
  
  throw new Error('No valid frontmatter found. Expected YAML (---) or TOML (+++) delimiters.');
}

// Update formatTaskFile() to always write YAML
export function formatTaskFile(task: Task): string {
  const { content, ...metadata } = task;
  
  // Clean up metadata before serialization
  const cleanMetadata = removeUndefinedFields(metadata);
  
  // Use gray-matter to format with YAML frontmatter
  return matter.stringify(content || '', cleanMetadata);
}

// Helper function to normalize metadata between formats
function normalizeMetadata(metadata: any): TaskMetadata {
  // Handle date conversions, array formats, etc.
  // TOML and YAML might represent certain types differently
  return {
    ...metadata,
    // Ensure dates are properly formatted
    created_date: metadata.created_date ? formatDate(metadata.created_date) : undefined,
    updated_date: metadata.updated_date ? formatDate(metadata.updated_date) : undefined,
    due_date: metadata.due_date ? formatDate(metadata.due_date) : undefined,
  };
}

// Helper to remove undefined fields
function removeUndefinedFields(obj: any): any {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
```

#### 2. **Update imports**

In `task-parser.ts`, update imports:
```typescript
import { parse as parseToml } from '@iarna/toml'; // Keep for backward compatibility
import matter from 'gray-matter'; // Add for YAML support
```

#### 3. **Update error messages**

Search and update error messages that mention "TOML frontmatter" to mention "frontmatter" generically or "YAML frontmatter" where appropriate.

### Testing Strategy

#### 1. **Update test files**

Files that need test updates:
- `/test/task-parser.test.ts` (if exists, create if not)
- `/test/config-integration.test.ts`
- `/test/phase-management.test.ts`
- `/test/main-cli-parameters.test.ts`
- `/test/mcp-config-commands.test.ts`

Add tests for:
- Parsing YAML frontmatter
- Parsing TOML frontmatter (with deprecation warning)
- Error handling for invalid formats
- Metadata normalization between formats

#### 2. **Create migration test**

Create a test that verifies:
- TOML files can be read
- When saved, they're written as YAML
- Data integrity is maintained

### Migration Path

#### Phase 1: Dual Support (This task)
1. Implement dual-format reading
2. Always write YAML for new/updated files
3. Add deprecation warning for TOML format
4. Update documentation

#### Phase 2: Migration Script (Future task)
1. Create script to batch convert all TOML files to YAML
2. Preserve all metadata and formatting
3. Create backup before migration

#### Phase 3: Remove TOML Support (Future task)
1. Remove TOML parsing code
2. Remove `@iarna/toml` dependency
3. Update all documentation

## Implementation Checklist

- [ ] Update `parseTaskFile()` in `task-parser.ts` to support both formats
- [ ] Update `formatTaskFile()` to always write YAML
- [ ] Add deprecation warning when reading TOML files
- [ ] Add metadata normalization function
- [ ] Update error messages
- [ ] Write comprehensive tests for both formats
- [ ] Test date handling between TOML and YAML
- [ ] Test array handling between formats
- [ ] Test special characters and escaping
- [ ] Update inline documentation/comments
- [ ] Verify all CRUD operations still work
- [ ] Test with UI to ensure no breaking changes
- [ ] Add logger warning for TOML deprecation

## Acceptance Criteria

- [x] System can read both TOML (`+++`) and YAML (`---`) frontmatter
- [x] All new files are written with YAML frontmatter
- [x] Deprecation warning is logged when reading TOML files
- [x] All existing tests pass with minimal modifications
- [x] No data loss when reading TOML and writing YAML
- [x] Error messages are clear and helpful
- [x] Performance is not significantly impacted

## Dependencies

- `gray-matter` package (already installed)
- No new dependencies required

## Risks & Mitigations

### Risk 1: Data type differences
- **Risk**: TOML and YAML represent some data types differently
- **Mitigation**: Implement thorough normalization in `normalizeMetadata()`

### Risk 2: Special character handling
- **Risk**: Different escaping rules between formats
- **Mitigation**: Comprehensive testing of edge cases

### Risk 3: Date format differences
- **Risk**: TOML has native date type, YAML uses strings
- **Mitigation**: Consistent date formatting in normalization

## Success Metrics

- Zero data loss during format conversion
- No breaking changes for existing functionality
- Deprecation warnings visible in logs
- All new files use YAML format

## Future Considerations

- Consider migrating `.phase.toml` files to `.phase.yaml` for consistency
- Evaluate using gray-matter's custom delimiters feature for special formats
- Consider adding format version in frontmatter for future migrations

## References

- [gray-matter documentation](https://github.com/jonschlinkert/gray-matter)
- Current implementation: `/src/core/task-parser.ts`
- MDTM standard: `/docs/specs/mdtm_standard.md`
- Vision document: `/docs/specs/ai-first-knowledge-system-vision.md`
