import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { z } from 'zod';
import { ParentTaskView } from '../../components/v2/ParentTaskView';
import { SimpleTaskView } from '../../components/v2/SimpleTaskView';
import { useSubtasks, useTask, useUpdateTask } from '../../lib/api/hooks';

// Content extraction helper no longer needed - MCP API provides clean content

const taskDetailSearchSchema = z.object({
  parent_id: z.string().optional(),
});

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailPage,
  validateSearch: taskDetailSearchSchema,
});

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const { parent_id } = Route.useSearch();

  const { data: taskData, isLoading, error } = useTask(taskId, parent_id);
  const updateTask = useUpdateTask();

  // API now provides normalized taskStructure field
  const isParentTask = taskData?.success && taskData.data?.taskStructure === 'parent';

  // Get subtasks if this is a parent task
  const { data: subtasksData } = useSubtasks({ parent_id: taskId }, { enabled: isParentTask });

  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState('');

  // Update content when task data loads - content is now clean from API
  React.useEffect(() => {
    if (taskData?.success && taskData.data) {
      setContent(taskData.data.content || '');
    }
  }, [taskData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !taskData?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error loading task</div>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Task not found'}
          </p>
        </div>
      </div>
    );
  }

  // Event handlers
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (taskData?.success && taskData.data) {
      setContent(taskData.data.content || '');
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    updateTask.mutate(
      {
        id: taskId,
        parent_id,
        updates: { content: content },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleContentChange = (newContent: string) => setContent(newContent);

  // Render appropriate view based on task type
  const task = taskData.data;
  const subtasks = subtasksData?.success ? subtasksData.data : [];

  if (isParentTask) {
    return (
      <ParentTaskView
        task={task}
        subtasks={subtasks}
        content={content}
        isEditing={isEditing}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onContentChange={handleContentChange}
        isUpdating={updateTask.isPending}
      />
    );
  }

  return (
    <SimpleTaskView
      task={task}
      content={content}
      isEditing={isEditing}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onSave={handleSave}
      onContentChange={handleContentChange}
      isUpdating={updateTask.isPending}
    />
  );
}
