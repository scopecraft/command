import { serve } from 'bun';
import { join } from 'path';
import { stat } from 'fs/promises';
import { lookup } from 'mrmime';
import { createClaudeWebSocketHandler } from './websocket/claude-handler.js';
import { ProcessManager } from './websocket/process-manager.js';
import { logger } from './src/observability/logger.js';
import {
  handleTaskList,
  handleTaskGet,
  handleTaskCreate,
  handleTaskUpdate,
  handleTaskDelete,
  handleTaskNext,
  handlePhaseList,
  handlePhaseCreate,
  handleWorkflowCurrent,
  handleWorkflowMarkCompleteNext,
  handleFeatureList,
  handleFeatureGet,
  handleFeatureCreate,
  handleFeatureUpdate,
  handleFeatureDelete,
  handleAreaList,
  handleAreaGet,
  handleAreaCreate,
  handleAreaUpdate,
  handleAreaDelete,
  handleTaskMove
} from '../src/mcp/handlers.js';
import {
  handleSessionCheck,
  handleSessionStart
} from './server/claude-session-handlers.js';

// Configuration
const DIST_DIR = './tasks-ui/dist';
const PORT = process.env.PORT || 3000;
const API_PREFIX = '/api';

// Initialize WebSocket components
const processManager = new ProcessManager();
const claudeWebSocketHandler = createClaudeWebSocketHandler(processManager);

console.log(`Current working directory: ${process.cwd()}`);

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
      return await handleApiRequest(req, path.substring(API_PREFIX.length));
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
  const urlParams = Object.fromEntries(url.searchParams);
  
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
        // Convert include_content to a boolean if it exists as a string
        if (params.include_content) {
          params.include_content = params.include_content === 'true';
        }
        // Convert include_completed to a boolean if it exists as a string
        if (params.include_completed) {
          params.include_completed = params.include_completed === 'true';
        }
        
        const result = await handleTaskList(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'POST') {
        const result = await handleTaskCreate(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 201 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path.match(/^\/tasks\/[^\/]+$/)) {
      const id = path.split('/').pop() || '';
      
      if (req.method === 'GET') {
        const result = await handleTaskGet({ id, ...params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 404,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const result = await handleTaskUpdate({ id, updates: params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'DELETE') {
        const result = await handleTaskDelete({ id });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path === '/tasks/next') {
      if (req.method === 'GET') {
        const result = await handleTaskNext(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path === '/phases') {
      if (req.method === 'GET') {
        const result = await handlePhaseList(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'POST') {
        const result = await handlePhaseCreate(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 201 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path === '/workflow/current') {
      if (req.method === 'GET') {
        const result = await handleWorkflowCurrent(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path === '/workflow/mark-complete-next') {
      if (req.method === 'POST') {
        const result = await handleWorkflowMarkCompleteNext(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    // Feature endpoints
    if (path === '/features') {
      if (req.method === 'GET') {
        // Convert boolean string parameters to actual booleans
        if (params.include_progress) {
          params.include_progress = params.include_progress === 'true';
        }
        if (params.include_tasks) {
          params.include_tasks = params.include_tasks === 'true';
        }
        
        const result = await handleFeatureList(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'POST') {
        const result = await handleFeatureCreate(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 201 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path.match(/^\/features\/[^\/]+$/)) {
      const id = path.split('/').pop() || '';
      
      if (req.method === 'GET') {
        const result = await handleFeatureGet({ id, ...params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 404,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const result = await handleFeatureUpdate({ id, updates: params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'DELETE') {
        // Convert force parameter to boolean
        if (params.force) {
          params.force = params.force === 'true';
        }
        
        const result = await handleFeatureDelete({ id, force: params.force });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    // Area endpoints
    if (path === '/areas') {
      if (req.method === 'GET') {
        // Convert boolean string parameters to actual booleans
        if (params.include_progress) {
          params.include_progress = params.include_progress === 'true';
        }
        if (params.include_tasks) {
          params.include_tasks = params.include_tasks === 'true';
        }
        
        const result = await handleAreaList(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'POST') {
        const result = await handleAreaCreate(params);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 201 : 400,
          headers: corsHeaders
        });
      }
    }
    
    if (path.match(/^\/areas\/[^\/]+$/)) {
      const id = path.split('/').pop() || '';
      
      if (req.method === 'GET') {
        const result = await handleAreaGet({ id, ...params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 404,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const result = await handleAreaUpdate({ id, updates: params });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
      
      if (req.method === 'DELETE') {
        // Convert force parameter to boolean
        if (params.force) {
          params.force = params.force === 'true';
        }
        
        const result = await handleAreaDelete({ id, force: params.force });
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400,
          headers: corsHeaders
        });
      }
    }
    
    // Task Move endpoint
    if (path === '/tasks/move') {
      if (req.method === 'POST') {
        const result = await handleTaskMove(params);
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

logger.info('Server started successfully', {
  url: `http://localhost:${PORT}`
});