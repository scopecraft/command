/**
 * Types specific to the MCP server
 */
import type {
  OperationResult,
  ParentTask,
  Task,
  TaskCreateOptions,
  TaskDocument,
  TaskListOptions,
  TaskMoveOptions,
  TaskPriority,
  TaskStatus,
  TaskType,
  TaskUpdateOptions,
  WorkflowState,
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
  TASK_TRANSFORM = 'task_transform',

  // Parent task methods
  PARENT_LIST = 'parent_list',
  PARENT_GET = 'parent_get',
  PARENT_CREATE = 'parent_create',
  PARENT_OPERATIONS = 'parent_operations',

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

  // Search methods
  SEARCH = 'search',
  SEARCH_REINDEX = 'search_reindex',
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
  // Native filters
  location?: WorkflowState | WorkflowState[];
  type?: TaskType;
  task_type?: 'simple' | 'parent' | 'subtask' | 'top-level' | 'all';
  status?: TaskStatus;
  area?: string;

  // Include options
  include_archived?: boolean;
  include_parent_tasks?: boolean;
  include_content?: boolean;
  include_completed?: boolean;

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

  root_dir?: string; // Override for tasks directory location
}

// MCP task update fields (flattened for convenience)
export interface McpTaskUpdateFields {
  // Title update
  title?: string;

  // Frontmatter fields (flattened)
  status?: TaskStatus;
  priority?: TaskPriority;
  area?: string;
  assignee?: string;
  tags?: string[];

  // Section fields (flattened)
  instruction?: string;
  tasks?: string;
  deliverable?: string;
  log?: string;

  // Special convenience field
  add_log_entry?: string;
}

// Task update request params
export interface TaskUpdateParams {
  id: string;
  parent_id?: string;
  updates: McpTaskUpdateFields;
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

// Parent get request params
export interface ParentGetParams {
  id: string;
  root_dir?: string; // Override for tasks directory location
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
  [key: string]: McpMethodHandler<unknown, unknown>;
}
