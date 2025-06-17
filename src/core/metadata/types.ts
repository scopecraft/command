/**
 * Metadata Schema Types
 *
 * Core type definitions for the metadata schema registry
 */

export interface MetadataValue {
  name: string; // e.g., "in_progress"
  label: string; // e.g., "In Progress"
  emoji?: string; // Optional emoji for display
  icon?: string | null; // Optional Lucide icon name (null = no icon)
  template?: string; // Optional template file (for task types)
  aliases?: string[]; // TODO: Add support for input aliases
}

export interface MetadataEnum {
  values: MetadataValue[];
}

export interface MetadataSchema {
  metadata: {
    enums: {
      workflowState: MetadataEnum;
      status: MetadataEnum;
      type: MetadataEnum;
      priority: MetadataEnum;
      phase: MetadataEnum;
    };
  };
}

// Type utilities for extracting enum values
export type ExtractEnumNames<T extends MetadataEnum> = T['values'][number]['name'];
export type ExtractEnumLabels<T extends MetadataEnum> = T['values'][number]['label'];
