import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { fetchPhases, savePhase } from '../lib/api/core-client';
import type { OperationResult, Phase } from '../lib/types';

interface PhaseContextType {
  phases: Phase[];
  currentPhase: Phase | null;
  loading: boolean;
  error: Error | null;
  refreshPhases: () => Promise<void>;
  createPhase: (phase: Phase) => Promise<OperationResult<Phase>>;
  setCurrentPhase: (phaseId: string | null) => void;
}

const PhaseContext = createContext<PhaseContextType | undefined>(undefined);

export function PhaseProvider({ children }: { children: ReactNode }) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const refreshPhases = async () => {
    setLoading(true);
    try {
      const result = await fetchPhases();
      if (result.success) {
        setPhases(result.data || []);

        // If no current phase is selected, select the first one
        if (!currentPhase && result.data && result.data.length > 0) {
          setCurrentPhase(result.data[0]);
        }
      } else {
        const errorMessage = result.message || 'Failed to fetch phases';
        setError(new Error(errorMessage));
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch phases';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPhases();
  }, []);

  const createPhase = async (phase: Phase) => {
    try {
      const result = await savePhase(phase);
      if (result.success) {
        refreshPhases();
        toast.success(`Phase "${phase.name}" created successfully`);
      } else {
        const errorMessage = result.message || 'Failed to create phase';
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create phase';
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<Phase>;
    }
  };

  const selectPhase = (phaseId: string | null) => {
    if (!phaseId) {
      setCurrentPhase(null);
      return;
    }

    const phase = phases.find((p) => p.id === phaseId);
    if (phase) {
      setCurrentPhase(phase);
    } else {
      toast.error(`Phase with ID ${phaseId} not found`);
    }
  };

  const value = {
    phases,
    currentPhase,
    loading,
    error,
    refreshPhases,
    createPhase,
    setCurrentPhase: selectPhase,
  };

  return <PhaseContext.Provider value={value}>{children}</PhaseContext.Provider>;
}

export function usePhaseContext() {
  const context = useContext(PhaseContext);
  if (context === undefined) {
    throw new Error('usePhaseContext must be used within a PhaseProvider');
  }
  return context;
}
