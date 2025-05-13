import { useState } from 'react';
import { useTaskContext } from '../../../context/TaskContext';
import { Button } from '../../ui/button';
import { QuickEditStatus } from './QuickEditStatus';
import { QuickEditPriority } from './QuickEditPriority';
import { useToast } from '../../../hooks/useToast';
import type { Task } from '../../../lib/types';

interface QuickEditMenuProps {
  task: Task;
  onClose: () => void;
}

export function QuickEditMenu({ task, onClose }: QuickEditMenuProps) {
  const { updateTask } = useTaskContext();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({...task});
  
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
  
  return (
    <div className="absolute top-full right-0 mt-1 z-50 w-60 rounded-md shadow-lg bg-card border border-border p-3">
      <div className="mb-3 pb-2 border-b border-border">
        <h3 className="text-sm font-medium mb-1">Quick Edit</h3>
        <p className="text-xs text-muted-foreground truncate">
          Task: {task.title}
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
      
      <div className="mt-4 flex justify-end space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}