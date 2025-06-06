import { normalize } from 'path';
/**
 * Worktree API endpoints for Tasks UI
 * Implements the API endpoints defined in the architecture document
 */
import { z } from 'zod';
import { TaskCorrelationService, WorktreeService } from '../../core/worktree/index.js';
import { logger } from '../../observability/logger.js';

// Create a singleton WorktreeService instance
// The repo path will be set dynamically when requests are processed
const worktreeService = new WorktreeService(process.cwd());
const taskCorrelationService = new TaskCorrelationService(worktreeService);

// Cache for configuration
let dashboardConfig = {
  refreshInterval: 30000, // 30 seconds by default
  showTaskInfo: true,
  maxWorktrees: 20,
};

// Validation schemas for input parameters
const ConfigUpdateSchema = z.object({
  refreshInterval: z.number().int().positive().optional(),
  showTaskInfo: z.boolean().optional(),
  maxWorktrees: z.number().int().positive().optional(),
});

// Path sanitization function
function sanitizePath(path: string): string {
  // Normalize path and resolve to absolute path
  // This helps prevent path traversal attacks
  try {
    const normalized = normalize(path).replace(/\\/g, '/');
    if (normalized.includes('..')) {
      throw new Error('Path contains invalid characters');
    }
    return normalized;
  } catch (error) {
    throw new Error(`Invalid path: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract worktree ID from URL pattern
function extractWorktreeId(pathname: string): string | null {
  const match = pathname.match(/^\/api\/worktrees\/([^\/]+)(?:\/|$)/);
  return match ? match[1] : null;
}

/**
 * Handle worktree API requests
 */
export async function handleWorktreeRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    logger.debug(`Handling worktree API request: ${method} ${path}`);

    // Set up CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Handle main API endpoints
    if (path === '/api/worktrees' && method === 'GET') {
      return await handleListWorktrees(req, url);
    }

    if (path === '/api/worktrees/summary' && method === 'GET') {
      return await handleWorktreeSummary(req, url);
    }

    if (path === '/api/worktrees/config') {
      if (method === 'GET') {
        return await handleGetConfig();
      }

      if (method === 'POST') {
        return await handleUpdateConfig(req);
      }
    }

    // Check if this is a worktree-specific endpoint
    const worktreeId = extractWorktreeId(path);
    if (worktreeId) {
      // Handle endpoints with worktree ID

      if (path.endsWith('/status')) {
        return await handleWorktreeStatus(req, url, worktreeId);
      }

      if (path.endsWith('/changes')) {
        return await handleWorktreeChanges(req, url, worktreeId);
      }

      // If no specific endpoint matched, treat as a get worktree request
      if (method === 'GET') {
        return await handleGetWorktree(req, url, worktreeId);
      }
    }

    // If no route matched, return 404
    return Response.json(
      {
        success: false,
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: `No API endpoint found for ${method} ${path}`,
        },
      },
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Worktree API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown server error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET /api/worktrees
 */
async function handleListWorktrees(req: Request, url: URL): Promise<Response> {
  try {
    logger.info('Listing worktrees', {
      url: url.toString(),
      method: req.method,
    });

    // Parse query parameters
    const useCache = url.searchParams.get('cache') !== 'false';

    // Get all worktrees
    const worktrees = await worktreeService.listWorktrees(useCache);

    // Correlate worktrees with task metadata if requested
    const includeTaskInfo = url.searchParams.get('taskInfo') !== 'false';
    const result = includeTaskInfo
      ? await taskCorrelationService.correlateWorktreesWithTasks(worktrees)
      : worktrees;

    logger.info('Retrieved worktrees', {
      count: result.length,
      useCache,
      includeTaskInfo,
    });

    return Response.json({
      success: true,
      data: result,
      message: `Retrieved ${result.length} worktrees successfully`,
    });
  } catch (error) {
    logger.error('Failed to list worktrees', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      {
        success: false,
        error: {
          code: 'WORKTREE_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list worktrees',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET /api/worktrees/:worktreeId
 */
async function handleGetWorktree(req: Request, url: URL, worktreeId: string): Promise<Response> {
  try {
    if (!worktreeId) {
      logger.warn('Invalid worktree ID', { worktreeId });
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_WORKTREE_ID',
            message: 'Worktree ID is required',
          },
        },
        { status: 400 }
      );
    }

    logger.info('Getting worktree details', { worktreeId });

    // Validate and sanitize the worktree ID
    const sanitizedId = sanitizePath(decodeURIComponent(worktreeId));

    // Parse query parameters
    const useCache = url.searchParams.get('cache') !== 'false';

    // Get the worktree
    const worktree = await worktreeService.getWorktree(sanitizedId, useCache);

    // Correlate with task metadata if requested
    const includeTaskInfo = url.searchParams.get('taskInfo') !== 'false';
    const result = includeTaskInfo
      ? await taskCorrelationService.correlateWorktreeWithTask(worktree)
      : worktree;

    logger.info('Retrieved worktree details', {
      worktreeId: sanitizedId,
      branch: result.branch,
      status: result.status,
      hasTaskMetadata: !!result.taskId,
    });

    return Response.json({
      success: true,
      data: result,
      message: `Retrieved worktree ${sanitizedId} successfully`,
    });
  } catch (error) {
    logger.error('Failed to get worktree details', {
      worktreeId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      {
        success: false,
        error: {
          code: 'WORKTREE_GET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get worktree',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET /api/worktrees/:worktreeId/status
 */
async function handleWorktreeStatus(req: Request, url: URL, worktreeId: string): Promise<Response> {
  try {
    if (!worktreeId) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_WORKTREE_ID',
            message: 'Worktree ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate and sanitize the worktree ID
    const sanitizedId = sanitizePath(decodeURIComponent(worktreeId));

    // Parse query parameters
    const useCache = url.searchParams.get('cache') !== 'false';

    // Get the worktree status
    const status = await worktreeService.getWorktreeStatus(sanitizedId, useCache);

    return Response.json({
      success: true,
      data: { status },
      message: `Retrieved worktree status for ${sanitizedId} successfully`,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'WORKTREE_STATUS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get worktree status',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET /api/worktrees/:worktreeId/changes
 */
async function handleWorktreeChanges(
  req: Request,
  url: URL,
  worktreeId: string
): Promise<Response> {
  try {
    if (!worktreeId) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_WORKTREE_ID',
            message: 'Worktree ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate and sanitize the worktree ID
    const sanitizedId = sanitizePath(decodeURIComponent(worktreeId));

    // Parse query parameters
    const useCache = url.searchParams.get('cache') !== 'false';

    // Get the changed files
    const changedFiles = await worktreeService.getChangedFiles(sanitizedId, useCache);

    return Response.json({
      success: true,
      data: changedFiles,
      message: `Retrieved ${changedFiles.length} changed files for worktree ${sanitizedId}`,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'WORKTREE_CHANGES_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get worktree changes',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET /api/worktrees/summary
 */
async function handleWorktreeSummary(req: Request, url: URL): Promise<Response> {
  try {
    // Parse query parameters
    const useCache = url.searchParams.get('cache') !== 'false';

    // Get the worktree summary
    const summary = await worktreeService.getWorktreeSummary(useCache);

    return Response.json({
      success: true,
      data: summary,
      message: `Retrieved summary for ${summary.totalWorktrees} worktrees`,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'WORKTREE_SUMMARY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get worktree summary',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET /api/worktrees/config
 */
async function handleGetConfig(): Promise<Response> {
  try {
    return Response.json({
      success: true,
      data: dashboardConfig,
      message: 'Retrieved dashboard configuration successfully',
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'CONFIG_GET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get configuration',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle POST /api/worktrees/config
 */
async function handleUpdateConfig(req: Request): Promise<Response> {
  try {
    logger.info('Updating worktree dashboard configuration');

    // Parse the request body
    const body = await req.json();

    // Validate the configuration update
    const result = ConfigUpdateSchema.safeParse(body);

    if (!result.success) {
      logger.warn('Invalid configuration update', {
        validation_errors: result.error.format(),
      });

      return Response.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONFIG',
            message: 'Invalid configuration update',
            details: result.error.format(),
          },
        },
        { status: 400 }
      );
    }

    // Update the configuration
    const oldConfig = { ...dashboardConfig };
    dashboardConfig = {
      ...dashboardConfig,
      ...result.data,
    };

    logger.info('Updated dashboard configuration', {
      old: oldConfig,
      new: dashboardConfig,
      changes: result.data,
    });

    return Response.json({
      success: true,
      data: dashboardConfig,
      message: 'Updated dashboard configuration successfully',
    });
  } catch (error) {
    logger.error('Failed to update configuration', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      {
        success: false,
        error: {
          code: 'CONFIG_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update configuration',
        },
      },
      { status: 500 }
    );
  }
}
