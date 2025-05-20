import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CodeSquare,
  GitMerge,
  Loader2,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  fetchWorktree,
  fetchWorktrees,
  getDashboardConfig,
  getWorktreeSummary,
  saveDashboardConfig,
} from '../../lib/api/worktree-client';
import { routes } from '../../lib/routes';
import type { Worktree, WorktreeDashboardConfig, WorktreeSummary } from '../../lib/types/worktree';
import { WorkflowStatus, WorktreeStatus } from '../../lib/types/worktree';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';
import { WorktreeCard } from './WorktreeCard';

export function WorktreeDashboard() {
  // For navigation
  const [, navigate] = useLocation();

  // Quicklinks component
  const QuickLinks = () => (
    <div className="flex justify-center gap-4 mb-8 mt-4">
      <Button variant="outline" size="lg" onClick={() => navigate(routes.taskCreate)}>
        Create Task
      </Button>
      <Button size="lg" onClick={() => navigate(routes.taskList)}>
        View Tasks
      </Button>
    </div>
  );
  // State for worktrees and loading
  const [worktrees, setWorktrees] = useState<Worktree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_summary, setSummary] = useState<WorktreeSummary | null>(null);

  // State for dashboard configuration
  const [config, setConfig] = useState<WorktreeDashboardConfig>({
    refreshInterval: 30000,
    showTaskInfo: true,
  });

  // State for refresh timer
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Fetch initial data
  useEffect(() => {
    loadDashboardConfig();
    refreshWorktrees();
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      refreshWorktrees();
    }, config.refreshInterval);

    return () => clearInterval(interval);
  }, [config.refreshInterval, autoRefreshEnabled]);

  // Load dashboard configuration
  const loadDashboardConfig = async () => {
    const result = await getDashboardConfig();
    if (result.success && result.data) {
      setConfig(result.data);
    }
  };

  // Save dashboard configuration
  const _saveDashboardConfiguration = async (newConfig: WorktreeDashboardConfig) => {
    const result = await saveDashboardConfig(newConfig);
    if (result.success && result.data) {
      setConfig(result.data);
    }
  };

  // Refresh all worktrees
  const refreshWorktrees = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch worktrees
      const result = await fetchWorktrees();

      if (result.success && result.data) {
        setWorktrees(result.data);

        // Get summary statistics
        const summaryResult = await getWorktreeSummary();
        if (summaryResult.success && summaryResult.data) {
          setSummary(summaryResult.data);
        }
      } else {
        setError(result.message || 'Failed to fetch worktrees');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error refreshing worktrees');
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  // Refresh a single worktree
  const refreshSingleWorktree = async (path: string) => {
    // Set loading state for this specific worktree
    setWorktrees((current) =>
      current.map((w) => (w.path === path ? { ...w, isLoading: true } : w))
    );

    try {
      // Fetch updated worktree data
      const result = await fetchWorktree(path);

      if (result.success && result.data) {
        // Update this worktree in the list
        setWorktrees((current) =>
          current.map((w) => (w.path === path ? { ...result.data, isLoading: false } : w))
        );
      } else {
        // Set error state for this worktree
        setWorktrees((current) =>
          current.map((w) =>
            w.path === path ? { ...w, isLoading: false, error: result.message } : w
          )
        );
      }
    } catch (err) {
      // Set error state for this worktree
      setWorktrees((current) =>
        current.map((w) =>
          w.path === path
            ? {
                ...w,
                isLoading: false,
                error: err instanceof Error ? err.message : 'Unknown error',
              }
            : w
        )
      );
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };



  // Render loading state
  if (loading && worktrees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary/70" />
        <div className="text-lg">Loading worktrees...</div>
      </div>
    );
  }

  // Render error state
  if (error && worktrees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <div className="text-lg mb-4">Error loading worktrees</div>
        <div className="text-sm mb-4">{error}</div>
        <Button onClick={refreshWorktrees} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Render empty state
  if (worktrees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg font-medium mb-4">No worktrees found</div>
        <div className="text-muted-foreground mb-6 max-w-md text-center">
          Git worktrees allow you to work on multiple branches simultaneously. Create a worktree to
          see it displayed here.
        </div>
        <Button onClick={refreshWorktrees} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  // Format last refresh time
  const formattedTime = lastRefresh.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="container p-4">
      {/* Dashboard header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
          {/* Last Activities Section */}
          <div className="w-full md:w-auto">
            <h3 className="text-sm font-medium mb-2">Last Activities</h3>
            <div className="space-y-1.5">
              {worktrees
                .sort((a, b) => {
                  const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
                  const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
                  return dateB - dateA;
                })
                .slice(0, 3)
                .map((worktree) => {
                  // Get the activity description based on worktree status
                  let activityDesc = '';
                  if (worktree.status === WorktreeStatus.MODIFIED) {
                    activityDesc = `${worktree.changedFiles?.length || 0} files modified`;
                  } else if (worktree.status === WorktreeStatus.CONFLICT) {
                    activityDesc = 'Merge conflicts detected';
                  } else if (worktree.status === WorktreeStatus.UNTRACKED) {
                    activityDesc = 'New files added';
                  } else {
                    activityDesc = `Commit "${worktree.headCommit.substring(0, 7)}"`;
                  }

                  // Format the activity time
                  const timeAgo = worktree.lastActivity
                    ? `${Math.floor((Date.now() - new Date(worktree.lastActivity).getTime()) / (1000 * 60))}m ago`
                    : '';

                  // Get branch or task display name
                  const displayName = worktree.taskId 
                    ? worktree.taskId.split('-')[0] 
                    : worktree.branch.replace(/^(feature|bugfix|hotfix)\//, '');

                  return (
                    <div key={worktree.path} className="flex items-center text-xs">
                      <span className="font-medium text-primary-foreground/80">{displayName}:</span>
                      <span className="ml-1.5 text-muted-foreground">{activityDesc} ({timeAgo})</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Refresh Controls */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button
                variant={autoRefreshEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={toggleAutoRefresh}
                className="h-8 px-3 flex items-center gap-1"
              >
                AUTO-REFRESH {autoRefreshEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={refreshWorktrees}
                size="sm"
                className="h-8 px-3 flex items-center gap-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    REFRESHING
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    REFRESH ALL
                  </>
                )}
              </Button>
            </div>

            {/* Last refresh time */}
            <div className="text-xs text-muted-foreground">
              Last refreshed: {formattedTime}
              {autoRefreshEnabled && (
                <span className="ml-2">(Auto-refresh every {config.refreshInterval / 1000}s)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Worktree grid */}
      <div className="flex flex-wrap gap-4 mb-8">
        {worktrees.map((worktree) => (
          <div
            key={worktree.path}
            className="w-full md:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)] flex-shrink-0 flex-grow-0"
          >
            <WorktreeCard worktree={worktree} onRefresh={refreshSingleWorktree} />
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <QuickLinks />
    </div>
  );
}
