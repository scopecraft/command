/**
 * MCP server implementation using the official SDK
 * Implements the complete server with all required methods
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from 'express';
import { randomUUID } from "node:crypto";
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

// Default port for HTTP server
const DEFAULT_PORT = 3500;

/**
 * Create and start an MCP server using the SDK
 * @param port Port for HTTP server
 * @param options Additional options
 * @returns A Promise that resolves to the HTTP server instance
 */
export async function startSdkServer(port: number = DEFAULT_PORT, options: { 
  verbose?: boolean 
} = {}): Promise<any> {
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

  // Start HTTP server with the MCP server
  return await startHttpServer(server, port, options.verbose);
}

/**
 * Register all tools with the MCP server
 * @param server The MCP server instance
 * @param verbose Whether to log verbose information
 */
function registerTools(server: McpServer, verbose: boolean = false): void {
  // Task list tool
  server.tool(
    "task.list",
    {
      status: z.string().optional(),
      type: z.string().optional(),
      assignee: z.string().optional(),
      tags: z.array(z.string()).optional(),
      phase: z.string().optional(),
      format: z.string().optional()
    },
    async (params) => {
      const filterOptions: TaskFilterOptions = {
        status: params.status,
        type: params.type,
        assignee: params.assignee,
        tags: params.tags,
        phase: params.phase
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
    "task.get",
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
    "task.create",
    {
      id: z.string().optional(),
      title: z.string(),
      type: z.string(),
      status: z.string().optional(),
      priority: z.string().optional(),
      assignee: z.string().optional(),
      phase: z.string().optional(),
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
        if (params.parent) metadata.parent_task = params.parent;
        if (params.depends) metadata.depends_on = params.depends;
        if (params.previous) metadata.previous_task = params.previous;
        if (params.next) metadata.next_task = params.next;
        if (params.tags) metadata.tags = params.tags;
        
        const task: Task = {
          metadata,
          content: params.content || `## ${params.title}\n\nTask description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n`
        };
        
        const result = await createTask(task);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Task update tool
  server.tool(
    "task.update",
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
    "task.delete",
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
    "task.next",
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
    "phase.list",
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
    "phase.create",
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
    "workflow.current",
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
    "workflow.markCompleteNext",
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
}

/**
 * Format a successful response
 * @param result The operation result
 * @returns Formatted response for the MCP SDK
 */
function formatResponse(result: any) {
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
function formatError(error: unknown) {
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

/**
 * Start an HTTP server with session management for the MCP server
 * @param server The MCP server instance
 * @param port Port for the HTTP server
 * @param verbose Whether to log verbose information
 */
async function startHttpServer(server: McpServer, port: number, verbose: boolean = false): Promise<any> {
  const app = express();
  app.use(express.json());
  
  // Enable CORS for all requests
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, MCP-Session-ID');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    
    next();
  });
  
  // Map to store transports by session ID
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  // Handle POST requests for client-to-server communication
  app.post('/mcp', async (req, res) => {
    if (verbose) {
      console.log('Received MCP POST request');
    }

    try {
      // Check for existing session ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        // Reuse existing transport
        transport = transports[sessionId];
      } else if (!sessionId) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            // Store the transport by session ID
            if (verbose) {
              console.log(`Session initialized with ID: ${id}`);
            }
            transports[id] = transport;
          }
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            if (verbose) {
              console.log(`Transport closed for session ${transport.sessionId}`);
            }
            delete transports[transport.sessionId];
          }
        };

        // Connect to the MCP server
        await server.connect(transport);
        
        await transport.handleRequest(req, res);
        return;
      } else {
        // Invalid request
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: req?.body?.id,
        });
        return;
      }

      // Handle the request
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: req?.body?.id,
        });
      }
    }
  });

  // Handle GET requests for server-to-client notifications
  app.get('/mcp', async (req, res) => {
    if (verbose) {
      console.log('Received MCP GET request');
    }
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }
    
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  });

  // Handle DELETE requests for session termination
  app.delete('/mcp', async (req, res) => {
    if (verbose) {
      console.log('Received MCP DELETE request');
    }
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }
    
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  });

  // Start the Express server
  const httpServer = app.listen(port, () => {
    console.log(`MCP Server running at http://localhost:${port}/mcp`);
    console.log('Using Streamable HTTP transport with the MCP SDK');
    
    if (verbose) {
      console.log('Registered methods:');
      console.log('- task.list');
      console.log('- task.get');
      console.log('- task.create');
      console.log('- task.update');
      console.log('- task.delete');
      console.log('- task.next');
      console.log('- phase.list');
      console.log('- phase.create');
      console.log('- workflow.current');
      console.log('- workflow.markCompleteNext');
    }
  });

  // Handle server shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    
    // Close all active transports
    for (const sessionId of Object.keys(transports)) {
      try {
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch (error) {
        console.error(`Error closing transport for session ${sessionId}:`, error);
      }
    }
    
    // Close the HTTP server
    httpServer.close(() => {
      console.log('Server shutdown complete');
      process.exit(0);
    });
  });
  
  // Return a promise that never resolves to keep the process alive
  return new Promise((resolve) => {
    // Never resolve the promise to keep the process running
    console.log("Server running indefinitely - press Ctrl+C to exit");

    // Return httpServer for potential use elsewhere
    return httpServer;
  });
}