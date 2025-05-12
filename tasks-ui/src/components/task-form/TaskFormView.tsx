import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';

export function TaskFormView({ taskId = null }: { taskId?: string | null }) {
  const { tasks, createTask } = useTaskContext();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('🟡 To Do');
  const [type, setType] = useState('📋 Task');
  const [priority, setPriority] = useState('▶️ Medium');
  const [content, setContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Load task data when in edit mode
  useEffect(() => {
    if (taskId) {
      setIsEditMode(true);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setStatus(task.status);
        setType(task.type);
        setPriority(task.priority || '▶️ Medium');
        setContent(task.content?.split('\n').slice(1).join('\n').trim() || '');
      }
    }
  }, [taskId, tasks]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    
    const taskData = {
      title,
      status,
      type,
      priority,
      content: `# ${title}\n\n${content}`
    };
    
    try {
      await createTask(taskData as any);
      alert('Task created successfully!');
      
      // Navigate to task list
      navigate(routes.taskList);
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. See console for details.');
    }
  };
  
  const handleCancel = () => {
    navigate(routes.taskList);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Edit Task' : 'Create New Task'}
      </h1>
      
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
            required
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <select
              id="type"
              className="rounded-md bg-input px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
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
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}