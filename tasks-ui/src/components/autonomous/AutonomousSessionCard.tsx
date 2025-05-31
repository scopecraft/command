import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { TaskTypeIcon } from '../v2/TaskTypeIcon';
import { StatusBadge } from '../v2/WorkflowStateBadge';
import { useTask } from '../../lib/api/hooks';

interface SessionInfo {
  sessionName: string;
  taskId: string;
  parentId?: string;
  logFile: string;
  startTime: string;
  status: string;
  pid?: number;
  stats?: {
    messages: number;
    toolsUsed: string[];
    totalCost?: number;
    model?: string;
    lastOutput?: string;
    lastUpdate?: string;
  };
}

interface AutonomousSessionCardProps {
  session: SessionInfo;
  variant?: 'default' | 'compact';
  onClick?: () => void;
  className?: string;
}

export function AutonomousSessionCard({
  session,
  variant = 'default',
  onClick,
  className = '',
}: AutonomousSessionCardProps) {
  // Fetch task details
  const { data: task } = useTask(session.taskId, session.parentId);
  
  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500';
      case 'waiting_feedback': return 'text-yellow-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  const getSessionStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '⚡';
      case 'waiting_feedback': return '⏳';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏸️';
    }
  };
  
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
          {task && <TaskTypeIcon task={task} size="sm" />}
          <h3 className="font-mono text-sm font-medium truncate flex-1">{session.taskId}</h3>
          <span className={cn('flex items-center gap-1', getSessionStatusColor(session.status))}>
            {getSessionStatusIcon(session.status)}
            <span className="text-xs">{session.status}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          {task && <StatusBadge status={task.status} />}
          {session.stats && (
            <>
              <span className="font-mono text-muted-foreground">
                {session.stats.messages} msgs
              </span>
              {session.stats.totalCost && (
                <span className="font-mono text-muted-foreground">
                  ${session.stats.totalCost.toFixed(4)}
                </span>
              )}
            </>
          )}
          <span className="text-muted-foreground ml-auto">
            {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
          </span>
        </div>

        {session.stats?.lastOutput && (
          <div className="text-xs text-muted-foreground mt-2 truncate">
            "{session.stats.lastOutput}"
          </div>
        )}
      </div>
    );
  }
  
  // Default variant
  return (
    <div 
      className={cn(
        'border rounded-lg p-4 bg-card hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {task && <TaskTypeIcon task={task} />}
        <div className="flex-1 min-w-0">
          <h3 className="font-mono font-medium">{session.taskId}</h3>
          <div className="flex items-center gap-2 mt-1">
            {task && <StatusBadge status={task.status} size="sm" />}
            <span className={cn('flex items-center gap-1 text-sm', getSessionStatusColor(session.status))}>
              {getSessionStatusIcon(session.status)}
              {session.status}
            </span>
            {session.pid && (
              <span className="text-xs text-muted-foreground">
                PID: {session.pid}
              </span>
            )}
          </div>
          
          {session.stats && (
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="font-mono text-muted-foreground">
                {session.stats.messages} messages
              </span>
              {session.stats.toolsUsed.length > 0 && (
                <span className="text-muted-foreground">
                  Tools: {session.stats.toolsUsed.slice(0, 3).join(', ')}
                </span>
              )}
              {session.stats.totalCost && (
                <span className="font-mono text-muted-foreground">
                  ${session.stats.totalCost.toFixed(4)}
                </span>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-2">
            Session: {session.sessionName}
          </div>
          
          {session.stats?.lastOutput && (
            <div className="text-sm text-muted-foreground mt-2 italic">
              Last: "{session.stats.lastOutput}"
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}