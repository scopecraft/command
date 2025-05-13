import { useState } from 'react';
import { RelationshipGraph } from '../relationship-graph/RelationshipGraph';
import { ErrorBoundary } from '../layout/ErrorBoundary';

function GraphFallback() {
  return (
    <div className="container mx-auto p-4">
      <div className="p-8 rounded-lg border border-border bg-card shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Failed to load relationship graph</h2>
        <p className="mb-4 text-muted-foreground">
          There was a problem loading the task relationship graph. This could be due to an error in the visualization library.
        </p>
        
        <div className="flex justify-end">
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

export function GraphPage() {
  return (
    <div className="h-full flex flex-col">
      <ErrorBoundary fallback={<GraphFallback />}>
        <div className="flex-1">
          <RelationshipGraph />
        </div>
      </ErrorBoundary>
    </div>
  );
}