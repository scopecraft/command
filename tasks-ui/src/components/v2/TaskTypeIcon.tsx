import React from 'react';
import { TaskTypeIcon as SharedTaskTypeIcon } from '../../lib/icons';
import type { Task, TaskStructure, TaskType } from '../../lib/types';

interface TaskTypeIconProps {
  task?: Task;
  type?: TaskType | 'parent_task'; // Support legacy 'parent_task' for compatibility
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TaskTypeIcon({
  task,
  type: propType,
  size = 'md',
  className = '',
}: TaskTypeIconProps) {
  // Use explicit prop first, then task.type, defaulting to 'feature'
  let displayType = propType || task?.type || 'feature';

  // Convert parent task structure to display type
  if (task?.taskStructure === 'parent') {
    displayType = 'parent_task';
  }

  return <SharedTaskTypeIcon type={displayType as any} size={size} className={className} />;
}
