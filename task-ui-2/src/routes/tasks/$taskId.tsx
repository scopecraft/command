import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import React from 'react'
import { useTask, useSubtasks, useUpdateTask } from '../../lib/api/hooks'
import { SimpleTaskView } from '../../components/v2/SimpleTaskView'
import { ParentTaskView } from '../../components/v2/ParentTaskView'

// TODO: DELETE THIS HELPER FUNCTION ONCE CORE TEAM FIXES THE API
// Task created: add-par-to-get-tas-con-wit-05A
// The MCP API should provide a parameter to get content without frontmatter
// so UI doesn't need to parse and strip it manually
// Helper function to extract content without frontmatter
function extractContentWithoutFrontmatter(content: string): string {
  if (!content) return ''
  
  // Split content into lines
  const lines = content.split('\n')
  
  // Skip title line (starts with #)
  let startIndex = 0
  if (lines[0]?.startsWith('# ')) {
    startIndex = 1
  }
  
  // Skip empty line after title
  if (lines[startIndex] === '') {
    startIndex++
  }
  
  // Find the end of frontmatter (look for ending ---)
  let endOfFrontmatter = startIndex
  if (lines[startIndex] === '---') {
    // Find closing ---
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        endOfFrontmatter = i + 1
        break
      }
    }
  }
  
  // Skip empty line after frontmatter
  if (lines[endOfFrontmatter] === '') {
    endOfFrontmatter++
  }
  
  // Return everything after frontmatter
  return lines.slice(endOfFrontmatter).join('\n').trim()
}

const taskDetailSearchSchema = z.object({
  parent_id: z.string().optional(),
})

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailPage,
  validateSearch: taskDetailSearchSchema,
})

function TaskDetailPage() {
  const { taskId } = Route.useParams()
  const { parent_id } = Route.useSearch()
  
  const { data: taskData, isLoading, error } = useTask(taskId, parent_id)
  const updateTask = useUpdateTask()
  
  // Determine if this is a parent task
  const isParentTask = taskData?.success && (taskData.data?.metadata?.isParentTask || taskData.data?.task_type === 'parent')
  
  // Get subtasks if this is a parent task
  const { data: subtasksData } = useSubtasks({ parent_id: taskId }, { enabled: isParentTask })
  
  const [isEditing, setIsEditing] = React.useState(false)
  const [content, setContent] = React.useState('')
  
  // Update content when task data loads
  React.useEffect(() => {
    if (taskData?.success && taskData.data) {
      const fullContent = taskData.data.content || ''
      const contentWithoutFrontmatter = extractContentWithoutFrontmatter(fullContent)
      setContent(contentWithoutFrontmatter)
    }
  }, [taskData])
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </div>
    )
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
    )
  }

  // Event handlers
  const handleEdit = () => setIsEditing(true)
  
  const handleCancel = () => {
    if (taskData?.success && taskData.data) {
      const fullContent = taskData.data.content || ''
      const contentWithoutFrontmatter = extractContentWithoutFrontmatter(fullContent)
      setContent(contentWithoutFrontmatter)
    }
    setIsEditing(false)
  }

  const handleSave = () => {
    updateTask.mutate({
      id: taskId,
      parent_id,
      updates: { content: content }
    }, {
      onSuccess: () => setIsEditing(false)
    })
  }

  const handleContentChange = (newContent: string) => setContent(newContent)

  // Render appropriate view based on task type
  const task = taskData.data
  const subtasks = subtasksData?.success ? subtasksData.data : []

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
    )
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
  )
}