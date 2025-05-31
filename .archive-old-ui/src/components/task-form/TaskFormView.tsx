import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTaskContext } from '../../context/TaskContext';
import { useToast } from '../../hooks/useToast';
import { routes } from '../../lib/routes';
import { Button } from '../ui/button';

export function TaskFormView({ taskId = null }: { taskId?: string | null }) {
  const { tasks, createTask, updateTask, loading } = useTaskContext();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('🟡 To Do');
  const [type, setType] = useState('📋 Task');
  const [priority, setPriority] = useState('▶️ Medium');
  const [content, setContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Load task data when in edit mode
  useEffect(() => {
    if (taskId) {
      setIsEditMode(true);
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setStatus(task.status);
        setType(task.type);
        setPriority(task.priority || '▶️ Medium');
        setContent(task.content?.split('\n').slice(1).join('\n').trim() || '');
      } else if (!loading) {
        // Task not found and not still loading
        toast.error(`Task with ID ${taskId} not found`);
        navigate(routes.taskList);
      }
    }
  }, [taskId, tasks, loading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const taskData = {
        id: isEditMode ? taskId : undefined,
        title,
        status,
        type,
        priority,
        content: `# ${title}\n\n${content}`,
      };

      let result;
      if (isEditMode && taskId) {
        result = await updateTask(taskData as any);
      } else {
        result = await createTask(taskData as any);
      }

      if (result.success) {
        toast.success(`Task ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate(isEditMode ? routes.taskDetail(taskId!) : routes.taskList);
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} task`);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(
        `Failed to ${isEditMode ? 'update' : 'create'} task: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && taskId) {
      navigate(routes.taskDetail(taskId));
    } else {
      navigate(routes.taskList);
    }
  };

  if (loading && isEditMode) {
    return <div className="container mx-auto p-4 text-center">Loading task data...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">{isEditMode ? 'Edit Task' : 'Create New Task'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid gap-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            className="w-full rounded-md bg-input px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <select
              id="type"
              className="rounded-md bg-input px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={submitting}
            >
              <option value="📋 Task">📋 Task</option>
              <option value="🌟 Feature">🌟 Feature</option>
              <option value="🐛 Bug">🐛 Bug</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              className="rounded-md bg-input px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
            >
              <option value="🟡 To Do">🟡 To Do</option>
              <option value="🔵 In Progress">🔵 In Progress</option>
              <option value="🟢 Done">🟢 Done</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              className="rounded-md bg-input px-3 py-2 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={submitting}
            >
              <option value="🔽 Low">🔽 Low</option>
              <option value="▶️ Medium">▶️ Medium</option>
              <option value="🔼 High">🔼 High</option>
              <option value="🔥 Highest">🔥 Highest</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="content" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="content"
            className="min-h-32 w-full rounded-md bg-input px-3 py-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
