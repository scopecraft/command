import { useLocation } from 'wouter';
import { useUIContext } from '../../context/UIContext';
import { usePhaseContext } from '../../context/PhaseContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

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
        <h2 className="text-sm font-medium text-muted-foreground">Phases</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {/* Static phase buttons that match our mock data */}
        <ul className="space-y-1">
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handlePhaseClick('phase-1')}
            >
              <span className="truncate">Planning</span>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handlePhaseClick('phase-2')}
            >
              <span className="truncate">Implementation</span>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => handlePhaseClick('phase-3')}
            >
              <span className="truncate">Testing</span>
            </Button>
          </li>
        </ul>
        
        {/* Keep the dynamic phase list commented out for now */}
        {/* {loading ? (
          <div className="text-sm text-muted-foreground p-2">Loading...</div>
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
                  onClick={() => setCurrentPhase(phase.id)}
                >
                  <span className="truncate">{phase.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )} */}
      </div>
      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full">
          + New Phase
        </Button>
      </div>
    </aside>
  );
}