import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTaskContext } from '../../context/TaskContext';
import { useFeatureContext } from '../../context/FeatureContext';
import { useAreaContext } from '../../context/AreaContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import { useQueryParams } from '../../hooks/useQueryParams';
import { DataTable } from './table/data-table';
import { columns, getColumns } from './table/columns';
import { TaskFilters } from './filters';
import { ErrorBoundary } from '../layout/ErrorBoundary';
import { TaskListFallback } from './TaskListFallback';
import { BulkActionToolbar } from './BulkActionToolbar';
import type { TaskListFilter, Task } from '../../lib/types';

export function TaskListViewInner() {
  const { tasks, loading, error } = useTaskContext();
  const { features, refreshFeatures } = useFeatureContext();
  const { areas, refreshAreas } = useAreaContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { getParam, setParams, clearParams } = useQueryParams();
  
  // State for multi-select
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  
  const selectedTaskIds = useMemo(() => {
    return Object.keys(selectedRows).filter(id => selectedRows[id]);
  }, [selectedRows]);
  
  const selectedTasksData = useMemo(() => {
    return tasks.filter(task => selectedTaskIds.includes(task.id));
  }, [tasks, selectedTaskIds]);

  // State for filters
  const [filters, setFilters] = useState<TaskListFilter>({});

  // Initialize filters from URL parameters
  useEffect(() => {
    const status = getParam('status');
    const type = getParam('type');
    const priority = getParam('priority');
    const tag = getParam('tag');
    const searchTerm = getParam('search');
    const assignedTo = getParam('assignedTo');
    const phase = getParam('phase');
    const feature = getParam('feature');
    const area = getParam('area');

    // Only update if we have query parameters
    if (status || type || priority || tag || searchTerm || assignedTo || phase || feature || area) {
      setFilters({
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(priority ? { priority } : {}),
        ...(tag ? { tag } : {}),
        ...(searchTerm ? { searchTerm } : {}),
        ...(assignedTo ? { assignedTo } : {}),
        ...(phase ? { phase } : {}),
        ...(feature ? { feature } : {}),
        ...(area ? { area } : {}),
      });
    }
  }, [getParam]);

  // Handle filter changes and update URL
  const handleFilterChange = (newFilters: TaskListFilter) => {
    setFilters(newFilters);

    // Update URL parameters
    const params: Record<string, string | null> = {
      status: newFilters.status || null,
      type: newFilters.type || null,
      priority: newFilters.priority || null,
      tag: newFilters.tag || null,
      search: newFilters.searchTerm || null,
      assignedTo: newFilters.assignedTo || null,
      phase: newFilters.phase || null,
      feature: newFilters.feature || null,
      area: newFilters.area || null,
    };

    // Clear all params if we have no filters
    if (Object.values(newFilters).every(val => !val)) {
      clearParams();
    } else {
      setParams(params);
    }
  };

  // Extract unique values for filter options
  const statusOptions = useMemo(() =>
    [...new Set(tasks.map(task => task.status))].sort(),
    [tasks]
  );

  const priorityOptions = useMemo(() =>
    [...new Set(tasks.map(task => task.priority).filter(Boolean))].sort(),
    [tasks]
  );

  const typeOptions = useMemo(() =>
    [...new Set(tasks.map(task => task.type))].sort(),
    [tasks]
  );

  // Extract all unique tags from tasks
  const tagOptions = useMemo(() => {
    const allTags: string[] = [];
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        allTags.push(...task.tags);
      }
    });
    return [...new Set(allTags)].sort();
  }, [tasks]);

  // Extract all unique assignees from tasks
  const assigneeOptions = useMemo(() => {
    return [...new Set(tasks.map(task => task.assigned_to).filter(Boolean))].sort();
  }, [tasks]);

  // Extract all unique phases from tasks
  const phaseOptions = useMemo(() => {
    return [...new Set(tasks.map(task => task.phase).filter(Boolean))].sort();
  }, [tasks]);
  
  // Extract all unique features from subdirectories that start with FEATURE_
  const featureOptions = useMemo(() => {
    const featuresFromTasks = tasks
      .map(task => task.subdirectory)
      .filter(Boolean)
      .filter(subdirectory => subdirectory?.startsWith('FEATURE_'));
    return [...new Set(featuresFromTasks)].sort();
  }, [tasks]);
  
  // Extract all unique areas from subdirectories that start with AREA_
  const areaOptions = useMemo(() => {
    const areasFromTasks = tasks
      .map(task => task.subdirectory)
      .filter(Boolean)
      .filter(subdirectory => subdirectory?.startsWith('AREA_'));
    return [...new Set(areasFromTasks)].sort();
  }, [tasks]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.type && task.type !== filters.type) return false;
      if (filters.searchTerm && !task.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.tag && (!task.tags || !task.tags.includes(filters.tag))) return false;
      if (filters.assignedTo && task.assigned_to !== filters.assignedTo) return false;
      if (filters.phase && task.phase !== filters.phase) return false;
      
      // Feature filtering - check if task is in the selected feature
      if (filters.feature && (!task.subdirectory || task.subdirectory !== filters.feature)) return false;
      
      // Area filtering - check if task is in the selected area
      if (filters.area && (!task.subdirectory || task.subdirectory !== filters.area)) return false;
      
      return true;
    });
  }, [tasks, filters]);

  // Handle task selection with navigation
  const handleTaskSelect = (taskId: string) => {
    // If in bulk selection mode, don't navigate - selection is handled by the table
    if (bulkSelectionMode) return;
    
    setSelectedTaskId(taskId);
    navigate(routes.taskDetail(taskId));
  };

  // Handle creating a new task
  const handleCreateTask = () => {
    navigate(routes.taskCreate);
  };
  
  // Toggle bulk selection mode
  const toggleBulkSelectionMode = () => {
    setBulkSelectionMode(!bulkSelectionMode);
    // Clear selection when exiting bulk mode
    if (bulkSelectionMode) {
      setSelectedRows({});
    }
  };
  
  // Clear selected rows
  const clearSelection = () => {
    setSelectedRows({});
  };

  if (loading) {
    return <div className="p-4 text-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-muted-foreground">No tasks found</p>
        <Button onClick={handleCreateTask}>Create your first task</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold mr-4">Tasks</h1>
          <Button 
            variant={bulkSelectionMode ? "secondary" : "outline"} 
            size="sm"
            onClick={toggleBulkSelectionMode}
            className="h-8"
          >
            {bulkSelectionMode ? "Exit Selection Mode" : "Select Multiple"}
          </Button>
        </div>
        <Button onClick={handleCreateTask}>Create New Task</Button>
      </div>
      
      {/* Bulk Action Toolbar - only displayed when tasks are selected */}
      {bulkSelectionMode && selectedTaskIds.length > 0 && (
        <BulkActionToolbar
          selectedTaskIds={selectedTaskIds}
          selectedTasks={selectedTasksData}
          onClearSelection={clearSelection}
        />
      )}
      
      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        typeOptions={typeOptions}
        tagOptions={tagOptions}
        assigneeOptions={assigneeOptions}
        phaseOptions={phaseOptions}
        featureOptions={featureOptions}
        areaOptions={areaOptions}
      />
      
      <DataTable 
        columns={getColumns(bulkSelectionMode)} 
        data={filteredTasks}
        onRowClick={(row) => handleTaskSelect(row.id)}
        selectable={bulkSelectionMode}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
}

export function TaskListView() {
  const { refreshTasks } = useTaskContext();
  return (
    <ErrorBoundary fallback={<TaskListFallback onRetry={refreshTasks} />}>
      <TaskListViewInner />
    </ErrorBoundary>
  );
}