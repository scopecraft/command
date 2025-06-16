# Core Area Guide

## Quick Architecture Overview
The Core area contains all business logic for task management, independent of any interface. It handles file operations, task parsing, workflow management, and provides a clean API for CLI, MCP, and UI layers.

## Key Files and Utilities

### Core Structure
- `src/core/index.ts` - Main exports and operations
- `src/core/task-crud.ts` - Task CRUD operations
- `src/core/task-parser.ts` - Markdown/frontmatter parsing
- `src/core/id-generator.ts` - ID generation from titles
- `src/core/parent-tasks.ts` - Parent task operations
- `src/core/directory-utils.ts` - File system helpers
- `src/core/types.ts` - Core type definitions

### Path Resolution System
- `src/core/paths/` - All path resolution logic
  - `path-resolver.ts` - Main API for getting paths
  - `strategies.ts` - Where files are stored
  - `types.ts` - Path types and interfaces
- `src/core/task-storage-path-encoder.ts` - Encodes project paths
- `src/core/config/configuration-manager.ts` - Project configuration

### Key Utilities
```typescript
// ID Generation
import { generateTaskId } from './id-generator';
const id = generateTaskId(title, existingIds);

// Task Parsing
import { parseTaskDocument } from './task-parser';
const task = await parseTaskDocument(content, filePath);

// Path Resolution - ALWAYS use this
import { createPathContext, resolvePath, PATH_TYPES } from './paths';
const context = createPathContext(projectRoot);
const tasksPath = resolvePath(PATH_TYPES.TASKS, context);

// Workflow directories
import { getWorkflowDirectory } from './directory-utils';
const backlogDir = getWorkflowDirectory(projectRoot, 'backlog');
```

### Where Things Are Stored

- **Templates**: `.tasks/.templates/` in your repository
- **Modes**: `.tasks/.modes/` in your repository
- **Tasks**: `~/.scopecraft/projects/{encoded}/tasks/` (outside repo)
- **Sessions**: `~/.scopecraft/projects/{encoded}/sessions/`
- **Config**: `~/.scopecraft/projects/{encoded}/config/`

The path resolver handles all of this automatically.

**IF** you need to understand the storage architecture in detail, see:
- `docs/02-architecture/system-architecture.md#storage-architecture`
- `docs/04-reference/storage-api.md`

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
// Get the correct storage path first
const workflowDir = getWorkflowDirectory(projectRoot, 'current');
const taskPath = path.join(workflowDir, `${taskId}.task.md`);

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
- ✅ Write pure functions when possible
- ✅ Use descriptive error messages
- ✅ Use the path resolver for all storage paths

### Don'ts
- ❌ Mix UI/CLI concerns into core
- ❌ Assume file operations succeed
- ❌ Use hard-coded paths
- ❌ Mutate input parameters
- ❌ Skip validation
- ❌ Throw generic errors

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
- Storage Architecture: `docs/02-architecture/system-architecture.md#storage-architecture`
- Storage API Reference: `docs/04-reference/storage-api.md`
- Path Resolution README: `src/core/paths/README.md`
- Migration Guide: `docs/03-guides/storage-migration.md`

## Common Tasks for Core Area
- Adding new task fields
- Implementing workflow transitions
- Enhancing file operations
- Improving error handling
- Optimizing performance
- Adding validation rules