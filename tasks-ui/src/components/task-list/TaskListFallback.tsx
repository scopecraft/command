import { useState } from 'react';
import { Button } from '../ui/button';

interface TaskListFallbackProps {
  error?: Error | null;
  onRetry?: () => Promise<void>;
}

export function TaskListFallback({ error, onRetry }: TaskListFallbackProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="p-8 rounded-lg border border-border bg-card shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Failed to load task list</h2>
        <p className="mb-6 text-muted-foreground">
          There was a problem loading the task list. This could be due to file system permissions, 
          network issues, or a temporary server error.
        </p>
        
        {error && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Error details:</p>
            <pre className="p-2 rounded bg-muted text-xs overflow-auto max-h-40">
              {error.message || String(error)}
            </pre>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            disabled={retrying}
          >
            Reload Page
          </Button>
          {onRetry && (
            <Button onClick={handleRetry} disabled={retrying}>
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}