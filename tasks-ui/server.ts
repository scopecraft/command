import { serve } from 'bun';
import { join } from 'path';
import { stat } from 'fs/promises';
import { lookup } from 'mrmime';
import { createClaudeWebSocketHandler } from './websocket/claude-handler.js';
import { ProcessManager } from './websocket/process-manager.js';
import { logger } from './src/observability/logger.js';
// Import method registry - the correct way to access MCP handlers
import { methodRegistry } from '../src/mcp/handlers.js';
import { McpMethod } from '../src/mcp/types.js';
import {
  handleSessionCheck,
  handleSessionStart
} from './server/claude-session-handlers.js';
import {
  handleAutonomousList,
  handleAutonomousGet,
  handleAutonomousLogs
} from './server/autonomous-handlers.js';

// Configuration
const DIST_DIR = './tasks-ui/dist';
const PORT = process.env.PORT || (process.env.NODE_ENV === 'development' ? 8888 : 3000);
const API_PREFIX = '/api';
const IS_DEV = process.env.NODE_ENV === 'development';

// Initialize WebSocket components
const processManager = new ProcessManager();
const claudeWebSocketHandler = createClaudeWebSocketHandler(processManager);

console.log(`Current working directory: ${process.cwd()}`);
console.log(`Starting server on port ${PORT}${IS_DEV ? ' (API only mode)' : ''}`);

// Serve the React SPA and API endpoints
const server = serve({
  port: PORT as number,
  async fetch(req: Request, server: any) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Upgrade to WebSocket if requested
    if (path === '/ws/claude' && req.headers.get('upgrade') === 'websocket') {
      const success = server.upgrade(req, {
        data: { connectionId: Math.random().toString(36).substr(2, 9) }
      });
      if (success) {
        return undefined;
      }
      return new Response('WebSocket upgrade failed', { status: 500 });
    }
    
    // Handle API requests
    if (path.startsWith(API_PREFIX)) {
      // Handle API requests
      return await handleApiRequest(req, path.substring(API_PREFIX.length));
    }
    
    // In development mode, only serve API and WebSocket, not static files
    if (IS_DEV) {
      return new Response('Not Found', { status: 404 });
    }
    
    // Clean the path to prevent directory traversal
    path = path.replace(/\.\.\//g, '').replace(/\/+/g, '/');
    
    // Default to index.html for the root
    if (path === '/') {
      path = '/index.html';
    }
    
    try {
      const filePath = join(DIST_DIR, path);
      
      // Check if the file exists and get its stats
      try {
        const stats = await stat(filePath);
        
        // If it's a directory, try to serve index.html from it
        if (stats.isDirectory()) {
          return new Response(await Bun.file(join(filePath, 'index.html')).text(), {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // Otherwise, serve the file with proper content type
        const mimeType = lookup(filePath) || 'application/octet-stream';
        return new Response(await Bun.file(filePath).arrayBuffer(), {
          headers: { 'Content-Type': mimeType }
        });
      } catch (err) {
        // If the file doesn't exist, try to serve index.html
        // This is for SPA routing to work correctly
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          return new Response(await Bun.file(join(DIST_DIR, 'index.html')).text(), {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        throw err;
      }
    } catch (err) {
      console.error('Error serving file:', err);
      return new Response('Not Found', { status: 404 });
    }
  },
  
  websocket: claudeWebSocketHandler
});

// Parse search parameters from URL query string
function parseSearchParams(params: Record<string, any>) {
  const parsed: Record<string, any> = { ...params };
  
  // Convert limit to number
  if (parsed.limit && typeof parsed.limit === 'string') {
    const limitNum = parseInt(parsed.limit, 10);
    parsed.limit = isNaN(limitNum) ? 50 : Math.min(limitNum, 100);
  }
  
  // Ensure types is an array
  if (parsed.types) {
    parsed.types = Array.isArray(parsed.types) ? parsed.types : [parsed.types];
  }
  
  // Parse nested filter parameters (filters.status, filters.area, etc.)
  if (parsed.filters || Object.keys(params).some(key => key.startsWith('filters.'))) {
    const filters: Record<string, string[]> = {};
    
    // Handle direct filters object
    if (parsed.filters && typeof parsed.filters === 'object') {
      Object.assign(filters, parsed.filters);
    }
    
    // Handle flattened filter parameters (filters.status, filters.area, etc.)
    for (const [key, value] of Object.entries(params)) {
      if (key.startsWith('filters.')) {
        const filterKey = key.substring(8); // Remove 'filters.' prefix
        filters[filterKey] = Array.isArray(value) ? value : [value];
      }
    }
    
    // Only set filters if we have any
    if (Object.keys(filters).length > 0) {
      parsed.filters = filters;
    }
    
    // Clean up flattened filter params
    for (const key of Object.keys(parsed)) {
      if (key.startsWith('filters.')) {
        delete parsed[key];
      }
    }
  }
  
  return parsed;
}

// Handle API requests by mapping them to MCP handlers
async function handleApiRequest(req: Request, path: string): Promise<Response> {
  // Setup CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders
    });
  }
  
  // Parse URL parameters for GET requests
  const url = new URL(req.url);
  const urlParams: Record<string, any> = {};
  
  // Handle multiple values for the same parameter
  for (const [key, value] of url.searchParams) {
    if (urlParams[key]) {
      // If key already exists, convert to array or append to array
      if (Array.isArray(urlParams[key])) {
        urlParams[key].push(value);
      } else {
        urlParams[key] = [urlParams[key], value];
      }
    } else {
      urlParams[key] = value;
    }
  }
  
  // Parse request body for POST/PUT/PATCH requests
  let body = {};
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON body' }),
        { status: 400, headers: corsHeaders }
      );
    }
  }
  
  // Combine URL parameters and body into a single params object
  const params = { ...urlParams, ...body };
  
  try {
    // Route API requests to the appropriate handler
    if (path === '/tasks') {
      if (req.method === 'GET') {
        // Convert boolean string parameters to actual booleans
        const booleanParams = ['include_content', 'include_completed', 'include_archived', 'include_parent_tasks', 'includeContent', 'includeCompleted', 'includeArchived', 'includeParentTasks'];
        for (const param of booleanParams) {
          if (params[param] === 'true' || params[param] === 'false') {
            params[param] = params[param] === 'true';
          }
        }
        
        const result = await methodRegistry[McpMethod.TASK_LIST](params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'POST') {
        const result = await methodRegistry[McpMethod.TASK_CREATE](params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 201 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path.match(/^\/tasks\/[^\/]+$/)) {
      const id = path.split('/').pop() || '';
      
      if (req.method === 'GET') {
        const result = await methodRegistry[McpMethod.TASK_GET]({ id, ...params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 404,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const result = await methodRegistry[McpMethod.TASK_UPDATE]({ id, updates: params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'DELETE') {
        const result = await methodRegistry[McpMethod.TASK_DELETE]({ id });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    
    // Parent Task endpoints
    if (path === '/parents') {
      if (req.method === 'GET') {
        // Convert boolean string parameters to actual booleans
        if (params.include_progress) {
          params.include_progress = params.include_progress === 'true';
        }
        if (params.include_subtasks) {
          params.include_subtasks = params.include_subtasks === 'true';
        }
        
        // Transform location to workflowState for MCP compatibility
        if (params.location) {
          params.workflowState = params.location;
          delete params.location;
        }
        
        const result = await methodRegistry[McpMethod.PARENT_LIST](params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'POST') {
        const result = await methodRegistry[McpMethod.PARENT_CREATE](params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 201 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path.match(/^\/parents\/[^\/]+$/)) {
      const parent_id = path.split('/').pop() || '';
      
      if (req.method === 'GET') {
        // Get parent task with subtasks
        const result = await methodRegistry[McpMethod.PARENT_GET]({ id: parent_id });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 404,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'POST') {
        // Parent operations (resequence, parallelize, add_subtask)
        const result = await methodRegistry[McpMethod.PARENT_OPERATIONS]({ parent_id, ...params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    
    // Task Move endpoint
    if (path === '/tasks/move') {
      if (req.method === 'POST') {
        const result = await methodRegistry[McpMethod.TASK_MOVE](params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    // Search endpoint
    if (path === '/search') {
      if (req.method === 'GET' || req.method === 'POST') {
        // Parse and normalize search parameters
        const searchParams = parseSearchParams(params);
        
        const result = await methodRegistry[McpMethod.SEARCH](searchParams);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    // Claude Session endpoints
    if (path === '/claude-sessions/check') {
      if (req.method === 'GET') {
        const result = await handleSessionCheck(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path === '/claude-sessions') {
      if (req.method === 'POST') {
        const result = await handleSessionStart(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 201 : 400,
          headers: corsHeaders
        });
      }
    }
    
    // Autonomous Session endpoints
    if (path === '/autonomous-sessions') {
      if (req.method === 'GET') {
        const result = await handleAutonomousList();
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path.match(/^\/autonomous-sessions\/[^\/]+$/)) {
      const taskId = path.split('/').pop() || '';
      
      if (req.method === 'GET') {
        const result = await handleAutonomousGet(taskId);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 404,
          headers: corsHeaders
        });
      }
    }
    
    if (path === '/autonomous-sessions/logs') {
      if (req.method === 'GET') {
        const limit = params.limit ? parseInt(params.limit as string) : 50;
        const result = await handleAutonomousLogs(limit);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    // Return 404 for unmatched API routes
    return new Response(
      JSON.stringify({ success: false, message: 'API endpoint not found' }),
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path: path,
      method: req.method
    });
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown server error'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Setup process manager with server reference
processManager.setServer(server);
processManager.setupShutdownHandlers();

logger.info(`Server started successfully${IS_DEV ? ' (API only mode)' : ''}`, {
  url: `http://localhost:${PORT}`,
  mode: IS_DEV ? 'development' : 'production'
});