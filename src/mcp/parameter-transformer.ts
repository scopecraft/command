/**
 * Parameter transformation utility for MCP handlers
 * Converts snake_case fields from MCP protocol to camelCase for internal use
 */
import camelcaseKeys from 'camelcase-keys';

/**
 * Transform MCP parameters from snake_case to camelCase
 * Handles nested objects and arrays automatically
 */
export function transformMcpParams(params: unknown): unknown {
  // Type guard to ensure we have a valid object
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return params;
  }
  
  const transformed = camelcaseKeys(params as Record<string, unknown>, { deep: true }) as any;
  
  // Special handling for parent_operations which needs restructuring
  if (transformed?.operation && (transformed.sequenceMap || transformed.subtaskIds || transformed.subtask)) {
    // Restructure flat parent_operations params into nested operationData
    const operationData: any = { operation: transformed.operation };
    
    switch (transformed.operation) {
      case 'resequence':
        if (transformed.sequenceMap) {
          operationData.sequenceMap = transformed.sequenceMap;
          delete transformed.sequenceMap;
        }
        break;
        
      case 'parallelize':
        if (transformed.subtaskIds) {
          operationData.subtaskIds = transformed.subtaskIds;
          delete transformed.subtaskIds;
        }
        if (transformed.targetSequence) {
          operationData.targetSequence = transformed.targetSequence;
          delete transformed.targetSequence;
        }
        break;
        
      case 'add_subtask':
        if (transformed.subtask) {
          operationData.subtask = transformed.subtask;
          delete transformed.subtask;
        }
        break;
    }
    
    transformed.operationData = operationData;
  }
  
  return transformed;
}