/**
 * Validation helpers for CLI commands
 * Uses the metadata schema to provide helpful error messages
 */

import {
  getAllowedValues,
  isValidPhase,
  isValidPriority,
  isValidStatus,
  isValidType,
  isValidWorkflowState,
} from '../core/metadata/schema-service.js';

/**
 * Validate and normalize task status
 */
export function validateStatus(status?: string): string | undefined {
  if (!status) return undefined;

  if (!isValidStatus(status)) {
    const allowed = getAllowedValues('status');
    throw new Error(`Invalid status "${status}". Allowed values: ${allowed.join(', ')}`);
  }

  return status;
}

/**
 * Validate and normalize task type
 */
export function validateType(type: string): string {
  if (!isValidType(type)) {
    const allowed = getAllowedValues('type');
    throw new Error(`Invalid type "${type}". Allowed values: ${allowed.join(', ')}`);
  }

  return type;
}

/**
 * Validate and normalize task priority
 */
export function validatePriority(priority?: string): string | undefined {
  if (!priority) return undefined;

  if (!isValidPriority(priority)) {
    const allowed = getAllowedValues('priority');
    throw new Error(`Invalid priority "${priority}". Allowed values: ${allowed.join(', ')}`);
  }

  return priority;
}

/**
 * Validate and normalize workflow state
 */
export function validateWorkflowState(state?: string): string | undefined {
  if (!state) return undefined;

  if (!isValidWorkflowState(state)) {
    const allowed = getAllowedValues('workflowState');
    throw new Error(`Invalid workflow state "${state}". Allowed values: ${allowed.join(', ')}`);
  }

  return state;
}

/**
 * Validate and normalize task phase
 */
export function validatePhase(phase?: string): string | undefined {
  if (!phase) return undefined;

  if (!isValidPhase(phase)) {
    const allowed = getAllowedValues('phase');
    throw new Error(`Invalid phase "${phase}". Allowed values: ${allowed.join(', ')}`);
  }

  return phase;
}
