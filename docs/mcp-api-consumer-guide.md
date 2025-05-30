# MCP API Consumer Guide

This guide provides comprehensive documentation for consumers of the MCP (Model Context Protocol) handlers, including the UI team and AI agents.

## Overview

The MCP API has been normalized to provide consistent field names, response formats, and validation across all endpoints. All core task operations now use:

- **Zod schema validation** for type safety
- **Consistent field names** (e.g., `workflowState` not `location`)
- **Unified response envelope** format
- **Clean enum values** without emoji prefixes

## Single Import Pattern

All MCP handlers are available through a single import:

```typescript
import { methodRegistry } from '@scopecraft/mcp/handlers.js';

// The methodRegistry contains all available handlers
const handler = methodRegistry['task_list'];
```

## Response Format

All normalized endpoints return responses in this consistent format:

```typescript
interface McpResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  metadata?: {
    timestamp: string;
    version: string;
  };
}
```

## Field Name Changes

The following field names have been standardized across all operations:

| Old Field Name | New Field Name | Description |
|----------------|----------------|-------------|
| `location` | `workflowState` | Task workflow state (backlog/current/archive) |
| `assigned_to` | `assignee` | Person assigned to the task |
| `parent_id` | `parentId` | Parent task ID for subtasks |
| `target_state` | `targetState` | Target workflow state for moves |

## Clean Enum Values

All enum values are now clean strings without emoji prefixes:

### Task Types
- `"feature"` (not "🌟 Feature")
- `"bug"` (not "🐞 Bug")
- `"chore"` (not "🧹 Chore")
- `"documentation"` (not "📚 Documentation")
- `"test"` (not "🧪 Test")
- `"spike"` (not "💡 Spike/Research")

### Task Status
- `"todo"` (not "To Do")
- `"in-progress"` (not "In Progress")
- `"done"` (not "Done")
- `"blocked"` (not "Blocked")
- `"archived"` (not "Archived")

### Priority Levels
- `"highest"`
- `"high"`
- `"medium"`
- `"low"`

### Workflow States
- `"backlog"`
- `"current"`
- `"archive"`

## API Endpoints

### Read Operations

#### task_list
Lists tasks with comprehensive filtering.

**Request:**
```typescript
{
  workflowState?: 'backlog' | 'current' | 'archive' | string[];
  area?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  tags?: string[];
  taskType?: 'simple' | 'parent' | 'subtask' | 'top-level' | 'all';
  includeContent?: boolean;
  includeCompleted?: boolean;
  includeArchived?: boolean;
  includeParentTasks?: boolean;
}
```

**Response:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    title: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    workflowState: WorkflowState;
    area: string;
    assignee?: string;
    tags: string[];
    taskStructure: 'simple' | 'parent' | 'subtask';
    parentId?: string;
    sequenceNumber?: string;
    path: string;
    content?: string; // Only if includeContent=true
  }>,
  message: string;
}
```

#### task_get
Retrieves a specific task with full details.

**Request:**
```typescript
{
  id: string;
  parentId?: string; // For subtask resolution
  format?: 'full' | 'summary';
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string;
    title: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    workflowState: WorkflowState;
    area: string;
    assignee?: string;
    tags: string[];
    taskStructure: 'simple' | 'parent' | 'subtask';
    parentId?: string;
    sequenceNumber?: string;
    path: string;
    created?: string;
    updated?: string;
    // Full content sections
    sections: {
      instruction: string;
      tasks: string;
      deliverable: string;
      log: string;
    };
    content: string; // Raw markdown
  },
  message: string;
}
```

#### parent_list
Lists parent tasks with progress information.

**Request:**
```typescript
{
  workflowState?: 'backlog' | 'current' | 'archive' | string[];
  area?: string;
  includeProgress?: boolean;
  includeSubtasks?: boolean;
}
```

**Response:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    title: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    workflowState: WorkflowState;
    area: string;
    assignee?: string;
    tags: string[];
    taskStructure: 'parent';
    path: string;
    progress?: {
      total: number;
      completed: number;
      percentage: number;
    };
    subtasks?: SimpleTask[]; // Only if includeSubtasks=true
  }>,
  message: string;
}
```

#### parent_get
Retrieves a parent task with all subtasks.

**Request:**
```typescript
{
  id: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    // Parent task info
    id: string;
    title: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    workflowState: WorkflowState;
    area: string;
    assignee?: string;
    tags: string[];
    taskStructure: 'parent';
    path: string;
    sections: {
      instruction: string;
      tasks: string;
      deliverable: string;
      log: string;
    };
    // Subtasks
    subtasks: Array<{
      id: string;
      title: string;
      type: TaskType;
      status: TaskStatus;
      priority: TaskPriority;
      workflowState: WorkflowState;
      area: string;
      taskStructure: 'subtask';
      parentId: string;
      sequenceNumber: string;
      path: string;
      sections: {
        instruction: string;
        tasks: string;
        deliverable: string;
        log: string;
      };
    }>;
    supportingFiles: string[];
  },
  message: string;
}
```

### Write Operations

#### task_create
Creates a new task.

**Request:**
```typescript
{
  title: string;
  type: TaskType;
  area?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  workflowState?: WorkflowState;
  parentId?: string; // For creating subtasks
  assignee?: string;
  tags?: string[];
  instruction?: string;
  tasks?: string; // Markdown checklist
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string;
    path: string;
  },
  message: string;
}
```

#### task_update
Updates an existing task.

**Request:**
```typescript
{
  id: string;
  parentId?: string; // For subtask resolution
  updates: {
    title?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    area?: string;
    assignee?: string;
    tags?: string[];
    // Content sections
    instruction?: string;
    tasks?: string;
    deliverable?: string;
    log?: string;
    addLogEntry?: string; // Convenience for appending to log
  };
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    // Updated task metadata
    metadata: {
      id: string;
      filename: string;
      path: string;
      location: {
        workflowState: WorkflowState;
      };
      isParentTask: boolean;
    };
    // Updated document
    document: {
      title: string;
      frontmatter: Record<string, any>;
      sections: {
        instruction: string;
        tasks: string;
        deliverable: string;
        log: string;
      };
    };
  },
  message: string;
}
```

#### task_delete
Deletes a task.

**Request:**
```typescript
{
  id: string;
  parentId?: string; // For subtask resolution
  cascade?: boolean; // For parent tasks with subtasks
}
```

**Response:**
```typescript
{
  success: true,
  message: string;
}
```

#### task_move
Moves a task between workflow states.

**Request:**
```typescript
{
  id: string;
  parentId?: string;
  targetState: 'backlog' | 'current' | 'archive';
  updateStatus?: boolean; // Auto-update status based on state
  archiveDate?: string; // YYYY-MM for archive moves
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string;
    previousState: WorkflowState;
    currentState: WorkflowState;
    statusUpdated: boolean;
    newStatus?: TaskStatus;
  },
  message: string;
}
```

#### task_transform
Transforms task structure (promote/extract/adopt).

**Request:**
```typescript
{
  id: string;
  parentId?: string;
  operation: 'promote' | 'extract' | 'adopt';
  initialSubtasks?: string[]; // For promote
  targetParentId?: string; // For adopt
  sequence?: string; // For adopt
  after?: string; // For adopt
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    operation: string;
    transformedTask: Task;
    affectedTasks?: string[];
  },
  message: string;
}
```

#### parent_create
Creates a parent task with optional initial subtasks.

**Request:**
```typescript
{
  title: string;
  type: TaskType;
  area?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  workflowState?: WorkflowState;
  assignee?: string;
  tags?: string[];
  overviewContent?: string;
  subtasks?: Array<{
    title: string;
    type?: TaskType;
    sequence?: string;
    parallelWith?: string; // Title of task to be parallel with
  }>;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string;
    path: string;
    message: string;
  },
  message: string;
}
```

#### parent_operations
Performs operations on parent task subtasks.

**Request:**
```typescript
{
  parentId: string;
  operation: 'resequence' | 'parallelize' | 'add_subtask';
  // For resequence
  sequenceMap?: Array<{
    id: string;
    sequence: string;
  }>;
  // For parallelize
  subtaskIds?: string[];
  targetSequence?: string;
  // For add_subtask
  subtask?: {
    title: string;
    type?: TaskType;
    after?: string;
    sequence?: string;
  };
}
```

**Response:**
```typescript
{
  success: true,
  message: string;
}
```

## Zod Schema Integration

For TypeScript projects, you can import and use the Zod schemas directly:

```typescript
import {
  TaskListInputSchema,
  TaskListOutputSchema,
  TaskCreateInputSchema,
  // ... other schemas
} from '@scopecraft/mcp/schemas';

// Validate input
const validatedInput = TaskListInputSchema.parse(userInput);

// Type-safe response
const response: z.infer<typeof TaskListOutputSchema> = await handler(validatedInput);
```

## Error Handling

All endpoints return consistent error responses:

```typescript
{
  success: false,
  error: "Detailed error message",
  message: "User-friendly error message",
  metadata?: {
    timestamp: string;
    version: string;
  }
}
```

## Migration from Old API

If you're migrating from the old API format:

1. **Update field names** according to the mapping table above
2. **Use clean enum values** without emoji prefixes
3. **Check response structure** - data is now always in the `data` field
4. **Update error handling** to use the consistent error format
5. **Use discriminated unions** - check `taskStructure` field instead of multiple properties

### Example Migration

**Old API call:**
```typescript
const result = await mcp.task_create({
  title: "Fix bug",
  type: "🐞 Bug",
  location: "backlog",
  assigned_to: "john@example.com"
});
```

**New API call:**
```typescript
const result = await mcp.task_create({
  title: "Fix bug",
  type: "bug",
  workflowState: "backlog",
  assignee: "john@example.com"
});
```

## Best Practices

1. **Always validate inputs** using Zod schemas when available
2. **Check `success` field** before accessing `data`
3. **Use `taskStructure` field** for discriminated unions
4. **Handle errors gracefully** with the consistent error format
5. **Use TypeScript** for better type safety with the API

## Token Efficiency

The API is designed for token efficiency:

- Use `includeContent: false` (default) when listing tasks
- Use `includeSubtasks: false` (default) when listing parents
- Request only the fields you need
- Use appropriate filters to reduce response size

## Deprecated Methods

The following methods have been removed as they provided no unique functionality:

- **workflow_current** → Use `task_list({ workflowState: 'current', status: 'in-progress' })`
- **task_next** → Use `task_list` with appropriate filters (priority, status, etc.)
- **workflow_mark_complete_next** → Use `task_update` then `task_list`

These workflow-specific methods were redundant with the more flexible `task_list` API.

## Support

For issues or questions about the MCP API:
- Check the error messages for guidance
- Review the Zod schemas for exact field requirements
- Consult the method registry for available endpoints