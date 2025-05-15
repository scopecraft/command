import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Feature, OperationResult } from '../lib/types';
import { fetchFeatures, fetchFeature, saveFeature, removeFeature } from '../lib/api/core-client';
import { useToast } from '../hooks/useToast';

interface FeatureContextType {
  features: Feature[];
  currentFeature: Feature | null;
  loading: boolean;
  error: Error | null;
  refreshFeatures: (phase?: string) => Promise<void>;
  createFeature: (feature: Feature) => Promise<OperationResult<Feature>>;
  updateFeature: (feature: Feature) => Promise<OperationResult<Feature>>;
  deleteFeature: (id: string, force?: boolean) => Promise<OperationResult<void>>;
  setCurrentFeature: (featureId: string | null) => void;
  getFeatureById: (id: string) => Feature | undefined;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const refreshFeatures = async (phase?: string) => {
    setLoading(true);
    try {
      const result = await fetchFeatures(phase);
      if (result.success) {
        setFeatures(result.data || []);

        // If no current feature is selected and we have features available,
        // we don't auto-select to avoid unexpected UI changes
      } else {
        const errorMessage = result.message || 'Failed to fetch features';
        setError(new Error(errorMessage));
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch features';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFeatures();
  }, []);

  const createFeature = async (feature: Feature) => {
    try {
      const result = await saveFeature(feature);
      if (result.success) {
        refreshFeatures();
        toast.success(`Feature "${feature.name}" created successfully`);
      } else {
        const errorMessage = result.message || 'Failed to create feature';
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create feature';
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<Feature>;
    }
  };

  const updateFeature = async (feature: Feature) => {
    try {
      const result = await saveFeature(feature);
      if (result.success) {
        refreshFeatures();
        toast.success(`Feature "${feature.name}" updated successfully`);
      } else {
        const errorMessage = result.message || 'Failed to update feature';
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update feature';
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<Feature>;
    }
  };

  const deleteFeature = async (id: string, force = false) => {
    try {
      // Find the feature to display its name in the success message
      const featureToDelete = features.find(f => f.id === id);
      const featureName = featureToDelete ? featureToDelete.name : 'Feature';

      const result = await removeFeature(id, force);
      if (result.success) {
        refreshFeatures();
        toast.success(`Feature "${featureName}" deleted successfully`);
      } else {
        const errorMessage = result.message || `Failed to delete feature ${id}`;
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete feature ${id}`;
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<void>;
    }
  };

  const selectFeature = (featureId: string | null) => {
    if (!featureId) {
      setCurrentFeature(null);
      return;
    }

    const feature = features.find(f => f.id === featureId);
    if (feature) {
      setCurrentFeature(feature);
    } else {
      toast.error(`Feature with ID ${featureId} not found`);
    }
  };

  const getFeatureById = (id: string) => {
    return features.find(f => f.id === id);
  };

  const value = {
    features,
    currentFeature,
    loading,
    error,
    refreshFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    setCurrentFeature: selectFeature,
    getFeatureById,
  };

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
}

export function useFeatureContext() {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatureContext must be used within a FeatureProvider');
  }
  return context;
}