import { useLocation, useRoute } from 'wouter';
import { useQueryParams } from '../../hooks/useQueryParams';
import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import { formatDate, hasDependencies } from '../../lib/utils/format';
import { TaskRelationships } from './TaskRelationships';
import { TaskMetadata } from './TaskMetadata';
import { TaskContent } from './TaskContent';
import { ErrorBoundary } from '../layout/ErrorBoundary';
import { TaskDetailFallback } from './TaskDetailFallback';

export function TaskDetailViewInner() {
  const [, params] = useRoute<{ id: string }>(routes.taskDetail(':id'));
  const id = params?.id;
  const { tasks, loading, error } = useTaskContext();
  const [, navigate] = useLocation();
  const { getParams } = useQueryParams();
  const [task, setTask] = useState(tasks.find(t => t.id === id));

  // Update task when tasks list changes
  useEffect(() => {
    const foundTask = tasks.find(t => t.id === id);
    setTask(foundTask);
  }, [tasks, id]);

  const handleEditClick = () => {
    navigate(routes.taskEdit(id));
  };

  const handleBackClick = () => {
    // Preserve filter parameters when going back to the list
    const params = getParams();
    const queryString = params.toString();

    // Navigate back to the task list with any existing query parameters
    if (queryString) {
      navigate(`${routes.taskList}?${queryString}`);
    } else {
      navigate(routes.taskList);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading task details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  if (!task) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-muted-foreground">Task not found</p>
        <Button onClick={handleBackClick}>Back to Tasks</Button>
      </div>
    );
  }

  // Get related tasks (dependencies, blockers, children, etc.)
  const relatedTasks = tasks.filter(t => {
    // Find dependencies
    if (task.depends_on?.includes(t.id)) return true;
    // Find tasks that depend on this task
    if (t.depends_on?.includes(task.id)) return true;
    // Find parent task
    if (task.parent_task === t.id) return true;
    // Find child tasks
    if (t.parent_task === task.id) return true;
    // Find previous/next tasks
    if (task.previous_task === t.id || task.next_task === t.id) return true;
    if (t.previous_task === task.id || t.next_task === task.id) return true;
    
    return false;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackClick}
          >
            Back
          </Button>
          <h1 className="text-xl font-semibold">{task.title}</h1>
        </div>
        <Button onClick={handleEditClick}>Edit Task</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* On mobile, show content before metadata for better UX */}
        <div className="order-2 lg:order-1 space-y-6">
          <TaskMetadata task={task} />
        </div>

        {/* Content column - larger on desktop, shown first on mobile */}
        <div className="lg:col-span-2 order-1 lg:order-2 space-y-6 mb-6 lg:mb-0">
          <TaskContent task={task} />
        </div>
      </div>

      {/* Related tasks */}
      {relatedTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Related Tasks</h2>
          <TaskRelationships 
            task={task} 
            relatedTasks={relatedTasks} 
          />
        </div>
      )}
    </div>
  );
}

export function TaskDetailView() {
  const [, params] = useRoute<{ id: string }>(routes.taskDetail(':id'));
  const id = params?.id;
  const { refreshTasks } = useTaskContext();

  return (
    <ErrorBoundary fallback={<TaskDetailFallback taskId={id} onRetry={refreshTasks} />}>
      <TaskDetailViewInner />
    </ErrorBoundary>
  );
}