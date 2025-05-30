# MCP Write Operations Schema Design

## Overview

This document defines the consistent schema design for all MCP write operations to align with the already-implemented normalized read operations. The goal is to provide a unified, predictable API surface that uses consistent field names, validation, and response formats across all operations.

## Design Principles

1. **Field Name Consistency**: Use the same field names as normalized read operations
2. **Clean Enum Values**: Accept and validate clean enum values without emoji prefixes
3. **Zod Schema Validation**: All inputs and outputs validated with Zod schemas
4. **Unified Response Format**: Same envelope structure as read operations
5. **Type Safety**: Generate TypeScript types from Zod schemas
6. **No Backward Compatibility**: Clean break - MCP sessions are stateless

## Core Schema Extensions

### Write Operation Input Base Schema

```typescript
// Base schema for all write operations
export const WriteOperationContextSchema = z.object({
  rootDir: z.string().optional().describe('Project root directory (overrides session default)'),
});

// Error response schema (unified across all operations)
export const ErrorResponseSchema = z.object({
  code: z.string().describe('Error code for programmatic handling'),
  message: z.string().describe('Human-readable error message'),
  details: z.record(z.any()).optional().describe('Additional error context'),
});
```

## Task Write Operations

### Task Create

```typescript
// task_create input schema
export const TaskCreateInputSchema = WriteOperationContextSchema.extend({
  // Required fields
  title: z.string().min(1).max(200),
  type: TaskTypeSchema, // Uses existing clean enum
  
  // Optional metadata - using normalized field names
  area: z.string().default('general'),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  workflowState: WorkflowStateSchema.default('backlog'),
  
  // Relationships
  parentId: z.string().optional().describe('Parent task ID for creating subtasks'),
  
  // Additional metadata
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Initial content sections
  instruction: z.string().optional(),
  tasks: z.string().optional().describe('Initial checklist in markdown format'),
});

// task_create output schema
export const TaskCreateOutputSchema = createResponseSchema(
  z.object({
    id: z.string(),
    title: z.string(),
    type: TaskTypeSchema,
    status: TaskStatusSchema,
    workflowState: WorkflowStateSchema,
    area: z.string(),
    path: z.string(),
    createdAt: z.string().datetime(),
  })
);
```

### Task Update

```typescript
// task_update input schema
export const TaskUpdateInputSchema = WriteOperationContextSchema.extend({
  id: z.string(),
  parentId: z.string().optional().describe('Parent ID for subtask resolution'),
  
  updates: z.object({
    // Metadata updates
    title: z.string().min(1).max(200).optional(),
    status: TaskStatusSchema.optional(),
    priority: TaskPrioritySchema.optional(),
    area: z.string().optional(),
    assignee: z.string().optional(),
    tags: z.array(z.string()).optional(),
    
    // Content section updates
    instruction: z.string().optional(),
    tasks: z.string().optional(),
    deliverable: z.string().optional(),
    log: z.string().optional(),
    
    // Convenience field
    addLogEntry: z.string().optional().describe('Append timestamped entry to log'),
  }),
});

// task_update output schema
export const TaskUpdateOutputSchema = createResponseSchema(TaskSchema);
```

### Task Delete

```typescript
// task_delete input schema
export const TaskDeleteInputSchema = WriteOperationContextSchema.extend({
  id: z.string(),
  parentId: z.string().optional(),
  cascade: z.boolean().default(false).describe('Delete all subtasks for parent tasks'),
});

// task_delete output schema
export const TaskDeleteOutputSchema = createResponseSchema(
  z.object({
    id: z.string(),
    deleted: z.boolean(),
    cascadeCount: z.number().optional().describe('Number of subtasks deleted'),
  })
);
```

### Task Move

```typescript
// task_move input schema
export const TaskMoveInputSchema = WriteOperationContextSchema.extend({
  id: z.string(),
  parentId: z.string().optional(),
  targetState: WorkflowStateSchema,
  archiveDate: z.string().regex(/^\d{4}-\d{2}$/).optional()
    .describe('Required for archive moves (YYYY-MM format)'),
  updateStatus: z.boolean().default(true)
    .describe('Auto-update status based on workflow transition'),
});

// task_move output schema
export const TaskMoveOutputSchema = createResponseSchema(
  z.object({
    id: z.string(),
    previousState: WorkflowStateSchema,
    currentState: WorkflowStateSchema,
    statusUpdated: z.boolean(),
    newStatus: TaskStatusSchema.optional(),
  })
);
```

### Task Transform

```typescript
// task_transform input schema
export const TaskTransformInputSchema = WriteOperationContextSchema.extend({
  id: z.string(),
  operation: z.enum(['promote', 'extract', 'adopt']),
  
  // Operation-specific fields
  parentId: z.string().optional().describe('Required for extract operation'),
  targetParentId: z.string().optional().describe('Required for adopt operation'),
  initialSubtasks: z.array(z.string()).optional()
    .describe('For promote: checklist items to convert to subtasks'),
  sequence: z.string().regex(/^\d{2}$/).optional()
    .describe('For adopt: sequence number'),
  after: z.string().optional()
    .describe('For adopt: insert after this subtask'),
}).refine(
  (data) => {
    if (data.operation === 'extract' && !data.parentId) {
      return false;
    }
    if (data.operation === 'adopt' && !data.targetParentId) {
      return false;
    }
    return true;
  },
  {
    message: 'Missing required fields for operation',
  }
);

// task_transform output schema
export const TaskTransformOutputSchema = createResponseSchema(
  z.object({
    operation: z.enum(['promote', 'extract', 'adopt']),
    transformedTask: TaskSchema,
    affectedTasks: z.array(z.string()).optional(),
  })
);
```

## Parent Task Write Operations

### Parent Create

```typescript
// parent_create input schema
export const ParentCreateInputSchema = WriteOperationContextSchema.extend({
  // Required fields
  title: z.string().min(1).max(200),
  type: TaskTypeSchema,
  
  // Optional metadata
  area: z.string().default('general'),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  workflowState: WorkflowStateSchema.default('backlog'),
  
  // Parent-specific
  overviewContent: z.string().optional()
    .describe('Initial content for overview instruction section'),
  
  // Initial subtasks
  subtasks: z.array(z.object({
    title: z.string().min(1),
    type: TaskTypeSchema.optional(),
    sequence: z.string().regex(/^\d{2}$/).optional(),
    parallelWith: z.string().optional(),
  })).optional(),
  
  // Additional metadata
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// parent_create output schema
export const ParentCreateOutputSchema = createResponseSchema(
  z.object({
    id: z.string(),
    title: z.string(),
    type: TaskTypeSchema,
    workflowState: WorkflowStateSchema,
    path: z.string(),
    subtaskCount: z.number(),
    createdSubtasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      sequence: z.string(),
    })).optional(),
  })
);
```

### Parent Operations

```typescript
// parent_operations input schema
export const ParentOperationsInputSchema = WriteOperationContextSchema.extend({
  parentId: z.string(),
  operation: z.enum(['resequence', 'parallelize', 'add_subtask']),
  
  // Operation-specific fields with discriminated union
  operationData: z.discriminatedUnion('operation', [
    // Resequence operation
    z.object({
      operation: z.literal('resequence'),
      sequenceMap: z.array(z.object({
        id: z.string(),
        sequence: z.string().regex(/^\d{2}$/),
      })).min(1),
    }),
    
    // Parallelize operation
    z.object({
      operation: z.literal('parallelize'),
      subtaskIds: z.array(z.string()).min(2),
      targetSequence: z.string().regex(/^\d{2}$/).optional(),
    }),
    
    // Add subtask operation
    z.object({
      operation: z.literal('add_subtask'),
      subtask: z.object({
        title: z.string().min(1),
        type: TaskTypeSchema.optional(),
        after: z.string().optional(),
        sequence: z.string().regex(/^\d{2}$/).optional(),
        template: z.string().optional(),
      }),
    }),
  ]),
});

// parent_operations output schema
export const ParentOperationsOutputSchema = createResponseSchema(
  z.object({
    operation: z.enum(['resequence', 'parallelize', 'add_subtask']),
    parentId: z.string(),
    affectedSubtasks: z.array(z.object({
      id: z.string(),
      previousSequence: z.string().optional(),
      currentSequence: z.string(),
    })),
    newSubtask: SubTaskSchema.optional(),
  })
);
```

## Response Format Consistency

All write operations will use the same response envelope as read operations:

```typescript
{
  success: boolean,
  data?: T,  // Operation-specific data
  error?: string,  // User-friendly error message
  message: string,  // Success/failure message
  metadata?: {
    timestamp: string,  // ISO 8601 timestamp
    version: string,    // API version
    warnings?: string[] // Non-fatal issues
  }
}
```

## Implementation Strategy

Since MCP sessions are stateless and don't maintain memory of previous tool usage, we can make a clean break without backward compatibility concerns. The frontend is waiting for the new implementation.

### Clean Break Approach

- **No old field names**: Only accept new field names (`workflowState`, `parentId`, etc.)
- **Consistent responses**: All operations return the same format as read operations
- **Immediate availability**: Frontend can use new API as soon as it's deployed
- **No migration period**: Sessions don't persist, so no gradual transition needed

### For Implementation

1. **Add Zod Schemas**:
   ```typescript
   // In src/mcp/schemas.ts
   export const TaskCreateInputSchema = // ... as defined above
   export const TaskCreateOutputSchema = // ... as defined above
   // ... other schemas
   ```

2. **Update Handlers**:
   ```typescript
   // In normalized-handlers.ts
   export async function handleTaskCreateNormalized(rawParams: unknown) {
     // Validate input
     const params = TaskCreateInputSchema.parse(rawParams);
     
     // Process with v2 core
     const result = await v2.createTask(/* ... */);
     
     // Transform and validate output
     const response = TaskCreateOutputSchema.parse({
       success: true,
       data: transformTaskForResponse(result),
       message: 'Task created successfully',
       metadata: { timestamp: new Date().toISOString(), version: '2.0' }
     });
     
     return response;
   }
   ```

3. **Update Method Registry**:
   ```typescript
   export const methodRegistry: McpMethodRegistry = {
     // Existing normalized handlers
     [McpMethod.TASK_LIST]: handleTaskListNormalized,
     [McpMethod.TASK_GET]: handleTaskGetNormalized,
     
     // New normalized write handlers
     [McpMethod.TASK_CREATE]: handleTaskCreateNormalized,
     [McpMethod.TASK_UPDATE]: handleTaskUpdateNormalized,
     // ... etc
   };
   ```

## Benefits

1. **Consistency**: Same field names and formats across all operations
2. **Type Safety**: Full TypeScript support with Zod validation
3. **Better Errors**: Detailed validation errors with field-level messages
4. **Future Proof**: Easy to extend schemas for new features
5. **UI Simplification**: No need for field name mapping in UI code

## Summary

This design provides a complete, consistent schema system for all MCP write operations that aligns with the existing normalized read operations. By using Zod schemas throughout, we ensure type safety, runtime validation, and consistent error handling across the entire API surface.