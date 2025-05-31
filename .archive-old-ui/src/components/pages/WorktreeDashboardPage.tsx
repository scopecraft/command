import { ErrorBoundary } from '../layout/ErrorBoundary';
import { WorktreeDashboard } from '../worktree/WorktreeDashboard';

interface WorktreeDashboardPageProps {
  // Add any props that might be needed in the future
}

function WorktreeDashboardPageInner() {
  return (
    <div className="h-full overflow-auto">
      <WorktreeDashboard />
    </div>
  );
}

export function WorktreeDashboardPage(_props: WorktreeDashboardPageProps) {
  return (
    <ErrorBoundary fallback={
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Error Loading Worktree Dashboard</h2>
        <p className="text-muted-foreground mb-4">
          There was an error loading the worktree dashboard. Please try again later.
        </p>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    }>
      <WorktreeDashboardPageInner />
    </ErrorBoundary>
  );
}