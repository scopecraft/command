import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useFeatureContext } from '../../context/FeatureContext';
import { useAreaContext } from '../../context/AreaContext';
import { useTaskContext } from '../../context/TaskContext';
import { Button } from '../ui/button';
import { routes } from '../../lib/routes';

interface EntityProgress {
  id: string;
  name: string;
  type: 'feature' | 'area';
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  statusBreakdown: Record<string, number>;
}

export function ProgressComparisonView() {
  const { tasks } = useTaskContext();
  const { features } = useFeatureContext();
  const { areas } = useAreaContext();
  const [, navigate] = useLocation();
  const [selectedEntities, setSelectedEntities] = useState<EntityProgress[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<EntityProgress[]>([]);
  const [availableAreas, setAvailableAreas] = useState<EntityProgress[]>([]);
  
  // Calculate progress data for features and areas
  useEffect(() => {
    // Process features
    const featureData = features.map(feature => {
      const featureTasks = tasks.filter(task => task.subdirectory === feature.id);
      const totalTasks = featureTasks.length;
      const completedTasks = featureTasks.filter(task => 
        task.status.includes('Done') || task.status.includes('Complete')).length;
      const progressPercentage = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
      
      // Calculate status breakdown
      const statusBreakdown: Record<string, number> = {};
      featureTasks.forEach(task => {
        statusBreakdown[task.status] = (statusBreakdown[task.status] || 0) + 1;
      });
      
      return {
        id: feature.id,
        name: feature.name,
        type: 'feature' as const,
        totalTasks,
        completedTasks,
        progressPercentage,
        statusBreakdown
      };
    });
    
    // Process areas
    const areaData = areas.map(area => {
      const areaTasks = tasks.filter(task => task.subdirectory === area.id);
      const totalTasks = areaTasks.length;
      const completedTasks = areaTasks.filter(task => 
        task.status.includes('Done') || task.status.includes('Complete')).length;
      const progressPercentage = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
      
      // Calculate status breakdown
      const statusBreakdown: Record<string, number> = {};
      areaTasks.forEach(task => {
        statusBreakdown[task.status] = (statusBreakdown[task.status] || 0) + 1;
      });
      
      return {
        id: area.id,
        name: area.name,
        type: 'area' as const,
        totalTasks,
        completedTasks,
        progressPercentage,
        statusBreakdown
      };
    });
    
    // Only include entities with tasks
    setAvailableFeatures(featureData.filter(f => f.totalTasks > 0));
    setAvailableAreas(areaData.filter(a => a.totalTasks > 0));
  }, [features, areas, tasks]);
  
  // Add entity to comparison
  const addToComparison = (entity: EntityProgress) => {
    if (selectedEntities.some(e => e.id === entity.id)) return;
    setSelectedEntities([...selectedEntities, entity]);
  };
  
  // Remove entity from comparison
  const removeFromComparison = (entityId: string) => {
    setSelectedEntities(selectedEntities.filter(e => e.id !== entityId));
  };
  
  // Get all unique statuses from selected entities
  const getAllStatuses = () => {
    const statusSet = new Set<string>();
    selectedEntities.forEach(entity => {
      Object.keys(entity.statusBreakdown).forEach(status => statusSet.add(status));
    });
    return Array.from(statusSet).sort();
  };
  
  // Navigate to entity detail
  const navigateToEntity = (entity: EntityProgress) => {
    if (entity.type === 'feature') {
      navigate(routes.featureDetail(entity.id.replace('FEATURE_', '')));
    } else {
      navigate(routes.areaDetail(entity.id.replace('AREA_', '')));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(routes.taskList)}
          className="mr-2"
        >
          ← Back to Tasks
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Progress Comparison</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Entity Selector */}
        <div className="border border-border rounded-md p-4">
          <h2 className="text-lg font-medium mb-4">Select to Compare</h2>
          
          {/* Features Section */}
          {availableFeatures.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Features</h3>
              <div className="space-y-2">
                {availableFeatures.map(feature => (
                  <div 
                    key={feature.id} 
                    className="flex justify-between items-center p-2 hover:bg-accent/20 rounded-md cursor-pointer"
                    onClick={() => addToComparison(feature)}
                  >
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">📦</span>
                      <span>{feature.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {feature.completedTasks}/{feature.totalTasks}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Areas Section */}
          {availableAreas.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Areas</h3>
              <div className="space-y-2">
                {availableAreas.map(area => (
                  <div 
                    key={area.id} 
                    className="flex justify-between items-center p-2 hover:bg-accent/20 rounded-md cursor-pointer"
                    onClick={() => addToComparison(area)}
                  >
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">🔷</span>
                      <span>{area.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {area.completedTasks}/{area.totalTasks}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {availableFeatures.length === 0 && availableAreas.length === 0 && (
            <div className="text-center p-4 text-muted-foreground">
              No features or areas with tasks available to compare
            </div>
          )}
        </div>
        
        {/* Comparison View */}
        <div className="md:col-span-2 border border-border rounded-md p-4">
          <h2 className="text-lg font-medium mb-4">Comparison</h2>
          
          {selectedEntities.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              Select features and areas to compare their progress
            </div>
          ) : (
            <>
              {/* Selected Entities */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedEntities.map(entity => (
                  <div 
                    key={entity.id}
                    className="flex items-center gap-2 bg-accent/30 rounded-md px-3 py-1"
                  >
                    <span className={entity.type === 'feature' ? 'text-blue-500' : 'text-green-500'}>
                      {entity.type === 'feature' ? '📦' : '🔷'}
                    </span>
                    <span>{entity.name}</span>
                    <button 
                      className="text-muted-foreground hover:text-foreground ml-2"
                      onClick={() => removeFromComparison(entity.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Overall Progress Comparison */}
              <div className="mb-8">
                <h3 className="text-md font-medium mb-3">Overall Progress</h3>
                <div className="space-y-4">
                  {selectedEntities.map(entity => (
                    <div key={entity.id} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <div 
                          className="flex items-center gap-1 cursor-pointer hover:underline"
                          onClick={() => navigateToEntity(entity)}
                        >
                          <span className={entity.type === 'feature' ? 'text-blue-500' : 'text-green-500'}>
                            {entity.type === 'feature' ? '📦' : '🔷'}
                          </span>
                          <span>{entity.name}</span>
                        </div>
                        <span className="text-sm">
                          {entity.completedTasks}/{entity.totalTasks} tasks ({entity.progressPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${entity.type === 'feature' ? 'bg-blue-500' : 'bg-green-500'}`}
                          style={{ width: `${entity.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Status Breakdown Comparison */}
              <div>
                <h3 className="text-md font-medium mb-3">Status Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left pb-2 pr-4 font-medium text-sm">Entity</th>
                        {getAllStatuses().map(status => (
                          <th key={status} className="text-left pb-2 pr-4 font-medium text-sm">
                            {status}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEntities.map(entity => (
                        <tr key={entity.id} className="border-t border-border">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              <span className={entity.type === 'feature' ? 'text-blue-500' : 'text-green-500'}>
                                {entity.type === 'feature' ? '📦' : '🔷'}
                              </span>
                              <span>{entity.name}</span>
                            </div>
                          </td>
                          {getAllStatuses().map(status => (
                            <td key={status} className="py-3 pr-4">
                              {entity.statusBreakdown[status] ? (
                                <div>
                                  <span className="text-sm">
                                    {entity.statusBreakdown[status]}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({Math.round((entity.statusBreakdown[status] / entity.totalTasks) * 100)}%)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">0</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}