import { createFileRoute, Outlet } from '@tanstack/react-router'
import React from 'react'
import { useParent, useUpdateTask } from '../../lib/api/hooks'
import { ParentTaskView } from '../../components/v2/ParentTaskView'

export const Route = createFileRoute('/parents/$parentId')({
  component: ParentDetailPage,
})

function ParentDetailPage() {
  const { parentId, subtaskId } = Route.useParams() as { parentId: string; subtaskId?: string }
  
  // All hooks must be called before any conditional returns
  const { data: parentData, isLoading, error } = useParent(parentId)
  const updateTask = useUpdateTask()
  
  const [isEditing, setIsEditing] = React.useState(false)
  const [content, setContent] = React.useState('')
  
  // Update content when parent data loads
  React.useEffect(() => {
    if (parentData?.success && parentData.data) {
      // Parent overview content is in sections.instruction
      const overviewContent = parentData.data.overview?.sections?.instruction || ''
      setContent(overviewContent)
    }
  }, [parentData])
  
  // If we have a subtaskId, just render the outlet for the child route
  if (subtaskId) {
    return <Outlet />
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
    )
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
    )
  }

  // Event handlers
  const handleEdit = () => setIsEditing(true)
  
  const handleCancel = () => {
    if (parentData?.success && parentData.data) {
      const overviewContent = parentData.data.overview?.sections?.instruction || ''
      setContent(overviewContent)
    }
    setIsEditing(false)
  }

  const handleSave = () => {
    updateTask.mutate({
      id: parentId,
      updates: { instruction: content }
    }, {
      onSuccess: () => setIsEditing(false)
    })
  }

  const handleContentChange = (newContent: string) => setContent(newContent)

  // Extract data from parent response
  const parentTask = {
    ...parentData.data.metadata,
    ...parentData.data.overview
  }
  const subtasks = parentData.data.subtasks || []
  const supportingFiles = parentData.data.supportingFiles || []

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
  )
}