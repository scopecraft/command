import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ParentTaskCard } from './ParentTaskCard';
import { SubtaskList } from './SubtaskList';
import { TaskTypeIcon } from './TaskTypeIcon';
import { WorkflowStateBadge, StatusBadge, PriorityIndicator } from './WorkflowStateBadge';
import { mockV2ParentTasks, mockV2Subtasks, mockV2SimpleTasks } from '../../lib/api/mock-data-v2';

const meta: Meta = {
  title: 'V2 Components/Design System Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Updated V2 components following the established design system with proper Button usage, theme colors, and JetBrains Mono typography.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DesignSystemComparison: Story = {
  render: () => {
    const parentTask = mockV2ParentTasks[0];
    const subtasks = mockV2Subtasks.filter(task => task.parent_task === 'parent-001');

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold font-mono">V2 Components - Design System Integration</h1>
            <p className="text-muted-foreground font-mono mt-1">
              Now properly using Button components, theme colors, and established patterns
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {/* Design System Elements */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono mb-4">Design System Elements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Typography */}
              <div>
                <h3 className="font-mono font-medium mb-3">Typography</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-mono">JetBrains Mono (monospace)</div>
                  <div className="text-muted-foreground font-mono">Muted text</div>
                  <div className="font-mono font-medium">Font weights</div>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="font-mono font-medium mb-3">Theme Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
                    <span className="font-mono text-sm">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: 'hsl(var(--muted))' }}></div>
                    <span className="font-mono text-sm">Muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: 'hsl(var(--accent))' }}></div>
                    <span className="font-mono text-sm">Accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: 'hsl(var(--card))' }}></div>
                    <span className="font-mono text-sm">Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: 'hsl(var(--border))' }}></div>
                    <span className="font-mono text-sm">Border</span>
                  </div>
                </div>
              </div>

              {/* Components */}
              <div>
                <h3 className="font-mono font-medium mb-3">Reused Components</h3>
                <div className="space-y-2">
                  <StatusBadge status="in_progress" />
                  <WorkflowStateBadge workflow="current" />
                  <PriorityIndicator priority="high" />
                </div>
              </div>
            </div>
          </div>

          {/* Parent Task Card */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono mb-4">Parent Task Card (Using Design System)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-mono font-medium mb-3">Compact Variant</h3>
                <ParentTaskCard 
                  parentTask={parentTask}
                  variant="compact"
                  onClick={() => console.log('Card clicked')}
                />
              </div>
              
              <div>
                <h3 className="font-mono font-medium mb-3">Default Variant</h3>
                <ParentTaskCard 
                  parentTask={parentTask}
                  variant="default"
                  onClick={() => console.log('Card clicked')}
                />
              </div>
            </div>
          </div>

          {/* Subtask List */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono mb-4">Subtask Tree View (CLI-Inspired)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-mono font-medium mb-3">Compact Tree</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <SubtaskList 
                    subtasks={subtasks}
                    variant="compact"
                    onTaskClick={(task) => console.log('Subtask clicked:', task.title)}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-mono font-medium mb-3">Full Tree View</h3>
                <SubtaskList 
                  subtasks={subtasks.slice(0, 4)}
                  variant="tree"
                  onTaskClick={(task) => console.log('Subtask clicked:', task.title)}
                />
              </div>
            </div>
          </div>

          {/* CLI Comparison */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono mb-4">CLI vs UI Comparison</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CLI Output */}
              <div>
                <h3 className="font-mono font-medium mb-3">CLI Tree Output</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                  <div className="text-slate-400 mb-2">CURRENT:</div>
                  <div className="space-y-1">
                    <div>├── 📁 → User Authentication System [parent-001]</div>
                    <div className="ml-4 text-slate-300">• In Progress • 3/7 done • ↑ High • #security</div>
                    <div className="ml-2">├── ✓ Setup database schema [01]</div>
                    <div className="ml-2">├── → Password hashing [02]</div>
                    <div className="ml-2">├─┬ [Parallel execution - 04]</div>
                    <div className="ml-4">│ ├─ ○ Login endpoint [04a]</div>
                    <div className="ml-4">│ └─ ○ Logout endpoint [04b]</div>
                    <div className="ml-2">└── ⊗ Session management [05]</div>
                  </div>
                </div>
              </div>

              {/* UI Equivalent */}
              <div>
                <h3 className="font-mono font-medium mb-3">UI Component</h3>
                <div className="space-y-4">
                  <ParentTaskCard 
                    parentTask={parentTask}
                    variant="compact"
                  />
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <SubtaskList 
                      subtasks={subtasks.slice(0, 4)}
                      variant="compact"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-mono font-medium mb-2">Design Improvements</h4>
              <ul className="font-mono text-sm space-y-1 text-muted-foreground">
                <li>✓ Uses established Button component with outline variant</li>
                <li>✓ Consistent theme colors (bg-card, text-muted-foreground, etc.)</li>
                <li>✓ JetBrains Mono font throughout for consistency</li>
                <li>✓ Proper hover states (bg-accent/50)</li>
                <li>✓ CLI symbols preserved (✓ → ○ ⊗)</li>
                <li>✓ Interactive badges reuse Button when needed</li>
                <li>✓ Spacing and layout follow design system patterns</li>
              </ul>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono mb-4">Interactive Demo</h2>
            <p className="font-mono text-muted-foreground mb-4">
              Click on cards and badges to see interactions
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status="in_progress" interactive onClick={() => alert('Status clicked!')} />
                <WorkflowStateBadge workflow="current" interactive onClick={() => alert('Workflow clicked!')} />
                <PriorityIndicator priority="high" interactive onClick={() => alert('Priority clicked!')} />
              </div>

              <ParentTaskCard 
                parentTask={parentTask}
                variant="compact"
                onClick={() => alert('Parent task clicked!')}
              />
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <SubtaskList 
                  subtasks={subtasks.slice(0, 3)}
                  variant="compact"
                  onTaskClick={(task) => alert(`Subtask clicked: ${task.title}`)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};