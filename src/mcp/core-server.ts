import fs from 'node:fs';
import path from 'node:path';
/**
 * Core MCP server implementation using the official SDK
 * Implementation with workflow-based task system
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import * as v2 from '../core/v2/index.js';
import {
  handleTaskList,
  handleTaskGet,
  handleTaskCreate,
  handleTaskUpdate,
  handleTaskDelete,
  handleTaskMove,
  handleTaskNext,
  handleTaskTransform,
  handleParentList,
  handleParentCreate,
  handleParentOperations,
  handleTemplateList,
  handleWorkflowCurrent,
  handleWorkflowMarkCompleteNext,
  handleInitRoot,
  handleGetCurrentRoot,
  handleListProjects,
  handleDebugCodePath,
} from './handlers.js';

/**
 * Format a successful response
 * @param result The operation result
 * @returns Formatted response for the MCP SDK
 */
function formatResponse(result: {
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
function formatError(error: unknown) {
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

/**
 * Create a server instance with all tools registered
 * @param options Additional options
 * @returns A McpServer instance with all tools registered
 */
export function createServerInstance(options: { verbose?: boolean } = {}): McpServer {
  // Read package version from package.json
  let version = '0.3.0'; // V2 version
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
  const projectRoot = process.cwd(); // Default to cwd, will be overridden by root_dir param
  const templates = v2.listTemplates(projectRoot);
  const taskTypes = templates.map((t) => t.name).filter(Boolean);
  // Fallback to common types if no templates found
  const availableTaskTypes =
    taskTypes.length > 0
      ? taskTypes
      : ['feature', 'bug', 'chore', 'documentation', 'test', 'spike', 'idea'];

  // Common enums used across multiple tools
  const taskStatusEnum = z.enum(['To Do', 'In Progress', 'Done', 'Blocked', 'Archived']);
  const taskPriorityEnum = z.enum(['Highest', 'High', 'Medium', 'Low']);
  const taskTypeEnum = z.enum(availableTaskTypes as [string, ...string[]]);
  const workflowStateEnum = z.enum(['backlog', 'current', 'archive']);

  // Task list tool
  const taskListRawShape = {
    // V2 native filters
    location: z
      .union([workflowStateEnum, z.array(workflowStateEnum)])
      .describe('Filter by workflow location(s): backlog, current, or archive')
      .optional(),
    type: taskTypeEnum.describe('Filter by task type (based on available templates)').optional(),
    status: taskStatusEnum.describe('Filter by task status').optional(),
    area: z.string().describe('Filter by area (e.g., "cli", "mcp", "ui")').optional(),

    // Include options
    include_parent_tasks: z
      .boolean()
      .describe('Include parent task folders in results (default: true)')
      .optional(),
    include_content: z
      .boolean()
      .describe('Include full task content in response (default: false)')
      .optional(),
    include_completed: z
      .boolean()
      .describe('Include completed/done tasks in results (default: false for token efficiency)')
      .optional(),
    include_archived: z
      .boolean()
      .describe('Include tasks from archive workflow folder (default: false)')
      .optional(),

    // Subtask filtering
    parent_id: z.string().describe('List only subtasks of this parent task ID').optional(),

    // Custom frontmatter filters
    priority: taskPriorityEnum.describe('Filter by priority level').optional(),
    assignee: z.string().describe('Filter by assigned username').optional(),
    tags: z.array(z.string()).describe('Filter by tags (e.g., ["backend", "api"])').optional(),

  };

  const taskListSchema = z.object(taskListRawShape);
  server.registerTool(
    'task_list',
    {
      description:
        'Lists tasks with powerful filtering across workflow states. Supports filtering by type, status, area, priority, assignee, and tags. Can list subtasks of a specific parent or search across all tasks. V2: Uses workflow states (backlog/current/archive) instead of phases.',
      inputSchema: taskListRawShape,
      annotations: {
        title: 'List Tasks',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof taskListSchema>) => {
      try {
        const result = await handleTaskList(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task get tool
  const taskGetRawShape = {
    id: z
      .string()
      .describe('Task ID to retrieve (e.g., "auth-feature-05A" or "02_implement-api-05B")')
      .min(1),
    parent_id: z
      .string()
      .describe(
        'Parent task ID for subtask resolution. Helps locate subtasks like "02_implement-api"'
      )
      .optional(),
    format: z
      .enum(['full', 'summary'])
      .describe('Output format: full (all content), summary (metadata only)')
      .default('full')
      .optional(),
  };

  const taskGetSchema = z.object(taskGetRawShape);
  server.registerTool(
    'task_get',
    {
      description:
        'Retrieves complete details of a specific task. For subtasks, provide parent_id to help with resolution. V2: Returns task with workflow location and v2 structure.',
      inputSchema: taskGetRawShape,
      annotations: {
        title: 'Get Task Details',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof taskGetSchema>) => {
      try {
        const result = await handleTaskGet(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task create tool
  const taskCreateRawShape = {
    // Required fields
    title: z
      .string()
      .describe('Task title/summary. Will be used to generate task ID.')
      .min(3)
      .max(200),
    type: taskTypeEnum.describe('Task type (must match available templates)'),
    area: z
      .string()
      .describe('Task area (e.g., "cli", "mcp", "ui", "core")')
      .default('general')
      .optional(),

    // Optional metadata
    status: taskStatusEnum.describe('Initial task status').default('To Do').optional(),
    priority: taskPriorityEnum.describe('Task priority level').default('Medium').optional(),
    location: workflowStateEnum
      .describe('Workflow location for new task')
      .default('backlog')
      .optional(),

    // Parent/subtask relationship
    parent_id: z
      .string()
      .describe('Parent task ID - creates this as a subtask with auto-generated sequence number')
      .optional(),

    // Custom frontmatter
    assignee: z.string().describe('Username of person assigned to this task').optional(),
    tags: z
      .array(z.string())
      .describe('Tags for categorization (e.g., ["backend", "api"])')
      .optional(),

    // Initial content
    instruction: z.string().describe('Initial instruction section content (markdown)').optional(),
    tasks: z
      .array(z.string())
      .describe(
        'Checklist items for the tasks section (e.g., ["Design API", "Implement endpoints"])'
      )
      .optional(),
    deliverable: z.string().describe('Initial deliverable section content (markdown)').optional(),

    content: z
      .string()
      .describe('DEPRECATED: Use instruction/tasks/deliverable instead')
      .optional(),
  };

  const taskCreateSchema = z.object(taskCreateRawShape);
  server.registerTool(
    'task_create',
    {
      description:
        'Creates a new task with auto-generated ID based on title. Can create standalone tasks or subtasks within a parent. Tasks default to backlog unless specified. V2: Uses workflow states and standardized sections.',
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
        const result = await handleTaskCreate(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task update tool
  const taskUpdateRawShape = {
    id: z.string().describe('Task ID to update'),
    parent_id: z.string().describe('Parent task ID for subtask resolution').optional(),

    // Update options
    updates: z
      .object({
        // Metadata updates
        title: z.string().describe('New task title (Note: does not change task ID)').optional(),
        status: taskStatusEnum.describe('New task status').optional(),
        priority: taskPriorityEnum.describe('New priority level').optional(),
        area: z.string().describe('New area').optional(),
        assignee: z.string().describe('New assignee').optional(),
        tags: z.array(z.string()).describe('New tags (replaces existing)').optional(),

        // Section updates
        instruction: z.string().describe('Replace instruction section content').optional(),
        tasks: z
          .string()
          .describe('Replace tasks section content (use markdown checklist format)')
          .optional(),
        deliverable: z.string().describe('Replace deliverable section content').optional(),
        log: z
          .string()
          .describe('Replace log section content (usually append new entries)')
          .optional(),

        // Add log entry helper
        add_log_entry: z
          .string()
          .describe(
            "Convenience: Add a timestamped entry to the log section (appends, doesn't replace)"
          )
          .optional(),

        // Legacy support
        metadata: z.record(z.unknown()).describe('DEPRECATED: Use individual fields').optional(),
        content: z.string().describe('DEPRECATED: Use section updates').optional(),
      })
      .describe('Fields to update. Only specified fields are changed.'),
  };

  const taskUpdateSchema = z.object(taskUpdateRawShape);
  server.registerTool(
    'task_update',
    {
      description:
        "Updates a task's metadata and/or content. Supports partial updates - only specified fields change. V2: Can update individual sections and supports proper status values.",
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
        const result = await handleTaskUpdate(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task move tool
  const taskMoveRawShape = {
    id: z.string().describe('Task ID to move'),
    parent_id: z.string().describe('Parent task ID for subtask resolution').optional(),
    target_state: workflowStateEnum.describe(
      'Target workflow location: backlog, current, or archive'
    ),
    archive_date: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .describe('Archive month in YYYY-MM format (required when moving to archive)')
      .optional(),
    update_status: z
      .boolean()
      .describe(
        'Auto-update task status based on workflow transition (e.g., current→Done, backlog→To Do)'
      )
      .default(true)
      .optional(),
  };

  const taskMoveSchema = z.object(taskMoveRawShape);
  server.registerTool(
    'task_move',
    {
      description:
        'Moves tasks between workflow states (backlog/current/archive). Automatically updates status based on transition unless disabled. Archive moves require YYYY-MM date. V2: Replaces phase-based moves.',
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
        const result = await handleTaskMove(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task delete tool
  const taskDeleteRawShape = {
    id: z.string().describe('Task ID to delete'),
    parent_id: z.string().describe('Parent task ID for subtask resolution').optional(),
    cascade: z
      .boolean()
      .describe('For parent tasks: delete entire folder including all subtasks')
      .default(false)
      .optional(),
  };

  const taskDeleteSchema = z.object(taskDeleteRawShape);
  server.registerTool(
    'task_delete',
    {
      description:
        'Permanently deletes a task file. For parent tasks, use cascade:true to delete the entire folder with subtasks. This operation cannot be undone.',
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
        const result = await handleTaskDelete(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task next tool (legacy)
  const taskNextRawShape = {
    id: z.string().describe('Current task ID (to find next in sequence)').optional(),
  };

  const taskNextSchema = z.object(taskNextRawShape);
  server.registerTool(
    'task_next',
    {
      description:
        'DEPRECATED: Task sequencing not implemented in V2. Returns null. Use parent task subtask ordering instead.',
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
        const result = await handleTaskNext(params);
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
        'Lists all in-progress tasks in the current workflow state. V2: Searches current/ folder for tasks with "In Progress" status.',
      inputSchema: workflowCurrentRawShape,
      annotations: {
        title: 'Get Current Workflow',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof workflowCurrentSchema>) => {
      try {
        const result = await handleWorkflowCurrent(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Workflow mark complete next tool
  const workflowMarkCompleteNextRawShape = {
    id: z.string().describe('Task ID to mark as complete'),
  };

  const workflowMarkCompleteNextSchema = z.object(workflowMarkCompleteNextRawShape);
  server.registerTool(
    'workflow_mark_complete_next',
    {
      description:
        'Marks a task as Done. V2: Updates status to "Done". Next task functionality not available in V2.',
      inputSchema: workflowMarkCompleteNextRawShape,
      annotations: {
        title: 'Mark Complete & Get Next',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof workflowMarkCompleteNextSchema>) => {
      try {
        const result = await handleWorkflowMarkCompleteNext(params);
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
        'Lists available task templates. Templates define initial content for different task types.',
      inputSchema: templateListRawShape,
      annotations: {
        title: 'List Templates',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof templateListSchema>) => {
      try {
        const result = await handleTemplateList(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area tools - still using v1
  // ... (keeping area tools as they are for now)

  // Configuration tools
  const initRootRawShape = {
    path: z.string().describe('Project root path to initialize'),
  };

  const initRootSchema = z.object(initRootRawShape);
  server.registerTool(
    'init_root',
    {
      description: 'Initialize or set the project root directory for the current session.',
      inputSchema: initRootRawShape,
      annotations: {
        title: 'Initialize Root',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof initRootSchema>) => {
      try {
        const result = await handleInitRoot(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get current root tool
  server.registerTool(
    'get_current_root',
    {
      description: 'Get the current project root configuration.',
      inputSchema: {},
      annotations: {
        title: 'Get Current Root',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      try {
        const result = await handleGetCurrentRoot({});
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List projects tool
  server.registerTool(
    'list_projects',
    {
      description: 'List all configured projects.',
      inputSchema: {},
      annotations: {
        title: 'List Projects',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      try {
        const result = await handleListProjects({});
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Debug tool
  server.registerTool(
    'debug_code_path',
    {
      description: 'Debug tool to verify which version of the code is running.',
      inputSchema: {},
      annotations: {
        title: 'Debug Code Path',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      try {
        const result = await handleDebugCodePath({});
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Parent list tool
  const parentListRawShape = {
    location: z
      .union([workflowStateEnum, z.array(workflowStateEnum)])
      .describe('Filter by workflow location(s)')
      .optional(),
    area: z.string().describe('Filter by area').optional(),
    include_progress: z
      .boolean()
      .describe('Include subtask completion statistics (done/total count)')
      .default(true)
      .optional(),
    include_subtasks: z
      .boolean()
      .describe('Include full subtask list with each parent')
      .default(false)
      .optional(),
  };

  const parentListSchema = z.object(parentListRawShape);
  server.registerTool(
    'parent_list',
    {
      description:
        'Lists parent tasks (folders with _overview.md). Shows task hierarchies and optionally includes progress stats and subtask details. Parent tasks represent complex work with multiple subtasks.',
      inputSchema: parentListRawShape,
      annotations: {
        title: 'List Parent Tasks',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof parentListSchema>) => {
      try {
        const result = await handleParentList(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Parent create tool
  const parentCreateRawShape = {
    title: z
      .string()
      .describe('Parent task title. Will create folder with _overview.md')
      .min(3)
      .max(200),
    type: taskTypeEnum.describe('Task type for the parent overview'),
    area: z.string().describe('Task area').default('general').optional(),
    status: taskStatusEnum.describe('Initial status').default('To Do').optional(),
    priority: taskPriorityEnum.describe('Priority level').default('Medium').optional(),
    location: workflowStateEnum.describe('Workflow location').default('backlog').optional(),
    overview_content: z
      .string()
      .describe('Initial content for _overview.md instruction section')
      .optional(),
    subtasks: z
      .array(
        z.object({
          title: z.string().describe('Subtask title'),
          sequence: z
            .string()
            .regex(/^\d{2}$/)
            .describe('Sequence number (e.g., "01", "02"). Auto-generated if not provided.')
            .optional(),
          parallel_with: z
            .string()
            .describe('Make parallel with this subtask ID (same sequence number)')
            .optional(),
        })
      )
      .describe('Initial subtasks to create')
      .optional(),
    assignee: z.string().optional(),
    tags: z.array(z.string()).optional(),
  };

  const parentCreateSchema = z.object(parentCreateRawShape);
  server.registerTool(
    'parent_create',
    {
      description:
        'Creates a parent task folder with _overview.md and optional initial subtasks. Parent tasks organize complex work with multiple subtasks that can be sequenced or run in parallel.',
      inputSchema: parentCreateRawShape,
      annotations: {
        title: 'Create Parent Task',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async (params: z.infer<typeof parentCreateSchema>) => {
      try {
        const result = await handleParentCreate(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Parent operations tool
  const parentOperationsRawShape = {
    parent_id: z.string().describe('Parent task ID to operate on'),
    operation: z
      .enum(['resequence', 'parallelize', 'add_subtask'])
      .describe("Operation to perform on parent's subtasks"),
    sequence_map: z
      .array(
        z.object({
          id: z.string().describe('Subtask ID (without parent path)'),
          sequence: z
            .string()
            .regex(/^\d{2}$/)
            .describe('New sequence number'),
        })
      )
      .describe('[resequence] New sequence assignments for subtasks')
      .optional(),
    subtask_ids: z
      .array(z.string())
      .describe('[parallelize] Subtask IDs to make parallel (will share same sequence)')
      .min(2)
      .optional(),
    target_sequence: z
      .string()
      .regex(/^\d{2}$/)
      .describe('[parallelize] Sequence number to assign to all parallel tasks')
      .optional(),
    subtask: z
      .object({
        title: z.string().describe('New subtask title'),
        type: taskTypeEnum.describe('Subtask type').optional(),
        after: z
          .string()
          .describe('Insert after this subtask ID (e.g., "02_design-api")')
          .optional(),
        sequence: z
          .string()
          .regex(/^\d{2}$/)
          .describe('Explicit sequence number (alternative to "after")')
          .optional(),
        template: z.string().describe('Template to use for subtask content').optional(),
      })
      .describe('[add_subtask] New subtask details')
      .optional(),
  };

  const parentOperationsSchema = z.object(parentOperationsRawShape);
  server.registerTool(
    'parent_operations',
    {
      description:
        "Perform bulk operations on a parent task's subtasks. Resequence to reorder tasks, parallelize to make tasks run simultaneously, or add new subtasks at specific positions.",
      inputSchema: parentOperationsRawShape,
      annotations: {
        title: 'Parent Task Operations',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async (params: z.infer<typeof parentOperationsSchema>) => {
      try {
        const result = await handleParentOperations(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task transform tool
  const taskTransformRawShape = {
    id: z.string().describe('Task ID to transform'),
    parent_id: z
      .string()
      .describe('Current parent ID (required for extract operation on subtasks)')
      .optional(),
    operation: z
      .enum(['promote', 'extract', 'adopt'])
      .describe(
        'Transformation operation: promote (simple→parent), extract (subtask→simple), adopt (simple→subtask)'
      ),
    initial_subtasks: z
      .array(z.string())
      .describe('[promote] Checklist items from tasks section to convert to subtasks')
      .optional(),
    target_parent_id: z
      .string()
      .describe(
        '[adopt] Parent task to adopt this task into (WARNING: adoption is currently broken in core)'
      )
      .optional(),
    sequence: z
      .string()
      .regex(/^\d{2}$/)
      .describe('[adopt] Sequence number for adopted subtask')
      .optional(),
    after: z
      .string()
      .describe('[adopt] Insert after this existing subtask (alternative to sequence)')
      .optional(),
  };

  const taskTransformSchema = z.object(taskTransformRawShape);
  server.registerTool(
    'task_transform',
    {
      description:
        'Transform tasks between simple and parent forms. Promote creates a parent folder from a simple task. Extract pulls a subtask out to standalone. Adopt moves a task into a parent (currently broken - will document in response).',
      inputSchema: taskTransformRawShape,
      annotations: {
        title: 'Transform Task Structure',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async (params: z.infer<typeof taskTransformSchema>) => {
      try {
        const result = await handleTaskTransform(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  return server;
}
