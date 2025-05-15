import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useFeatureContext } from '../../context/FeatureContext';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import { formatDate } from '../../lib/utils/format';
import { DataTable } from '../task-list/table/data-table';
import { columns } from '../task-list/table/columns';
import { ErrorBoundary } from '../layout/ErrorBoundary';

function FeatureDetailViewInner() {
  const [, params] = useRoute<{ id: string }>(routes.featureDetail(':id'));
  const id = params?.id;
  const featureId = `FEATURE_${id}`;
  const { features, getFeatureById, loading, error } = useFeatureContext();
  const { tasks } = useTaskContext();
  const [, navigate] = useLocation();
  const [feature, setFeature] = useState(getFeatureById(featureId));
  
  // Filter tasks that belong to this feature
  const featureTasks = tasks.filter(task => task.subdirectory === featureId);
  
  // Calculate progress
  const totalTasks = featureTasks.length;
  const completedTasks = featureTasks.filter(task => 
    task.status.includes('Done') || task.status.includes('Complete')).length;
  const progressPercentage = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    // Update feature data when features are loaded
    if (!loading && features.length > 0) {
      const foundFeature = getFeatureById(featureId);
      if (foundFeature) {
        setFeature(foundFeature);
      } else {
        // Feature not found, navigate to tasks view
        navigate(routes.taskList);
      }
    }
  }, [featureId, features, loading]);

  if (loading) {
    return <div className="p-4 text-center">Loading feature details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  if (!feature) {
    return <div className="p-4 text-center">Feature not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(routes.taskList)}
          className="mr-2"
        >
          ← Back to Tasks
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(routes.featureEdit(id))}
          >
            Edit Feature
          </Button>
          <Button
            size="sm"
            onClick={() => {
              // Navigate to create task with the feature pre-selected
              navigate(`${routes.taskCreate}?feature=${featureId}`);
            }}
          >
            Add Task
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(routes.comparison)}
          >
            Compare
          </Button>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-md border border-border mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <span className="text-blue-500 mr-2">📦</span>
              {feature.title || feature.name}
            </h1>
            
            {feature.description && (
              <p className="text-muted-foreground mb-4">{feature.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>{' '}
                <span>{feature.status || 'Not set'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phase:</span>{' '}
                <span>{feature.phase || 'Not set'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>{' '}
                <span>{formatDate(feature.created_date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>{' '}
                <span>{formatDate(feature.updated_date)}</span>
              </div>
              {feature.assigned_to && (
                <div>
                  <span className="text-muted-foreground">Assigned To:</span>{' '}
                  <span className="font-mono">{feature.assigned_to}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="mb-2 text-sm text-muted-foreground">
              Progress: {completedTasks} of {totalTasks} tasks completed
            </div>
            <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-1 text-sm font-medium">{progressPercentage}%</div>
            
            {/* Detailed status metrics */}
            {totalTasks > 0 && (
              <div className="mt-4 p-3 bg-accent/20 rounded-md w-64">
                <h3 className="text-xs font-medium mb-2">Task Status Breakdown</h3>
                
                {/* Group tasks by status */}
                {(() => {
                  const statusGroups: Record<string, number> = {};
                  featureTasks.forEach(task => {
                    statusGroups[task.status] = (statusGroups[task.status] || 0) + 1;
                  });
                  
                  return Object.entries(statusGroups).map(([status, count]) => {
                    const percentage = Math.round((count / totalTasks) * 100);
                    
                    // Determine color based on status
                    let color = 'bg-gray-500';
                    if (status.includes('Done') || status.includes('Complete')) {
                      color = 'bg-green-500';
                    } else if (status.includes('Progress')) {
                      color = 'bg-blue-500';
                    } else if (status.includes('To Do')) {
                      color = 'bg-yellow-500';
                    } else if (status.includes('Block') || status.includes('Issue')) {
                      color = 'bg-red-500';
                    }
                    
                    return (
                      <div key={status} className="mb-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{status}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${color}`} 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
        
        {feature.tags && feature.tags.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-muted-foreground mr-2">Tags:</span>
            {feature.tags.map(tag => (
              <span 
                key={tag} 
                className="bg-accent/20 text-xs px-2 py-1 rounded-md mr-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Tasks in Feature</h2>
        
        {featureTasks.length === 0 ? (
          <div className="text-center p-4 border border-border rounded-md">
            <p className="text-muted-foreground">No tasks in this feature yet</p>
            <Button 
              className="mt-2" 
              onClick={() => navigate(routes.taskCreate)}
            >
              Create Task
            </Button>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={featureTasks}
            onRowClick={(row) => navigate(routes.taskDetail(row.id))}
          />
        )}
      </div>
    </div>
  );
}

export function FeatureDetailView() {
  const { refreshFeatures } = useFeatureContext();
  
  return (
    <ErrorBoundary
      fallback={<div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading feature details</p>
        <Button onClick={refreshFeatures}>Retry</Button>
      </div>}
    >
      <FeatureDetailViewInner />
    </ErrorBoundary>
  );
}