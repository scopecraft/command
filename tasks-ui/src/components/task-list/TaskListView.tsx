import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import { DataTable } from './table/data-table';
import { columns } from './table/columns';
import { TaskFilters } from './filters';
import type { TaskListFilter } from '../../lib/types/index';

export function TaskListView() {
  const { tasks, loading, error } = useTaskContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [, navigate] = useLocation();
  
  // State for filters
  const [filters, setFilters] = useState<TaskListFilter>({});

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

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.type && task.type !== filters.type) return false;
      if (filters.searchTerm && !task.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.tag && (!task.tags || !task.tags.includes(filters.tag))) return false;
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
        onFilterChange={setFilters}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        typeOptions={typeOptions}
        tagOptions={tagOptions}
      />
      
      <DataTable 
        columns={columns} 
        data={filteredTasks}
        onRowClick={(row) => handleTaskSelect(row.id)}
      />
    </div>
  );
}