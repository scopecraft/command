import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { MessageStream } from './MessageStream';
import { PromptForm } from './PromptForm';
import type { Message } from '../../lib/claude-message-handler';

const meta: Meta = {
  title: 'Claude/Full Assistant Interface',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock messages for different scenarios
const mockMessages: Message[] = [
  {
    id: '1',
    type: 'info',
    content: 'Claude Assistant session started',
    timestamp: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    type: 'user',
    content: 'Can you help me analyze the current task implement-v2-structure?',
    timestamp: new Date('2024-01-15T10:01:00Z'),
  },
  {
    id: '3',
    type: 'assistant',
    content: 'I\'d be happy to help you analyze the implement-v2-structure task. Let me fetch the current task details and provide you with a comprehensive analysis.\n\nBased on the task information, this appears to be a major refactoring effort to update your task management system to version 2. Here\'s what I can see:\n\n**Current Status**: The task is likely in progress with multiple phases\n**Key Components**: This involves updates to both CLI and UI components\n**Complexity**: This is a substantial change affecting core functionality',
    timestamp: new Date('2024-01-15T10:01:30Z'),
  },
  {
    id: '4',
    type: 'user',
    content: 'What should I work on next?',
    timestamp: new Date('2024-01-15T10:02:00Z'),
  },
  {
    id: '5',
    type: 'tool_call',
    content: {
      name: 'task_list',
      input: {
        location: 'current',
        status: 'To Do',
        parent_id: 'implement-v2-structure'
      }
    },
    timestamp: new Date('2024-01-15T10:02:05Z'),
  },
  {
    id: '6',
    type: 'tool_result',
    content: {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: [
            {
              id: 'ui-integration-phase3',
              metadata: {
                title: 'Complete UI Integration Phase 3',
                status: 'To Do',
                type: '🎨 UI',
                priority: 'High'
              }
            }
          ]
        }, null, 2)
      }]
    },
    timestamp: new Date('2024-01-15T10:02:10Z'),
  },
  {
    id: '7',
    type: 'assistant',
    content: 'Based on the current task status, I recommend working on **UI Integration Phase 3** next. This task is marked as "To Do" with high priority.\n\nThis phase likely involves:\n- Completing the UI component integration\n- Ensuring proper routing and navigation\n- Testing the full user experience\n\nWould you like me to help you start this task or provide more specific guidance on the implementation?',
    timestamp: new Date('2024-01-15T10:02:15Z'),
  },
];

const errorMessages: Message[] = [
  {
    id: '1',
    type: 'user',
    content: 'Show me all tasks',
    timestamp: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    type: 'error',
    content: 'Failed to connect to Claude API. Please check your connection and try again.',
    timestamp: new Date('2024-01-15T10:00:05Z'),
  },
];

// Interactive Claude Assistant Component
function ClaudeAssistantDemo({ 
  initialMessages = [], 
  initialConnectionState = { isConnected: true, isConnecting: false, error: null }
}: { 
  initialMessages?: Message[], 
  initialConnectionState?: { isConnected: boolean, isConnecting: boolean, error: string | null }
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prompt, setPrompt] = useState('');
  const [contextId, setContextId] = useState('');
  const [isConnected, setIsConnected] = useState(initialConnectionState.isConnected);
  const [isConnecting, setIsConnecting] = useState(initialConnectionState.isConnecting);
  const [error, setError] = useState<string | null>(initialConnectionState.error);

  const handleConnect = () => {
    setIsConnecting(true);
    setError(null);
    
    // Simulate connection
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'info',
        content: 'Connected to Claude Assistant',
        timestamp: new Date(),
      }]);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setError(null);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'info',
      content: 'Disconnected from Claude Assistant',
      timestamp: new Date(),
    }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you're asking about: "${prompt}". Let me help you with that!\n\n${contextId ? `I see you've provided context: ${contextId}. ` : ''}This is a simulated response for Storybook demonstration purposes.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setPrompt('');
  };

  return (
    <div className="h-screen flex flex-col max-w-4xl mx-auto bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Claude Assistant</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered assistance for your task management
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Connection Status */}
        <div className="p-4 border-b border-border">
          <ConnectionStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            error={error}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageStream messages={messages} />
        </div>

        {/* Prompt Form */}
        <div className="p-4 border-t border-border">
          <PromptForm
            prompt={prompt}
            setPrompt={setPrompt}
            contextId={contextId}
            setContextId={setContextId}
            isConnected={isConnected}
            isConnecting={isConnecting}
            handleSubmit={handleSubmit}
            handleDisconnect={handleDisconnect}
          />
        </div>
      </div>
    </div>
  );
}

export const ConnectedWithConversation: Story = {
  render: () => (
    <ClaudeAssistantDemo 
      initialMessages={mockMessages}
      initialConnectionState={{ isConnected: true, isConnecting: false, error: null }}
    />
  ),
};

export const Disconnected: Story = {
  render: () => (
    <ClaudeAssistantDemo 
      initialMessages={[]}
      initialConnectionState={{ isConnected: false, isConnecting: false, error: null }}
    />
  ),
};

export const Connecting: Story = {
  render: () => (
    <ClaudeAssistantDemo 
      initialMessages={[{
        id: '1',
        type: 'info',
        content: 'Attempting to connect to Claude Assistant...',
        timestamp: new Date(),
      }]}
      initialConnectionState={{ isConnected: false, isConnecting: true, error: null }}
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <ClaudeAssistantDemo 
      initialMessages={errorMessages}
      initialConnectionState={{ 
        isConnected: false, 
        isConnecting: false, 
        error: 'Connection failed: Claude API is currently unavailable' 
      }}
    />
  ),
};

export const EmptyState: Story = {
  render: () => (
    <ClaudeAssistantDemo 
      initialMessages={[{
        id: '1',
        type: 'info',
        content: 'Claude Assistant ready. Send a prompt to start the conversation.',
        timestamp: new Date(),
      }]}
      initialConnectionState={{ isConnected: true, isConnecting: false, error: null }}
    />
  ),
};