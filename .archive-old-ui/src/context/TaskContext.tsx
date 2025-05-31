import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Task, ParentTask, OperationResult, WorkflowState, TaskStatus, TaskType } from '../lib/types';

// V2 Task Context Interface
interface TaskContextType {
  // State
  tasks: Task[];
  parentTasks: ParentTask[];
  loading: boolean;
  error: Error | null;

  // Task CRUD Operations
  createTask: (task: Partial<Task>) => Promise<OperationResult<Task>>;
  updateTask: (task: Task) => Promise<OperationResult<Task>>;
  deleteTask: (taskId: string) => Promise<OperationResult<void>>;

  // Workflow Operations
  moveTaskToWorkflow: (taskId: string, workflow: WorkflowState) => Promise<OperationResult<Task>>;
  moveTaskToParent: (taskId: string, parentId: string) => Promise<OperationResult<Task>>;

  // Parent Task Operations
  convertToParentTask: (taskId: string) => Promise<OperationResult<ParentTask>>;
  convertToSimpleTask: (parentTaskId: string) => Promise<OperationResult<Task>>;

  // Subtask Operations
  addSubtask: (parentId: string, subtask: Partial<Task>) => Promise<OperationResult<Task>>;
  reorderSubtasks: (parentId: string, subtaskIds: string[]) => Promise<OperationResult<void>>;
  makeSubtasksParallel: (parentId: string, subtaskIds: string[]) => Promise<OperationResult<void>>;

  // Data Refresh
  refreshTasks: () => Promise<void>;

  // Filtering Helpers
  getTasksByWorkflow: (workflow: WorkflowState) => Task[];
  getTasksByParent: (parentId: string) => Task[];
  getSubtasks: (parentId: string) => Task[];
}

const TaskContext = createContext<TaskContextType | null>(null);

// Custom hook to use the task context
export function useTaskContext(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}

// Task Provider Component
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [parentTasks, setParentTasks] = useState<ParentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Task CRUD Operations
  const createTask = useCallback(async (taskData: Partial<Task>): Promise<OperationResult<Task>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'New Task',
        type: taskData.type || 'task',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        workflow_state: taskData.workflow_state || 'current',
        created_date: new Date().toISOString().split('T')[0],
        updated_date: new Date().toISOString().split('T')[0],
        tags: taskData.tags || [],
        content: taskData.content || '',
        ...taskData,
      };

      setTasks(prev => [...prev, newTask]);
      return { success: true, data: newTask };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create task');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (updatedTask: Task): Promise<OperationResult<Task>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? { ...updatedTask, updated_date: new Date().toISOString().split('T')[0] } : task
      ));
      return { success: true, data: updatedTask };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update task');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string): Promise<OperationResult<void>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete task');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Workflow Operations
  const moveTaskToWorkflow = useCallback(async (taskId: string, workflow: WorkflowState): Promise<OperationResult<Task>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      let updatedTask: Task | undefined;
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          updatedTask = { ...task, workflow_state: workflow, updated_date: new Date().toISOString().split('T')[0] };
          return updatedTask;
        }
        return task;
      }));

      if (!updatedTask) {
        throw new Error('Task not found');
      }

      return { success: true, data: updatedTask };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to move task to workflow');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const moveTaskToParent = useCallback(async (taskId: string, parentId: string): Promise<OperationResult<Task>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      let updatedTask: Task | undefined;
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          updatedTask = { ...task, parent_task: parentId, updated_date: new Date().toISOString().split('T')[0] };
          return updatedTask;
        }
        return task;
      }));

      if (!updatedTask) {
        throw new Error('Task not found');
      }

      return { success: true, data: updatedTask };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to move task to parent');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Parent Task Operations
  const convertToParentTask = useCallback(async (taskId: string): Promise<OperationResult<ParentTask>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const parentTask: ParentTask = {
        id: task.id,
        title: task.title,
        type: 'parent_task',
        status: task.status,
        priority: task.priority,
        workflow_state: task.workflow_state,
        created_date: task.created_date,
        updated_date: new Date().toISOString().split('T')[0],
        tags: task.tags,
        content: task.content,
        overview: task.content || '',
        subtasks: [],
        progress: { completed: 0, total: 0 },
      };

      setParentTasks(prev => [...prev, parentTask]);
      setTasks(prev => prev.filter(t => t.id !== taskId));

      return { success: true, data: parentTask };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to convert to parent task');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  const convertToSimpleTask = useCallback(async (parentTaskId: string): Promise<OperationResult<Task>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      const parentTask = parentTasks.find(pt => pt.id === parentTaskId);
      if (!parentTask) {
        throw new Error('Parent task not found');
      }

      const task: Task = {
        id: parentTask.id,
        title: parentTask.title,
        type: 'task',
        status: parentTask.status,
        priority: parentTask.priority,
        workflow_state: parentTask.workflow_state,
        created_date: parentTask.created_date,
        updated_date: new Date().toISOString().split('T')[0],
        tags: parentTask.tags,
        content: parentTask.overview,
      };

      setTasks(prev => [...prev, task]);
      setParentTasks(prev => prev.filter(pt => pt.id !== parentTaskId));

      return { success: true, data: task };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to convert to simple task');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, [parentTasks]);

  // Subtask Operations
  const addSubtask = useCallback(async (parentId: string, subtaskData: Partial<Task>): Promise<OperationResult<Task>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      const parentTask = parentTasks.find(pt => pt.id === parentId);
      if (!parentTask) {
        throw new Error('Parent task not found');
      }

      const subtask: Task = {
        id: `subtask-${Date.now()}`,
        title: subtaskData.title || 'New Subtask',
        type: subtaskData.type || 'task',
        status: subtaskData.status || 'todo',
        priority: subtaskData.priority || 'medium',
        workflow_state: parentTask.workflow_state,
        parent_task: parentId,
        sequence: (parentTask.subtasks.length + 1).toString().padStart(2, '0'),
        created_date: new Date().toISOString().split('T')[0],
        updated_date: new Date().toISOString().split('T')[0],
        tags: subtaskData.tags || [],
        content: subtaskData.content || '',
        ...subtaskData,
      };

      setTasks(prev => [...prev, subtask]);
      
      // Update parent task's subtasks list
      setParentTasks(prev => prev.map(pt => 
        pt.id === parentId 
          ? { 
              ...pt, 
              subtasks: [...pt.subtasks, subtask.id],
              progress: { 
                ...pt.progress, 
                total: pt.progress.total + 1 
              }
            }
          : pt
      ));

      return { success: true, data: subtask };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add subtask');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, [parentTasks]);

  const reorderSubtasks = useCallback(async (parentId: string, subtaskIds: string[]): Promise<OperationResult<void>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      setTasks(prev => prev.map(task => {
        if (task.parent_task === parentId) {
          const newIndex = subtaskIds.indexOf(task.id);
          if (newIndex !== -1) {
            return { ...task, sequence: (newIndex + 1).toString().padStart(2, '0') };
          }
        }
        return task;
      }));

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reorder subtasks');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const makeSubtasksParallel = useCallback(async (parentId: string, subtaskIds: string[]): Promise<OperationResult<void>> => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // Find the first sequence number
      const firstTask = tasks.find(t => t.parent_task === parentId && subtaskIds.includes(t.id));
      if (!firstTask?.sequence) {
        throw new Error('No valid sequence found');
      }

      const baseSequence = firstTask.sequence;
      
      setTasks(prev => prev.map(task => {
        if (task.parent_task === parentId && subtaskIds.includes(task.id)) {
          const index = subtaskIds.indexOf(task.id);
          const parallelSuffix = String.fromCharCode(97 + index); // 'a', 'b', 'c', etc.
          return { ...task, sequence: `${baseSequence}${parallelSuffix}` };
        }
        return task;
      }));

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to make subtasks parallel');
      setError(error);
      return { success: false, message: error.message, error };
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  // Data Refresh
  const refreshTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // TODO: Replace with real API calls to fetch tasks and parent tasks
      // For now, this is a no-op since we're using local state
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh tasks'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtering Helpers
  const getTasksByWorkflow = useCallback((workflow: WorkflowState): Task[] => {
    return tasks.filter(task => task.workflow_state === workflow);
  }, [tasks]);

  const getTasksByParent = useCallback((parentId: string): Task[] => {
    return tasks.filter(task => task.parent_task === parentId);
  }, [tasks]);

  const getSubtasks = useCallback((parentId: string): Task[] => {
    return tasks
      .filter(task => task.parent_task === parentId)
      .sort((a, b) => (a.sequence || '').localeCompare(b.sequence || ''));
  }, [tasks]);

  const contextValue: TaskContextType = {
    // State
    tasks,
    parentTasks,
    loading,
    error,

    // Task CRUD Operations
    createTask,
    updateTask,
    deleteTask,

    // Workflow Operations
    moveTaskToWorkflow,
    moveTaskToParent,

    // Parent Task Operations
    convertToParentTask,
    convertToSimpleTask,

    // Subtask Operations
    addSubtask,
    reorderSubtasks,
    makeSubtasksParallel,

    // Data Refresh
    refreshTasks,

    // Filtering Helpers
    getTasksByWorkflow,
    getTasksByParent,
    getSubtasks,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

export { TaskContext };