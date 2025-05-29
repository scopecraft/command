import React from 'react';
import { TaskTypeIcon as SharedTaskTypeIcon } from '../../lib/icons';
import type { Task, ParentTask } from '../../lib/types';

interface TaskTypeIconProps {
  task: Task | ParentTask;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TaskTypeIcon({ task, size = 'md', className = '' }: TaskTypeIconProps) {
  const isParentTask = task.type === 'parent_task' || 'subtasks' in task;
  const type = isParentTask ? 'parent_task' : task.type;
  
  return (
    <SharedTaskTypeIcon 
      type={type as any}
      size={size}
      className={className}
    />
  );
}