import {
  // UI-specific fallback icons
  FileText,
  Files,
  Folder,
  // Widget section icons
  GitBranch,
  Lightbulb,
} from 'lucide-react';
import React from 'react';

import type { TaskPhase, TaskStatus, TaskType, WorkflowState } from './types';

// Import schema-driven mappings and helpers
import {
  createSchemaPhaseFilterOptions,
  createSchemaPriorityFilterOptions,
  createSchemaStatusFilterOptions,
  createSchemaTypeFilterOptions,
  createSchemaWorkflowFilterOptions,
  generatePhaseIconMapping,
  generatePriorityIconMapping,
  generateStatusIconMapping,
  generateTypeIconMapping,
  generateWorkflowStateIconMapping,
  getTypeIconWithFallback,
} from './schema-client';

// Icon size variants
export const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

export type IconSize = keyof typeof iconSizes;

// Schema-driven icon mappings
export const statusIcons = generateStatusIconMapping();
export const taskTypeIcons = {
  ...generateTypeIconMapping(),
  // UI-specific fallbacks for values not in schema
  task: FileText,
  enhancement: Lightbulb,
  parent_task: Folder,
};
export const priorityIcons = generatePriorityIconMapping();
export const workflowStateIcons = generateWorkflowStateIconMapping();
export const phaseIcons = generatePhaseIconMapping();

// Shared icon component props
interface IconProps {
  size?: IconSize;
  className?: string;
}

// Status icon component
export function StatusIcon({
  status,
  size = 'sm',
  className = '',
}: IconProps & { status: TaskStatus }) {
  const IconComponent = statusIcons[status];
  if (!IconComponent) return null;

  return <IconComponent className={`${iconSizes[size]} ${className}`} />;
}

// Task type icon component
export function TaskTypeIcon({
  type,
  size = 'sm',
  className = '',
}: IconProps & { type: TaskType | 'parent_task' }) {
  const IconComponent = taskTypeIcons[type as keyof typeof taskTypeIcons];
  if (!IconComponent) return null;

  return <IconComponent className={`${iconSizes[size]} ${className}`} />;
}

// Priority icon component
export function PriorityIcon({
  priority,
  size = 'sm',
  className = '',
}: IconProps & { priority: string }) {
  const normalizedPriority = priority.toLowerCase() as keyof typeof priorityIcons;
  const IconComponent = priorityIcons[normalizedPriority];
  if (!IconComponent) return null;

  return <IconComponent className={`${iconSizes[size]} ${className}`} />;
}

// Workflow state icon component
export function WorkflowStateIcon({
  workflow,
  size = 'sm',
  className = '',
}: IconProps & { workflow: WorkflowState }) {
  const IconComponent = workflowStateIcons[workflow];
  if (!IconComponent) return null;

  return <IconComponent className={`${iconSizes[size]} ${className}`} />;
}

// Phase icon component
export function PhaseIcon({
  phase,
  size = 'sm',
  className = '',
}: IconProps & { phase: TaskPhase }) {
  const IconComponent = phaseIcons[phase];
  if (!IconComponent) return null;

  return <IconComponent className={`${iconSizes[size]} ${className}`} />;
}

// Filter option builders (schema-driven, for easy integration with FilterPanel)
export function createStatusFilterOptions() {
  const schemaOptions = createSchemaStatusFilterOptions();
  return schemaOptions.map((option) => ({
    ...option,
    icon: <StatusIcon status={option.value as TaskStatus} />,
  }));
}

export function createTaskTypeFilterOptions() {
  const schemaOptions = createSchemaTypeFilterOptions();
  const schemaWithIcons = schemaOptions.map((option) => ({
    ...option,
    icon: <TaskTypeIcon type={option.value as TaskType} />,
  }));

  // Add UI-specific options not in schema
  const uiSpecificOptions = [
    { value: 'task', label: 'Task', icon: <TaskTypeIcon type="task" /> },
    { value: 'enhancement', label: 'Enhancement', icon: <TaskTypeIcon type="enhancement" /> },
  ];

  return [...schemaWithIcons, ...uiSpecificOptions];
}

export function createPriorityFilterOptions() {
  const schemaOptions = createSchemaPriorityFilterOptions();
  return schemaOptions.map((option) => ({
    ...option,
    ...(priorityIcons[option.value as keyof typeof priorityIcons]
      ? {
          icon: <PriorityIcon priority={option.value} />,
        }
      : {}),
  }));
}

export function createWorkflowFilterOptions() {
  const schemaOptions = createSchemaWorkflowFilterOptions();
  return schemaOptions.map((option) => ({
    ...option,
    icon: <WorkflowStateIcon workflow={option.value as WorkflowState} />,
  }));
}

export function createPhaseFilterOptions() {
  const schemaOptions = createSchemaPhaseFilterOptions();
  return schemaOptions.map((option) => ({
    ...option,
    icon: <PhaseIcon phase={option.value as TaskPhase} />,
  }));
}

// Widget section icon components
export function SubtasksIcon({ size = 'sm', className = '' }: IconProps) {
  return <GitBranch className={`${iconSizes[size]} ${className}`} />;
}

export function DocumentsIcon({ size = 'sm', className = '' }: IconProps) {
  return <Files className={`${iconSizes[size]} ${className}`} />;
}
