import React from 'react';
import { mockV2ParentTasks, mockV2SimpleTasks } from '../../lib/api/mock-data-v2';
import type { TaskStatus, TaskType, WorkflowState } from '../../lib/types';
import { Button } from '../ui/button';
import { FilterCategory, FilterPanel } from '../ui/filter-panel';
import { SearchInput } from '../ui/search-input';
import { TaskTable, type TableTask } from './TaskTable';

// Filter state interface
interface TaskFilters {
  status: TaskStatus[];
  type: TaskType[];
  workflow: WorkflowState[];
  area: string[];
}

interface TaskManagementViewProps {
  className?: string;
}

export function TaskManagementView({ className = '' }: TaskManagementViewProps) {
  // Combine all tasks
  const allTasks: TableTask[] = React.useMemo(() => [
    ...mockV2ParentTasks.map(task => ({ ...task, task_type: 'parent' as const })),
    ...mockV2SimpleTasks.map(task => ({ ...task, task_type: 'simple' as const })),
  ], []);

  // State management
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({});
  const [filters, setFilters] = React.useState<TaskFilters>({
    status: [],
    type: [],
    workflow: [],
    area: [],
  });

  // Filter options
  const filterOptions = React.useMemo(() => {
    // Get unique values from tasks
    const uniqueAreas = Array.from(new Set(allTasks.map(t => t.area).filter(Boolean))) as string[];
    
    return {
      status: [
        { value: 'todo' as TaskStatus, label: 'To Do' },
        { value: 'in_progress' as TaskStatus, label: 'In Progress' },
        { value: 'done' as TaskStatus, label: 'Done' },
        { value: 'blocked' as TaskStatus, label: 'Blocked' },
      ],
      type: [
        { value: 'feature' as TaskType, label: 'Feature' },
        { value: 'bug' as TaskType, label: 'Bug' },
        { value: 'chore' as TaskType, label: 'Chore' },
        { value: 'documentation' as TaskType, label: 'Documentation' },
        { value: 'test' as TaskType, label: 'Test' },
        { value: 'spike' as TaskType, label: 'Spike/Research' },
      ],
      workflow: [
        { value: 'backlog' as WorkflowState, label: 'Backlog' },
        { value: 'current' as WorkflowState, label: 'Current' },
        { value: 'archive' as WorkflowState, label: 'Archive' },
      ],
      area: uniqueAreas.map(area => ({ value: area, label: area })),
    };
  }, [allTasks]);

  // Filter and search logic
  const filteredTasks = React.useMemo(() => {
    let result = allTasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.area?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        ('parent_task' in task && task.parent_task?.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(task => filters.status.includes(task.status));
    }

    // Apply type filter
    if (filters.type.length > 0) {
      result = result.filter(task => filters.type.includes(task.type));
    }

    // Apply workflow filter
    if (filters.workflow.length > 0) {
      result = result.filter(task => filters.workflow.includes(task.workflow_state));
    }

    // Apply area filter
    if (filters.area.length > 0) {
      result = result.filter(task => task.area && filters.area.includes(task.area));
    }

    return result;
  }, [allTasks, searchQuery, filters]);

  // Filter handlers
  const handleFilterChange = (category: keyof TaskFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: [],
      type: [],
      workflow: [],
      area: [],
    });
    setSearchQuery('');
  };

  // Calculate active filter count
  const activeFilterCount = Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0) + (searchQuery ? 1 : 0);

  // Selection handlers
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const hasSelection = selectedCount > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">
            Search, filter, and manage your tasks efficiently
          </p>
        </div>
        <Button variant="atlas">
          + Create Task
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tasks by title, area, tags..."
            onClear={() => setSearchQuery('')}
          />
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
          <div className="text-sm text-muted-foreground">
            {selectedCount} selected
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {hasSelection && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedCount} task{selectedCount === 1 ? '' : 's'} selected
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
          Showing {filteredTasks.length} of {allTasks.length} tasks
          {searchQuery && (
            <span className="ml-2">
              for "<span className="font-medium text-foreground">{searchQuery}</span>"
            </span>
          )}
        </div>
        
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span>{activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} active</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs"
            >
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
      />

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || activeFilterCount > 0 ? (
              <>
                <p className="text-lg font-medium mb-2">No tasks found</p>
                <p>Try adjusting your search or filters</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">No tasks yet</p>
                <p>Create your first task to get started</p>
                <Button variant="atlas" className="mt-4">
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