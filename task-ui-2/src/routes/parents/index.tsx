import { createFileRoute } from '@tanstack/react-router'
import { ParentTaskCard } from '../../components/v2/ParentTaskCard'
import { mockV2ParentTasks } from '../../lib/api/mock-data-v2'

export const Route = createFileRoute('/parents/')({
  component: ParentsPage,
})

function ParentsPage() {
  // For now, use mock data - will replace with real data later
  const parentTasks = mockV2ParentTasks

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Parent Tasks</h1>
        <p className="text-muted-foreground">Manage complex tasks with subtasks</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parentTasks.map((task) => (
          <ParentTaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}