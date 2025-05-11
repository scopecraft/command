/**
 * Types specific to the MCP server
 */
import { Task, Phase, TaskFilterOptions, TaskUpdateOptions } from '../core/types.js';

// MCP method names
export enum McpMethod {
  // Task methods
  TASK_LIST = 'task_list',
  TASK_GET = 'task_get',
  TASK_CREATE = 'task_create',
  TASK_UPDATE = 'task_update',
  TASK_DELETE = 'task_delete',
  TASK_NEXT = 'task_next',

  // Phase methods
  PHASE_LIST = 'phase_list',
  PHASE_CREATE = 'phase_create',

  // Workflow methods
  WORKFLOW_CURRENT = 'workflow_current',
  WORKFLOW_MARK_COMPLETE_NEXT = 'workflow_mark_complete_next',

  // Debug method (temporary)
  DEBUG_CODE_PATH = 'debug_code_path'
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
  include_content?: boolean; // Controls whether task content is included in the response (default: false)
  include_completed?: boolean; // Controls whether completed tasks are included in the response (default: false)
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

// Debug code path params
export interface DebugCodePathParams {
  // No parameters needed
}

// MCP method handler type
export type McpMethodHandler<T = any, R = any> = (params: T) => Promise<McpResponse<R>>;

// Registry of method handlers
export interface McpMethodRegistry {
  [key: string]: McpMethodHandler;
}