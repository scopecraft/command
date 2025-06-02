/**
 * MCP Output Schema Generation
 *
 * Generates JSON Schema for MCP outputSchema from Zod schemas
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  ParentGetInputSchema,
  ParentGetOutputSchema,
  ParentListInputSchema,
  ParentListOutputSchema,
  TaskGetInputSchema,
  TaskGetOutputSchema,
  TaskListInputSchema,
  TaskListOutputSchema,
} from './schemas.js';

// =============================================================================
// Input Schemas for MCP Tool Definitions
// =============================================================================

export const taskListInputJsonSchema = zodToJsonSchema(
  TaskListInputSchema.describe('Input parameters for task_list method'),
  { name: 'TaskListInput' }
);

export const taskGetInputJsonSchema = zodToJsonSchema(
  TaskGetInputSchema.describe('Input parameters for task_get method'),
  { name: 'TaskGetInput' }
);

export const parentListInputJsonSchema = zodToJsonSchema(
  ParentListInputSchema.describe('Input parameters for parent_list method'),
  { name: 'ParentListInput' }
);

export const parentGetInputJsonSchema = zodToJsonSchema(
  ParentGetInputSchema.describe('Input parameters for parent_get method'),
  { name: 'ParentGetInput' }
);

// =============================================================================
// Output Schemas for MCP Tool Definitions
// =============================================================================

export const taskListOutputJsonSchema = zodToJsonSchema(
  TaskListOutputSchema.describe('Response format for task_list method'),
  { name: 'TaskListOutput' }
);

export const taskGetOutputJsonSchema = zodToJsonSchema(
  TaskGetOutputSchema.describe('Response format for task_get method'),
  { name: 'TaskGetOutput' }
);

export const parentListOutputJsonSchema = zodToJsonSchema(
  ParentListOutputSchema.describe('Response format for parent_list method'),
  { name: 'ParentListOutput' }
);

export const parentGetOutputJsonSchema = zodToJsonSchema(
  ParentGetOutputSchema.describe('Response format for parent_get method'),
  { name: 'ParentGetOutput' }
);

// =============================================================================
// MCP Tool Definitions with Schema Integration
// =============================================================================

export const mcpToolDefinitions = {
  task_list: {
    name: 'task_list',
    description:
      'List tasks with filters and token-efficient options. Returns metadata for browsing.',
    inputSchema: taskListInputJsonSchema,
    outputSchema: taskListOutputJsonSchema,
  },

  task_get: {
    name: 'task_get',
    description:
      'Get single task details. For parent tasks, use parent_get for full context with subtasks.',
    inputSchema: taskGetInputJsonSchema,
    outputSchema: taskGetOutputJsonSchema,
  },

  parent_list: {
    name: 'parent_list',
    description:
      'List parent tasks with progress information. Optimized for browsing parent tasks.',
    inputSchema: parentListInputJsonSchema,
    outputSchema: parentListOutputJsonSchema,
  },

  parent_get: {
    name: 'parent_get',
    description:
      'Get complete parent task context including all subtasks. High token cost but comprehensive.',
    inputSchema: parentGetInputJsonSchema,
    outputSchema: parentGetOutputJsonSchema,
  },
} as const;
