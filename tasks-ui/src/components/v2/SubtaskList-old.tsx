import React from 'react';
import type { Task } from '../../lib/types';
import { TaskTypeIcon } from './TaskTypeIcon';
import { PriorityIndicator, StatusBadge } from './WorkflowStateBadge';

interface SubtaskListProps {
  subtasks: Task[];
  variant?: 'tree' | 'flat' | 'compact';
  showSequence?: boolean;
  showParallel?: boolean;
  showMetadata?: boolean;
  className?: string;
  onTaskClick?: (task: Task) => void;
}

interface GroupedSubtasks {
  sequence: string;
  tasks: Task[];
  isParallel: boolean;
}

export function SubtaskList({
  subtasks,
  variant = 'tree',
  showSequence = true,
  showParallel = true,
  showMetadata = true,
  className = '',
  onTaskClick,
}: SubtaskListProps) {
  // Group subtasks by sequence number
  const groupedSubtasks = React.useMemo(() => {
    const groups: Record<string, Task[]> = {};

    subtasks.forEach((task) => {
      const sequence = task.sequence || '99'; // Default for tasks without sequence
      const baseSequence = sequence.replace(/[a-z]$/, ''); // Remove letter suffix (04a → 04)

      if (!groups[baseSequence]) {
        groups[baseSequence] = [];
      }
      groups[baseSequence].push(task);
    });

    // Sort groups by sequence number and convert to array
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([sequence, tasks]): GroupedSubtasks => ({
          sequence,
          tasks: tasks.sort((a, b) => (a.sequence || '').localeCompare(b.sequence || '')),
          isParallel: tasks.length > 1,
        })
      );
  }, [subtasks]);

  if (subtasks.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-sm">No subtasks yet</div>
        <div className="text-xs mt-1">Add subtasks to break down this parent task</div>
      </div>
    );
  }

  if (variant === 'flat') {
    return (
      <div className={`space-y-2 ${className}`}>
        {subtasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onTaskClick?.(task)}
          >
            <TaskTypeIcon task={task} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {showSequence && task.sequence && (
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {task.sequence}
                  </span>
                )}
                <span className="font-medium truncate">{task.title}</span>
              </div>
              {showMetadata && (
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={task.status} size="sm" />
                  <PriorityIndicator priority={task.priority} size="sm" />
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-1 ${className}`}>
        {groupedSubtasks.map(({ sequence, tasks, isParallel }, groupIndex) => {
          const isLastGroup = groupIndex === groupedSubtasks.length - 1;

          if (isParallel && showParallel) {
            return (
              <div key={sequence}>
                {/* Parallel group header */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <span className="font-mono text-gray-400">{isLastGroup ? '└─┬' : '├─┬'}</span>
                  <span className="font-medium">Parallel execution - sequence {sequence}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {tasks.length} tasks
                  </span>
                </div>

                {/* Parallel tasks */}
                {tasks.map((task, taskIndex) => {
                  const isLastTask = taskIndex === tasks.length - 1;
                  const statusSymbol = getStatusSymbol(task.status);

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 text-sm hover:bg-gray-50 cursor-pointer py-1"
                      onClick={() => onTaskClick?.(task)}
                    >
                      <span className="font-mono text-gray-400 w-6">
                        {isLastGroup ? '  ' : '│ '}
                        {isLastTask ? '└─' : '├─'}
                      </span>
                      <span className="font-mono text-blue-600">{statusSymbol}</span>
                      <span className="font-medium truncate">{task.title}</span>
                      <span className="text-gray-500 text-xs">[{task.sequence}]</span>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            // Single task
            const task = tasks[0];
            const statusSymbol = getStatusSymbol(task.status);

            return (
              <div
                key={task.id}
                className="flex items-center gap-2 text-sm hover:bg-gray-50 cursor-pointer py-1"
                onClick={() => onTaskClick?.(task)}
              >
                <span className="font-mono text-gray-400">{isLastGroup ? '└──' : '├──'}</span>
                <span className="font-mono text-blue-600">{statusSymbol}</span>
                <span className="font-medium truncate">{task.title}</span>
                <span className="text-gray-500 text-xs">[{task.sequence}]</span>
              </div>
            );
          }
        })}
      </div>
    );
  }

  // Tree variant (default)
  return (
    <div className={`space-y-3 ${className}`}>
      {groupedSubtasks.map(({ sequence, tasks, isParallel }, groupIndex) => {
        const isLastGroup = groupIndex === groupedSubtasks.length - 1;

        if (isParallel && showParallel) {
          return (
            <div key={sequence}>
              {/* Parallel group header */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-mono text-gray-500">{isLastGroup ? '└─┬' : '├─┬'}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-800">
                    Parallel execution - sequence {sequence}
                  </span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {tasks.length} tasks
                  </span>
                </div>
              </div>

              {/* Parallel tasks */}
              <div className="ml-6 space-y-2">
                {tasks.map((task, taskIndex) => {
                  const isLastTask = taskIndex === tasks.length - 1;

                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => onTaskClick?.(task)}
                    >
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-gray-400 text-sm">
                          {isLastGroup ? '  ' : '│ '}
                          {isLastTask ? '└─' : '├─'}
                        </span>
                        <TaskTypeIcon task={task} size="sm" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {showSequence && (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {task.sequence}
                            </span>
                          )}
                          <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                        </div>

                        {showMetadata && (
                          <div className="flex items-center gap-2">
                            <StatusBadge status={task.status} size="sm" />
                            <PriorityIndicator priority={task.priority} size="sm" />
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex gap-1">
                                {task.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        } else {
          // Single task
          const task = tasks[0];

          return (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onTaskClick?.(task)}
            >
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-gray-400 text-sm">
                  {isLastGroup ? '└──' : '├──'}
                </span>
                <TaskTypeIcon task={task} size="sm" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {showSequence && task.sequence && (
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {task.sequence}
                    </span>
                  )}
                  <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                </div>

                {showMetadata && (
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} size="sm" />
                    <PriorityIndicator priority={task.priority} size="sm" />
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {task.content && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {task.content.split('\n')[0].replace(/^#+\s*/, '')}
                  </p>
                )}
              </div>
            </div>
          );
        }
      })}

      {/* Legend */}
      <div className="text-xs text-gray-500 border-t pt-3 mt-4">
        <div className="font-medium mb-1">Legend:</div>
        <div className="flex gap-4">
          <span>✓ Done</span>
          <span>→ In Progress</span>
          <span>○ To Do</span>
          <span>⊗ Blocked</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to get status symbols matching CLI output
function getStatusSymbol(status: string): string {
  const statusSymbols = {
    done: '✓',
    in_progress: '→',
    todo: '○',
    blocked: '⊗',
    archived: '⊙',
  };

  return statusSymbols[status as keyof typeof statusSymbols] || '○';
}
