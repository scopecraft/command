import { ConfigurationManager } from '../core/config/configuration-manager.js';
import {
  type Task,
  type TaskMetadata,
  createArea,
  createFeature,
  createPhase,
  createTask,
  deleteArea,
  deleteFeature,
  deletePhase,
  deleteTask,
  findNextTask,
  getArea,
  getFeature,
  getTask,
  listAreas,
  listFeatures,
  listPhases,
  listTasks,
  listTemplates,
  moveTask,
  normalizePhaseStatus,
  normalizePriority,
  normalizeTaskStatus,
  updateArea,
  updateFeature,
  updatePhase,
  updateTask,
} from '../core/index.js';
/**
 * MCP method handlers
 * Each handler implements a specific MCP method
 */
import {
  type AreaCreateParams,
  type AreaDeleteParams,
  type AreaGetParams,
  type AreaListParams,
  type AreaUpdateParams,
  type ConfigGetCurrentRootParams,
  type ConfigInitRootParams,
  type ConfigListProjectsParams,
  type DebugCodePathParams,
  type FeatureCreateParams,
  type FeatureDeleteParams,
  type FeatureGetParams,
  type FeatureListParams,
  type FeatureUpdateParams,
  McpMethod,
  type McpMethodRegistry,
  type PhaseCreateParams,
  type PhaseDeleteParams,
  type PhaseListParams,
  type PhaseUpdateParams,
  type TaskCreateParams,
  type TaskDeleteParams,
  type TaskGetParams,
  type TaskListParams,
  type TaskMoveParams,
  type TaskNextParams,
  type TaskUpdateParams,
  type TemplateListParams,
  type WorkflowCurrentParams,
  type WorkflowMarkCompleteNextParams,
} from './types.js';

/**
 * Handler for task_list method
 */
export async function handleTaskList(params: TaskListParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  // Pass all parameters to the core function, including runtime config
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
    include_completed: params.include_completed, // Only include completed tasks when explicitly set to true
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for task_get method
 */
export async function handleTaskGet(params: TaskGetParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await getTask(params.id, { 
    phase: params.phase, 
    subdirectory: params.subdirectory,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for task_create method
 */
export async function handleTaskCreate(params: TaskCreateParams) {
  // Create the task object from the parameters with normalization
  const metadata: TaskMetadata = {
    id: params.id || '', // Let task-crud generate the ID
    title: params.title,
    type: params.type,
    status: normalizeTaskStatus(params.status || '🟡 To Do'),
    priority: normalizePriority(params.priority || '▶️ Medium'),
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
  const isOverview = params.id === '_overview' || params.id?.endsWith('/_overview');

  if (isOverview) {
    metadata.is_overview = true;
  }

  const task: Task = {
    metadata,
    content:
      params.content ||
      `## ${params.title}\n\n${isOverview ? 'Overview of this feature.\n\n## Tasks\n\n- [ ] Task 1\n' : 'Task description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n'}`,
  };

  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await createTask(task, { 
    subdirectory: params.subdirectory,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for task_update method
 */
export async function handleTaskUpdate(params: TaskUpdateParams) {
  // Normalize status and priority values if provided
  const updates = { ...params.updates };

  // Normalize direct property updates
  if (updates.status !== undefined) {
    updates.status = normalizeTaskStatus(updates.status);
  }

  if (updates.priority !== undefined) {
    updates.priority = normalizePriority(updates.priority);
  }

  // Normalize metadata property updates if present
  if (updates.metadata) {
    if (updates.metadata.status !== undefined) {
      updates.metadata.status = normalizeTaskStatus(updates.metadata.status);
    }

    if (updates.metadata.priority !== undefined) {
      updates.metadata.priority = normalizePriority(updates.metadata.priority);
    }
  }

  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await updateTask(params.id, updates, { 
    phase: params.phase, 
    subdirectory: params.subdirectory,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for task_delete method
 */
export async function handleTaskDelete(params: TaskDeleteParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await deleteTask(params.id, { 
    phase: params.phase, 
    subdirectory: params.subdirectory,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for task_next method
 */
export async function handleTaskNext(params: TaskNextParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await findNextTask(params.id, { config });
}

/**
 * Handler for phase_list method
 */
export async function handlePhaseList(params: PhaseListParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await listPhases({ config });
}

/**
 * Handler for phase_create method
 */
export async function handlePhaseCreate(params: PhaseCreateParams) {
  const phase = {
    id: params.id,
    name: params.name,
    description: params.description,
    status: normalizePhaseStatus(params.status || '🟡 Pending'),
    order: params.order,
    tasks: [],
  };

  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await createPhase(phase, { config });
}

/**
 * Handler for phase_update method
 */
export async function handlePhaseUpdate(params: PhaseUpdateParams) {
  // Normalize phase status if provided
  const updates = { ...params.updates };

  if (updates.status !== undefined) {
    updates.status = normalizePhaseStatus(updates.status);
  }

  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await updatePhase(params.id, updates, { config });
}

/**
 * Handler for phase_delete method
 */
export async function handlePhaseDelete(params: PhaseDeleteParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await deletePhase(params.id, { 
    force: params.force,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for workflow_current method
 */
export async function handleWorkflowCurrent(params: WorkflowCurrentParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  // Using the normalized status value means we'll find all in-progress tasks
  // regardless of their specific format
  const inProgressResult = await listTasks({
    status: normalizeTaskStatus('In Progress'),
    config, // Pass runtime config with tasksDir
  });

  if (!inProgressResult.success) {
    return inProgressResult;
  }

  return inProgressResult;
}

/**
 * Handler for workflow_mark_complete_next method
 */
export async function handleWorkflowMarkCompleteNext(params: WorkflowMarkCompleteNextParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  // Get the next task before marking current as complete
  const nextTaskResult = await findNextTask(params.id, { config });

  // Mark current task as complete, using the normalized "Done" status
  const updateResult = await updateTask(params.id, {
    metadata: { status: normalizeTaskStatus('Done') },
  }, { config });

  if (!updateResult.success) {
    return updateResult;
  }

  if (!nextTaskResult.success) {
    return {
      success: true,
      data: { updated: updateResult.data, next: null },
      message: `Task ${params.id} marked as Done. Error finding next task: ${nextTaskResult.error}`,
    };
  }

  return {
    success: true,
    data: { updated: updateResult.data, next: nextTaskResult.data },
    message: updateResult.message,
  };
}

/**
 * Handler for debug_code_path method
 * This is a diagnostic handler to verify which version of the code is running
 */
export async function handleDebugCodePath(_params: DebugCodePathParams) {
  const version = '20250513-2110'; // Unique identifier for this specific version
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
        feature_mcp_tools_complete: true,
        area_mcp_tools_complete: true,
        task_move: true,
        overview_file_support: true,
      },
      documentation: {
        feature_area_tools: 'docs/mcp-tool-descriptions.md',
      },
      message:
        'Debug code path handler is responding - this is the updated MCP server with complete feature/area management',
    },
    message: `Debug code path handler is responding with version ${version}`,
  };
}

/**
 * Handler for task_move method
 */
export async function handleTaskMove(params: TaskMoveParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await moveTask(params.id, {
    targetSubdirectory: params.target_subdirectory,
    targetPhase: params.phase,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for feature_list method
 */
export async function handleFeatureList(params: FeatureListParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await listFeatures({
    phase: params.phase,
    status: params.status,
    include_tasks: params.include_tasks,
    include_progress: params.include_progress !== false, // Default to true
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for feature_get method
 */
export async function handleFeatureGet(params: FeatureGetParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await getFeature(params.id, { 
    phase: params.phase,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for feature_create method
 */
export async function handleFeatureCreate(params: FeatureCreateParams) {
  console.log(
    `[DEBUG] Feature Create: description=${params.description}, assignee=${params.assignee}`
  );
  
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await createFeature(
    params.name,
    {
      title: params.title,
      phase: params.phase,
      type: params.type || '🌟 Feature',
      description: params.description,
      assignee: params.assignee,
      tags: params.tags,
      config, // Pass runtime config with tasksDir
    }
  );
}

/**
 * Handler for feature_update method
 */
export async function handleFeatureUpdate(params: FeatureUpdateParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await updateFeature(params.id, params.updates, { 
    phase: params.phase,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for feature_delete method
 */
export async function handleFeatureDelete(params: FeatureDeleteParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await deleteFeature(params.id, { 
    phase: params.phase, 
    force: params.force,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for area_list method
 */
export async function handleAreaList(params: AreaListParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await listAreas({
    phase: params.phase,
    status: params.status,
    include_tasks: params.include_tasks,
    include_progress: params.include_progress !== false, // Default to true
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for area_get method
 */
export async function handleAreaGet(params: AreaGetParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await getArea(params.id, { 
    phase: params.phase,
    config, // Pass runtime config with tasksDir 
  });
}

/**
 * Handler for area_create method
 */
export async function handleAreaCreate(params: AreaCreateParams) {
  console.log(
    `[DEBUG] Area Create: description=${params.description}, assignee=${params.assignee}`
  );
  
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await createArea(
    params.name,
    {
      title: params.title,
      phase: params.phase,
      type: params.type || '🧹 Chore',
      description: params.description,
      assignee: params.assignee,
      tags: params.tags,
      config, // Pass runtime config with tasksDir
    }
  );
}

/**
 * Handler for area_update method
 */
export async function handleAreaUpdate(params: AreaUpdateParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await updateArea(params.id, params.updates, { 
    phase: params.phase,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for area_delete method
 */
export async function handleAreaDelete(params: AreaDeleteParams) {
  // Extract root_dir parameter to create runtime config if provided
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  return await deleteArea(params.id, { 
    phase: params.phase, 
    force: params.force,
    config, // Pass runtime config with tasksDir
  });
}

/**
 * Handler for template_list method
 */
export async function handleTemplateList(params: TemplateListParams) {
  try {
    // Extract root_dir parameter to create runtime config if provided
    const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
    
    // Pass runtime config to listTemplates
    const templates = listTemplates(config);
    
    return {
      success: true,
      data: templates,
      message: `Found ${templates.length} templates`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handler for init_root method
 */
export async function handleInitRoot(params: ConfigInitRootParams) {
  try {
    const configManager = ConfigurationManager.getInstance();

    // Validate the path exists
    if (!configManager.validateRoot(params.path)) {
      return {
        success: false,
        error: `Invalid project root: ${params.path} does not contain .tasks or .ruru directory`,
      };
    }

    // Set the root for the current session
    configManager.setRootFromSession(params.path);

    return {
      success: true,
      data: {
        path: params.path,
        source: 'session',
        validated: true,
      },
      message: `Successfully set project root to: ${params.path}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handler for get_current_root method
 */
export async function handleGetCurrentRoot(_params: ConfigGetCurrentRootParams) {
  try {
    const configManager = ConfigurationManager.getInstance();
    const rootConfig = configManager.getRootConfig();

    return {
      success: true,
      data: {
        path: rootConfig.path,
        source: rootConfig.source,
        validated: rootConfig.validated,
        projectName: rootConfig.projectName,
      },
      message: `Current root: ${rootConfig.path} (source: ${rootConfig.source})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handler for list_projects method
 */
export async function handleListProjects(_params: ConfigListProjectsParams) {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projects = configManager.getProjects();

    return {
      success: true,
      data: projects,
      message: `Found ${projects.length} configured projects`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
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
  [McpMethod.TEMPLATE_LIST]: handleTemplateList,
  [McpMethod.CONFIG_INIT_ROOT]: handleInitRoot,
  [McpMethod.CONFIG_GET_CURRENT_ROOT]: handleGetCurrentRoot,
  [McpMethod.CONFIG_LIST_PROJECTS]: handleListProjects,
  [McpMethod.DEBUG_CODE_PATH]: handleDebugCodePath,
};
