import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Test/Button',
  component: () => (
    <button className="px-4 py-2 bg-blue-500 text-white rounded">Test Button</button>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
