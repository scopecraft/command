import type { Meta, StoryObj } from '@storybook/react';
import { MetadataEditor, type TaskMetadata } from './MetadataEditor';
import { useState } from 'react';

const meta: Meta<typeof MetadataEditor> = {
  title: 'V2 Components/MetadataEditor',
  component: MetadataEditor,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#121212' },
        { name: 'light', value: '#F2EFE1' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-terminal-black min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to manage state and demonstrate updates
const MetadataEditorDemo = (props: any) => {
  const [metadata, setMetadata] = useState<TaskMetadata>(props.metadata);
  const [updateLog, setUpdateLog] = useState<string[]>([]);
  
  const handleUpdate = async (field: keyof TaskMetadata, value: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, props.delay || 1000));
    
    // Simulate random failures for error state demo
    if (props.simulateError && Math.random() > 0.5) {
      throw new Error(`Failed to update ${field}`);
    }
    
    setMetadata(prev => ({ ...prev, [field]: value }));
    setUpdateLog(prev => [
      `Updated ${field} to ${JSON.stringify(value)}`,
      ...prev
    ].slice(0, 5));
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-cream font-jetbrains-mono text-lg mb-4 uppercase">Metadata Editor</h3>
        <MetadataEditor
          {...props}
          metadata={metadata}
          onUpdate={handleUpdate}
        />
      </div>
      
      {updateLog.length > 0 && (
        <div className="p-4 bg-terminal-dark rounded-lg border border-gray-800">
          <h4 className="text-cream font-jetbrains-mono text-sm mb-2 uppercase">Update Log</h4>
          <div className="space-y-1">
            {updateLog.map((log, i) => (
              <div key={i} className="text-gray-400 font-jetbrains-mono text-xs">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Story 1: Default - All fields editable
export const Default: Story = {
  render: () => (
    <MetadataEditorDemo
      taskId="task-123"
      metadata={{
        status: 'in_progress',
        priority: 'high',
        assignee: 'davidp',
        tags: ['frontend', 'bug', 'urgent']
      }}
    />
  ),
};

// Story 2: Status Dropdown - Show all states
export const StatusStates: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-cream font-jetbrains-mono text-lg uppercase">All Status States</h3>
      {(['todo', 'in_progress', 'done', 'blocked'] as const).map(status => (
        <div key={status} className="p-4 bg-terminal-dark rounded-lg border border-gray-800">
          <MetadataEditor
            taskId={`task-${status}`}
            metadata={{
              status,
              priority: 'medium',
              assignee: '',
              tags: []
            }}
            onUpdate={async () => {}}
          />
        </div>
      ))}
    </div>
  ),
};

// Story 3: Priority Dropdown - Show all levels
export const PriorityLevels: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-cream font-jetbrains-mono text-lg uppercase">All Priority Levels</h3>
      {(['highest', 'high', 'medium', 'low'] as const).map(priority => (
        <div key={priority} className="p-4 bg-terminal-dark rounded-lg border border-gray-800">
          <MetadataEditor
            taskId={`task-${priority}`}
            metadata={{
              status: 'todo',
              priority,
              assignee: '',
              tags: []
            }}
            onUpdate={async () => {}}
          />
        </div>
      ))}
    </div>
  ),
};

// Story 4: Tag Input - Adding/removing tags
export const TagManagement: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-cream font-jetbrains-mono text-lg mb-4 uppercase">Empty Tags</h3>
        <MetadataEditorDemo
          taskId="task-empty-tags"
          metadata={{
            status: 'todo',
            priority: 'medium',
            assignee: '',
            tags: []
          }}
        />
      </div>
      
      <div>
        <h3 className="text-cream font-jetbrains-mono text-lg mb-4 uppercase">Multiple Tags</h3>
        <MetadataEditorDemo
          taskId="task-many-tags"
          metadata={{
            status: 'in_progress',
            priority: 'high',
            assignee: 'alice',
            tags: ['backend', 'api', 'performance', 'security', 'database']
          }}
        />
      </div>
    </div>
  ),
};

// Story 5: Loading States - During updates
export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-cream font-jetbrains-mono text-lg mb-4 uppercase">
        Loading States (3s delay)
      </h3>
      <p className="text-gray-400 font-jetbrains-mono text-sm mb-6">
        Click any field to see loading state during update
      </p>
      <MetadataEditorDemo
        taskId="task-loading"
        metadata={{
          status: 'in_progress',
          priority: 'high',
          assignee: 'bob',
          tags: ['ui', 'feature']
        }}
        delay={3000}
      />
    </div>
  ),
};

// Story 6: Error States - Failed updates
export const ErrorStates: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-cream font-jetbrains-mono text-lg mb-4 uppercase">
        Error States (50% failure rate)
      </h3>
      <p className="text-gray-400 font-jetbrains-mono text-sm mb-6">
        Updates will randomly fail to demonstrate error handling and rollback
      </p>
      <MetadataEditorDemo
        taskId="task-errors"
        metadata={{
          status: 'blocked',
          priority: 'highest',
          assignee: 'charlie',
          tags: ['bug', 'critical']
        }}
        simulateError={true}
        delay={1000}
      />
    </div>
  ),
};

// Additional Stories

// Vertical Layout
export const VerticalLayout: Story = {
  render: () => (
    <div className="max-w-sm">
      <h3 className="text-cream font-jetbrains-mono text-lg mb-4 uppercase">
        Vertical Layout
      </h3>
      <MetadataEditorDemo
        taskId="task-vertical"
        layout="vertical"
        metadata={{
          status: 'in_progress',
          priority: 'medium',
          assignee: 'david',
          tags: ['design', 'ux']
        }}
      />
    </div>
  ),
};

// Disabled State
export const DisabledState: Story = {
  render: () => (
    <div>
      <h3 className="text-cream font-jetbrains-mono text-lg mb-4 uppercase">
        Disabled State
      </h3>
      <MetadataEditor
        taskId="task-disabled"
        disabled={true}
        metadata={{
          status: 'done',
          priority: 'low',
          assignee: 'system',
          tags: ['archived', 'completed']
        }}
        onUpdate={async () => {}}
      />
    </div>
  ),
};

// Empty/Minimal State
export const MinimalState: Story = {
  render: () => (
    <div>
      <h3 className="text-cream font-jetbrains-mono text-lg mb-4 uppercase">
        Minimal State
      </h3>
      <MetadataEditorDemo
        taskId="task-minimal"
        metadata={{
          status: 'todo',
          priority: 'medium',
          assignee: '',
          tags: []
        }}
      />
    </div>
  ),
};