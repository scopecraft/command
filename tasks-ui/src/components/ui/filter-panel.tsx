import { Filter, X } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface FilterOption<T> {
  value: T;
  label?: string;
  icon?: ReactNode;
  render?: (isSelected: boolean) => ReactNode;
}

export interface FilterCategoryProps<T> {
  name: string;
  options: FilterOption<T>[];
  selectedValues: T[];
  onChange: (value: T) => void;
}

export interface FilterPanelProps {
  /**
   * Show or hide the filter panel
   */
  show: boolean;
  /**
   * Total number of active filters
   */
  activeFilterCount: number;
  /**
   * Label to display on the filter toggle button
   */
  filterButtonLabel?: string;
  /**
   * Callback when the filter toggle button is clicked
   */
  onFilterToggle: () => void;
  /**
   * Callback when clear filters button is clicked
   */
  onClearFilters: () => void;
  /**
   * Title to display at the top of the filter panel
   */
  title?: string;
  /**
   * Children components to render inside the filter panel
   */
  children: ReactNode;
  /**
   * Optional class name for the filter toggle button
   */
  filterButtonClassName?: string;
  /**
   * Optional class name for the filter panel container
   */
  className?: string;
}

export interface FilterCategoryGroupProps {
  /**
   * Children components to render (usually FilterCategory components)
   */
  children: ReactNode;
  /**
   * Optional class name for the category group container
   */
  className?: string;
}

/**
 * A generic FilterCategory component that displays a group of filter options
 * @template T The type of values used in the filter options
 */
export function FilterCategory<T>({
  name,
  options,
  selectedValues,
  onChange,
}: FilterCategoryProps<T>) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-xs text-muted-foreground mb-1.5">{name}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option.value);

          return (
            <Button
              key={index}
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onChange(option.value)}
              className="h-7 text-xs"
            >
              {option.render ? (
                option.render(isSelected)
              ) : (
                <>
                  {option.icon}
                  {option.label ?? String(option.value)}
                </>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A container component for groups of FilterCategory components
 */
export function FilterCategoryGroup({ children, className }: FilterCategoryGroupProps) {
  return <div className={cn('space-y-3', className)}>{children}</div>;
}

/**
 * FilterToggleButton component to show/hide the filter panel
 */
export function FilterToggleButton({
  onClick,
  activeFilterCount = 0,
  label = 'FILTERS',
  className,
}: {
  onClick: () => void;
  activeFilterCount?: number;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn('h-8 px-3 flex items-center gap-1 relative', className)}
    >
      <Filter className="h-4 w-4" />
      {label}
      {activeFilterCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-4 h-4 rounded-full text-xs flex items-center justify-center">
          {activeFilterCount}
        </span>
      )}
    </Button>
  );
}

/**
 * A comprehensive filter panel component that can be reused across the application
 * for filtering various types of data.
 */
export function FilterPanel({
  show,
  activeFilterCount,
  filterButtonLabel = 'FILTERS',
  onFilterToggle,
  onClearFilters,
  title = 'Filter',
  children,
  filterButtonClassName,
  className,
}: FilterPanelProps) {
  return (
    <>
      {/* Filter toggle button */}
      <FilterToggleButton
        onClick={onFilterToggle}
        activeFilterCount={activeFilterCount}
        label={filterButtonLabel}
        className={filterButtonClassName}
      />

      {/* Filter panel */}
      {show && (
        <div className={cn('mb-4 p-3 bg-card/50 rounded-md border border-border', className)}>
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium">{title}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 px-2 text-xs"
              disabled={activeFilterCount === 0}
            >
              <X className="h-3 w-3 mr-1" />
              Clear Filters
            </Button>
          </div>

          {children}
        </div>
      )}
    </>
  );
}
