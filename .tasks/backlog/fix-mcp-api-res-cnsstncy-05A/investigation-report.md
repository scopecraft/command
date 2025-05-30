# MCP Response Format Investigation Report

## Summary

The MCP API has significant response format inconsistencies that create complexity for UI consumers. The core issues are:

1. **Deeply nested structure** instead of flat fields
2. **Inconsistent field naming** (location vs workflow_state, assignee placement)
3. **Type field contains emoji prefixes** requiring normalization
4. **Complex parent task detection** requiring multiple checks
5. **Progress information only in parent_list**, missing from parent_get

## Current Response Structures

### 1. task_list Response

Based on `src/mcp/handlers.ts:74-96`, task_list returns:

```typescript
{
  success: true,
  data: [{
    metadata: {
      id: string,
      title: string,
      type: string,              // Has emoji prefix: "🐞 Bug"
      status: string,
      priority: string,
      location: string,          // Should be "workflow_state"
      area: string,
      tags: string[],
      assignee: string,          // Nested in metadata
      isParentTask: boolean,
      parentTask?: string,
      sequenceNumber?: string,
      filename: string,
      path: string
    },
    document?: {...},            // Only if include_content=true
    content?: string             // Only if include_content=true
  }],
  message: string
}
```

### 2. parent_list Response

Based on `src/mcp/handlers.ts:635-659`, parent_list returns:

```typescript
{
  success: true,
  data: [{
    // All fields from task_list PLUS:
    subtask_count: number,       // Added at root level
    completed_count: number,     // Added at root level
    progress_percentage: number, // Added at root level
    subtasks?: Task[]           // If include_subtasks=true
  }],
  message: string
}
```

### 3. UI Expected Format

Based on `task-ui-2/src/lib/api/mock-data-v2.ts`, UI expects:

```typescript
{
  // Flat structure at root
  id: string,
  title: string,
  type: 'bug' | 'feature' | 'chore' | 'documentation' | 'test' | 'spike',  // No emoji
  status: 'todo' | 'in_progress' | 'done' | 'blocked' | 'archived',
  priority: 'highest' | 'high' | 'medium' | 'low',
  workflow_state: 'backlog' | 'current' | 'archive',  // Not "location"
  created_date: string,
  updated_date: string,
  tags: string[],
  assignee?: string,           // Flat, not nested
  content?: string,
  
  // For parent tasks
  overview?: string,
  subtasks?: string[],
  progress?: {
    completed: number,
    total: number
  }
}
```

## Detailed Issues

### Issue 1: Nested vs Flat Structure

**Current MCP:**
- Fields are deeply nested: `metadata.title`, `document.frontmatter.type`
- Requires complex navigation: `task.metadata.location`
- Different nesting levels for different fields

**UI Expectation:**
- All primary fields at root level
- Simple access: `task.title`, `task.type`, `task.workflow_state`

### Issue 2: Field Name Inconsistencies

| MCP Field | UI Expected | Location |
|-----------|------------|----------|
| metadata.location | workflow_state | Different naming |
| metadata.assignee | assignee | Nested vs flat |
| document.frontmatter.type | type | Deep nesting |
| document.frontmatter.status | status | Deep nesting |
| document.frontmatter.priority | priority | Deep nesting |

### Issue 3: Type Field Emoji Prefixes

**Current MCP returns:**
- "🌟 Feature"
- "🐞 Bug"
- "🧹 Chore"

**UI expects:**
- "feature"
- "bug"
- "chore"

Requires normalization logic in UI to strip emoji and lowercase.

### Issue 4: Parent Task Detection

Currently requires checking multiple properties:
1. `metadata.isParentTask === true`
2. `task_type === 'parent'` (in list params)
3. Presence of `subtasks` array
4. `type === 'parent_task'`
5. Path contains `_overview.md`

No single authoritative field.

### Issue 5: Progress Information Inconsistency

**parent_list:** Adds progress fields to root:
- subtask_count
- completed_count
- progress_percentage

**parent_get:** Returns different structure with:
- overview document
- subtasks array
- supportingFiles
- But NO progress summary

**task_get for parent:** Returns task format without progress

## Impact Analysis

1. **UI Complexity:** Requires transformation layer to normalize responses
2. **Type Safety:** Difficult to maintain consistent TypeScript types
3. **Performance:** Extra processing needed on every API response
4. **Developer Experience:** Confusing API surface, easy to make mistakes
5. **Maintenance:** Changes require updates in multiple places

## Root Cause

The inconsistency originates from:
1. V2 system preserving backward compatibility with nested structures
2. Different handlers adding fields at different levels
3. Type field storing display value (with emoji) instead of enum value
4. No standardized response transformation layer

## Next Steps

1. Design consistent normalized response schema (subtask 02)
2. Implement response normalization layer in MCP handlers (subtask 03)
3. Consider if core types need adjustment (subtask 04)
4. Ensure comprehensive testing (subtask 05)
5. Add backward compatibility if needed (subtask 06)
6. Check CLI for similar issues (subtask 07)