import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ClaudeAgentButton } from './ClaudeAgentButton';

const meta: Meta<typeof ClaudeAgentButton> = {
  title: 'V2 Components/ClaudeAgentButton',
  component: ClaudeAgentButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    taskId: 'task-001',
  },
};

export const SessionActive: Story = {
  render: () => {
    // This will show the active state due to the mock random check
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Refresh to randomly see active/inactive states (30% chance of active)
        </p>
        <ClaudeAgentButton taskId="task-active" />
      </div>
    );
  },
};

export const Starting: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the button to see the starting state
        </p>
        <ClaudeAgentButton 
          taskId="task-starting"
          onClick={() => console.log('Starting Claude session...')}
        />
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => {
    const [activeSession, setActiveSession] = React.useState(false);
    const [startingSession, setStartingSession] = React.useState(false);

    const handleStart = async () => {
      setStartingSession(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStartingSession(false);
      setActiveSession(true);
    };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Interactive Demo</h3>
          <p className="text-sm text-muted-foreground">
            Click the button to progress through states
          </p>
          
          {!activeSession && !startingSession && (
            <ClaudeAgentButton onClick={handleStart} />
          )}
          
          {startingSession && (
            <ClaudeAgentButton taskId="demo" onClick={() => {}} />
          )}
          
          {activeSession && !startingSession && (
            <ClaudeAgentButton taskId="demo-active" />
          )}
          
          {activeSession && (
            <button 
              onClick={() => setActiveSession(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Reset demo
            </button>
          )}
        </div>

        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold">All Button States</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <ClaudeAgentButton />
              <span className="text-sm text-muted-foreground">Default</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-transform bg-[var(--atlas-navy)] text-[var(--cream)] shadow-xs hover:bg-[var(--atlas-navy)]/90 hover:translate-y-[-2px] h-9 px-4 py-2 uppercase group" disabled>
                Starting...
              </button>
              <span className="text-sm text-muted-foreground">Starting</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2 uppercase" disabled>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Claude Session Running
              </button>
              <span className="text-sm text-muted-foreground">Session Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};