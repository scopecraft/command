import type { Meta, StoryObj } from '@storybook/react';
import { WorkflowStateBadge, StatusBadge, PriorityIndicator } from './WorkflowStateBadge';

const meta: Meta<typeof WorkflowStateBadge> = {
  title: 'V2 Components/Badges',
  component: WorkflowStateBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge components for workflow states, task status, and priority indicators based on CLI visual patterns.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkflowStates: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Workflow State Badges</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <WorkflowStateBadge workflow="backlog" />
          <span className="text-muted-foreground">Tasks waiting to be started</span>
        </div>
        
        <div className="flex items-center gap-3">
          <WorkflowStateBadge workflow="current" />
          <span className="text-muted-foreground">Active work in progress</span>
        </div>
        
        <div className="flex items-center gap-3">
          <WorkflowStateBadge workflow="archive" />
          <span className="text-muted-foreground">Completed or abandoned work</span>
        </div>
      </div>

      <h4 className="text-md font-semibold mt-6 mb-3">Sizes</h4>
      <div className="space-y-2">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex items-center gap-3">
            <span className="w-8 text-sm">{size}</span>
            <WorkflowStateBadge workflow="backlog" size={size} />
            <WorkflowStateBadge workflow="current" size={size} />
            <WorkflowStateBadge workflow="archive" size={size} />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const TaskStatuses: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Task Status Badges</h3>
      <p className="text-muted-foreground mb-4">Based on CLI status symbols: ✓ Done, → In Progress, ○ To Do, ⊗ Blocked, ⊙ Archived</p>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <StatusBadge status="todo" />
          <span className="text-muted-foreground">Ready to be worked on</span>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status="in_progress" />
          <span className="text-muted-foreground">Currently being worked on</span>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status="done" />
          <span className="text-muted-foreground">Work completed successfully</span>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status="blocked" />
          <span className="text-muted-foreground">Cannot proceed due to dependencies</span>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status="archived" />
          <span className="text-muted-foreground">No longer relevant or canceled</span>
        </div>
      </div>

      <h4 className="text-md font-semibold mt-6 mb-3">Sizes</h4>
      <div className="space-y-2">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex items-center gap-3">
            <span className="w-8 text-sm">{size}</span>
            <StatusBadge status="todo" size={size} />
            <StatusBadge status="in_progress" size={size} />
            <StatusBadge status="done" size={size} />
            <StatusBadge status="blocked" size={size} />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const PriorityIndicators: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Priority Indicators</h3>
      <p className="text-muted-foreground mb-4">Following CLI pattern: ↑ High, ↓ Low (Medium priority is omitted)</p>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <PriorityIndicator priority="highest" />
          <span className="text-muted-foreground">Urgent work that blocks others</span>
        </div>
        
        <div className="flex items-center gap-3">
          <PriorityIndicator priority="high" />
          <span className="text-muted-foreground">Important work with deadline pressure</span>
        </div>
        
        <div className="flex items-center gap-3">
          <PriorityIndicator priority="medium" />
          <span className="text-muted-foreground">Medium priority (not shown, following CLI pattern)</span>
        </div>
        
        <div className="flex items-center gap-3">
          <PriorityIndicator priority="low" />
          <span className="text-muted-foreground">Nice-to-have, can be deferred</span>
        </div>
      </div>

      <h4 className="text-md font-semibold mt-6 mb-3">Inline Usage</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span>Task with</span>
          <PriorityIndicator priority="high" inline />
          <span>priority needs attention</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>This</span>
          <PriorityIndicator priority="low" inline />
          <span>priority task can wait</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>🔥 Critical</span>
          <PriorityIndicator priority="highest" inline />
          <span>issue blocking deployment</span>
        </div>
      </div>
    </div>
  ),
};

export const CombinedUsage: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Combined Badge Usage</h3>
      <p className="text-muted-foreground mb-4">Examples of how badges work together in task displays</p>
      
      <div className="space-y-4">
        {/* Task examples */}
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Fix authentication bug</span>
          </div>
          <div className="flex items-center gap-2">
            <WorkflowStateBadge workflow="current" size="sm" />
            <StatusBadge status="in_progress" size="sm" />
            <PriorityIndicator priority="high" size="sm" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Update documentation</span>
          </div>
          <div className="flex items-center gap-2">
            <WorkflowStateBadge workflow="backlog" size="sm" />
            <StatusBadge status="todo" size="sm" />
            <PriorityIndicator priority="low" size="sm" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Database migration completed</span>
          </div>
          <div className="flex items-center gap-2">
            <WorkflowStateBadge workflow="archive" size="sm" />
            <StatusBadge status="done" size="sm" />
            {/* No priority shown for medium */}
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Setup CI/CD pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <WorkflowStateBadge workflow="current" size="sm" />
            <StatusBadge status="blocked" size="sm" />
            <PriorityIndicator priority="highest" size="sm" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const CLIInspiredLayout: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">CLI-Inspired Task Layout</h3>
      <p className="text-muted-foreground mb-4">Mimicking the clean CLI tree view with modern UI elements</p>
      
      <div className="font-mono text-sm bg-terminal-background text-terminal-foreground p-4 rounded-lg">
        <div className="space-y-1">
          <div className="text-muted-foreground">CURRENT:</div>
          <div className="ml-2">
            <div className="flex items-center gap-2 mb-1">
              <span>├── 📁 ✓ User Authentication System [parent-001]</span>
            </div>
            <div className="ml-4 text-muted-foreground">• In Progress • 3/7 done • ↑ High • @alice • #security</div>
          </div>
          <div className="ml-2">
            <div className="flex items-center gap-2 mb-1">
              <span>└── 🐛 → Fix login redirect bug [task-002]</span>
            </div>
            <div className="ml-4 text-muted-foreground">• In Progress • ↑ High • @bob • #bugfix</div>
          </div>
        </div>
      </div>

      <div className="text-sm">
        <div className="space-y-3 bg-card border rounded-lg p-4">
          <div className="font-semibold">CURRENT:</div>
          <div className="ml-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">├──</span>
                <span>📁</span>
                <span className="font-mono text-green-600">✓</span>
                <span className="font-medium">User Authentication System</span>
                <span className="text-muted-foreground">[parent-001]</span>
              </div>
              <div className="ml-8 flex items-center gap-2 text-sm">
                <StatusBadge status="in_progress" size="sm" />
                <span className="text-muted-foreground">• 3/7 done</span>
                <PriorityIndicator priority="high" inline />
                <span className="text-muted-foreground">• @alice • #security</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">└──</span>
                <span>🐛</span>
                <span className="font-mono text-blue-600">→</span>
                <span className="font-medium">Fix login redirect bug</span>
                <span className="text-muted-foreground">[task-002]</span>
              </div>
              <div className="ml-8 flex items-center gap-2 text-sm">
                <StatusBadge status="in_progress" size="sm" />
                <PriorityIndicator priority="high" inline />
                <span className="text-muted-foreground">• @bob • #bugfix</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};