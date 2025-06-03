import fs from 'node:fs';
import path from 'node:path';
/**
 * Core MCP server implementation using the official SDK
 * Implementation with workflow-based task system
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import * as core from '../core/index.js';

// Import method registry which has all handlers wrapped with transformation
import { methodRegistry } from './handlers.js';
import { McpMethod } from './types.js';

// Import input schemas for flexible validation
import {
  TaskPriorityInputSchema,
  TaskStatusInputSchema,
  TaskTypeInputSchema,
  WorkflowStateInputSchema,
} from './schemas.js';

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
  let version = '0.3.0';
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
  // Task structure enum for filtering
  const taskStructureEnum = z.enum(['simple', 'parent', 'subtask', 'top-level', 'all']);

  // Task list tool
  const taskListRawShape = {
    // Native filters
    location: z
      .union([WorkflowStateInputSchema, z.array(WorkflowStateInputSchema)])
      .describe(
        'Filter by workflow location(s): "backlog", "current", or "archive". Use array for multiple locations.'
      )
      .optional(),
    type: TaskTypeInputSchema.optional(),
    task_type: taskStructureEnum
      .describe(
        'Filter by task structure: "simple" (standalone tasks), "parent" (overview tasks), "subtask" (tasks within parents), "top-level" (simple + parent, no subtasks), or "all" (everything)'
      )
      .default('top-level')
      .optional(),
    status: TaskStatusInputSchema.optional(),
    area: z
      .string()
      .describe('Filter by functional area/component (e.g., "cli", "mcp", "ui", "core", "docs")')
      .optional(),

    // Include options for response control
    include_parent_tasks: z
      .boolean()
      .describe(
        'Include parent task folders with _overview.md in results. Parent tasks organize complex work with multiple subtasks (default: true)'
      )
      .optional(),
    include_content: z
      .boolean()
      .describe(
        'Include full task markdown content in response. WARNING: Significantly increases token usage - use sparingly (default: false)'
      )
      .optional(),
    include_completed: z
      .boolean()
      .describe(
        'Include completed/done tasks in results. Default excludes "Done" and "Archived" status tasks for token efficiency (default: false)'
      )
      .optional(),
    include_archived: z
      .boolean()
      .describe(
        'Include tasks from archive workflow folders. Archive contains completed work organized by month (default: false)'
      )
      .optional(),

    // Advanced frontmatter filters
    priority: TaskPriorityInputSchema.optional(),
    assignee: z
      .string()
      .describe('Filter by assigned username/person responsible for the task')
      .optional(),
    tags: z
      .array(z.string())
      .describe(
        'Filter by tags for categorization (e.g., ["backend", "api", "security"]). Returns tasks matching any tag'
      )
      .optional(),
  };

  const taskListSchema = z.object(taskListRawShape);
  server.registerTool(
    'task_list',
    {
      description:
        'Lists tasks with comprehensive filtering across the workflow-based task system. By default shows "top-level" view (simple tasks + parent overviews, no subtasks) - the most useful overview for understanding what work is available. Supports filtering by task structure, workflow location, task type, status, functional area, priority, assignee, and tags. Token-efficient by default. Use this as your primary tool for exploring and understanding the current state of work.',
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
        const result = await methodRegistry[McpMethod.TASK_LIST](params);
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
      .describe(
        'Task ID to retrieve (e.g., "auth-feature-05A", "02_implement-api-05B", or "01_design-api"). Use parent_id if task is a subtask.'
      )
      .min(1),
    parent_id: z
      .string()
      .describe(
        'Parent task ID for subtask resolution. Required when accessing subtasks like "02_implement-api" within "auth-feature-05A". Helps locate the correct subtask file.'
      )
      .optional(),
    format: z
      .enum(['full', 'summary'])
      .describe('Output format: "full" (complete content) or "summary" (metadata only)')
      .default('full')
      .optional(),
  };

  const taskGetSchema = z.object(taskGetRawShape);
  server.registerTool(
    'task_get',
    {
      description:
        'Retrieves complete details of a specific task including all metadata, content sections, and relationships. Essential for understanding task requirements, current status, and context before making updates. For subtasks within parent tasks, provide parent_id to ensure correct resolution. Returns workflow location, task structure, and all available content. Use this when you need full information about a task including its instruction, tasks checklist, deliverable, and log sections.',
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
        const result = await methodRegistry[McpMethod.TASK_GET](params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task create tool - use handler schema for validation
  const taskCreateRawShape = {
    title: z.string().describe('Task title/summary. Should be clear and actionable.').min(3).max(200),
    type: TaskTypeInputSchema,
    area: z.string().describe('Functional area/component').optional(),
    status: TaskStatusInputSchema.default('todo').optional(),
    priority: TaskPriorityInputSchema.default('medium').optional(),
    location: WorkflowStateInputSchema.default('backlog').optional(),
    parent_id: z.string().describe('Parent task ID to create this as a subtask').optional(),
    assignee: z.string().describe('Username or name of person assigned to this task').optional(),
    tags: z.array(z.string()).describe('Tags for categorization and filtering').optional(),
  };

  const taskCreateSchema = z.object(taskCreateRawShape);
  server.registerTool(
    'task_create',
    {
      description:
        'Creates a new task with auto-generated ID based on title. Tasks are created with type-specific templates that provide initial content structure. To modify content after creation, use task_get to view the template, then task_update to customize sections. Can create standalone tasks or subtasks within a parent. Tasks default to backlog unless specified.',
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
        const result = await methodRegistry[McpMethod.TASK_CREATE](params);
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
        status: TaskStatusInputSchema
          .optional(),
        priority: TaskPriorityInputSchema
          .optional(),
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
        "Updates a task's metadata and/or content. Use this after task_create to customize the template-generated content. Supports partial updates - only specified fields change. Can update metadata (status, priority, etc.) and individual sections (instruction, tasks, deliverable, log) independently.",
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
        const result = await methodRegistry[McpMethod.TASK_UPDATE](params);
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
    target_state: WorkflowStateInputSchema,
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
        'Moves tasks between workflow states. Automatically updates status based on transition unless disabled. Archive moves require YYYY-MM date.',
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
        const result = await methodRegistry[McpMethod.TASK_MOVE](params);
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
        const result = await methodRegistry[McpMethod.TASK_DELETE](params);
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
        const result = await methodRegistry[McpMethod.TEMPLATE_LIST](params);
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
        const result = await methodRegistry[McpMethod.CONFIG_INIT_ROOT](params);
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
        const result = await methodRegistry[McpMethod.CONFIG_GET_CURRENT_ROOT]({});
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
        const result = await methodRegistry[McpMethod.CONFIG_LIST_PROJECTS]({});
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
        const result = await methodRegistry[McpMethod.DEBUG_CODE_PATH]({});
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Parent list tool
  const parentListRawShape = {
    location: z
      .union([WorkflowStateInputSchema, z.array(WorkflowStateInputSchema)])
      .describe(
        'Filter by workflow location(s): "backlog", "current", or "archive". Use array for multiple locations.'
      )
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
        const result = await methodRegistry[McpMethod.PARENT_LIST](params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Parent get tool
  const parentGetRawShape = {
    id: z
      .string()
      .describe('Parent task ID to retrieve (e.g., "auth-feature-05A", "implement-structure")')
      .min(1),
  };

  const parentGetSchema = z.object(parentGetRawShape);
  server.registerTool(
    'parent_get',
    {
      description:
        'Retrieves complete details of a specific parent task including overview, all subtasks, and supporting files. Returns the parent task with all its subtasks in proper sequence order. Use this when you need full information about a parent task and its breakdown.',
      inputSchema: parentGetRawShape,
      annotations: {
        title: 'Get Parent Task Details',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof parentGetSchema>) => {
      try {
        const result = await methodRegistry[McpMethod.PARENT_GET](params);
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
    type: TaskTypeInputSchema,
    area: z.string().describe('Task area').default('general').optional(),
    status: TaskStatusInputSchema
      .default('todo')
      .optional(),
    priority: TaskPriorityInputSchema
      .default('medium')
      .optional(),
    location: WorkflowStateInputSchema
      .default('backlog')
      .optional(),
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
        const result = await methodRegistry[McpMethod.PARENT_CREATE](params);
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
      .describe(
        'Operation to perform on parent\'s subtasks: "resequence", "parallelize", or "add_subtask"'
      ),
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
        type: TaskTypeInputSchema
          .optional(),
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
        const result = await methodRegistry[McpMethod.PARENT_OPERATIONS](params);
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
        'Transformation operation: "promote" (simple→parent), "extract" (subtask→simple), or "adopt" (simple→subtask)'
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
        const result = await methodRegistry[McpMethod.TASK_TRANSFORM](params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  return server;
}
