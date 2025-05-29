import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ParentTaskCard } from './ParentTaskCard';
import { SubtaskList } from './SubtaskList';
import { TaskTypeIcon } from './TaskTypeIcon';
import { WorkflowStateBadge, StatusBadge, PriorityIndicator } from './WorkflowStateBadge';
import { mockV2ParentTasks, mockV2Subtasks, mockV2SimpleTasks } from '../../lib/api/mock-data-v2';

const meta: Meta = {
  title: 'V2 Components/Complete Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete showcase of V2 components working together in realistic layouts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ParentTaskDetailPage: Story = {
  render: () => {
    const parentTask = mockV2ParentTasks[0]; // User Authentication System
    const subtasks = mockV2Subtasks.filter(task => task.parent_task === 'parent-001');

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <span>Projects</span>
              <span>›</span>
              <WorkflowStateBadge workflow={parentTask.workflow_state} size="sm" />
              <span>›</span>
              <span className="font-medium">Parent Tasks</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Parent Task Details</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Parent Task Card */}
              <ParentTaskCard 
                parentTask={parentTask}
                variant="detailed"
                showOverview={true}
                showProgress={true}
                showMetadata={true}
              />

              {/* Subtasks Section */}
              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">🔗 Subtasks</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{subtasks.filter(t => t.status === 'done').length} completed</span>
                      <span>•</span>
                      <span>{subtasks.length} total</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <SubtaskList 
                    subtasks={subtasks}
                    variant="tree"
                    showSequence={true}
                    showParallel={true}
                    showMetadata={true}
                    onTaskClick={(task) => console.log('Navigate to task:', task.id)}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Subtasks</span>
                    <span className="font-medium">{subtasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">
                      {subtasks.filter(t => t.status === 'done').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-medium text-blue-600">
                      {subtasks.filter(t => t.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Blocked</span>
                    <span className="font-medium text-red-600">
                      {subtasks.filter(t => t.status === 'blocked').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Tasks */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Related Simple Tasks</h3>
                <div className="space-y-2">
                  {mockV2SimpleTasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <TaskTypeIcon task={task} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{task.title}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <StatusBadge status={task.status} size="sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                    + Add Subtask
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100">
                    ↕ Reorder Subtasks
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100">
                    ⚹ Make Parallel
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100">
                    🔄 Convert to Simple Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const WorkflowDashboard: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Workflow Dashboard</h1>
          <p className="text-gray-600 mt-1">Organize your work by workflow states</p>
        </div>
      </div>

      {/* Workflow Columns */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Backlog */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WorkflowStateBadge workflow="backlog" />
              <span className="text-gray-600">({mockV2ParentTasks.filter(t => t.workflow_state === 'backlog').length})</span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter(task => task.workflow_state === 'backlog')
                .map((task) => (
                  <ParentTaskCard 
                    key={task.id}
                    parentTask={task}
                    variant="compact"
                    onClick={() => console.log('Navigate to:', task.title)}
                  />
                ))}
            </div>
          </div>

          {/* Current */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WorkflowStateBadge workflow="current" />
              <span className="text-gray-600">({mockV2ParentTasks.filter(t => t.workflow_state === 'current').length})</span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter(task => task.workflow_state === 'current')
                .map((task) => (
                  <ParentTaskCard 
                    key={task.id}
                    parentTask={task}
                    variant="compact"
                    onClick={() => console.log('Navigate to:', task.title)}
                  />
                ))}
            </div>
          </div>

          {/* Archive */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WorkflowStateBadge workflow="archive" />
              <span className="text-gray-600">({mockV2ParentTasks.filter(t => t.workflow_state === 'archive').length})</span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter(task => task.workflow_state === 'archive')
                .map((task) => (
                  <ParentTaskCard 
                    key={task.id}
                    parentTask={task}
                    variant="compact"
                    onClick={() => console.log('Navigate to:', task.title)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const MixedTaskList: Story = {
  render: () => {
    const allTasks = [...mockV2SimpleTasks, ...mockV2ParentTasks];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
                <p className="text-gray-600 mt-1">Mixed view of parent tasks and simple tasks</p>
              </div>
              <div className="flex items-center gap-2">
                <WorkflowStateBadge workflow="current" size="sm" />
                <span className="text-gray-600">{allTasks.filter(t => t.workflow_state === 'current').length} tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4">
            {allTasks
              .filter(task => task.workflow_state === 'current')
              .map((task) => {
                if ('subtasks' in task) {
                  // Parent task
                  return (
                    <ParentTaskCard 
                      key={task.id}
                      parentTask={task}
                      variant="default"
                      onClick={() => console.log('Navigate to parent:', task.title)}
                    />
                  );
                } else {
                  // Simple task
                  return (
                    <div 
                      key={task.id}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => console.log('Navigate to task:', task.title)}
                    >
                      <div className="flex items-start gap-3">
                        <TaskTypeIcon task={task} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={task.status} size="sm" />
                            <PriorityIndicator priority={task.priority} size="sm" />
                            <WorkflowStateBadge workflow={task.workflow_state} size="sm" />
                          </div>
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {task.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
          </div>
        </div>
      </div>
    );
  },
};

export const ComponentShowcase: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">V2 Component Library</h1>
        <p className="text-gray-600">Clean, modern UI components for workflow-based task management</p>
      </div>

      {/* Icons */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Task Type Icons</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={mockV2ParentTasks[0]} />
            <span>Parent Task</span>
          </div>
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={{ ...mockV2SimpleTasks[0], type: 'bug' }} />
            <span>Bug</span>
          </div>
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={{ ...mockV2SimpleTasks[0], type: 'feature' }} />
            <span>Feature</span>
          </div>
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={{ ...mockV2SimpleTasks[0], type: 'documentation' }} />
            <span>Docs</span>
          </div>
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={{ ...mockV2SimpleTasks[0], type: 'test' }} />
            <span>Test</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Status & Priority Badges</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Workflow States</h3>
            <div className="flex gap-2">
              <WorkflowStateBadge workflow="backlog" />
              <WorkflowStateBadge workflow="current" />
              <WorkflowStateBadge workflow="archive" />
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Task Status</h3>
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status="todo" />
              <StatusBadge status="in_progress" />
              <StatusBadge status="done" />
              <StatusBadge status="blocked" />
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Priority Levels</h3>
            <div className="flex gap-2">
              <PriorityIndicator priority="highest" />
              <PriorityIndicator priority="high" />
              <PriorityIndicator priority="low" />
            </div>
          </div>
        </div>
      </div>

      {/* Sample Parent Task */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Parent Task Card</h2>
        <ParentTaskCard 
          parentTask={mockV2ParentTasks[0]}
          variant="default"
        />
      </div>

      {/* Sample Subtask List */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Subtask Tree View</h2>
        <SubtaskList 
          subtasks={mockV2Subtasks.filter(t => t.parent_task === 'parent-001').slice(0, 5)}
          variant="tree"
        />
      </div>
    </div>
  ),
};