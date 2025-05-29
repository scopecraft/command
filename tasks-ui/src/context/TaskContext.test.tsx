import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { TaskProvider, useTaskContext } from './TaskContext';
import type { Task } from '../lib/types';

// Test component that uses the context
function TestComponent() {
  const {
    tasks,
    parentTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTaskToWorkflow,
    getTasksByWorkflow,
  } = useTaskContext();

  const handleCreateTask = async () => {
    await createTask({
      title: 'Test Task',
      type: 'task',
      status: 'todo',
      priority: 'medium',
      workflow_state: 'current',
    });
  };

  return (
    <div>
      <div data-testid="tasks-count">{tasks.length}</div>
      <div data-testid="parent-tasks-count">{parentTasks.length}</div>
      <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
      <div data-testid="error">{error?.message || 'no-error'}</div>
      <div data-testid="current-tasks-count">
        {getTasksByWorkflow('current').length}
      </div>
      <button onClick={handleCreateTask} data-testid="create-task">
        Create Task
      </button>
    </div>
  );
}

describe('TaskContext', () => {
  beforeEach(() => {
    // Reset any mocks or state before each test
  });

  it('provides initial context values', () => {
    render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
    expect(screen.getByTestId('parent-tasks-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('current-tasks-count')).toHaveTextContent('0');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTaskContext must be used within a TaskProvider');

    consoleSpy.mockRestore();
  });

  it('can create a task', async () => {
    render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    const createButton = screen.getByTestId('create-task');

    await act(async () => {
      createButton.click();
    });

    expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
    expect(screen.getByTestId('current-tasks-count')).toHaveTextContent('1');
  });

  it('can filter tasks by workflow state', async () => {
    render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    // Initially no tasks
    expect(screen.getByTestId('current-tasks-count')).toHaveTextContent('0');

    // Create a task
    const createButton = screen.getByTestId('create-task');
    await act(async () => {
      createButton.click();
    });

    // Should have one task in 'current' workflow
    expect(screen.getByTestId('current-tasks-count')).toHaveTextContent('1');
  });
});

describe('TaskContext Operations', () => {
  let contextValue: ReturnType<typeof useTaskContext>;

  function TestWrapper() {
    contextValue = useTaskContext();
    return <div>Test</div>;
  }

  beforeEach(() => {
    render(
      <TaskProvider>
        <TestWrapper />
      </TaskProvider>
    );
  });

  it('creates tasks with generated IDs and timestamps', async () => {
    const result = await act(async () => {
      return await contextValue.createTask({
        title: 'New Task',
        type: 'task',
        status: 'todo',
      });
    });

    expect(result.success).toBe(true);
    expect(result.data?.id).toMatch(/^task-\d+$/);
    expect(result.data?.title).toBe('New Task');
    expect(result.data?.created_date).toBeTruthy();
    expect(result.data?.updated_date).toBeTruthy();
  });

  it('updates existing tasks', async () => {
    // Create a task first
    const createResult = await act(async () => {
      return await contextValue.createTask({
        title: 'Original Title',
        type: 'task',
        status: 'todo',
      });
    });

    expect(createResult.success).toBe(true);
    const task = createResult.data!;

    // Update the task
    const updatedTask: Task = {
      ...task,
      title: 'Updated Title',
      status: 'in_progress',
    };

    const updateResult = await act(async () => {
      return await contextValue.updateTask(updatedTask);
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.title).toBe('Updated Title');
    expect(updateResult.data?.status).toBe('in_progress');
  });

  it('deletes tasks', async () => {
    // Create a task first
    const createResult = await act(async () => {
      return await contextValue.createTask({
        title: 'Task to Delete',
        type: 'task',
        status: 'todo',
      });
    });

    const taskId = createResult.data!.id;
    expect(contextValue.tasks).toHaveLength(1);

    // Delete the task
    const deleteResult = await act(async () => {
      return await contextValue.deleteTask(taskId);
    });

    expect(deleteResult.success).toBe(true);
    expect(contextValue.tasks).toHaveLength(0);
  });

  it('moves tasks between workflows', async () => {
    // Create a task in 'current' workflow
    const createResult = await act(async () => {
      return await contextValue.createTask({
        title: 'Task to Move',
        type: 'task',
        status: 'todo',
        workflow_state: 'current',
      });
    });

    const taskId = createResult.data!.id;

    // Move to 'archive' workflow
    const moveResult = await act(async () => {
      return await contextValue.moveTaskToWorkflow(taskId, 'archive');
    });

    expect(moveResult.success).toBe(true);
    expect(moveResult.data?.workflow_state).toBe('archive');

    // Check filtering works
    expect(contextValue.getTasksByWorkflow('current')).toHaveLength(0);
    expect(contextValue.getTasksByWorkflow('archive')).toHaveLength(1);
  });
});

export {};