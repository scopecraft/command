import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';

export function TaskListView() {
  const { tasks, loading, error } = useTaskContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Handle task selection with navigation
  const handleTaskSelect = (taskId: string) => {
    console.log('Selected task:', taskId);
    setSelectedTaskId(taskId);
    navigate(routes.taskDetail(taskId));
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
        <Button>Create your first task</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Tasks</h1>
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="text-left p-3 text-sm font-medium">ID</th>
              <th className="text-left p-3 text-sm font-medium">Title</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-left p-3 text-sm font-medium">Type</th>
              <th className="text-left p-3 text-sm font-medium">Priority</th>
              <th className="text-right p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr 
                key={task.id} 
                className={`border-b border-border hover:bg-accent/20 transition-colors ${
                  selectedTaskId === task.id ? 'bg-accent/30' : ''
                }`}
                onClick={() => handleTaskSelect(task.id)}
              >
                <td className="p-3 text-sm">{task.id}</td>
                <td className="p-3 text-sm font-medium">{task.title}</td>
                <td className="p-3 text-sm">{task.status}</td>
                <td className="p-3 text-sm">{task.type}</td>
                <td className="p-3 text-sm">{task.priority || '—'}</td>
                <td className="p-3 text-sm text-right">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}