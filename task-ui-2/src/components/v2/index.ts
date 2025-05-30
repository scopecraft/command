// V2 Component Library
// Clean, modern UI components for the workflow-based task system

export { TaskTypeIcon } from './TaskTypeIcon';
export { WorkflowStateBadge, StatusBadge, PriorityIndicator } from './WorkflowStateBadge';
export { ParentTaskCard } from './ParentTaskCard';
export { SubtaskList } from './SubtaskList';
export { TaskTable, type TableTask } from './TaskTable';
export { TaskManagementView } from './TaskManagementView';
export { ParentTaskListView } from './ParentTaskListView';
export { ClaudeAgentButton } from './ClaudeAgentButton';
export { Sidebar } from './Sidebar';

// Re-export types for convenience
export type { Task, ParentTask, WorkflowState, TaskStatus, TaskType } from '../../lib/types';