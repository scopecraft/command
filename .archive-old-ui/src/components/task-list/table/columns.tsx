import type { ColumnDef, Row } from '@tanstack/react-table';
import { useLocation } from 'wouter';
import { routes } from '../../../lib/routes';
import type { Task } from '../../../lib/types';
import { formatDate, hasDependencies } from '../../../lib/utils/format';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';

// Base columns for the task table
const baseColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="text-sm">{row.getValue('id')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div className="font-medium text-sm">{row.getValue('title')}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div className="text-sm">{row.getValue<string>('status')}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <div className="text-sm">{row.getValue('type')}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => <div className="text-sm">{row.getValue<string>('priority') || '—'}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) || '');
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'assigned_to',
    header: 'Assigned To',
    cell: ({ row }) => {
      const assignedTo = row.getValue<string>('assigned_to');
      return <div className="text-sm font-mono">{assignedTo || '—'}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) || '');
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'subdirectory',
    header: 'Feature/Area',
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [, navigate] = useLocation();
      const subdirectory = row.getValue<string>('subdirectory');
      if (!subdirectory) return <div className="text-sm">—</div>;

      let name = subdirectory;
      let isFeature = false;
      let isArea = false;
      let url = '';

      if (subdirectory.startsWith('FEATURE_')) {
        name = subdirectory.replace('FEATURE_', '');
        isFeature = true;
        url = `/features/${name}`;
      } else if (subdirectory.startsWith('AREA_')) {
        name = subdirectory.replace('AREA_', '');
        isArea = true;
        url = `/areas/${name}`;
      }

      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        navigate(url);
      };

      return (
        <div className="text-sm flex items-center gap-1">
          {isFeature && (
            <span title="Feature" className="text-blue-500">
              📦
            </span>
          )}
          {isArea && (
            <span title="Area" className="text-green-500">
              🔷
            </span>
          )}
          {isFeature || isArea ? (
            <button onClick={handleClick} className="text-blue-500 hover:underline">
              {name}
            </button>
          ) : (
            <span>{name}</span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) || '');
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'created_date',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue<string>('created_date');
      return <div className="text-sm">{formatDate(date)}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'updated_date',
    header: 'Updated',
    cell: ({ row }) => {
      const date = row.getValue<string>('updated_date');
      return <div className="text-sm">{formatDate(date)}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'due_date',
    header: 'Due Date',
    cell: ({ row }) => {
      const date = row.getValue<string>('due_date');
      return <div className="text-sm">{formatDate(date, { showRelative: true })}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'dependencies',
    header: 'Deps',
    cell: ({ row }) => {
      const task = row.original;
      const hasDeps = hasDependencies(task.depends_on);
      return (
        <div className="text-sm flex justify-center">
          {hasDeps ? (
            <span title={`Has ${task.depends_on?.length} dependencies`} className="text-orange-500">
              ⛓️
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const task = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [, navigate] = useLocation();

      return (
        <div className="flex justify-end gap-2 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              navigate(routes.taskDetail(task.id));
            }}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              navigate(routes.taskEdit(task.id));
            }}
          >
            Edit
          </Button>
        </div>
      );
    },
  },
];

// Function to get columns with or without selection
export function getColumns(selectable = false): ColumnDef<Task>[] {
  if (!selectable) {
    return baseColumns;
  }

  // Add selection column at the beginning
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
            className="translate-y-[2px]"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...baseColumns,
  ];
}

// Default export for backward compatibility
export const columns = baseColumns;
