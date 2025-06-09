import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { TaskManagementView } from '../../components/v2/TaskManagementView';
import { useTopLevelTasks } from '../../lib/api/hooks';

const taskSearchSchema = z.object({
  search: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  workflow: z.union([z.string(), z.array(z.string())]).optional(),
  area: z.union([z.string(), z.array(z.string())]).optional(),
  assignee: z.string().optional(),
});

export const Route = createFileRoute('/tasks/')({
  component: TasksPage,
  validateSearch: taskSearchSchema,
});

function TasksPage() {
  const { data, isLoading, error } = useTopLevelTasks();
  const search = Route.useSearch();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error loading tasks</div>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <TaskManagementView data={data} searchParams={search} />
    </div>
  );
}
