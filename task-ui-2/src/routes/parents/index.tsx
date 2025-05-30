import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useParentList } from '../../lib/api/hooks'
import { TaskTable } from '../../components/v2/TaskTable'
import { V2Sidebar } from '../../components/v2/Sidebar'
import { PageHeader, PageDescription } from '../../components/ui/page-header'

const parentListSearchSchema = z.object({
  location: z.union([z.string(), z.array(z.string())]).optional(),
  area: z.string().optional(),
  include_progress: z.boolean().optional().default(true),
})

export const Route = createFileRoute('/parents/')({
  component: ParentsListPage,
  validateSearch: parentListSearchSchema,
})

function ParentsListPage() {
  const searchParams = Route.useSearch()
  
  // Get parent tasks with progress stats
  const { data, isLoading, error } = useParentList({
    location: searchParams.location,
    area: searchParams.area,
    include_progress: searchParams.include_progress,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <V2Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading parent tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <V2Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Error loading parent tasks</div>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load parent tasks'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const parents = data?.success ? data.data : []

  return (
    <div className="flex min-h-screen bg-background">
      <V2Sidebar />
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-8">
          <div className="max-w-7xl mx-auto">
            <PageHeader>Parent Tasks</PageHeader>
            <PageDescription>
              Complex tasks with multiple subtasks and progress tracking
            </PageDescription>
            
            <div className="mt-8">
              <TaskTable 
                tasks={parents}
                showTypeFilter={false} // Parent tasks only
                defaultFilters={{
                  types: ['parent']
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}