/**
 * MCP API Response Schemas using Zod
 *
 * This file implements the normalized API schema design
 * Single source of truth for TypeScript types, runtime validation, and MCP outputSchema
 */

import { z } from 'zod';

// =============================================================================
// Core Enums - Clean values without display formatting
// =============================================================================

// For output: strict canonical values only
export const TaskTypeSchema = z.enum([
  'feature',
  'bug',
  'chore',
  'documentation',
  'test',
  'spike',
  'idea',
]);

export const TaskStatusSchema = z.enum([
  'todo',
  'in_progress',
  'done',
  'blocked',
  'archived',
  'reviewing',
]);

export const TaskPrioritySchema = z.enum(['highest', 'high', 'medium', 'low']);

export const WorkflowStateSchema = z.enum(['backlog', 'current', 'archive']);

// For input: accept any string and let core normalize
// This follows Postel's Law: be liberal in what you accept, conservative in what you send
// Descriptions are dynamically generated from schema registry for AI guidance

import {
  getPriorityValues,
  getStatusValues,
  getTypeValues,
  getWorkflowStateValues,
} from '../core/metadata/schema-service.js';

export const TaskTypeInputSchema = z.string().describe(
  `Task type. Use: ${getTypeValues()
    .map((t) => `"${t.name}"`)
    .join(', ')}`
);

export const TaskStatusInputSchema = z.string().describe(
  `Task status. Use: ${getStatusValues()
    .map((s) => `"${s.name}"`)
    .join(', ')}`
);

export const TaskPriorityInputSchema = z.string().describe(
  `Task priority. Use: ${getPriorityValues()
    .map((p) => `"${p.name}"`)
    .join(', ')}`
);

export const WorkflowStateInputSchema = z.string().describe(
  `Workflow state. Use: ${getWorkflowStateValues()
    .map((w) => `"${w.name}"`)
    .join(', ')}`
);

export const TaskStructureSchema = z.enum(['simple', 'subtask', 'parent']);

// =============================================================================
// Response Envelope
// =============================================================================

export const ResponseMetadataSchema = z.object({
  timestamp: z.string().datetime(),
  version: z.string(),
  count: z.number().optional(),
  hasMore: z.boolean().optional(),
});

export function createResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string(),
    metadata: ResponseMetadataSchema.optional(),
  });
}

// =============================================================================
// Base Task Schema
// =============================================================================

export const TaskBaseSchema = z.object({
  // Identity
  id: z.string(),
  title: z.string(),

  // Task metadata - Clean enums
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  priority: TaskPrioritySchema.optional(),

  // Organization - Renamed for clarity
  workflowState: WorkflowStateSchema,
  area: z.string(),
  tags: z.array(z.string()).optional(),

  // Assignment & Dates
  assignee: z.string().optional(),
  createdDate: z.string().datetime().optional(),
  updatedDate: z.string().datetime().optional(),
  archivedDate: z.string().datetime().optional(),

  // File system info (useful for both UI and AI)
  path: z.string(),
  filename: z.string(),
});

// =============================================================================
// Task Sections Schema
// =============================================================================

export const TaskSectionsSchema = z.object({
  instruction: z.string().optional(),
  tasks: z.string().optional(), // Markdown checklist
  deliverable: z.string().optional(),
  log: z.string().optional(),
});

// =============================================================================
// Discriminated Task Types
// =============================================================================

// Simple standalone task
export const SimpleTaskSchema = TaskBaseSchema.extend({
  taskStructure: z.literal('simple'),
  content: z.string().optional(), // Sections only, no title/frontmatter
  sections: TaskSectionsSchema.optional(),
});

// Subtask within a parent
export const SubTaskSchema = TaskBaseSchema.extend({
  taskStructure: z.literal('subtask'),
  parentId: z.string(),
  sequenceNumber: z.string(), // "01", "02", "03a", etc.
  content: z.string().optional(), // Sections only, no title/frontmatter
  sections: TaskSectionsSchema.optional(),
});

// Parent task with progress
export const ParentTaskProgressSchema = z.object({
  total: z.number(),
  completed: z.number(),
  percentage: z.number(),
});

export const ParentTaskSchema = TaskBaseSchema.extend({
  taskStructure: z.literal('parent'),
  progress: ParentTaskProgressSchema,
  subtaskIds: z.array(z.string()),
  content: z.string().optional(), // Overview sections only, no title/frontmatter
  sections: TaskSectionsSchema.optional(),
  subtasks: z.array(SubTaskSchema).optional(), // Full subtasks when requested
});

// Union type for all tasks
export const TaskSchema = z.discriminatedUnion('taskStructure', [
  SimpleTaskSchema,
  SubTaskSchema,
  ParentTaskSchema,
]);

// =============================================================================
// Input Schemas
// =============================================================================

// Common session context
export const SessionContextSchema = z.object({
  rootDir: z.string().optional().describe('Project root directory (overrides session default)'),
});

// Shared filtering options for list endpoints
export const ListFilterSchema = z.object({
  // Top-level filters (commonly used, AI-friendly)
  workflowState: z.union([WorkflowStateInputSchema, z.array(WorkflowStateInputSchema)]).optional(),
  area: z.string().optional(),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Advanced filtering for complex queries
  // TODO: Implement advanced filtering in handlers - currently for schema reference only
  advancedFilter: z
    .object({
      // Multi-value filters
      status: z.union([TaskStatusInputSchema, z.array(TaskStatusInputSchema)]).optional(),
      type: z.union([TaskTypeInputSchema, z.array(TaskTypeInputSchema)]).optional(),
      priority: z.union([TaskPriorityInputSchema, z.array(TaskPriorityInputSchema)]).optional(),

      // Complex tag filtering
      tagFilter: z
        .object({
          any: z.array(z.string()).optional(), // Match any of these tags (OR logic)
          all: z.array(z.string()).optional(), // Must have all these tags (AND logic)
          none: z.array(z.string()).optional(), // Must not have any of these tags
        })
        .optional(),

      // Date range filtering
      dateRange: z
        .object({
          createdAfter: z.string().datetime().optional(),
          createdBefore: z.string().datetime().optional(),
          updatedSince: z.string().datetime().optional(),
          updatedBefore: z.string().datetime().optional(),
        })
        .optional(),

      // Future metadata filters can be added here without breaking schema
      // customFields: z.record(z.any()).optional()
    })
    .optional()
    .describe('Advanced filtering options - TODO: Implementation pending'),
});

// task_list input
export const TaskListInputSchema = ListFilterSchema.merge(SessionContextSchema).extend({
  // Simple filters for common cases (AI-friendly)
  type: TaskTypeInputSchema.optional().describe(
    'Filter by single task type - use advancedFilter.type for multiple types'
  ),
  status: TaskStatusInputSchema.optional().describe(
    'Filter by single status - use advancedFilter.status for multiple statuses'
  ),

  // Task structure filtering
  taskType: z
    .enum(['simple', 'parent', 'subtask', 'top-level', 'all'])
    .default('top-level')
    .describe('Filter by task structure: top-level returns simple + parent tasks (no subtasks)'),

  // Token optimization flags
  includeCompleted: z
    .boolean()
    .default(false)
    .describe('Include done/archived tasks (increases response size)'),
  includeArchived: z.boolean().default(false).describe('Include archived workflow state'),
  includeContent: z.boolean().default(false).describe('Include full content (high token cost)'),
  includeParentTasks: z.boolean().optional().describe('Explicitly include/exclude parent tasks'),
});

// task_get input
export const TaskGetInputSchema = SessionContextSchema.extend({
  id: z.string(),
  parentId: z.string().optional().describe('Parent ID for subtask resolution'),
});

// parent_list input
export const ParentListInputSchema = ListFilterSchema.merge(SessionContextSchema).extend({
  // Progress is always included for parent tasks
  includeProgress: z
    .boolean()
    .default(true)
    .describe('Include progress stats (included by default)'),
  includeSubtasks: z
    .boolean()
    .default(false)
    .describe('Include full subtask objects (high token cost)'),
});

// parent_get input
export const ParentGetInputSchema = SessionContextSchema.extend({
  id: z.string(),
});

// =============================================================================
// Output Schemas
// =============================================================================

export const TaskListOutputSchema = createResponseSchema(z.array(TaskSchema));
export const TaskGetOutputSchema = createResponseSchema(TaskSchema);
export const ParentListOutputSchema = createResponseSchema(z.array(ParentTaskSchema));

// Extended parent task detail for parent_get
export const ParentTaskDetailSchema = ParentTaskSchema.extend({
  subtasks: z.array(SubTaskSchema), // Always included
  supportingFiles: z.array(z.string()).optional(), // Other files in parent folder
});

export const ParentGetOutputSchema = createResponseSchema(ParentTaskDetailSchema);

// =============================================================================
// Type Exports (inferred from Zod schemas)
// =============================================================================

export type TaskType = z.infer<typeof TaskTypeSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;
export type TaskStructure = z.infer<typeof TaskStructureSchema>;

export type Task = z.infer<typeof TaskSchema>;
export type SimpleTask = z.infer<typeof SimpleTaskSchema>;
export type SubTask = z.infer<typeof SubTaskSchema>;
export type ParentTask = z.infer<typeof ParentTaskSchema>;
export type ParentTaskDetail = z.infer<typeof ParentTaskDetailSchema>;

export type TaskListInput = z.infer<typeof TaskListInputSchema>;
export type TaskGetInput = z.infer<typeof TaskGetInputSchema>;
export type ParentListInput = z.infer<typeof ParentListInputSchema>;
export type ParentGetInput = z.infer<typeof ParentGetInputSchema>;

export type TaskListOutput = z.infer<typeof TaskListOutputSchema>;
export type TaskGetOutput = z.infer<typeof TaskGetOutputSchema>;
export type ParentListOutput = z.infer<typeof ParentListOutputSchema>;
export type ParentGetOutput = z.infer<typeof ParentGetOutputSchema>;

// =============================================================================
// Write Operation Input Schemas
// =============================================================================

// Base schema for all write operations
export const WriteOperationContextSchema = z.object({
  rootDir: z.string().optional().describe('Project root directory (overrides session default)'),
});

// task_create input schema
export const TaskCreateInputSchema = WriteOperationContextSchema.extend({
  // Required fields
  title: z.string().min(1).max(200),
  type: TaskTypeInputSchema, // Uses flexible input schema

  // Optional metadata - using normalized field names
  area: z.string().default('general'),
  status: TaskStatusInputSchema.default('todo'),
  priority: TaskPriorityInputSchema.default('medium'),
  workflowState: WorkflowStateInputSchema.default('backlog'),

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
    priority: TaskPrioritySchema.optional(),
    workflowState: WorkflowStateSchema,
    area: z.string(),
    path: z.string(),
    createdAt: z.string().datetime(),
  })
);

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

// Minimal update response schema - for token efficiency
export const MinimalUpdateResponseSchema = z.object({
  id: z.string(),
  updatedFields: z.array(z.string()).describe('List of fields that were updated'),
  timestamp: z.string().datetime(),
});

// task_update output schema
export const TaskUpdateOutputSchema = createResponseSchema(MinimalUpdateResponseSchema);

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

// task_move input schema
export const TaskMoveInputSchema = WriteOperationContextSchema.extend({
  id: z.string(),
  parentId: z.string().optional(),
  targetState: WorkflowStateSchema,
  archiveDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional()
    .describe('Required for archive moves (YYYY-MM format)'),
  updateStatus: z
    .boolean()
    .default(true)
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

// task_transform input schema
export const TaskTransformInputSchema = WriteOperationContextSchema.extend({
  id: z.string(),
  operation: z.enum(['promote', 'extract', 'adopt']),

  // Operation-specific fields
  parentId: z.string().optional().describe('Required for extract operation'),
  targetParentId: z.string().optional().describe('Required for adopt operation'),
  initialSubtasks: z
    .array(z.string())
    .optional()
    .describe('For promote: checklist items to convert to subtasks'),
  sequence: z
    .string()
    .regex(/^\d{2}$/)
    .optional()
    .describe('For adopt: sequence number'),
  after: z.string().optional().describe('For adopt: insert after this subtask'),
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
  overviewContent: z
    .string()
    .optional()
    .describe('Initial content for overview instruction section'),

  // Initial subtasks
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1),
        type: TaskTypeSchema.optional(),
        sequence: z
          .string()
          .regex(/^\d{2}$/)
          .optional(),
        parallelWith: z.string().optional(),
      })
    )
    .optional(),

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
    createdSubtasks: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          sequence: z.string(),
        })
      )
      .optional(),
  })
);

// parent_operations input schema
export const ParentOperationsInputSchema = WriteOperationContextSchema.extend({
  parentId: z.string(),
  operation: z.enum(['resequence', 'parallelize', 'add_subtask']),

  // Operation-specific fields with discriminated union
  operationData: z.discriminatedUnion('operation', [
    // Resequence operation
    z.object({
      operation: z.literal('resequence'),
      sequenceMap: z
        .array(
          z.object({
            id: z.string(),
            sequence: z.string().regex(/^\d{2}$/),
          })
        )
        .min(1),
    }),

    // Parallelize operation
    z.object({
      operation: z.literal('parallelize'),
      subtaskIds: z.array(z.string()).min(2),
      targetSequence: z
        .string()
        .regex(/^\d{2}$/)
        .optional(),
    }),

    // Add subtask operation
    z.object({
      operation: z.literal('add_subtask'),
      subtask: z.object({
        title: z.string().min(1),
        type: TaskTypeSchema.optional(),
        after: z.string().optional(),
        sequence: z
          .string()
          .regex(/^\d{2}$/)
          .optional(),
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
    affectedSubtasks: z.array(
      z.object({
        id: z.string(),
        previousSequence: z.string().optional(),
        currentSequence: z.string(),
      })
    ),
    newSubtask: SubTaskSchema.optional(),
  })
);

// =============================================================================
// Write Operation Type Exports
// =============================================================================

export type TaskCreateInput = z.infer<typeof TaskCreateInputSchema>;
export type TaskCreateOutput = z.infer<typeof TaskCreateOutputSchema>;
export type TaskUpdateInput = z.infer<typeof TaskUpdateInputSchema>;
export type TaskUpdateOutput = z.infer<typeof TaskUpdateOutputSchema>;
export type TaskDeleteInput = z.infer<typeof TaskDeleteInputSchema>;
export type TaskDeleteOutput = z.infer<typeof TaskDeleteOutputSchema>;
export type TaskMoveInput = z.infer<typeof TaskMoveInputSchema>;
export type TaskMoveOutput = z.infer<typeof TaskMoveOutputSchema>;
export type TaskTransformInput = z.infer<typeof TaskTransformInputSchema>;
export type TaskTransformOutput = z.infer<typeof TaskTransformOutputSchema>;
export type ParentCreateInput = z.infer<typeof ParentCreateInputSchema>;
export type ParentCreateOutput = z.infer<typeof ParentCreateOutputSchema>;
export type ParentOperationsInput = z.infer<typeof ParentOperationsInputSchema>;
export type ParentOperationsOutput = z.infer<typeof ParentOperationsOutputSchema>;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Type guard to check if a task is a parent task
 */
export function isParentTask(task: Task): task is ParentTask {
  return task.taskStructure === 'parent';
}

/**
 * Type guard to check if a task is a subtask
 */
export function isSubTask(task: Task): task is SubTask {
  return task.taskStructure === 'subtask';
}

/**
 * Type guard to check if a task is a simple task
 */
export function isSimpleTask(task: Task): task is SimpleTask {
  return task.taskStructure === 'simple';
}
