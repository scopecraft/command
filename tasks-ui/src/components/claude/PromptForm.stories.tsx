import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PromptForm } from './PromptForm';

const meta: Meta<typeof PromptForm> = {
  title: 'Claude/PromptForm',
  component: PromptForm,
  parameters: {
    layout: 'padded',
  },
  args: {
    handleSubmit: () => {},
    handleDisconnect: () => {},
    setPrompt: () => {},
    setContextId: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper for realistic behavior
function InteractivePromptForm(args: any) {
  const [prompt, setPrompt] = useState(args.prompt || '');
  const [contextId, setContextId] = useState(args.contextId || '');

  return (
    <PromptForm
      {...args}
      prompt={prompt}
      setPrompt={setPrompt}
      contextId={contextId}
      setContextId={setContextId}
    />
  );
}

export const Default: Story = {
  args: {
    prompt: '',
    contextId: '',
    isConnecting: false,
    isConnected: true,
  },
  render: (args) => <InteractivePromptForm {...args} />,
};

export const WithPrompt: Story = {
  args: {
    prompt: 'Can you help me implement a new feature for user authentication?',
    contextId: 'auth-feature-123',
    isConnecting: false,
    isConnected: true,
  },
  render: (args) => <InteractivePromptForm {...args} />,
};

export const Connecting: Story = {
  args: {
    prompt: 'Please analyze the current task status',
    contextId: 'TASK-456',
    isConnecting: true,
    isConnected: false,
  },
  render: (args) => <InteractivePromptForm {...args} />,
};

export const Disconnected: Story = {
  args: {
    prompt: '',
    contextId: '',
    isConnecting: false,
    isConnected: false,
  },
  render: (args) => <InteractivePromptForm {...args} />,
};

export const WithPrefilledContext: Story = {
  args: {
    prompt: '',
    contextId: 'implement-v2-structure',
    isConnecting: false,
    isConnected: true,
    id: 'implement-v2-structure', // This would come from URL params
  },
  render: (args) => <InteractivePromptForm {...args} />,
};
