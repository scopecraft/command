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
  TaskMoveParams,
  TaskNextParams,
  FeatureListParams,
  FeatureGetParams,
  FeatureCreateParams,
  FeatureUpdateParams,
  FeatureDeleteParams,
  AreaListParams,
  AreaGetParams,
  AreaCreateParams,
  AreaUpdateParams,
  AreaDeleteParams,
  PhaseListParams,
  PhaseCreateParams,
  PhaseUpdateParams,
  PhaseDeleteParams,
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
  moveTask,
  findNextTask,
  listFeatures,
  getFeature,
  createFeature,
  updateFeature,
  deleteFeature,
  listAreas,
  getArea,
  createArea,
  updateArea,
  deleteArea,
  listPhases,
  createPhase,
  updatePhase,
  deletePhase,
  Task,
  TaskMetadata,
  generateTaskId
} from '../core/index.js';

/**
 * Handler for task_list method
 */
export async function handleTaskList(params: TaskListParams) {
  // Pass all parameters to the core function
  // The core implementation now defaults to excluding content and completed tasks
  // Only when explicitly set to true will these be included
  return await listTasks({
    status: params.status,
    type: params.type,
    assignee: params.assignee,
    tags: params.tags,
    phase: params.phase,
    subdirectory: params.subdirectory,
    is_overview: params.is_overview,
    include_content: params.include_content, // Only include content when explicitly set to true
    include_completed: params.include_completed // Only include completed tasks when explicitly set to true
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
 * Handler for phase_update method
 */
export async function handlePhaseUpdate(params: PhaseUpdateParams) {
  return await updatePhase(params.id, params.updates);
}

/**
 * Handler for phase_delete method
 */
export async function handlePhaseDelete(params: PhaseDeleteParams) {
  return await deletePhase(params.id, { force: params.force });
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
  const version = '20250513-1940'; // Unique identifier for this specific version
  return {
    success: true,
    data: {
      version,
      timestamp: new Date().toISOString(),
      implemented_features: {
        task_list_content_exclusion: true,
        task_list_completed_exclusion: true,
        phase_management_complete: true,
        phase_update: true,
        phase_delete: true,
        feature_management_complete: true,
        area_management_complete: true,
        task_move: true,
        overview_file_support: true
      },
      documentation: {
        feature_area_tools: 'docs/mcp-feature-area-tool-descriptions.md'
      },
      message: "Debug code path handler is responding - this is the updated MCP server with feature/area management"
    },
    message: `Debug code path handler is responding with version ${version}`
  };
}

/**
 * Handler for task_move method
 */
export async function handleTaskMove(params: TaskMoveParams) {
  return await moveTask(params.id, params.target_subdirectory, params.phase);
}

/**
 * Handler for feature_list method
 */
export async function handleFeatureList(params: FeatureListParams) {
  return await listFeatures({
    phase: params.phase,
    status: params.status,
    include_tasks: params.include_tasks,
    include_progress: params.include_progress !== false // Default to true
  });
}

/**
 * Handler for feature_get method
 */
export async function handleFeatureGet(params: FeatureGetParams) {
  return await getFeature(params.id, params.phase);
}

/**
 * Handler for feature_create method
 */
export async function handleFeatureCreate(params: FeatureCreateParams) {
  return await createFeature(
    params.name,
    params.title,
    params.phase,
    params.type || '🌟 Feature',
    params.status || '🟡 To Do',
    params.description,
    params.assignee,
    params.tags
  );
}

/**
 * Handler for feature_update method
 */
export async function handleFeatureUpdate(params: FeatureUpdateParams) {
  return await updateFeature(
    params.id,
    params.updates,
    params.phase
  );
}

/**
 * Handler for feature_delete method
 */
export async function handleFeatureDelete(params: FeatureDeleteParams) {
  return await deleteFeature(params.id, params.phase, params.force);
}

/**
 * Handler for area_list method
 */
export async function handleAreaList(params: AreaListParams) {
  return await listAreas({
    phase: params.phase,
    status: params.status,
    include_tasks: params.include_tasks,
    include_progress: params.include_progress !== false // Default to true
  });
}

/**
 * Handler for area_get method
 */
export async function handleAreaGet(params: AreaGetParams) {
  return await getArea(params.id, params.phase);
}

/**
 * Handler for area_create method
 */
export async function handleAreaCreate(params: AreaCreateParams) {
  return await createArea(
    params.name,
    params.title,
    params.phase,
    params.type || '🧹 Chore',
    params.status || '🟡 To Do',
    params.description,
    params.assignee,
    params.tags
  );
}

/**
 * Handler for area_update method
 */
export async function handleAreaUpdate(params: AreaUpdateParams) {
  return await updateArea(
    params.id,
    params.updates,
    params.phase
  );
}

/**
 * Handler for area_delete method
 */
export async function handleAreaDelete(params: AreaDeleteParams) {
  return await deleteArea(params.id, params.phase, params.force);
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
  [McpMethod.TASK_MOVE]: handleTaskMove,
  [McpMethod.FEATURE_LIST]: handleFeatureList,
  [McpMethod.FEATURE_GET]: handleFeatureGet,
  [McpMethod.FEATURE_CREATE]: handleFeatureCreate,
  [McpMethod.FEATURE_UPDATE]: handleFeatureUpdate,
  [McpMethod.FEATURE_DELETE]: handleFeatureDelete,
  [McpMethod.AREA_LIST]: handleAreaList,
  [McpMethod.AREA_GET]: handleAreaGet,
  [McpMethod.AREA_CREATE]: handleAreaCreate,
  [McpMethod.AREA_UPDATE]: handleAreaUpdate,
  [McpMethod.AREA_DELETE]: handleAreaDelete,
  [McpMethod.PHASE_LIST]: handlePhaseList,
  [McpMethod.PHASE_CREATE]: handlePhaseCreate,
  [McpMethod.PHASE_UPDATE]: handlePhaseUpdate,
  [McpMethod.PHASE_DELETE]: handlePhaseDelete,
  [McpMethod.WORKFLOW_CURRENT]: handleWorkflowCurrent,
  [McpMethod.WORKFLOW_MARK_COMPLETE_NEXT]: handleWorkflowMarkCompleteNext,
  [McpMethod.DEBUG_CODE_PATH]: handleDebugCodePath
};