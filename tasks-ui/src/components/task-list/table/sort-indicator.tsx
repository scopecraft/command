import type { Column } from "@tanstack/react-table";

interface SortIndicatorProps<T> {
  column: Column<T, unknown>;
}

export function SortIndicator<T>({ column }: SortIndicatorProps<T>) {
  if (!column.getCanSort()) {
    return null;
  }

  const sorted = column.getIsSorted();
  
  if (!sorted) {
    return (
      <span className="ml-1 text-muted-foreground opacity-60">
        ⇅
      </span>
    );
  }

  return (
    <span className="ml-1">
      {sorted === "asc" ? "↑" : "↓"}
    </span>
  );
}