import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { z } from 'zod';
import { ParentTaskView } from '../../components/v2/ParentTaskView';
import { SimpleTaskView } from '../../components/v2/SimpleTaskView';
import { useSubtasks, useTask } from '../../lib/api/hooks';

// Content extraction helper no longer needed - MCP API provides clean content
// Edit state management moved to individual SectionEditor components

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

  // API now provides normalized taskStructure field
  const isParentTask = taskData?.success && taskData.data?.taskStructure === 'parent';

  // Get subtasks if this is a parent task
  const { data: subtasksData } = useSubtasks({ parent_id: taskId }, { enabled: isParentTask });

  // State management moved to individual SectionEditor components
  // Content is passed directly to components for parsing

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
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

  // Event handlers removed - SectionEditor components handle their own state

  // Render appropriate view based on task type
  const task = taskData.data;
  const subtasks = subtasksData?.success ? subtasksData.data : [];
  const content = task?.content || '';

  if (isParentTask) {
    return (
      <ParentTaskView
        task={task}
        subtasks={subtasks}
        content={content}
        // Legacy props for backward compatibility
        isEditing={false}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
        onContentChange={() => {}}
        isUpdating={false}
      />
    );
  }

  return (
    <SimpleTaskView
      task={task}
      content={content}
      // Legacy props for backward compatibility
      isEditing={false}
      onEdit={() => {}}
      onCancel={() => {}}
      onSave={() => {}}
      onContentChange={() => {}}
      isUpdating={false}
    />
  );
}
