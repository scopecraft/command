/**
 * Types specific to the MCP server
 */
import { Task, Phase, TaskFilterOptions, TaskUpdateOptions } from '../core/types.js';

// MCP method names
export enum McpMethod {
  // Task methods
  TASK_LIST = 'task.list',
  TASK_GET = 'task.get',
  TASK_CREATE = 'task.create',
  TASK_UPDATE = 'task.update',
  TASK_DELETE = 'task.delete',
  TASK_NEXT = 'task.next',
  
  // Phase methods
  PHASE_LIST = 'phase.list',
  PHASE_CREATE = 'phase.create',
  
  // Workflow methods
  WORKFLOW_CURRENT = 'workflow.current',
  WORKFLOW_MARK_COMPLETE_NEXT = 'workflow.markCompleteNext'
}

// Base request interface
export interface McpRequest<T = any> {
  method: McpMethod;
  params: T;
}

// Base response interface
export interface McpResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Task list request params
export interface TaskListParams extends TaskFilterOptions {
  format?: string;
}

// Task get request params
export interface TaskGetParams {
  id: string;
  format?: string;
  phase?: string;
  subdirectory?: string;
}

// Task create request params
export interface TaskCreateParams {
  id?: string;
  title: string;
  type: string;
  status?: string;
  priority?: string;
  assignee?: string;
  phase?: string;
  subdirectory?: string;
  parent?: string;
  depends?: string[];
  previous?: string;
  next?: string;
  tags?: string[];
  content?: string;
}

// Task update request params
export interface TaskUpdateParams {
  id: string;
  updates: TaskUpdateOptions;
  phase?: string;
  subdirectory?: string;
}

// Task delete request params
export interface TaskDeleteParams {
  id: string;
  phase?: string;
  subdirectory?: string;
}

// Task next request params
export interface TaskNextParams {
  id?: string;
  format?: string;
}

// Phase list request params
export interface PhaseListParams {
  format?: string;
}

// Phase create request params
export interface PhaseCreateParams {
  id: string;
  name: string;
  description?: string;
  status?: string;
  order?: number;
}

// Workflow current request params
export interface WorkflowCurrentParams {
  format?: string;
}

// Workflow mark complete next request params
export interface WorkflowMarkCompleteNextParams {
  id: string;
  format?: string;
}

// MCP method handler type
export type McpMethodHandler<T = any, R = any> = (params: T) => Promise<McpResponse<R>>;

// Registry of method handlers
export interface McpMethodRegistry {
  [key: string]: McpMethodHandler;
}