import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as core from '../core/index.js';
import {
  type ConfigGetCurrentRootParams,
  type ConfigInitRootParams,
  type ConfigListProjectsParams,
  type DebugCodePathParams,
  McpMethod,
  type McpMethodRegistry,
  type TemplateListParams,
} from './types.js';

// Import handler wrapper
import { createMcpHandler } from './handler-wrapper.js';

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

// ============================================================================
// Legacy handlers - These haven't been normalized yet
// ============================================================================

/**
 * Handler for template_list method
 */
export async function handleTemplateList(params: TemplateListParams) {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = params.root_dir || configManager.getRootConfig().path;

  const templates = await core.listTemplates(projectRoot);

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

    // Initialize the project structure
    const projectRoot = params.path;

    // Check if init is needed
    const initNeeded = core.needsInit(projectRoot);
    if (initNeeded) {
      try {
        core.initializeProjectStructure(projectRoot);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to initialize project structure',
          message: 'Failed to initialize project structure',
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
        task_system_v2: true, // Keeping for backwards compatibility
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
  [McpMethod.TASK_LIST]: createMcpHandler(handleTaskListNormalized),
  [McpMethod.TASK_GET]: createMcpHandler(handleTaskGetNormalized),
  [McpMethod.PARENT_LIST]: createMcpHandler(handleParentListNormalized),
  [McpMethod.PARENT_GET]: createMcpHandler(handleParentGetNormalized),

  // Write operations
  [McpMethod.TASK_CREATE]: createMcpHandler(handleTaskCreateNormalized),
  [McpMethod.TASK_UPDATE]: createMcpHandler(handleTaskUpdateNormalized),
  [McpMethod.TASK_DELETE]: createMcpHandler(handleTaskDeleteNormalized),
  [McpMethod.TASK_MOVE]: createMcpHandler(handleTaskMoveNormalized),
  [McpMethod.TASK_TRANSFORM]: createMcpHandler(handleTaskTransformNormalized),
  [McpMethod.PARENT_CREATE]: createMcpHandler(handleParentCreateNormalized),
  [McpMethod.PARENT_OPERATIONS]: createMcpHandler(handleParentOperationsNormalized),

  // ============================================================================
  // Legacy handlers - Not yet normalized
  // ============================================================================

  // System operations
  [McpMethod.TEMPLATE_LIST]: createMcpHandler(handleTemplateList),
  [McpMethod.CONFIG_INIT_ROOT]: createMcpHandler(handleInitRoot),
  [McpMethod.CONFIG_GET_CURRENT_ROOT]: createMcpHandler(handleGetCurrentRoot),
  [McpMethod.CONFIG_LIST_PROJECTS]: createMcpHandler(handleListProjects),
  [McpMethod.DEBUG_CODE_PATH]: createMcpHandler(handleDebugCodePath),
};
