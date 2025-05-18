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
    console.log(`Creating MCP server version ${version}`);
  }

  // Register all tools
  registerTools(server, options.verbose);

  return server;
}

/**
 * Register all tools with the MCP server
 */
function registerTools(server: McpServer, verbose = false): void {
  // Task list tool
  server.tool(
    'task_list',
    {
      status: z.string().optional(),
      type: z.string().optional(),
      assignee: z.string().optional(),
      tags: z.array(z.string()).optional(),
      phase: z.string().optional(),
      format: z.string().optional(),
      include_content: z.boolean().optional(),
      include_completed: z.boolean().optional(),
      subdirectory: z.string().optional(),
      is_overview: z.boolean().optional(),
    },
    async (params) => {
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
  server.tool(
    'task_get',
    {
      id: z.string(),
      format: z.string().optional(),
    },
    async (params) => {
      try {
        const result = await getTask(params.id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task create tool
  server.tool(
    'task_create',
    {
      id: z.string().optional(),
      title: z.string(),
      type: z.string(),
      status: z.string().optional(),
      priority: z.string().optional(),
      assignee: z.string().optional(),
      phase: z.string().optional(),
      subdirectory: z.string().optional(),
      parent: z.string().optional(),
      depends: z.array(z.string()).optional(),
      previous: z.string().optional(),
      next: z.string().optional(),
      tags: z.array(z.string()).optional(),
      content: z.string().optional(),
    },
    async (params) => {
      try {
        // Create the task object from the parameters
        const metadata: TaskMetadata = {
          id: params.id || '', // Let task-crud generate the ID
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

        const task: Task = {
          metadata,
          content:
            params.content ||
            `## ${params.title}\n\nTask description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n`,
        };

        const result = await createTask(task, params.subdirectory);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task update tool
  server.tool(
    'task_update',
    {
      id: z.string(),
      updates: z
        .object({
          // Add direct field updates to match TaskUpdateOptions interface
          status: z.string().optional(),
          priority: z.string().optional(),
          phase: z.string().optional(),
          subdirectory: z.string().optional(),
          new_id: z.string().optional(),

          // Keep existing metadata and content fields
          metadata: z.record(z.any()).optional(),
          content: z.string().optional(),
        })
        .optional(),
      phase: z.string().optional(),
      subdirectory: z.string().optional(),
    },
    async (params) => {
      try {
        // Validate updates object
        if (!params.updates) {
          return formatError(new Error('No updates provided'));
        }

        const result = await updateTask(
          params.id,
          params.updates,
          params.phase,
          params.subdirectory
        );
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task delete tool
  server.tool(
    'task_delete',
    {
      id: z.string(),
    },
    async (params) => {
      try {
        const result = await deleteTask(params.id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task next tool
  server.tool(
    'task_next',
    {
      id: z.string().optional(),
      format: z.string().optional(),
    },
    async (params) => {
      try {
        const result = await findNextTask(params.id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Phase list tool
  server.tool(
    'phase_list',
    {
      format: z.string().optional(),
    },
    async () => {
      try {
        const result = await listPhases();
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Phase create tool
  server.tool(
    'phase_create',
    {
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      status: z.string().optional(),
      order: z.number().optional(),
    },
    async (params) => {
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
  server.tool(
    'phase_update',
    {
      id: z.string(),
      updates: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        order: z.number().optional(),
      }),
    },
    async (params) => {
      try {
        const result = await updatePhase(params.id, params.updates);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Phase delete tool
  server.tool(
    'phase_delete',
    {
      id: z.string(),
      force: z.boolean().optional(),
    },
    async (params) => {
      try {
        const result = await deletePhase(params.id, { force: params.force });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Workflow current tool
  server.tool(
    'workflow_current',
    {
      format: z.string().optional(),
    },
    async () => {
      try {
        const inProgressResult = await listTasks({ status: '🔵 In Progress' });

        if (!inProgressResult.success) {
          return formatResponse(inProgressResult);
        }

        if (inProgressResult.data && inProgressResult.data.length === 0) {
          // Try alternative status text
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
  server.tool(
    'workflow_mark_complete_next',
    {
      id: z.string(),
      format: z.string().optional(),
    },
    async (params) => {
      try {
        // Get the next task before marking current as complete
        const nextTaskResult = await findNextTask(params.id);

        // Mark current task as complete
        const updateResult = await updateTask(params.id, { metadata: { status: '🟢 Done' } });

        if (!updateResult.success) {
          return formatResponse(updateResult);
        }

        if (!nextTaskResult.success) {
          return {
            content: [
              {
                type: 'text',
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
              type: 'text',
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
  server.tool(
    'task_move',
    {
      id: z.string(),
      target_subdirectory: z.string(),
      target_phase: z.string().optional(),
      search_phase: z.string().optional(),
      search_subdirectory: z.string().optional(),
    },
    async (params) => {
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
  server.tool(
    'feature_list',
    {
      phase: z.string().optional(),
      status: z.string().optional(),
      format: z.string().optional(),
      include_tasks: z.boolean().optional(),
      include_progress: z.boolean().optional(),
    },
    async (params) => {
      try {
        const filterOptions: FeatureFilterOptions = {
          phase: params.phase,
          status: params.status,
          include_tasks: params.include_tasks,
          include_progress: params.include_progress !== false, // Default to true
        };

        const result = await listFeatures(filterOptions);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature get tool
  server.tool(
    'feature_get',
    {
      id: z.string(),
      phase: z.string().optional(),
      format: z.string().optional(),
    },
    async (params) => {
      try {
        const result = await getFeature(params.id, params.phase);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature create tool
  server.tool(
    'feature_create',
    {
      name: z.string(),
      title: z.string(),
      phase: z.string(),
      type: z.string().optional(),
      status: z.string().optional(),
      description: z.string().optional(),
      assignee: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async (params) => {
      try {
        console.log(
          `[DEBUG] Feature Create (core-server): description=${params.description}, assignee=${params.assignee}`
        );
        const result = await createFeature(
          params.name,
          params.title,
          params.phase,
          params.type || '🌟 Feature',
          params.description,
          params.assignee,
          params.tags
        );
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature update tool
  server.tool(
    'feature_update',
    {
      id: z.string(),
      updates: z.object({
        name: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
      }),
      phase: z.string().optional(),
    },
    async (params) => {
      try {
        const updateOptions: FeatureUpdateOptions = {
          name: params.updates.name,
          title: params.updates.title,
          description: params.updates.description,
          status: params.updates.status,
        };

        const result = await updateFeature(params.id, updateOptions, params.phase);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Feature delete tool
  server.tool(
    'feature_delete',
    {
      id: z.string(),
      phase: z.string().optional(),
      force: z.boolean().optional(),
    },
    async (params) => {
      try {
        const result = await deleteFeature(params.id, params.phase, params.force);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area list tool
  server.tool(
    'area_list',
    {
      phase: z.string().optional(),
      status: z.string().optional(),
      format: z.string().optional(),
      include_tasks: z.boolean().optional(),
      include_progress: z.boolean().optional(),
    },
    async (params) => {
      try {
        const filterOptions: AreaFilterOptions = {
          phase: params.phase,
          status: params.status,
          include_tasks: params.include_tasks,
          include_progress: params.include_progress !== false, // Default to true
        };

        const result = await listAreas(filterOptions);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area get tool
  server.tool(
    'area_get',
    {
      id: z.string(),
      phase: z.string().optional(),
      format: z.string().optional(),
    },
    async (params) => {
      try {
        const result = await getArea(params.id, params.phase);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area create tool
  server.tool(
    'area_create',
    {
      name: z.string(),
      title: z.string(),
      phase: z.string(),
      type: z.string().optional(),
      status: z.string().optional(),
      description: z.string().optional(),
      assignee: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async (params) => {
      try {
        console.log(
          `[DEBUG] Area Create (core-server): description=${params.description}, assignee=${params.assignee}`
        );
        const result = await createArea(
          params.name,
          params.title,
          params.phase,
          params.type || '🧹 Chore',
          params.description,
          params.assignee,
          params.tags
        );
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area update tool
  server.tool(
    'area_update',
    {
      id: z.string(),
      updates: z.object({
        name: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
      }),
      phase: z.string().optional(),
    },
    async (params) => {
      try {
        const updateOptions: AreaUpdateOptions = {
          name: params.updates.name,
          title: params.updates.title,
          description: params.updates.description,
          status: params.updates.status,
        };

        const result = await updateArea(params.id, updateOptions, params.phase);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Area delete tool
  server.tool(
    'area_delete',
    {
      id: z.string(),
      phase: z.string().optional(),
      force: z.boolean().optional(),
    },
    async (params) => {
      try {
        const result = await deleteArea(params.id, params.phase, params.force);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Template list tool
  server.tool(
    'template_list',
    {
      format: z.string().optional(),
    },
    async (_params) => {
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

  if (verbose) {
    console.log('Registered all MCP tools');
  }

  return server;
}

/**
 * Format a successful response
 * @param result The operation result
 * @returns Formatted response for the MCP SDK
 */
export function formatResponse(result: any) {
  if (!result.success) {
    return {
      content: [
        {
          type: 'text',
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
        type: 'text',
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
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          null,
          2
        ),
      },
    ],
    isError: true,
  };
}
