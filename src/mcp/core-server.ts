import fs from 'node:fs';
import path from 'node:path';
/**
 * Core MCP server implementation using the official SDK
 * This file contains the core server logic that can be reused across different transports
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// Import core functionality
import {
  type AreaFilterOptions,
  type AreaUpdateOptions,
  type FeatureFilterOptions,
  type FeatureUpdateOptions,
  type Task,
  type TaskFilterOptions,
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
  updateArea,
  updateFeature,
  updatePhase,
  updateTask,
} from '../core/index.js';

/**
 * Create task metadata from parameters
 */
function createTaskMetadata(params: {
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
}): TaskMetadata {
  const metadata: TaskMetadata = {
    id: params.id || '',
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

  return metadata;
}

/**
 * Get default task content
 */
function getDefaultTaskContent(title: string): string {
  return `## ${title}\n\nTask description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n`;
}

/**
 * Create a server instance with all tools registered
 * @param options Additional options
 * @returns A McpServer instance with all tools registered
 */
export function createServerInstance(options: { verbose?: boolean } = {}): McpServer {
  // Read package version from package.json
  let version = '0.2.0'; // Default
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    version = packageJson.version || version;
  } catch (_error) {
    // Silently fail and use default version
  }

  // Create an MCP server instance
  const server = new McpServer({
    name: 'Scopecraft Command MCP Server',
    version,
  });

  if (options.verbose) {
    // No logging output to avoid interfering with MCP protocol
  }

  // Register all tools
  registerTools(server, options.verbose);

  return server;
}

/**
 * Register all tools with the MCP server
 */
function registerTools(server: McpServer, verbose = false): McpServer {
  // Get available task types from templates for dynamic enum
  const templates = listTemplates();
  const taskTypes = templates.map((t) => t.description).filter(Boolean);
  // Fallback to common types if no templates found
  const availableTaskTypes =
    taskTypes.length > 0
      ? taskTypes
      : ['🌟 Feature', '🐞 Bug', '🧹 Chore', '📚 Documentation', '🧪 Test', '🔬 Spike'];

  // Common enums used across multiple tools
  const taskStatusEnum = z.enum([
    '🟡 To Do',
    '🔵 In Progress',
    '🟢 Done',
    '⚪ Archived',
    '🔴 Blocked',
  ]);
  const taskPriorityEnum = z.enum(['🔼 High', '▶️ Medium', '🔽 Low']);
  const taskTypeEnum = z.enum(availableTaskTypes as [string, ...string[]]);

  // Task list tool
  const taskListRawShape = {
    status: taskStatusEnum.describe('Filter by task status').optional(),
    type: taskTypeEnum.describe('Filter by task type (based on available templates)').optional(),
    assignee: z.string().describe('Filter by assigned username').optional(),
    tags: z.array(z.string()).describe('Filter by tags (e.g., ["backend", "api"])').optional(),
    phase: z.string().describe('Filter by phase ID (e.g., "release-v1")').optional(),
    format: z.string().describe('Output format (reserved for future use)').optional(),
    include_content: z
      .boolean()
      .describe('Include full task content in response (default: false)')
      .optional(),
    include_completed: z
      .boolean()
      .describe('Include completed tasks in results (default: false)')
      .optional(),
    subdirectory: z
      .string()
      .describe('Filter by subdirectory/feature/area (e.g., "FEATURE_Authentication")')
      .optional(),
    is_overview: z.boolean().describe('Filter for overview files only').optional(),
  };
  const taskListSchema = z.object(taskListRawShape);
  server.registerTool(
    'task_list',
    {
      description:
        'Lists tasks with powerful filtering capabilities. Use this to find specific tasks by status, type, phase, assignee, tags, or location. Supports filtering by completion status and can optionally include task content. Task types are dynamic based on available templates - use template_list to see valid types.',
      inputSchema: taskListRawShape,
      annotations: {
        title: 'List Tasks',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof taskListSchema>) => {
      const filterOptions: TaskFilterOptions = {
        status: params.status,
        type: params.type,
        assignee: params.assignee,
        tags: params.tags,
        phase: params.phase,
        include_content: params.include_content,
        include_completed: params.include_completed,
        subdirectory: params.subdirectory,
        is_overview: params.is_overview,
      };
      try {
        const result = await listTasks(filterOptions);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task get tool
  const taskGetRawShape = {
    id: z.string().describe('Task ID to retrieve (e.g., "TASK-001", "FEAT-AUTH-001")'),
    format: z.string().describe('Output format (reserved for future use)').optional(),
  };
  const taskGetSchema = z.object(taskGetRawShape);
  server.registerTool(
    'task_get',
    {
      description:
        'Retrieves complete details of a specific task including all metadata and content. Use this when you need full information about a task, including its relationships (parent, dependencies), dates, and complete content. Essential for reading task details before updates.',
      inputSchema: taskGetRawShape,
      annotations: {
        title: 'Get Task',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof taskGetSchema>) => {
      try {
        const result = await getTask(params.id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task create tool
  const taskCreateRawShape = {
    id: z.string().describe('Custom task ID (auto-generated if not provided)').optional(),
    title: z.string().describe('Task title/summary'),
    type: taskTypeEnum.describe('Task type (must match available templates)'),
    status: taskStatusEnum.describe('Initial task status').default('🟡 To Do').optional(),
    priority: taskPriorityEnum.describe('Task priority level').default('▶️ Medium').optional(),
    assignee: z.string().describe('Username of person assigned to this task').optional(),
    phase: z.string().describe('Phase to create task in (e.g., "release-v1")').optional(),
    subdirectory: z
      .string()
      .describe('Feature/area subdirectory (e.g., "FEATURE_Authentication")')
      .optional(),
    parent: z.string().describe('Parent task ID for creating subtasks').optional(),
    depends: z.array(z.string()).describe('Array of task IDs this task depends on').optional(),
    previous: z.string().describe('Previous task ID in sequence').optional(),
    next: z.string().describe('Next task ID in sequence').optional(),
    tags: z
      .array(z.string())
      .describe('Tags for categorization (e.g., ["backend", "api"])')
      .optional(),
    content: z.string().describe('Task description/content in Markdown format').optional(),
  };
  const taskCreateSchema = z.object(taskCreateRawShape);
  server.registerTool(
    'task_create',
    {
      description:
        'Creates a new task with specified metadata and content. Tasks can be standalone or organized within features/areas in specific phases. Supports parent-child relationships, dependencies, and task sequences. Task types must match available templates - use template_list to see valid types. Auto-generates ID if not provided.',
      inputSchema: taskCreateRawShape,
      annotations: {
        title: 'Create Task',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async (params: z.infer<typeof taskCreateSchema>) => {
      try {
        const metadata = createTaskMetadata(params);
        const task: Task = {
          metadata,
          content: params.content || getDefaultTaskContent(params.title),
        };
        const result = await createTask(task, { subdirectory: params.subdirectory });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task update tool
  const taskUpdateRawShape = {
    id: z.string().describe('Task ID to update'),
    updates: z
      .object({
        status: taskStatusEnum.describe('New task status').optional(),
        priority: taskPriorityEnum.describe('New priority level').optional(),
        phase: z.string().describe('Move to different phase').optional(),
        subdirectory: z.string().describe('Move to different subdirectory').optional(),
        new_id: z.string().describe('Rename task (change ID)').optional(),
        metadata: z.record(z.unknown()).describe('Update any metadata field').optional(),
        content: z.string().describe('Replace task content/description').optional(),
      })
      .describe('Fields to update (only specified fields are changed)')
      .optional(),
    phase: z.string().describe('Current phase (helps locate task)').optional(),
    subdirectory: z.string().describe('Current subdirectory (helps locate task)').optional(),
  };
  const taskUpdateSchema = z.object(taskUpdateRawShape);
  server.registerTool(
    'task_update',
    {
      description:
        "Updates an existing task's metadata and/or content. Supports partial updates - only specified fields are changed. Use this to change status, reassign, update content, or move tasks between phases/subdirectories. Can also rename tasks by providing new_id.",
      inputSchema: taskUpdateRawShape,
      annotations: {
        title: 'Update Task',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof taskUpdateSchema>) => {
      try {
        if (!params.updates) {
          return formatError(new Error('No updates provided'));
        }
        const result = await updateTask(params.id, params.updates, {
          phase: params.phase,
          subdirectory: params.subdirectory,
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task delete tool
  const taskDeleteRawShape = {
    id: z.string().describe('Task ID to delete'),
  };
  const taskDeleteSchema = z.object(taskDeleteRawShape);
  server.registerTool(
    'task_delete',
    {
      description:
        'Permanently deletes a task and its file. Use with caution as this is destructive and cannot be undone. Useful for removing cancelled, obsolete, or test tasks.',
      inputSchema: taskDeleteRawShape,
      annotations: {
        title: 'Delete Task',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof taskDeleteSchema>) => {
      try {
        const result = await deleteTask(params.id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task next tool
  const taskNextRawShape = {
    id: z.string().describe('Current task ID (to find next in sequence)').optional(),
    format: z.string().describe('Output format (reserved for future use)').optional(),
  };
  const taskNextSchema = z.object(taskNextRawShape);
  server.registerTool(
    'task_next',
    {
      description:
        'Finds the next recommended task to work on based on dependencies, priorities, and workflow. Helps maintain task flow by suggesting what to work on next, either after completing a specific task or when starting fresh. Respects task sequences and dependencies.',
      inputSchema: taskNextRawShape,
      annotations: {
        title: 'Get Next Task',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof taskNextSchema>) => {
      try {
        const result = await findNextTask(params.id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Phase list tool
  const phaseListRawShape = {
    format: z.string().optional(),
  };
  const phaseListSchema = z.object(phaseListRawShape);
  server.registerTool(
    'phase_list',
    {
      description: 'List Phases',
      inputSchema: phaseListRawShape,
      annotations: {
        title: 'List Phases',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (_params: z.infer<typeof phaseListSchema>) => {
      try {
        const result = await listPhases();
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Phase create tool
  const phaseCreateRawShape = {
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: z.string().optional(),
    order: z.number().optional(),
  };
  const phaseCreateSchema = z.object(phaseCreateRawShape);
  server.registerTool(
    'phase_create',
    {
      description: 'Create Phase',
      inputSchema: phaseCreateRawShape,
      annotations: {
        title: 'Create Phase',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async (params: z.infer<typeof phaseCreateSchema>) => {
      try {
        const phase = {
          id: params.id,
          name: params.name,
          description: params.description,
          status: params.status || '🟡 Pending',
          order: params.order,
          tasks: [],
        };
        const result = await createPhase(phase);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Phase update tool
  const phaseUpdateRawShape = {
    id: z.string(),
    updates: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      order: z.number().optional(),
    }),
  };
  const phaseUpdateSchema = z.object(phaseUpdateRawShape);
  server.registerTool(
    'phase_update',
    {
      description: 'Update Phase',
      inputSchema: phaseUpdateRawShape,
      annotations: {
        title: 'Update Phase',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof phaseUpdateSchema>) => {
      try {
        const result = await updatePhase(params.id, params.updates);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Phase delete tool
  const phaseDeleteRawShape = {
    id: z.string(),
    force: z.boolean().optional(),
  };
  const phaseDeleteSchema = z.object(phaseDeleteRawShape);
  server.registerTool(
    'phase_delete',
    {
      description: 'Delete Phase',
      inputSchema: phaseDeleteRawShape,
      annotations: {
        title: 'Delete Phase',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof phaseDeleteSchema>) => {
      try {
        const result = await deletePhase(params.id, { force: params.force });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Workflow current tool
  const workflowCurrentRawShape = {
    format: z.string().describe('Output format (reserved for future use)').optional(),
  };
  const workflowCurrentSchema = z.object(workflowCurrentRawShape);
  server.registerTool(
    'workflow_current',
    {
      description:
        'Shows all tasks currently in progress across the project. Useful for status updates, checking active work, and ensuring no task conflicts. Returns tasks with status "🔵 In Progress".',
      inputSchema: workflowCurrentRawShape,
      annotations: {
        title: 'Get Current Workflow',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (_params: z.infer<typeof workflowCurrentSchema>) => {
      try {
        const inProgressResult = await listTasks({ status: '🔵 In Progress' });
        if (!inProgressResult.success) {
          return formatResponse(inProgressResult);
        }
        if (inProgressResult.data && inProgressResult.data.length === 0) {
          const alternativeResult = await listTasks({ status: 'In Progress' });
          return formatResponse(alternativeResult);
        }
        return formatResponse(inProgressResult);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Workflow mark complete next tool
  const workflowMarkCompleteNextRawShape = {
    id: z.string().describe('Task ID to mark as complete'),
    format: z.string().describe('Output format (reserved for future use)').optional(),
  };
  const workflowMarkCompleteNextSchema = z.object(workflowMarkCompleteNextRawShape);
  server.registerTool(
    'workflow_mark_complete_next',
    {
      description:
        'Marks a task as complete (🟢 Done) and immediately suggests the next task to work on. Streamlines workflow by combining task completion with next task recommendation. Useful for maintaining momentum and following proper task sequences.',
      inputSchema: workflowMarkCompleteNextRawShape,
      annotations: {
        title: 'Mark Complete and Get Next',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof workflowMarkCompleteNextSchema>) => {
      try {
        const nextTaskResult = await findNextTask(params.id);
        const updateResult = await updateTask(params.id, { metadata: { status: '🟢 Done' } });
        if (!updateResult.success) {
          return formatResponse(updateResult);
        }
        if (!nextTaskResult.success) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    success: true,
                    data: { updated: updateResult.data, next: null },
                    message: `Task ${params.id} marked as Done. Error finding next task: ${nextTaskResult.error}`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  success: true,
                  data: { updated: updateResult.data, next: nextTaskResult.data },
                  message: updateResult.message,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task move tool
  const taskMoveRawShape = {
    id: z.string().describe('Task ID to move'),
    target_subdirectory: z
      .string()
      .describe('Target feature/area directory (e.g., "FEATURE_Security")'),
    target_phase: z.string().describe('Target phase if moving between phases').optional(),
    search_phase: z.string().describe('Current phase to search in (helps locate task)').optional(),
    search_subdirectory: z
      .string()
      .describe('Current subdirectory to search in (helps locate task)')
      .optional(),
  };
  const taskMoveSchema = z.object(taskMoveRawShape);
  server.registerTool(
    'task_move',
    {
      description:
        'Moves a task to a different feature/area subdirectory or phase while preserving all metadata and relationships. Use this to reorganize tasks, reassign to different features/areas, or move between project phases. Requires target_subdirectory parameter.',
      inputSchema: taskMoveRawShape,
      annotations: {
        title: 'Move Task',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof taskMoveSchema>) => {
      try {
        const result = await moveTask(params.id, {
          targetSubdirectory: params.target_subdirectory,
          targetPhase: params.target_phase,
          searchPhase: params.search_phase,
          searchSubdirectory: params.search_subdirectory,
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature list tool
  const featureListRawShape = {
    phase: z.string().optional(),
    status: z.string().optional(),
    format: z.string().optional(),
    include_tasks: z.boolean().optional(),
    include_progress: z.boolean().optional(),
  };
  const featureListSchema = z.object(featureListRawShape);
  server.registerTool(
    'feature_list',
    {
      description: 'List Features',
      inputSchema: featureListRawShape,
      annotations: {
        title: 'List Features',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof featureListSchema>) => {
      try {
        const filterOptions: FeatureFilterOptions = {
          phase: params.phase,
          status: params.status,
          include_tasks: params.include_tasks,
          include_progress: params.include_progress !== false,
        };
        const result = await listFeatures(filterOptions);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature get tool
  const featureGetRawShape = {
    id: z.string(),
    phase: z.string().optional(),
    format: z.string().optional(),
  };
  const featureGetSchema = z.object(featureGetRawShape);
  server.registerTool(
    'feature_get',
    {
      description: 'Get Feature',
      inputSchema: featureGetRawShape,
      annotations: {
        title: 'Get Feature',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof featureGetSchema>) => {
      try {
        const result = await getFeature(params.id, { phase: params.phase });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature create tool
  const featureCreateRawShape = {
    name: z.string(),
    title: z.string(),
    phase: z.string(),
    type: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    assignee: z.string().optional(),
    tags: z.array(z.string()).optional(),
  };
  const featureCreateSchema = z.object(featureCreateRawShape);
  server.registerTool(
    'feature_create',
    {
      description: 'Create Feature',
      inputSchema: featureCreateRawShape,
      annotations: {
        title: 'Create Feature',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof featureCreateSchema>) => {
      try {
        const result = await createFeature(params.name, {
          title: params.title,
          phase: params.phase,
          type: params.type || '🌟 Feature',
          description: params.description,
          assignee: params.assignee,
          tags: params.tags,
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature update tool
  const featureUpdateRawShape = {
    id: z.string(),
    updates: z.object({
      name: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
    }),
    phase: z.string().optional(),
  };
  const featureUpdateSchema = z.object(featureUpdateRawShape);
  server.registerTool(
    'feature_update',
    {
      description: 'Update Feature',
      inputSchema: featureUpdateRawShape,
      annotations: {
        title: 'Update Feature',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof featureUpdateSchema>) => {
      try {
        const updateOptions: FeatureUpdateOptions = {
          name: params.updates.name,
          title: params.updates.title,
          description: params.updates.description,
          status: params.updates.status,
        };
        const result = await updateFeature(params.id, updateOptions, { phase: params.phase });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature delete tool
  const featureDeleteRawShape = {
    id: z.string(),
    phase: z.string().optional(),
    force: z.boolean().optional(),
  };
  const featureDeleteSchema = z.object(featureDeleteRawShape);
  server.registerTool(
    'feature_delete',
    {
      description: 'Delete Feature',
      inputSchema: featureDeleteRawShape,
      annotations: {
        title: 'Delete Feature',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof featureDeleteSchema>) => {
      try {
        const result = await deleteFeature(params.id, {
          phase: params.phase,
          force: params.force,
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area list tool
  const areaListRawShape = {
    phase: z.string().optional(),
    status: z.string().optional(),
    format: z.string().optional(),
    include_tasks: z.boolean().optional(),
    include_progress: z.boolean().optional(),
  };
  const areaListSchema = z.object(areaListRawShape);
  server.registerTool(
    'area_list',
    {
      description: 'List Areas',
      inputSchema: areaListRawShape,
      annotations: {
        title: 'List Areas',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof areaListSchema>) => {
      try {
        const filterOptions: AreaFilterOptions = {
          phase: params.phase,
          status: params.status,
          include_tasks: params.include_tasks,
          include_progress: params.include_progress !== false,
        };
        const result = await listAreas(filterOptions);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area get tool
  const areaGetRawShape = {
    id: z.string(),
    phase: z.string().optional(),
    format: z.string().optional(),
  };
  const areaGetSchema = z.object(areaGetRawShape);
  server.registerTool(
    'area_get',
    {
      description: 'Get Area',
      inputSchema: areaGetRawShape,
      annotations: {
        title: 'Get Area',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof areaGetSchema>) => {
      try {
        const result = await getArea(params.id, { phase: params.phase });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area create tool
  const areaCreateRawShape = {
    name: z.string(),
    title: z.string(),
    phase: z.string(),
    type: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    assignee: z.string().optional(),
    tags: z.array(z.string()).optional(),
  };
  const areaCreateSchema = z.object(areaCreateRawShape);
  server.registerTool(
    'area_create',
    {
      description: 'Create Area',
      inputSchema: areaCreateRawShape,
      annotations: {
        title: 'Create Area',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof areaCreateSchema>) => {
      try {
        const result = await createArea(params.name, {
          title: params.title,
          phase: params.phase,
          type: params.type || '🧹 Chore',
          description: params.description,
          assignee: params.assignee,
          tags: params.tags,
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area update tool
  const areaUpdateRawShape = {
    id: z.string(),
    updates: z.object({
      name: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
    }),
    phase: z.string().optional(),
  };
  const areaUpdateSchema = z.object(areaUpdateRawShape);
  server.registerTool(
    'area_update',
    {
      description: 'Update Area',
      inputSchema: areaUpdateRawShape,
      annotations: {
        title: 'Update Area',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof areaUpdateSchema>) => {
      try {
        const updateOptions: AreaUpdateOptions = {
          name: params.updates.name,
          title: params.updates.title,
          description: params.updates.description,
          status: params.updates.status,
        };
        const result = await updateArea(params.id, updateOptions, { phase: params.phase });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area delete tool
  const areaDeleteRawShape = {
    id: z.string(),
    phase: z.string().optional(),
    force: z.boolean().optional(),
  };
  const areaDeleteSchema = z.object(areaDeleteRawShape);
  server.registerTool(
    'area_delete',
    {
      description: 'Delete Area',
      inputSchema: areaDeleteRawShape,
      annotations: {
        title: 'Delete Area',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof areaDeleteSchema>) => {
      try {
        const result = await deleteArea(params.id, { phase: params.phase, force: params.force });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Template list tool
  const templateListRawShape = {
    format: z.string().describe('Output format (reserved for future use)').optional(),
  };
  const templateListSchema = z.object(templateListRawShape);
  server.registerTool(
    'template_list',
    {
      description:
        'Lists available task templates with their types and descriptions. Essential for discovering valid task types in your project since types are template-driven. Each template defines a task type (like "🌟 Feature", "🐞 Bug") that can be used when creating or filtering tasks. Always check this before using task_create or filtering by type.',
      inputSchema: templateListRawShape,
      annotations: {
        title: 'List Templates',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (_params: z.infer<typeof templateListSchema>) => {
      try {
        const templates = listTemplates();
        return formatResponse({
          success: true,
          data: templates,
          message: `Found ${templates.length} templates`,
        });
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Init root configuration tool
  const initRootRawShape = {
    path: z
      .string()
      .describe('Absolute path to project root directory. Must already contain a .tasks or .ruru directory to be valid.'),
  };
  const initRootSchema = z.object(initRootRawShape);
  server.registerTool(
    'init_root',
    {
      description:
        'Sets the project root directory for the MCP session. The directory must already contain a .tasks or .ruru subdirectory to be valid. This configuration is session-specific and allows the MCP server to work with the correct project context. Note: Unlike the CLI, this does not create the .tasks directory - it must already exist.',
      inputSchema: initRootRawShape,
      annotations: {
        title: 'Initialize Root Configuration',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof initRootSchema>) => {
      try {
        const { ConfigurationManager } = await import('../core/config/configuration-manager.js');
        const configManager = ConfigurationManager.getInstance();
        if (!configManager.validateRoot(params.path)) {
          return formatResponse({
            success: false,
            error: `Invalid project root: ${params.path} does not contain .tasks or .ruru directory`,
          });
        }
        configManager.setRootFromSession(params.path);
        return formatResponse({
          success: true,
          data: {
            path: params.path,
            source: 'session',
            validated: true,
          },
          message: `Successfully set project root to: ${params.path}`,
        });
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get current root tool
  const getCurrentRootRawShape = {};
  const getCurrentRootSchema = z.object(getCurrentRootRawShape);
  server.registerTool(
    'get_current_root',
    {
      description:
        'Returns the currently configured project root directory, including its source (how it was detected) and validation status. Useful for debugging configuration issues or confirming the active project context.',
      inputSchema: getCurrentRootRawShape,
      annotations: {
        title: 'Get Current Root',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (_params: z.infer<typeof getCurrentRootSchema>) => {
      try {
        const { ConfigurationManager } = await import('../core/config/configuration-manager.js');
        const configManager = ConfigurationManager.getInstance();
        const rootConfig = configManager.getRootConfig();
        return formatResponse({
          success: true,
          data: {
            path: rootConfig.path,
            source: rootConfig.source,
            validated: rootConfig.validated,
            projectName: rootConfig.projectName,
          },
          message: `Current root: ${rootConfig.path} (source: ${rootConfig.source})`,
        });
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List projects tool
  const listProjectsRawShape = {};
  const listProjectsSchema = z.object(listProjectsRawShape);
  server.registerTool(
    'list_projects',
    {
      description:
        'Lists all configured projects from the Scopecraft configuration file. Returns project names and paths, useful for switching between multiple projects or understanding the available project contexts.',
      inputSchema: listProjectsRawShape,
      annotations: {
        title: 'List Projects',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (_params: z.infer<typeof listProjectsSchema>) => {
      try {
        const { ConfigurationManager } = await import('../core/config/configuration-manager.js');
        const configManager = ConfigurationManager.getInstance();
        const projects = configManager.getProjects();
        return formatResponse({
          success: true,
          data: projects,
          message: `Found ${projects.length} configured projects`,
        });
      } catch (error) {
        return formatError(error);
      }
    }
  );

  if (verbose) {
    // No logging output to avoid interfering with MCP protocol
  }

  return server;
}

/**
 * Format a successful response
 * @param result The operation result
 * @returns Formatted response for the MCP SDK
 */
export function formatResponse(result: {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}) {
  if (!result.success) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: false,
              error: result.error,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            success: true,
            data: result.data,
            message: result.message,
          },
          null,
          2
        ),
      },
    ],
  };
}

/**
 * Format an error response
 * @param error The error
 * @returns Formatted error for the MCP SDK
 */
export function formatError(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            success: false,
            error: errorMessage,
          },
          null,
          2
        ),
      },
    ],
    isError: true,
  };
}
