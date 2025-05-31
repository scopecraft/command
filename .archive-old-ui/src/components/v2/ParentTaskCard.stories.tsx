import type { Meta, StoryObj } from '@storybook/react';
import { ParentTaskCard } from './ParentTaskCard';
import { mockV2ParentTasks } from '../../lib/api/mock-data-v2';

const meta: Meta<typeof ParentTaskCard> = {
  title: 'V2 Components/ParentTaskCard',
  component: ParentTaskCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Card component for displaying parent tasks with overview, progress, and metadata. Supports multiple variants for different use cases.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'detailed'],
    },
    showOverview: {
      control: { type: 'boolean' },
    },
    showProgress: {
      control: { type: 'boolean' },
    },
    showMetadata: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const authSystemTask = mockV2ParentTasks[0]; // User Authentication System
const rateLimitingTask = mockV2ParentTasks[1]; // API Rate Limiting  
const archivedTask = mockV2ParentTasks[2]; // Database Migration (archived)

export const Default: Story = {
  args: {
    parentTask: authSystemTask,
    variant: 'default',
    showOverview: true,
    showProgress: true,
    showMetadata: true,
  },
};

export const Compact: Story = {
  args: {
    parentTask: authSystemTask,
    variant: 'compact',
  },
};

export const Detailed: Story = {
  args: {
    parentTask: authSystemTask,
    variant: 'detailed',
    showOverview: true,
    showProgress: true,
    showMetadata: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Compact Variant</h3>
        <p className="text-muted-foreground text-sm mb-4">Perfect for lists and grid views where space is limited</p>
        <ParentTaskCard parentTask={authSystemTask} variant="compact" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Default Variant</h3>
        <p className="text-muted-foreground text-sm mb-4">Balanced view with key information and overview snippet</p>
        <ParentTaskCard parentTask={authSystemTask} variant="default" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Detailed Variant</h3>
        <p className="text-muted-foreground text-sm mb-4">Full information display for dedicated parent task pages</p>
        <ParentTaskCard parentTask={authSystemTask} variant="detailed" />
      </div>
    </div>
  ),
};

export const DifferentStates: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Different Task States</h3>
      
      <div>
        <h4 className="font-medium text-muted-foreground mb-2">In Progress - Current Workflow</h4>
        <ParentTaskCard parentTask={authSystemTask} variant="default" />
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-2">To Do - Backlog</h4>
        <ParentTaskCard parentTask={rateLimitingTask} variant="default" />
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-2">Completed - Archived</h4>
        <ParentTaskCard parentTask={archivedTask} variant="default" />
      </div>
    </div>
  ),
};

export const ProgressVariations: Story = {
  render: () => {
    const noProgressTask = { ...authSystemTask, progress: { completed: 0, total: 0 } };
    const partialProgressTask = { ...authSystemTask, progress: { completed: 3, total: 7 } };
    const completedTask = { ...authSystemTask, progress: { completed: 7, total: 7 }, status: 'done' as const };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Progress Variations</h3>
        
        <div>
          <h4 className="font-medium text-muted-foreground mb-2">No Subtasks Yet</h4>
          <ParentTaskCard parentTask={noProgressTask} variant="default" />
        </div>

        <div>
          <h4 className="font-medium text-muted-foreground mb-2">Partial Progress (3/7 completed)</h4>
          <ParentTaskCard parentTask={partialProgressTask} variant="default" />
        </div>

        <div>
          <h4 className="font-medium text-muted-foreground mb-2">Completed (7/7 done)</h4>
          <ParentTaskCard parentTask={completedTask} variant="default" />
        </div>
      </div>
    );
  },
};

export const CompactGrid: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Compact Cards in Grid Layout</h3>
      <p className="text-muted-foreground text-sm mb-4">Perfect for dashboard views and parent task browsers</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ParentTaskCard 
          parentTask={authSystemTask} 
          variant="compact" 
          onClick={() => console.log('Clicked auth system')}
        />
        <ParentTaskCard 
          parentTask={rateLimitingTask} 
          variant="compact"
          onClick={() => console.log('Clicked rate limiting')}
        />
        <ParentTaskCard 
          parentTask={archivedTask} 
          variant="compact"
          onClick={() => console.log('Clicked archived task')}
        />
      </div>
    </div>
  ),
};

export const WithoutOptionalSections: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Customizable Sections</h3>
      
      <div>
        <h4 className="font-medium text-muted-foreground mb-2">No Overview</h4>
        <ParentTaskCard 
          parentTask={authSystemTask} 
          variant="default"
          showOverview={false}
        />
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-2">No Progress Bar</h4>
        <ParentTaskCard 
          parentTask={authSystemTask} 
          variant="default"
          showProgress={false}
        />
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-2">No Metadata</h4>
        <ParentTaskCard 
          parentTask={authSystemTask} 
          variant="default"
          showMetadata={false}
        />
      </div>

      <div>
        <h4 className="font-medium text-muted-foreground mb-2">Minimal View</h4>
        <ParentTaskCard 
          parentTask={authSystemTask} 
          variant="default"
          showOverview={false}
          showMetadata={false}
        />
      </div>
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => {
    const handleClick = (taskTitle: string) => {
      alert(`Clicked: ${taskTitle}`);
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Interactive Cards</h3>
        <p className="text-muted-foreground text-sm mb-4">Click on any card to see the interaction</p>
        
        <div className="space-y-3">
          <ParentTaskCard 
            parentTask={authSystemTask} 
            variant="default"
            onClick={() => handleClick(authSystemTask.title)}
          />
          <ParentTaskCard 
            parentTask={rateLimitingTask} 
            variant="default"
            onClick={() => handleClick(rateLimitingTask.title)}
          />
        </div>
      </div>
    );
  },
};

export const CLIInspiredDesign: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">CLI-Inspired Design Elements</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Notice how the UI incorporates CLI patterns: 📁 parent task icon, clear status symbols, 
        priority indicators, and progress format matching the tree view output.
      </p>
      
      {/* CLI Output Comparison */}
      <div className="bg-terminal-background text-terminal-foreground p-4 rounded-lg font-mono text-sm mb-4">
        <div className="text-muted-foreground mb-1">CLI Tree View:</div>
        <div>├── 📁 → User Authentication System [parent-001]</div>
        <div className="text-muted-foreground ml-4">• In Progress • 3/7 done • ↑ High • @alice • #security #backend</div>
      </div>

      {/* UI Component */}
      <div className="border rounded-lg p-1">
        <div className="text-muted-foreground text-sm mb-2 px-3 pt-2">UI Component Equivalent:</div>
        <ParentTaskCard parentTask={authSystemTask} variant="default" />
      </div>

      <div className="text-sm text-muted-foreground">
        <h4 className="font-medium mb-2">Design Translation:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>📁 Icon:</strong> Clearly identifies parent tasks</li>
          <li><strong>Status Symbols:</strong> → (In Progress) translated to colored badges</li>
          <li><strong>Progress Format:</strong> "3/7 done" with visual progress bar</li>
          <li><strong>Priority:</strong> ↑ High shown as inline indicator</li>
          <li><strong>Tags:</strong> #security #backend as rounded badges</li>
          <li><strong>Metadata:</strong> Clean layout preserving CLI information density</li>
        </ul>
      </div>
    </div>
  ),
};