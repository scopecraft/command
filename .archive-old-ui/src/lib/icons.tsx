import React from 'react';
import {
  // Status icons (matching filter panel)
  Circle,
  Clock, 
  CheckCircle,
  AlertCircle,
  Archive,
  
  // Task type icons
  FileText,
  Bug,
  Star,
  Wrench,
  BookOpen,
  TestTube,
  Search,
  Lightbulb,
  Folder,
  
  // Priority icons
  Flame,
  ChevronUp,
  ChevronDown,
  
  // Workflow state icons
  Inbox,
  Play,
  FolderArchive,
  
  // Widget section icons
  GitBranch,
  Files,
} from 'lucide-react';

import type { TaskStatus, TaskType, WorkflowState } from './types';

// Icon size variants
export const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4', 
  lg: 'h-5 w-5',
} as const;

export type IconSize = keyof typeof iconSizes;

// Status icon mapping (using Lucide icons instead of CLI symbols)
export const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle,
  blocked: AlertCircle,
  archived: Archive,
} as const;

// Task type icon mapping
export const taskTypeIcons = {
  task: FileText,
  bug: Bug,
  feature: Star,
  chore: Wrench,
  documentation: BookOpen,
  test: TestTube,
  spike: Search,
  enhancement: Lightbulb,
  parent_task: Folder,
} as const;

// Priority icon mapping  
export const priorityIcons = {
  highest: Flame,
  high: ChevronUp,
  medium: null, // No icon for medium (follows existing pattern)
  low: ChevronDown,
} as const;

// Workflow state icon mapping
export const workflowStateIcons = {
  backlog: Inbox,
  current: Play,
  archive: FolderArchive,
} as const;

// Shared icon component props
interface IconProps {
  size?: IconSize;
  className?: string;
}

// Status icon component
export function StatusIcon({ 
  status, 
  size = 'sm', 
  className = '' 
}: IconProps & { status: TaskStatus }) {
  const IconComponent = statusIcons[status];
  if (!IconComponent) return null;
  
  return (
    <IconComponent 
      className={`${iconSizes[size]} ${className}`}
    />
  );
}

// Task type icon component  
export function TaskTypeIcon({ 
  type, 
  size = 'sm', 
  className = '' 
}: IconProps & { type: TaskType | 'parent_task' }) {
  const IconComponent = taskTypeIcons[type as keyof typeof taskTypeIcons];
  if (!IconComponent) return null;
  
  return (
    <IconComponent 
      className={`${iconSizes[size]} ${className}`}
    />
  );
}

// Priority icon component
export function PriorityIcon({ 
  priority, 
  size = 'sm', 
  className = '' 
}: IconProps & { priority: string }) {
  const normalizedPriority = priority.toLowerCase() as keyof typeof priorityIcons;
  const IconComponent = priorityIcons[normalizedPriority];
  if (!IconComponent) return null;
  
  return (
    <IconComponent 
      className={`${iconSizes[size]} ${className}`}
    />
  );
}

// Workflow state icon component
export function WorkflowStateIcon({ 
  workflow, 
  size = 'sm', 
  className = '' 
}: IconProps & { workflow: WorkflowState }) {
  const IconComponent = workflowStateIcons[workflow];
  if (!IconComponent) return null;
  
  return (
    <IconComponent 
      className={`${iconSizes[size]} ${className}`}
    />
  );
}

// Filter option builders (for easy integration with FilterPanel)
export function createStatusFilterOptions() {
  return [
    { value: 'todo', label: 'To Do', icon: <StatusIcon status="todo" /> },
    { value: 'in_progress', label: 'In Progress', icon: <StatusIcon status="in_progress" /> },
    { value: 'done', label: 'Done', icon: <StatusIcon status="done" /> },
    { value: 'blocked', label: 'Blocked', icon: <StatusIcon status="blocked" /> },
    { value: 'archived', label: 'Archived', icon: <StatusIcon status="archived" /> },
  ];
}

export function createTaskTypeFilterOptions() {
  return [
    { value: 'task', label: 'Task', icon: <TaskTypeIcon type="task" /> },
    { value: 'feature', label: 'Feature', icon: <TaskTypeIcon type="feature" /> },
    { value: 'bug', label: 'Bug', icon: <TaskTypeIcon type="bug" /> },
    { value: 'chore', label: 'Chore', icon: <TaskTypeIcon type="chore" /> },
    { value: 'documentation', label: 'Documentation', icon: <TaskTypeIcon type="documentation" /> },
    { value: 'test', label: 'Test', icon: <TaskTypeIcon type="test" /> },
    { value: 'spike', label: 'Spike', icon: <TaskTypeIcon type="spike" /> },
    { value: 'enhancement', label: 'Enhancement', icon: <TaskTypeIcon type="enhancement" /> },
  ];
}

export function createPriorityFilterOptions() {
  return [
    { value: 'highest', label: 'Highest', icon: <PriorityIcon priority="highest" /> },
    { value: 'high', label: 'High', icon: <PriorityIcon priority="high" /> },
    { value: 'medium', label: 'Medium' }, // No icon
    { value: 'low', label: 'Low', icon: <PriorityIcon priority="low" /> },
  ];
}

export function createWorkflowFilterOptions() {
  return [
    { value: 'backlog', label: 'Backlog', icon: <WorkflowStateIcon workflow="backlog" /> },
    { value: 'current', label: 'Current', icon: <WorkflowStateIcon workflow="current" /> },
    { value: 'archive', label: 'Archive', icon: <WorkflowStateIcon workflow="archive" /> },
  ];
}

// Widget section icon components
export function SubtasksIcon({ 
  size = 'sm', 
  className = '' 
}: IconProps) {
  return (
    <GitBranch 
      className={`${iconSizes[size]} ${className}`}
    />
  );
}

export function DocumentsIcon({ 
  size = 'sm', 
  className = '' 
}: IconProps) {
  return (
    <Files 
      className={`${iconSizes[size]} ${className}`}
    />
  );
}