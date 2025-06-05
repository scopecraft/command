import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button';
import { CommandPalette, type NewTaskData } from './command-palette';

const meta: Meta<typeof CommandPalette> = {
  title: 'UI Components/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A two-step command palette for creating tasks. Select type → Enter title.',
      },
    },
  },
  args: {
    open: false,
    isLoading: false,
    error: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

// Helper component for interactive stories
function CommandPaletteDemo({
  defaultOpen = false,
  isLoading = false,
  error,
}: {
  defaultOpen?: boolean;
  isLoading?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [lastCreated, setLastCreated] = useState<NewTaskData | null>(null);

  const handleTaskCreate = (task: NewTaskData) => {
    console.log('Task created:', task);
    setLastCreated(task);
    if (!isLoading) {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Open Command Palette (⌘K)</Button>

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onTaskCreate={handleTaskCreate}
        isLoading={isLoading}
        error={error}
      />

      {lastCreated && (
        <div className="p-4 border rounded-md bg-muted">
          <h3 className="font-medium mb-2">Last Created Task:</h3>
          <pre className="text-sm">{JSON.stringify(lastCreated, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <CommandPaletteDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Closed state with button to open the command palette.',
      },
    },
  },
};

export const Open: Story = {
  render: () => <CommandPaletteDemo defaultOpen={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Type selection view - first step of the flow. Use keyboard shortcuts (F, B, C, D, T, S) or click.',
      },
    },
  },
};

export const TitleInput: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [step, setStep] = useState<'type' | 'title'>('title');

    // Hack to show title input step
    if (step === 'type') {
      setTimeout(() => setStep('title'), 100);
    }

    return (
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onTaskCreate={(task) => {
          console.log('Task created:', task);
          setOpen(false);
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Second step - title input view after selecting a task type.',
      },
    },
  },
};

export const WithKeyboardNav: Story = {
  render: () => <CommandPaletteDemo defaultOpen={true} />,
  parameters: {
    docs: {
      description: {
        story: `
Keyboard shortcuts available:
- **F** - Create Feature
- **B** - Create Bug  
- **C** - Create Chore
- **D** - Create Documentation
- **T** - Create Test
- **S** - Create Spike
- **Escape** - Close dialog
- **Enter** - Submit title
        `,
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => <CommandPaletteDemo defaultOpen={true} isLoading={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Loading state while creating a task. Input is disabled and button shows loading spinner.',
      },
    },
  },
};

export const ErrorState: Story = {
  render: () => (
    <CommandPaletteDemo defaultOpen={true} error="Failed to create task. Please try again." />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error state with validation message displayed.',
      },
    },
  },
};

export const AllTaskTypes: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [tasks, setTasks] = useState<NewTaskData[]>([]);

    const handleTaskCreate = (task: NewTaskData) => {
      console.log('Task created:', task);
      setTasks([...tasks, task]);
      setOpen(false);
    };

    return (
      <div className="space-y-4 min-w-[400px]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Task Creation Demo</h3>
          <Button onClick={() => setOpen(true)}>Create Task (⌘K)</Button>
        </div>

        <CommandPalette open={open} onOpenChange={setOpen} onTaskCreate={handleTaskCreate} />

        {tasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Created Tasks ({tasks.length})
            </h4>
            {tasks.map((task, index) => (
              <div
                key={`${task.type}-${task.title}-${index}`}
                className="p-3 border rounded-md bg-card text-sm space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{task.type}</span>
                </div>
                {task.isParent && (
                  <div className="text-xs text-muted-foreground">Parent task (with subtasks)</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing all task types and created tasks list.',
      },
    },
  },
};
