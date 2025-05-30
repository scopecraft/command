import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as v2 from '../core/v2/index.js';
import {
  type AreaCreateParams,
  type AreaDeleteParams,
  type AreaGetParams,
  type AreaListParams,
  type AreaUpdateParams,
  type ConfigGetCurrentRootParams,
  type ConfigInitRootParams,
  type ConfigListProjectsParams,
  type DebugCodePathParams,
  McpMethod,
  type McpMethodRegistry,
  type TemplateListParams,
} from './types.js';

// Keep area imports from v1 for now
import { createArea, deleteArea, getArea, listAreas, updateArea } from '../core/index.js';

// Import normalized handlers for read operations
import {
  handleParentGetNormalized,
  handleParentListNormalized,
  handleTaskGetNormalized,
  handleTaskListNormalized,
} from './normalized-handlers.js';

// Import normalized handlers for write operations
import {
  handleTaskCreateNormalized,
  handleTaskUpdateNormalized,
  handleTaskDeleteNormalized,
  handleTaskMoveNormalized,
  handleTaskTransformNormalized,
  handleParentCreateNormalized,
  handleParentOperationsNormalized,
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

  const result = await v2.listTemplates(projectRoot);

  if (result.success && result.data) {
    return {
      success: true,
      data: result.data,
      message: `Found ${result.data.length} templates`,
    };
  }

  return formatV2Response(result);
}

// ============================================================================
// Area handlers - Still using V1 core
// ============================================================================

export async function handleAreaList(params: AreaListParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;
  const areas = await listAreas(projectRoot);
  return {
    success: true,
    data: areas,
    message: `Found ${areas.length} areas`,
  };
}

export async function handleAreaGet(params: AreaGetParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;
  const area = await getArea(projectRoot, params.id);
  return { success: true, data: area };
}

export async function handleAreaCreate(params: AreaCreateParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;
  const result = await createArea(projectRoot, {
    title: params.title,
    description: params.description,
    color: params.color,
  });
  return {
    success: result.success,
    data: result.data,
    error: result.error,
  };
}

export async function handleAreaUpdate(params: AreaUpdateParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;
  const result = await updateArea(projectRoot, params.id, params.updates);
  return result;
}

export async function handleAreaDelete(params: AreaDeleteParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;
  const result = await deleteArea(projectRoot, params.id);
  return result;
}

// ============================================================================
// Configuration handlers
// ============================================================================

export async function handleInitRoot(params: ConfigInitRootParams) {
  try {
    const configManager = ConfigurationManager.getInstance();
    const result = await configManager.initializeProject(params.path, {
      skipGitCheck: params.skipGitCheck,
      projectName: params.projectName,
    });

    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: result.message || 'Project initialized successfully',
      };
    }

    return {
      success: false,
      error: result.error,
      message: result.message || 'Failed to initialize project',
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
      data: {
        path: rootConfig.path,
        ...rootConfig,
      },
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
    const projects = configManager.listProjects();

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
  
  // Area operations (V1 core)
  [McpMethod.AREA_LIST]: handleAreaList,
  [McpMethod.AREA_GET]: handleAreaGet,
  [McpMethod.AREA_CREATE]: handleAreaCreate,
  [McpMethod.AREA_UPDATE]: handleAreaUpdate,
  [McpMethod.AREA_DELETE]: handleAreaDelete,
  
  // System operations
  [McpMethod.TEMPLATE_LIST]: handleTemplateList,
  [McpMethod.CONFIG_INIT_ROOT]: handleInitRoot,
  [McpMethod.CONFIG_GET_CURRENT_ROOT]: handleGetCurrentRoot,
  [McpMethod.CONFIG_LIST_PROJECTS]: handleListProjects,
  [McpMethod.DEBUG_CODE_PATH]: handleDebugCodePath,
};