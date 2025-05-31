import { createFileRoute } from '@tanstack/react-router'
import { WorkflowStateBadge } from '../../components/v2/WorkflowStateBadge'

export const Route = createFileRoute('/workflow/')({
  component: WorkflowPage,
})

function WorkflowPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Workflow Dashboard</h1>
        <p className="text-muted-foreground">Track work across different states</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Backlog Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <WorkflowStateBadge workflow="backlog" />
            <span className="text-sm text-muted-foreground">Planning</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-center text-muted-foreground">No tasks in backlog</p>
          </div>
        </div>
        
        {/* Current Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <WorkflowStateBadge workflow="current" />
            <span className="text-sm text-muted-foreground">In Progress</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-center text-muted-foreground">No tasks in progress</p>
          </div>
        </div>
        
        {/* Archive Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <WorkflowStateBadge workflow="archive" />
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-center text-muted-foreground">No archived tasks</p>
          </div>
        </div>
      </div>
    </div>
  )
}