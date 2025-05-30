import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Button } from '../ui/button'
import { TaskTypeIcon } from './TaskTypeIcon'
import { StatusBadge, PriorityIndicator, WorkflowStateBadge } from './WorkflowStateBadge'
import { ClaudeAgentButton } from './ClaudeAgentButton'
import { SubtaskList } from './SubtaskList'
import { SubtasksIcon, DocumentsIcon } from '../../lib/icons'

interface ParentTaskViewProps {
  task: any
  subtasks: any[]
  content: string
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onContentChange: (content: string) => void
  isUpdating?: boolean
}

export function ParentTaskView({ 
  task, 
  subtasks,
  content, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave, 
  onContentChange,
  isUpdating = false 
}: ParentTaskViewProps) {
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
                <div className="prose prose-sm dark:prose-invert max-w-none cursor-text" onClick={onEdit}>
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
                  {subtasks.filter((t) => t.status === 'Done').length}/{subtasks.length}
                </div>
              </div>
              
              {/* Progress Bar */}
              {subtasks.length > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round((subtasks.filter(t => t.status === 'Done').length / subtasks.length) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((subtasks.filter(t => t.status === 'Done').length / subtasks.length) * 100)}% complete
                  </div>
                </div>
              )}

              {/* Condensed Subtask List */}
              {subtasks.length > 0 ? (
                <SubtaskList
                  subtasks={subtasks}
                  variant="compact"
                  onTaskClick={(task) => console.log('Navigate to task detail:', task.id)}
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
                <div className="text-sm text-muted-foreground">
                  0
                </div>
              </div>

              {/* No Documents State */}
              <div className="text-center py-4 text-muted-foreground text-sm">
                No documents yet
              </div>

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
    </div>
  )
}