import { useState, useEffect, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useFeatureContext } from '../../context/FeatureContext';
import { useTaskContext } from '../../context/TaskContext';
import { usePhaseContext } from '../../context/PhaseContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import { formatDate } from '../../lib/utils/format';
import { DataTable } from '../task-list/table/data-table';
import { columns } from '../task-list/table/columns';
import { ErrorBoundary } from '../layout/ErrorBoundary';
import { EntityGroupSection, PhaseSelector } from '../entity-group';
import { useQueryParams } from '../../hooks/useQueryParams';

function FeatureDetailViewInner() {
  const [, params] = useRoute<{ id: string }>(routes.featureDetail(':id'));
  const id = params?.id;
  const featureId = `FEATURE_${id}`;
  const { features, getFeatureById, loading, error } = useFeatureContext();
  const { tasks } = useTaskContext();
  const { phases } = usePhaseContext();
  const [, navigate] = useLocation();
  const [feature, setFeature] = useState(getFeatureById(featureId));
  
  // Get phase from query params for direct phase filtering
  const { getParam, setParam } = useQueryParams();
  const queryPhase = getParam('phase');
  
  // Track the selected phase for filtering sections (null means show all phases)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(queryPhase);
  
  // Filter tasks that belong to this feature
  const featureTasks = useMemo(() => 
    tasks.filter(task => task.subdirectory === featureId),
    [tasks, featureId]
  );
  
  // Calculate progress
  const totalTasks = featureTasks.length;
  const completedTasks = featureTasks.filter(task => 
    task.status.includes('Done') || task.status.includes('Complete')).length;
  const progressPercentage = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
  
  // Group tasks by phase, filtered by selected phase if applicable
  const tasksByPhase = useMemo(() => {
    const result = groupTasksByPhase(featureTasks);
    
    // If no phase is selected, return all phase groups
    if (!selectedPhase) return result;
    
    // Otherwise, only return the selected phase group
    const filteredResult: Record<string, any[]> = {};
    if (result[selectedPhase]) {
      filteredResult[selectedPhase] = result[selectedPhase];
    }
    
    return filteredResult;
  }, [featureTasks, selectedPhase]);

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

  // Update URL when phase selection changes
  useEffect(() => {
    setParam('phase', selectedPhase);
  }, [selectedPhase, setParam]);

  // Handle phase selection
  const handlePhaseSelect = (phaseId: string) => {
    // Toggle selection: if already selected, clear it
    setSelectedPhase(phaseId === selectedPhase ? null : phaseId);
  };

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
              const params = new URLSearchParams();
              params.append('feature', featureId);
              
              // Include phase if one is selected
              if (selectedPhase) {
                params.append('phase', selectedPhase);
              }
              
              navigate(`${routes.taskCreate}?${params}`);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <span className="text-blue-500 mr-2">📦</span>
              {feature.title || feature.name}
            </h1>

            {/* Show which phases this feature exists in */}
            {feature.phases && feature.phases.length > 0 && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Active in phases:</span>
                <div className="flex flex-wrap gap-1">
                  {feature.phases.map((phase) => (
                    <span
                      key={phase}
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs px-2 py-0.5 rounded"
                    >
                      {phase}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phase selector */}
          {feature.phases && feature.phases.length > 1 && (
            <PhaseSelector
              entityType="feature"
              phases={feature.phases}
              currentPhase={selectedPhase}
              onPhaseSelect={handlePhaseSelect}
            />
          )}
        </div>
      </div>
      
      {/* Phase-specific sections */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedPhase 
              ? `Tasks in ${phases.find(p => p.id === selectedPhase)?.name || selectedPhase} Phase`
              : 'Tasks by Phase'}
          </h2>
          
          {selectedPhase && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedPhase(null)}
            >
              Show All Phases
            </Button>
          )}
        </div>
        
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
        ) : Object.keys(tasksByPhase).length === 0 ? (
          <div className="text-center p-4 border border-border rounded-md">
            <p className="text-muted-foreground">No tasks in the selected phase</p>
            <Button 
              className="mt-2" 
              onClick={() => {
                // Create task in this feature and the selected phase
                const params = new URLSearchParams();
                params.append('feature', featureId);
                if (selectedPhase) {
                  params.append('phase', selectedPhase);
                }
                navigate(`${routes.taskCreate}?${params}`);
              }}
            >
              Create Task in This Phase
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(tasksByPhase).map(([phaseId, phaseTasks]) => {
              // Find the phase object
              const phase = phases.find(p => p.id === phaseId) || {
                id: phaseId,
                name: phaseId === 'unassigned' ? 'Unassigned' : phaseId,
                order: 999
              };
              
              // Get phase-specific feature data if available
              const phaseSpecificFeature = features.find(f => 
                f.id === featureId && f.phase === phaseId
              );
              
              return (
                <EntityGroupSection
                  key={phaseId}
                  parentEntity={{
                    id: featureId,
                    type: 'feature',
                    name: feature.name
                  }}
                  childEntity={{
                    id: phase.id,
                    type: 'phase',
                    name: phase.name,
                    status: phase.status,
                    // We add feature's phase-specific metadata to each phase section
                    description: phaseSpecificFeature?.description,
                    tags: phaseSpecificFeature?.tags,
                    assigned_to: phaseSpecificFeature?.assigned_to,
                    created_date: phaseSpecificFeature?.created_date,
                    updated_date: phaseSpecificFeature?.updated_date
                  }}
                  tasks={phaseTasks}
                  // Can include phase-specific overview content here if needed
                  overviewContent={phaseSpecificFeature?.description}
                />
              );
            })}
          </div>
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

// Helper function to group tasks by phase
function groupTasksByPhase(tasks: any[]) {
  const taskGroups: Record<string, any[]> = {};
  
  // First collect all tasks by phase
  tasks.forEach(task => {
    const phase = task.phase || 'unassigned';
    if (!taskGroups[phase]) {
      taskGroups[phase] = [];
    }
    taskGroups[phase].push(task);
  });
  
  return taskGroups;
}