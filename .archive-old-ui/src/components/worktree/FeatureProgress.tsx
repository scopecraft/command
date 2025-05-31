import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface FeatureProgressProps {
  totalTasks: number;
  completed: number;
  inProgress: number;
  blocked: number;
  toDo: number;
  tasks?: {
    id: string;
    title: string;
    status: string;
  }[];
  compact?: boolean;
}

export function FeatureProgress({
  totalTasks,
  completed,
  inProgress,
  blocked,
  toDo,
  tasks = [],
  compact = false
}: FeatureProgressProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate percentages
  const completedPercent = (completed / totalTasks) * 100;
  const inProgressPercent = (inProgress / totalTasks) * 100;
  const blockedPercent = (blocked / totalTasks) * 100;
  const toDoPercent = (toDo / totalTasks) * 100;

  // Toggle expanded state
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggleExpanded}
        className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <span className="flex-1">Feature Progress ({completed}/{totalTasks} tasks)</span>
        {expanded ? 
          <ChevronUp className="h-3 w-3 ml-1" /> : 
          <ChevronDown className="h-3 w-3 ml-1" />
        }
      </button>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted mt-1 rounded-full overflow-hidden">
        <div className="flex h-full">
          <div
            className="bg-green-500"
            style={{ width: `${completedPercent}%` }}
            title={`${completed} completed tasks`}
          />
          <div
            className="bg-blue-500"
            style={{ width: `${inProgressPercent}%` }}
            title={`${inProgress} in-progress tasks`}
          />
          <div
            className="bg-amber-500"
            style={{ width: `${toDoPercent}%` }}
            title={`${toDo} to-do tasks`}
          />
          <div
            className="bg-red-500"
            style={{ width: `${blockedPercent}%` }}
            title={`${blocked} blocked tasks`}
          />
        </div>
      </div>

      {/* Task list (shown when expanded) */}
      {expanded && (
        <div className="mt-2 text-xs">
          {tasks.length > 0 ? (
            <div className="space-y-1">
              {tasks.map(task => (
                <div key={task.id} className="flex justify-between items-center">
                  <div className="truncate max-w-[70%]" title={task.title}>
                    {task.title}
                  </div>
                  <div className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50">
                    {task.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground italic">
              No task details available
            </div>
          )}
        </div>
      )}
    </div>
  );
}