/**
 * MCP API Response Schemas using Zod
 * 
 * This file implements the normalized API schema design from api-schema-design-v2.md
 * Single source of truth for TypeScript types, runtime validation, and MCP outputSchema
 */

import { z } from 'zod';

// =============================================================================
// Core Enums - Clean values without display formatting
// =============================================================================

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

// =============================================================================
// Response Envelope
// =============================================================================

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

// =============================================================================
// Task Sections Schema
// =============================================================================

export const TaskSectionsSchema = z.object({
  instruction: z.string().optional(),
  tasks: z.string().optional(),      // Markdown checklist
  deliverable: z.string().optional(),
  log: z.string().optional()
});

// =============================================================================
// Discriminated Task Types
// =============================================================================

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

// =============================================================================
// Input Schemas
// =============================================================================

// Common session context
export const SessionContextSchema = z.object({
  rootDir: z.string().optional()
    .describe('Project root directory (overrides session default)')
});

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

// task_list input
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

// task_get input
export const TaskGetInputSchema = SessionContextSchema.extend({
  id: z.string(),
  format: z.enum(['summary', 'full']).default('summary')
    .describe('summary = metadata only, full = include content'),
  parentId: z.string().optional()
    .describe('Parent ID for subtask resolution')
});

// parent_list input
export const ParentListInputSchema = ListFilterSchema.merge(SessionContextSchema).extend({
  // Progress is always included for parent tasks
  includeProgress: z.boolean().default(true)
    .describe('Include progress stats (included by default)'),
  includeSubtasks: z.boolean().default(false)
    .describe('Include full subtask objects (high token cost)')
});

// parent_get input
export const ParentGetInputSchema = SessionContextSchema.extend({
  id: z.string()
});

// =============================================================================
// Output Schemas
// =============================================================================

export const TaskListOutputSchema = createResponseSchema(z.array(TaskSchema));
export const TaskGetOutputSchema = createResponseSchema(TaskSchema);
export const ParentListOutputSchema = createResponseSchema(z.array(ParentTaskSchema));

// Extended parent task detail for parent_get
export const ParentTaskDetailSchema = ParentTaskSchema.extend({
  subtasks: z.array(SubTaskSchema),         // Always included
  supportingFiles: z.array(z.string()).optional()  // Other files in parent folder
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