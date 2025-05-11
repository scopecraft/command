/**
 * MCP method handlers
 * Each handler implements a specific MCP method
 */
import {
  McpMethodRegistry,
  McpMethod,
  TaskListParams,
  TaskGetParams,
  TaskCreateParams,
  TaskUpdateParams,
  TaskDeleteParams,
  TaskNextParams,
  PhaseListParams,
  PhaseCreateParams,
  WorkflowCurrentParams,
  WorkflowMarkCompleteNextParams,
  DebugCodePathParams
} from './types.js';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  findNextTask,
  listPhases,
  createPhase,
  Task,
  TaskMetadata,
  generateTaskId
} from '../core/index.js';

/**
 * Handler for task_list method
 */
export async function handleTaskList(params: TaskListParams) {
  // Pass all parameters to the core function, including the include_content parameter
  // By default, set include_content to false for MCP to reduce token usage unless explicitly requested
  // By default, also exclude completed tasks to further reduce response size
  return await listTasks({
    status: params.status,
    type: params.type,
    assignee: params.assignee,
    tags: params.tags,
    phase: params.phase,
    subdirectory: params.subdirectory,
    is_overview: params.is_overview,
    include_content: params.include_content ?? false, // Default to false for MCP to optimize token usage
    include_completed: params.include_completed ?? false // Default to false to exclude completed tasks
  });
}

/**
 * Handler for task_get method
 */
export async function handleTaskGet(params: TaskGetParams) {
  return await getTask(params.id, params.phase, params.subdirectory);
}

/**
 * Handler for task_create method
 */
export async function handleTaskCreate(params: TaskCreateParams) {
  // Create the task object from the parameters
  const metadata: TaskMetadata = {
    id: params.id || generateTaskId(),
    title: params.title,
    type: params.type,
    status: params.status || '🟡 To Do',
    priority: params.priority || '▶️ Medium',
    created_date: new Date().toISOString().split('T')[0],
    updated_date: new Date().toISOString().split('T')[0],
    assigned_to: params.assignee || '',
  };

  // Add optional fields
  if (params.phase) metadata.phase = params.phase;
  if (params.subdirectory) metadata.subdirectory = params.subdirectory;
  if (params.parent) metadata.parent_task = params.parent;
  if (params.depends) metadata.depends_on = params.depends;
  if (params.previous) metadata.previous_task = params.previous;
  if (params.next) metadata.next_task = params.next;
  if (params.tags) metadata.tags = params.tags;

  // Handle special case for _overview.md files
  const isOverview =
    params.id === '_overview' ||
    (params.id && params.id.endsWith('/_overview'));

  if (isOverview) {
    metadata.is_overview = true;
  }

  const task: Task = {
    metadata,
    content: params.content || `## ${params.title}\n\n${isOverview ? 'Overview of this feature.\n\n## Tasks\n\n- [ ] Task 1\n' : 'Task description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n'}`
  };

  return await createTask(task, params.subdirectory);
}

/**
 * Handler for task_update method
 */
export async function handleTaskUpdate(params: TaskUpdateParams) {
  return await updateTask(params.id, params.updates, params.phase, params.subdirectory);
}

/**
 * Handler for task_delete method
 */
export async function handleTaskDelete(params: TaskDeleteParams) {
  return await deleteTask(params.id, params.phase, params.subdirectory);
}

/**
 * Handler for task_next method
 */
export async function handleTaskNext(params: TaskNextParams) {
  return await findNextTask(params.id);
}

/**
 * Handler for phase_list method
 */
export async function handlePhaseList(params: PhaseListParams) {
  return await listPhases();
}

/**
 * Handler for phase_create method
 */
export async function handlePhaseCreate(params: PhaseCreateParams) {
  const phase = {
    id: params.id,
    name: params.name,
    description: params.description,
    status: params.status || '🟡 Pending',
    order: params.order,
    tasks: []
  };
  
  return await createPhase(phase);
}

/**
 * Handler for workflow_current method
 */
export async function handleWorkflowCurrent(params: WorkflowCurrentParams) {
  const inProgressResult = await listTasks({ status: '🔵 In Progress' });
  
  if (!inProgressResult.success) {
    return inProgressResult;
  }
  
  if (inProgressResult.data && inProgressResult.data.length === 0) {
    // Try alternative status text
    const alternativeResult = await listTasks({ status: 'In Progress' });
    
    if (!alternativeResult.success) {
      return alternativeResult;
    }
    
    return alternativeResult;
  }
  
  return inProgressResult;
}

/**
 * Handler for workflow_mark_complete_next method
 */
export async function handleWorkflowMarkCompleteNext(params: WorkflowMarkCompleteNextParams) {
  // Get the next task before marking current as complete
  const nextTaskResult = await findNextTask(params.id);
  
  // Mark current task as complete
  const updateResult = await updateTask(params.id, { metadata: { status: '🟢 Done' } });
  
  if (!updateResult.success) {
    return updateResult;
  }
  
  if (!nextTaskResult.success) {
    return {
      success: true,
      data: { updated: updateResult.data, next: null },
      message: `Task ${params.id} marked as Done. Error finding next task: ${nextTaskResult.error}`
    };
  }
  
  return {
    success: true,
    data: { updated: updateResult.data, next: nextTaskResult.data },
    message: updateResult.message
  };
}

/**
 * Handler for debug_code_path method
 * This is a diagnostic handler to verify which version of the code is running
 */
export async function handleDebugCodePath(params: DebugCodePathParams) {
  const version = '20250511-1625'; // Unique identifier for this specific version
  return {
    success: true,
    data: {
      version,
      timestamp: new Date().toISOString(),
      implemented_features: {
        task_list_content_exclusion: true,
        task_list_completed_exclusion: true
      },
      message: "Debug code path handler is responding - this is the updated MCP server"
    },
    message: `Debug code path handler is responding with version ${version}`
  };
}

/**
 * Registry of all MCP method handlers
 */
export const methodRegistry: McpMethodRegistry = {
  [McpMethod.TASK_LIST]: handleTaskList,
  [McpMethod.TASK_GET]: handleTaskGet,
  [McpMethod.TASK_CREATE]: handleTaskCreate,
  [McpMethod.TASK_UPDATE]: handleTaskUpdate,
  [McpMethod.TASK_DELETE]: handleTaskDelete,
  [McpMethod.TASK_NEXT]: handleTaskNext,
  [McpMethod.PHASE_LIST]: handlePhaseList,
  [McpMethod.PHASE_CREATE]: handlePhaseCreate,
  [McpMethod.WORKFLOW_CURRENT]: handleWorkflowCurrent,
  [McpMethod.WORKFLOW_MARK_COMPLETE_NEXT]: handleWorkflowMarkCompleteNext,
  [McpMethod.DEBUG_CODE_PATH]: handleDebugCodePath
};