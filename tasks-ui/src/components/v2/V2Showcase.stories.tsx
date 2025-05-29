import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { mockV2ParentTasks, mockV2SimpleTasks, mockV2Subtasks } from '../../lib/api/mock-data-v2';
import { ParentTaskCard } from './ParentTaskCard';
import { SubtaskList } from './SubtaskList';
import { TaskTypeIcon } from './TaskTypeIcon';
import { PriorityIndicator, StatusBadge, WorkflowStateBadge } from './WorkflowStateBadge';

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
    const subtasks = mockV2Subtasks.filter((task) => task.parent_task === 'parent-001');
    const [isEditing, setIsEditing] = React.useState(false);
    const [content, setContent] = React.useState(parentTask.overview || '');

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleCancel = () => {
      setContent(parentTask.overview || '');
      setIsEditing(false);
    };

    const handleSave = () => {
      console.log('Save overview content:', content);
      setIsEditing(false);
      // In real app, would update the parent task
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-start gap-3">
              <TaskTypeIcon task={parentTask} />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">{parentTask.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={parentTask.status} />
                  <PriorityIndicator priority={parentTask.priority} />
                  <WorkflowStateBadge workflow={parentTask.workflow_state} />
                </div>
                {parentTask.tags && parentTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {parentTask.tags.map((tag) => (
                      <span key={tag} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Header */}
        <div className="max-w-6xl mx-auto px-6 py-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Main CTAs - Parent task level actions */}
              <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium">
                🤖 Start Agent
              </button>
              <button className="px-3 py-1.5 text-sm bg-muted text-foreground rounded hover:bg-muted/90">
                🔄 Convert to Simple
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overview - Main Content (2/3) */}
            <div className="lg:col-span-2">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Edit Overview</h2>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-sm bg-muted text-foreground rounded hover:bg-muted/90"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="border rounded-lg">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-96 bg-background text-foreground p-4 font-mono text-sm resize-none focus:outline-none rounded-lg"
                      placeholder="Enter overview content using Markdown..."
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supports Markdown formatting (headers, lists, links, etc.)
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="group relative">
                  <button
                    onClick={handleEdit}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/90"
                  >
                    Edit
                  </button>
                  <div className="prose prose-sm dark:prose-invert max-w-none cursor-text" onClick={handleEdit}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Subtasks Navigation Sidebar (1/3) */}
            <div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">🔗 Subtasks</h3>
                  <div className="text-sm text-muted-foreground">
                    {subtasks.filter((t) => t.status === 'done').length}/{subtasks.length}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round((subtasks.filter(t => t.status === 'done').length / subtasks.length) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((subtasks.filter(t => t.status === 'done').length / subtasks.length) * 100)}% complete
                  </div>
                </div>

                {/* Condensed Subtask List */}
                <SubtaskList
                  subtasks={subtasks}
                  variant="compact"
                  onTaskClick={(task) => console.log('Navigate to task detail:', task.id)}
                />

                {/* Subtask Actions */}
                <div className="mt-4 pt-3 border-t space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                    + Add Subtask
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 text-center px-2 py-1.5 text-xs bg-muted text-foreground rounded hover:bg-muted/90">
                      ↕ Reorder
                    </button>
                    <button className="flex-1 text-center px-2 py-1.5 text-xs bg-muted text-foreground rounded hover:bg-muted/90">
                      ⚹ Make Parallel
                    </button>
                  </div>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Workflow Dashboard</h1>
          <p className="text-muted-foreground mt-1">Organize your work by workflow states</p>
        </div>
      </div>

      {/* Workflow Columns */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Backlog */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WorkflowStateBadge workflow="backlog" />
              <span className="text-muted-foreground">
                ({mockV2ParentTasks.filter((t) => t.workflow_state === 'backlog').length})
              </span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter((task) => task.workflow_state === 'backlog')
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
              <span className="text-muted-foreground">
                ({mockV2ParentTasks.filter((t) => t.workflow_state === 'current').length})
              </span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter((task) => task.workflow_state === 'current')
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
              <span className="text-muted-foreground">
                ({mockV2ParentTasks.filter((t) => t.workflow_state === 'archive').length})
              </span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter((task) => task.workflow_state === 'archive')
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">All Tasks</h1>
                <p className="text-muted-foreground mt-1">
                  Mixed view of parent tasks and simple tasks
                </p>
              </div>
              <div className="flex items-center gap-2">
                <WorkflowStateBadge workflow="current" size="sm" />
                <span className="text-muted-foreground">
                  {allTasks.filter((t) => t.workflow_state === 'current').length} tasks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4">
            {allTasks
              .filter((task) => task.workflow_state === 'current')
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
                      className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => console.log('Navigate to task:', task.title)}
                    >
                      <div className="flex items-start gap-3">
                        <TaskTypeIcon task={task} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={task.status} size="sm" />
                            <PriorityIndicator priority={task.priority} size="sm" />
                            <WorkflowStateBadge workflow={task.workflow_state} size="sm" />
                          </div>
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {task.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                                >
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
        <h1 className="text-3xl font-bold text-foreground mb-2">V2 Component Library</h1>
        <p className="text-muted-foreground">
          Clean, modern UI components for workflow-based task management
        </p>
      </div>

      {/* Icons */}
      <div className="bg-card border rounded-lg p-6">
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
      <div className="bg-card border rounded-lg p-6">
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
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Parent Task Card</h2>
        <ParentTaskCard parentTask={mockV2ParentTasks[0]} variant="default" />
      </div>

      {/* Sample Subtask List */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Subtask Tree View</h2>
        <SubtaskList
          subtasks={mockV2Subtasks.filter((t) => t.parent_task === 'parent-001').slice(0, 5)}
          variant="tree"
        />
      </div>
    </div>
  ),
};
