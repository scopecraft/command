import { useDeleteTask, useUpdateTask } from '@/lib/api/hooks';
import {
  type TaskSectionKey,
  type TaskSections,
  getSectionKeys,
  getSectionsByOrder,
} from '@/lib/task-sections';
import type { ParentTask, SubTask } from '@/lib/types';
import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { DocumentsIcon, SubtasksIcon } from '../../lib/icons';
import { getTaskUrl } from '../../lib/task-routing';
import { Button } from '../ui/button';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { ClaudeAgentButton } from './ClaudeAgentButton';
import { MetadataEditor, type TaskMetadata } from './MetadataEditor';
import { SectionEditor } from './SectionEditor';
import { SubtaskList } from './SubtaskList';
import { TaskTypeIcon } from './TaskTypeIcon';
import { PriorityIndicator, StatusBadge, WorkflowStateBadge } from './WorkflowStateBadge';

interface ParentTaskViewProps {
  task: ParentTask;
  subtasks: SubTask[];
  documents?: string[];
  content: string;
  // Legacy props for backward compatibility - no longer used
  isEditing?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onContentChange?: (content: string) => void;
  isUpdating?: boolean;
}

type MetadataValue = string | string[] | undefined;

export function ParentTaskView({
  task,
  subtasks,
  documents = [],
  // Legacy props ignored - section-based editing doesn't use global edit mode
}: ParentTaskViewProps) {
  const navigate = useNavigate();
  const metadata = task.metadata || task;
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cascadeDelete, setCascadeDelete] = useState(false);
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
      await deleteTask.mutateAsync({ id: task.id, cascade: cascadeDelete });
      // Navigate back to the workflow list
      navigate({ to: `/workflow/${metadata.workflowState || 'current'}` });
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Error handling will be improved in a later step
    }
  };

  // Metadata update handler following established pattern
  const handleMetadataUpdate = useCallback(
    async (field: keyof TaskMetadata, value: MetadataValue) => {
      try {
        await updateTask.mutateAsync({
          id: task.id,
          updates: { [field]: value },
        });
      } catch (error) {
        console.error('Failed to update task metadata:', error);
        // Error handling will be improved in a later step
      }
    },
    [task.id, updateTask]
  );

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

  // Ensure subtasks have parent context for proper URL generation
  const subtasksWithParent = subtasks.map((subtask) => ({
    ...subtask,
    // Add parent task reference if not already present
    parent_task:
      subtask.parent_task || subtask.metadata?.parentTask || task.id || task.metadata?.id,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <TaskTypeIcon type={metadata.type || 'feature'} />
              <h1 className="text-2xl font-bold text-foreground">{metadata.title}</h1>
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
              <ClaudeAgentButton />
            </div>
          </div>
          <MetadataEditor
            taskId={task.id}
            metadata={{
              status: (metadata.status || 'todo') as 'todo' | 'in_progress' | 'done' | 'blocked',
              priority: (metadata.priority || 'medium') as 'highest' | 'high' | 'medium' | 'low',
              type: (metadata.type || 'feature') as
                | 'feature'
                | 'bug'
                | 'chore'
                | 'documentation'
                | 'test'
                | 'spike'
                | 'idea',
              area: metadata.area || 'general',
              workflowState: (metadata.location || metadata.workflowState || 'backlog') as
                | 'backlog'
                | 'current'
                | 'archive',
              assignee: metadata.assigned_to,
              tags: metadata.tags || [],
            }}
            onUpdate={handleMetadataUpdate}
            layout="horizontal"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview - Main Content (2/3) */}
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

          {/* Right Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Subtasks Widget */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SubtasksIcon size="md" className="text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Subtasks</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  {task.progress?.completed || 0}/{task.progress?.total || 0}
                </div>
              </div>

              {/* Progress Bar */}
              {task.progress?.total > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${task.progress?.percentage || 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {task.progress?.percentage || 0}% complete
                  </div>
                </div>
              )}

              {/* Condensed Subtask List */}
              {subtasks.length > 0 ? (
                <SubtaskList
                  subtasks={subtasksWithParent}
                  variant="compact"
                  onTaskClick={(task) => {
                    const url = getTaskUrl(task);
                    navigate({ to: url });
                  }}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No subtasks yet
                </div>
              )}

              {/* Subtask Actions */}
              <div className="mt-4 pt-3 border-t space-y-2">
                <Button className="w-full text-left" variant="atlas">
                  + Add Subtask
                </Button>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="secondary" size="sm">
                    ↕ Reorder
                  </Button>
                  <Button className="flex-1" variant="secondary" size="sm">
                    ⚹ Make Parallel
                  </Button>
                </div>
              </div>
            </div>

            {/* Documents Widget */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DocumentsIcon size="md" className="text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Documents</h3>
                </div>
                <div className="text-sm text-muted-foreground">{documents.length}</div>
              </div>

              {/* Documents List */}
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    // Extract document type from filename (e.g., "plan", "architecture", "design")
                    const docType = doc.toLowerCase().includes('plan')
                      ? 'plan'
                      : doc.toLowerCase().includes('architecture')
                        ? 'architecture'
                        : doc.toLowerCase().includes('design')
                          ? 'design'
                          : doc.toLowerCase().includes('analysis')
                            ? 'analysis'
                            : 'document';

                    return (
                      <button
                        key={doc}
                        type="button"
                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent/50 text-left transition-colors"
                        onClick={() => {
                          // Navigate to document or open in modal
                          console.log('Open document:', doc);
                        }}
                      >
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                          {docType}
                        </span>
                        <span className="text-sm truncate flex-1">{doc}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No documents yet
                </div>
              )}

              {/* Document Actions */}
              <div className="mt-4 pt-3 border-t space-y-2">
                <Button className="w-full text-left" variant="atlas">
                  + Add Document
                </Button>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="secondary" size="sm">
                    Plan
                  </Button>
                  <Button className="flex-1" variant="secondary" size="sm">
                    PRD
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Parent Task"
        description={`Are you sure you want to delete "${metadata.title}"?`}
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteTask.isPending}
      >
        {subtasks.length > 0 && (
          <div className="rounded-lg border p-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={cascadeDelete}
                onChange={(e) => setCascadeDelete(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Delete all subtasks</span>
            </label>
            <p className="mt-2 text-sm text-muted-foreground">
              {cascadeDelete
                ? `This will permanently delete all ${subtasks.length} subtask${subtasks.length > 1 ? 's' : ''}.`
                : 'Subtasks will be preserved and converted to standalone tasks.'}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
}
