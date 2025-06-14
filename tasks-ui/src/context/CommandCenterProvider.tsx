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

// Mock search API - in real implementation this would call the search service
async function mockSearchAPI(query: string): Promise<SearchResult[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  // Mock data based on query
  const mockResults: SearchResult[] = [
    {
      id: 'task-auth-001',
      type: 'task',
      title: 'Implement user authentication system',
      excerpt:
        'Add comprehensive authentication with JWT tokens, password hashing, and session management. Include login, logout, and registration endpoints.',
      metadata: {
        taskType: 'feature',
        status: 'in_progress',
        area: 'core',
        priority: 'high',
      },
    },
    {
      id: 'task-bug-002',
      type: 'task',
      title: 'Fix memory leak in task processing pipeline',
      excerpt:
        'Memory usage continuously grows when processing large batches of tasks. Suspected issue with event listeners not being cleaned up properly.',
      metadata: {
        taskType: 'bug',
        status: 'todo',
        area: 'core',
        priority: 'high',
      },
    },
    {
      id: 'parent-ui-003',
      type: 'parent',
      title: 'Redesign command center user experience',
      excerpt:
        'Complete overhaul of the command center interface to support unified search and task creation with improved keyboard navigation.',
      metadata: {
        taskType: 'feature',
        status: 'in_progress',
        area: 'ui',
        priority: 'high',
        subtaskCount: 8,
        completedCount: 3,
      },
    },
    {
      id: 'doc-api-001',
      type: 'documentation',
      title: 'API Design Guidelines and Best Practices',
      excerpt:
        'Comprehensive documentation covering REST API design principles, error handling patterns, and authentication strategies for the platform.',
      metadata: {
        section: 'Architecture',
        lastUpdated: '2025-06-14',
      },
    },
    {
      id: 'task-test-004',
      type: 'task',
      title: 'Add end-to-end testing for user workflows',
      excerpt:
        'Implement comprehensive E2E tests covering the main user journeys: task creation, search, navigation, and task management workflows.',
      metadata: {
        taskType: 'test',
        status: 'todo',
        area: 'ui',
        priority: 'medium',
      },
    },
  ];

  // Simple fuzzy search simulation
  if (!query.trim()) {
    return mockResults.slice(0, 3); // Show recent/popular when empty
  }

  return mockResults.filter((result) => {
    const searchText = `${result.title} ${result.excerpt}`.toLowerCase();
    const queryTerms = query.toLowerCase().split(' ');

    return queryTerms.some((term) => searchText.includes(term));
  });
}

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
      // TODO: Replace with actual search API call
      // const response = await apiClient.searchTasks({ query });
      const results = await mockSearchAPI(query);
      return results;
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
          console.log('Execute command:', result.id);
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
