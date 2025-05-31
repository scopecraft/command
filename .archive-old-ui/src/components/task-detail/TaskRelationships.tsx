import { useLocation } from 'wouter';
import { routes } from '../../lib/routes';
import type { Task } from '../../lib/types';

interface TaskRelationshipsProps {
  task: Task;
  relatedTasks: Task[];
}

export function TaskRelationships({ task, relatedTasks }: TaskRelationshipsProps) {
  const [, navigate] = useLocation();

  const handleTaskClick = (taskId: string) => {
    navigate(routes.taskDetail(taskId));
  };

  return (
    <div className="bg-card p-4 rounded-md border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTasks.map((relatedTask) => {
          // Determine relationship type
          let relationshipType = '';
          let relationClass = '';

          if (task.depends_on?.includes(relatedTask.id)) {
            relationshipType = 'Depends on';
            relationClass = 'text-orange-500';
          } else if (relatedTask.depends_on?.includes(task.id)) {
            relationshipType = 'Blocked by';
            relationClass = 'text-red-500';
          } else if (task.parent_task === relatedTask.id) {
            relationshipType = 'Parent';
            relationClass = 'text-blue-500';
          } else if (relatedTask.parent_task === task.id) {
            relationshipType = 'Child';
            relationClass = 'text-blue-300';
          } else if (task.previous_task === relatedTask.id) {
            relationshipType = 'Previous';
            relationClass = 'text-purple-500';
          } else if (task.next_task === relatedTask.id) {
            relationshipType = 'Next';
            relationClass = 'text-green-500';
          }

          return (
            <div
              key={relatedTask.id}
              className="border border-border rounded-md p-3 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => handleTaskClick(relatedTask.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-sm">{relatedTask.title}</div>
                  <div className="text-xs text-muted-foreground">{relatedTask.id}</div>
                </div>
                <div
                  className={`text-xs font-medium ${relationClass} px-2 py-1 bg-background rounded-md`}
                >
                  {relationshipType}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <div className="text-muted-foreground">{relatedTask.status}</div>
                <div className="text-muted-foreground">{relatedTask.priority}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
