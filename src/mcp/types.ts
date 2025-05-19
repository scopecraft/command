/**
 * Types specific to the MCP server
 */
import {
  Area,
  AreaFilterOptions,
  AreaUpdateOptions,
  Feature,
  FeatureFilterOptions,
  FeatureUpdateOptions,
  Phase,
  Task,
  type TaskFilterOptions,
  type TaskUpdateOptions,
} from '../core/types.js';

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

  // Phase methods
  PHASE_LIST = 'phase_list',
  PHASE_CREATE = 'phase_create',
  PHASE_UPDATE = 'phase_update',
  PHASE_DELETE = 'phase_delete',

  // Feature methods
  FEATURE_LIST = 'feature_list',
  FEATURE_GET = 'feature_get',
  FEATURE_CREATE = 'feature_create',
  FEATURE_UPDATE = 'feature_update',
  FEATURE_DELETE = 'feature_delete',

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
export interface TaskListParams extends TaskFilterOptions {
  format?: string;
  include_content?: boolean; // Controls whether task content is included in the response (default: false)
  include_completed?: boolean; // Controls whether completed tasks are included in the response (default: false)
  root_dir?: string; // Override for tasks directory location
}

// Task get request params
export interface TaskGetParams {
  id: string;
  format?: string;
  phase?: string;
  subdirectory?: string;
  root_dir?: string; // Override for tasks directory location
}

// Task create request params
export interface TaskCreateParams {
  root_dir?: string; // Override for tasks directory location
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
  root_dir?: string; // Override for tasks directory location
  id: string;
  updates: TaskUpdateOptions;
  phase?: string;
  subdirectory?: string;
}

// Task delete request params
export interface TaskDeleteParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  phase?: string;
  subdirectory?: string;
}

// Task move request params
export interface TaskMoveParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  target_subdirectory: string;
  phase?: string;
}

// Task next request params
export interface TaskNextParams {
  root_dir?: string; // Override for tasks directory location
  id?: string;
  format?: string;
}

// Feature list request params
export interface FeatureListParams {
  root_dir?: string; // Override for tasks directory location
  phase?: string;
  status?: string;
  format?: string;
  include_tasks?: boolean;
  include_progress?: boolean;
}

// Feature get request params
export interface FeatureGetParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  phase?: string;
  format?: string;
}

// Feature create request params
export interface FeatureCreateParams {
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

// Feature update request params
export interface FeatureUpdateParams {
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

// Feature delete request params
export interface FeatureDeleteParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  phase?: string;
  force?: boolean;
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

// Phase list request params
export interface PhaseListParams {
  root_dir?: string; // Override for tasks directory location
  format?: string;
}

// Phase create request params
export interface PhaseCreateParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  name: string;
  description?: string;
  status?: string;
  order?: number;
}

// Phase update request params
export interface PhaseUpdateParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
  updates: {
    id?: string;
    name?: string;
    description?: string;
    status?: string;
    order?: number;
  };
}

// Phase delete request params
export interface PhaseDeleteParams {
  root_dir?: string; // Override for tasks directory location
  id: string;
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
