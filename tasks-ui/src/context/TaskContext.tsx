import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, OperationResult } from '../lib/types';
import { fetchTasks, saveTask, removeTask, moveTask } from '../lib/api/core-client';
import { useToast } from '../hooks/useToast';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  refreshTasks: () => Promise<void>;
  createTask: (task: Task) => Promise<OperationResult<Task>>;
  updateTask: (task: Task) => Promise<OperationResult<Task>>;
  deleteTask: (id: string) => Promise<OperationResult<void>>;
  moveTaskToFeatureOrArea: (
    taskId: string, 
    options: { targetFeature?: string; targetArea?: string; targetPhase?: string }
  ) => Promise<OperationResult<Task>>;
  bulkMoveTasks: (
    taskIds: string[], 
    options: { targetFeature?: string; targetArea?: string; targetPhase?: string }
  ) => Promise<{ success: boolean; message?: string; completedCount: number }>;
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

  // Move a task to a feature or area
  const moveTaskToFeatureOrArea = async (
    taskId: string, 
    options: { targetFeature?: string; targetArea?: string; targetPhase?: string }
  ) => {
    try {
      const result = await moveTask(taskId, options);
      if (result.success) {
        refreshTasks();
        const destination = options.targetFeature ? 'feature' : 
                           options.targetArea ? 'area' : 
                           options.targetPhase ? 'phase' : 'location';
        toast.success(`Task moved to new ${destination} successfully`);
      } else {
        const errorMessage = result.message || 'Failed to move task';
        toast.error(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move task';
      const error = err instanceof Error ? err : new Error(errorMessage);
      setError(error);
      toast.error(errorMessage);
      return { success: false, message: errorMessage } as OperationResult<Task>;
    }
  };

  // Move multiple tasks at once
  const bulkMoveTasks = async (
    taskIds: string[], 
    options: { targetFeature?: string; targetArea?: string; targetPhase?: string }
  ) => {
    let completedCount = 0;
    let failedCount = 0;
    let lastError = '';

    // Process each task move sequentially
    for (const taskId of taskIds) {
      try {
        const result = await moveTask(taskId, options);
        if (result.success) {
          completedCount++;
        } else {
          failedCount++;
          lastError = result.message || 'Failed to move task';
        }
      } catch (err) {
        failedCount++;
        lastError = err instanceof Error ? err.message : 'Failed to move task';
      }
    }

    // Refresh task list after all moves
    refreshTasks();

    // Determine the success message
    const destination = options.targetFeature ? 'feature' : 
                       options.targetArea ? 'area' : 
                       options.targetPhase ? 'phase' : 'location';

    if (completedCount === taskIds.length) {
      const message = `Successfully moved ${completedCount} task${completedCount !== 1 ? 's' : ''} to new ${destination}`;
      toast.success(message);
      return { success: true, completedCount, message };
    } else if (completedCount > 0) {
      const message = `Moved ${completedCount} of ${taskIds.length} tasks to new ${destination}. ${failedCount} failed.`;
      toast.warning(message);
      return { success: false, completedCount, message };
    } else {
      const message = `Failed to move tasks: ${lastError}`;
      toast.error(message);
      return { success: false, completedCount: 0, message };
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
    moveTaskToFeatureOrArea,
    bulkMoveTasks,
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