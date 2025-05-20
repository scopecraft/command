import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  FileText,
  GitBranch,
  GitCommit,
  HelpCircle,
  PlusCircle,
  RefreshCw,
  Trash,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { routes } from '../../lib/routes';
import type { Worktree } from '../../lib/types/worktree';
import { WorkflowStatus, WorktreeStatus } from '../../lib/types/worktree';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { FeatureProgress } from './FeatureProgress';
import { ModeIndicator } from './ModeIndicator';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

interface WorktreeCardProps {
  worktree: Worktree;
  onRefresh?: (path: string) => void;
}

export function WorktreeCard({ worktree, onRefresh }: WorktreeCardProps) {
  const [, navigate] = useLocation();
  const [showChangedFiles, setShowChangedFiles] = useState(false);

  // Helper to get display-friendly branch name
  const getBranchDisplay = (branch: string) => {
    // Remove remote reference if present
    const branchName = branch.replace(/^(origin|upstream)\//, '');
    // Format with shorter prefix
    return branchName.replace(
      /^(feature|bugfix|hotfix|release)\//,
      (match) => `${match.charAt(0)}/`
    );
  };

  // Get status-specific styling for background colors
  const getStatusBgColor = (status: WorktreeStatus) => {
    switch (status) {
      case WorktreeStatus.CLEAN:
        return 'bg-green-950 text-green-100';
      case WorktreeStatus.MODIFIED:
        return 'bg-blue-950 text-blue-100';
      case WorktreeStatus.UNTRACKED:
        return 'bg-amber-950 text-amber-100';
      case WorktreeStatus.CONFLICT:
        return 'bg-red-950 text-red-100';
      default:
        return 'bg-gray-900 text-gray-100';
    }
  };

  // Get status text
  const getStatusText = (status: WorktreeStatus) => {
    switch (status) {
      case WorktreeStatus.CLEAN:
        return 'clean';
      case WorktreeStatus.MODIFIED:
        return 'modified';
      case WorktreeStatus.UNTRACKED:
        return 'untracked';
      case WorktreeStatus.CONFLICT:
        return 'conflict';
      default:
        return 'unknown';
    }
  };

  // Get status icon component
  const StatusIcon = ({ status }: { status: WorktreeStatus }) => {
    switch (status) {
      case WorktreeStatus.CLEAN:
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case WorktreeStatus.MODIFIED:
        return <RefreshCw className="h-4 w-4 mr-1" />;
      case WorktreeStatus.UNTRACKED:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case WorktreeStatus.CONFLICT:
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return <HelpCircle className="h-4 w-4 mr-1" />;
    }
  };

  // Get task status badge color if available
  const getTaskStatusColor = (status?: string) => {
    if (!status) return '';

    if (status.includes('Done') || status.includes('Complete')) {
      return 'bg-green-950 text-green-100';
    }
    if (status.includes('Progress')) {
      return 'bg-blue-950 text-blue-100';
    }
    if (status.includes('To Do')) {
      return 'bg-amber-950 text-amber-100';
    }
    if (status.includes('Block') || status.includes('Issue')) {
      return 'bg-red-950 text-red-100';
    }
    return 'bg-gray-900 text-gray-100';
  };

  // Get path display (shortened)
  const getPathDisplay = (path: string) => {
    // Extract the last part of the path (worktree name)
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  // Handle navigation to task if available
  const navigateToTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (worktree.taskId) {
      navigate(routes.taskDetail(worktree.taskId));
    }
  };

  // Handle refresh request
  const _handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRefresh) {
      onRefresh(worktree.path);
    }
  };

  // Create the git status badge component
  const GitStatusBadge = () => (
    <div className={cn('flex items-center px-2 py-1 rounded', getStatusBgColor(worktree.status))}>
      <StatusIcon status={worktree.status} />
      <span className="text-xs font-medium">{getStatusText(worktree.status)}</span>
    </div>
  );

  // Determine if we should show the workflow status or git status
  const showWorkflowStatus = worktree.workflowStatus !== undefined;

  // Render card
  return (
    <div
      className={cn(
        'w-full border border-border rounded-md overflow-hidden transition-all h-auto',
        worktree.isLoading && 'opacity-70'
      )}
    >
      {/* Header section - Task ID and Title */}
      <div className="bg-card/50 p-3">
        {/* Task/Feature ID */}
        <div className="flex items-center">
          {worktree.taskId ? (
            <h3 className="font-mono font-medium text-sm truncate" title={worktree.taskId}>
              {worktree.taskId}
            </h3>
          ) : (
            <h3 className="font-mono font-medium text-sm truncate" title={worktree.branch}>
              {getBranchDisplay(worktree.branch)}
            </h3>
          )}
        </div>

        {/* Task/Feature Title */}
        {worktree.taskTitle && (
          <div className="text-sm truncate font-medium mt-1" title={worktree.taskTitle}>
            {worktree.taskTitle}
          </div>
        )}
      </div>

      {/* Status section */}
      <div className="p-3 border-t border-border flex flex-col gap-3">
        {/* Status and mode indicators */}
        <div className="flex justify-between items-center">
          {/* Status indicator */}
          <div className="flex-shrink-0">
            {showWorkflowStatus ? (
              <WorkflowStatusBadge status={worktree.workflowStatus || WorkflowStatus.TO_START} />
            ) : (
              <GitStatusBadge />
            )}
          </div>

          {/* Mode indicator */}
          <div className="flex items-center">
            {worktree.mode?.current && (
              <ModeIndicator mode={worktree.mode.current} showLabel={true} />
            )}
            {!worktree.mode?.current && worktree.mode?.next && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                <ModeIndicator mode={worktree.mode.next} showLabel={true} />
              </div>
            )}
          </div>
        </div>

        {/* Feature progress if available */}
        {worktree.featureProgress && (
          <FeatureProgress
            totalTasks={worktree.featureProgress.totalTasks}
            completed={worktree.featureProgress.completed}
            inProgress={worktree.featureProgress.inProgress}
            blocked={worktree.featureProgress.blocked}
            toDo={worktree.featureProgress.toDo}
            tasks={worktree.featureProgress.tasks}
          />
        )}

        {/* View Task/Feature button */}
        {worktree.taskId && (
          <Button
            size="sm"
            variant="outline"
            onClick={navigateToTask}
            className="mt-1 w-full px-2 py-0 h-6 text-xs"
          >
            {worktree.taskId.startsWith('FEAT') ? 'VIEW FEATURE' : 'VIEW TASK'}
          </Button>
        )}
      </div>

      {/* Git Information section */}
      <div className="p-3 border-t border-border flex flex-col gap-2">
        {/* Branch and Commit info side by side */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <GitBranch className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-xs">{getBranchDisplay(worktree.branch)}</span>
          </div>

          <div className="flex items-center">
            <GitCommit className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="font-mono text-xs">{worktree.headCommit.substring(0, 7)}</span>
          </div>
        </div>

        {/* Worktree path */}
        <div className="flex items-center text-xs text-muted-foreground">
          {getPathDisplay(worktree.path)}
        </div>

        {/* Changed files section */}
        {worktree.status !== WorktreeStatus.CLEAN && (
          <div className="mt-2 border-t border-border/30 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowChangedFiles(!showChangedFiles);
              }}
              className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <FileText className="h-3 w-3 mr-1" />
              <span>Changed files ({worktree.changedFiles?.length || 0})</span>
              {showChangedFiles ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </button>

            {showChangedFiles && worktree.changedFiles && worktree.changedFiles.length > 0 && (
              <div className="mt-1 bg-muted/20 p-1 rounded text-xs">
                <ul className="space-y-1">
                  {worktree.changedFiles.map((file) => (
                    <li key={`${file.path}-${file.status}`} className="flex items-center">
                      {file.status === 'added' && (
                        <PlusCircle className="h-3 w-3 mr-1 text-green-400" />
                      )}
                      {file.status === 'modified' && (
                        <FileText className="h-3 w-3 mr-1 text-blue-400" />
                      )}
                      {file.status === 'deleted' && <Trash className="h-3 w-3 mr-1 text-red-400" />}
                      {file.status === 'renamed' && (
                        <ChevronRight className="h-3 w-3 mr-1 text-yellow-400" />
                      )}
                      {file.status === 'conflicted' && (
                        <XCircle className="h-3 w-3 mr-1 text-red-400" />
                      )}
                      <span className="truncate">{file.path}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showChangedFiles && (!worktree.changedFiles || worktree.changedFiles.length === 0) && (
              <div className="mt-1 bg-muted/20 p-1 rounded text-xs text-muted-foreground">
                No file details available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
