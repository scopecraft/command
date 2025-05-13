import { useState } from 'react';
import type { Task } from '../../lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '../ui/button';
import { useTaskContext } from '../../context/TaskContext';

interface TaskContentProps {
  task: Task;
}

export function TaskContent({ task }: TaskContentProps) {
  const { updateTask } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setContent(task.content || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedTask = { ...task, content };
      const result = await updateTask(updatedTask);
      if (result.success) {
        setIsEditing(false);
      } else {
        console.error('Failed to save task:', result.message);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // If there's no content, show a placeholder
  if (!task.content && !isEditing) {
    return (
      <div className="bg-card p-4 rounded-md border border-border min-h-[200px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Add Content
          </Button>
        </div>

        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No content available for this task.</p>
        </div>
      </div>
    );
  }

  // Edit mode - show textarea
  if (isEditing) {
    return (
      <div className="bg-card p-4 rounded-md border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Description</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="w-full">
          {/* Full-width Editor */}
          <div className="border border-border rounded-md p-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 bg-background text-foreground p-2 font-mono text-sm resize-none focus:outline-none"
              placeholder="Enter task description using Markdown..."
              rows={20}
            />
          </div>

          {/* Small note about markdown */}
          <div className="mt-2 text-xs text-muted-foreground">
            <span>Supports Markdown formatting</span>
          </div>
        </div>
      </div>
    );
  }

  // View mode - show rendered markdown
  return (
    <div className="bg-card p-4 rounded-md border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Description</h2>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          Edit
        </Button>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-base prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-strong:font-bold prose-code:bg-muted prose-code:p-1 prose-code:rounded prose-code:text-foreground prose-code:font-mono prose-code:text-sm prose-pre:bg-muted prose-pre:text-foreground prose-pre:font-mono prose-pre:text-sm prose-pre:p-2 prose-pre:rounded-md prose-ol:text-foreground prose-ul:text-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {task.content || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
}