import { AlertTriangle, CheckCircle, Clock, CodeSquare, GitMerge, PlayCircle } from 'lucide-react';
import { WorkflowStatus } from '../../lib/types/worktree';
import { cn } from '../../lib/utils';

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

export function WorkflowStatusBadge({ status, className }: WorkflowStatusBadgeProps) {
  // Get status-specific styling and icon
  const getStatusProperties = () => {
    switch (status) {
      case WorkflowStatus.TO_START:
        return {
          bgColor: 'bg-slate-900 text-slate-100',
          icon: <Clock className="h-4 w-4 mr-1.5" />,
        };
      case WorkflowStatus.WIP:
        return {
          bgColor: 'bg-blue-950 text-blue-100',
          icon: <PlayCircle className="h-4 w-4 mr-1.5" />,
        };
      case WorkflowStatus.NEEDS_ATTENTION:
        return {
          bgColor: 'bg-red-950 text-red-100',
          icon: <AlertTriangle className="h-4 w-4 mr-1.5" />,
        };
      case WorkflowStatus.FOR_REVIEW:
        return {
          bgColor: 'bg-purple-950 text-purple-100',
          icon: <CodeSquare className="h-4 w-4 mr-1.5" />,
        };
      case WorkflowStatus.TO_MERGE:
        return {
          bgColor: 'bg-amber-950 text-amber-100',
          icon: <GitMerge className="h-4 w-4 mr-1.5" />,
        };
      case WorkflowStatus.COMPLETED:
        return {
          bgColor: 'bg-green-950 text-green-100',
          icon: <CheckCircle className="h-4 w-4 mr-1.5" />,
        };
      default:
        return {
          bgColor: 'bg-gray-900 text-gray-100',
          icon: <Clock className="h-4 w-4 mr-1.5" />,
        };
    }
  };

  const { bgColor, icon } = getStatusProperties();

  return (
    <div className={cn('flex items-center px-2 py-1 rounded-md', bgColor, className)}>
      {icon}
      <span className="text-xs font-medium">{status}</span>
    </div>
  );
}
