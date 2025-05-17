import { useLocation } from 'wouter';
import { routes } from '../../lib/routes';
import { Button } from '../ui/button';

export function HomePage() {
  // Use the wouter hook for programmatic navigation
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="border border-border rounded-md bg-card p-8 max-w-md w-full">
        <div className="flex flex-col gap-4 items-center">
          <div className="text-2xl font-bold">Task UI</div>
          <div className="text-muted-foreground text-sm">
            A terminal-inspired task management interface
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <Button variant="outline" onClick={() => navigate(routes.taskCreate)}>
            Create Task
          </Button>
          <Button onClick={() => navigate(routes.taskList)}>View Tasks</Button>
          <Button variant="ghost" onClick={() => navigate(routes.prompt)} className="col-span-2">
            Open Claude Assistant
          </Button>
        </div>
      </div>
    </div>
  );
}
