import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { cn } from '../../lib/utils';
import type { Task } from '../../lib/types';

interface TaskNodeData {
  task: Task;
}

function TaskNodeComponent({ data, selected }: NodeProps<TaskNodeData>) {
  const { task } = data;
  
  // Determine background color based on task status
  const getStatusColor = () => {
    switch (task.status) {
      case '🟡 To Do':
        return 'bg-yellow-500/20 border-yellow-500/40';
      case '🔵 In Progress':
        return 'bg-blue-500/20 border-blue-500/40';
      case '🟢 Done':
        return 'bg-green-500/20 border-green-500/40';
      case '🟣 Blocked':
        return 'bg-purple-500/20 border-purple-500/40';
      case '🔶 In Review':
        return 'bg-orange-500/20 border-orange-500/40';
      default:
        return 'bg-gray-500/20 border-gray-500/40';
    }
  };
  
  // Priority marker
  const getPriorityMarker = () => {
    switch(task.priority) {
      case '🔥 Highest':
        return <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" title="Highest Priority"></div>;
      case '🔼 High':
        return <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500" title="High Priority"></div>;
      case '▶️ Medium':
        return <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-500" title="Medium Priority"></div>;
      default:
        return null;
    }
  };
  
  // Task type icon
  const getTypeIcon = () => {
    switch(task.type) {
      case '🌟 Feature':
        return '🌟';
      case '🐞 Bug':
        return '🐞';
      case '🔧 Chore':
        return '🔧';
      case '📚 Documentation':
        return '📚';
      default:
        return '📋';
    }
  };
  
  return (
    <div className={cn(
      'px-3 py-2 min-w-48 max-w-60 rounded-md shadow-md border relative',
      getStatusColor(),
      selected ? 'ring-2 ring-primary ring-offset-background' : '',
    )}>
      {/* Source handle (top) */}
      <Handle
        type="source"
        position={Position.Top}
        className="w-3 h-3 border-2 border-background bg-primary"
      />
      
      {/* Node content */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-sm">{getTypeIcon()}</span>
          <span className="text-xs font-mono">{task.id}</span>
        </div>
        
        <div className="text-sm font-medium line-clamp-2">{task.title}</div>
        
        {/* Metadata badges */}
        <div className="flex flex-wrap gap-1 mt-1">
          <div className="text-xs px-1.5 py-0.5 rounded-sm bg-primary/10 border border-primary/20">
            {task.status}
          </div>
          
          {task.phase && (
            <div className="text-xs px-1.5 py-0.5 rounded-sm bg-secondary/10 border border-secondary/20">
              {task.phase}
            </div>
          )}
        </div>
      </div>
      
      {/* Priority marker */}
      {getPriorityMarker()}
      
      {/* Target handle (bottom) */}
      <Handle
        type="target"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-background bg-primary"
      />
    </div>
  );
}

// Export memoized component to optimize rendering
export const TaskNode = memo(TaskNodeComponent);