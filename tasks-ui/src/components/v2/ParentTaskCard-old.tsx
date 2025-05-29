import React from 'react';
import { TaskTypeIcon } from './TaskTypeIcon';
import { WorkflowStateBadge, StatusBadge, PriorityIndicator } from './WorkflowStateBadge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { ParentTask } from '../../lib/types';

interface ParentTaskCardProps {
  parentTask: ParentTask;
  variant?: 'default' | 'compact' | 'detailed';
  showOverview?: boolean;
  showProgress?: boolean;
  showMetadata?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ParentTaskCard({
  parentTask,
  variant = 'default',
  showOverview = true,
  showProgress = true,
  showMetadata = true,
  className = '',
  onClick,
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
          'border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <TaskTypeIcon task={parentTask} size="sm" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={status} size="sm" />
                {showProgress && progress.total > 0 && (
                  <span className="text-sm text-gray-600">
                    {progress.completed}/{progress.total} ({progressPercentage}%)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <WorkflowStateBadge workflow={workflow_state} size="sm" />
            <PriorityIndicator priority={priority} size="sm" />
          </div>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500">+{tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div 
        className={`
          border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        onClick={onClick}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <TaskTypeIcon task={parentTask} size="lg" />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <WorkflowStateBadge workflow={workflow_state} />
                  <StatusBadge status={status} />
                  <PriorityIndicator priority={priority} />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress Section */}
        {showProgress && progress.total > 0 && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {progress.completed}/{progress.total} subtasks completed ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progress.completed} completed</span>
              <span>{progress.total - progress.completed} remaining</span>
            </div>
          </div>
        )}

        {/* Overview */}
        {showOverview && overview && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-900 mb-2">📖 Overview</h3>
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap">{overview}</div>
            </div>
          </div>
        )}

        {/* Metadata */}
        {showMetadata && (
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Created:</span>
                <span className="ml-2 text-gray-900">{created_date}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Updated:</span>
                <span className="ml-2 text-gray-900">{updated_date}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={`
        border rounded-lg p-4 bg-white hover:shadow-md transition-shadow
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <TaskTypeIcon task={parentTask} />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={status} size="sm" />
              <PriorityIndicator priority={priority} size="sm" />
            </div>
          </div>
        </div>
        <WorkflowStateBadge workflow={workflow_state} size="sm" />
      </div>

      {/* Progress */}
      {showProgress && progress.total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {progress.completed}/{progress.total} ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Overview snippet */}
      {showOverview && overview && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {overview.split('\n')[0].replace(/^#+\s*/, '')}
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 4).map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              #{tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="text-xs text-gray-500 px-2 py-1">+{tags.length - 4} more</span>
          )}
        </div>
      )}

      {/* Metadata footer */}
      {showMetadata && (
        <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
          <span>Created {created_date}</span>
          <span>Updated {updated_date}</span>
        </div>
      )}
    </div>
  );
}