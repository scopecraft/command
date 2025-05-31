import React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { StatusIcon, WorkflowStateIcon, PriorityIcon } from '../../lib/icons';
import type { WorkflowState, TaskStatus } from '../../lib/types';

interface WorkflowStateBadgeProps {
  workflow: WorkflowState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function WorkflowStateBadge({ 
  workflow, 
  size = 'sm', 
  className = '', 
  interactive = false,
  onClick 
}: WorkflowStateBadgeProps) {
  const workflowLabels = {
    backlog: 'Backlog',
    current: 'Current', 
    archive: 'Archive',
  };

  const content = (
    <>
      <WorkflowStateIcon workflow={workflow} size="sm" />
      {workflowLabels[workflow]}
    </>
  );

  if (interactive || onClick) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={onClick}
        className={cn('h-auto uppercase font-mono gap-1 whitespace-nowrap', className)}
      >
        {content}
      </Button>
    );
  }

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 font-mono uppercase rounded-md border bg-background px-2 py-1 text-xs whitespace-nowrap',
        className
      )}
    >
      {content}
    </span>
  );
}

export function StatusBadge({ 
  status, 
  size = 'sm', 
  className = '', 
  interactive = false,
  onClick 
}: StatusBadgeProps) {
  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
    blocked: 'Blocked',
    archived: 'Archived',
  };

  const label = statusLabels[status] || statusLabels.todo;
  const content = (
    <>
      <StatusIcon status={status} size="sm" />
      {label}
    </>
  );

  if (interactive || onClick) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={onClick}
        className={cn('h-auto gap-1 uppercase font-mono whitespace-nowrap', className)}
      >
        {content}
      </Button>
    );
  }

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 font-mono uppercase rounded-md border bg-background px-2 py-1 text-xs whitespace-nowrap',
        className
      )}
      title={label}
    >
      {content}
    </span>
  );
}

interface PriorityIndicatorProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function PriorityIndicator({ 
  priority, 
  size = 'sm', 
  inline = false, 
  className = '', 
  interactive = false,
  onClick 
}: PriorityIndicatorProps) {
  // Handle undefined priority and don't show medium priority (follows existing pattern)
  if (!priority || priority.toLowerCase() === 'medium') {
    return null;
  }

  const priorityLabels = {
    highest: 'Highest',
    high: 'High',
    low: 'Low',
  };

  const normalizedPriority = priority.toLowerCase() as keyof typeof priorityLabels;
  const label = priorityLabels[normalizedPriority];
  if (!label) return null;

  const content = (
    <>
      <PriorityIcon priority={priority} size="sm" />
      {label}
    </>
  );

  if (inline) {
    return (
      <span className={cn('inline-flex items-center gap-1 font-mono text-xs', className)}>
        {content}
      </span>
    );
  }

  if (interactive || onClick) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={onClick}
        className={cn('h-auto gap-1 uppercase font-mono whitespace-nowrap', className)}
      >
        {content}
      </Button>
    );
  }

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 font-mono uppercase rounded-md border bg-background px-2 py-1 text-xs',
        className
      )}
      title={`Priority: ${label}`}
    >
      {content}
    </span>
  );
}