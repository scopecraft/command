import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { mockV2SimpleTasks, mockV2Subtasks } from '../../lib/api/mock-data-v2';
import { TaskManagementView } from './TaskManagementView';

// Generate mock data using existing mock tasks
const mockData = {
  success: true as const,
  data: [
    ...mockV2SimpleTasks.map((task) => ({
      ...task,
      // Add required fields for TaskTable compatibility
      workflow: task.workflowState,
      created_date: task.createdDate,
      updated_date: task.updatedDate,
    })),
    ...mockV2Subtasks.map((task) => ({
      ...task,
      // Add required fields for TaskTable compatibility
      workflow: task.workflowState,
      created_date: task.createdDate,
      updated_date: task.updatedDate,
      parent_task: task.parentId,
    })),
  ],
  message: 'Mock data for Storybook',
};

const meta: Meta<typeof TaskManagementView> = {
  title: 'V2 Components/TaskManagementView',
  component: TaskManagementView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete task management interface with search, filtering, and table view. Demonstrates the full V2 task management workflow.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskManagementView>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-6">
      <TaskManagementView data={mockData} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete task management interface showcasing search, filters, bulk actions, and the task table working together seamlessly.',
      },
    },
  },
};

export const WithDarkBackground: Story = {
  render: () => (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="dark">
        <TaskManagementView data={mockData} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Task management view with dark theme applied.',
      },
    },
  },
};

export const CompactLayout: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <TaskManagementView data={mockData} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Task management view in a more compact, centered layout.',
      },
    },
  },
};

export const WithFilters: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-6">
      <TaskManagementView
        data={mockData}
        searchParams={{
          status: ['in_progress'],
          type: ['feature'],
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Task management view with pre-applied filters.',
      },
    },
  },
};

export const EmptyState: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-6">
      <TaskManagementView
        data={{
          success: true,
          data: [],
          message: 'No tasks',
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Task management view with no tasks.',
      },
    },
  },
};
