/**
 * Metadata Schema Service
 *
 * Simple functions for accessing and transforming metadata values
 *
 * Performance considerations:
 * - Schema is cached on first access to avoid repeated JSON parsing
 * - All lookups are O(n) where n is the number of values in each enum (typically < 10)
 * - For high-frequency operations (e.g. rendering large task lists), consider:
 *   1. Memoizing results at the application level if the same values are looked up repeatedly
 *   2. Pre-computing display values when tasks are loaded rather than during rendering
 *   3. Using the schema service's caching effectively by avoiding repeated getSchema() calls
 * - Current implementation is performant for typical use cases (< 1000 tasks displayed)
 */

import defaultSchema from './default-schema.json' with { type: 'json' };
import type { MetadataSchema, MetadataValue } from './types.js';

// Cache the schema to avoid repeated JSON parsing
let cachedSchema: MetadataSchema | null = null;

/**
 * Get the metadata schema
 * TODO: Later support loading project-specific schemas
 */
export function getSchema(): MetadataSchema {
  if (!cachedSchema) {
    cachedSchema = defaultSchema as MetadataSchema;
  }
  return cachedSchema;
}

// ============================================
// Workflow State transformations
// ============================================

export function getWorkflowStateLabel(name: string): string {
  const schema = getSchema();
  const state = schema.metadata.enums.workflowState.values.find((s) => s.name === name);
  return state?.label || name;
}

export function getWorkflowStateName(label: string): string {
  const schema = getSchema();
  const state = schema.metadata.enums.workflowState.values.find((s) => s.label === label);
  return state?.name || 'backlog';
}

export function getWorkflowStateValues(): MetadataValue[] {
  const schema = getSchema();
  return schema.metadata.enums.workflowState.values;
}

// ============================================
// Status transformations
// ============================================

export function getStatusLabel(name: string): string {
  const schema = getSchema();
  const status = schema.metadata.enums.status.values.find((s) => s.name === name);
  return status?.label || name;
}

export function getStatusName(label: string): string {
  const schema = getSchema();
  const status = schema.metadata.enums.status.values.find((s) => s.label === label);
  return status?.name || 'todo';
}

export function getStatusValues(): MetadataValue[] {
  const schema = getSchema();
  return schema.metadata.enums.status.values;
}

// ============================================
// Type transformations
// ============================================

export function getTypeLabel(name: string): string {
  const schema = getSchema();
  const type = schema.metadata.enums.type.values.find((t) => t.name === name);
  return type?.label || name;
}

export function getTypeName(label: string): string {
  const schema = getSchema();
  const type = schema.metadata.enums.type.values.find((t) => t.label === label);
  return type?.name || 'feature';
}

export function getTypeTemplate(name: string): string | undefined {
  const schema = getSchema();
  const type = schema.metadata.enums.type.values.find((t) => t.name === name);
  return type?.template;
}

export function getTypeValues(): MetadataValue[] {
  const schema = getSchema();
  return schema.metadata.enums.type.values;
}

// ============================================
// Priority transformations
// ============================================

export function getPriorityLabel(name: string): string {
  const schema = getSchema();
  const priority = schema.metadata.enums.priority.values.find((p) => p.name === name);
  return priority?.label || name;
}

export function getPriorityName(label: string): string {
  const schema = getSchema();
  const priority = schema.metadata.enums.priority.values.find((p) => p.label === label);
  return priority?.name || 'medium';
}

export function getPriorityValues(): MetadataValue[] {
  const schema = getSchema();
  return schema.metadata.enums.priority.values;
}

// ============================================
// Phase transformations
// ============================================

export function getPhaseLabel(name: string): string {
  const schema = getSchema();
  const phase = schema.metadata.enums.phase.values.find((p) => p.name === name);
  return phase?.label || name;
}

export function getPhaseName(label: string): string {
  const schema = getSchema();
  const phase = schema.metadata.enums.phase.values.find((p) => p.label === label);
  return phase?.name || 'planning';
}

export function getPhaseValues(): MetadataValue[] {
  const schema = getSchema();
  return schema.metadata.enums.phase.values;
}

// ============================================
// Icon and emoji helpers
// ============================================

export function getStatusEmoji(name: string): string | undefined {
  const schema = getSchema();
  const status = schema.metadata.enums.status.values.find((s) => s.name === name);
  return status?.emoji;
}

export function getStatusIcon(name: string): string | null | undefined {
  const schema = getSchema();
  const status = schema.metadata.enums.status.values.find((s) => s.name === name);
  return status?.icon;
}

export function getTypeEmoji(name: string): string | undefined {
  const schema = getSchema();
  const type = schema.metadata.enums.type.values.find((t) => t.name === name);
  return type?.emoji;
}

export function getTypeIcon(name: string): string | null | undefined {
  const schema = getSchema();
  const type = schema.metadata.enums.type.values.find((t) => t.name === name);
  return type?.icon;
}

export function getPriorityEmoji(name: string): string | undefined {
  const schema = getSchema();
  const priority = schema.metadata.enums.priority.values.find((p) => p.name === name);
  return priority?.emoji;
}

export function getPriorityIcon(name: string): string | null | undefined {
  const schema = getSchema();
  const priority = schema.metadata.enums.priority.values.find((p) => p.name === name);
  return priority?.icon;
}

export function getPhaseEmoji(name: string): string | undefined {
  const schema = getSchema();
  const phase = schema.metadata.enums.phase.values.find((p) => p.name === name);
  return phase?.emoji;
}

export function getPhaseIcon(name: string): string | null | undefined {
  const schema = getSchema();
  const phase = schema.metadata.enums.phase.values.find((p) => p.name === name);
  return phase?.icon;
}

export function getWorkflowStateEmoji(name: string): string | undefined {
  const schema = getSchema();
  const state = schema.metadata.enums.workflowState.values.find((w) => w.name === name);
  return state?.emoji;
}

export function getWorkflowStateIcon(name: string): string | null | undefined {
  const schema = getSchema();
  const state = schema.metadata.enums.workflowState.values.find((w) => w.name === name);
  return state?.icon;
}

// ============================================
// Validation helpers
// ============================================

export function isValidStatus(value: string): boolean {
  const schema = getSchema();
  return schema.metadata.enums.status.values.some((s) => s.name === value || s.label === value);
}

export function isValidType(value: string): boolean {
  const schema = getSchema();
  return schema.metadata.enums.type.values.some((t) => t.name === value || t.label === value);
}

export function isValidPriority(value: string): boolean {
  const schema = getSchema();
  return schema.metadata.enums.priority.values.some((p) => p.name === value || p.label === value);
}

export function isValidWorkflowState(value: string): boolean {
  const schema = getSchema();
  return schema.metadata.enums.workflowState.values.some(
    (w) => w.name === value || w.label === value
  );
}

// ============================================
// Default value helpers
// ============================================

export function getDefaultStatus(): string {
  return 'todo';
}

export function getDefaultPriority(): string {
  return 'medium';
}

export function getDefaultType(): string {
  return 'feature';
}

export function getDefaultWorkflowState(): string {
  return 'backlog';
}

// ============================================
// Export all available values for CLI help
// ============================================

export function getAllowedValues(
  enumType: 'status' | 'type' | 'priority' | 'workflowState'
): string[] {
  const schema = getSchema();
  const values = schema.metadata.enums[enumType].values;
  return values.map((v) => v.label);
}
