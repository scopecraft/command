import React from 'react';
import { TaskTypeIcon } from './TaskTypeIcon';
import { WorkflowStateBadge, StatusBadge, PriorityIndicator } from './WorkflowStateBadge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { ParentTask } from '../../lib/types';

interface ParentTaskCardProps {
  parentTask: ParentTask;
  variant?: 'default' | 'compact';
  onClick?: () => void;
  className?: string;
}

export function ParentTaskCard({
  parentTask,
  variant = 'default',
  onClick,
  className = '',
}: ParentTaskCardProps) {
  const {
    title,
    status,
    priority,
    workflow_state,
    tags = [],
    overview,
    progress,
    created_date,
    updated_date,
  } = parentTask;

  const progressPercentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          'border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2 mb-2">
          <TaskTypeIcon task={parentTask} size="sm" />
          <h3 className="font-mono text-sm font-medium truncate flex-1">{title}</h3>
          <WorkflowStateBadge workflow={workflow_state} />
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <StatusBadge status={status} />
          <PriorityIndicator priority={priority} inline />
          {progress.total > 0 && (
            <span className="font-mono text-muted-foreground">
              {progress.completed}/{progress.total}
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="font-mono text-xs text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        'border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <TaskTypeIcon task={parentTask} />
        <div className="flex-1 min-w-0">
          <h3 className="font-mono font-medium text-lg">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={status} />
            <PriorityIndicator priority={priority} />
            <WorkflowStateBadge workflow={workflow_state} />
          </div>
        </div>
      </div>

      {/* Progress */}
      {progress.total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-mono text-muted-foreground">Progress</span>
            <span className="font-mono">
              {progress.completed}/{progress.total} ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Overview snippet */}
      {overview && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {overview.split('\n')[0].replace(/^#+\s*/, '')}
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span key={tag} className="font-mono text-xs bg-muted px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between text-xs text-muted-foreground font-mono border-t pt-2">
        <span>Created {created_date}</span>
        <span>Updated {updated_date}</span>
      </div>
    </div>
  );
}