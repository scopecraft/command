import { useEffect, useState } from 'react';
import { usePhaseContext } from '../../context/PhaseContext';
import { Button } from '../ui/button';

interface PhaseSelectorProps {
  entityType: 'feature' | 'area';
  phases: string[];
  currentPhase: string | null;
  onPhaseSelect: (phaseId: string) => void;
}

/**
 * A component for selecting a phase of a multi-phase entity (feature or area)
 * Displays a dropdown or segmented control for switching between phases
 */
export function PhaseSelector({
  entityType,
  phases,
  currentPhase,
  onPhaseSelect,
}: PhaseSelectorProps) {
  const { phases: allPhases } = usePhaseContext();
  const [sortedPhases, setSortedPhases] = useState<
    Array<{ id: string; name: string; order: number }>
  >([]);

  useEffect(() => {
    // Map phase IDs to phase objects and sort by order
    const phaseObjects = phases
      .map((phaseId) => {
        const phaseObj = allPhases.find((p) => p.id === phaseId);
        return phaseObj
          ? { id: phaseId, name: phaseObj.name, order: phaseObj.order }
          : { id: phaseId, name: phaseId, order: 999 };
      })
      .sort((a, b) => a.order - b.order);

    setSortedPhases(phaseObjects);
  }, [phases, allPhases]);

  // If no phases or only one phase, don't render the selector
  if (phases.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground mr-1">Phase:</span>
      <div className="flex flex-wrap gap-1">
        {sortedPhases.map((phase) => (
          <Button
            key={phase.id}
            size="sm"
            variant={currentPhase === phase.id ? 'default' : 'outline'}
            className={`px-2 py-1 text-xs ${
              entityType === 'feature'
                ? currentPhase === phase.id
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400'
                : currentPhase === phase.id
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400'
            }`}
            onClick={() => onPhaseSelect(phase.id)}
          >
            {phase.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
