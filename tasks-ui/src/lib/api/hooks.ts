/**
 * React Query hooks for V2 API endpoints
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

// Query keys
export const queryKeys = {
  tasks: (params?: Record<string, unknown>) => ['tasks', params] as const,
  task: (id: string, parentId?: string) => ['task', id, parentId] as const,
  parents: (params?: Record<string, unknown>) => ['parents', params] as const,
  search: (params?: Record<string, unknown>) => ['search', params] as const,
};

// Task hooks
export function useTaskList(
  params: {
    task_type?: string;
    location?: string | string[];
    status?: string;
    priority?: string;
    phase?: string;
    area?: string;
    assignee?: string;
    tags?: string[];
    include_content?: boolean;
    include_completed?: boolean;
    include_parent_tasks?: boolean;
    parent_id?: string;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.tasks(params),
    queryFn: () => apiClient.getTasks(params),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // 30 seconds
    refetchIntervalInBackground: false, // Only when window is visible
  });
}

export function useTask(id: string, parentId?: string) {
  return useQuery({
    queryKey: queryKeys.task(id, parentId),
    queryFn: () => apiClient.getTask(id, parentId),
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.createTask,
    onSuccess: () => {
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      parent_id,
    }: { id: string; updates: Record<string, unknown>; parent_id?: string }) =>
      apiClient.updateTask(id, updates, parent_id),
    onSuccess: (_data, variables) => {
      // Invalidate specific task and lists
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cascade }: { id: string; cascade?: boolean }) =>
      apiClient.deleteTask(id, cascade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.moveTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    },
  });
}

// Search hook
export function useSearch(
  params: {
    query?: string;
    types?: ('task' | 'doc')[];
    filters?: {
      status?: string[];
      area?: string[];
      tags?: string[];
      workflow_state?: string[];
    };
    limit?: number;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.search(params),
    queryFn: () => apiClient.search(params),
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!params.query || !!params.filters, // Only search if there's a query or filters
  });
}

// Parent task hooks
export function useParent(id: string) {
  return useQuery({
    queryKey: ['parent', id],
    queryFn: () => apiClient.getParent(id),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useParentList(
  params: {
    location?: string | string[];
    area?: string;
    include_progress?: boolean;
    include_subtasks?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.parents(params),
    queryFn: () => apiClient.getParents(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.createParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useParentOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      operation,
    }: { parentId: string; operation: Record<string, unknown> }) =>
      apiClient.performParentOperation(parentId, operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Convenience hooks for common use cases
export function useTopLevelTasks() {
  return useTaskList({
    include_content: false,
  });
}

export function useCurrentTasks() {
  return useTaskList({
    location: 'current',
    include_content: false,
  });
}

export function useBacklogTasks() {
  return useTaskList({
    phase: 'backlog',
    include_content: false,
  });
}

export function useActivePhaseTasks() {
  return useTaskList({
    phase: 'active',
    include_content: false,
  });
}

export function useReleasedPhaseTasks() {
  return useTaskList({
    phase: 'released',
    include_content: false,
  });
}

export function useParentsWithProgress() {
  return useParentList({
    include_progress: true,
    include_subtasks: false,
  });
}

// Individual parent task hook
export function useParentTask(id: string) {
  return useQuery({
    queryKey: ['parent', id],
    queryFn: () => apiClient.getTask(id), // Parent tasks use same endpoint as regular tasks
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Subtasks for a parent hook
export function useSubtasks(params: { parent_id: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['subtasks', params.parent_id],
    queryFn: () => apiClient.getTasks({ parent_id: params.parent_id }),
    enabled: (options?.enabled ?? true) && !!params.parent_id,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Recent tasks hook - fetches all tasks sorted by updated date
export function useRecentTasks(limit = 5) {
  return useQuery({
    queryKey: ['tasks', 'recent', limit],
    queryFn: async () => {
      // Get all tasks from current and backlog
      const response = await apiClient.getTasks({
        location: ['current', 'backlog'],
        include_content: false,
        include_parent_tasks: true,
      });

      if (!response.success || !response.data) {
        return [];
      }

      // API now returns normalized data - simple sorting by updatedDate
      return response.data
        .sort((a, b) => {
          const aDate = a.updatedDate || '';
          const bDate = b.updatedDate || '';
          return bDate.localeCompare(aDate);
        })
        .slice(0, limit);
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refresh every minute
    refetchIntervalInBackground: false,
  });
}

// Phase counts hook - fetches task counts for each phase
export function usePhaseCounts() {
  return useQuery({
    queryKey: ['phase', 'counts'],
    queryFn: async () => {
      // Fetch counts for each phase in parallel
      const [backlogResponse, activeResponse, releasedResponse, archiveResponse] =
        await Promise.all([
          apiClient.getTasks({ phase: 'backlog', include_content: false }),
          apiClient.getTasks({ phase: 'active', include_content: false }),
          apiClient.getTasks({ phase: 'released', include_content: false }),
          apiClient.getTasks({ location: 'archive', include_content: false }),
        ]);

      return {
        backlog: backlogResponse.success ? backlogResponse.data?.length || 0 : 0,
        active: activeResponse.success ? activeResponse.data?.length || 0 : 0,
        released: releasedResponse.success ? releasedResponse.data?.length || 0 : 0,
        archive: archiveResponse.success ? archiveResponse.data?.length || 0 : 0,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Refresh every 2 minutes
    refetchIntervalInBackground: false,
  });
}

// Keep workflow counts for backward compatibility
export function useWorkflowCounts() {
  return usePhaseCounts();
}
