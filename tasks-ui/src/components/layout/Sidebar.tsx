import { useLocation, Link } from 'wouter';
import { useUIContext } from '../../context/UIContext';
import { usePhaseContext } from '../../context/PhaseContext';
import { useFeatureContext } from '../../context/FeatureContext';
import { useAreaContext } from '../../context/AreaContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';

export function Sidebar() {
  const { ui } = useUIContext();
  const { phases, currentPhase, loading: phasesLoading, setCurrentPhase } = usePhaseContext();
  const { features, loading: featuresLoading, currentFeature, setCurrentFeature } = useFeatureContext();
  const { areas, loading: areasLoading, currentArea, setCurrentArea } = useAreaContext();
  const [, navigate] = useLocation();
  
  // Handle phase selection and navigate to task list with phase filter
  const handlePhaseClick = (phaseId: string) => {
    console.log('Selected phase:', phaseId);
    setCurrentPhase(phaseId);
    // Navigate to tasks view with phase filter in URL
    navigate('/tasks?phase=' + phaseId);
  };
  
  // Handle feature selection and navigate to task list with feature filter
  const handleFeatureClick = (featureId: string) => {
    console.log('Selected feature:', featureId);
    setCurrentFeature(featureId);
    // Clear current area selection
    if (currentArea) {
      setCurrentArea(null);
    }
    // Navigate to tasks view with feature filter in URL
    navigate('/tasks?feature=' + featureId);
  };
  
  // Handle area selection and navigate to task list with area filter
  const handleAreaClick = (areaId: string) => {
    console.log('Selected area:', areaId);
    setCurrentArea(areaId);
    // Clear current feature selection
    if (currentFeature) {
      setCurrentFeature(null);
    }
    // Navigate to tasks view with area filter in URL
    navigate('/tasks?area=' + areaId);
  };

  if (!ui.sidebarOpen) return null;

  return (
    <aside className="w-64 h-full bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-muted-foreground">Views</h2>
      </div>
      <div className="p-2 border-b border-border">
        <ul className="space-y-1">
          <li>
            <Link href={routes.taskList}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
              >
                <span className="truncate">Task List</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link href={routes.graph}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
              >
                <span className="truncate">Relationship Graph</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link href={routes.comparison}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
              >
                <span className="truncate">Progress Comparison</span>
              </Button>
            </Link>
          </li>
        </ul>
      </div>

      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-muted-foreground">Phases</h2>
      </div>
      <div className="overflow-y-auto p-2">
        {phasesLoading ? (
          <div className="text-sm text-muted-foreground p-2">Loading phases...</div>
        ) : phases.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">No phases found</div>
        ) : (
          <ul className="space-y-1">
            {phases.map((phase) => (
              <li key={phase.id}>
                <Button
                  variant={currentPhase?.id === phase.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left',
                    currentPhase?.id === phase.id && 'bg-accent'
                  )}
                  onClick={() => handlePhaseClick(phase.id)}
                >
                  <span className="truncate">{phase.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-sm font-medium text-muted-foreground">Features</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          title="Create Feature"
          onClick={() => navigate(routes.featureCreate)}
        >
          +
        </Button>
      </div>
      <div className="overflow-y-auto p-2">
        {featuresLoading ? (
          <div className="text-sm text-muted-foreground p-2">Loading features...</div>
        ) : features.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">No features found</div>
        ) : (
          <ul className="space-y-1">
            {features.map((feature) => (
              <li key={feature.id}>
                <Button
                  variant={currentFeature?.id === feature.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left',
                    currentFeature?.id === feature.id && 'bg-accent'
                  )}
                  onClick={() => handleFeatureClick(feature.id)}
                >
                  <span className="text-blue-500 mr-1">📦</span>
                  <span className="truncate">{feature.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-sm font-medium text-muted-foreground">Areas</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          title="Create Area"
          onClick={() => navigate(routes.areaCreate)}
        >
          +
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {areasLoading ? (
          <div className="text-sm text-muted-foreground p-2">Loading areas...</div>
        ) : areas.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">No areas found</div>
        ) : (
          <ul className="space-y-1">
            {areas.map((area) => (
              <li key={area.id}>
                <Button
                  variant={currentArea?.id === area.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left',
                    currentArea?.id === area.id && 'bg-accent'
                  )}
                  onClick={() => handleAreaClick(area.id)}
                >
                  <span className="text-green-500 mr-1">🔷</span>
                  <span className="truncate">{area.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <Link href={routes.taskCreate}>
          <Button variant="default" className="w-full">
            + Create Task
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            // Clear current phase selection and navigate to all tasks
            setCurrentPhase(null);
            navigate('/tasks');
          }}
        >
          All Tasks
        </Button>
      </div>
    </aside>
  );
}