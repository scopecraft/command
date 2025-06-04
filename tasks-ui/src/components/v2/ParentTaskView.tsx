import { useDeleteTask } from '@/lib/api/hooks';
import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { DocumentsIcon, SubtasksIcon } from '../../lib/icons';
import { getTaskUrl } from '../../lib/task-routing';
import { Button } from '../ui/button';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { ClaudeAgentButton } from './ClaudeAgentButton';
import { SubtaskList } from './SubtaskList';
import { TaskTypeIcon } from './TaskTypeIcon';
import { PriorityIndicator, StatusBadge, WorkflowStateBadge } from './WorkflowStateBadge';

interface ParentTaskViewProps {
  task: any;
  subtasks: any[];
  documents?: any[];
  content: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onContentChange: (content: string) => void;
  isUpdating?: boolean;
}

export function ParentTaskView({
  task,
  subtasks,
  documents = [],
  content,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onContentChange,
  isUpdating = false,
}: ParentTaskViewProps) {
  const navigate = useNavigate();
  const metadata = task.metadata || task;
  const deleteTask = useDeleteTask();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cascadeDelete, setCascadeDelete] = useState(false);

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
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <TaskTypeIcon type={metadata.type || 'feature'} />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">{metadata.title}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <StatusBadge status={metadata.status || 'To Do'} />
                  <PriorityIndicator priority={metadata.priority || 'Medium'} />
                  <WorkflowStateBadge workflow={metadata.workflowState || 'backlog'} />
                  {metadata.tags && metadata.tags.length > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      {metadata.tags.map((tag) => (
                        <span key={tag} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </>
                  )}
                </div>
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
              <ClaudeAgentButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview - Main Content (2/3) */}
          <div className="lg:col-span-2">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Edit Overview</h2>
                  <div className="flex items-center gap-2">
                    <Button onClick={onCancel} variant="ghost" size="sm">
                      Cancel
                    </Button>
                    <Button onClick={onSave} variant="atlas" size="sm" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg">
                  <textarea
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    className="w-full h-96 bg-background text-foreground p-4 font-mono text-sm resize-none focus:outline-none rounded-lg"
                    placeholder="Enter overview content using Markdown..."
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Supports Markdown formatting (headers, lists, links, etc.)
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="group relative">
                <Button
                  onClick={onEdit}
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  Edit
                </Button>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none cursor-text"
                  onClick={onEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onEdit();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {content || '*No overview yet. Click Edit to add details.*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
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
