import type { Meta, StoryObj } from '@storybook/react';
import { TaskMetadata } from './TaskMetadata';
import type { Task } from '../../lib/types';

// Helper to create dates relative to today
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Mock task data
const mockTask: Task = {
  id: 'implement-auth-05A',
  title: 'Implement User Authentication',
  type: 'feature',
  status: 'In Progress',
  priority: 'High',
  assigned_to: 'john.doe@example.com',
  created_date: daysAgo(7),
  updated_date: daysAgo(1),
  due_date: daysFromNow(7),
  phase: 'Development',
  tags: ['security', 'backend', 'priority'],
  depends_on: ['setup-database-04B', 'design-auth-flow-03C'],
  parent_task: 'epic-user-management-01A',
  subdirectory: 'FEATURE_authentication',
};

const meta = {
  title: 'Task Detail/TaskMetadata',
  component: TaskMetadata,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskMetadata>;

export default meta;
type Story = StoryObj<typeof meta>;

// Note: TaskMetadata uses context for refreshTasks, but it's only for the TaskMoveDropdown
// These stories demonstrate the metadata display functionality

export const Default: Story = {
  args: {
    task: mockTask,
  },
};

export const MinimalTask: Story = {
  args: {
    task: {
      id: 'simple-task-01',
      title: 'Simple Task',
      type: 'chore',
      status: 'To Do',
      created_date: daysAgo(0),
      updated_date: daysAgo(0),
    },
  },
};

export const CompleteMetadata: Story = {
  args: {
    task: {
      ...mockTask,
      previous_task: 'previous-task-04A',
      next_task: 'next-task-06B',
      subdirectory: 'AREA_infrastructure',
    },
  },
};

export const NoDependencies: Story = {
  args: {
    task: {
      ...mockTask,
      depends_on: undefined,
    },
  },
};

export const ManyDependencies: Story = {
  args: {
    task: {
      ...mockTask,
      depends_on: [
        'task-001',
        'task-002',
        'task-003',
        'task-004',
        'task-005',
        'long-task-id-with-descriptive-name-006',
      ],
    },
  },
};

export const ManyTags: Story = {
  args: {
    task: {
      ...mockTask,
      tags: [
        'security',
        'backend',
        'frontend',
        'api',
        'database',
        'authentication',
        'authorization',
        'jwt',
        'oauth',
        'high-priority',
        'breaking-change',
      ],
    },
  },
};

export const DueDateToday: Story = {
  args: {
    task: {
      ...mockTask,
      due_date: daysAgo(0),
    },
  },
};

export const DueDatePast: Story = {
  args: {
    task: {
      ...mockTask,
      due_date: daysAgo(5),
      status: 'In Progress', // Overdue task
    },
  },
};

export const DueDateFuture: Story = {
  args: {
    task: {
      ...mockTask,
      due_date: daysFromNow(30),
    },
  },
};

export const NoOptionalFields: Story = {
  args: {
    task: {
      id: 'basic-task',
      title: 'Basic Task',
      type: 'task',
      status: 'To Do',
      created_date: daysAgo(2),
      updated_date: daysAgo(1),
      // No optional fields
    },
  },
};

export const FeatureTask: Story = {
  args: {
    task: {
      ...mockTask,
      subdirectory: 'FEATURE_payment-integration',
    },
  },
};

export const AreaTask: Story = {
  args: {
    task: {
      ...mockTask,
      subdirectory: 'AREA_devops',
    },
  },
};

export const RegularSubdirectory: Story = {
  args: {
    task: {
      ...mockTask,
      subdirectory: 'misc/documentation',
    },
  },
};

export const V2WorkflowTask: Story = {
  args: {
    task: {
      ...mockTask,
      // V2 fields (for future compatibility)
      workflowState: 'current',
      area: 'backend',
      phase: undefined, // No phase in V2
      subdirectory: undefined, // No subdirectory in V2
    } as any,
  },
  parameters: {
    docs: {
      description: {
        story: 'Preview of how metadata might look with V2 task structure.',
      },
    },
  },
};