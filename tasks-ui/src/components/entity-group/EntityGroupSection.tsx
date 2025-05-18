import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'wouter';
import { useTaskContext } from '../../context/TaskContext';
import { routes } from '../../lib/routes';
import type { Task } from '../../lib/types';
import { formatDate } from '../../lib/utils/format';
import { columns } from '../task-list/table/columns';
import { DataTable } from '../task-list/table/data-table';
import { Button } from '../ui/button';

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
    assigned_to?: string;
    created_date?: string;
    updated_date?: string;
    tags?: string[];
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
  onCreateTask,
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

  // Check if we're in a phase-specific context
  // If parent is a feature/area and child is a phase, pass the phase ID as context
  // If parent is a phase and child is a feature/area, pass the parent ID as context
  let phaseContext: string | undefined;
  if (parentEntity.type === 'phase') {
    phaseContext = parentEntity.id;
  } else if (childEntity.type === 'phase') {
    phaseContext = childEntity.id;
  }

  // Generate parameterized route based on entity type
  const detailRoute = getEntityDetailRoute(childEntity.type, childEntity.id, phaseContext);

  return (
    <div className="mb-8 border border-border rounded-md overflow-hidden">
      {/* Header section */}
      <div
        className={`${colors.headerBg} p-4 flex justify-between items-center cursor-pointer`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex flex-1 items-center">
          <span className={`${colors.icon} mr-2 text-xl`}>{getEntityIcon(childEntity.type)}</span>

          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center">
                <span>{childEntity.name}</span>
                {childEntity.title && childEntity.title !== childEntity.name && (
                  <span className="ml-2 text-sm text-muted-foreground">({childEntity.title})</span>
                )}
              </h3>

              <div className="flex items-center text-sm space-x-3">
                {childEntity.status && (
                  <span
                    className={`${getStatusBadgeColor(childEntity.status)} px-2 py-0.5 rounded text-xs font-medium`}
                  >
                    {childEntity.status}
                  </span>
                )}

                {childEntity.assigned_to && (
                  <span className="text-xs text-muted-foreground">
                    Assigned: <span className="font-mono">{childEntity.assigned_to}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-1">
              <div className="text-sm text-muted-foreground">
                {progress.percentage}% complete - {progress.completed}/{progress.total} tasks
              </div>

              <div className="flex items-center">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mr-3">
                  <div
                    className={`h-full ${colors.progressBar}`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? '▼' : '▲'}
        </Button>
      </div>

      {/* Content section (only shown when not collapsed) */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Metadata grid */}
          <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-sm">
            {childEntity.created_date && (
              <div>
                <span className="text-muted-foreground">Created:</span>{' '}
                <span>{formatDate(childEntity.created_date)}</span>
              </div>
            )}

            {childEntity.updated_date && (
              <div>
                <span className="text-muted-foreground">Updated:</span>{' '}
                <span>{formatDate(childEntity.updated_date)}</span>
              </div>
            )}

            {/* Tags display */}
            {childEntity.tags && childEntity.tags.length > 0 && (
              <div className="col-span-2">
                <span className="text-muted-foreground mr-2">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {childEntity.tags.map((tag) => (
                    <span key={tag} className="bg-accent/20 text-xs px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Entity-specific description */}
          {childEntity.description && (
            <div className="mb-4 px-3 py-2 bg-card/50 border border-border/50 rounded-md text-sm">
              <h4 className="font-medium mb-1">Description</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {childEntity.description}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Overview content specific to this relationship */}
          {overviewContent && (
            <div className="mb-4 p-3 bg-card border border-border rounded-md">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {overviewContent}
                </ReactMarkdown>
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
                      <span>
                        {count} ({percentage}%)
                      </span>
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
                onRowClick={(row) => {
                  // When navigating to task detail, preserve phase context if available
                  const url = phaseContext
                    ? `${routes.taskDetail(row.id)}?phase=${phaseContext}`
                    : routes.taskDetail(row.id);
                  navigate(url);
                }}
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
  const completed = tasks.filter(
    (task) => task.status.includes('Done') || task.status.includes('Complete')
  ).length;
  const percentage = total > 0 ? Math.floor((completed / total) * 100) : 0;

  return {
    total,
    completed,
    percentage,
  };
}

// Group tasks by status
function groupTasksByStatus(tasks: Task[]) {
  const statusGroups: Record<string, Task[]> = {};

  tasks.forEach((task) => {
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

// Get entity detail route, preserving phase context if provided
function getEntityDetailRoute(entityType: EntityType, id: string, phaseContext?: string) {
  // Extract the ID without the prefix if needed
  const cleanId = id.replace(/^(FEATURE_|AREA_|PHASE_)/, '');

  let route = '';
  switch (entityType) {
    case 'feature':
      route = routes.featureDetail(cleanId);
      break;
    case 'area':
      route = routes.areaDetail(cleanId);
      break;
    case 'phase':
      route = routes.phaseDetail(cleanId);
      break;
    default:
      return null;
  }

  // Add phase context to the URL if provided
  if (phaseContext) {
    route += `?phase=${phaseContext}`;
  }

  return route;
}

// Get status-specific color for progress bars
function getStatusColor(status: string) {
  if (status.includes('Done') || status.includes('Complete')) {
    return 'bg-green-500';
  }
  if (status.includes('Progress')) {
    return 'bg-blue-500';
  }
  if (status.includes('To Do')) {
    return 'bg-yellow-500';
  }
  if (status.includes('Block') || status.includes('Issue')) {
    return 'bg-red-500';
  }
  return 'bg-gray-500';
}

// Get status-specific color for badges
function getStatusBadgeColor(status: string) {
  if (status.includes('Done') || status.includes('Complete')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  }
  if (status.includes('Progress')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
  }
  if (status.includes('To Do')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
  }
  if (status.includes('Block') || status.includes('Issue')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
}

// Create task with parent-child relationship
function createTask(
  parentEntity: { id: string; type: EntityType; name: string },
  childEntity: {
    id: string;
    type: EntityType;
    name: string;
    title?: string;
    description?: string;
    status?: string;
    assigned_to?: string;
    created_date?: string;
    updated_date?: string;
    tags?: string[];
  },
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

  // Navigate to task create with entity and phase context
  navigate(`${routes.taskCreate}?${params.toString()}`);
}
