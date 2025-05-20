import { AlertTriangle, CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchWorktree,
  fetchWorktrees,
  getDashboardConfig,
  getWorktreeSummary,
  saveDashboardConfig,
} from '../../lib/api/worktree-client';
import type { Worktree, WorktreeDashboardConfig, WorktreeSummary } from '../../lib/types/worktree';
import { WorktreeStatus } from '../../lib/types/worktree';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { WorktreeCard } from './WorktreeCard';

export function WorktreeDashboard() {
  // State for worktrees and loading
  const [worktrees, setWorktrees] = useState<Worktree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<WorktreeSummary | null>(null);

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
  const saveDashboardConfiguration = async (newConfig: WorktreeDashboardConfig) => {
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

  // Generate status summary badges
  const StatusSummaryBadges = () => {
    if (!summary) return null;

    return (
      <div className="flex flex-wrap gap-2">
        <div className="bg-green-950 text-green-100 px-3 py-1 rounded-md flex items-center">
          <CheckCircle className="h-4 w-4 mr-1.5" />
          <span>Clean: {summary.clean}</span>
        </div>
        {summary.modified > 0 && (
          <div className="bg-blue-950 text-blue-100 px-3 py-1 rounded-md flex items-center">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            <span>Modified: {summary.modified}</span>
          </div>
        )}
        {summary.untracked > 0 && (
          <div className="bg-amber-950 text-amber-100 px-3 py-1 rounded-md flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1.5" />
            <span>Untracked: {summary.untracked}</span>
          </div>
        )}
        {summary.conflict > 0 && (
          <div className="bg-red-950 text-red-100 px-3 py-1 rounded-md flex items-center">
            <XCircle className="h-4 w-4 mr-1.5" />
            <span>Conflicts: {summary.conflict}</span>
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
    hour12: true 
  });

  // Render dashboard with worktrees
  return (
    <div className="container p-4">
      {/* Dashboard header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold mb-0">Worktree Dashboard</h1>
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
        </div>

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

      {/* Worktree grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
        {worktrees.map((worktree) => (
          <WorktreeCard
            key={worktree.path}
            worktree={worktree}
            onRefresh={refreshSingleWorktree}
          />
        ))}
      </div>
    </div>
  );
}