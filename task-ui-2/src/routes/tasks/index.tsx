import { createFileRoute } from '@tanstack/react-router'
import { TaskManagementView } from '../../components/v2/TaskManagementView'

export const Route = createFileRoute('/tasks/')({
  component: TasksPage,
  loader: async () => {
    console.log('Loading tasks via API...')
    const response = await fetch('/api/tasks?include_content=false&task_type=top-level')
    const result = await response.json()
    console.log('Tasks loaded:', result)
    return result
  }
})

function TasksPage() {
  const data = Route.useLoaderData()
  
  return (
    <div className="h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">
          Found {data.success ? data.data?.length || 0 : 0} tasks
        </p>
      </div>
      <TaskManagementView />
    </div>
  )
}