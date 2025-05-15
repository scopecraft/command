import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import type { Task } from '../../lib/types';
import { DataTable } from '../task-list/table/data-table';
import { columns } from '../task-list/table/columns';
import { Button } from '../ui/button';
import { useLocation } from 'wouter';
import { routes } from '../../lib/routes';

type EntityType = 'feature' | 'area' | 'phase';

interface EntityGroupSectionProps {
  // Parent entity (container)
  parentEntity: {
    id: string;
    type: EntityType;
    name: string;
  };
  
  // Child entity (the one being displayed in this section)
  childEntity: {
    id: string;
    type: EntityType;
    name: string;
    title?: string;
    description?: string;
    status?: string;
    progress?: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  
  // Entity relationship specific
  tasks: Task[];
  overviewContent?: string;
  onCreateTask?: () => void;
}

/**
 * A generic component to display entity relationships (phase in feature, feature in phase, etc.)
 * Handles displaying tasks, metrics, and overview content in a consistent way
 */
export function EntityGroupSection({
  parentEntity,
  childEntity,
  tasks,
  overviewContent,
  onCreateTask
}: EntityGroupSectionProps) {
  const { tasks: allTasks } = useTaskContext();
  const [, navigate] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Calculate progress metrics if not provided
  const progress = childEntity.progress || calculateProgress(tasks);
  
  // Calculate status breakdown
  const taskStatusGroups = groupTasksByStatus(tasks);
  
  // Generate colors based on entity type
  const colors = getEntityColors(childEntity.type);
  
  // Generate parameterized route based on entity type
  const detailRoute = getEntityDetailRoute(childEntity.type, childEntity.id);
  
  return (
    <div className="mb-8 border border-border rounded-md overflow-hidden">
      {/* Header section */}
      <div 
        className={`${colors.headerBg} p-4 flex justify-between items-center cursor-pointer`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center">
          <span className={`${colors.icon} mr-2`}>
            {getEntityIcon(childEntity.type)}
          </span>
          
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <span>{childEntity.name}</span>
              {childEntity.title && childEntity.title !== childEntity.name && (
                <span className="ml-2 text-sm text-muted-foreground">({childEntity.title})</span>
              )}
            </h3>
            
            {childEntity.status && (
              <div className="text-xs text-muted-foreground">
                Status: {childEntity.status}
              </div>
            )}
          </div>
          
          <div className="ml-4 text-sm text-muted-foreground">
            {progress.percentage}% complete - {progress.completed}/{progress.total} tasks
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-32 h-3 bg-muted rounded-full overflow-hidden mr-3">
            <div 
              className={`h-full ${colors.progressBar}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
          >
            {isCollapsed ? '▼' : '▲'}
          </Button>
        </div>
      </div>
      
      {/* Content section (only shown when not collapsed) */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Entity-specific description */}
          {childEntity.description && (
            <div className="mb-4 text-sm text-muted-foreground">
              {childEntity.description}
            </div>
          )}
          
          {/* Overview content specific to this relationship */}
          {overviewContent && (
            <div className="mb-4 p-3 bg-card border border-border rounded-md">
              <div className="text-sm prose max-w-none">
                {overviewContent}
              </div>
            </div>
          )}
          
          {/* Status breakdown */}
          {tasks.length > 0 && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(taskStatusGroups).map(([status, statusTasks]) => {
                const count = statusTasks.length;
                const percentage = Math.round((count / tasks.length) * 100);
                const statusColor = getStatusColor(status);
                
                return (
                  <div key={status} className="bg-card p-2 rounded-md border border-border">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{status}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${statusColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* View entity link */}
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (detailRoute) {
                  navigate(detailRoute);
                }
              }}
            >
              View {childEntity.type} details
            </Button>
          </div>
          
          {/* Task list */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium">Tasks</h4>
              
              <Button
                size="sm"
                onClick={() => {
                  if (onCreateTask) {
                    onCreateTask();
                  } else {
                    // Default create behavior
                    createTask(parentEntity, childEntity, navigate);
                  }
                }}
              >
                + Add Task
              </Button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center p-4 border border-border rounded-md">
                <p className="text-muted-foreground">No tasks in this {childEntity.type} yet</p>
                <Button 
                  className="mt-2" 
                  onClick={() => {
                    if (onCreateTask) {
                      onCreateTask();
                    } else {
                      // Default create behavior
                      createTask(parentEntity, childEntity, navigate);
                    }
                  }}
                >
                  Create Task
                </Button>
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={tasks}
                onRowClick={(row) => navigate(routes.taskDetail(row.id))}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions

// Calculate progress metrics
function calculateProgress(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter(task => 
    task.status.includes('Done') || task.status.includes('Complete')).length;
  const percentage = total > 0 ? Math.floor((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    percentage
  };
}

// Group tasks by status
function groupTasksByStatus(tasks: Task[]) {
  const statusGroups: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    if (!statusGroups[task.status]) {
      statusGroups[task.status] = [];
    }
    statusGroups[task.status].push(task);
  });
  
  return statusGroups;
}

// Get entity-specific colors
function getEntityColors(entityType: EntityType) {
  switch (entityType) {
    case 'feature':
      return {
        headerBg: 'bg-blue-50 dark:bg-blue-950',
        icon: 'text-blue-500',
        progressBar: 'bg-blue-500',
      };
    case 'area':
      return {
        headerBg: 'bg-green-50 dark:bg-green-950',
        icon: 'text-green-500',
        progressBar: 'bg-green-500',
      };
    case 'phase':
      return {
        headerBg: 'bg-purple-50 dark:bg-purple-950',
        icon: 'text-purple-500',
        progressBar: 'bg-purple-500',
      };
    default:
      return {
        headerBg: 'bg-gray-50 dark:bg-gray-900',
        icon: 'text-gray-500',
        progressBar: 'bg-gray-500',
      };
  }
}

// Get entity-specific icon
function getEntityIcon(entityType: EntityType) {
  switch (entityType) {
    case 'feature':
      return '📦';
    case 'area':
      return '🔷';
    case 'phase':
      return '🔄';
    default:
      return '📋';
  }
}

// Get entity detail route
function getEntityDetailRoute(entityType: EntityType, id: string) {
  // Extract the ID without the prefix if needed
  const cleanId = id.replace(/^(FEATURE_|AREA_|PHASE_)/, '');
  
  switch (entityType) {
    case 'feature':
      return routes.featureDetail(cleanId);
    case 'area':
      return routes.areaDetail(cleanId);
    case 'phase':
      // Assuming a phase detail route exists or will exist
      return `/phases/${cleanId}`;
    default:
      return null;
  }
}

// Get status-specific color
function getStatusColor(status: string) {
  if (status.includes('Done') || status.includes('Complete')) {
    return 'bg-green-500';
  } else if (status.includes('Progress')) {
    return 'bg-blue-500';
  } else if (status.includes('To Do')) {
    return 'bg-yellow-500';
  } else if (status.includes('Block') || status.includes('Issue')) {
    return 'bg-red-500';
  } else {
    return 'bg-gray-500';
  }
}

// Create task with parent-child relationship
function createTask(
  parentEntity: { id: string; type: EntityType; name: string; },
  childEntity: { id: string; type: EntityType; name: string; },
  navigate: (route: string) => void
) {
  const params = new URLSearchParams();
  
  // Determine which entity defines the phase and which defines the subdirectory
  if (childEntity.type === 'phase') {
    params.append('phase', childEntity.id);
    if (parentEntity.type === 'feature') {
      params.append('feature', parentEntity.id);
    } else if (parentEntity.type === 'area') {
      params.append('area', parentEntity.id);
    }
  } else {
    if (parentEntity.type === 'phase') {
      params.append('phase', parentEntity.id);
    }
    
    if (childEntity.type === 'feature') {
      params.append('feature', childEntity.id);
    } else if (childEntity.type === 'area') {
      params.append('area', childEntity.id);
    }
  }
  
  navigate(`${routes.taskCreate}?${params.toString()}`);
}