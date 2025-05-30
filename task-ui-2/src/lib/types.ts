// Import normalized types from MCP schemas (single source of truth)
import type {
  Task as MCPTask,
  ParentTask,
  ParentTaskDetail,
  SimpleTask,
  SubTask,
  TaskPriority,
  TaskStatus,
  TaskStructure,
  TaskType,
  WorkflowState,
} from '../../../src/mcp/schemas.js';

// Re-export for UI consumption
export type { TaskStatus, TaskPriority, WorkflowState, TaskType, TaskStructure };

// Use MCP Task as the primary interface
export type Task = MCPTask;

// Re-export specific task types from MCP
export type { SimpleTask, SubTask, ParentTask, ParentTaskDetail };

// UI table task type for backwards compatibility during migration
export interface TableTask extends Task {
  // Legacy field mappings for gradual migration
  workflow?: WorkflowState;
  created_date?: string;
  updated_date?: string;
  parent_task?: string;
  // Ensure these fields are always defined for UI safety
  tags: string[];
  area: string;
  priority: TaskPriority;
}

// UI-specific supporting document type
export interface Document {
  name: string;
  type: string;
  size?: number;
  lastModified?: string;
}
