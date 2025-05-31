import type { Meta, StoryObj } from '@storybook/react';
import { SubtaskList } from './SubtaskList';
import { mockV2Subtasks } from '../../lib/api/mock-data-v2';
import type { Task } from '../../lib/types';

const meta: Meta<typeof SubtaskList> = {
  title: 'V2 Components/SubtaskList',
  component: SubtaskList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tree-style list component for displaying subtasks with sequence numbers, parallel execution indicators, and CLI-inspired formatting.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['tree', 'flat', 'compact'],
    },
    showSequence: {
      control: { type: 'boolean' },
    },
    showParallel: {
      control: { type: 'boolean' },
    },
    showMetadata: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Filter subtasks that belong to parent-001 (User Authentication System)
const authSubtasks = mockV2Subtasks.filter(task => task.parent_task === 'parent-001');

export const TreeView: Story = {
  args: {
    subtasks: authSubtasks,
    variant: 'tree',
    showSequence: true,
    showParallel: true,
    showMetadata: true,
  },
};

export const CompactView: Story = {
  args: {
    subtasks: authSubtasks,
    variant: 'compact',
    showSequence: true,
    showParallel: true,
    showMetadata: true,
  },
};

export const FlatView: Story = {
  args: {
    subtasks: authSubtasks,
    variant: 'flat',
    showSequence: true,
    showParallel: false,
    showMetadata: true,
  },
};

export const EmptyState: Story = {
  args: {
    subtasks: [],
    variant: 'tree',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Tree View (Default)</h3>
        <p className="text-gray-600 text-sm mb-4">
          Full tree structure with visual hierarchy, perfect for detailed parent task pages
        </p>
        <div className="border rounded-lg p-4">
          <SubtaskList 
            subtasks={authSubtasks} 
            variant="tree"
            onTaskClick={(task) => console.log('Clicked:', task.title)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Compact View</h3>
        <p className="text-gray-600 text-sm mb-4">
          CLI-inspired compact tree, great for sidebars and overview sections
        </p>
        <div className="border rounded-lg p-4 bg-gray-50">
          <SubtaskList 
            subtasks={authSubtasks} 
            variant="compact"
            onTaskClick={(task) => console.log('Clicked:', task.title)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Flat View</h3>
        <p className="text-gray-600 text-sm mb-4">
          Simple list format when hierarchy isn't needed
        </p>
        <div className="border rounded-lg p-4">
          <SubtaskList 
            subtasks={authSubtasks} 
            variant="flat"
            onTaskClick={(task) => console.log('Clicked:', task.title)}
          />
        </div>
      </div>
    </div>
  ),
};

export const ParallelTasksShowcase: Story = {
  render: () => {
    // Create a focused example with parallel tasks
    const parallelExample: Task[] = [
      mockV2Subtasks.find(t => t.sequence === '01')!, // Database schema
      mockV2Subtasks.find(t => t.sequence === '02')!, // Password hashing
      mockV2Subtasks.find(t => t.sequence === '04a')!, // Login endpoint
      mockV2Subtasks.find(t => t.sequence === '04b')!, // Logout endpoint
      mockV2Subtasks.find(t => t.sequence === '05')!, // Session management
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Parallel Execution Visualization</h3>
          <p className="text-gray-600 text-sm mb-4">
            Tasks 04a and 04b can be worked on in parallel (same sequence number with letter suffixes)
          </p>
        </div>

        {/* CLI comparison */}
        <div>
          <h4 className="font-medium mb-2">CLI Tree Output:</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
            <div>├── ✓ Setup authentication database schema [01]</div>
            <div>├── → Add password hashing middleware [02]</div>
            <div>├─┬ [Parallel execution - sequence 04]</div>
            <div>│ ├─ ○ Create login endpoint [04a]</div>
            <div>│ └─ ○ Create logout endpoint [04b]</div>
            <div>└── ⊗ Add session management [05]</div>
          </div>
        </div>

        {/* UI equivalent */}
        <div>
          <h4 className="font-medium mb-2">UI Component:</h4>
          <div className="border rounded-lg p-4">
            <SubtaskList 
              subtasks={parallelExample} 
              variant="tree"
              showParallel={true}
              onTaskClick={(task) => console.log('Clicked:', task.title)}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const SequenceOrdering: Story = {
  render: () => {
    // Create tasks with different sequence patterns
    const sequenceExample: Task[] = [
      {
        id: 'seq-01',
        title: 'First step - Foundation',
        type: 'task',
        status: 'done',
        priority: 'high',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '01',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['foundation'],
        content: '',
      },
      {
        id: 'seq-02a',
        title: 'Parallel task A',
        type: 'task',
        status: 'in_progress',
        priority: 'high',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '02a',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['parallel'],
        content: '',
      },
      {
        id: 'seq-02b',
        title: 'Parallel task B',
        type: 'task',
        status: 'todo',
        priority: 'high',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '02b',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['parallel'],
        content: '',
      },
      {
        id: 'seq-02c',
        title: 'Parallel task C',
        type: 'task',
        status: 'todo',
        priority: 'medium',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '02c',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['parallel'],
        content: '',
      },
      {
        id: 'seq-03',
        title: 'Final step - Integration',
        type: 'task',
        status: 'todo',
        priority: 'high',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '03',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['integration'],
        content: '',
      },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Sequence Number Patterns</h3>
        <p className="text-gray-600 text-sm mb-4">
          Demonstrates how different sequence patterns are handled: 01 → 02a/02b/02c (parallel) → 03
        </p>
        
        <div className="border rounded-lg p-4">
          <SubtaskList 
            subtasks={sequenceExample}
            variant="tree"
            onTaskClick={(task) => console.log('Sequence:', task.sequence, 'Task:', task.title)}
          />
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Sequence Logic:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>01:</strong> Single sequential task</li>
            <li><strong>02a, 02b, 02c:</strong> Three parallel tasks (same base sequence "02")</li>
            <li><strong>03:</strong> Final task that can only start after sequence 02 is complete</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const DifferentTaskTypes: Story = {
  render: () => {
    const mixedTypes: Task[] = [
      {
        id: 'type-01',
        title: 'Implement core feature',
        type: 'feature',
        status: 'done',
        priority: 'high',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '01',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['core'],
        content: '',
      },
      {
        id: 'type-02',
        title: 'Fix critical bug',
        type: 'bug',
        status: 'in_progress',
        priority: 'highest',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '02',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['critical'],
        content: '',
      },
      {
        id: 'type-03',
        title: 'Write documentation',
        type: 'documentation',
        status: 'todo',
        priority: 'low',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '03',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['docs'],
        content: '',
      },
      {
        id: 'type-04',
        title: 'Add unit tests',
        type: 'test',
        status: 'todo',
        priority: 'medium',
        workflow_state: 'current',
        parent_task: 'demo',
        sequence: '04',
        created_date: '2025-05-29',
        updated_date: '2025-05-29',
        tags: ['testing'],
        content: '',
      },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Mixed Task Types</h3>
        <p className="text-gray-600 text-sm mb-4">
          Different task types with their corresponding icons and priority levels
        </p>
        
        <div className="border rounded-lg p-4">
          <SubtaskList 
            subtasks={mixedTypes}
            variant="tree"
            onTaskClick={(task) => console.log('Type:', task.type, 'Task:', task.title)}
          />
        </div>
      </div>
    );
  },
};

export const ConfigurableOptions: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Configurable Display Options</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-2">Without Sequence Numbers</h4>
          <div className="border rounded-lg p-3">
            <SubtaskList 
              subtasks={authSubtasks.slice(0, 3)}
              variant="tree"
              showSequence={false}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Without Parallel Grouping</h4>
          <div className="border rounded-lg p-3">
            <SubtaskList 
              subtasks={authSubtasks.slice(0, 3)}
              variant="tree"
              showParallel={false}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Without Metadata</h4>
          <div className="border rounded-lg p-3">
            <SubtaskList 
              subtasks={authSubtasks.slice(0, 3)}
              variant="tree"
              showMetadata={false}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Minimal View</h4>
          <div className="border rounded-lg p-3">
            <SubtaskList 
              subtasks={authSubtasks.slice(0, 3)}
              variant="tree"
              showSequence={false}
              showMetadata={false}
              showParallel={false}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveDemo: Story = {
  render: () => {
    const handleTaskClick = (task: Task) => {
      alert(`Clicked task: ${task.title}\nSequence: ${task.sequence}\nStatus: ${task.status}`);
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Interactive Subtask List</h3>
        <p className="text-gray-600 text-sm mb-4">
          Click on any subtask to see the interaction
        </p>
        
        <div className="border rounded-lg p-4">
          <SubtaskList 
            subtasks={authSubtasks}
            variant="tree"
            onTaskClick={handleTaskClick}
          />
        </div>
      </div>
    );
  },
};