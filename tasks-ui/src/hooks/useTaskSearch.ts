import React from 'react';
import { useSearch } from '../lib/api/hooks';
import { useDebounce } from './useDebounce';

interface SearchResult {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  area: string;
  tags: string[];
  workflowState: string;
  assignee: string;
  parentTask: string;
  score: number;
  excerpt: string;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  queryTime: number;
}

interface UseTaskSearchProps {
  searchQuery: string;
  debounceMs?: number;
}

interface UseTaskSearchReturn {
  searchResultIds: Set<string> | null;
  isSearching: boolean;
  isSearchLoading: boolean;
  debouncedSearchQuery: string;
}

/**
 * Custom hook for task search functionality
 * Handles debouncing, API calls, and result processing
 */
export function useTaskSearch({
  searchQuery,
  debounceMs = 300,
}: UseTaskSearchProps): UseTaskSearchReturn {
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

  // Search API parameters
  const searchApiParams = React.useMemo(() => {
    if (!debouncedSearchQuery.trim()) return null;

    return {
      query: debouncedSearchQuery,
      types: ['task' as const, 'parent' as const],
      limit: 1000, // High limit to get all matches
    };
  }, [debouncedSearchQuery]);

  // Search API call
  const { data: searchData, isLoading: searchLoading } = useSearch(searchApiParams || {});

  // Process search results into task IDs
  const searchResultIds = React.useMemo(() => {
    if (!searchData?.success || !searchData.data || !debouncedSearchQuery.trim()) {
      return null; // No search active
    }

    const response = searchData.data as SearchResponse;
    return new Set(response.results.map((result) => result.id));
  }, [searchData, debouncedSearchQuery]);

  const isSearching = !!debouncedSearchQuery.trim();

  return {
    searchResultIds,
    isSearching,
    isSearchLoading: searchLoading,
    debouncedSearchQuery,
  };
}
