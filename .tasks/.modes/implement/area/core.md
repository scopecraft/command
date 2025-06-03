# Core Area Guide

⚠️ **CRITICAL**: Only work with code in `src/core/v2/`. There is NO v1 - it was never released. Ignore any legacy code outside v2. The v2 suffix is temporary and will be removed soon.

## Quick Architecture Overview
The Core area contains all business logic for task management, independent of any interface. It handles file operations, task parsing, workflow management, and provides a clean API for CLI, MCP, and UI layers.

## Key Files and Utilities

**IMPORTANT**: Only use files in `src/core/v2/`. Ignore any legacy code outside v2 - it's being removed. V2 is the ONLY implementation.

### Core Structure
- `src/core/v2/index.ts` - Main exports and operations
- `src/core/v2/task-crud.ts` - Task CRUD operations
- `src/core/v2/task-parser.ts` - Markdown/frontmatter parsing
- `src/core/v2/id-generator.ts` - ID generation from titles
- `src/core/v2/parent-tasks.ts` - Parent task operations
- `src/core/v2/directory-utils.ts` - File system helpers
- `src/core/v2/types.ts` - Core type definitions

### Key Utilities
```typescript
// ID Generation
import { generateTaskId } from './id-generator';
const id = generateTaskId(title, existingIds);

// Task Parsing
import { parseTaskDocument } from './task-parser';
const task = await parseTaskDocument(content, filePath);

// Directory Operations
import { ensureDirectoryExists, findTaskFiles } from './directory-utils';
```

## Common Patterns

### Error Handling
```typescript
// Use Result type for operations that can fail
type Result<T> = { success: true; data: T } | { success: false; error: string };

// Example usage
export async function getTask(id: string): Promise<Result<Task>> {
  try {
    const task = await readTask(id);
    return { success: true, data: task };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### File Operations
```typescript
// Always use path.join for cross-platform compatibility
const taskPath = path.join(rootDir, workflow, `${taskId}.task.md`);

// Check existence before operations
if (!await fs.exists(taskPath)) {
  throw new Error(`Task ${taskId} not found`);
}

// Use atomic writes for safety
await fs.writeFile(tempPath, content);
await fs.rename(tempPath, finalPath);
```

### Task Document Format
```markdown
# Task Title

---
type: feature
status: todo
area: core
tags: ["tag1", "tag2"]
---

## Instruction
What needs to be done

## Tasks
- [ ] Checklist item

## Deliverable
Expected output

## Log
- YYYY-MM-DD: Entry
```

## Do's and Don'ts

### Do's
- ✅ Keep business logic interface-agnostic
- ✅ Use TypeScript types extensively
- ✅ Validate data at boundaries
- ✅ Handle file system errors gracefully
- ✅ Focus on clean, forward-looking design
- ✅ Write pure functions when possible
- ✅ Use descriptive error messages

### Don'ts
- ❌ Mix UI/CLI concerns into core
- ❌ Assume file operations succeed
- ❌ Use hard-coded paths
- ❌ Mutate input parameters
- ❌ Skip validation
- ❌ Throw generic errors
- ❌ Look at or use ANY code outside src/core/v2/
- ❌ Worry about backward compatibility

## Testing Approach

### Unit Tests (for public APIs)
```typescript
// Test ID generation consistency
test('generateTaskId creates stable IDs', () => {
  const id1 = generateTaskId('Fix bug in parser');
  const id2 = generateTaskId('Fix bug in parser');
  expect(id1).toBe(id2);
});
```

### Integration Tests
```typescript
// Test full workflows
test('create and retrieve task', async () => {
  const task = await createTask({ title: 'Test' });
  const retrieved = await getTask(task.id);
  expect(retrieved.data.title).toBe('Test');
});
```

## Related Documentation
- Task System Design: `docs/specs/task-system-v2-specification.md`
- ID Format Spec: `docs/specs/id-format.md`
- Directory Structure: `docs/mdtm-directory-structure.md`

## Common Tasks for Core Area
- Adding new task fields
- Implementing workflow transitions
- Enhancing file operations
- Improving error handling
- Optimizing performance
- Adding validation rules