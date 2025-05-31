import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { ParentTaskView } from '../../components/v2/ParentTaskView';
import { useParent, useUpdateTask } from '../../lib/api/hooks';

export const Route = createFileRoute('/parents/$parentId')({
  component: ParentDetailPage,
});

function ParentDetailPage() {
  const { parentId, subtaskId } = Route.useParams() as { parentId: string; subtaskId?: string };

  // All hooks must be called before any conditional returns
  const { data: parentData, isLoading, error } = useParent(parentId);
  const updateTask = useUpdateTask();

  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState('');

  // Update content when parent data loads - normalized API provides clean content
  React.useEffect(() => {
    if (parentData?.success && parentData.data) {
      setContent(parentData.data.content || '');
    }
  }, [parentData]);

  // If we have a subtaskId, just render the outlet for the child route
  if (subtaskId) {
    return <Outlet />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading parent task...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !parentData?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error loading parent task</div>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Parent task not found'}
          </p>
        </div>
      </div>
    );
  }

  // Event handlers
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (parentData?.success && parentData.data) {
      setContent(parentData.data.content || '');
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    updateTask.mutate(
      {
        id: parentId,
        updates: { instruction: content },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleContentChange = (newContent: string) => setContent(newContent);

  // Data is normalized from MCP API - direct usage
  const parentTask = parentData.data;
  const subtasks = parentData.data.subtasks || [];
  const supportingFiles = parentData.data.supportingFiles || [];

  return (
    <ParentTaskView
      task={parentTask}
      subtasks={subtasks}
      documents={supportingFiles}
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
