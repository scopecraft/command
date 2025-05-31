# Content API Specification

## Executive Summary

This specification defines a comprehensive content management API that separates concerns between file persistence and content presentation. It addresses the dual-purpose problem discovered in `serializeTaskDocument()` and provides a consistent, flexible approach to content handling across all clients.

## Current State Analysis

### The Problem

The current `serializeTaskDocument()` function serves two incompatible purposes:
1. **File Persistence**: Creating complete task files with title, frontmatter, and sections
2. **Content Display**: Providing section content for UI/API consumption

This dual purpose creates a fundamental conflict where the same function cannot satisfy both needs.

### Current Implementation

```typescript
// Used for BOTH file creation and content display
serializeTaskDocument(task: TaskDocument): string
```

**File Creation Usage:**
```typescript
// task-crud.ts:107
const content = serializeTaskDocument(document);
writeFileSync(filepath, content, 'utf-8');
```

**API Content Usage:**
```typescript
// transformers.ts:174
content: includeContent ? core.serializeTaskDocument(task.document) : undefined
```

### Client-Specific Patterns

#### MCP API
- Uses `includeContent` parameter to control content inclusion
- Provides both `content` (full) and `sections` (structured) fields
- Optimizes for token efficiency with default `includeContent: false`

#### CLI
- Direct access to raw `TaskDocument`
- No serialization needed for display

#### UI
- Expects `content` field without metadata
- Displays sections in formatted views

## Proposed Solution

### Core Principle: Separation of Concerns

Create distinct functions for each use case with clear, descriptive names:

```typescript
// File persistence - includes everything
serializeTaskDocument(task: TaskDocument): string

// Content display - sections only
serializeTaskContent(task: TaskDocument): string

// Section extraction - structured data
extractTaskSections(task: TaskDocument): TaskSections
```

### API Method Signatures

#### 1. File Serialization (Existing, Unchanged)
```typescript
/**
 * Serialize a complete task document for file persistence
 * Includes: title, frontmatter, all sections
 */
export function serializeTaskDocument(task: TaskDocument): string
```

#### 2. Content Serialization (New)
```typescript
/**
 * Serialize task content for display purposes
 * Includes: sections only (no title, no frontmatter)
 */
export function serializeTaskContent(task: TaskDocument): string
```

#### 3. Section Extraction (Existing, Enhanced)
```typescript
/**
 * Extract individual sections as structured data
 */
export function extractTaskSections(task: TaskDocument): TaskSections
```

#### 4. Flexible Serialization (Alternative Option)
```typescript
export interface SerializationOptions {
  includeTitle?: boolean;
  includeFrontmatter?: boolean;
  includeSections?: boolean;
  sectionFilter?: string[];
}

/**
 * Flexible serialization with fine-grained control
 */
export function serializeTask(
  task: TaskDocument, 
  options?: SerializationOptions
): string
```

### Content Field Structure

#### Simple Task Response
```typescript
interface SimpleTaskContent {
  // Full content without metadata (new field)
  bodyContent?: string;
  
  // Structured sections
  sections?: {
    instruction?: string;
    tasks?: string;
    deliverable?: string;
    log?: string;
    [key: string]: string | undefined;
  };
  
  // Raw content (deprecated, for backward compatibility)
  content?: string;
}
```

#### Parent Task Response
```typescript
interface ParentTaskContent {
  // Overview content without metadata
  overviewContent?: string;
  
  // Overview sections
  sections?: TaskSections;
  
  // Legacy field (deprecated)
  overview?: string;
}
```

### API Parameters

#### List Operations
```typescript
interface ListOptions {
  // Content inclusion (default: false for efficiency)
  includeContent?: boolean;
  
  // Content format when included
  contentFormat?: 'full' | 'body' | 'sections';
}
```

#### Get Operations
```typescript
interface GetOptions {
  // Response format
  format?: 'summary' | 'full';
  
  // Content options when format is 'full'
  contentOptions?: {
    includeMetadata?: boolean;
    includeSections?: boolean;
    sectionFilter?: string[];
  };
}
```

## Migration Strategy

### Phase 1: Add New Functions (Non-Breaking)
1. Implement `serializeTaskContent()` alongside existing function
2. Add `bodyContent` field to API responses
3. Maintain `content` field for backward compatibility

### Phase 2: Update Clients
1. Update MCP transformers to use `serializeTaskContent()`
2. Migrate UI to use `bodyContent` field
3. Add deprecation notices for `content` field

### Phase 3: Cleanup (Breaking)
1. Remove deprecated `content` field
2. Rename `bodyContent` to `content`
3. Update all documentation

## Use Case Examples

### 1. File Creation
```typescript
// No change - uses full serialization
const document = createTaskDocument(title, frontmatter, sections);
const fileContent = serializeTaskDocument(document);
writeFileSync(filepath, fileContent);
```

### 2. UI Content Display
```typescript
// New approach - sections only
const task = await getTask(taskId);
const displayContent = serializeTaskContent(task.document);
// Returns only: ## Instruction\n...\n## Tasks\n...
```

### 3. API Response with Options
```typescript
// Flexible content control
const response = await taskGet(id, {
  format: 'full',
  contentOptions: {
    includeMetadata: false,
    includeSections: true,
    sectionFilter: ['instruction', 'tasks']
  }
});
```

### 4. Custom Section Support
```typescript
// All sections preserved, including custom ones
const content = serializeTaskContent(task.document);
// Includes: ## Instruction, ## Tasks, ## CustomSection, etc.
```

## Benefits

1. **Clear Separation**: Each function has a single, well-defined purpose
2. **Backward Compatible**: Migration can be done incrementally
3. **Flexible**: Clients can request exactly what they need
4. **Efficient**: Token usage optimized by default
5. **Maintainable**: Easy to understand and modify

## Implementation Priority

1. **High Priority**: Implement `serializeTaskContent()` to unblock UI fix
2. **Medium Priority**: Add `bodyContent` field to API responses
3. **Low Priority**: Implement flexible serialization options
4. **Future**: Deprecate and remove legacy fields

## Testing Requirements

1. Unit tests for each serialization function
2. Integration tests for file creation/reading cycle
3. API tests for all content parameter combinations
4. UI tests for content display without metadata
5. Migration tests for backward compatibility

## Related Tasks

- `quic-fix-rem-frn-fro-srl-cont-05A` - Original bug that revealed the issue
- `add-par-to-get-tas-con-wit-05A` - Related feature request
- Parent task `reds-tas-con-api-for-cns-hand-05A` - Overall implementation