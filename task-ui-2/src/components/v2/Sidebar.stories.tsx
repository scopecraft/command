import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'V2 Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onNavigate: { action: 'navigated' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex h-screen bg-background">
      <Sidebar {...args} />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
        <p className="text-muted-foreground">
          Click items in the sidebar to see navigation events in the Actions panel.
        </p>
      </div>
    </div>
  ),
};

export const WithActiveStates: Story = {
  render: () => {
    const [activePath, setActivePath] = React.useState('/tasks');
    
    return (
      <div className="flex h-screen bg-background">
        <Sidebar onNavigate={setActivePath} />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Navigation Demo</h1>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Current Path:</p>
            <p className="font-mono text-lg">{activePath}</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">Sidebar Features:</h2>
            <ul className="space-y-2 text-sm">
              <li>• Quick filters for Tasks (To Do, In Progress, All)</li>
              <li>• Quick filters for Parent Tasks (To Do, In Progress, All)</li>
              <li>• Workflow states with task counts</li>
              <li>• Recent tasks for quick access (last 5)</li>
              <li>• Task type icons using shared icon system</li>
              <li>• Action buttons for creating new tasks</li>
              <li>• Active state highlighting</li>
              <li>• Hover effects with chevron animation</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};

export const WithMockData: Story = {
  render: () => {
    const [selectedTask, setSelectedTask] = React.useState<string | null>(null);
    
    const mockTaskDetails: Record<string, { title: string; type: string; status: string }> = {
      'bug-001': { title: 'Fix login timeout bug', type: 'Bug', status: 'In Progress' },
      'parent-001': { title: 'User Authentication System', type: 'Parent Task', status: 'In Progress' },
      'task-001': { title: 'Implement OAuth2 endpoints', type: 'Task', status: 'To Do' },
      'feature-001': { title: 'Add dark mode toggle', type: 'Feature', status: 'Done' },
      'parent-002': { title: 'Payment Integration', type: 'Parent Task', status: 'Planning' },
    };
    
    return (
      <div className="flex h-screen bg-background">
        <Sidebar onNavigate={(path) => {
          const taskId = path.split('/').pop();
          if (taskId && mockTaskDetails[taskId]) {
            setSelectedTask(taskId);
          }
        }} />
        <div className="flex-1 p-8">
          {selectedTask && mockTaskDetails[selectedTask] ? (
            <div className="bg-card border rounded-lg p-6">
              <h1 className="text-2xl font-bold mb-2">
                {mockTaskDetails[selectedTask].title}
              </h1>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Type: {mockTaskDetails[selectedTask].type}</span>
                <span>•</span>
                <span>Status: {mockTaskDetails[selectedTask].status}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Select a task from the sidebar to view details</p>
            </div>
          )}
        </div>
      </div>
    );
  },
};