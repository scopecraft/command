/**
 * Search Tool Definitions for MCP
 * Extracted from core-server.ts following Boy Scout Rule
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { methodRegistry } from '../handlers.js';
import { TaskStatusInputSchema, WorkflowStateInputSchema } from '../schemas.js';
import { McpMethod } from '../types.js';

/**
 * Format response helper (shared with core-server)
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
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

/**
 * Format error response
 */
function formatError(error: unknown): { content: any[]; isError: boolean } {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return {
    content: [
      {
        type: 'text',
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
 * Register search-related tools with the MCP server
 */
export function registerSearchTools(server: McpServer): void {
  // Search tool
  const searchRawShape = {
    query: z.string().describe('Search query text').optional(),
    types: z
      .array(z.enum(['task', 'doc']))
      .describe('Filter by content type')
      .optional(),
    filters: z
      .object({
        status: z.array(TaskStatusInputSchema).optional(),
        area: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        workflow_state: z.array(WorkflowStateInputSchema).optional(),
      })
      .describe('Filter search results')
      .optional(),
    limit: z.number().min(1).max(100).default(50).describe('Maximum results to return').optional(),
    root_dir: z.string().describe('Project root directory (overrides session default)').optional(),
  };

  const searchSchema = z.object(searchRawShape);
  server.registerTool(
    'search',
    {
      description:
        'Search tasks and documentation using full-text search with filtering capabilities. Returns matching results with relevance scores and text excerpts showing matched content. Use this tool for discovering tasks by keywords, finding related work, or locating specific information across the project.\n\nKey features:\n- Full-text search across task titles, content, and documentation\n- Filter by task metadata (status, area, tags, workflow state)\n- Returns excerpts with **highlighted** matched terms\n- Results sorted by relevance score\n- Token-efficient: returns only metadata + excerpt, not full content\n\nUsage tips:\n- For broad discovery: search with just a query term\n- For focused results: combine query with filters\n- To get full task content: use task_get with the returned ID\n- Empty query with filters: browse tasks by metadata only',
      inputSchema: searchRawShape,
      annotations: {
        title: 'Search Content',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof searchSchema>) => {
      try {
        const result = await methodRegistry[McpMethod.SEARCH](params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Search reindex tool
  const searchReindexRawShape = {
    root_dir: z.string().describe('Project root directory (overrides session default)').optional(),
  };

  const searchReindexSchema = z.object(searchReindexRawShape);
  server.registerTool(
    'search_reindex',
    {
      description:
        'Rebuild the search index to ensure all content is searchable with current data. Use this tool when search results seem outdated, after bulk imports, or if you suspect the index is corrupted.\n\nWhen to use:\n- After importing multiple tasks from another system\n- If search results are missing recently created content\n- After significant structural changes to the project\n- If search performance degrades\n\nWhat it does:\n- Scans all tasks and documentation\n- Rebuilds the search index from scratch\n- Returns success status and indexing time\n- Safe to run anytime (idempotent operation)',
      inputSchema: searchReindexRawShape,
      annotations: {
        title: 'Rebuild Search Index',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async (params: z.infer<typeof searchReindexSchema>) => {
      try {
        const result = await methodRegistry[McpMethod.SEARCH_REINDEX](params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
