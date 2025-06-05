import { Bug, FileText, Hammer, Lightbulb, Loader2, TestTube2, Zap } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './command';

export type TaskType = 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike';

export interface NewTaskData {
  title: string;
  type: TaskType;
  template?: string;
  isParent?: boolean;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: NewTaskData) => void;
  isLoading?: boolean;
  error?: string;
}

const taskTypes = [
  {
    type: 'feature' as TaskType,
    label: 'Feature',
    icon: Zap,
    shortcut: 'F',
    description: 'New functionality or enhancement',
  },
  {
    type: 'bug' as TaskType,
    label: 'Bug',
    icon: Bug,
    shortcut: 'B',
    description: "Something isn't working",
  },
  {
    type: 'chore' as TaskType,
    label: 'Chore',
    icon: Hammer,
    shortcut: 'C',
    description: 'Maintenance or refactoring',
  },
  {
    type: 'documentation' as TaskType,
    label: 'Documentation',
    icon: FileText,
    shortcut: 'D',
    description: 'Documentation improvements',
  },
  {
    type: 'test' as TaskType,
    label: 'Test',
    icon: TestTube2,
    shortcut: 'T',
    description: 'Test coverage improvements',
  },
  {
    type: 'spike' as TaskType,
    label: 'Spike',
    icon: Lightbulb,
    shortcut: 'S',
    description: 'Research or investigation',
  },
];

export function CommandPalette({
  open,
  onOpenChange,
  onTaskCreate,
  isLoading = false,
  error,
}: CommandPaletteProps) {
  const [step, setStep] = React.useState<'type' | 'title'>('type');
  const [selectedType, setSelectedType] = React.useState<TaskType | null>(null);
  const [title, setTitle] = React.useState('');
  const [isParent, setIsParent] = React.useState(false);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setStep('type');
      setSelectedType(null);
      setTitle('');
      setIsParent(false);
    }
  }, [open]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!open || step !== 'type') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const taskType = taskTypes.find((t) => t.shortcut === key);

      if (taskType) {
        e.preventDefault();
        setSelectedType(taskType.type);
        setStep('title');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, step]);

  const handleTypeSelect = (type: TaskType) => {
    setSelectedType(type);
    setStep('title');
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && selectedType) {
      onTaskCreate({
        title: title.trim(),
        type: selectedType,
        isParent,
      });
    }
  };

  const selectedTaskType = taskTypes.find((t) => t.type === selectedType);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      {step === 'type' ? (
        <>
          <CommandInput placeholder="Select task type..." />
          <CommandList>
            <CommandEmpty>No task types found.</CommandEmpty>
            <CommandGroup heading="Task Types">
              {taskTypes.map((taskType) => (
                <CommandItem
                  key={taskType.type}
                  onSelect={() => handleTypeSelect(taskType.type)}
                  className="flex items-center gap-3"
                >
                  <taskType.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{taskType.label}</div>
                    <div className="text-xs text-muted-foreground">{taskType.description}</div>
                  </div>
                  <CommandShortcut>{taskType.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </>
      ) : (
        <form onSubmit={handleTitleSubmit} className="p-4">
          <div className="flex items-center gap-3 mb-4">
            {selectedTaskType && (
              <>
                <selectedTaskType.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{selectedTaskType.label}</span>
              </>
            )}
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            className={cn(
              'w-full px-3 py-2 text-sm rounded-md',
              'bg-background border border-input',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            disabled={isLoading}
          />

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="isParent"
              checked={isParent}
              onChange={(e) => setIsParent(e.target.checked)}
              className="h-4 w-4"
              disabled={isLoading}
            />
            <label htmlFor="isParent" className="text-sm text-muted-foreground">
              Create as parent task (with subtasks)
            </label>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setStep('type')}
              className={cn(
                'px-3 py-1 text-sm rounded-md',
                'bg-secondary text-secondary-foreground',
                'hover:bg-secondary/80'
              )}
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className={cn(
                'px-3 py-1 text-sm rounded-md',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'inline-flex items-center gap-2'
              )}
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      )}
    </CommandDialog>
  );
}
