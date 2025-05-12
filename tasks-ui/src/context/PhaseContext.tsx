import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Phase, OperationResult } from '../lib/types';
import { fetchPhases, savePhase } from '../lib/api/core-client';

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
        setError(new Error(result.message || 'Failed to fetch phases'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch phases'));
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
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create phase');
      setError(error);
      return { success: false, message: error.message } as OperationResult<Phase>;
    }
  };

  const selectPhase = (phaseId: string | null) => {
    if (!phaseId) {
      setCurrentPhase(null);
      return;
    }
    
    const phase = phases.find(p => p.id === phaseId);
    if (phase) {
      setCurrentPhase(phase);
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