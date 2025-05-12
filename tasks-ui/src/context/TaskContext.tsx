import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, OperationResult } from '../lib/types';
import { fetchTasks, saveTask, removeTask } from '../lib/api/core-client';

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

  const refreshTasks = async () => {
    setLoading(true);
    try {
      const result = await fetchTasks();
      if (result.success) {
        setTasks(result.data || []);
      } else {
        setError(new Error(result.message || 'Failed to fetch tasks'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
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
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create task');
      setError(error);
      return { success: false, message: error.message } as OperationResult<Task>;
    }
  };

  const updateTask = async (task: Task) => {
    try {
      const result = await saveTask(task);
      if (result.success) {
        refreshTasks();
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update task');
      setError(error);
      return { success: false, message: error.message } as OperationResult<Task>;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const result = await removeTask(id);
      if (result.success) {
        refreshTasks();
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete task');
      setError(error);
      return { success: false, message: error.message } as OperationResult<void>;
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