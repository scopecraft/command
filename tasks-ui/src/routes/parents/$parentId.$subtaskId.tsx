import { Link, createFileRoute } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Button } from '../../components/ui/button';
import { SimpleTaskView } from '../../components/v2/SimpleTaskView';
import { useSubtasks, useTask, useUpdateTask } from '../../lib/api/hooks';

// Helper function to extract content without frontmatter
function extractContentWithoutFrontmatter(content: string): string {
  if (!content) return '';

  const lines = content.split('\n');

  let startIndex = 0;
  if (lines[0]?.startsWith('# ')) {
    startIndex = 1;
  }

  if (lines[startIndex] === '') {
    startIndex++;
  }

  let endOfFrontmatter = startIndex;
  if (lines[startIndex] === '---') {
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        endOfFrontmatter = i + 1;
        break;
      }
    }
  }

  if (lines[endOfFrontmatter] === '') {
    endOfFrontmatter++;
  }

  return lines.slice(endOfFrontmatter).join('\n').trim();
}

export const Route = createFileRoute('/parents/$parentId/$subtaskId')({
  component: SubtaskDetailPage,
});

function SubtaskDetailPage() {
  const { parentId, subtaskId } = Route.useParams();

  // Get subtask data with parent context
  const { data: taskData, isLoading, error } = useTask(subtaskId, parentId);
  const updateTask = useUpdateTask();

  // Get parent data for context
  const { data: parentData } = useTask(parentId);

  // Get all subtasks for navigation
  const { data: subtasksData } = useSubtasks({ parent_id: parentId });

  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState('');

  // Update content when task data loads
  React.useEffect(() => {
    if (taskData?.success && taskData.data) {
      const fullContent = taskData.data.content || '';
      const contentWithoutFrontmatter = extractContentWithoutFrontmatter(fullContent);
      setContent(contentWithoutFrontmatter);
    }
  }, [taskData]);

  // Find previous and next subtasks
  const subtasks = subtasksData?.success ? subtasksData.data : [];
  const currentIndex = subtasks.findIndex(
    (t) => t.id === subtaskId || t.metadata?.id === subtaskId
  );
  const prevSubtask = currentIndex > 0 ? subtasks[currentIndex - 1] : null;
  const nextSubtask = currentIndex < subtasks.length - 1 ? subtasks[currentIndex + 1] : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading subtask...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !taskData?.success) {
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

  // Event handlers
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (taskData?.success && taskData.data) {
      const fullContent = taskData.data.content || '';
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
        updates: { content: content },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleContentChange = (newContent: string) => setContent(newContent);

  // Render with parent context
  const task = taskData.data;
  const parentTitle = parentData?.success
    ? parentData.data.metadata?.title || parentData.data.title
    : 'Parent Task';

  return (
    <div className="min-h-screen bg-background">
      {/* Parent Context Bar */}
      <div className="bg-muted border-b">
        <div className="max-w-6xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/parents/$parentId"
                params={{ parentId }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {parentTitle}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">
                {task.metadata?.sequenceNumber || task.sequence || ''}{' '}
                {task.metadata?.title || task.title}
              </span>
            </div>

            {/* Subtask Navigation */}
            <div className="flex items-center gap-2">
              {prevSubtask && (
                <Link
                  to="/parents/$parentId/$subtaskId"
                  params={{ parentId, subtaskId: prevSubtask.id || prevSubtask.metadata?.id }}
                >
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {subtasks.length}
              </span>
              {nextSubtask && (
                <Link
                  to="/parents/$parentId/$subtaskId"
                  params={{ parentId, subtaskId: nextSubtask.id || nextSubtask.metadata?.id }}
                >
                  <Button variant="ghost" size="sm">
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Content */}
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
    </div>
  );
}
