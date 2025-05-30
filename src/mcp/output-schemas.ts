/**
 * MCP Output Schema Generation
 * 
 * Generates JSON Schema for MCP outputSchema from Zod schemas
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  TaskListOutputSchema,
  TaskGetOutputSchema,
  ParentListOutputSchema,
  ParentGetOutputSchema,
  TaskListInputSchema,
  TaskGetInputSchema,
  ParentListInputSchema,
  ParentGetInputSchema
} from './schemas.js';

// =============================================================================
// Input Schemas for MCP Tool Definitions
// =============================================================================

export const taskListInputJsonSchema = zodToJsonSchema(TaskListInputSchema, {
  name: 'TaskListInput',
  description: 'Input parameters for task_list method'
});

export const taskGetInputJsonSchema = zodToJsonSchema(TaskGetInputSchema, {
  name: 'TaskGetInput', 
  description: 'Input parameters for task_get method'
});

export const parentListInputJsonSchema = zodToJsonSchema(ParentListInputSchema, {
  name: 'ParentListInput',
  description: 'Input parameters for parent_list method'
});

export const parentGetInputJsonSchema = zodToJsonSchema(ParentGetInputSchema, {
  name: 'ParentGetInput',
  description: 'Input parameters for parent_get method'
});

// =============================================================================
// Output Schemas for MCP Tool Definitions
// =============================================================================

export const taskListOutputJsonSchema = zodToJsonSchema(TaskListOutputSchema, {
  name: 'TaskListOutput',
  description: 'Response format for task_list method'
});

export const taskGetOutputJsonSchema = zodToJsonSchema(TaskGetOutputSchema, {
  name: 'TaskGetOutput',
  description: 'Response format for task_get method'
});

export const parentListOutputJsonSchema = zodToJsonSchema(ParentListOutputSchema, {
  name: 'ParentListOutput', 
  description: 'Response format for parent_list method'
});

export const parentGetOutputJsonSchema = zodToJsonSchema(ParentGetOutputSchema, {
  name: 'ParentGetOutput',
  description: 'Response format for parent_get method'
});

// =============================================================================
// MCP Tool Definitions with Schema Integration
// =============================================================================

export const mcpToolDefinitions = {
  task_list: {
    name: 'task_list',
    description: 'List tasks with filters and token-efficient options. Returns metadata for browsing.',
    inputSchema: taskListInputJsonSchema,
    outputSchema: taskListOutputJsonSchema
  },
  
  task_get: {
    name: 'task_get', 
    description: 'Get single task details. For parent tasks, use parent_get for full context with subtasks.',
    inputSchema: taskGetInputJsonSchema,
    outputSchema: taskGetOutputJsonSchema
  },
  
  parent_list: {
    name: 'parent_list',
    description: 'List parent tasks with progress information. Optimized for browsing parent tasks.',
    inputSchema: parentListInputJsonSchema,
    outputSchema: parentListOutputJsonSchema
  },
  
  parent_get: {
    name: 'parent_get',
    description: 'Get complete parent task context including all subtasks. High token cost but comprehensive.',
    inputSchema: parentGetInputJsonSchema,
    outputSchema: parentGetOutputJsonSchema
  }
} as const;