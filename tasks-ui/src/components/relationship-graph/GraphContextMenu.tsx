import { useLocation } from 'wouter';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { QuickEditStatus } from '../task-list/quick-edit/QuickEditStatus';
import { QuickEditPriority } from '../task-list/quick-edit/QuickEditPriority';
import { useToast } from '../../hooks/useToast';
import { useState } from 'react';
import { routes } from '../../lib/routes';
import type { Task } from '../../lib/types';

interface GraphContextMenuProps {
  task: Task;
  position: { x: number; y: number };
  onClose: () => void;
}

export function GraphContextMenu({ task, position, onClose }: GraphContextMenuProps) {
  const { updateTask } = useTaskContext();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({...task});
  const [, navigate] = useLocation();
  
  // Handle status change
  const handleStatusChange = (status: string) => {
    setEditedTask(prev => ({
      ...prev,
      status
    }));
  };
  
  // Handle priority change
  const handlePriorityChange = (priority: string) => {
    setEditedTask(prev => ({
      ...prev,
      priority
    }));
  };
  
  // Save changes
  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateTask(editedTask);
      if (result.success) {
        toast.success(`Task "${task.title}" updated`);
        onClose();
      } else {
        toast.error(result.message || 'Failed to update task');
      }
    } catch (error) {
      toast.error('An error occurred while updating the task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
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
      className="fixed z-50 w-60 rounded-md shadow-lg bg-card border border-border p-3"
      style={style}
    >
      <div className="mb-3 pb-2 border-b border-border">
        <h3 className="text-sm font-medium mb-1">Task Actions</h3>
        <p className="text-xs text-muted-foreground truncate">
          {task.id}: {task.title}
        </p>
      </div>
      
      <div className="space-y-3">
        {/* Status Selector */}
        <div>
          <label className="text-xs font-medium mb-1 block">Status</label>
          <QuickEditStatus 
            value={editedTask.status} 
            onChange={handleStatusChange} 
          />
        </div>
        
        {/* Priority Selector */}
        <div>
          <label className="text-xs font-medium mb-1 block">Priority</label>
          <QuickEditPriority 
            value={editedTask.priority || ''} 
            onChange={handlePriorityChange} 
          />
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        
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
          Full Edit
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