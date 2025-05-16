import { useState, useEffect, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { usePhaseContext } from '../../context/PhaseContext';
import { useFeatureContext } from '../../context/FeatureContext';
import { useAreaContext } from '../../context/AreaContext';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import { ErrorBoundary } from '../layout/ErrorBoundary';
import { EntityGroupSection } from '../entity-group';

function PhaseDetailViewInner() {
  const [, params] = useRoute<{ id: string }>(routes.phaseDetail(':id'));
  const phaseId = params?.id;
  
  const { phases, loading: phasesLoading, error: phaseError } = usePhaseContext();
  const { features, loading: featuresLoading, error: featuresError } = useFeatureContext();
  const { areas, loading: areasLoading, error: areasError } = useAreaContext();
  const { tasks } = useTaskContext();
  const [, navigate] = useLocation();
  
  // Find the phase object
  const phase = useMemo(() => 
    phases.find(p => p.id === phaseId),
    [phases, phaseId]
  );
  
  // Filter features that belong to this phase
  const phaseFeatures = useMemo(() => 
    features.filter(feature => feature.phase === phaseId),
    [features, phaseId]
  );
  
  // Filter areas that belong to this phase
  const phaseAreas = useMemo(() => 
    areas.filter(area => area.phase === phaseId),
    [areas, phaseId]
  );
  
  // Filter tasks that belong to this phase
  const phaseTasks = useMemo(() => 
    tasks.filter(task => task.phase === phaseId),
    [tasks, phaseId]
  );
  
  // Group tasks by feature or area
  const tasksByEntity = useMemo(() => {
    const result = new Map();
    
    // First group tasks by subdirectory (feature/area)
    phaseTasks.forEach(task => {
      if (task.subdirectory) {
        if (!result.has(task.subdirectory)) {
          result.set(task.subdirectory, []);
        }
        result.get(task.subdirectory).push(task);
      }
    });
    
    return result;
  }, [phaseTasks]);
  
  const loading = phasesLoading || featuresLoading || areasLoading;
  const error = phaseError || featuresError || areasError;

  if (loading) {
    return <div className="p-4 text-center">Loading phase details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  if (!phase) {
    return <div className="p-4 text-center">Phase not found</div>;
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
            size="sm"
            onClick={() => {
              // Navigate to create task with phase pre-selected
              navigate(`${routes.taskCreate}?phase=${phaseId}`);
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
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <span className="text-purple-500 mr-2">🔄</span>
            {phase.name}
          </h1>
          
          {phase.description && (
            <p className="text-muted-foreground mt-2">{phase.description}</p>
          )}
          
          {phase.status && (
            <div className="mt-3">
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 text-xs px-2 py-1 rounded">
                {phase.status}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Features in this phase */}
      {phaseFeatures.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Features in this Phase</h2>
          <div className="space-y-4">
            {phaseFeatures.map(feature => {
              // Get tasks for this feature
              const featureTasks = tasksByEntity.get(feature.id) || [];
              
              return (
                <EntityGroupSection
                  key={feature.id}
                  parentEntity={{
                    id: phaseId,
                    type: 'phase',
                    name: phase.name
                  }}
                  childEntity={{
                    id: feature.id,
                    type: 'feature',
                    name: feature.name,
                    title: feature.title,
                    description: feature.description,
                    status: feature.status,
                    tags: feature.tags,
                    assigned_to: feature.assigned_to,
                    created_date: feature.created_date,
                    updated_date: feature.updated_date,
                    progress: feature.progress
                  }}
                  tasks={featureTasks}
                />
              );
            })}
          </div>
        </div>
      )}
      
      {/* Areas in this phase */}
      {phaseAreas.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Areas in this Phase</h2>
          <div className="space-y-4">
            {phaseAreas.map(area => {
              // Get tasks for this area
              const areaTasks = tasksByEntity.get(area.id) || [];
              
              return (
                <EntityGroupSection
                  key={area.id}
                  parentEntity={{
                    id: phaseId,
                    type: 'phase',
                    name: phase.name
                  }}
                  childEntity={{
                    id: area.id,
                    type: 'area',
                    name: area.name,
                    title: area.title,
                    description: area.description,
                    status: area.status,
                    tags: area.tags,
                    assigned_to: area.assigned_to,
                    created_date: area.created_date,
                    updated_date: area.updated_date,
                    progress: area.progress
                  }}
                  tasks={areaTasks}
                />
              );
            })}
          </div>
        </div>
      )}
      
      {/* Unassigned tasks in this phase */}
      {phaseTasks.filter(task => !task.subdirectory).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Unassigned Tasks</h2>
          <div className="bg-card p-4 rounded-md border border-border">
            <ul className="space-y-2">
              {phaseTasks
                .filter(task => !task.subdirectory)
                .map(task => (
                  <li 
                    key={task.id}
                    className="p-2 hover:bg-accent/20 rounded-md cursor-pointer"
                    onClick={() => navigate(routes.taskDetail(task.id))}
                  >
                    <div className="flex justify-between">
                      <span>{task.title}</span>
                      <span className="text-sm text-muted-foreground">{task.type}</span>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      )}
      
      {phaseFeatures.length === 0 && phaseAreas.length === 0 && phaseTasks.length === 0 && (
        <div className="text-center p-8 border border-border rounded-md">
          <p className="text-muted-foreground mb-4">No features, areas, or tasks in this phase yet</p>
          <Button 
            onClick={() => navigate(`${routes.taskCreate}?phase=${phaseId}`)}
          >
            Create Task
          </Button>
        </div>
      )}
    </div>
  );
}

export function PhaseDetailView() {
  const { refreshPhases } = usePhaseContext();
  
  return (
    <ErrorBoundary
      fallback={<div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading phase details</p>
        <Button onClick={refreshPhases}>Retry</Button>
      </div>}
    >
      <PhaseDetailViewInner />
    </ErrorBoundary>
  );
}