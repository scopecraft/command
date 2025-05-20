import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface FeatureProgressProps {
  totalTasks: number;
  completed: number;
  inProgress: number;
  blocked: number;
  toDo: number;
  compact?: boolean;
}

export function FeatureProgress({
  totalTasks,
  completed,
  inProgress,
  blocked,
  toDo,
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

      {/* Detailed breakdown (shown when expanded) */}
      {expanded && (
        <div className={cn("mt-2 text-xs grid", compact ? "grid-cols-2" : "grid-cols-4")} >
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-1.5" />
            <span>Completed: {completed}</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-blue-500 rounded-full mr-1.5" />
            <span>In Progress: {inProgress}</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-amber-500 rounded-full mr-1.5" />
            <span>To Do: {toDo}</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-red-500 rounded-full mr-1.5" />
            <span>Blocked: {blocked}</span>
          </div>
        </div>
      )}
    </div>
  );
}