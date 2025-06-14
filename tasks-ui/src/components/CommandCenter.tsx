import { getTypeValues } from '@core/metadata/schema-service';
import { FileText, Folder, Loader2, Plus, Search, Terminal, Users } from 'lucide-react';
import * as React from 'react';
import { generateTypeIconMapping } from '../lib/schema-client';
import { cn } from '../lib/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './ui/command';

// Types
export type TaskType = 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike' | 'idea';

export interface NewTaskData {
  title: string;
  type: TaskType;
  template?: string;
  isParent?: boolean;
}

export interface SearchResult {
  id: string;
  type: 'task' | 'parent' | 'documentation' | 'command';
  title: string;
  excerpt: string;
  metadata?: {
    taskType?: TaskType;
    status?: string;
    area?: string;
    priority?: string;
    subtaskCount?: number;
    completedCount?: number;
    section?: string;
    lastUpdated?: string;
  };
}

export interface CommandCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onTaskCreate: (task: NewTaskData) => Promise<void>;
  onResultSelect: (result: SearchResult) => void;
  isSearchLoading?: boolean;
  isCreateLoading?: boolean;
  error?: string;
  initialQuery?: string;
}

// Helper functions - kept for future use if needed
// function detectMode(query: string): CommandCenterMode {
//   return 'search';
// }

function getTaskTypesFromSchema() {
  const typeValues = getTypeValues();
  const iconMapping = generateTypeIconMapping();

  // Generate keyboard shortcuts
  const shortcuts = new Map<string, string>();
  const used = new Set<string>();

  for (const type of typeValues) {
    const firstLetter = type.label.charAt(0).toUpperCase();
    if (!used.has(firstLetter)) {
      shortcuts.set(type.name, firstLetter);
      used.add(firstLetter);
    }
  }

  return typeValues.map((type: any) => ({
    type: type.name as TaskType,
    label: type.label,
    icon: iconMapping[type.name],
    shortcut: shortcuts.get(type.name) || type.name.charAt(0).toUpperCase(),
    description: `${type.label} task`,
  }));
}

// System commands that appear by default
const systemCommands = [
  {
    id: 'search-tasks',
    title: 'Search Tasks',
    description: 'Search tasks, documentation, and content',
    shortcut: 'S',
    icon: Search,
  },
  {
    id: 'create-task',
    title: 'Create Task',
    description: 'Create a new task',
    shortcut: 'C',
    icon: Plus,
  },
  {
    id: 'navigate-tasks',
    title: 'Go to Tasks',
    description: 'Navigate to the tasks overview',
    shortcut: 'T',
    icon: FileText,
  },
  {
    id: 'navigate-parents',
    title: 'Go to Parent Tasks',
    description: 'Navigate to parent tasks view',
    shortcut: 'P',
    icon: Folder,
  },
];

function getResultIcon(result: SearchResult) {
  switch (result.type) {
    case 'task':
      return FileText;
    case 'parent':
      return Folder;
    case 'documentation':
      return FileText;
    case 'command':
      return Terminal;
    default:
      return FileText;
  }
}

function formatResultMetadata(result: SearchResult): string {
  const { metadata } = result;
  if (!metadata) return '';

  const parts: string[] = [];

  if (metadata.taskType) parts.push(metadata.taskType);
  if (metadata.status) parts.push(metadata.status);
  if (metadata.area) parts.push(metadata.area);
  if (metadata.priority) parts.push(metadata.priority);

  if (metadata.subtaskCount && metadata.completedCount !== undefined) {
    parts.push(`${metadata.completedCount}/${metadata.subtaskCount} complete`);
  }

  if (metadata.section) parts.push(metadata.section);
  if (metadata.lastUpdated) parts.push(`Updated ${metadata.lastUpdated}`);

  return parts.join(' • ');
}

export function CommandCenter({
  open,
  onOpenChange,
  onSearch,
  onTaskCreate,
  onResultSelect,
  isSearchLoading = false,
  isCreateLoading = false,
  error,
  initialQuery = '',
}: CommandCenterProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showSearchResults, setShowSearchResults] = React.useState(false);

  // Task creation state
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [createStep, setCreateStep] = React.useState<'type' | 'title'>('type');
  const [selectedType, setSelectedType] = React.useState<TaskType | null>(null);
  const [taskTitle, setTaskTitle] = React.useState('');
  const [isParent, setIsParent] = React.useState(false);

  const taskTypes = React.useMemo(() => getTaskTypesFromSchema(), []);

  // Refs for focus management
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery(initialQuery);
      setSearchResults([]);
      setShowCreateForm(false);
      setShowSearchResults(false);
      setCreateStep('type');
      setSelectedType(null);
      setTaskTitle('');
      setIsParent(false);
      setIsSearching(false);
    }
  }, [open, initialQuery]);

  // Handle search when in search mode
  React.useEffect(() => {
    if (!showSearchResults || showCreateForm) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    // Only search user content, no system commands in search results
    const searchPromise = query.trim() ? onSearch(query) : Promise.resolve([]);

    searchPromise
      .then((results) => {
        if (!cancelled) {
          setSearchResults(results);
          setIsSearching(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Search error:', error);
          setSearchResults([]);
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query, onSearch, showSearchResults, showCreateForm]);

  // Auto-focus inputs when switching modes
  React.useEffect(() => {
    if (showCreateForm && createStep === 'title' && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
    
    if (showSearchResults && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showCreateForm, createStep, showSearchResults]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      // Handle command shortcuts when in command mode
      if (!showCreateForm && !showSearchResults) {
        const command = systemCommands.find(cmd => cmd.shortcut === key);
        if (command) {
          e.preventDefault();
          handleResultSelect({
            id: command.id,
            type: 'command',
            title: command.title,
            excerpt: command.description,
          });
          return;
        }
      }

      // Handle task type shortcuts when in create form
      if (showCreateForm && createStep === 'type') {
        const taskType = taskTypes.find((t: any) => t.shortcut === key);
        if (taskType) {
          e.preventDefault();
          setSelectedType(taskType.type);
          setCreateStep('title');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, showCreateForm, showSearchResults, createStep, taskTypes]);

  // Handlers
  const handleQueryChange = (value: string) => {
    setQuery(value);
  };

  const handleResultSelect = (result: SearchResult) => {
    if (result.id === 'create-task') {
      // Show create form instead of handling as regular result
      setShowCreateForm(true);
      setCreateStep('type');
      return;
    }

    if (result.id === 'search-tasks') {
      // Switch to search mode
      setShowSearchResults(true);
      setQuery('');
      return;
    }

    onResultSelect(result);
  };

  const handleTypeSelect = (type: TaskType) => {
    setSelectedType(type);
    setCreateStep('title');
  };

  const handleTaskTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim() && selectedType) {
      await onTaskCreate({
        title: taskTitle.trim(),
        type: selectedType,
        isParent,
      });
    }
  };

  const selectedTaskType = taskTypes.find((t: any) => t.type === selectedType);

  // Handle dialog close with escape key interception
  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close and we're in a sub-mode, go back instead
    if (!newOpen && (showSearchResults || showCreateForm)) {
      setShowSearchResults(false);
      setShowCreateForm(false);
      setCreateStep('type');
      setQuery('');
      return;
    }
    // Otherwise, proceed with normal close
    onOpenChange(newOpen);
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange} shouldFilter={false}>
      {!showCreateForm && !showSearchResults ? (
        <>
          {/* Command interface */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Select a command or press shortcut key</span>
          </div>

          <CommandList>
            <CommandGroup heading="Commands">
              {systemCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <CommandItem
                      key={cmd.id}
                      value={cmd.id}
                      onSelect={() =>
                        handleResultSelect({
                          id: cmd.id,
                          type: 'command',
                          title: cmd.title,
                          excerpt: cmd.description,
                        })
                      }
                      className="flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{cmd.title}</div>
                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                      </div>
                      <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </>
      ) : showSearchResults ? (
        <>
          {/* Search interface */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search tasks and documentation</span>
          </div>

          <CommandInput
            ref={searchInputRef}
            placeholder="Search tasks..."
            value={query}
            onValueChange={handleQueryChange}
          />
          <CommandList>
            {isSearching || isSearchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <CommandGroup heading="Search Results">
                {searchResults.map((result) => {
                  const Icon = getResultIcon(result);
                  return (
                    <CommandItem
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleResultSelect(result)}
                      className="flex items-start gap-3 py-3"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {result.excerpt}
                        </div>
                        {result.metadata && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatResultMetadata(result)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : query ? (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <div className="mb-2">Start typing to search</div>
                <div className="text-xs">Search across tasks, documentation, and more</div>
              </div>
            )}
          </CommandList>
          {error && (
            <div className="px-3 py-2 border-t bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </>
      ) : // Create task form
      createStep === 'type' ? (
        <>
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Create new task</span>
          </div>

          <CommandInput placeholder="Select task type..." value="" onValueChange={() => {}} />
          <CommandList>
            <CommandEmpty>No task types found.</CommandEmpty>
            <CommandGroup heading="Task Types">
              {taskTypes.map((taskType: any) => {
                const IconComponent = taskType.icon;
                return (
                  <CommandItem
                    key={taskType.type}
                    value={taskType.type}
                    onSelect={() => handleTypeSelect(taskType.type)}
                    className="flex items-center gap-3"
                  >
                    {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                    <div className="flex-1">
                      <div className="font-medium">{taskType.label}</div>
                      <div className="text-xs text-muted-foreground">{taskType.description}</div>
                    </div>
                    <CommandShortcut>{taskType.shortcut}</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </>
      ) : (
        <form onSubmit={handleTaskTitleSubmit} className="p-4">
          <div className="flex items-center gap-3 mb-4">
            {selectedTaskType && (
              <>
                {selectedTaskType.icon && (
                  <selectedTaskType.icon className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-medium">{selectedTaskType.label}</span>
              </>
            )}
          </div>

          <input
            ref={titleInputRef}
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Enter new task title..."
            className={cn(
              'w-full px-3 py-2 text-sm rounded-md',
              'bg-background border border-input',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            disabled={isCreateLoading}
          />

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="isParent"
              checked={isParent}
              onChange={(e) => setIsParent(e.target.checked)}
              className="h-4 w-4"
              disabled={isCreateLoading}
            />
            <label htmlFor="isParent" className="text-sm text-muted-foreground">
              Create as parent task (with subtasks)
            </label>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                if (createStep === 'title') {
                  setCreateStep('type');
                } else {
                  setShowCreateForm(false);
                }
              }}
              className={cn(
                'px-3 py-1 text-sm rounded-md',
                'bg-secondary text-secondary-foreground',
                'hover:bg-secondary/80'
              )}
              disabled={isCreateLoading}
            >
              {createStep === 'title' ? 'Back' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!taskTitle.trim() || isCreateLoading}
              className={cn(
                'px-3 py-1 text-sm rounded-md',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'inline-flex items-center gap-2'
              )}
            >
              {isCreateLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {isCreateLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      )}
    </CommandDialog>
  );
}
