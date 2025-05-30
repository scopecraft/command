# MCP API Response Schema Design V2

## Executive Summary

This document defines a consistent, normalized API response schema for the MCP (Model Context Protocol) layer that serves both the Task UI and AI agents effectively. The design uses Zod schemas for single-source-of-truth definitions, enabling TypeScript type inference, runtime validation, and MCP outputSchema generation.

## Design Principles

1. **Token Efficiency**: Minimize response sizes for AI agent consumption
2. **Consistency**: Same schema patterns across all endpoints
3. **Clear Semantics**: Unambiguous field names and values  
4. **Type Safety**: Zod schemas with runtime validation
5. **Progressive Loading**: Request expanded data only when needed
6. **Resource-Ready**: Structure compatible with future MCP resource migration

## Tool/Endpoint Architecture

### Overview

We maintain 4 specialized endpoints optimized for different use cases:

| Endpoint | Purpose | Token Impact | Primary Users |
|----------|---------|--------------|---------------|
| `task_list` | Browse all tasks with filters | Low (metadata only) | Both UI & AI |
| `task_get` | Get single task details | Medium | Both UI & AI |
| `parent_list` | Browse parent tasks with progress | Low-Medium | Primarily AI |
| `parent_get` | Get full parent context | High (includes subtasks) | Both UI & AI |

### Why Separate Endpoints?

1. **Token Optimization**: AI agents can choose appropriate detail level
2. **Clear Intent**: Each endpoint has a specific purpose
3. **Future Resources**: Maps well to MCP resource patterns
4. **Performance**: Avoid over-fetching data

## Schema Definitions

### Core Enums

```typescript
import { z } from 'zod';

// Clean enums without display formatting
export const TaskTypeSchema = z.enum([
  'feature',
  'bug', 
  'chore',
  'documentation',
  'test',
  'spike'
]);

export const TaskStatusSchema = z.enum([
  'todo',
  'in_progress', 
  'done',
  'blocked',
  'archived'
]);

export const TaskPrioritySchema = z.enum([
  'highest',
  'high',
  'medium',
  'low'
]);

export const WorkflowStateSchema = z.enum([
  'backlog',
  'current',
  'archive'
]);

export const TaskStructureSchema = z.enum([
  'simple',
  'subtask',
  'parent'
]);
```

### Response Envelope

```typescript
export const ResponseMetadataSchema = z.object({
  timestamp: z.string().datetime(),
  version: z.string(),
  count: z.number().optional(),
  hasMore: z.boolean().optional()
});

export function createResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string(),
    metadata: ResponseMetadataSchema.optional()
  });
}
```

### Base Task Schema

```typescript
export const TaskBaseSchema = z.object({
  // Identity
  id: z.string(),
  title: z.string(),
  
  // Task metadata - Clean enums
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  
  // Organization - Renamed for clarity
  workflowState: WorkflowStateSchema,
  area: z.string(),
  tags: z.array(z.string()),
  
  // Assignment & Dates
  assignee: z.string().optional(),
  createdDate: z.string().datetime().optional(),
  updatedDate: z.string().datetime().optional(),
  archivedDate: z.string().datetime().optional(),
  
  // File system info (useful for both UI and AI)
  path: z.string(),
  filename: z.string()
});
```

### Task Sections Schema

```typescript
export const TaskSectionsSchema = z.object({
  instruction: z.string().optional(),
  tasks: z.string().optional(),      // Markdown checklist
  deliverable: z.string().optional(),
  log: z.string().optional()
});
```

### Discriminated Task Types

```typescript
// Simple standalone task
export const SimpleTaskSchema = TaskBaseSchema.extend({
  taskStructure: z.literal('simple'),
  content: z.string().optional(),    // Full markdown when requested
  sections: TaskSectionsSchema.optional()
});

// Subtask within a parent
export const SubTaskSchema = TaskBaseSchema.extend({
  taskStructure: z.literal('subtask'),
  parentId: z.string(),
  sequenceNumber: z.string(),        // "01", "02", "03a", etc.
  content: z.string().optional(),
  sections: TaskSectionsSchema.optional()
});

// Parent task with progress
export const ParentTaskProgressSchema = z.object({
  total: z.number(),
  completed: z.number(),
  percentage: z.number()
});

export const ParentTaskSchema = TaskBaseSchema.extend({
  taskStructure: z.literal('parent'),
  progress: ParentTaskProgressSchema,
  subtaskIds: z.array(z.string()),
  overview: z.string().optional(),   // Overview content when requested
  sections: TaskSectionsSchema.optional(),
  subtasks: z.array(SubTaskSchema).optional()  // Full subtasks when requested
});

// Union type for all tasks
export const TaskSchema = z.discriminatedUnion('taskStructure', [
  SimpleTaskSchema,
  SubTaskSchema,
  ParentTaskSchema
]);

// Type inference
export type Task = z.infer<typeof TaskSchema>;
export type SimpleTask = z.infer<typeof SimpleTaskSchema>;
export type SubTask = z.infer<typeof SubTaskSchema>;
export type ParentTask = z.infer<typeof ParentTaskSchema>;
```

## Endpoint Specifications

### Common Input Schemas

```typescript
// Shared filtering options for list endpoints
export const ListFilterSchema = z.object({
  // Top-level filters (commonly used, AI-friendly)
  workflowState: z.union([WorkflowStateSchema, z.array(WorkflowStateSchema)]).optional(),
  area: z.string().optional(),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Advanced filtering for complex queries
  // TODO: Implement advanced filtering in handlers - currently for schema reference only
  advancedFilter: z.object({
    // Multi-value filters
    status: z.union([TaskStatusSchema, z.array(TaskStatusSchema)]).optional(),
    type: z.union([TaskTypeSchema, z.array(TaskTypeSchema)]).optional(),
    priority: z.union([TaskPrioritySchema, z.array(TaskPrioritySchema)]).optional(),
    
    // Complex tag filtering
    tagFilter: z.object({
      any: z.array(z.string()).optional(),   // Match any of these tags (OR logic)
      all: z.array(z.string()).optional(),   // Must have all these tags (AND logic)
      none: z.array(z.string()).optional()   // Must not have any of these tags
    }).optional(),
    
    // Date range filtering
    dateRange: z.object({
      createdAfter: z.string().datetime().optional(),
      createdBefore: z.string().datetime().optional(),
      updatedSince: z.string().datetime().optional(),
      updatedBefore: z.string().datetime().optional()
    }).optional(),
    
    // Future metadata filters can be added here without breaking schema
    // customFields: z.record(z.any()).optional()
  }).optional()
    .describe('Advanced filtering options - TODO: Implementation pending')
});

// Common session context
export const SessionContextSchema = z.object({
  rootDir: z.string().optional()
    .describe('Project root directory (overrides session default)')
});
```

### 1. task_list

**Purpose**: Browse tasks with minimal data for token efficiency

#### Input Schema

```typescript
export const TaskListInputSchema = ListFilterSchema.merge(SessionContextSchema).extend({
  // Simple filters for common cases (AI-friendly)
  type: TaskTypeSchema.optional()
    .describe('Filter by single task type - use advancedFilter.type for multiple types'),
  status: TaskStatusSchema.optional()
    .describe('Filter by single status - use advancedFilter.status for multiple statuses'),
  
  // Task structure filtering
  taskType: z.enum(['simple', 'parent', 'subtask', 'top-level', 'all'])
    .default('top-level')
    .describe('Filter by task structure: top-level returns simple + parent tasks (no subtasks)'),
  
  // Token optimization flags
  includeCompleted: z.boolean().default(false)
    .describe('Include done/archived tasks (increases response size)'),
  includeArchived: z.boolean().default(false)
    .describe('Include archived workflow state'),
  includeContent: z.boolean().default(false)
    .describe('Include full content (high token cost)'),
  includeParentTasks: z.boolean().optional()
    .describe('Explicitly include/exclude parent tasks')
});

export type TaskListInput = z.infer<typeof TaskListInputSchema>;
```

#### Output Schema

```typescript
export const TaskListOutputSchema = createResponseSchema(
  z.array(TaskSchema)
);

export type TaskListOutput = z.infer<typeof TaskListOutputSchema>;
```

#### Token Considerations
- Default excludes completed/archived tasks
- Content not included by default
- Returns only metadata for browsing

### 2. task_get

**Purpose**: Get single task details without expansion

#### Input Schema

```typescript
export const TaskGetInputSchema = SessionContextSchema.extend({
  id: z.string(),
  format: z.enum(['summary', 'full']).default('summary')
    .describe('summary = metadata only, full = include content'),
  parentId: z.string().optional()
    .describe('Parent ID for subtask resolution')
});

export type TaskGetInput = z.infer<typeof TaskGetInputSchema>;
```

#### Output Schema

```typescript
export const TaskGetOutputSchema = createResponseSchema(TaskSchema);

export type TaskGetOutput = z.infer<typeof TaskGetOutputSchema>;
```

#### Token Considerations
- Parent tasks do NOT include expanded subtasks
- Use format='summary' for minimal tokens
- For full parent context, use parent_get instead

### 3. parent_list

**Purpose**: Browse parent tasks with progress information

#### Input Schema

```typescript
export const ParentListInputSchema = ListFilterSchema.merge(SessionContextSchema).extend({
  // Progress is always included for parent tasks
  includeProgress: z.boolean().default(true)
    .describe('Include progress stats (included by default)'),
  includeSubtasks: z.boolean().default(false)
    .describe('Include full subtask objects (high token cost)')
});

export type ParentListInput = z.infer<typeof ParentListInputSchema>;
```

#### Output Schema

```typescript
export const ParentListOutputSchema = createResponseSchema(
  z.array(ParentTaskSchema)
);

export type ParentListOutput = z.infer<typeof ParentListOutputSchema>;
```

#### Token Considerations
- Progress included by default (low overhead)
- Subtasks NOT included by default (high token cost)
- Useful for "show me all features in progress"

### 4. parent_get

**Purpose**: Get complete parent task context with all subtasks

#### Input Schema

```typescript
export const ParentGetInputSchema = SessionContextSchema.extend({
  id: z.string()
});

export type ParentGetInput = z.infer<typeof ParentGetInputSchema>;
```

#### Output Schema

```typescript
export const ParentTaskDetailSchema = ParentTaskSchema.extend({
  subtasks: z.array(SubTaskSchema),         // Always included
  supportingFiles: z.array(z.string()).optional()  // Other files in parent folder
});

export const ParentGetOutputSchema = createResponseSchema(ParentTaskDetailSchema);

export type ParentGetOutput = z.infer<typeof ParentGetOutputSchema>;
```

#### Token Considerations
- Always includes full subtask details (high token cost)
- Use only when full context is needed
- Consider task_get if only overview is needed

## Field Mapping from Current Structure

| Current Field | New Field | Location | Notes |
|--------------|-----------|----------|-------|
| metadata.location | workflowState | root | Clearer naming |
| metadata.assignee | assignee | root | Flattened |
| document.frontmatter.type | type | root | Clean enum value |
| document.frontmatter.status | status | root | Clean enum value |
| metadata.isParentTask | taskStructure | root | Discriminator field |
| "🐞 Bug" | "bug" | type field | Removed emoji prefix |
| subtask_count | progress.total | progress object | Grouped related data |
| completed_count | progress.completed | progress object | Grouped related data |

### Input Parameter Normalization

| Current Parameter | New Parameter | Applied To | Notes |
|------------------|---------------|-------------|--------|
| location | workflowState | list endpoints | Consistent with output |
| root_dir | rootDir | all endpoints | camelCase convention |
| include_* | include* | list endpoints | camelCase convention |
| task_type | taskType | task_list | camelCase convention |
| parent_id | parentId | task_get | camelCase convention |

## Implementation Strategy

### Implementation Notes

```typescript
// TODO: The advancedFilter parameter is defined in schema for future use
// Current implementation should:
// 1. Implement basic top-level filters first (workflowState, area, assignee, tags, type, status)
// 2. Ignore advancedFilter parameter for now (log warning if provided)
// 3. Add advancedFilter implementation in a future iteration

// Example handler pseudo-code:
export async function handleTaskList(params: TaskListInput) {
  if (params.advancedFilter) {
    console.warn('advancedFilter not yet implemented - ignoring');
  }
  
  // Use basic filters only for now
  const basicFilters = {
    workflowState: params.workflowState,
    area: params.area,
    assignee: params.assignee,
    tags: params.tags,
    type: params.type,
    status: params.status
  };
  
  // ... proceed with current implementation
}
```

### Phase 1: Response Transformation Layer

```typescript
// Example transformer function  
export function transformV2TaskToSchema(v2Task: V2Task): Task {
  const baseTask = {
    id: v2Task.metadata.id,
    title: v2Task.document.title,
    type: cleanTaskType(v2Task.document.frontmatter.type), // Remove emoji
    status: normalizeStatus(v2Task.document.frontmatter.status),
    priority: v2Task.document.frontmatter.priority || 'medium',
    workflowState: v2Task.metadata.location.workflowState,
    area: v2Task.document.frontmatter.area,
    tags: v2Task.document.frontmatter.tags || [],
    assignee: v2Task.document.frontmatter.assignee,
    path: v2Task.metadata.path,
    filename: v2Task.metadata.filename
    // ... dates
  };
  
  // Discriminate based on task structure
  if (v2Task.metadata.isParentTask) {
    return {
      ...baseTask,
      taskStructure: 'parent' as const,
      progress: await calculateProgress(v2Task),
      subtaskIds: await getSubtaskIds(v2Task),
      // ... parent specific fields
    };
  }
  // ... handle other types
}
```

### Phase 2: MCP Output Schema Integration

```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';

// Generate JSON Schema for MCP
export const taskListOutputJsonSchema = zodToJsonSchema(TaskListOutputSchema);

// In MCP tool definitions
{
  name: 'task_list',
  description: 'List tasks with filters',
  inputSchema: zodToJsonSchema(TaskListInputSchema),
  outputSchema: taskListOutputJsonSchema
}
```

### Phase 3: Core Integration (Optional)
- Evaluate if core should store clean enums
- Consider if core types should align with schema
- Update only if transformation overhead becomes problematic

## Benefits Analysis

### For UI Consumers
- Consistent structure across all endpoints
- Clear task type discrimination via `taskStructure`
- Clean enum values (no emoji stripping needed)
- Predictable field locations
- TypeScript types via Zod inference

### For AI Agents
- Token-efficient endpoints with clear purposes
- MCP outputSchema for better tool understanding
- File paths included for context
- Progressive data loading options
- Consistent patterns reduce prompt complexity

### For Maintainers
- Single source of truth (Zod schemas)
- Runtime validation catches issues
- Easy to generate documentation
- Clear migration path to MCP resources
- Type safety throughout

## Migration to MCP Resources

When MCP resource support matures, the endpoint structure maps cleanly:

```yaml
resources:
  - name: tasks
    uri: scopecraft://tasks
    methods: [list, get]
    
  - name: parents  
    uri: scopecraft://parents
    methods: [list, get]
```

The same schemas and patterns will apply, making migration straightforward.

## Open Questions

1. Should we add filtering by date ranges (createdDate, updatedDate)?
2. Do we need sorting options for list endpoints?
3. Should parent_list have an option to include only active subtasks?
4. Is there value in a `task_exists` method for quick checks?

## Conclusion

This design provides a token-efficient, consistent API that serves both UI and AI consumers effectively. The use of Zod schemas ensures type safety and enables proper MCP outputSchema support, while the 4-endpoint structure optimizes for different use cases and token budgets.