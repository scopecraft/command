import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import type { TaskStatus, TaskType, WorkflowState } from '../lib/types';

// Filter state interface
export interface TaskFilters {
  status: TaskStatus[];
  type: TaskType[];
  workflow: WorkflowState[];
  area: string[];
}

export interface TaskSearchParams {
  search?: string;
  status?: string[];
  type?: string[];
  workflow?: string[];
  area?: string[];
  assignee?: string;
}

interface UseTaskFiltersProps {
  searchParams: TaskSearchParams;
}

interface UseTaskFiltersReturn {
  filters: TaskFilters;
  activeFilterCount: number;
  setFilters: (newFilters: TaskFilters) => void;
  handleFilterChange: (category: keyof TaskFilters, value: string) => void;
  clearAllFilters: () => void;
  setSearchQuery: (query: string) => void;
}

// Helper functions
function parseFiltersFromSearchParams(searchParams: TaskSearchParams): TaskFilters {
  return {
    status: parseStringArray(searchParams.status) as TaskStatus[],
    type: parseStringArray(searchParams.type) as TaskType[],
    workflow: parseStringArray(searchParams.workflow) as WorkflowState[],
    area: parseStringArray(searchParams.area),
  };
}

function parseStringArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Custom hook for managing task filters and URL state
 * Handles filter state, URL persistence, and filter operations
 */
export function useTaskFilters({ searchParams }: UseTaskFiltersProps): UseTaskFiltersReturn {
  const navigate = useNavigate();

  const filters: TaskFilters = React.useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  // Update search params via navigation
  const updateSearchParams = React.useCallback(
    (updates: Partial<TaskSearchParams>) => {
      navigate({
        search: (prev) => ({ ...prev, ...updates }),
      });
    },
    [navigate]
  );

  const setSearchQuery = React.useCallback(
    (query: string) => {
      updateSearchParams({ search: query || undefined });
    },
    [updateSearchParams]
  );

  const setFilters = React.useCallback(
    (newFilters: TaskFilters) => {
      updateSearchParams({
        status: newFilters.status.length ? newFilters.status : undefined,
        type: newFilters.type.length ? newFilters.type : undefined,
        workflow: newFilters.workflow.length ? newFilters.workflow : undefined,
        area: newFilters.area.length ? newFilters.area : undefined,
      });
    },
    [updateSearchParams]
  );

  // Filter handlers
  const handleFilterChange = React.useCallback(
    (category: keyof TaskFilters, value: string) => {
      const currentValues = filters[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      setFilters({
        ...filters,
        [category]: newValues,
      });
    },
    [filters, setFilters]
  );

  const clearAllFilters = React.useCallback(() => {
    updateSearchParams({
      search: undefined,
      status: undefined,
      type: undefined,
      workflow: undefined,
      area: undefined,
    });
  }, [updateSearchParams]);

  // Calculate active filter count
  const activeFilterCount =
    Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0) +
    (searchParams.search ? 1 : 0);

  return {
    filters,
    activeFilterCount,
    setFilters,
    handleFilterChange,
    clearAllFilters,
    setSearchQuery,
  };
}
