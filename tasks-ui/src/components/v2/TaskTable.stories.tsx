import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { mockV2ParentTasks, mockV2SimpleTasks } from '../../lib/api/mock-data-v2';
import { Button } from '../ui/button';
import { type TableTask, TaskTable } from './TaskTable';

const meta: Meta<typeof TaskTable> = {
  title: 'V2 Components/TaskTable',
  component: TaskTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A reusable table component for displaying both parent tasks and simple tasks with selection, sorting, and actions.',
      },
    },
  },
  argTypes: {
    selectable: {
      control: 'boolean',
      description: 'Enable row selection with checkboxes',
    },
    tasks: {
      description: 'Array of tasks to display in the table',
    },
    onRowClick: {
      description: 'Callback when a table row is clicked (opens task detail)',
    },
    onParentTaskClick: {
      description: 'Callback when a parent task link is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskTable>;

// Prepare combined task data
const allTasks: TableTask[] = [
  ...mockV2ParentTasks.map((task) => ({ ...task, task_type: 'parent' as const })),
  ...mockV2SimpleTasks.map((task) => ({ ...task, task_type: 'simple' as const })),
];

export const Default: Story = {
  args: {
    tasks: allTasks,
    selectable: false,
    onRowClick: (task) => console.log('Open task detail:', task.title),
    onParentTaskClick: (parentId) => console.log('Navigate to parent:', parentId),
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({});

    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Table with Selection</h2>
          {Object.values(selectedRows).filter(Boolean).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {Object.values(selectedRows).filter(Boolean).length} selected
              </span>
              <Button variant="secondary" size="sm">
                Bulk Action
              </Button>
            </div>
          )}
        </div>

        <TaskTable
          tasks={allTasks}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onRowClick={(task) => console.log('Open task detail:', task.title)}
          onParentTaskClick={(parentId) => console.log('Navigate to parent:', parentId)}
        />
      </div>
    );
  },
};

export const ParentTasksOnly: Story = {
  args: {
    tasks: mockV2ParentTasks.map((task) => ({ ...task, task_type: 'parent' as const })),
    selectable: true,
    onRowClick: (task) => console.log('Open parent task detail:', task.title),
    onParentTaskClick: (parentId) => console.log('Navigate to parent:', parentId),
  },
};

export const ParentTasksWithProgress: Story = {
  args: {
    tasks: mockV2ParentTasks.map((task) => ({
      ...task,
      task_type: 'parent' as const,
      subtask_count: Math.floor(Math.random() * 10) + 1,
      subtask_completed: Math.floor(Math.random() * 5),
      progress_percentage: Math.floor(Math.random() * 100),
    })),
    selectable: true,
    showSubtaskProgress: true,
    onRowClick: (task) => console.log('Open parent task detail:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows parent tasks with subtask progress indicators including count and percentage completion with visual progress bars.',
      },
    },
  },
};

export const SimpleTasksOnly: Story = {
  args: {
    tasks: mockV2SimpleTasks.map((task) => ({ ...task, task_type: 'simple' as const })),
    selectable: false,
    onRowClick: (task) => console.log('Open simple task detail:', task.title),
    onParentTaskClick: (parentId) => console.log('Navigate to parent:', parentId),
  },
};

export const FilteredByWorkflow: Story = {
  args: {
    tasks: allTasks.filter((task) => task.workflow_state === 'current'),
    selectable: true,
    onRowClick: (task) => console.log('Current task clicked:', task.title),
    onTaskAction: (action, task) => console.log(`${action} action:`, task.title),
    onParentTaskClick: (parentId) => console.log('Navigate to parent:', parentId),
  },
  parameters: {
    docs: {
      description: {
        story: 'Table filtered to show only tasks in the "current" workflow state.',
      },
    },
  },
};

export const WithCustomActions: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({});
    const selectedCount = Object.values(selectedRows).filter(Boolean).length;

    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Custom Bulk Actions Example</h2>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedCount} task{selectedCount === 1 ? '' : 's'} selected
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => console.log('Moving tasks to current...')}
              >
                Move to Current
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => console.log('Archiving tasks...')}
              >
                Archive
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => console.log('Deleting tasks...')}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        <TaskTable
          tasks={allTasks}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onRowClick={(task) => console.log('Row clicked:', task.title)}
          onTaskAction={(action, task) => {
            if (action === 'view') {
              console.log('Opening task detail for:', task.title);
            } else if (action === 'edit') {
              console.log('Opening edit form for:', task.title);
            }
          }}
          onParentTaskClick={(parentId) => console.log('Navigate to parent:', parentId)}
        />

        {selectedCount > 0 && (
          <div className="text-sm text-muted-foreground">
            Selected tasks:{' '}
            {Object.entries(selectedRows)
              .filter(([_, selected]) => selected)
              .map(([taskId]) => allTasks.find((t) => t.id === taskId)?.title)
              .join(', ')}
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing how to implement custom bulk actions based on selection state.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    tasks: [],
    selectable: true,
    onRowClick: (task) => console.log('Row clicked:', task.title),
    onTaskAction: (action, task) => console.log(`${action} action:`, task.title),
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with no tasks to show empty state behavior.',
      },
    },
  },
};

export const WithSorting: Story = {
  render: () => {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Table with Sorting</h2>
          <div className="text-sm text-muted-foreground">Click column headers to sort ↕️</div>
        </div>

        <TaskTable
          tasks={allTasks}
          selectable={false}
          enableSorting={true}
          onRowClick={(task) => console.log('Open task detail:', task.title)}
          onParentTaskClick={(parentId) => console.log('Navigate to parent:', parentId)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Table with sortable columns. Click column headers to sort by that field. Supports multi-column sorting with Shift+click.',
      },
    },
  },
};

export const WithColumnConfiguration: Story = {
  render: () => {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Table with Column Configuration</h2>
          <div className="text-sm text-muted-foreground">
            Configure visible columns and sort state
          </div>
        </div>

        <TaskTable
          tasks={allTasks}
          selectable={true}
          enableSorting={true}
          enableColumnVisibility={true}
          showDateColumns={true}
          onRowClick={(task) => console.log('Open task detail:', task.title)}
          onParentTaskClick={(parentId) => console.log('Navigate to parent:', parentId)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Table with full column configuration including date columns and visibility controls. Settings persist to localStorage.',
      },
    },
  },
};

export const WithUrlPersistence: Story = {
  render: () => {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Table with URL Persistence</h2>
          <div className="text-sm text-muted-foreground">
            Sort state persists in URL - refresh page to see it maintained
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <p className="text-sm text-blue-800">
            <strong>Demo:</strong> Click column headers to sort. The sort state will be saved in the
            URL. Try refreshing the page or sharing the URL - the sort order will be preserved!
          </p>
        </div>

        <TaskTable
          tasks={allTasks}
          selectable={false}
          enableSorting={true}
          enableUrlPersistence={true}
          urlSortingParam="sort"
          onRowClick={(task) => console.log('Open task detail:', task.title)}
          onParentTaskClick={(parentId) => console.log('Navigate to parent:', parentId)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Table with URL parameter persistence for sort state. Sort preferences are saved in the URL and restored on page load.',
      },
    },
  },
};

export const FullFeatured: Story = {
  render: () => {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Full-Featured Task Table</h2>
          <div className="text-sm text-muted-foreground">
            All features enabled: sorting, column config, selection, URL persistence
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-md mb-4">
          <p className="text-sm text-green-800">
            <strong>Features:</strong>
          </p>
          <ul className="text-xs text-green-700 mt-2 space-y-1">
            <li>• Click headers to sort (multi-column with Shift+click)</li>
            <li>• Toggle column visibility with checkboxes above table</li>
            <li>• Row selection with bulk actions</li>
            <li>• Date columns (hidden by default, toggle to show)</li>
            <li>• Sort state persists in URL</li>
            <li>• Column preferences saved to localStorage</li>
          </ul>
        </div>

        <TaskTable
          tasks={allTasks}
          selectable={true}
          enableSorting={true}
          enableColumnVisibility={true}
          enableUrlPersistence={true}
          showDateColumns={false}
          urlSortingParam="sort"
          storageKey="full-featured-table"
          onRowClick={(task) => console.log('Open task detail:', task.title)}
          onParentTaskClick={(parentId) => console.log('Navigate to parent:', parentId)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complete demonstration of all TaskTable features including sorting, column configuration, selection, and persistence.',
      },
    },
  },
};
