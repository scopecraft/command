import React, { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import ReactFlow, {
  Controls,
  Background,
  Panel,
  MarkerType,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import type {
  Edge,
  Node,
  Connection,
  NodeMouseHandler,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTaskContext } from '../../context/TaskContext';
import { routes } from '../../lib/routes';
import { TaskNode } from './TaskNode';
import { GraphContextMenu } from './GraphContextMenu';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/useToast';
import type { Task, TaskRelationship } from '../../lib/types';

export function RelationshipGraph() {
  const { tasks, updateTask } = useTaskContext();
  const [, navigate] = useLocation();
  const toast = useToast();
  
  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(() => ({ 
    taskNode: TaskNode 
  }), []);
  
  // Create nodes from tasks
  const initialNodes: Node[] = useMemo(() => tasks.map(task => ({
    id: task.id,
    type: 'taskNode',
    data: { task },
    position: { 
      // Use hash of task id for initial positions to ensure consistency
      x: parseInt(task.id.substring(task.id.length - 4), 16) % 800, 
      y: parseInt(task.id.substring(0, 4), 16) % 600 
    },
  })), [tasks]);
  
  // Create edges from task relationships
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    // Process all relationship types
    tasks.forEach(task => {
      // Parent-child relationships
      if (task.parent_task) {
        edges.push({
          id: `${task.parent_task}-parent-${task.id}`,
          source: task.parent_task,
          target: task.id,
          label: 'parent',
          type: 'straight',
          style: { stroke: '#6366f1' },
          animated: false,
          markerEnd: { type: MarkerType.Arrow },
          data: { 
            type: 'parent-child' as TaskRelationship['type'],
          }
        });
      }
      
      // Dependencies
      if (task.depends_on) {
        task.depends_on.forEach(dependencyId => {
          edges.push({
            id: `${dependencyId}-depends-${task.id}`,
            source: dependencyId,
            target: task.id,
            label: 'depends on',
            type: 'default',
            style: { stroke: '#f97316' },
            animated: true,
            markerEnd: { type: MarkerType.Arrow },
            data: { 
              type: 'depends-on' as TaskRelationship['type'],
            }
          });
        });
      }
      
      // Previous-next task relationships
      if (task.previous_task) {
        edges.push({
          id: `${task.previous_task}-next-${task.id}`,
          source: task.previous_task,
          target: task.id,
          label: 'next',
          type: 'step',
          style: { stroke: '#10b981' },
          animated: false,
          markerEnd: { type: MarkerType.Arrow },
          data: { 
            type: 'next-previous' as TaskRelationship['type'],
          }
        });
      }
    });
    
    return edges;
  }, [tasks]);
  
  // Use React Flow hooks for managing nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Keep track of dragging state to prevent opening task on drag end
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle node drag start
  const onNodeDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  // Handle node drag stop
  const onNodeDragStop = useCallback(() => {
    // Set timeout to allow click event to be processed first
    setTimeout(() => setIsDragging(false), 100);
  }, []);
  
  // Track context menu state
  const [contextMenu, setContextMenu] = useState<{
    task: Task;
    position: { x: number; y: number };
  } | null>(null);

  // Handle closing the context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle right-clicking on a node (for context menu)
  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      // Prevent default browser context menu
      event.preventDefault();

      // Find the task for this node
      const task = tasks.find(t => t.id === node.id);
      if (!task) return;

      // Calculate position for context menu
      const position = {
        x: event.clientX,
        y: event.clientY,
      };

      // Show context menu
      setContextMenu({ task, position });
    },
    [tasks]
  );

  // Handle clicking on a node
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    if (isDragging) return;

    // Check if it's a right-click
    if (event.button === 2) return;

    navigate(routes.taskDetail(node.id));
  }, [navigate, isDragging]);
  
  // Handle connecting two nodes with an edge
  const onConnect = useCallback(async (params: Connection) => {
    // We need to ask what type of connection this is
    if (!params.source || !params.target) return;
    
    // Find the source and target tasks
    const sourceTask = tasks.find(t => t.id === params.source);
    const targetTask = tasks.find(t => t.id === params.target);
    
    if (!sourceTask || !targetTask) {
      toast.error('Could not find one of the tasks for this connection');
      return;
    }
    
    // For now, we'll only implement dependency relationships
    // In a real application, you would show a context menu for selecting the relationship type
    
    // Update the target task to depend on the source task
    const dependsOn = [...(targetTask.depends_on || [])];
    if (!dependsOn.includes(sourceTask.id)) {
      dependsOn.push(sourceTask.id);
      
      const updatedTask = {
        ...targetTask,
        depends_on: dependsOn
      };
      
      const result = await updateTask(updatedTask);
      if (result.success) {
        toast.success(`Added dependency from ${sourceTask.title} to ${targetTask.title}`);
        
        // Add the edge to the graph
        const edgeParams = {
          ...params,
          id: `${params.source}-depends-${params.target}`,
          label: 'depends on',
          type: 'default',
          style: { stroke: '#f97316' },
          animated: true,
          markerEnd: { type: MarkerType.Arrow },
          data: { 
            type: 'depends-on' as TaskRelationship['type'],
          }
        };
        
        setEdges(edges => addEdge(edgeParams, edges));
      } else {
        toast.error('Failed to update task dependency');
      }
    }
  }, [tasks, updateTask, toast, setEdges]);
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b bg-card">
        <h1 className="text-lg font-semibold">Task Relationship Graph</h1>
        <p className="text-sm text-muted-foreground">
          Visualize and manage relationships between tasks
        </p>
      </div>
      
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          onPaneClick={closeContextMenu}
        >
          <Background />
          <Controls />
          <Panel position="top-left" className="bg-card p-2 rounded-md shadow-sm border">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1 text-xs">
                <div className="w-4 h-1 bg-[#6366f1] rounded"></div>
                <span>Parent-Child</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-4 h-1 bg-[#f97316] rounded"></div>
                <span>Dependency</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-4 h-1 bg-[#10b981] rounded"></div>
                <span>Workflow</span>
              </div>
            </div>
          </Panel>
          <Panel position="bottom-left" className="bg-card p-2 rounded-md shadow-sm border">
            <div className="text-xs text-muted-foreground">
              <p>• Click a task to view details</p>
              <p>• Drag to move tasks</p>
              <p>• Connect tasks to create dependencies</p>
            </div>
          </Panel>

          {/* Context menu */}
          {contextMenu && (
            <GraphContextMenu
              task={contextMenu.task}
              position={contextMenu.position}
              onClose={closeContextMenu}
            />
          )}
        </ReactFlow>
      </div>
    </div>
  );
}