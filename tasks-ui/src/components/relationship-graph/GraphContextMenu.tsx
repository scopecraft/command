import { useLocation } from 'wouter';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';
import type { Task } from '../../lib/types';

interface GraphContextMenuProps {
  task: Task;
  position: { x: number; y: number };
  onClose: () => void;
}

export function GraphContextMenu({ task, position, onClose }: GraphContextMenuProps) {
  const [, navigate] = useLocation();
  
  // View task details
  const handleViewTask = () => {
    navigate(routes.taskDetail(task.id));
  };
  
  // Edit task
  const handleEditTask = () => {
    navigate(routes.taskEdit(task.id));
  };

  // Calculate position to stay in viewport
  const style = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };
  
  return (
    <div 
      className="fixed z-50 w-60 rounded-md shadow-lg bg-background border border-border p-3"
      style={style}
    >
      <div className="mb-3 pb-2 border-b border-border">
        <h3 className="text-sm font-medium mb-1">Task Actions</h3>
        <p className="text-xs text-muted-foreground truncate">
          {task.id}: {task.title}
        </p>
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewTask}
        >
          View Task Details
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEditTask}
        >
          Edit Task
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}