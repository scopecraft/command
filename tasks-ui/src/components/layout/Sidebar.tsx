import { useLocation, Link } from 'wouter';
import { useUIContext } from '../../context/UIContext';
import { usePhaseContext } from '../../context/PhaseContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';

export function Sidebar() {
  const { ui } = useUIContext();
  const { phases, currentPhase, loading, setCurrentPhase } = usePhaseContext();
  const [, navigate] = useLocation();
  
  // Handle click on hard-coded phase buttons with URL navigation
  const handlePhaseClick = (phaseId: string) => {
    console.log('Clicked phase:', phaseId);
    setCurrentPhase(phaseId);
    // In a real app, we'd add a phase parameter to the URL
    // For now we just navigate to the task list view
    navigate('/tasks?phase=' + phaseId);
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
        </ul>
      </div>

      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-muted-foreground">Phases</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
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
            // In a complete implementation, this would open a modal to create a new phase
            // For now, we'll just refresh the phases list
            setCurrentPhase(null);
            navigate('/tasks');
          }}
        >
          + New Phase
        </Button>
      </div>
    </aside>
  );
}