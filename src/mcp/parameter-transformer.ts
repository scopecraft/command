/**
 * Parameter transformation utility for MCP handlers
 * Converts snake_case fields from MCP protocol to camelCase for internal use
 */
import camelcaseKeys from 'camelcase-keys';

/**
 * Handle special field mappings
 * Complexity: ~3
 */
function handleSpecialFieldMappings(transformed: Record<string, unknown>): void {
  // Special handling for location -> workflowState mapping
  if ('location' in transformed && !('workflowState' in transformed)) {
    transformed.workflowState = transformed.location;
    transformed.location = undefined;
  }
}

/**
 * Build operation-specific data for parent operations
 * Complexity: ~8
 */
function buildOperationData(
  operation: string,
  transformed: Record<string, unknown>
): Record<string, unknown> {
  const operationData: Record<string, unknown> = { operation };

  switch (operation) {
    case 'resequence':
      if (transformed.sequenceMap) {
        operationData.sequenceMap = transformed.sequenceMap;
        transformed.sequenceMap = undefined;
      }
      break;

    case 'parallelize':
      if (transformed.subtaskIds) {
        operationData.subtaskIds = transformed.subtaskIds;
        transformed.subtaskIds = undefined;
      }
      if (transformed.targetSequence) {
        operationData.targetSequence = transformed.targetSequence;
        transformed.targetSequence = undefined;
      }
      break;

    case 'add_subtask':
      if (transformed.subtask) {
        operationData.subtask = transformed.subtask;
        transformed.subtask = undefined;
      }
      break;
  }

  return operationData;
}

/**
 * Restructure parent operations parameters
 * Complexity: ~4
 */
function restructureParentOperations(transformed: Record<string, unknown>): void {
  // Check if this is a parent_operations request that needs restructuring
  if (
    transformed?.operation &&
    (transformed.sequenceMap || transformed.subtaskIds || transformed.subtask)
  ) {
    // Build operation-specific data
    const operationData = buildOperationData(transformed.operation as string, transformed);
    transformed.operationData = operationData;
  }
}

/**
 * Transform MCP parameters from snake_case to camelCase
 * Handles nested objects and arrays automatically
 * Complexity reduced from 21 to ~8
 */
export function transformMcpParams(params: unknown): unknown {
  // Type guard to ensure we have a valid object
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return params;
  }

  // Convert snake_case to camelCase
  const transformed = camelcaseKeys(params as Record<string, unknown>, { deep: true });

  // Apply special field mappings
  handleSpecialFieldMappings(transformed);

  // Restructure parent operations if needed
  restructureParentOperations(transformed);

  return transformed;
}
