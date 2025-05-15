import { useState } from 'react';
import type { Feature, Area, Task } from '../../lib/types/index';
import { useFeatureContext } from '../../context/FeatureContext';
import { useAreaContext } from '../../context/AreaContext';
import { moveTask } from '../../lib/api/core-client';
import { useToast } from '../../hooks/useToast';
import { Button } from '../ui/button';
import { ChevronDown, Check, Folder, FolderOpen } from 'lucide-react';

interface TaskMoveDropdownProps {
  task: Task;
  onMoveComplete?: () => void;
}

export function TaskMoveDropdown({ task, onMoveComplete }: TaskMoveDropdownProps) {
  const { features } = useFeatureContext();
  const { areas } = useAreaContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const toast = useToast();

  // Get the current feature or area the task belongs to
  const getCurrentLocation = () => {
    if (!task.subdirectory) return 'None';
    
    if (task.subdirectory.startsWith('FEATURE_')) {
      const featureName = task.subdirectory.replace('FEATURE_', '');
      const feature = features.find(f => f.id === task.subdirectory);
      return feature ? `Feature: ${feature.name}` : `Feature: ${featureName}`;
    } else if (task.subdirectory.startsWith('AREA_')) {
      const areaName = task.subdirectory.replace('AREA_', '');
      const area = areas.find(a => a.id === task.subdirectory);
      return area ? `Area: ${area.name}` : `Area: ${areaName}`;
    }
    
    return task.subdirectory;
  };

  const handleMove = async (targetId: string | null) => {
    setIsMoving(true);
    
    try {
      // If targetId is null, we're moving to no feature/area
      if (targetId === null) {
        const result = await moveTask(task.id, {});
        
        if (result.success) {
          toast.success(`Task moved successfully`);
          setIsOpen(false);
          onMoveComplete?.();
        } else {
          toast.error(result.message || 'Failed to move task');
        }
      } 
      // Handle feature move
      else if (targetId.startsWith('FEATURE_')) {
        const featureId = targetId.replace('FEATURE_', '');
        const result = await moveTask(task.id, { targetFeature: featureId });
        
        if (result.success) {
          toast.success(`Task moved to feature successfully`);
          setIsOpen(false);
          onMoveComplete?.();
        } else {
          toast.error(result.message || 'Failed to move task to feature');
        }
      } 
      // Handle area move
      else if (targetId.startsWith('AREA_')) {
        const areaId = targetId.replace('AREA_', '');
        const result = await moveTask(task.id, { targetArea: areaId });
        
        if (result.success) {
          toast.success(`Task moved to area successfully`);
          setIsOpen(false);
          onMoveComplete?.();
        } else {
          toast.error(result.message || 'Failed to move task to area');
        }
      }
    } catch (error) {
      toast.error('An error occurred while moving the task');
      console.error('Error moving task:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const currentLocation = getCurrentLocation();

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isMoving}
      >
        <span className="truncate">{currentLocation}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-md">
          <div className="p-1">
            {/* Option to remove from feature/area */}
            <button
              className={`flex items-center gap-2 w-full px-2 py-1.5 text-left rounded hover:bg-accent/50 ${
                !task.subdirectory ? 'bg-accent/50' : ''
              }`}
              onClick={() => handleMove(null)}
              disabled={isMoving}
            >
              {!task.subdirectory && <Check className="h-4 w-4" />}
              <span>None</span>
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
                    className={`flex items-center gap-2 w-full px-2 py-1.5 text-left rounded hover:bg-accent/50 ${
                      task.subdirectory === feature.id ? 'bg-accent/50' : ''
                    }`}
                    onClick={() => handleMove(feature.id)}
                    disabled={isMoving}
                  >
                    {task.subdirectory === feature.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Folder className="h-4 w-4" />
                    )}
                    <span className="truncate">{feature.name}</span>
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
                    className={`flex items-center gap-2 w-full px-2 py-1.5 text-left rounded hover:bg-accent/50 ${
                      task.subdirectory === area.id ? 'bg-accent/50' : ''
                    }`}
                    onClick={() => handleMove(area.id)}
                    disabled={isMoving}
                  >
                    {task.subdirectory === area.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <FolderOpen className="h-4 w-4" />
                    )}
                    <span className="truncate">{area.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}