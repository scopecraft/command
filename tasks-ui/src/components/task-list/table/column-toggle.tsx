import { useState } from "react";
import { Button } from "../../ui/button";
import type { Table } from "@tanstack/react-table";
import type { Task } from "../../../lib/types/index";

interface ColumnToggleProps<T> {
  table: Table<T>;
}

export function ColumnToggle<T extends Task>({ table }: ColumnToggleProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  // Exclude actions column from toggling
  const toggleableColumns = table
    .getAllColumns()
    .filter(
      column => 
        column.getCanHide() && 
        column.id !== "actions" &&
        column.id !== "title" // Always keep title column visible
    );

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2"
      >
        Columns
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card z-10 border border-border">
          <div className="py-1 px-2">
            {toggleableColumns.map(column => {
              return (
                <div key={column.id} className="flex items-center py-1">
                  <input
                    type="checkbox"
                    id={`column-${column.id}`}
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="mr-2"
                  />
                  <label 
                    htmlFor={`column-${column.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {column.columnDef.header as string}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}