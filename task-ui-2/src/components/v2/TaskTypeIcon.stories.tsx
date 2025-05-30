import type { Meta, StoryObj } from '@storybook/react';
import { TaskTypeIcon } from './TaskTypeIcon';
import type { Task, ParentTask } from '../../lib/types';

const meta: Meta<typeof TaskTypeIcon> = {
  title: 'V2 Components/TaskTypeIcon',
  component: TaskTypeIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Icon component that distinguishes between parent tasks (📁) and simple tasks with type-specific icons.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock tasks for testing
const mockSimpleTask: Task = {
  id: 'task-001',
  title: 'Simple Task',
  type: 'task',
  status: 'todo',
  priority: 'medium',
  workflow_state: 'current',
  created_date: '2025-05-29',
  updated_date: '2025-05-29',
  tags: [],
  content: '',
};

const mockParentTask: ParentTask = {
  id: 'parent-001',
  title: 'Parent Task',
  type: 'parent_task',
  status: 'in_progress',
  priority: 'high',
  workflow_state: 'current',
  created_date: '2025-05-29',
  updated_date: '2025-05-29',
  tags: [],
  overview: '',
  content: '',
  subtasks: [],
  progress: { completed: 0, total: 0 },
};

export const ParentTask: Story = {
  args: {
    task: mockParentTask,
    size: 'md',
  },
};

export const SimpleTask: Story = {
  args: {
    task: mockSimpleTask,
    size: 'md',
  },
};

export const BugTask: Story = {
  args: {
    task: { ...mockSimpleTask, type: 'bug' },
    size: 'md',
  },
};

export const FeatureTask: Story = {
  args: {
    task: { ...mockSimpleTask, type: 'feature' },
    size: 'md',
  },
};

export const DocumentationTask: Story = {
  args: {
    task: { ...mockSimpleTask, type: 'documentation' },
    size: 'md',
  },
};

export const AllTypesShowcase: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Task Type Icons</h3>
      
      {/* Parent Task */}
      <div className="flex items-center gap-3 p-3 border rounded">
        <TaskTypeIcon task={mockParentTask} />
        <span className="font-medium">Parent Task</span>
        <span className="text-gray-500">📁 Contains subtasks</span>
      </div>

      {/* Simple Task Types */}
      {[
        { type: 'task', label: 'Task', description: 'Regular task item' },
        { type: 'bug', label: 'Bug', description: 'Bug fix task' },
        { type: 'feature', label: 'Feature', description: 'New feature development' },
        { type: 'chore', label: 'Chore', description: 'Maintenance task' },
        { type: 'documentation', label: 'Documentation', description: 'Documentation task' },
        { type: 'test', label: 'Test', description: 'Testing task' },
        { type: 'spike', label: 'Spike', description: 'Research/investigation' },
        { type: 'enhancement', label: 'Enhancement', description: 'Improvement task' },
      ].map(({ type, label, description }) => (
        <div key={type} className="flex items-center gap-3 p-3 border rounded">
          <TaskTypeIcon task={{ ...mockSimpleTask, type: type as any }} />
          <span className="font-medium">{label}</span>
          <span className="text-gray-500">{description}</span>
        </div>
      ))}
    </div>
  ),
};

export const SizesShowcase: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Icon Sizes</h3>
      
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-4 p-3 border rounded">
          <span className="w-12 text-sm font-medium capitalize">{size}</span>
          <TaskTypeIcon task={mockParentTask} size={size} />
          <TaskTypeIcon task={mockSimpleTask} size={size} />
          <TaskTypeIcon task={{ ...mockSimpleTask, type: 'bug' }} size={size} />
          <TaskTypeIcon task={{ ...mockSimpleTask, type: 'feature' }} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const InlineUsage: Story = {
  render: () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Inline Usage Examples</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TaskTypeIcon task={mockParentTask} size="sm" />
          <span className="font-medium">User Authentication System</span>
          <span className="text-gray-500">• 3/7 subtasks completed</span>
        </div>
        
        <div className="flex items-center gap-2">
          <TaskTypeIcon task={{ ...mockSimpleTask, type: 'bug' }} size="sm" />
          <span className="font-medium">Fix login redirect bug</span>
          <span className="text-gray-500">• High priority</span>
        </div>
        
        <div className="flex items-center gap-2">
          <TaskTypeIcon task={{ ...mockSimpleTask, type: 'feature' }} size="sm" />
          <span className="font-medium">Add dark mode toggle</span>
          <span className="text-gray-500">• In progress</span>
        </div>
      </div>
    </div>
  ),
};