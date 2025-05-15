import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Area, OperationResult } from '../lib/types';
import { fetchAreas, fetchArea, saveArea, removeArea } from '../lib/api/core-client';
import { useToast } from '../hooks/useToast';

interface AreaContextType {
  areas: Area[];
  currentArea: Area | null;
  loading: boolean;
  error: Error | null;
  refreshAreas: (phase?: string) => Promise<void>;
  createArea: (area: Area) => Promise<OperationResult<Area>>;
  updateArea: (area: Area) => Promise<OperationResult<Area>>;
  deleteArea: (id: string, force?: boolean) => Promise<OperationResult<void>>;
  setCurrentArea: (areaId: string | null) => void;
  getAreaById: (id: string) => Area | undefined;
}

const AreaContext = createContext<AreaContextType | undefined>(undefined);

export function AreaProvider({ children }: { children: ReactNode }) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const refreshAreas = async (phase?: string) => {
    setLoading(true);
    try {
      const result = await fetchAreas(phase);
      if (result.success) {
        setAreas(result.data || []);

        // If no current area is selected and we have areas available,
        // we don't auto-select to avoid unexpected UI changes
      } else {
        const errorMessage = result.message || 'Failed to fetch areas';
        setError(new Error(errorMessage));
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch areas';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAreas();
  }, []);

  const createArea = async (area: Area) => {
    try {
      const result = await saveArea(area);
      if (result.success) {
        refreshAreas();
        toast.success(`Area "${area.name}" created successfully`);
      } else {
        const errorMessage = result.message || 'Failed to create area';
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create area';
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<Area>;
    }
  };

  const updateArea = async (area: Area) => {
    try {
      const result = await saveArea(area);
      if (result.success) {
        refreshAreas();
        toast.success(`Area "${area.name}" updated successfully`);
      } else {
        const errorMessage = result.message || 'Failed to update area';
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update area';
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<Area>;
    }
  };

  const deleteArea = async (id: string, force = false) => {
    try {
      // Find the area to display its name in the success message
      const areaToDelete = areas.find(a => a.id === id);
      const areaName = areaToDelete ? areaToDelete.name : 'Area';

      const result = await removeArea(id, force);
      if (result.success) {
        refreshAreas();
        toast.success(`Area "${areaName}" deleted successfully`);
      } else {
        const errorMessage = result.message || `Failed to delete area ${id}`;
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete area ${id}`;
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<void>;
    }
  };

  const selectArea = (areaId: string | null) => {
    if (!areaId) {
      setCurrentArea(null);
      return;
    }

    const area = areas.find(a => a.id === areaId);
    if (area) {
      setCurrentArea(area);
    } else {
      toast.error(`Area with ID ${areaId} not found`);
    }
  };

  const getAreaById = (id: string) => {
    return areas.find(a => a.id === id);
  };

  const value = {
    areas,
    currentArea,
    loading,
    error,
    refreshAreas,
    createArea,
    updateArea,
    deleteArea,
    setCurrentArea: selectArea,
    getAreaById,
  };

  return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
}

export function useAreaContext() {
  const context = useContext(AreaContext);
  if (context === undefined) {
    throw new Error('useAreaContext must be used within an AreaProvider');
  }
  return context;
}