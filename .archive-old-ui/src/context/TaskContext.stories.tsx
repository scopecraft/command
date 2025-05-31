import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TaskProvider, useTaskContext } from './TaskContext';
import { MockTaskProvider, mockV2Tasks, mockV2ParentTasks } from './MockTaskProvider';

// Demo component that displays context state
function TaskContextDemo() {
  const {
    tasks,
    parentTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    getTasksByWorkflow,
    getSubtasks,
  } = useTaskContext();

  const handleCreateTask = async () => {
    await createTask({
      title: `New Task ${Date.now()}`,
      type: 'task',
      status: 'todo',
      priority: 'medium',
      workflow_state: 'current',
      content: 'This is a newly created task for testing.',
    });
  };

  const handleUpdateFirstTask = async () => {
    if (tasks.length > 0) {
      const firstTask = tasks[0];
      await updateTask({
        ...firstTask,
        status: firstTask.status === 'todo' ? 'in_progress' : 'todo',
        title: `${firstTask.title} (Updated)`,
      });
    }
  };

  const handleDeleteFirstTask = async () => {
    if (tasks.length > 0) {
      await deleteTask(tasks[0].id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Task Context Demo</h2>
        
        {/* Status */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded">
            <h3 className="font-semibold">Tasks</h3>
            <p className="text-2xl">{tasks.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <h3 className="font-semibold">Parent Tasks</h3>
            <p className="text-2xl">{parentTasks.length}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <h3 className="font-semibold">Status</h3>
            <p className={`text-sm ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
              {loading ? 'Loading...' : 'Ready'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleCreateTask}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Task
          </button>
          <button
            onClick={handleUpdateFirstTask}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={tasks.length === 0}
          >
            Update First Task
          </button>
          <button
            onClick={handleDeleteFirstTask}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={tasks.length === 0}
          >
            Delete First Task
          </button>
        </div>

        {/* Workflow Filter Demo */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-yellow-50 p-3 rounded">
            <h3 className="font-semibold">Backlog</h3>
            <p className="text-lg">{getTasksByWorkflow('backlog').length}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <h3 className="font-semibold">Current</h3>
            <p className="text-lg">{getTasksByWorkflow('current').length}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="font-semibold">Archive</h3>
            <p className="text-lg">{getTasksByWorkflow('archive').length}</p>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Current Tasks</h3>
          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">No tasks yet. Create one to get started!</p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="border p-3 rounded bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="text-sm text-gray-600 space-x-2">
                        <span className="bg-blue-100 px-2 py-1 rounded">{task.type}</span>
                        <span className="bg-green-100 px-2 py-1 rounded">{task.status}</span>
                        <span className="bg-purple-100 px-2 py-1 rounded">{task.priority}</span>
                        <span className="bg-yellow-100 px-2 py-1 rounded">{task.workflow_state}</span>
                      </div>
                      {task.parent_task && (
                        <div className="text-sm text-gray-500 mt-1">
                          Parent: {task.parent_task} | Sequence: {task.sequence}
                        </div>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          Tags: {task.tags.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length > 5 && (
                <p className="text-gray-500 text-sm">...and {tasks.length - 5} more tasks</p>
              )}
            </div>
          )}
        </div>

        {/* Parent Tasks */}
        {parentTasks.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold">Parent Tasks</h3>
            {parentTasks.map((parentTask) => (
              <div key={parentTask.id} className="border p-4 rounded bg-blue-50">
                <h4 className="font-medium mb-2">📁 {parentTask.title}</h4>
                <div className="text-sm text-gray-600 mb-2">
                  Progress: {parentTask.progress.completed}/{parentTask.progress.total} subtasks completed
                </div>
                <div className="text-sm">
                  <span className="font-medium">Subtasks:</span>
                  {getSubtasks(parentTask.id).length > 0 ? (
                    <ul className="ml-4 mt-1">
                      {getSubtasks(parentTask.id).slice(0, 3).map((subtask) => (
                        <li key={subtask.id} className="text-gray-600">
                          {subtask.sequence}: {subtask.title} ({subtask.status})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500 ml-1">None</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof TaskContextDemo> = {
  title: 'Context/TaskContext',
  component: TaskContextDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive demo of the V2 TaskContext with mock data and operations.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyState: Story = {
  decorators: [
    (Story) => (
      <TaskProvider>
        <Story />
      </TaskProvider>
    ),
  ],
};

export const WithMockData: Story = {
  decorators: [
    (Story) => (
      <MockTaskProvider
        mockTasks={mockV2Tasks}
        mockParentTasks={mockV2ParentTasks}
      >
        <Story />
      </MockTaskProvider>
    ),
  ],
};

export const InteractiveDemo: Story = {
  decorators: [
    (Story) => (
      <TaskProvider>
        <Story />
      </TaskProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Try creating, updating, and deleting tasks to see the context in action.',
      },
    },
  },
};