/**
 * Types specific to the MCP server
 */
import {
  Area,
  AreaFilterOptions,
  AreaUpdateOptions,
  Task,
  type TaskFilterOptions,
  type TaskUpdateOptions,
} from '../core/types.js';

import type {
  OperationResult,
  ParentTask,
  TaskCreateOptions,
  TaskDocument,
  TaskListOptions,
  TaskMoveOptions,
  TaskPriority,
  TaskStatus,
  TaskType,
  Task as V2Task,
  TaskUpdateOptions as V2TaskUpdateOptions,
  WorkflowState,
} from '../core/v2/types.js';

// MCP method names
export enum McpMethod {
  // Task methods
  TASK_LIST = 'task_list',
  TASK_GET = 'task_get',
  TASK_CREATE = 'task_create',
  TASK_UPDATE = 'task_update',
  TASK_DELETE = 'task_delete',
  TASK_NEXT = 'task_next',
  TASK_MOVE = 'task_move',
  TASK_TRANSFORM = 'task_transform',

  // Parent task methods
  PARENT_LIST = 'parent_list',
  PARENT_CREATE = 'parent_create',
  PARENT_OPERATIONS = 'parent_operations',

  // Area methods
  AREA_LIST = 'area_list',
  AREA_GET = 'area_get',
  AREA_CREATE = 'area_create',
  AREA_UPDATE = 'area_update',
  AREA_DELETE = 'area_delete',

  // Workflow methods
  WORKFLOW_CURRENT = 'workflow_current',
  WORKFLOW_MARK_COMPLETE_NEXT = 'workflow_mark_complete_next',

  // Template methods
  TEMPLATE_LIST = 'template_list',

  // Configuration methods
  CONFIG_INIT_ROOT = 'init_root',
  CONFIG_GET_CURRENT_ROOT = 'get_current_root',
  CONFIG_LIST_PROJECTS = 'list_projects',

  // Debug method (temporary)
  DEBUG_CODE_PATH = 'debug_code_path',
}

// Base request interface
export interface McpRequest<T = unknown> {
  method: McpMethod;
  params: T;
}

// Base response interface
export interface McpResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Task list request params
export interface TaskListParams {
  // V2 native filters
  location?: WorkflowState | WorkflowState[];
  type?: TaskType;
  status?: TaskStatus;
  area?: string;
  
  // Include options
  include_archived?: boolean;
  include_parent_tasks?: boolean;
  include_content?: boolean;
  include_completed?: boolean;
  
  // Subtask filtering
  parent_id?: string;
  
  // Custom frontmatter filters
  priority?: TaskPriority;
  assignee?: string;
  tags?: string[];
  
  format?: string;
  root_dir?: string; // Override for tasks directory location
}

// Task get request params
export interface TaskGetParams {
  id: string;
  parent_id?: string;
  format?: string;
  root_dir?: string; // Override for tasks directory location
}

// Task create request params
export interface TaskCreateParams {
  // Required fields
  title: string;
  type: TaskType;
  area?: string;
  
  // Optional metadata
  status?: TaskStatus;
  priority?: TaskPriority;
  location?: WorkflowState;
  
  // Parent/subtask relationship
  parent_id?: string;
  
  // Custom frontmatter
  assignee?: string;
  tags?: string[];
  
  // Initial content
  instruction?: string;
  tasks?: string[];
  deliverable?: string;
  
  content?: string; // Legacy support
  root_dir?: string; // Override for tasks directory location
}

// Task update request params
export interface TaskUpdateParams {
  id: string;
  parent_id?: string;
  updates: V2TaskUpdateOptions;
  root_dir?: string; // Override for tasks directory location
}

// Task delete request params
export interface TaskDeleteParams {
  id: string;
  parent_id?: string;
  cascade?: boolean;
  root_dir?: string; // Override for tasks directory location
}

// Task move request params
export interface TaskMoveParams {
  id: string;
  parent_id?: string;
  target_state: WorkflowState;
  archive_date?: string;
  update_status?: boolean;
  root_dir?: string; // Override for tasks directory location
}

// Task next request params
export interface TaskNextParams {
  root_dir?: string; // Override for tasks directory location
  id?: string;
  format?: string;
}

// Area list request params
export interface AreaListParams {
  root_dir?: string; // Override for tasks directory location
  phase?: string;
  status?: string;
  format?: string;
  include_tasks?: boolean;
  include_progress?: boolean;
}

// Area get request params
export interface AreaGetParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  phase?: string;
  format?: string;
}

// Area create request params
export interface AreaCreateParams {
  root_dir?: string; // Override for tasks directory location
  name: string;
  title: string;
  phase: string;
  type?: string;
  status?: string;
  description?: string;
  assignee?: string;
  tags?: string[];
}

// Area update request params
export interface AreaUpdateParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  updates: {
    name?: string;
    title?: string;
    description?: string;
    status?: string;
  };
  phase?: string;
}

// Area delete request params
export interface AreaDeleteParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  phase?: string;
  force?: boolean;
}

// Workflow current request params
export interface WorkflowCurrentParams {
  root_dir?: string; // Override for tasks directory location
  format?: string;
}

// Workflow mark complete next request params
export interface WorkflowMarkCompleteNextParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  format?: string;
}

// Debug code path params
export type DebugCodePathParams = Record<string, never>;

// Template list request params
export interface TemplateListParams {
  root_dir?: string; // Override for tasks directory location
  format?: string;
}

// Configuration init root request params
export interface ConfigInitRootParams {
  path: string;
}

// Configuration get current root request params
export type ConfigGetCurrentRootParams = Record<string, never>;

// Configuration list projects request params
export type ConfigListProjectsParams = Record<string, never>;

// MCP method handler type
export type McpMethodHandler<T = unknown, R = unknown> = (params: T) => Promise<McpResponse<R>>;

// Registry of method handlers
export interface McpMethodRegistry {
  [key: string]: McpMethodHandler<any, any>;
}
