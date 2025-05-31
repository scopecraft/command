import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as v2 from '../core/index.js';
import {
  type ConfigGetCurrentRootParams,
  type ConfigInitRootParams,
  type ConfigListProjectsParams,
  type DebugCodePathParams,
  McpMethod,
  type McpMethodRegistry,
  type TemplateListParams,
} from './types.js';

// Import normalized handlers for read operations
import {
  handleParentGetNormalized,
  handleParentListNormalized,
  handleTaskGetNormalized,
  handleTaskListNormalized,
} from './normalized-handlers.js';

// Import normalized handlers for write operations
import {
  handleParentCreateNormalized,
  handleParentOperationsNormalized,
  handleTaskCreateNormalized,
  handleTaskDeleteNormalized,
  handleTaskMoveNormalized,
  handleTaskTransformNormalized,
  handleTaskUpdateNormalized,
} from './normalized-write-handlers.js';

/**
 * Format v2 operation result for MCP response
 */
function formatV2Response<T>(result: v2.OperationResult<T>) {
  return {
    success: result.success,
    data: result.data,
    error: result.error,
    message:
      result.error || (result.success ? 'Operation completed successfully' : 'Operation failed'),
  };
}

// ============================================================================
// Legacy handlers - These haven't been normalized yet
// ============================================================================

/**
 * Handler for template_list method
 */
export async function handleTemplateList(params: TemplateListParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  const templates = await v2.listTemplates(projectRoot);

  return {
    success: true,
    data: templates,
    message: `Found ${templates.length} templates`,
  };
}

// ============================================================================
// Configuration handlers
// ============================================================================

export async function handleInitRoot(params: ConfigInitRootParams) {
  try {
    const configManager = ConfigurationManager.getInstance();
    
    // For V2, we need to initialize the project structure using v2 functions
    const projectRoot = params.path;
    
    // Check if V2 init is needed
    const initNeeded = await v2.needsV2Init(projectRoot);
    if (initNeeded) {
      const initResult = await v2.initializeV2ProjectStructure(projectRoot);
      if (!initResult.success) {
        return {
          success: false,
          error: initResult.error,
          message: 'Failed to initialize V2 project structure',
        };
      }
    }

    // Set the root in config manager
    configManager.setRootFromCLI(projectRoot);

    return {
      success: true,
      data: {
        path: projectRoot,
        initialized: true,
      },
      message: 'Project initialized successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to initialize root',
    };
  }
}

export async function handleGetCurrentRoot(_params: ConfigGetCurrentRootParams) {
  try {
    const configManager = ConfigurationManager.getInstance();
    const rootConfig = configManager.getRootConfig();

    return {
      success: true,
      data: rootConfig,
      message: 'Current root configuration retrieved',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No root configured',
      message: 'Failed to get current root',
    };
  }
}

export async function handleListProjects(_params: ConfigListProjectsParams) {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projects = configManager.getProjects();

    return {
      success: true,
      data: projects,
      message: `Found ${projects.length} configured projects`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list projects',
      message: 'Error listing projects',
    };
  }
}

export async function handleDebugCodePath(_params: DebugCodePathParams) {
  const version = '20250528-mcp-normalized';
  return {
    success: true,
    data: {
      version,
      timestamp: new Date().toISOString(),
      implemented_features: {
        task_system: true,
        v2_task_system: true,
        workflow_states: true,
        parent_tasks: true,
        task_transformations: true,
        section_updates: true,
        phase_removed: true,
        feature_removed: true,
        normalized_api: true,
        zod_schemas: true,
        consistent_field_names: true,
      },
      message: 'MCP server running with normalized API and consistent field names',
    },
    message: `Debug code path handler is responding with version ${version}`,
  };
}

/**
 * Registry of all MCP method handlers
 * This is the single source of truth for all MCP method routing
 *
 * All core task operations use normalized handlers with:
 * - Zod schema validation
 * - Consistent field names (workflowState, parentId, etc.)
 * - Unified response envelope format
 * - Clean enum values (no emoji prefixes)
 */
export const methodRegistry: McpMethodRegistry = {
  // ============================================================================
  // Normalized handlers - Consistent API with Zod schemas
  // ============================================================================

  // Read operations
  [McpMethod.TASK_LIST]: handleTaskListNormalized,
  [McpMethod.TASK_GET]: handleTaskGetNormalized,
  [McpMethod.PARENT_LIST]: handleParentListNormalized,
  [McpMethod.PARENT_GET]: handleParentGetNormalized,

  // Write operations
  [McpMethod.TASK_CREATE]: handleTaskCreateNormalized,
  [McpMethod.TASK_UPDATE]: handleTaskUpdateNormalized,
  [McpMethod.TASK_DELETE]: handleTaskDeleteNormalized,
  [McpMethod.TASK_MOVE]: handleTaskMoveNormalized,
  [McpMethod.TASK_TRANSFORM]: handleTaskTransformNormalized,
  [McpMethod.PARENT_CREATE]: handleParentCreateNormalized,
  [McpMethod.PARENT_OPERATIONS]: handleParentOperationsNormalized,

  // ============================================================================
  // Legacy handlers - Not yet normalized
  // ============================================================================

  // System operations
  [McpMethod.TEMPLATE_LIST]: handleTemplateList,
  [McpMethod.CONFIG_INIT_ROOT]: handleInitRoot,
  [McpMethod.CONFIG_GET_CURRENT_ROOT]: handleGetCurrentRoot,
  [McpMethod.CONFIG_LIST_PROJECTS]: handleListProjects,
  [McpMethod.DEBUG_CODE_PATH]: handleDebugCodePath,
};
