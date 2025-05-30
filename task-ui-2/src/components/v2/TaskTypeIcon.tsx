import React from 'react';
import { TaskTypeIcon as SharedTaskTypeIcon } from '../../lib/icons';
import type { Task, ParentTask } from '../../lib/types';

interface TaskTypeIconProps {
  task?: Task | ParentTask;
  type?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TaskTypeIcon({ task, type: propType, size = 'md', className = '' }: TaskTypeIconProps) {
  // Support both task object and direct type prop
  const type = propType || (task ? (task.type === 'parent_task' || 'subtasks' in task ? 'parent_task' : task.type) : 'feature');
  
  return (
    <SharedTaskTypeIcon 
      type={type as any}
      size={size}
      className={className}
    />
  );
}