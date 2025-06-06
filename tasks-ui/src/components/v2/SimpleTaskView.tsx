import { useDeleteTask, useUpdateTask } from '@/lib/api/hooks';
import {
  type TaskSectionKey,
  type TaskSections,
  getSectionKeys,
  getSectionsByOrder,
} from '@/lib/task-sections';
import type { Task } from '@/lib/types';
import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { ClaudeAgentButton } from './ClaudeAgentButton';
import { SectionEditor } from './SectionEditor';
import { TaskTypeIcon } from './TaskTypeIcon';
import { PriorityIndicator, StatusBadge, WorkflowStateBadge } from './WorkflowStateBadge';

interface SimpleTaskViewProps {
  task: Task;
  content: string;
  // Legacy props for backward compatibility - no longer used
  isEditing?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onContentChange?: (content: string) => void;
  isUpdating?: boolean;
}

export function SimpleTaskView({
  task,
  content,
  // Legacy props ignored - section-based editing doesn't use global edit mode
}: SimpleTaskViewProps) {
  const metadata = task.metadata || task;
  const navigate = useNavigate();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sections, setSections] = useState<TaskSections>(
    Object.fromEntries(getSectionKeys().map((key) => [key, ''])) as TaskSections
  );

  // Use MCP-provided sections directly (no need to parse)
  useEffect(() => {
    if (task.sections) {
      // Use sections from MCP API
      setSections(task.sections as TaskSections);
    } else {
      // Fallback: empty sections if no sections provided
      setSections(Object.fromEntries(getSectionKeys().map((key) => [key, ''])) as TaskSections);
    }
  }, [task.sections]);

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync({ id: task.id });
      // Navigate back to the workflow list
      navigate({ to: `/workflow/${metadata.workflowState || 'current'}` });
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Error handling will be improved in a later step
    }
  };

  // Section save handlers
  const createSectionSaveHandler = useCallback(
    (sectionName: keyof TaskSections) => async (newContent: string) => {
      const updates: Record<string, string> = {};

      if (sectionName === 'log') {
        // For log sections, append as new entry
        updates.add_log_entry = newContent;
      } else {
        // For other sections, update directly
        updates[sectionName] = newContent;
      }

      await updateTask.mutateAsync({
        id: task.id,
        parent_id: metadata.parentId,
        updates,
      });

      // Update local state optimistically
      setSections((prev) => ({
        ...prev,
        [sectionName]: newContent,
      }));
    },
    [task.id, metadata.parentId, updateTask]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <TaskTypeIcon type={metadata.type || 'feature'} />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">{metadata.title}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <StatusBadge status={metadata.status || 'To Do'} />
                  <PriorityIndicator priority={metadata.priority || 'Medium'} />
                  <WorkflowStateBadge workflow={metadata.location || 'backlog'} />
                  {metadata.area && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">Area: {metadata.area}</span>
                    </>
                  )}
                  {metadata.assigned_to && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">@{metadata.assigned_to}</span>
                    </>
                  )}
                </div>
                {metadata.tags && metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {metadata.tags.map((tag) => (
                      <span key={tag} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button variant="ghost" size="sm">
                Convert to Parent
              </Button>
              <ClaudeAgentButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Content (2/3) */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Dynamic Section Editors */}
              {getSectionsByOrder().map((sectionKey) => (
                <SectionEditor
                  key={sectionKey}
                  section={sectionKey}
                  content={sections[sectionKey]}
                  onSave={createSectionSaveHandler(sectionKey)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Related Tasks Widget */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Related Tasks</h3>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground text-center py-4">No related tasks found</div>
              </div>
              <Button className="w-full mt-3" variant="outline" size="sm">
                Link Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Task"
        description={`Are you sure you want to delete "${metadata.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}
