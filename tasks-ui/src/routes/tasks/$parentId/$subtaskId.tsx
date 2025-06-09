import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Button } from '../../../components/ui/button';
import { ClaudeAgentButton } from '../../../components/v2/ClaudeAgentButton';
import { SubtaskList } from '../../../components/v2/SubtaskList';
import { TaskTypeIcon } from '../../../components/v2/TaskTypeIcon';
import { PriorityIndicator, StatusBadge } from '../../../components/v2/WorkflowStateBadge';
import { useParentTask, useSubtasks, useTask, useUpdateTask } from '../../../lib/api/hooks';
import { SubtasksIcon } from '../../../lib/icons';

// TODO: DELETE THIS HELPER FUNCTION ONCE CORE TEAM FIXES THE API
// Task created: add-par-to-get-tas-con-wit-05A
// The MCP API should provide a parameter to get content without frontmatter
// so UI doesn't need to parse and strip it manually
// Helper function to extract content without frontmatter
function extractContentWithoutFrontmatter(content: string): string {
  if (!content) return '';

  // Split content into lines
  const lines = content.split('\n');

  // Skip title line (starts with #)
  let startIndex = 0;
  if (lines[0]?.startsWith('# ')) {
    startIndex = 1;
  }

  // Skip empty line after title
  if (lines[startIndex] === '') {
    startIndex++;
  }

  // Find the end of frontmatter (look for ending ---)
  let endOfFrontmatter = startIndex;
  if (lines[startIndex] === '---') {
    // Find closing ---
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        endOfFrontmatter = i + 1;
        break;
      }
    }
  }

  // Skip empty line after frontmatter
  if (lines[endOfFrontmatter] === '') {
    endOfFrontmatter++;
  }

  // Return everything after frontmatter
  return lines.slice(endOfFrontmatter).join('\n').trim();
}

export const Route = createFileRoute('/tasks/$parentId/$subtaskId')({
  component: SubtaskDetailPage,
});

function SubtaskDetailPage() {
  const { parentId, subtaskId } = Route.useParams();

  const { data: subtaskData, isLoading, error } = useTask(subtaskId, parentId);
  const { data: parentData } = useParentTask(parentId);
  const { data: subtasksData } = useSubtasks({ parent_id: parentId });
  const updateTask = useUpdateTask();

  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState('');

  // Update content when task data loads
  React.useEffect(() => {
    if (subtaskData?.success && subtaskData.data) {
      // Extract content without frontmatter for editing
      const fullContent = subtaskData.data.content || '';
      const contentWithoutFrontmatter = extractContentWithoutFrontmatter(fullContent);
      setContent(contentWithoutFrontmatter);
    }
  }, [subtaskData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading subtask...</p>
        </div>
      </div>
    );
  }

  if (error || !subtaskData?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error loading subtask</div>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Subtask not found'}
          </p>
        </div>
      </div>
    );
  }

  const subtask = subtaskData.data;
  const parentTask = parentData?.success ? parentData.data : null;
  const subtasks = subtasksData?.success ? subtasksData.data : [];
  const metadata = subtask.metadata || subtask;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (subtaskData?.success && subtaskData.data) {
      // Reset to saved version without frontmatter
      const fullContent = subtaskData.data.content || '';
      const contentWithoutFrontmatter = extractContentWithoutFrontmatter(fullContent);
      setContent(contentWithoutFrontmatter);
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    updateTask.mutate(
      {
        id: subtaskId,
        parent_id: parentId,
        updates: {
          // Update the full content - V2 tasks use 'content' field for full markdown
          content: content,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Parent Context */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Parent Task Context */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TaskTypeIcon type={parentTask?.metadata?.type || 'feature'} />
            <button className="hover:text-foreground hover:underline">
              {parentTask?.metadata?.title || 'Parent Task'}
            </button>
            <span>/</span>
            <span className="font-mono">{metadata.sequenceNumber || '01'}</span>
          </div>

          {/* Subtask Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <TaskTypeIcon type={metadata.type || 'feature'} />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground">{metadata.title}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <StatusBadge status={metadata.status || 'To Do'} />
                  <PriorityIndicator priority={metadata.priority || 'Medium'} />
                  <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                    {metadata.sequenceNumber || '01'}
                  </span>
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
              <Button variant="ghost" size="sm">
                Extract to Task
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
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Edit Subtask</h2>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCancel} variant="ghost" size="sm">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant="atlas"
                      size="sm"
                      disabled={updateTask.isPending}
                    >
                      {updateTask.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-96 bg-background text-foreground p-4 font-mono text-sm resize-none focus:outline-none rounded-lg"
                    placeholder="Enter subtask content using Markdown..."
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Supports Markdown formatting. Use ## for section headers.
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="group relative">
                <Button
                  onClick={handleEdit}
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  Edit
                </Button>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none cursor-text"
                  onClick={handleEdit}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {content || '*No content yet. Click Edit to add details.*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Sibling Subtasks */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SubtasksIcon size="md" className="text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Sibling Subtasks</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  {subtasks.filter((t) => t.status === 'Done').length}/{subtasks.length}
                </div>
              </div>

              {subtasks.length > 0 ? (
                <SubtaskList
                  subtasks={subtasks}
                  variant="compact"
                  highlightTaskId={subtaskId}
                  onTaskClick={(task) => console.log('Navigate to subtask:', task.title)}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No sibling subtasks
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
