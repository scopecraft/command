import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, OperationResult } from '../lib/types';
import { fetchTasks, saveTask, removeTask } from '../lib/api/core-client';
import { useToast } from '../hooks/useToast';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  refreshTasks: () => Promise<void>;
  createTask: (task: Task) => Promise<OperationResult<Task>>;
  updateTask: (task: Task) => Promise<OperationResult<Task>>;
  deleteTask: (id: string) => Promise<OperationResult<void>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const refreshTasks = async () => {
    setLoading(true);
    try {
      const result = await fetchTasks();
      if (result.success) {
        // Process tasks to ensure consistent format
        const processedTasks = (result.data || []).map(task => {
          // Flatten task structure if needed (API returns {metadata, content})
          if (task.metadata) {
            return {
              ...task.metadata,
              content: task.content
            };
          }
          return task;
        });
        console.log('Processed tasks:', processedTasks.length > 0 ? processedTasks[0] : 'No tasks');
        setTasks(processedTasks);
      } else {
        const errorMessage = result.message || 'Failed to fetch tasks';
        setError(new Error(errorMessage));
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const createTask = async (task: Task) => {
    try {
      const result = await saveTask(task);
      if (result.success) {
        refreshTasks();
        toast.success(`Task "${task.title}" created successfully`);
        
        // Process task response if needed
        if (result.data && result.data.metadata) {
          result.data = {
            ...result.data.metadata,
            content: result.data.content
          };
        }
      } else {
        const errorMessage = result.message || 'Failed to create task';
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<Task>;
    }
  };

  const updateTask = async (task: Task) => {
    try {
      const result = await saveTask(task);
      if (result.success) {
        refreshTasks();
        toast.success(`Task "${task.title}" updated successfully`);
        
        // Process task response if needed
        if (result.data && result.data.metadata) {
          result.data = {
            ...result.data.metadata,
            content: result.data.content
          };
        }
      } else {
        const errorMessage = result.message || 'Failed to update task';
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<Task>;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Find the task to display its title in the success message
      const taskToDelete = tasks.find(t => t.id === id);
      const taskTitle = taskToDelete ? taskToDelete.title : 'Task';

      const result = await removeTask(id);
      if (result.success) {
        refreshTasks();
        toast.success(`Task "${taskTitle}" deleted successfully`);
      } else {
        const errorMessage = result.message || `Failed to delete task ${id}`;
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete task ${id}`;
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<void>;
    }
  };

  const value = {
    tasks,
    loading,
    error,
    refreshTasks,
    createTask,
    updateTask,
    deleteTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}