import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Button } from '../ui/button'
import { TaskTypeIcon } from './TaskTypeIcon'
import { StatusBadge, PriorityIndicator, WorkflowStateBadge } from './WorkflowStateBadge'
import { ClaudeAgentButton } from './ClaudeAgentButton'

interface SimpleTaskViewProps {
  task: any
  content: string
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onContentChange: (content: string) => void
  isUpdating?: boolean
}

export function SimpleTaskView({ 
  task, 
  content, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave, 
  onContentChange,
  isUpdating = false 
}: SimpleTaskViewProps) {
  const metadata = task.metadata || task

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
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Edit Task</h2>
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
                    placeholder="Enter task content using Markdown..."
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
                  onClick={onEdit}
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  Edit
                </Button>
                <div className="prose prose-sm dark:prose-invert max-w-none cursor-text" onClick={onEdit}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {content || '*No content yet. Click Edit to add details.*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Related Tasks Widget */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Related Tasks</h3>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground text-center py-4">
                  No related tasks found
                </div>
              </div>
              <Button className="w-full mt-3" variant="outline" size="sm">
                Link Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}