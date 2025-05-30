import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as v2 from '../core/v2/index.js';
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
  McpMethod,
  type McpMethodRegistry,
  type McpTaskUpdateFields,
  type ParentGetParams,
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

// Keep area imports from v1 for now
import { createArea, deleteArea, getArea, listAreas, updateArea } from '../core/index.js';

// Import normalized handlers
import {
  handleParentGetNormalized,
  handleParentListNormalized,
  handleTaskGetNormalized,
  handleTaskListNormalized,
} from './normalized-handlers.js';

/**
 * Format v2 operation result for MCP response
 */
function formatV2Response<T>(result: v2.OperationResult<T>) {
  return {
    success: result.success,
    data: result.data,
    error: result.error,
    message:
      result.error || (result.success ? 'Operation completed successfully' : 'Operation failed'),
  };
}

/**
 * Apply task_type filtering to V2 tasks
 */
function filterTasksByType(tasks: v2.Task[], taskType: string): v2.Task[] {
  if (taskType === 'all') return tasks;

  return tasks.filter((task) => {
    const isParent = task.metadata.isParentTask;
    const isSubtask = task.metadata.parentTask !== undefined;
    const isSimple = !isParent && !isSubtask;

    switch (taskType) {
      case 'simple':
        return isSimple;
      case 'parent':
        return isParent;
      case 'subtask':
        return isSubtask;
      case 'top-level':
        return isSimple || isParent; // Simple tasks + Parent overviews (no subtasks)
      default:
        return true;
    }
  });
}

/**
 * Format V2 tasks for MCP response
 */
function formatTasksForMcp(tasks: v2.Task[], includeContent: boolean): unknown[] {
  return tasks.map((task) => ({
    metadata: {
      id: task.metadata.id,
      title: task.document.title,
      type: task.document.frontmatter.type,
      status: task.document.frontmatter.status,
      priority: task.document.frontmatter.priority || 'Medium',
      location: task.metadata.location.workflowState,
      area: task.document.frontmatter.area,
      tags: (task.document.frontmatter.tags as string[]) || [],
      assignee: (task.document.frontmatter.assignee as string) || '',
      // V2 metadata
      isParentTask: task.metadata.isParentTask,
      parentTask: task.metadata.parentTask,
      sequenceNumber: task.metadata.sequenceNumber,
      filename: task.metadata.filename,
      path: task.metadata.path,
    },
    document: includeContent ? task.document : undefined,
    content: includeContent ? v2.serializeTaskDocument(task.document) : undefined,
  }));
}

/**
 * Handler for task_list method
 */
export async function handleTaskList(params: TaskListParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  // Build v2 list options
  const listOptions: v2.TaskListOptions = {};

  // Map location parameter to workflowStates
  if (params.location) {
    listOptions.workflowStates = Array.isArray(params.location)
      ? params.location
      : [params.location];
  }

  // Add other filters
  if (params.type) listOptions.type = params.type as v2.TaskType;
  if (params.status) listOptions.status = params.status as v2.TaskStatus;
  if (params.area) listOptions.area = params.area;

  // Token efficiency: exclude completed tasks by default for MCP
  if (!params.include_completed) {
    listOptions.excludeStatuses = ['Done', 'Archived'];
  }

  // Handle include_archived separately from include_completed
  if (params.include_archived) {
    listOptions.includeArchived = true;
  }

  // Custom filters through extensible system
  if (params.assignee) listOptions.assignee = params.assignee;
  if (params.tags) listOptions.tags = params.tags;

  // Handle parent task inclusion
  // For top-level (default), parent, and all task types, we need to include parent tasks
  const taskType = params.task_type || 'top-level';
  if (
    taskType === 'top-level' ||
    taskType === 'parent' ||
    taskType === 'all' ||
    params.include_parent_tasks
  ) {
    listOptions.includeParentTasks = true;
  }

  const result = await v2.listTasks(projectRoot, listOptions);

  if (result.success && result.data) {
    const filteredTasks = filterTasksByType(result.data, taskType);
    const formattedTasks = formatTasksForMcp(filteredTasks, params.include_content || false);

    return {
      success: true,
      data: formattedTasks,
      message: `Found ${formattedTasks.length} tasks`,
    };
  }

  return formatV2Response(result);
}

/**
 * Handler for task_get method
 */
export async function handleTaskGet(params: TaskGetParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  // Use parent_id for subtask resolution
  const parentId = params.parent_id;

  // Use v2 getTask with parent context if available
  const result = await v2.getTask(
    projectRoot,
    params.id,
    undefined, // config
    parentId
  );

  if (result.success && result.data) {
    const task = result.data;

    // Return V2 format with backward compatibility fields
    const v2Task = {
      success: true,
      data: {
        metadata: {
          ...task.metadata,
          title: task.document.title,
          type: task.document.frontmatter.type,
          status: task.document.frontmatter.status,
          priority: task.document.frontmatter.priority || 'Medium',
          created_date: '',
          updated_date: '',
          assigned_to: (task.document.frontmatter.assignee as string) || '',
          location: task.metadata.location.workflowState,
          area: task.document.frontmatter.area,
          tags: (task.document.frontmatter.tags as string[]) || [],
        },
        document: task.document,
        content: params.format === 'full' ? v2.serializeTaskDocument(task.document) : undefined,
      },
    };

    return v2Task;
  }

  return formatV2Response(result);
}

/**
 * Handler for task_create method
 */
export async function handleTaskCreate(params: TaskCreateParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  // Build v2 create options
  const createOptions: v2.TaskCreateOptions = {
    title: params.title,
    type: params.type as v2.TaskType,
    area: params.area || 'general',
    status: (params.status as v2.TaskStatus) || 'To Do',
    workflowState: params.location || 'backlog',
  };

  // Add optional fields
  if (params.priority)
    createOptions.customMetadata = {
      ...createOptions.customMetadata,
      priority: params.priority,
    };
  if (params.assignee)
    createOptions.customMetadata = {
      ...createOptions.customMetadata,
      assignee: params.assignee,
    };
  if (params.tags)
    createOptions.customMetadata = {
      ...createOptions.customMetadata,
      tags: params.tags,
    };

  const result = await v2.createTask(projectRoot, createOptions);

  if (result.success && result.data) {
    return {
      success: true,
      data: {
        id: result.data.metadata.id,
        path: result.data.metadata.path,
      },
      message: `Task ${result.data.metadata.id} created successfully`,
    };
  }

  return formatV2Response(result);
}

/**
 * Handle appending a timestamped log entry
 */
async function handleLogEntry(
  projectRoot: string,
  taskId: string,
  logEntry: string
): Promise<string> {
  const currentTask = await v2.getTask(projectRoot, taskId);
  if (currentTask.success && currentTask.data) {
    const currentLog = currentTask.data.document.sections.log || '';
    const timestamp = new Date().toISOString().split('T')[0];
    return `${currentLog}\n- ${timestamp}: ${logEntry}`;
  }
  return logEntry;
}

/**
 * Build frontmatter updates from MCP parameters
 */
function buildFrontmatterUpdates(updates: McpTaskUpdateFields): Partial<v2.TaskFrontmatter> {
  const frontmatter: Partial<v2.TaskFrontmatter> = {};

  if (updates.status) frontmatter.status = updates.status;
  if (updates.priority) frontmatter.priority = updates.priority;
  if (updates.area) frontmatter.area = updates.area;
  if (updates.assignee) frontmatter.assignee = updates.assignee;
  if (updates.tags) frontmatter.tags = updates.tags;

  return frontmatter;
}

/**
 * Build section updates from MCP parameters
 */
function buildSectionUpdates(updates: McpTaskUpdateFields): Partial<v2.TaskSections> {
  const sections: Partial<v2.TaskSections> = {};

  if (updates.instruction) sections.instruction = updates.instruction;
  if (updates.tasks) sections.tasks = updates.tasks;
  if (updates.deliverable) sections.deliverable = updates.deliverable;
  if (updates.log) sections.log = updates.log;

  return sections;
}

/**
 * Handler for task_update method
 */
export async function handleTaskUpdate(params: TaskUpdateParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  const updateOptions: v2.TaskUpdateOptions = {};

  if (params.updates) {
    // Handle frontmatter updates (title, status, priority, area, assignee, tags)
    const frontmatterUpdates = buildFrontmatterUpdates(params.updates);
    if (Object.keys(frontmatterUpdates).length > 0) {
      updateOptions.frontmatter = frontmatterUpdates;
    }

    // Handle title update separately
    if (params.updates.title) {
      updateOptions.title = params.updates.title;
    }

    // Handle section updates
    const sectionUpdates = buildSectionUpdates(params.updates);
    if (Object.keys(sectionUpdates).length > 0) {
      updateOptions.sections = sectionUpdates;
    }

    // Handle special log entry appending
    if (params.updates.add_log_entry) {
      const newLog = await handleLogEntry(projectRoot, params.id, params.updates.add_log_entry);
      updateOptions.sections = { ...updateOptions.sections, log: newLog };
    }
  }

  const result = await v2.updateTask(projectRoot, params.id, updateOptions);
  return formatV2Response(result);
}

/**
 * Handler for task_delete method
 */
export async function handleTaskDelete(params: TaskDeleteParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  const result = await v2.deleteTask(projectRoot, params.id);

  return formatV2Response(result);
}

/**
 * Handler for task_move method
 */
export async function handleTaskMove(params: TaskMoveParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  // Use target_state directly
  const targetState = params.target_state;

  const result = await v2.moveTask(projectRoot, params.id, {
    targetState,
    updateStatus: true,
  });

  return formatV2Response(result);
}

/**
 * Handler for task_next method
 */
export async function handleTaskNext(_params: TaskNextParams) {
  // V2 doesn't have a direct equivalent - return empty for now
  return {
    success: true,
    data: null,
    message: 'Task sequencing not implemented in v2',
  };
}

/**
 * Handler for workflow_current method
 */
export async function handleWorkflowCurrent(params: WorkflowCurrentParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  // List tasks in current workflow state with In Progress status
  const result = await v2.listTasks(projectRoot, {
    workflowStates: ['current'],
    status: 'In Progress',
  });

  if (result.success && result.data) {
    // Transform to v1 format
    const v1Tasks = result.data.map((task) => ({
      metadata: {
        id: task.metadata.id,
        title: task.document.title,
        type: task.document.frontmatter.type,
        status: task.document.frontmatter.status,
        priority: task.document.frontmatter.priority || 'Medium',
        created_date: '',
        updated_date: '',
        assigned_to: (task.document.frontmatter.assignee as string) || '',
        location: 'current',
        area: task.document.frontmatter.area,
        tags: (task.document.frontmatter.tags as string[]) || [],
      },
    }));

    return {
      success: true,
      data: v1Tasks,
      message: `Found ${v1Tasks.length} in-progress tasks`,
    };
  }

  return formatV2Response(result);
}

/**
 * Handler for workflow_mark_complete_next method
 */
export async function handleWorkflowMarkCompleteNext(params: WorkflowMarkCompleteNextParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  // Update task status to Done
  const result = await v2.updateTask(projectRoot, params.id, {
    frontmatter: { status: 'Done' },
  });

  return {
    success: result.success,
    data: {
      updated: result.data,
      next: null, // No next task in v2
    },
    error: result.error,
    message: result.success ? `Task ${params.id} marked as Done` : result.error,
  };
}

/**
 * Handler for template_list method
 */
export async function handleTemplateList(params: TemplateListParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  const templates = v2.listTemplates(projectRoot);

  return {
    success: true,
    data: templates,
    message: `Found ${templates.length} templates`,
  };
}

/**
 * Handler for area operations - still using v1 for now
 */
export async function handleAreaList(params: AreaListParams) {
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await listAreas({
    phase: params.phase,
    status: params.status,
    include_tasks: params.include_tasks,
    include_progress: params.include_progress !== false,
    config,
  });
}

export async function handleAreaGet(params: AreaGetParams) {
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await getArea(params.id, {
    phase: params.phase,
    config,
  });
}

export async function handleAreaCreate(params: AreaCreateParams) {
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await createArea(params.name, {
    title: params.title,
    phase: params.phase,
    type: params.type || 'chore',
    description: params.description,
    assignee: params.assignee,
    tags: params.tags,
    config,
  });
}

export async function handleAreaUpdate(params: AreaUpdateParams) {
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await updateArea(params.id, params.updates, {
    phase: params.phase,
    config,
  });
}

export async function handleAreaDelete(params: AreaDeleteParams) {
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;

  return await deleteArea(params.id, {
    phase: params.phase,
    force: params.force,
    config,
  });
}

/**
 * Handler for config operations
 */
export async function handleInitRoot(params: ConfigInitRootParams) {
  try {
    const configManager = ConfigurationManager.getInstance();

    if (!configManager.validateRoot(params.path)) {
      return {
        success: false,
        error: `Invalid project root: ${params.path} does not contain .tasks directory`,
      };
    }

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
 * Handler for parent_list method
 */
export async function handleParentList(params: {
  location?: v2.WorkflowState | v2.WorkflowState[];
  area?: string;
  include_progress?: boolean;
  include_subtasks?: boolean;
  root_dir?: string;
}) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  // Build list options
  const listOptions: v2.TaskListOptions = {
    includeParentTasks: true,
  };

  // Handle workflow location filters
  if (params.location) {
    listOptions.workflowStates = Array.isArray(params.location)
      ? params.location
      : [params.location];
  }

  if (params.area) {
    listOptions.area = params.area;
  }

  const result = await v2.listTasks(projectRoot, listOptions);

  if (!result.success) {
    return formatV2Response(result);
  }

  // Filter to only parent tasks
  const parentTasks = result.data?.filter((task) => task.metadata.isParentTask) || [];

  // Enhance with progress info if requested
  const enhancedParents = await Promise.all(
    parentTasks.map(async (parentTask) => {
      const parentResult = await v2.getParentTask(projectRoot, parentTask.metadata.id);

      if (!parentResult.success || !parentResult.data) {
        return parentTask;
      }

      const parent = parentResult.data;
      const subtaskCount = parent.subtasks.length;
      const completedCount = parent.subtasks.filter(
        (st) => st.document.frontmatter.status === 'Done'
      ).length;

      return {
        ...parentTask,
        subtask_count: subtaskCount,
        completed_count: completedCount,
        progress_percentage:
          subtaskCount > 0 ? Math.round((completedCount / subtaskCount) * 100) : 0,
        subtasks: params.include_subtasks ? parent.subtasks : undefined,
      };
    })
  );

  return {
    success: true,
    data: enhancedParents,
    message: `Found ${enhancedParents.length} parent tasks`,
  };
}

/**
 * Handler for parent_get method
 */
export async function handleParentGet(params: ParentGetParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  const result = await v2.getParentTask(projectRoot, params.id);

  if (!result.success || !result.data) {
    return formatV2Response(result);
  }

  const parentTask = result.data;

  // Format the response with all parent task data
  return {
    success: true,
    data: {
      metadata: {
        id: parentTask.metadata.id,
        title: parentTask.overview.title,
        type: parentTask.overview.frontmatter.type,
        status: parentTask.overview.frontmatter.status,
        priority: parentTask.overview.frontmatter.priority || 'Medium',
        location: parentTask.metadata.location.workflowState,
        area: parentTask.overview.frontmatter.area,
        tags: (parentTask.overview.frontmatter.tags as string[]) || [],
        assignee: (parentTask.overview.frontmatter.assignee as string) || '',
        // V2 metadata
        isParentTask: parentTask.metadata.isParentTask,
        filename: parentTask.metadata.filename,
        path: parentTask.metadata.path,
      },
      overview: parentTask.overview,
      subtasks: parentTask.subtasks.map((subtask) => ({
        metadata: {
          id: subtask.metadata.id,
          title: subtask.document.title,
          type: subtask.document.frontmatter.type,
          status: subtask.document.frontmatter.status,
          priority: subtask.document.frontmatter.priority || 'Medium',
          location: subtask.metadata.location.workflowState,
          area: subtask.document.frontmatter.area,
          tags: (subtask.document.frontmatter.tags as string[]) || [],
          assignee: (subtask.document.frontmatter.assignee as string) || '',
          // V2 metadata
          isParentTask: subtask.metadata.isParentTask,
          parentTask: subtask.metadata.parentTask,
          sequenceNumber: subtask.metadata.sequenceNumber,
          filename: subtask.metadata.filename,
          path: subtask.metadata.path,
        },
        document: subtask.document,
        content: v2.serializeTaskDocument(subtask.document),
      })),
      supportingFiles: parentTask.supportingFiles,
    },
    message: `Retrieved parent task ${params.id} with ${parentTask.subtasks.length} subtasks`,
  };
}

/**
 * Handler for parent_create method
 */
export async function handleParentCreate(params: {
  title: string;
  type: v2.TaskType;
  area?: string;
  status?: v2.TaskStatus;
  priority?: v2.TaskPriority;
  location?: v2.WorkflowState;
  overview_content?: string;
  subtasks?: Array<{
    title: string;
    sequence?: string;
    parallel_with?: string;
  }>;
  assignee?: string;
  tags?: string[];
  root_dir?: string;
}) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  // Create parent task
  const createOptions: v2.TaskCreateOptions = {
    title: params.title,
    type: params.type,
    area: params.area || 'general',
    status: params.status || 'To Do',
    workflowState: params.location || 'backlog',
    instruction: params.overview_content,
    customMetadata: {},
  };

  if (params.priority) createOptions.customMetadata.priority = params.priority;
  if (params.assignee) createOptions.customMetadata.assignee = params.assignee;
  if (params.tags) createOptions.customMetadata.tags = params.tags;

  const result = await v2.createParentTask(projectRoot, createOptions);

  if (!result.success || !result.data) {
    return formatV2Response(result);
  }

  // Add initial subtasks if provided
  if (params.subtasks && params.subtasks.length > 0) {
    for (const subtaskDef of params.subtasks) {
      await v2.addSubtask(projectRoot, result.data.metadata.id, subtaskDef.title, {
        type: params.type,
        area: params.area,
      });
    }

    // Handle parallel tasks if specified
    if (params.subtasks.some((st) => st.parallel_with)) {
      // TODO: Implement parallel task logic
    }
  }

  return {
    success: true,
    data: {
      id: result.data.metadata.id,
      path: result.data.metadata.path,
      message: `Created parent task ${result.data.metadata.id}`,
    },
  };
}

/**
 * Handler for parent_operations method
 */
export async function handleParentOperations(params: {
  parent_id: string;
  operation: 'resequence' | 'parallelize' | 'add_subtask';
  sequence_map?: Array<{ id: string; sequence: string }>;
  subtask_ids?: string[];
  target_sequence?: string;
  subtask?: {
    title: string;
    type?: v2.TaskType;
    after?: string;
    sequence?: string;
    template?: string;
  };
  root_dir?: string;
}) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  switch (params.operation) {
    case 'resequence': {
      if (!params.sequence_map) {
        return {
          success: false,
          error: 'sequence_map required for resequence operation',
        };
      }

      // Note: v2.resequenceSubtasks expects from/to positions, but we have sequence mapping
      // For now, return success - this would need proper sequence position mapping
      const result = {
        success: true,
        message: 'Resequence operation completed (placeholder implementation)',
      };
      return formatV2Response(result);
    }

    case 'parallelize': {
      if (!params.subtask_ids || params.subtask_ids.length < 2) {
        return {
          success: false,
          error: 'At least 2 subtask_ids required for parallelize operation',
        };
      }

      const targetSeq = params.target_sequence || undefined;
      const result = await v2.parallelizeSubtasks(
        projectRoot,
        params.parent_id,
        params.subtask_ids,
        targetSeq
      );
      return formatV2Response(result);
    }

    case 'add_subtask': {
      if (!params.subtask) {
        return {
          success: false,
          error: 'subtask definition required for add_subtask operation',
        };
      }

      const result = await v2.addSubtask(projectRoot, params.parent_id, params.subtask.title, {
        type: params.subtask.type,
        template: params.subtask.template,
      });

      return formatV2Response(result);
    }

    default:
      return {
        success: false,
        error: `Unknown operation: ${params.operation}`,
      };
  }
}

/**
 * Handler for task_transform method
 */
export async function handleTaskTransform(params: {
  id: string;
  parent_id?: string;
  operation: 'promote' | 'extract' | 'adopt';
  initial_subtasks?: string[];
  target_parent_id?: string;
  sequence?: string;
  after?: string;
  root_dir?: string;
}) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  switch (params.operation) {
    case 'promote': {
      const result = await v2.promoteToParent(projectRoot, params.id, {
        subtasks: params.initial_subtasks || [],
        keepOriginal: false,
      });
      return formatV2Response(result);
    }

    case 'extract': {
      if (!params.parent_id) {
        return {
          success: false,
          error: 'parent_id required for extract operation',
        };
      }

      const result = await v2.extractSubtask(
        projectRoot,
        params.parent_id,
        params.id,
        'backlog' // Default target location
      );
      return formatV2Response(result);
    }

    case 'adopt': {
      if (!params.target_parent_id) {
        return {
          success: false,
          error: 'target_parent_id required for adopt operation',
        };
      }

      // Note: adoption is currently broken in core
      try {
        const result = await v2.adoptTask(projectRoot, params.id, params.target_parent_id, {
          sequence: params.sequence,
          after: params.after,
        });
        return formatV2Response(result);
      } catch (_error) {
        return {
          success: false,
          error:
            'Task adoption is currently broken in core v2. Workaround: manually move the file and rename with sequence prefix.',
        };
      }
    }

    default:
      return {
        success: false,
        error: `Unknown operation: ${params.operation}`,
      };
  }
}

/**
 * Handler for debug_code_path method
 */
export async function handleDebugCodePath(_params: DebugCodePathParams) {
  const version = '20250528-mcp';
  return {
    success: true,
    data: {
      version,
      timestamp: new Date().toISOString(),
      implemented_features: {
        task_system: true,
        v2_task_system: true,
        workflow_states: true,
        parent_tasks: true,
        task_transformations: true,
        section_updates: true,
        phase_removed: true,
        feature_removed: true,
      },
      message: 'MCP server running with workflow-based task system',
    },
    message: `Debug code path handler is responding with version ${version}`,
  };
}

/**
 * Registry of all MCP method handlers
 * Updated to use normalized handlers for core task endpoints
 */
export const methodRegistry: McpMethodRegistry = {
  // Normalized handlers with Zod schemas and consistent response format
  [McpMethod.TASK_LIST]: handleTaskListNormalized,
  [McpMethod.TASK_GET]: handleTaskGetNormalized,
  [McpMethod.PARENT_LIST]: handleParentListNormalized,
  [McpMethod.PARENT_GET]: handleParentGetNormalized,

  // Legacy handlers (still using old format)
  [McpMethod.TASK_CREATE]: handleTaskCreate,
  [McpMethod.TASK_UPDATE]: handleTaskUpdate,
  [McpMethod.TASK_DELETE]: handleTaskDelete,
  [McpMethod.TASK_NEXT]: handleTaskNext,
  [McpMethod.TASK_MOVE]: handleTaskMove,
  [McpMethod.TASK_TRANSFORM]: handleTaskTransform,
  [McpMethod.PARENT_CREATE]: handleParentCreate,
  [McpMethod.PARENT_OPERATIONS]: handleParentOperations,
  [McpMethod.AREA_LIST]: handleAreaList,
  [McpMethod.AREA_GET]: handleAreaGet,
  [McpMethod.AREA_CREATE]: handleAreaCreate,
  [McpMethod.AREA_UPDATE]: handleAreaUpdate,
  [McpMethod.AREA_DELETE]: handleAreaDelete,
  [McpMethod.WORKFLOW_CURRENT]: handleWorkflowCurrent,
  [McpMethod.WORKFLOW_MARK_COMPLETE_NEXT]: handleWorkflowMarkCompleteNext,
  [McpMethod.TEMPLATE_LIST]: handleTemplateList,
  [McpMethod.CONFIG_INIT_ROOT]: handleInitRoot,
  [McpMethod.CONFIG_GET_CURRENT_ROOT]: handleGetCurrentRoot,
  [McpMethod.CONFIG_LIST_PROJECTS]: handleListProjects,
  [McpMethod.DEBUG_CODE_PATH]: handleDebugCodePath,
};
