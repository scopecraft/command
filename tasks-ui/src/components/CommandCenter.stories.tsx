import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CommandCenter, type NewTaskData, type SearchResult } from './CommandCenter';
import { Button } from './ui/button';

const meta: Meta<typeof CommandCenter> = {
  title: 'UI Components/CommandCenter',
  component: CommandCenter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Unified command center for commands, search, and task creation. Features:
- **Command Mode** (default): Shows available commands like "Search Tasks", "Create Task", "Go to Tasks"
- **Search Mode**: Access via "Search Tasks" command to search existing tasks and content
- **Create Mode**: Access via "Create Task" command to create new tasks

This approach avoids UI conflicts by keeping search separate from the command interface.
        `,
      },
    },
  },
  args: {
    open: false,
  },
};

export default meta;
type Story = StoryObj<typeof CommandCenter>;

// Mock search results for stories
const mockSearchResults: SearchResult[] = [
  {
    id: 'task-001',
    type: 'task',
    title: 'Implement user authentication',
    excerpt: 'Add login and registration functionality with JWT tokens...',
    metadata: {
      taskType: 'feature',
      status: 'in_progress',
      area: 'core',
      priority: 'high',
    },
  },
  {
    id: 'task-002',
    type: 'task',
    title: 'Fix memory leak in task processing',
    excerpt: 'Memory usage grows continuously when processing large task sets...',
    metadata: {
      taskType: 'bug',
      status: 'todo',
      area: 'core',
      priority: 'high',
    },
  },
  {
    id: 'parent-001',
    type: 'parent',
    title: 'Redesign command center UX',
    excerpt: 'Complete overhaul of command center for unified search and creation...',
    metadata: {
      taskType: 'feature',
      status: 'in_progress',
      area: 'ui',
      priority: 'high',
      subtaskCount: 8,
      completedCount: 3,
    },
  },
  {
    id: 'doc-001',
    type: 'documentation',
    title: 'API Design Guidelines',
    excerpt: 'Comprehensive guide for designing consistent REST APIs...',
    metadata: {
      section: 'Architecture',
      lastUpdated: '2025-06-14',
    },
  },
];

// Helper component for interactive demos
function CommandCenterDemo({
  defaultOpen = false,
  mockResults = mockSearchResults,
  searchLoading = false,
  createLoading = false,
  error,
}: {
  defaultOpen?: boolean;
  mockResults?: SearchResult[];
  searchLoading?: boolean;
  createLoading?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [lastCreated, setLastCreated] = useState<NewTaskData | null>(null);
  const [lastSelected, setLastSelected] = useState<SearchResult | null>(null);

  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!query.trim()) return [];

    // Simple fuzzy search simulation
    return mockResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.excerpt.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleTaskCreate = async (task: NewTaskData) => {
    console.log('Task created:', task);
    setLastCreated(task);
    if (!createLoading) {
      setOpen(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    console.log('Result selected:', result);
    setLastSelected(result);
    setOpen(false);
  };

  return (
    <div className="space-y-4 min-w-[500px]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">CommandCenter Demo</h3>
        <Button onClick={() => setOpen(true)}>Open CommandCenter (⌘K)</Button>
      </div>

      <CommandCenter
        open={open}
        onOpenChange={setOpen}
        onSearch={handleSearch}
        onTaskCreate={handleTaskCreate}
        onResultSelect={handleResultSelect}
        isSearchLoading={searchLoading}
        isCreateLoading={createLoading}
        error={error}
      />

      {/* Demo output */}
      <div className="grid gap-4">
        {lastSelected && (
          <div className="p-4 border rounded-md bg-card">
            <h4 className="font-medium mb-2">Last Selected Result:</h4>
            <div className="text-sm space-y-1">
              <div>
                <strong>Type:</strong> {lastSelected.type}
              </div>
              <div>
                <strong>Title:</strong> {lastSelected.title}
              </div>
              <div>
                <strong>ID:</strong> {lastSelected.id}
              </div>
            </div>
          </div>
        )}

        {lastCreated && (
          <div className="p-4 border rounded-md bg-card">
            <h4 className="font-medium mb-2">Last Created Task:</h4>
            <pre className="text-sm">{JSON.stringify(lastCreated, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export const Closed: Story = {
  render: () => <CommandCenterDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Default closed state with button to demonstrate opening behavior.',
      },
    },
  },
};

export const SearchMode: Story = {
  render: () => <CommandCenterDemo defaultOpen={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Default command interface. Use "Search Tasks" command to access search functionality.',
      },
    },
  },
};

export const CreateTask: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-md bg-muted">
          <h4 className="font-medium mb-2">Create Task Flow</h4>
          <p className="text-sm text-muted-foreground">
            Click "Create Task" in search results to access task creation.
          </p>
        </div>

        <CommandCenter
          open={open}
          onOpenChange={setOpen}
          onSearch={async () => []} // Empty search to show commands
          onTaskCreate={async (task) => {
            console.log('Task created:', task);
            setOpen(false);
          }}
          onResultSelect={(result) => {
            if (result.id === 'create-task') {
              console.log('Opening create task form');
            }
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Task creation accessed via "Create Task" command in search results.',
      },
    },
  },
};

export const WithSearchResults: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-md bg-muted">
          <h4 className="font-medium mb-2">Search Results Demo</h4>
          <p className="text-sm text-muted-foreground">
            Opens with command list. Click "Search Tasks" to see search functionality. Try searching
            for: "authentication", "memory", "API", "command", or "test"
          </p>
        </div>

        <CommandCenter
          open={open}
          onOpenChange={setOpen}
          onSearch={async (query) => {
            console.log('Searching for:', query);
            await new Promise((resolve) => setTimeout(resolve, 300));
            const results = mockSearchResults.filter(
              (result) =>
                result.title.toLowerCase().includes(query.toLowerCase()) ||
                result.excerpt.toLowerCase().includes(query.toLowerCase())
            );
            console.log('Found results:', results);
            return results;
          }}
          onTaskCreate={async (task) => {
            console.log('Task created:', task);
            setOpen(false);
          }}
          onResultSelect={(result) => {
            if (result.type === 'command') {
              console.log('Command selected:', result.id);
              if (result.id !== 'search-tasks' && result.id !== 'create-task') {
                setOpen(false);
              }
            } else {
              console.log('Selected result:', result);
              setOpen(false);
            }
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Command center now starts with commands. Search is accessed via "Search Tasks" command.',
      },
    },
  },
};

export const SearchLoading: Story = {
  render: () => <CommandCenterDemo defaultOpen={true} searchLoading={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Loading state while search request is in progress.',
      },
    },
  },
};

export const CreateLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <CommandCenter
        open={open}
        onOpenChange={setOpen}
        onSearch={async () => []}
        onTaskCreate={async () => {
          // Never resolves to show loading state
          await new Promise(() => {});
        }}
        onResultSelect={() => {}}
        initialQuery="+"
        isCreateLoading={true}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while creating a new task.',
      },
    },
  },
};

export const ErrorState: Story = {
  render: () => (
    <CommandCenterDemo defaultOpen={true} error="Failed to search tasks. Please try again." />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error state with user-friendly error message.',
      },
    },
  },
};

export const EmptySearch: Story = {
  render: () => <CommandCenterDemo defaultOpen={true} mockResults={[]} />,
  parameters: {
    docs: {
      description: {
        story: 'Empty state when search returns no results.',
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  render: () => <CommandCenterDemo defaultOpen={true} />,
  parameters: {
    docs: {
      description: {
        story: `
**Keyboard Navigation:**
- **Search Mode**: Type to search, ↑↓ to navigate, Enter to select
- **Create Mode**: Type '+' then task type shortcuts (F, B, C, D, T, S)
- **Command Mode**: Type '>' then command shortcuts
- **Escape**: Close dialog
- **Backspace**: Clear prefix to return to search mode
        `,
      },
    },
  },
};

export const ModeTransitions: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-md bg-muted">
          <h4 className="font-medium mb-2">Mode Transition Demo</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Try typing different prefixes to see mode transitions:
          </p>
          <div className="space-y-1 text-sm">
            <div>
              <strong>No prefix:</strong> Search mode (default)
            </div>
            <div>
              <strong>Type +</strong> Switch to create task mode
            </div>
            <div>
              <strong>Type &gt;</strong> Switch to command mode
            </div>
            <div>
              <strong>Backspace on prefix:</strong> Return to search mode
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded text-xs">
            <strong>Fixed:</strong> Mode switching now works correctly - typing + will switch to
            create mode instead of searching for "+".
          </div>
        </div>

        <CommandCenter
          open={open}
          onOpenChange={setOpen}
          onSearch={async () => mockSearchResults}
          onTaskCreate={async (task) => console.log('Task created:', task)}
          onResultSelect={(result) => console.log('Selected:', result)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showing smooth transitions between different modes. Fixed mode switching behavior.',
      },
    },
  },
};
