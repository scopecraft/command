import type { Meta, StoryObj } from '@storybook/react';
import { TaskManagementView } from './TaskManagementView';

const meta: Meta<typeof TaskManagementView> = {
  title: 'V2 Components/TaskManagementView',
  component: TaskManagementView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete task management interface with search, filtering, and table view. Demonstrates the full V2 task management workflow.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskManagementView>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-6">
      <TaskManagementView />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete task management interface showcasing search, filters, bulk actions, and the task table working together seamlessly.',
      },
    },
  },
};

export const WithDarkBackground: Story = {
  render: () => (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="dark">
        <TaskManagementView />
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
        <TaskManagementView />
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