import { Button } from "../../ui/button";
import type { Task } from "../../../lib/types";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocation } from "wouter";
import { routes } from "../../../lib/routes";
import { formatDate, hasDependencies } from "../../../lib/utils/format";

// Define the columns for the task table
export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="text-sm">{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("title")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue<string>("status")}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div className="text-sm">{row.getValue("type")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue<string>("priority") || "—"}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) || "");
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "assigned_to",
    header: "Assigned To",
    cell: ({ row }) => {
      const assignedTo = row.getValue<string>("assigned_to");
      return (
        <div className="text-sm font-mono">
          {assignedTo || "—"}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) || "");
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "created_date",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue<string>("created_date");
      return (
        <div className="text-sm">
          {formatDate(date)}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "updated_date",
    header: "Updated",
    cell: ({ row }) => {
      const date = row.getValue<string>("updated_date");
      return (
        <div className="text-sm">
          {formatDate(date)}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue<string>("due_date");
      return (
        <div className="text-sm">
          {formatDate(date, { showRelative: true })}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "dependencies",
    header: "Deps",
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
    id: "actions",
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