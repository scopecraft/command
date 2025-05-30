import React from 'react';
import { TaskTypeIcon as SharedTaskTypeIcon } from '../../lib/icons';
import type { Task, ParentTask } from '../../lib/types';

interface TaskTypeIconProps {
  task?: Task | ParentTask;
  type?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Extracts the task type from various data structures
 * This handles inconsistencies between different API responses
 */
function extractTaskType(task: any): string {
  // Check various ways a task might indicate it's a parent
  if (task.type === 'parent_task' || 
      'subtasks' in task || 
      task.task_type === 'parent' ||
      task.isParentTask ||
      task.metadata?.isParentTask) {
    return 'parent_task';
  }
  
  // Return the explicit type or default to feature
  return task.type || 'feature';
}

export function TaskTypeIcon({ task, type: propType, size = 'md', className = '' }: TaskTypeIconProps) {
  // Prefer explicit type prop, then extract from task, then default to feature
  const type = propType || (task ? extractTaskType(task) : 'feature');
  
  return (
    <SharedTaskTypeIcon 
      type={type as any}
      size={size}
      className={className}
    />
  );
}