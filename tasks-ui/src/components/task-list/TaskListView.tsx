import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import { useQueryParams } from '../../hooks/useQueryParams';
import { DataTable } from './table/data-table';
import { columns } from './table/columns';
import { TaskFilters } from './filters';
import type { TaskListFilter } from '../../lib/types';

export function TaskListView() {
  const { tasks, loading, error } = useTaskContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { getParam, setParams, clearParams } = useQueryParams();

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

    // Only update if we have query parameters
    if (status || type || priority || tag || searchTerm || assignedTo) {
      setFilters({
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(priority ? { priority } : {}),
        ...(tag ? { tag } : {}),
        ...(searchTerm ? { searchTerm } : {}),
        ...(assignedTo ? { assignedTo } : {}),
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

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.type && task.type !== filters.type) return false;
      if (filters.searchTerm && !task.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.tag && (!task.tags || !task.tags.includes(filters.tag))) return false;
      if (filters.assignedTo && task.assigned_to !== filters.assignedTo) return false;
      return true;
    });
  }, [tasks, filters]);

  // Handle task selection with navigation
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    navigate(routes.taskDetail(taskId));
  };

  // Handle creating a new task
  const handleCreateTask = () => {
    navigate(routes.taskCreate);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <Button onClick={handleCreateTask}>Create New Task</Button>
      </div>
      
      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        typeOptions={typeOptions}
        tagOptions={tagOptions}
        assigneeOptions={assigneeOptions}
      />
      
      <DataTable 
        columns={columns} 
        data={filteredTasks}
        onRowClick={(row) => handleTaskSelect(row.id)}
      />
    </div>
  );
}