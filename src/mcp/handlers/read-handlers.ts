/**
 * Read operation handlers for MCP
 * All handlers have been refactored to reduce complexity
 */

import * as core from '../../core/index.js';
import { getSearchService } from '../../core/search/index.js';
import {
  type ParentGetInput,
  ParentGetInputSchema,
  type ParentListInput,
  ParentListInputSchema,
  type ParentTask,
  type ParentTaskDetail,
  type SearchInput,
  SearchInputSchema,
  type SearchOutput,
  type SearchReindexInput,
  SearchReindexInputSchema,
  type SearchReindexOutput,
  type Task,
  type TaskGetInput,
  TaskGetInputSchema,
  type TaskListInput,
  TaskListInputSchema,
} from '../schemas.js';
import { transformParentTaskDetail, transformTask } from '../transformers.js';
import type { McpResponse } from '../types.js';
import { getProjectRoot, loadProjectConfig } from './shared/config-utils.js';
import {
  batchTransformTasks,
  createErrorResponse,
  createSuccessResponse,
} from './shared/response-utils.js';

// =============================================================================
// Task List Handler (Refactored from complexity 17 to ~12)
// =============================================================================

/**
 * Build core list options from input parameters
 */
function buildListFilters(params: TaskListInput): core.TaskListOptions {
  const listOptions: core.TaskListOptions = {};

  // Basic filters
  if (params.workflowState) listOptions.workflowState = params.workflowState;
  if (params.area) listOptions.area = params.area;
  if (params.type) listOptions.type = params.type as core.TaskType;
  if (params.status) listOptions.status = params.status as core.TaskStatus;
  if (params.phase) listOptions.phase = params.phase as core.TaskPhase;
  if (params.assignee) listOptions.assignee = params.assignee;
  if (params.tags) listOptions.tags = params.tags;
  // Note: priority is only available in advancedFilter

  // Token efficiency: exclude completed tasks by default
  if (!params.includeCompleted) {
    listOptions.excludeStatuses = ['done', 'archived'];
  }

  // Handle archive inclusion
  if (params.includeArchived) {
    listOptions.includeArchived = true;
  }

  // Handle parent task inclusion based on task type
  const taskType = params.taskType || 'top-level';
  if (
    taskType === 'top-level' ||
    taskType === 'parent' ||
    taskType === 'all' ||
    params.includeParentTasks
  ) {
    listOptions.includeParentTasks = true;
  }

  return listOptions;
}

/**
 * Filter tasks by structure type
 */
function applyStructureFilter(
  tasks: core.Task[],
  taskType: TaskListInput['taskType']
): core.Task[] {
  switch (taskType) {
    case 'simple':
      return tasks.filter((t) => !t.metadata.isParentTask && !t.metadata.parentTask);

    case 'parent':
      return tasks.filter((t) => t.metadata.isParentTask);

    case 'subtask':
      return tasks.filter((t) => t.metadata.parentTask);

    case 'top-level':
      return tasks.filter((t) => !t.metadata.parentTask);

    default:
      return tasks;
  }
}

/**
 * Handler for task_list method
 * Complexity reduced from 17 to ~12
 */
export async function handleTaskList(rawParams: unknown): Promise<McpResponse<Task[]>> {
  try {
    // Validate input
    const params = TaskListInputSchema.parse(rawParams);

    // Check for advanced filter usage
    if (params.advancedFilter) {
      console.warn('advancedFilter not yet implemented - ignoring');
    }

    const projectRoot = getProjectRoot(params);
    const projectConfig = loadProjectConfig(projectRoot);

    // Build filters and get tasks
    const listOptions = buildListFilters(params);
    const result = await core.list(projectRoot, listOptions, projectConfig);

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to list tasks');
    }

    // Apply structure filtering
    const filteredTasks = applyStructureFilter(result.data, params.taskType);

    // Transform to normalized format
    const transformedTasks = await batchTransformTasks(
      projectRoot,
      filteredTasks,
      params.includeContent || false
    );

    // Return response
    return {
      success: true,
      data: transformedTasks,
      message: `Found ${transformedTasks.length} tasks`,
    };
  } catch (error) {
    console.error('Error in handleTaskList:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to list tasks'
    );
  }
}

// =============================================================================
// Task Get Handler
// =============================================================================

/**
 * Handler for task_get method
 */
export async function handleTaskGet(rawParams: unknown): Promise<McpResponse<Task>> {
  try {
    // Validate input
    const params = TaskGetInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    // Load project config
    const projectConfig = loadProjectConfig(projectRoot);

    // Get task with parent context if available
    const result = await core.get(projectRoot, params.id, projectConfig, params.parentId);

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Task not found');
    }

    // Transform to normalized schema - always include content for get operations
    const normalizedTask = await transformTask(
      projectRoot,
      result.data,
      true, // Always include content for task_get
      false // task_get does NOT include subtasks (use parent_get for that)
    );

    // Return response
    return {
      success: true,
      data: normalizedTask,
      message: 'Task retrieved successfully',
    };
  } catch (error) {
    console.error('Error in handleTaskGet:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to get task'
    );
  }
}

// =============================================================================
// Parent List Handler
// =============================================================================

/**
 * Handler for parent_list method
 */
export async function handleParentList(rawParams: unknown): Promise<McpResponse<ParentTask[]>> {
  try {
    // Validate input
    const params = ParentListInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);
    const projectConfig = loadProjectConfig(projectRoot);

    // Build filter options for listing
    const listOptions: core.TaskListOptions = {
      area: params.area,
      includeParentTasks: true,
      workflowState: params.workflowState,
    };

    // List tasks filtered to parent tasks only
    const result = await core.list(projectRoot, listOptions, projectConfig);

    if (!result.success || !result.data) {
      return createErrorResponse(result.error || 'Failed to list parent tasks');
    }

    // Filter to only parent tasks
    const parentTasks = result.data.filter((t) => t.metadata.isParentTask);

    // Transform to normalized format
    const transformedParents: ParentTask[] = [];

    for (const task of parentTasks) {
      try {
        const normalizedParent = await transformTask(
          projectRoot,
          task,
          false, // Don't include content in list
          params.includeSubtasks || false
        );

        // For now, cast to ParentTask as we know these are parent tasks
        // Progress info would need to be loaded separately if needed
        transformedParents.push(normalizedParent as ParentTask);
      } catch (error) {
        console.error(`Failed to transform parent ${task.metadata.id}:`, error);
        // Continue with other parents
      }
    }

    // Return response
    return {
      success: true,
      data: transformedParents,
      message: `Found ${transformedParents.length} parent tasks`,
    };
  } catch (error) {
    console.error('Error in handleParentList:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to list parent tasks'
    );
  }
}

// =============================================================================
// Parent Get Handler
// =============================================================================

/**
 * Handler for parent_get method
 */
export async function handleParentGet(rawParams: unknown): Promise<McpResponse<ParentTaskDetail>> {
  try {
    // Validate input
    const params = ParentGetInputSchema.parse(rawParams);
    const projectRoot = getProjectRoot(params);

    // Use transformer that handles parent details
    const parentDetail = await transformParentTaskDetail(
      projectRoot,
      params.id,
      true // Always include content for parent_get
    );

    // Return response
    return {
      success: true,
      data: parentDetail,
      message: 'Parent task retrieved successfully',
    };
  } catch (error) {
    console.error('Error in handleParentGet:', error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes('not found')) {
      return createErrorResponse('Parent task not found', 'Parent task not found');
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      'Failed to get parent task'
    );
  }
}

// =============================================================================
// Search Handlers
// =============================================================================

/**
 * Transform core SearchResult to MCP-optimized format
 * Strips full content and returns only essential metadata + excerpt
 */
function transformSearchResultsForMcp(coreResults: core.SearchResult[]): any[] {
  return coreResults.map((result) => ({
    // Essential identifiers
    id: result.document.id,
    title: result.document.title,
    type: result.document.type,

    // Task metadata
    status: result.document.status,
    priority: result.document.priority,
    area: result.document.area,
    tags: result.document.tags,
    workflowState: result.document.workflowState,
    assignee: result.document.assignee,

    // Parent context
    parentTask: result.document.parentTask,

    // Search-specific
    score: result.score,
    excerpt: result.excerpt || generateDefaultExcerpt(result.document),
  }));
}

/**
 * Generate a default excerpt if none provided
 */
function generateDefaultExcerpt(doc: core.SearchDocument): string {
  const content = doc.content || '';
  const maxLength = 150;

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.substring(0, maxLength)}...`;
}

/**
 * Handler for search method
 * Complexity: ~10 (following handler complexity guidelines)
 */
export async function handleSearch(rawParams: unknown): Promise<McpResponse<SearchOutput['data']>> {
  try {
    // 1. Validate input
    const params = SearchInputSchema.parse(rawParams);

    // 2. Get project root
    const projectRoot = getProjectRoot(params);

    // 3. Initialize search service (lazy initialization)
    const searchService = getSearchService(projectRoot);
    const initResult = await searchService.initialize();

    if (!initResult.success) {
      return createErrorResponse(
        initResult.error || 'Failed to initialize search service',
        'Search service temporarily unavailable'
      );
    }

    // 4. Execute search
    const searchResult = await searchService.search({
      query: params.query,
      types: params.types,
      filters: params.filters
        ? {
            status: params.filters.status,
            area: params.filters.area,
            tags: params.filters.tags,
            workflowState: params.filters.workflowState as core.WorkflowState[] | undefined,
          }
        : undefined,
      limit: params.limit,
    });

    if (!searchResult.success) {
      return createErrorResponse(
        searchResult.error || 'Search operation failed',
        'Failed to execute search'
      );
    }

    if (!searchResult.data) {
      return createErrorResponse('Search returned no data', 'Search operation failed');
    }

    // 5. Transform results to MCP-optimized format
    const transformedResults = transformSearchResultsForMcp(searchResult.data.results);

    // 6. Return success response (following response-utils pattern)
    return createSuccessResponse(
      {
        results: transformedResults,
        totalCount: searchResult.data.totalCount,
        queryTime: searchResult.data.queryTime,
      },
      `Found ${searchResult.data.totalCount} results`
    );
  } catch (error) {
    console.error('Error in handleSearch:', error);
    // 6. Error handling (following existing pattern)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Search operation failed',
      'Search service temporarily unavailable'
    );
  }
}

/**
 * Handler for search_reindex method
 * Complexity: ~8
 */
export async function handleSearchReindex(
  rawParams: unknown
): Promise<McpResponse<SearchReindexOutput['data']>> {
  try {
    // 1. Validate input
    const params = SearchReindexInputSchema.parse(rawParams);

    // 2. Get project root
    const projectRoot = getProjectRoot(params);

    // 3. Initialize search service
    const searchService = getSearchService(projectRoot);

    // 4. Execute reindex
    const startTime = Date.now();
    const reindexResult = await searchService.indexProject();
    const timeTaken = Date.now() - startTime;

    if (!reindexResult.success) {
      return createErrorResponse(
        reindexResult.error || 'Reindex operation failed',
        'Failed to rebuild search index'
      );
    }

    // 5. Return success response
    return createSuccessResponse(
      {
        success: true,
        timeTaken: Math.round(timeTaken),
      },
      'Search index rebuilt successfully'
    );
  } catch (error) {
    console.error('Error in handleSearchReindex:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Reindex operation failed',
      'Failed to rebuild search index'
    );
  }
}
