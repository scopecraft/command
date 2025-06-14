import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { NewTaskData, SearchResult } from '../components/CommandCenter';
import { apiClient } from '../lib/api/client';

interface CommandCenterOptions {
  mode?: 'search' | 'create' | 'command';
  defaultQuery?: string;
}

interface CommandCenterContextValue {
  isOpen: boolean;
  openCommandCenter: (options?: CommandCenterOptions) => void;
  closeCommandCenter: () => void;
  toggleCommandCenter: () => void;

  // Search functionality
  searchTasks: (query: string) => Promise<SearchResult[]>;
  isSearching: boolean;
  searchError?: string;

  // Task creation functionality
  createTask: (task: NewTaskData) => Promise<void>;
  isCreating: boolean;
  createError?: string;

  // Result selection
  selectResult: (result: SearchResult) => void;
}

const CommandCenterContext = createContext<CommandCenterContextValue | undefined>(undefined);

export function CommandCenterProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();
  const [createError, setCreateError] = useState<string | undefined>();
  const navigate = useNavigate();

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCommandCenter = useCallback((_options?: CommandCenterOptions) => {
    setSearchError(undefined);
    setCreateError(undefined);
    setIsOpen(true);
  }, []);

  const closeCommandCenter = useCallback(() => {
    setIsOpen(false);
    setSearchError(undefined);
    setCreateError(undefined);
  }, []);

  const toggleCommandCenter = useCallback(() => {
    if (isOpen) {
      closeCommandCenter();
    } else {
      openCommandCenter();
    }
  }, [isOpen, openCommandCenter, closeCommandCenter]);

  const searchTasks = useCallback(async (query: string): Promise<SearchResult[]> => {
    setIsSearching(true);
    setSearchError(undefined);

    try {
      if (!query.trim()) {
        return [];
      }

      const response = await apiClient.search({
        query,
        types: ['task', 'doc'],
        limit: 50,
      });

      if (response.success && response.data) {
        // Transform the API response to match our SearchResult interface
        const searchData = response.data as any;
        return searchData.results.map((result: any) => ({
          id: result.id,
          type: result.type === 'parent' ? 'parent' : result.type,
          title: result.title,
          excerpt: result.excerpt || result.description || '',
          metadata: {
            taskType: result.taskType,
            status: result.status,
            area: result.area,
            priority: result.priority,
            subtaskCount: result.subtaskCount,
            completedCount: result.completedCount,
            section: result.section,
            lastUpdated: result.lastUpdated,
          },
        }));
      }

      return [];
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search tasks. Please try again.');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const createTask = useCallback(
    async (task: NewTaskData) => {
      setIsCreating(true);
      setCreateError(undefined);

      try {
        const response = task.isParent
          ? await apiClient.createParent({
              title: task.title,
              type: task.type,
            })
          : await apiClient.createTask({
              title: task.title,
              type: task.type,
            });

        if (response.success && response.data) {
          // Close the command center
          setIsOpen(false);

          // Navigate to the newly created task
          const taskData = response.data as any;
          if (task.isParent) {
            navigate({ to: `/parents/${taskData.id}` });
          } else {
            navigate({ to: `/tasks/${taskData.id}` });
          }
        } else {
          setCreateError(response.error || 'Failed to create task');
        }
      } catch (error) {
        console.error('Error creating task:', error);
        setCreateError('An unexpected error occurred');
      } finally {
        setIsCreating(false);
      }
    },
    [navigate]
  );

  const selectResult = useCallback(
    (result: SearchResult) => {
      // Close the command center
      setIsOpen(false);

      // Navigate based on result type
      switch (result.type) {
        case 'task':
          navigate({ to: `/tasks/${result.id}` });
          break;
        case 'parent':
          navigate({ to: `/parents/${result.id}` });
          break;
        case 'documentation':
          // For docs, you might navigate to a docs section or open in modal
          console.log('Navigate to documentation:', result.id);
          break;
        case 'command':
          // Execute system command
          switch (result.id) {
            case 'navigate-tasks':
              navigate({ to: '/tasks' });
              break;
            case 'navigate-parents':
              navigate({ to: '/parents' });
              break;
            case 'toggle-sidebar':
              // This would need to be handled by a sidebar context or state
              console.log('Toggle sidebar command - implement with sidebar context');
              break;
            default:
              console.log('Unknown command:', result.id);
          }
          break;
        default:
          console.log('Unknown result type:', result.type);
      }
    },
    [navigate]
  );

  const value: CommandCenterContextValue = {
    isOpen,
    openCommandCenter,
    closeCommandCenter,
    toggleCommandCenter,

    searchTasks,
    isSearching,
    searchError,

    createTask,
    isCreating,
    createError,

    selectResult,
  };

  return <CommandCenterContext.Provider value={value}>{children}</CommandCenterContext.Provider>;
}

export function useCommandCenter() {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error('useCommandCenter must be used within CommandCenterProvider');
  }
  return context;
}

// Legacy compatibility - re-export with old names for backward compatibility
export const useCommandPalette = useCommandCenter;
export const CommandPaletteProvider = CommandCenterProvider;
