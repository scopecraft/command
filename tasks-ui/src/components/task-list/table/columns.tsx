import { Button } from "../../ui/button";
import type { Task } from "../../../lib/types/index";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocation } from "wouter";
import { routes } from "../../../lib/routes";

// Define the columns for the task table
export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="text-sm">{row.getValue("id")}</div>,
    enableSorting: true,
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
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div className="text-sm">{row.getValue("type")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
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
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [, navigate] = useLocation();

      return (
        <div className="flex justify-end gap-2">
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