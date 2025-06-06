import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './breadcrumb';

const meta = {
  title: 'UI/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Tasks', href: '/tasks' },
      { label: 'Task Details' },
    ],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [{ label: 'Tasks', href: '/tasks' }, { label: 'Implement Authentication' }],
  },
};

export const SingleLevel: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

export const ManyLevels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Scopecraft', href: '/projects/scopecraft' },
      { label: 'Tasks', href: '/projects/scopecraft/tasks' },
      { label: 'Feature Tasks', href: '/projects/scopecraft/tasks/features' },
      { label: 'Authentication Implementation' },
    ],
  },
};

export const AllClickable: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Tasks', href: '/tasks' },
      { label: 'Features', href: '/tasks/features' },
      { label: 'Authentication', href: '/tasks/features/auth' },
    ],
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Very Long Project Name That Might Wrap', href: '/projects/long' },
      { label: 'Another Long Section Name For Testing', href: '/projects/long/section' },
      { label: 'Final Destination With Extended Description' },
    ],
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const V2Structure: Story = {
  args: {
    items: [
      { label: 'Workflow', href: '/workflow' },
      { label: 'Current', href: '/workflow/current' },
      { label: 'User Authentication System' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Example breadcrumb for the new V2 workflow-based structure.',
      },
    },
  },
};

export const ParentTaskBreadcrumb: Story = {
  args: {
    items: [
      { label: 'Tasks', href: '/tasks' },
      { label: 'Parent Tasks', href: '/parent' },
      { label: 'Authentication System', href: '/parent/auth-system-05A' },
      { label: 'Setup Database Schema' },
    ],
  },
};
