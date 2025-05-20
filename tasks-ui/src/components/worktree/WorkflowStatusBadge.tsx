import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CodeSquare,
  GitMerge,
  PlayCircle
} from 'lucide-react';
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
          bgColor: 'bg-slate-700 text-slate-100',
          icon: <Clock className="h-4 w-4 mr-1.5" />
        };
      case WorkflowStatus.WIP:
        return {
          bgColor: 'bg-blue-700 text-blue-100',
          icon: <PlayCircle className="h-4 w-4 mr-1.5" />
        };
      case WorkflowStatus.NEEDS_ATTENTION:
        return {
          bgColor: 'bg-red-700 text-red-100',
          icon: <AlertTriangle className="h-4 w-4 mr-1.5" />
        };
      case WorkflowStatus.FOR_REVIEW:
        return {
          bgColor: 'bg-purple-700 text-purple-100',
          icon: <CodeSquare className="h-4 w-4 mr-1.5" />
        };
      case WorkflowStatus.TO_MERGE:
        return {
          bgColor: 'bg-orange-700 text-orange-100',
          icon: <GitMerge className="h-4 w-4 mr-1.5" />
        };
      case WorkflowStatus.COMPLETED:
        return {
          bgColor: 'bg-green-700 text-green-100',
          icon: <CheckCircle className="h-4 w-4 mr-1.5" />
        };
      default:
        return {
          bgColor: 'bg-gray-700 text-gray-100',
          icon: <Clock className="h-4 w-4 mr-1.5" />
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