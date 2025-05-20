import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CodeSquare,
  Filter,
  GitMerge,
  Loader2,
  PlayCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchWorktree,
  fetchWorktrees,
  getDashboardConfig,
  getWorktreeSummary,
  saveDashboardConfig,
} from '../../lib/api/worktree-client';
import type { Worktree, WorktreeDashboardConfig, WorktreeSummary } from '../../lib/types/worktree';
import { DevelopmentMode, WorkflowStatus, WorktreeStatus } from '../../lib/types/worktree';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ModeIndicator } from './ModeIndicator';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';
import { WorktreeCard } from './WorktreeCard';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Dashboard is complex by design
export function WorktreeDashboard() {
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

  // Filter states
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | null>(null);
  const [modeFilter, setModeFilter] = useState<DevelopmentMode | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter worktrees
  const filteredWorktrees = worktrees.filter((worktree) => {
    // Apply workflow status filter
    if (statusFilter && worktree.workflowStatus !== statusFilter) {
      return false;
    }

    // Apply mode filter
    if (modeFilter) {
      if (worktree.mode?.current !== modeFilter && worktree.mode?.next !== modeFilter) {
        return false;
      }
    }

    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter(null);
    setModeFilter(null);
  };

  // Filter buttons for workflow status
  const StatusFilterButton = ({ status }: { status: WorkflowStatus }) => (
    <Button
      size="sm"
      variant={statusFilter === status ? 'default' : 'outline'}
      onClick={() => setStatusFilter(statusFilter === status ? null : status)}
      className="h-7 text-xs"
    >
      <WorkflowStatusBadge status={status} className="h-6 py-0" />
    </Button>
  );

  // Filter buttons for development mode
  const ModeFilterButton = ({ mode }: { mode: DevelopmentMode }) => (
    <Button
      size="sm"
      variant={modeFilter === mode ? 'default' : 'outline'}
      onClick={() => setModeFilter(modeFilter === mode ? null : mode)}
      className="h-7 px-2"
    >
      <ModeIndicator mode={mode} showLabel={true} size="sm" />
    </Button>
  );

  // Count worktrees by workflow status
  const getWorkflowStatusCounts = () => {
    const counts = {
      [WorkflowStatus.TO_START]: 0,
      [WorkflowStatus.WIP]: 0,
      [WorkflowStatus.NEEDS_ATTENTION]: 0,
      [WorkflowStatus.FOR_REVIEW]: 0,
      [WorkflowStatus.TO_MERGE]: 0,
      [WorkflowStatus.COMPLETED]: 0,
    };

    // Count worktrees by their workflow status
    for (const worktree of worktrees) {
      if (worktree.workflowStatus) {
        counts[worktree.workflowStatus]++;
      } else {
        // If no workflow status, map git status to a workflow status
        if (worktree.status === WorktreeStatus.CLEAN) {
          counts[WorkflowStatus.COMPLETED]++;
        } else if (worktree.status === WorktreeStatus.CONFLICT) {
          counts[WorkflowStatus.NEEDS_ATTENTION]++;
        } else {
          counts[WorkflowStatus.WIP]++;
        }
      }
    }

    return counts;
  };

  // Generate status summary badges based on workflow status
  const StatusSummaryBadges = () => {
    if (worktrees.length === 0) return null;

    const statusCounts = getWorkflowStatusCounts();

    return (
      <div className="flex flex-wrap gap-2">
        {statusCounts[WorkflowStatus.TO_START] > 0 && (
          <div className="bg-slate-900 text-slate-100 px-3 py-1 rounded flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>Start: {statusCounts[WorkflowStatus.TO_START]}</span>
          </div>
        )}
        {statusCounts[WorkflowStatus.WIP] > 0 && (
          <div className="bg-blue-950 text-blue-100 px-3 py-1 rounded flex items-center">
            <PlayCircle className="h-4 w-4 mr-1.5" />
            <span>WIP: {statusCounts[WorkflowStatus.WIP]}</span>
          </div>
        )}
        {statusCounts[WorkflowStatus.NEEDS_ATTENTION] > 0 && (
          <div className="bg-red-950 text-red-100 px-3 py-1 rounded flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1.5" />
            <span>Attention: {statusCounts[WorkflowStatus.NEEDS_ATTENTION]}</span>
          </div>
        )}
        {statusCounts[WorkflowStatus.FOR_REVIEW] > 0 && (
          <div className="bg-purple-950 text-purple-100 px-3 py-1 rounded flex items-center">
            <CodeSquare className="h-4 w-4 mr-1.5" />
            <span>Review: {statusCounts[WorkflowStatus.FOR_REVIEW]}</span>
          </div>
        )}
        {statusCounts[WorkflowStatus.TO_MERGE] > 0 && (
          <div className="bg-amber-950 text-amber-100 px-3 py-1 rounded flex items-center">
            <GitMerge className="h-4 w-4 mr-1.5" />
            <span>Merge: {statusCounts[WorkflowStatus.TO_MERGE]}</span>
          </div>
        )}
        {statusCounts[WorkflowStatus.COMPLETED] > 0 && (
          <div className="bg-green-950 text-green-100 px-3 py-1 rounded flex items-center">
            <CheckCircle className="h-4 w-4 mr-1.5" />
            <span>Done: {statusCounts[WorkflowStatus.COMPLETED]}</span>
          </div>
        )}
      </div>
    );
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold mb-0">Worktree Dashboard</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className="h-8 px-3 flex items-center gap-1 relative"
            >
              <Filter className="h-4 w-4" />
              FILTERS
              {(statusFilter || modeFilter) && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-4 h-4 rounded-full text-xs flex items-center justify-center">
                  {(statusFilter ? 1 : 0) + (modeFilter ? 1 : 0)}
                </span>
              )}
            </Button>
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
        </div>

        {/* Filters section */}
        {showFilters && (
          <div className="mb-4 p-3 bg-card/50 rounded-md border border-border">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium">Filter Worktrees</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 px-2 text-xs"
                disabled={!statusFilter && !modeFilter}
              >
                Clear Filters
              </Button>
            </div>

            <div className="space-y-3">
              {/* Workflow status filters */}
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Workflow Status</div>
                <div className="flex flex-wrap gap-2">
                  <StatusFilterButton status={WorkflowStatus.TO_START} />
                  <StatusFilterButton status={WorkflowStatus.WIP} />
                  <StatusFilterButton status={WorkflowStatus.NEEDS_ATTENTION} />
                  <StatusFilterButton status={WorkflowStatus.FOR_REVIEW} />
                  <StatusFilterButton status={WorkflowStatus.TO_MERGE} />
                  <StatusFilterButton status={WorkflowStatus.COMPLETED} />
                </div>
              </div>

              {/* Development mode filters */}
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Development Mode</div>
                <div className="flex flex-wrap gap-2">
                  <ModeFilterButton mode={DevelopmentMode.TYPESCRIPT} />
                  <ModeFilterButton mode={DevelopmentMode.UI} />
                  <ModeFilterButton mode={DevelopmentMode.CLI} />
                  <ModeFilterButton mode={DevelopmentMode.MCP} />
                  <ModeFilterButton mode={DevelopmentMode.DEVOPS} />
                  <ModeFilterButton mode={DevelopmentMode.CODEREVIEW} />
                  <ModeFilterButton mode={DevelopmentMode.PLANNING} />
                  <ModeFilterButton mode={DevelopmentMode.DOCUMENTATION} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status summary and last refresh time */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <StatusSummaryBadges />
          <div className="text-xs text-muted-foreground">
            Last refreshed: {formattedTime}
            {autoRefreshEnabled && (
              <span className="ml-2">(Auto-refresh every {config.refreshInterval / 1000}s)</span>
            )}
          </div>
        </div>
      </div>

      {/* Filtered result count if filters are active */}
      {(statusFilter || modeFilter) && worktrees.length !== filteredWorktrees.length && (
        <div className="mb-4 text-sm">
          Showing {filteredWorktrees.length} of {worktrees.length} worktrees
        </div>
      )}

      {/* Empty state when filters return no results */}
      {filteredWorktrees.length === 0 && (
        <div className="flex flex-col items-center justify-center bg-card/50 rounded-md border border-border p-8">
          <div className="text-lg mb-2">No matching worktrees</div>
          <div className="text-muted-foreground text-sm mb-4 text-center">
            No worktrees match your current filter criteria
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Worktree grid */}
      {filteredWorktrees.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {filteredWorktrees.map((worktree) => (
            <div
              key={worktree.path}
              className="w-full md:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)] flex-shrink-0 flex-grow-0"
            >
              <WorktreeCard worktree={worktree} onRefresh={refreshSingleWorktree} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
