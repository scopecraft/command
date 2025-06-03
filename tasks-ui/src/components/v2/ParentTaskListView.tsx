import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import type { ApiResponse } from '../../lib/api/client';
import { createStatusFilterOptions, createWorkflowFilterOptions } from '../../lib/icons';
import type { TaskStatus, WorkflowState } from '../../lib/types';
import { Button } from '../ui/button';
import { FilterCategory, FilterPanel } from '../ui/filter-panel';
import { SearchInput } from '../ui/search-input';
import { type TableTask, TaskTable } from './TaskTable';

// Filter state interface
interface TaskFilters {
  status: TaskStatus[];
  workflow: WorkflowState[];
  area: string[];
}

interface ParentSearchParams {
  search?: string;
  status?: string[];
  workflow?: string[];
  area?: string[];
}

interface ParentTaskListViewProps {
  className?: string;
  data?: ApiResponse<TableTask[]>;
  searchParams?: ParentSearchParams;
}

export function ParentTaskListView({
  className = '',
  data,
  searchParams = {},
}: ParentTaskListViewProps) {
  const navigate = useNavigate();

  // API now returns normalized data - no complex mapping needed
  const allTasks = React.useMemo(() => {
    if (!data?.success || !data.data) return [];

    // Data is already normalized, just ensure we have required fields for UI
    return data.data.map((task) => ({
      ...task,
      // Ensure backwards compatibility fields exist for TaskTable
      workflow: task.workflowState,
      created_date: task.createdDate,
      updated_date: task.updatedDate,
      // Ensure required fields have defaults
      tags: task.tags || [],
      area: task.area || 'general',
      priority: task.priority || 'medium',
    }));
  }, [data]);

  // State management from URL search params
  const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = React.useState(false);

  const searchQuery = searchParams.search || '';
  const filters: TaskFilters = React.useMemo(
    () => ({
      status: searchParams.status
        ? ((Array.isArray(searchParams.status)
            ? searchParams.status
            : [searchParams.status]) as TaskStatus[])
        : [],
      workflow: searchParams.workflow
        ? ((Array.isArray(searchParams.workflow)
            ? searchParams.workflow
            : [searchParams.workflow]) as WorkflowState[])
        : [],
      area: searchParams.area
        ? Array.isArray(searchParams.area)
          ? searchParams.area
          : [searchParams.area]
        : [],
    }),
    [searchParams]
  );

  // Update search params via navigation
  const updateSearchParams = React.useCallback(
    (updates: Partial<ParentSearchParams>) => {
      navigate({
        search: (prev) => ({ ...prev, ...updates }),
      });
    },
    [navigate]
  );

  const setSearchQuery = React.useCallback(
    (query: string) => {
      updateSearchParams({ search: query || undefined });
    },
    [updateSearchParams]
  );

  const setFilters = React.useCallback(
    (newFilters: TaskFilters) => {
      updateSearchParams({
        status: newFilters.status.length ? newFilters.status : undefined,
        workflow: newFilters.workflow.length ? newFilters.workflow : undefined,
        area: newFilters.area.length ? newFilters.area : undefined,
      });
    },
    [updateSearchParams]
  );

  // Filter options
  const filterOptions = React.useMemo(() => {
    // Get unique areas from parent tasks
    const uniqueAreas = Array.from(
      new Set(allTasks.map((t) => t.area).filter(Boolean))
    ) as string[];

    return {
      status: createStatusFilterOptions(),
      workflow: createWorkflowFilterOptions(),
      area: uniqueAreas.map((area) => ({ value: area, label: area })),
    };
  }, [allTasks]);

  // Filter and search logic
  const filteredTasks = React.useMemo(() => {
    let result = allTasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.area?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter((task) => filters.status.includes(task.status));
    }

    // Apply workflow filter
    if (filters.workflow.length > 0) {
      result = result.filter((task) => filters.workflow.includes(task.workflow));
    }

    // Apply area filter
    if (filters.area.length > 0) {
      result = result.filter((task) => task.area && filters.area.includes(task.area));
    }

    return result;
  }, [allTasks, searchQuery, filters]);

  // Filter handlers
  const handleFilterChange = (category: keyof TaskFilters, value: string) => {
    const currentValues = filters[category];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    setFilters({
      ...filters,
      [category]: newValues,
    });
  };

  const clearAllFilters = () => {
    updateSearchParams({
      search: undefined,
      status: undefined,
      workflow: undefined,
      area: undefined,
    });
  };

  // Calculate active filter count
  const activeFilterCount =
    Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0) +
    (searchQuery ? 1 : 0);

  // Selection handlers
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const hasSelection = selectedCount > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parent Tasks</h1>
          <p className="text-muted-foreground">
            Complex tasks with multiple subtasks and progress tracking
          </p>
        </div>
        <Button variant="atlas">+ Create Parent Task</Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search parent tasks by title, area, tags..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        <FilterPanel
          show={showFilters}
          activeFilterCount={activeFilterCount}
          onFilterToggle={() => setShowFilters(!showFilters)}
          onClearFilters={clearAllFilters}
          title="Filter Parent Tasks"
        >
          <div className="space-y-6">
            <FilterCategory
              name="Status"
              options={filterOptions.status}
              selectedValues={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            />

            <FilterCategory
              name="Workflow"
              options={filterOptions.workflow}
              selectedValues={filters.workflow}
              onChange={(value) => handleFilterChange('workflow', value)}
            />

            {filterOptions.area.length > 0 && (
              <FilterCategory
                name="Area"
                options={filterOptions.area}
                selectedValues={filters.area}
                onChange={(value) => handleFilterChange('area', value)}
              />
            )}
          </div>
        </FilterPanel>

        {hasSelection && (
          <div className="text-sm text-muted-foreground">{selectedCount} selected</div>
        )}
      </div>

      {/* Bulk Actions */}
      {hasSelection && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedCount} parent task{selectedCount === 1 ? '' : 's'} selected
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                Move to Current
              </Button>
              <Button variant="secondary" size="sm">
                Archive
              </Button>
              <Button variant="secondary" size="sm">
                Change Priority
              </Button>
              <Button variant="secondary" size="sm">
                Add Tags
              </Button>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredTasks.length} of {allTasks.length} parent tasks
          {searchQuery && (
            <span className="ml-2">
              for "<span className="font-medium text-foreground">{searchQuery}</span>"
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span>
              {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} active
            </span>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Task Table with subtask info */}
      <TaskTable
        tasks={filteredTasks}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onRowClick={(task) => navigate({ to: `/parents/${task.id}` })}
        showSubtaskProgress={true}
      />

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || activeFilterCount > 0 ? (
              <>
                <p className="text-lg font-medium mb-2">No parent tasks found</p>
                <p>Try adjusting your search or filters</p>
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
                  Clear all filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">No parent tasks yet</p>
                <p>Create your first parent task to organize complex work</p>
                <Button variant="atlas" className="mt-4">
                  + Create Parent Task
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
