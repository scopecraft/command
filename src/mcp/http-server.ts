import { randomUUID } from 'node:crypto';
import { InMemoryEventStore } from '@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js';
/**
 * HTTP MCP server implementation using the official SDK
 * Uses StreamableHTTP transport
 */
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { createServerInstance } from './core-server.js';

// Default port for HTTP server
const DEFAULT_PORT = 3500;

/**
 * Start an HTTP MCP server
 * @param port Port for HTTP server
 * @param options Additional options
 * @returns A Promise that never resolves (to keep the process alive)
 */
export async function startHttpServer(
  port: number = DEFAULT_PORT,
  options: {
    verbose?: boolean;
  } = {}
): Promise<never> {
  // Create the server instance
  const server = createServerInstance(options);

  // Set up Express app for HTTP server
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
    if (options.verbose) {
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
        const eventStore = new InMemoryEventStore();
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          eventStore, // Enable resumability
          onsessioninitialized: (id) => {
            // Store the transport by session ID
            if (options.verbose) {
              console.log(`Session initialized with ID: ${id}`);
            }
            transports[id] = transport;
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            if (options.verbose) {
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
    if (options.verbose) {
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

    // Check for Last-Event-ID header for resumability
    const lastEventId = req.headers['last-event-id'] as string | undefined;
    if (lastEventId && options.verbose) {
      console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
    } else if (options.verbose) {
      console.log(`Establishing new SSE stream for session ${sessionId}`);
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  });

  // Handle DELETE requests for session termination
  app.delete('/mcp', async (req, res) => {
    if (options.verbose) {
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

    if (options.verbose) {
      console.log('Available methods:');
      console.log('- task_list');
      console.log('- task_get');
      console.log('- task_create');
      console.log('- task_update');
      console.log('- task_delete');
      console.log('- task_next');
      console.log('- phase_list');
      console.log('- phase_create');
      console.log('- phase_update');
      console.log('- phase_delete');
      console.log('- workflow_current');
      console.log('- workflow_mark_complete_next');
    }
  });

  // Handle server shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down HTTP server...');

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
      console.log('HTTP server shutdown complete');
    });

    // Close the MCP server
    await server.close();
    console.log('MCP server shutdown complete');
    process.exit(0);
  });

  // Return a promise that never resolves to keep the process alive
  return new Promise((_resolve) => {
    // This promise intentionally never resolves to keep the process running
    console.log('Server running indefinitely - press Ctrl+C to exit');
  });
}
