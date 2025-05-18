import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useTaskContext } from '../../context/TaskContext';
import type { Task } from '../../lib/types';
import { Button } from '../ui/button';
import { MermaidDiagram } from './MermaidDiagram';

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
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
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
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (language === 'mermaid') {
                return (
                  <MermaidDiagram code={String(children).replace(/\n$/, '')} className="my-4" />
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {task.content || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
}
