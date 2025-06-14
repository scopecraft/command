import { Loader2 } from 'lucide-react';
import React from 'react';
import { useCommandPalette } from '../../context/CommandPaletteProvider';
import { useTaskSearch } from '../../hooks/useTaskSearch';
import { useTaskFilters, type TaskSearchParams } from '../../hooks/useTaskFilters';
import type { ApiResponse } from '../../lib/api/client';
import { useTaskList } from '../../lib/api/hooks';
import {
  createStatusFilterOptions,
  createTaskTypeFilterOptions,
  createWorkflowFilterOptions,
} from '../../lib/icons';
import { Button } from '../ui/button';
import { FilterCategory, FilterPanel } from '../ui/filter-panel';
import { SearchInput } from '../ui/search-input';
import { type TableTask, TaskTable } from './TaskTable';


interface TaskManagementViewProps {
  className?: string;
  data?: ApiResponse<TableTask[]>;
  searchParams?: TaskSearchParams;
}

export function TaskManagementView({
  className = '',
  data,
  searchParams = {},
}: TaskManagementViewProps) {
  const { openCommandPalette } = useCommandPalette();

  // State management
  const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = React.useState(false);

  const searchQuery = searchParams.search || '';

  // Filter management hook
  const { filters, activeFilterCount, handleFilterChange, clearAllFilters, setSearchQuery } = 
    useTaskFilters({ searchParams });

  // Load all tasks as normal
  const { data: taskData, isLoading: tasksLoading } = useTaskList({
    include_content: false,
    include_parent_tasks: true,
  });

  // Search functionality hook
  const { searchResultIds, isSearching, isSearchLoading, debouncedSearchQuery } = useTaskSearch({
    searchQuery,
  });

  // API now returns normalized data - minimal mapping needed
  const allTasks: TableTask[] = React.useMemo(() => {
    const tasks =
      data?.success && data.data
        ? data.data
        : taskData?.success && taskData.data
          ? taskData.data
          : [];

    // Data is already normalized, just ensure compatibility fields and defaults
    return tasks.map((task) => ({
      ...task,
      // Legacy field mappings for UI compatibility
      workflow: task.workflowState,
      created_date: task.createdDate,
      updated_date: task.updatedDate,
      parent_task: task.taskStructure === 'subtask' ? task.parentId : undefined,
      // Ensure required fields have defaults
      tags: task.tags || [],
      area: task.area || 'general',
      priority: task.priority || 'medium',
    }));
  }, [data, taskData]);


  // Filter options
  const filterOptions = React.useMemo(() => {
    // Get unique values from tasks
    const uniqueAreas = Array.from(
      new Set(allTasks.map((t) => t.area).filter(Boolean))
    ) as string[];

    return {
      status: createStatusFilterOptions(),
      type: createTaskTypeFilterOptions(),
      workflow: createWorkflowFilterOptions(),
      area: uniqueAreas.map((area) => ({ value: area, label: area })),
    };
  }, [allTasks]);

  // Filter and search logic
  const filteredTasks = React.useMemo(() => {
    let result = allTasks;

    // Apply search filter (server-side search results)
    if (searchResultIds) {
      result = result.filter((task) => searchResultIds.has(task.id));
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter((task) => filters.status.includes(task.status));
    }

    // Apply type filter
    if (filters.type.length > 0) {
      result = result.filter((task) => filters.type.includes(task.type));
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
  }, [allTasks, searchResultIds, filters]);

  // Selection handlers
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const hasSelection = selectedCount > 0;

  const isLoading = tasksLoading;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">Search, filter, and manage your tasks efficiently</p>
        </div>
        <Button
          variant="atlas"
          onClick={() => openCommandPalette({ defaultCommand: 'create-task' })}
        >
          + Create Task
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks by title, content, tags..."
            onClear={() => setSearchQuery('')}
          />
          {searchQuery !== debouncedSearchQuery && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <FilterPanel
          show={showFilters}
          activeFilterCount={activeFilterCount}
          onFilterToggle={() => setShowFilters(!showFilters)}
          onClearFilters={clearAllFilters}
          title="Filter Tasks"
        >
          <div className="space-y-6">
            <FilterCategory
              name="Status"
              options={filterOptions.status}
              selectedValues={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            />

            <FilterCategory
              name="Type"
              options={filterOptions.type}
              selectedValues={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
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

      {/* Search Status */}
      {isSearching && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Server-side search active</span>
            {isSearchLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredTasks.length} of {allTasks.length} tasks
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

      {/* Task Table */}
      <TaskTable
        tasks={filteredTasks}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onRowClick={(task) => console.log('Open task detail:', task.title)}
        onParentTaskClick={(parentId) => console.log('Navigate to parent:', parentId)}
        // Enable new features
        enableSorting={true}
        enableColumnVisibility={true}
        enableUrlPersistence={true}
        showDateColumns={false}
        urlSortingParam="sort"
        storageKey="task-management-table"
      />

      {/* Empty State */}
      {filteredTasks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || activeFilterCount > 0 ? (
              <>
                <p className="text-lg font-medium mb-2">No tasks found</p>
                <p>Try adjusting your search or filters</p>
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
                  Clear all filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">No tasks yet</p>
                <p>Create your first task to get started</p>
                <Button
                  variant="atlas"
                  className="mt-4"
                  onClick={() => openCommandPalette({ defaultCommand: 'create-task' })}
                >
                  + Create Task
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
