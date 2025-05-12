/**
 * Core MCP server implementation using the official SDK
 * This file contains the core server logic that can be reused across different transports
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from 'fs';
import path from 'path';

// Import core functionality
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
  TaskFilterOptions,
  generateTaskId
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
    const packageJson = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'package.json'),
      'utf-8'
    ));
    version = packageJson.version || version;
  } catch (error) {
    // Silently fail and use default version
  }

  // Create an MCP server instance
  const server = new McpServer({
    name: "Scopecraft Command MCP Server",
    version
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
function registerTools(server: McpServer, verbose: boolean = false): void {
  // Task list tool
  server.tool(
    "task_list",
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
      is_overview: z.boolean().optional()
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
        is_overview: params.is_overview
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
    "task_get",
    {
      id: z.string(),
      format: z.string().optional()
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
    "task_create",
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
      content: z.string().optional()
    },
    async (params) => {
      try {
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
        
        const task: Task = {
          metadata,
          content: params.content || `## ${params.title}\n\nTask description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n`
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
    "task_update",
    {
      id: z.string(),
      updates: z.object({
        metadata: z.record(z.any()).optional(),
        content: z.string().optional()
      }).optional()
    },
    async (params) => {
      try {
        // Validate updates object
        if (!params.updates) {
          return formatError(new Error("No updates provided"));
        }
        
        const result = await updateTask(params.id, params.updates);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task delete tool
  server.tool(
    "task_delete",
    {
      id: z.string()
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
    "task_next",
    {
      id: z.string().optional(),
      format: z.string().optional()
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
    "phase_list",
    {
      format: z.string().optional()
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
    "phase_create",
    {
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      status: z.string().optional(),
      order: z.number().optional()
    },
    async (params) => {
      try {
        const phase = {
          id: params.id,
          name: params.name,
          description: params.description,
          status: params.status || '🟡 Pending',
          order: params.order,
          tasks: []
        };
        
        const result = await createPhase(phase);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Workflow current tool
  server.tool(
    "workflow_current",
    {
      format: z.string().optional()
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
    "workflow_mark_complete_next",
    {
      id: z.string(),
      format: z.string().optional()
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
            content: [{ 
              type: "text", 
              text: JSON.stringify({ 
                success: true, 
                data: { updated: updateResult.data, next: null },
                message: `Task ${params.id} marked as Done. Error finding next task: ${nextTaskResult.error}`
              }, null, 2) 
            }]
          };
        }
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              success: true, 
              data: { updated: updateResult.data, next: nextTaskResult.data },
              message: updateResult.message
            }, null, 2) 
          }]
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  if (verbose) {
    console.log("Registered all MCP tools");
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
      content: [{ 
        type: "text", 
        text: JSON.stringify({ 
          success: false, 
          error: result.error 
        }, null, 2) 
      }],
      isError: true
    };
  }

  return {
    content: [{ 
      type: "text", 
      text: JSON.stringify({ 
        success: true, 
        data: result.data,
        message: result.message
      }, null, 2) 
    }]
  };
}

/**
 * Format an error response
 * @param error The error
 * @returns Formatted error for the MCP SDK
 */
export function formatError(error: unknown) {
  return {
    content: [{ 
      type: "text", 
      text: JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, null, 2) 
    }],
    isError: true
  };
}