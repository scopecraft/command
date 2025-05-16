import { useState, useEffect, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAreaContext } from '../../context/AreaContext';
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

function AreaDetailViewInner() {
  const [, params] = useRoute<{ id: string }>(routes.areaDetail(':id'));
  const id = params?.id;
  const areaId = `AREA_${id}`;
  const { areas, getAreaById, loading, error } = useAreaContext();
  const { tasks } = useTaskContext();
  const { phases } = usePhaseContext();
  const [, navigate] = useLocation();
  const [area, setArea] = useState(getAreaById(areaId));
  
  // Get phase from query params for direct phase filtering
  const { getParam, setParam } = useQueryParams();
  const queryPhase = getParam('phase');
  
  // Track the selected phase for filtering sections (null means show all phases)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(queryPhase);
  
  // Filter tasks that belong to this area
  const areaTasks = useMemo(() => 
    tasks.filter(task => task.subdirectory === areaId),
    [tasks, areaId]
  );
  
  // Calculate progress
  const totalTasks = areaTasks.length;
  const completedTasks = areaTasks.filter(task => 
    task.status.includes('Done') || task.status.includes('Complete')).length;
  const progressPercentage = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
  
  // Group tasks by phase, filtered by selected phase if applicable
  const tasksByPhase = useMemo(() => {
    const result = groupTasksByPhase(areaTasks);
    
    // If no phase is selected, return all phase groups
    if (!selectedPhase) return result;
    
    // Otherwise, only return the selected phase group
    const filteredResult: Record<string, any[]> = {};
    if (result[selectedPhase]) {
      filteredResult[selectedPhase] = result[selectedPhase];
    }
    
    return filteredResult;
  }, [areaTasks, selectedPhase]);

  useEffect(() => {
    // Update area data when areas are loaded
    if (!loading && areas.length > 0) {
      const foundArea = getAreaById(areaId);
      if (foundArea) {
        setArea(foundArea);
      } else {
        // Area not found, navigate to tasks view
        navigate(routes.taskList);
      }
    }
  }, [areaId, areas, loading]);

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
    return <div className="p-4 text-center">Loading area details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  if (!area) {
    return <div className="p-4 text-center">Area not found</div>;
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
            onClick={() => navigate(routes.areaEdit(id))}
          >
            Edit Area
          </Button>
          <Button
            size="sm"
            onClick={() => {
              // Navigate to create task with the area pre-selected
              const params = new URLSearchParams();
              params.append('area', areaId);
              
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
              <span className="text-green-500 mr-2">🔷</span>
              {area.title || area.name}
            </h1>

            {/* Show which phases this area exists in */}
            {area.phases && area.phases.length > 0 && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Active in phases:</span>
                <div className="flex flex-wrap gap-1">
                  {area.phases.map((phase) => (
                    <span
                      key={phase}
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs px-2 py-0.5 rounded"
                    >
                      {phase}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phase selector */}
          {area.phases && area.phases.length > 1 && (
            <PhaseSelector
              entityType="area"
              phases={area.phases}
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
        
        {areaTasks.length === 0 ? (
          <div className="text-center p-4 border border-border rounded-md">
            <p className="text-muted-foreground">No tasks in this area yet</p>
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
                // Create task in this area and the selected phase
                const params = new URLSearchParams();
                params.append('area', areaId);
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
              
              // Get phase-specific area data if available
              const phaseSpecificArea = areas.find(a => 
                a.id === areaId && a.phase === phaseId
              );
              
              return (
                <EntityGroupSection
                  key={phaseId}
                  parentEntity={{
                    id: areaId,
                    type: 'area',
                    name: area.name
                  }}
                  childEntity={{
                    id: phase.id,
                    type: 'phase',
                    name: phase.name,
                    status: phase.status,
                    // We add area's phase-specific metadata to each phase section
                    description: phaseSpecificArea?.description,
                    tags: phaseSpecificArea?.tags,
                    assigned_to: phaseSpecificArea?.assigned_to,
                    created_date: phaseSpecificArea?.created_date,
                    updated_date: phaseSpecificArea?.updated_date
                  }}
                  tasks={phaseTasks}
                  // Can include phase-specific overview content here if needed
                  overviewContent={phaseSpecificArea?.description}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function AreaDetailView() {
  const { refreshAreas } = useAreaContext();
  
  return (
    <ErrorBoundary
      fallback={<div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading area details</p>
        <Button onClick={refreshAreas}>Retry</Button>
      </div>}
    >
      <AreaDetailViewInner />
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