/**
 * Metadata Schema Registry
 *
 * Central export point for metadata schema functionality
 */

export * from './types.js';
export * from './schema-service.js';

// Re-export commonly used functions for convenience
export {
  getSchema,
  getStatusLabel,
  getStatusName,
  getTypeLabel,
  getTypeName,
  getPriorityLabel,
  getPriorityName,
  getWorkflowStateLabel,
  getWorkflowStateName,
  getAllowedValues,
} from './schema-service.js';
