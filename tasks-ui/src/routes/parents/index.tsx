import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ParentTaskListView } from '../../components/v2/ParentTaskListView';
import { useParentList } from '../../lib/api/hooks';

const parentSearchSchema = z.object({
  search: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  workflow: z.union([z.string(), z.array(z.string())]).optional(),
  area: z.union([z.string(), z.array(z.string())]).optional(),
});

export const Route = createFileRoute('/parents/')({
  component: ParentsPage,
  validateSearch: parentSearchSchema,
});

function ParentsPage() {
  const search = Route.useSearch();

  // Get parent tasks with progress info from all locations
  const { data, isLoading, error } = useParentList({
    location: ['backlog', 'current', 'archive'],
    include_progress: true,
    include_subtasks: false,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading parent tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error loading parent tasks</div>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ParentTaskListView data={data} searchParams={search} />
    </div>
  );
}
