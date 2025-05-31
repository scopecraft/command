import React from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { TaskTypeIcon } from './TaskTypeIcon';
import { PriorityIndicator, StatusBadge, WorkflowStateBadge } from './WorkflowStateBadge';
import type { ParentTask, Task } from '../../lib/types';

// Union type for table rows (can be parent or simple tasks)
type TableTask = (ParentTask | Task) & {
  task_type: 'parent' | 'simple';
};

interface TaskTableProps {
  tasks: TableTask[];
  selectable?: boolean;
  selectedRows?: Record<string, boolean>;
  onSelectionChange?: (selection: Record<string, boolean>) => void;
  onRowClick?: (task: TableTask) => void;
  onParentTaskClick?: (parentId: string) => void;
  className?: string;
}

interface TaskTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

const columns: TaskTableColumn[] = [
  { key: 'type', label: 'Type', width: 'w-20' },
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status', width: 'w-28' },
  { key: 'priority', label: 'Priority', width: 'w-24' },
  { key: 'workflow', label: 'Workflow', width: 'w-28' },
  { key: 'area', label: 'Area', width: 'w-24' },
  { key: 'tags', label: 'Tags', width: 'w-44' },
];

export function TaskTable({
  tasks,
  selectable = false,
  selectedRows = {},
  onSelectionChange,
  onRowClick,
  onParentTaskClick,
  className = '',
}: TaskTableProps) {
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const isAllSelected = selectedCount === tasks.length && tasks.length > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < tasks.length;

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      const allSelected = tasks.reduce((acc, task) => {
        acc[task.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      onSelectionChange(allSelected);
    } else {
      onSelectionChange({});
    }
  };

  const handleRowSelect = (taskId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    
    onSelectionChange({
      ...selectedRows,
      [taskId]: checked,
    });
  };

  const handleRowClick = (task: TableTask, e: React.MouseEvent) => {
    // Don't trigger row click if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input[type="checkbox"]')) {
      return;
    }
    
    onRowClick?.(task);
  };

  return (
    <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-card border-b">
            <tr>
              {selectable && (
                <th className="w-12 p-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all tasks"
                    {...(isPartiallySelected ? { 'data-indeterminate': true } : {})}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-${column.align || 'left'} p-3 text-sm font-medium ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b hover:bg-muted/30 cursor-pointer"
                onClick={(e) => handleRowClick(task, e)}
              >
                {selectable && (
                  <td className="p-3">
                    <Checkbox
                      checked={selectedRows[task.id] || false}
                      onCheckedChange={(checked) => handleRowSelect(task.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${task.title}`}
                    />
                  </td>
                )}
                
                {/* Type Column */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <TaskTypeIcon task={task} />
                    <span className="text-xs text-muted-foreground">
                      {task.task_type === 'parent' ? 'Parent' : 'Task'}
                    </span>
                  </div>
                </td>

                {/* Title Column */}
                <td className="p-3">
                  <div className="font-medium text-sm">{task.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                    {task.task_type === 'parent' && 'subtasks' in task && (
                      <span>
                        {task.subtasks.length} subtask{task.subtasks.length === 1 ? '' : 's'}
                      </span>
                    )}
                    {'parent_task' in task && task.parent_task && (
                      <span>
                        Parent:{' '}
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onParentTaskClick?.(task.parent_task!);
                          }}
                        >
                          {task.parent_task}
                        </button>
                      </span>
                    )}
                  </div>
                </td>

                {/* Status Column */}
                <td className="p-3">
                  <StatusBadge status={task.status} size="sm" />
                </td>

                {/* Priority Column */}
                <td className="p-3">
                  <PriorityIndicator priority={task.priority} size="sm" />
                </td>

                {/* Workflow Column */}
                <td className="p-3">
                  <WorkflowStateBadge workflow={task.workflow_state} size="sm" />
                </td>

                {/* Area Column */}
                <td className="p-3">
                  <div className="text-sm text-muted-foreground">
                    {task.area || '—'}
                  </div>
                </td>

                {/* Tags Column */}
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {task.tags && task.tags.length > 0 ? (
                      <>
                        {task.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-muted px-2 py-1 rounded font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {tasks.length > 0 && (
        <div className="bg-muted/20 px-6 py-3 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {tasks.length} task{tasks.length === 1 ? '' : 's'}
              {selectable && selectedCount > 0 && (
                <span className="ml-2 font-medium">
                  ({selectedCount} selected)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>
                {tasks.filter(t => t.task_type === 'parent').length} parent
              </span>
              <span>
                {tasks.filter(t => t.task_type === 'simple').length} simple
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export types for external use
export type { TaskTableProps, TableTask };