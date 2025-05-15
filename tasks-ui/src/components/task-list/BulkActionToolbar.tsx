import { Button } from "../ui/button";
import { useState } from "react";
import type { Task } from "../../lib/types/index";
import { useTaskContext } from "../../context/TaskContext";
import { useFeatureContext } from "../../context/FeatureContext";
import { useAreaContext } from "../../context/AreaContext";
import { useToast } from "../../hooks/useToast";
import { Folder, FolderOpen, X, MoveHorizontal, Trash } from "lucide-react";

interface BulkActionToolbarProps {
  selectedTaskIds: string[];
  selectedTasks: Task[];
  onClearSelection: () => void;
}

export function BulkActionToolbar({
  selectedTaskIds,
  selectedTasks,
  onClearSelection,
}: BulkActionToolbarProps) {
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const { features } = useFeatureContext();
  const { areas } = useAreaContext();
  const { bulkMoveTasks, deleteTask, refreshTasks } = useTaskContext();
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleMove = async (targetId: string | null) => {
    if (selectedTaskIds.length === 0) return;

    setIsMoving(true);
    
    try {
      let options = {};
      
      // If targetId is null, we're moving to no feature/area
      if (targetId === null) {
        options = {}; // No specific target
      } 
      // Handle feature move
      else if (targetId.startsWith('FEATURE_')) {
        const featureId = targetId.replace('FEATURE_', '');
        options = { targetFeature: featureId };
      } 
      // Handle area move
      else if (targetId.startsWith('AREA_')) {
        const areaId = targetId.replace('AREA_', '');
        options = { targetArea: areaId };
      }
      
      const result = await bulkMoveTasks(selectedTaskIds, options);
      
      if (result.success) {
        onClearSelection();
        setShowMoveDialog(false);
      }
    } catch (error) {
      toast.error('An error occurred while moving tasks');
      console.error('Error moving tasks:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTaskIds.length === 0) return;
    
    // Confirm before deletion
    if (!window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} task(s)? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    let successCount = 0;
    let failCount = 0;
    
    try {
      // Delete tasks one by one
      for (const taskId of selectedTaskIds) {
        const result = await deleteTask(taskId);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }
      
      // Display results
      if (successCount > 0 && failCount === 0) {
        toast.success(`Successfully deleted ${successCount} task(s)`);
        onClearSelection();
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`Deleted ${successCount} task(s), but failed to delete ${failCount} task(s)`);
      } else {
        toast.error('Failed to delete any tasks');
      }
      
      // Refresh the task list
      refreshTasks();
    } catch (error) {
      toast.error('An error occurred while deleting tasks');
      console.error('Error deleting tasks:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const count = selectedTaskIds.length;
  
  return (
    <div className="bg-accent/30 border border-border rounded-md p-3 mb-4 flex flex-wrap justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {count} task{count !== 1 ? 's' : ''} selected
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClearSelection}
          className="h-8"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setShowMoveDialog(!showMoveDialog)}
          disabled={isMoving || count === 0}
          className="h-8"
        >
          <MoveHorizontal className="h-4 w-4 mr-1" />
          Move to...
        </Button>
        
        <Button 
          variant="destructive"
          size="sm"
          onClick={handleDeleteSelected}
          disabled={isDeleting || count === 0}
          className="h-8"
        >
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
      
      {/* Move dialog */}
      {showMoveDialog && (
        <div className="w-full mt-2 border border-border bg-background rounded-md p-2">
          <h3 className="text-sm font-medium mb-2">Move {count} task{count !== 1 ? 's' : ''} to:</h3>
          
          <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
            {/* Option to remove from feature/area */}
            <button
              className="flex items-center gap-2 w-full px-2 py-1.5 text-left rounded hover:bg-accent/50 text-sm"
              onClick={() => handleMove(null)}
              disabled={isMoving}
            >
              <span>No Feature/Area</span>
            </button>
            
            {/* Features section */}
            {features.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-1">
                  Features
                </div>
                {features.map(feature => (
                  <button
                    key={feature.id}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-left rounded hover:bg-accent/50 text-sm"
                    onClick={() => handleMove(feature.id)}
                    disabled={isMoving}
                  >
                    <Folder className="h-4 w-4" />
                    <span>{feature.name}</span>
                  </button>
                ))}
              </>
            )}
            
            {/* Areas section */}
            {areas.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-1">
                  Areas
                </div>
                {areas.map(area => (
                  <button
                    key={area.id}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-left rounded hover:bg-accent/50 text-sm"
                    onClick={() => handleMove(area.id)}
                    disabled={isMoving}
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>{area.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>
          
          <div className="mt-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowMoveDialog(false)}
              className="h-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}