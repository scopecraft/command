/**
 * UI Schema Client
 * 
 * Wrapper around core schema service to provide UI-specific helpers for metadata.
 * This bridges the core schema service with UI components that need icons and labels.
 */

import * as Icons from 'lucide-react';

// Define the icon type based on Lucide components
type LucideIcon = typeof Icons.Circle;

// Import core schema service functions
import {
  getStatusLabel,
  getStatusIcon,
  getStatusEmoji,
  getStatusValues,
  getTypeLabel,
  getTypeIcon,
  getTypeEmoji,
  getTypeValues,
  getPriorityLabel,
  getPriorityIcon,
  getPriorityEmoji,
  getPriorityValues,
  getWorkflowStateLabel,
  getWorkflowStateIcon,
  getWorkflowStateEmoji,
  getSchema,
} from '@core/metadata/schema-service';

import type { MetadataValue } from '@core/metadata/types';

// Convert kebab-case icon names to PascalCase for Lucide components
function kebabToPascalCase(str: string): string {
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

// Get Lucide icon component from schema icon name
function getLucideIcon(iconName: string | null | undefined): LucideIcon | null {
  if (!iconName) return null;
  
  const componentName = kebabToPascalCase(iconName);
  return (Icons as any)[componentName] || null;
}

// ============================================
// UI-specific metadata helpers
// ============================================

/**
 * Get Lucide icon component for status
 */
export function getStatusLucideIcon(statusName: string): LucideIcon | null {
  const iconName = getStatusIcon(statusName);
  return getLucideIcon(iconName);
}

/**
 * Get Lucide icon component for task type
 */
export function getTypeLucideIcon(typeName: string): LucideIcon | null {
  const iconName = getTypeIcon(typeName);
  return getLucideIcon(iconName);
}

/**
 * Get Lucide icon component for priority
 */
export function getPriorityLucideIcon(priorityName: string): LucideIcon | null {
  const iconName = getPriorityIcon(priorityName);
  return getLucideIcon(iconName);
}

/**
 * Get Lucide icon component for workflow state
 */
export function getWorkflowStateLucideIcon(workflowName: string): LucideIcon | null {
  const iconName = getWorkflowStateIcon(workflowName);
  return getLucideIcon(iconName);
}

// ============================================
// Icon mapping generators (for backwards compatibility)
// ============================================

/**
 * Generate icon mapping object for status values
 */
export function generateStatusIconMapping(): Record<string, LucideIcon | null> {
  const statusValues = getStatusValues();
  const mapping: Record<string, LucideIcon | null> = {};
  
  for (const status of statusValues) {
    mapping[status.name] = getLucideIcon(status.icon);
  }
  
  return mapping;
}

/**
 * Generate icon mapping object for type values
 */
export function generateTypeIconMapping(): Record<string, LucideIcon | null> {
  const typeValues = getTypeValues();
  const mapping: Record<string, LucideIcon | null> = {};
  
  for (const type of typeValues) {
    mapping[type.name] = getLucideIcon(type.icon);
  }
  
  return mapping;
}

/**
 * Generate icon mapping object for priority values
 */
export function generatePriorityIconMapping(): Record<string, LucideIcon | null> {
  const priorityValues = getPriorityValues();
  const mapping: Record<string, LucideIcon | null> = {};
  
  for (const priority of priorityValues) {
    mapping[priority.name] = getLucideIcon(priority.icon);
  }
  
  return mapping;
}

/**
 * Generate icon mapping object for workflow state values
 */
export function generateWorkflowStateIconMapping(): Record<string, LucideIcon | null> {
  const schema = getSchema();
  const workflowValues = schema.metadata.enums.workflowState.values;
  const mapping: Record<string, LucideIcon | null> = {};
  
  for (const workflow of workflowValues) {
    mapping[workflow.name] = getLucideIcon(workflow.icon);
  }
  
  return mapping;
}

// ============================================
// Filter option generators
// ============================================

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactElement;
}

/**
 * Generate filter options for status from schema
 */
export function createSchemaStatusFilterOptions(): FilterOption[] {
  const statusValues = getStatusValues();
  return statusValues.map(status => ({
    value: status.name,
    label: status.label,
    // Note: Icons will be added by the consuming component using the icon mappings
  }));
}

/**
 * Generate filter options for task types from schema
 */
export function createSchemaTypeFilterOptions(): FilterOption[] {
  const typeValues = getTypeValues();
  return typeValues.map(type => ({
    value: type.name,
    label: type.label,
  }));
}

/**
 * Generate filter options for priority from schema
 */
export function createSchemaPriorityFilterOptions(): FilterOption[] {
  const priorityValues = getPriorityValues();
  return priorityValues.map(priority => ({
    value: priority.name,
    label: priority.label,
  }));
}

/**
 * Generate filter options for workflow states from schema
 */
export function createSchemaWorkflowFilterOptions(): FilterOption[] {
  const schema = getSchema();
  const workflowValues = schema.metadata.enums.workflowState.values;
  return workflowValues.map(workflow => ({
    value: workflow.name,
    label: workflow.label,
  }));
}

// ============================================
// Fallback handling for UI-specific values
// ============================================

// Import UI-specific fallback icons
const { FileText, Lightbulb, Folder } = Icons;

// UI-specific values that aren't in the core schema
const UI_SPECIFIC_MAPPINGS = {
  type: {
    task: { label: 'Task', icon: FileText },
    enhancement: { label: 'Enhancement', icon: Lightbulb },
    parent_task: { label: 'Parent Task', icon: Folder },
  }
};

/**
 * Get icon for any type (schema + UI-specific)
 */
export function getTypeIconWithFallback(typeName: string): LucideIcon | null {
  // First try schema
  const schemaIcon = getTypeLucideIcon(typeName);
  if (schemaIcon) return schemaIcon;
  
  // Then try UI-specific mappings
  const uiMapping = UI_SPECIFIC_MAPPINGS.type[typeName as keyof typeof UI_SPECIFIC_MAPPINGS.type];
  return uiMapping?.icon || null;
}

/**
 * Get label for any type (schema + UI-specific)
 */
export function getTypeLabelWithFallback(typeName: string): string {
  // First try schema
  const schemaLabel = getTypeLabel(typeName);
  if (schemaLabel !== typeName) return schemaLabel; // Found in schema
  
  // Then try UI-specific mappings
  const uiMapping = UI_SPECIFIC_MAPPINGS.type[typeName as keyof typeof UI_SPECIFIC_MAPPINGS.type];
  return uiMapping?.label || typeName;
}

// ============================================
// Re-export core functions for convenience
// ============================================

export {
  getStatusLabel,
  getStatusEmoji,
  getTypeLabel,
  getTypeEmoji,
  getPriorityLabel,
  getPriorityEmoji,
  getWorkflowStateLabel,
  getWorkflowStateEmoji,
  getStatusValues,
  getTypeValues,
  getPriorityValues,
} from '@core/metadata/schema-service';