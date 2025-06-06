import { Link, useNavigate } from '@tanstack/react-router';
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, Settings2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTypeLabel } from '../../lib/schema-client';
import { getTaskUrl } from '../../lib/task-routing';
import type { TableTask } from '../../lib/types';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { TaskTypeIcon } from './TaskTypeIcon';
import { PriorityIndicator, StatusBadge, WorkflowStateBadge } from './WorkflowStateBadge';

export type { TableTask };

interface TaskTableProps {
  tasks: TableTask[];
  selectable?: boolean;
  selectedRows?: Record<string, boolean>;
  onSelectionChange?: (selection: Record<string, boolean>) => void;
  onRowClick?: (task: TableTask) => void;
  onParentTaskClick?: (parentId: string) => void;
  className?: string;
  showSubtaskProgress?: boolean;
  // New sorting and column configuration props
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  showDateColumns?: boolean;
  initialSorting?: SortingState;
  storageKey?: string;
  // URL parameter persistence
  enableUrlPersistence?: boolean;
  urlSortingParam?: string;
}

// Utility functions for sorting
const getPriorityOrder = (priority: string) => {
  const order = { highest: 4, high: 3, medium: 2, low: 1 };
  return order[priority as keyof typeof order] || 0;
};

const getStatusOrder = (status: string) => {
  const order = { todo: 1, in_progress: 2, reviewing: 3, blocked: 4, done: 5, archived: 6 };
  return order[status as keyof typeof order] || 0;
};

// Column definitions factory
const createColumns = (
  _onRowClick?: (task: TableTask) => void,
  onParentTaskClick?: (parentId: string) => void,
  showSubtaskProgress = false
): ColumnDef<TableTask>[] => [
  {
    id: 'type',
    header: 'Type',
    accessorFn: (row) => row.type,
    cell: ({ row }) => {
      const task = row.original;
      return (
        <div className="flex items-center gap-2">
          <TaskTypeIcon task={task} />
          <span className="text-xs text-muted-foreground">
            {task.taskStructure === 'parent'
              ? 'Parent'
              : task.taskStructure === 'subtask'
                ? 'Subtask'
                : getTypeLabel(task.type)}
          </span>
        </div>
      );
    },
    size: 120,
    enableSorting: true,
  },
  {
    id: 'title',
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      const task = row.original;
      return (
        <div>
          <Link
            href={getTaskUrl(task)}
            className="font-medium text-sm text-foreground hover:text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {task.title}
          </Link>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
            {task.taskStructure === 'parent' && showSubtaskProgress && task.progress && (
              <div className="flex items-center gap-2">
                <span>
                  {task.progress.completed}/{task.progress.total} subtasks
                </span>
                <div className="flex items-center gap-1">
                  <span>({task.progress.percentage}%)</span>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${task.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {task.taskStructure === 'parent' && !showSubtaskProgress && task.subtaskIds && (
              <span>
                {task.subtaskIds.length} subtask{task.subtaskIds.length === 1 ? '' : 's'}
              </span>
            )}
            {task.taskStructure === 'subtask' && task.parentId && (
              <span>
                Parent:{' '}
                <button
                  type="button"
                  className="text-blue-500 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.parentId && onParentTaskClick) {
                      onParentTaskClick(task.parentId);
                    }
                  }}
                >
                  {task.parentId}
                </button>
              </span>
            )}
          </div>
        </div>
      );
    },
    minSize: 200,
    enableSorting: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} size="sm" />,
    sortingFn: (rowA, rowB) => {
      const a = getStatusOrder(rowA.original.status);
      const b = getStatusOrder(rowB.original.status);
      return a - b;
    },
    size: 120,
    enableSorting: true,
  },
  {
    id: 'priority',
    header: 'Priority',
    accessorKey: 'priority',
    cell: ({ getValue }) => <PriorityIndicator priority={getValue() as string} size="sm" />,
    sortingFn: (rowA, rowB) => {
      const a = getPriorityOrder(rowA.original.priority);
      const b = getPriorityOrder(rowB.original.priority);
      return b - a; // Higher priority first
    },
    size: 100,
    enableSorting: true,
  },
  {
    id: 'workflow',
    header: 'Workflow',
    accessorKey: 'workflowState',
    cell: ({ getValue }) => <WorkflowStateBadge workflow={getValue() as string} size="sm" />,
    size: 120,
    enableSorting: true,
  },
  {
    id: 'area',
    header: 'Area',
    accessorKey: 'area',
    cell: ({ getValue }) => (
      <div className="text-sm text-muted-foreground">{getValue() || '—'}</div>
    ),
    size: 100,
    enableSorting: true,
  },
  {
    id: 'tags',
    header: 'Tags',
    accessorFn: (row) => row.tags?.join(', ') || '',
    cell: ({ row }) => {
      const task = row.original;
      return (
        <div className="flex gap-1 flex-wrap">
          {task.tags && Array.isArray(task.tags) && task.tags.length > 0 ? (
            <>
              {task.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={`${task.id}-tag-${index}-${tag}`}
                  className="text-xs bg-muted px-2 py-1 rounded font-mono"
                >
                  #{tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{task.tags.length - 2}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      );
    },
    size: 180,
    enableSorting: true,
  },
  // TODO: Uncomment date columns once core API provides these fields
  // {
  //   id: 'createdDate',
  //   header: 'Created',
  //   accessorKey: 'createdDate',
  //   cell: ({ getValue }) => {
  //     const date = getValue() as string;
  //     return date ? (
  //       <div className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</div>
  //     ) : (
  //       <span className="text-sm text-muted-foreground">—</span>
  //     );
  //   },
  //   sortingFn: (rowA, rowB) => {
  //     const a = formatDateForSort(rowA.original.createdDate);
  //     const b = formatDateForSort(rowB.original.createdDate);
  //     return a.getTime() - b.getTime();
  //   },
  //   size: 100,
  //   enableSorting: true,
  // },
  // {
  //   id: 'updatedDate',
  //   header: 'Updated',
  //   accessorKey: 'updatedDate',
  //   cell: ({ getValue }) => {
  //     const date = getValue() as string;
  //     return date ? (
  //       <div className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</div>
  //     ) : (
  //       <span className="text-sm text-muted-foreground">—</span>
  //     );
  //   },
  //   sortingFn: (rowA, rowB) => {
  //     const a = formatDateForSort(rowA.original.updatedDate);
  //     const b = formatDateForSort(rowB.original.updatedDate);
  //     return a.getTime() - b.getTime();
  //   },
  //   size: 100,
  //   enableSorting: true,
  // },
];

// Helper component to reduce cognitive complexity
interface TableHeaderCellProps {
  header: {
    id: string;
    getSize: () => number;
    isPlaceholder: boolean;
    column: {
      getCanSort: () => boolean;
      getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
      columnDef: { header?: string };
      getIsSorted: () => false | 'asc' | 'desc';
    };
    getContext: () => unknown;
  };
  enableSorting: boolean;
  getSortIcon: (column: { getIsSorted: () => false | 'asc' | 'desc' }) => React.ReactElement;
}

function TableHeaderCell({ header, enableSorting, getSortIcon }: TableHeaderCellProps) {
  const canSort = header.column.getCanSort();

  return (
    <th
      className={`p-3 text-sm font-medium text-left ${canSort && enableSorting ? 'cursor-pointer hover:bg-muted/50' : ''}`}
      style={{ width: header.getSize() }}
      onClick={canSort && enableSorting ? header.column.getToggleSortingHandler() : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && canSort && enableSorting) {
          e.preventDefault();
          header.column.getToggleSortingHandler()?.(e);
        }
      }}
      tabIndex={canSort && enableSorting ? 0 : undefined}
      role={canSort && enableSorting ? 'button' : undefined}
      aria-label={
        canSort && enableSorting ? `Sort by ${header.column.columnDef.header}` : undefined
      }
    >
      <div className="flex items-center">
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        {canSort && enableSorting && getSortIcon(header.column)}
      </div>
    </th>
  );
}

export function TaskTable({
  tasks,
  selectable = false,
  selectedRows = {},
  onSelectionChange,
  onRowClick,
  onParentTaskClick,
  className = '',
  showSubtaskProgress = false,
  enableSorting = false,
  enableColumnVisibility = false,
  showDateColumns = false,
  initialSorting = [],
  storageKey = 'task-table-state',
  enableUrlPersistence = false,
  urlSortingParam = 'sort',
}: TaskTableProps) {
  const navigate = useNavigate();

  // URL parameter utilities
  const parseSortingFromUrl = useCallback(() => {
    if (!enableUrlPersistence || typeof window === 'undefined') return initialSorting;

    try {
      const params = new URLSearchParams(window.location.search);
      const sortParam = params.get(urlSortingParam);
      if (sortParam) {
        return JSON.parse(decodeURIComponent(sortParam)) as SortingState;
      }
    } catch (error) {
      console.warn('Failed to parse sorting from URL:', error);
    }
    return initialSorting;
  }, [enableUrlPersistence, urlSortingParam, initialSorting]);

  const updateUrlSorting = useCallback(
    (newSorting: SortingState) => {
      if (!enableUrlPersistence || typeof window === 'undefined') return;

      try {
        const params = new URLSearchParams(window.location.search);
        if (newSorting.length > 0) {
          params.set(urlSortingParam, encodeURIComponent(JSON.stringify(newSorting)));
        } else {
          params.delete(urlSortingParam);
        }

        navigate({ to: '.', search: Object.fromEntries(params), replace: true });
      } catch (error) {
        console.warn('Failed to update URL sorting:', error);
      }
    },
    [enableUrlPersistence, urlSortingParam, navigate]
  );

  // State management
  const [sorting, setSorting] = useState<SortingState>(() => {
    return enableUrlPersistence ? parseSortingFromUrl() : initialSorting;
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    // Load from localStorage if available
    if (enableColumnVisibility && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`${storageKey}-visibility`);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Failed to load column visibility from localStorage:', error);
      }
    }

    // Default visibility - all columns visible by default
    // Date columns are commented out until core API provides the data
    return {};
  });

  // Enhanced sorting state setter with URL persistence
  const handleSortingChange = useCallback(
    (updater: (prev: SortingState) => SortingState | SortingState) => {
      setSorting((currentSorting) => {
        const newSorting = typeof updater === 'function' ? updater(currentSorting) : updater;
        if (enableUrlPersistence) {
          updateUrlSorting(newSorting);
        }
        return newSorting;
      });
    },
    [enableUrlPersistence, updateUrlSorting]
  );

  // Persist column visibility to localStorage
  useEffect(() => {
    if (enableColumnVisibility && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${storageKey}-visibility`, JSON.stringify(columnVisibility));
      } catch (error) {
        console.warn('Failed to save column visibility to localStorage:', error);
      }
    }
  }, [columnVisibility, enableColumnVisibility, storageKey]);

  // Create column definitions
  const columns = useMemo(
    () => createColumns(onRowClick, onParentTaskClick, showSubtaskProgress),
    [onRowClick, onParentTaskClick, showSubtaskProgress]
  );

  // Add selection column if needed
  const tableColumns = useMemo(() => {
    if (!selectable) return columns;

    const selectionColumn: ColumnDef<TableTask> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    };

    return [selectionColumn, ...columns];
  }, [columns, selectable]);

  // Table instance
  const table = useReactTable({
    data: tasks,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    onSortingChange: enableSorting ? handleSortingChange : undefined,
    onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
    onRowSelectionChange: selectable
      ? (updater) => {
          const newSelection = typeof updater === 'function' ? updater(selectedRows) : updater;
          onSelectionChange?.(newSelection);
        }
      : undefined,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
      rowSelection: selectable ? selectedRows : undefined,
    },
    enableRowSelection: selectable,
    enableMultiRowSelection: selectable,
    enableSorting,
    manualSorting: false,
  });

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  const handleRowClick = (task: TableTask, e: React.MouseEvent) => {
    // Don't trigger row click if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input[type="checkbox"]') ||
      target.closest('a')
    ) {
      return;
    }
    onRowClick?.(task);
  };

  const getSortIcon = (column: { getIsSorted: () => false | 'asc' | 'desc' }) => {
    const sorted = column.getIsSorted();
    if (sorted === 'asc') {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }
    if (sorted === 'desc') {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }
    return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  return (
    <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Column visibility controls */}
      {enableColumnVisibility && (
        <div className="bg-muted/20 px-4 py-2 border-b flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Column Configuration</div>
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2 text-xs">
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <div key={column.id} className="flex items-center gap-1">
                    <Checkbox
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      id={`column-${column.id}`}
                    />
                    <label
                      htmlFor={`column-${column.id}`}
                      className="text-muted-foreground cursor-pointer"
                    >
                      {typeof column.columnDef.header === 'string'
                        ? column.columnDef.header
                        : column.id}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-card border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeaderCell
                    key={header.id}
                    header={header}
                    enableSorting={enableSorting}
                    getSortIcon={getSortIcon}
                  />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-muted/30 cursor-pointer"
                onClick={(e) => handleRowClick(row.original, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRowClick(row.original, e);
                  }
                }}
                tabIndex={0}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3" style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {tasks.length > 0 && (
        <div className="bg-muted/20 px-6 py-3 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {tasks.length} task{tasks.length === 1 ? '' : 's'}
              {selectable && selectedCount > 0 && (
                <span className="ml-2 font-medium">({selectedCount} selected)</span>
              )}
              {enableSorting && sorting.length > 0 && (
                <span className="ml-2 text-xs">
                  • Sorted by {sorting.map((s) => `${s.id} ${s.desc ? '↓' : '↑'}`).join(', ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>{tasks.filter((t) => t.taskStructure === 'parent').length} parent</span>
              <span>{tasks.filter((t) => t.taskStructure === 'simple').length} simple</span>
              {enableColumnVisibility && (
                <span>
                  {table.getVisibleLeafColumns().length - (selectable ? 1 : 0)} columns visible
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export types for external use
export type { TaskTableProps, TableTask };
