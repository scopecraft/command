import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { NewTaskData } from '../components/ui/command-palette';
import { apiClient } from '../lib/api/client';

interface CommandPaletteOptions {
  defaultCommand?: string;
}

interface CommandPaletteContextValue {
  isOpen: boolean;
  openCommandPalette: (options?: CommandPaletteOptions) => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  createTask: (task: NewTaskData) => Promise<void>;
  isCreating: boolean;
  error?: string;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | undefined>(undefined);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | undefined>();
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

  const openCommandPalette = useCallback((_options?: CommandPaletteOptions) => {
    // TODO: When command palette is refactored to multi-purpose:
    // - Use options?.defaultCommand to pre-filter or pre-select commands
    // - Examples: 'create-task', 'create-parent-task', 'create-subtask', 'search-tasks'
    // - For now, this parameter is ignored but preserves future API compatibility
    // - Future implementation could auto-navigate to specific command or pre-fill context
    setIsOpen(true);
  }, []);
  const closeCommandPalette = useCallback(() => setIsOpen(false), []);
  const toggleCommandPalette = useCallback(() => setIsOpen((prev) => !prev), []);

  const createTask = useCallback(
    async (task: NewTaskData) => {
      setIsCreating(true);
      setError(undefined);

      try {
        const response = task.isParent
          ? await apiClient.createParent({
              title: task.title,
              type: task.type,
              // Let MCP schema provide defaults: area='general', status='todo', priority='medium', location='backlog'
            })
          : await apiClient.createTask({
              title: task.title,
              type: task.type,
              // Let MCP schema provide defaults: area='general', status='todo', priority='medium', workflowState='backlog'
            });

        if (response.success && response.data) {
          // Close the command palette
          setIsOpen(false);

          // Navigate to the newly created task
          const taskData = response.data as any;
          if (task.isParent) {
            navigate({ to: `/parents/${taskData.id}` });
          } else {
            navigate({ to: `/tasks/${taskData.id}` });
          }
        } else {
          setError(response.error || 'Failed to create task');
        }
      } catch (error) {
        console.error('Error creating task:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsCreating(false);
      }
    },
    [navigate]
  );

  const value: CommandPaletteContextValue = {
    isOpen,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
    createTask,
    isCreating,
    error,
  };

  return <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>;
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
}
