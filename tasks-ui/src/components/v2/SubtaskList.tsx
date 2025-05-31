import React from 'react';
import { TaskTypeIcon } from './TaskTypeIcon';
import { StatusBadge, PriorityIndicator } from './WorkflowStateBadge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { Task, SubTask } from '../../lib/types';

interface SubtaskListProps {
  subtasks: SubTask[];
  variant?: 'tree' | 'compact';
  onTaskClick?: (task: SubTask) => void;
  highlightTaskId?: string;
  className?: string;
}

interface GroupedSubtasks {
  sequence: string;
  tasks: SubTask[];
  isParallel: boolean;
}

export function SubtaskList({
  subtasks,
  variant = 'tree',
  onTaskClick,
  highlightTaskId,
  className = '',
}: SubtaskListProps) {
  // Group subtasks by sequence number
  const groupedSubtasks = React.useMemo(() => {
    const groups: Record<string, SubTask[]> = {};
    
    subtasks.forEach((task) => {
      // Use normalized API field: sequenceNumber
      const sequence = task.sequenceNumber || '99';
      const baseSequence = sequence.replace(/[a-z]$/, ''); // Remove letter suffix (04a → 04)
      
      if (!groups[baseSequence]) {
        groups[baseSequence] = [];
      }
      groups[baseSequence].push(task);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sequence, tasks]): GroupedSubtasks => ({
        sequence,
        tasks: tasks.sort((a, b) => (a.sequenceNumber || '').localeCompare(b.sequenceNumber || '')),
        isParallel: tasks.length > 1,
      }));
  }, [subtasks]);

  if (subtasks.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <div className="font-mono text-sm">No subtasks yet</div>
        <div className="font-mono text-xs mt-1">Add subtasks to break down this parent task</div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('font-mono text-sm space-y-1', className)}>
        {groupedSubtasks.map(({ sequence, tasks, isParallel }, groupIndex) => {
          const isLastGroup = groupIndex === groupedSubtasks.length - 1;

          if (isParallel) {
            return (
              <div key={sequence}>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span>{isLastGroup ? '└─┬' : '├─┬'}</span>
                  <span>Parallel execution - {sequence}</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    {tasks.length} tasks
                  </span>
                </div>
                {tasks.map((task, taskIndex) => {
                  const isLastTask = taskIndex === tasks.length - 1;
                  const statusSymbol = getStatusSymbol(task.status);
                  return (
                    <div
                      key={task.id || `parallel-${groupIndex}-${taskIndex}`}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer py-1 px-2 rounded",
                        highlightTaskId === task.id 
                          ? "bg-primary/10 border border-primary" 
                          : "hover:bg-accent/50"
                      )}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <span className="text-muted-foreground w-6">
                        {isLastGroup ? '  ' : '│ '}{isLastTask ? '└─' : '├─'}
                      </span>
                      <span>{statusSymbol}</span>
                      <span className="truncate flex-1">{task.title}</span>
                      <span className="text-muted-foreground">[{task.sequenceNumber}]</span>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            const task = tasks[0];
            const statusSymbol = getStatusSymbol(task.status);
            return (
              <div
                key={task.id || `single-${groupIndex}`}
                className={cn(
                  "flex items-center gap-2 cursor-pointer py-1 px-2 rounded",
                  highlightTaskId === task.id 
                    ? "bg-primary/10 border border-primary" 
                    : "hover:bg-accent/50"
                )}
                onClick={() => onTaskClick?.(task)}
              >
                <span className="text-muted-foreground">
                  {isLastGroup ? '└──' : '├──'}
                </span>
                <span>{statusSymbol}</span>
                <span className="truncate flex-1">{task.title}</span>
                <span className="text-muted-foreground">[{task.sequenceNumber}]</span>
              </div>
            );
          }
        })}
        
        {/* Legend */}
        <div className="text-xs text-muted-foreground border-t pt-2 mt-3">
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

  // Tree variant (default)
  return (
    <div className={cn('space-y-3', className)}>
      {groupedSubtasks.map(({ sequence, tasks, isParallel }, groupIndex) => {
        const isLastGroup = groupIndex === groupedSubtasks.length - 1;

        if (isParallel) {
          return (
            <div key={sequence}>
              {/* Parallel group header */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg">
                <span className="font-mono text-muted-foreground">
                  {isLastGroup ? '└─┬' : '├─┬'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">
                    Parallel execution - sequence {sequence}
                  </span>
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
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
                      key={task.id || `parallel-${groupIndex}-${taskIndex}`}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                        highlightTaskId === task.id 
                          ? "bg-primary/10 border-primary" 
                          : "bg-card hover:bg-accent/50"
                      )}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground text-sm">
                          {isLastGroup ? '  ' : '│ '}{isLastTask ? '└─' : '├─'}
                        </span>
                        <TaskTypeIcon task={task} size="sm" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {task.sequenceNumber}
                          </span>
                          <h4 className="font-mono font-medium truncate">{task.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={task.status} />
                          <PriorityIndicator priority={task.priority} inline />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        } else {
          const task = tasks[0];
          return (
            <div
              key={task.id || `single-${groupIndex}`}
              className={cn(
                "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                highlightTaskId === task.id 
                  ? "bg-primary/10 border-primary" 
                  : "bg-card hover:bg-accent/50"
              )}
              onClick={() => onTaskClick?.(task)}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground text-sm">
                  {isLastGroup ? '└──' : '├──'}
                </span>
                <TaskTypeIcon task={task} size="sm" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {task.sequenceNumber}
                  </span>
                  <h4 className="font-mono font-medium truncate">{task.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityIndicator priority={task.priority} inline />
                </div>
                {task.content && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {task.content.split('\n')[0].replace(/^#+\s*/, '')}
                  </p>
                )}
              </div>
            </div>
          );
        }
      })}
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