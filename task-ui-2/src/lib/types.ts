// Core task types for V2 UI

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 'Highest' | 'High' | 'Medium' | 'Low';
export type WorkflowState = 'backlog' | 'current' | 'archive';
export type TaskType = 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike' | 'task' | 'parent_task';

// Base task interface
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  workflow_state: WorkflowState;
  workflow?: WorkflowState; // Some APIs return this instead of workflow_state
  type: TaskType;
  area?: string;
  assignee?: string;
  tags?: string[];
  created_date?: string;
  updated_date?: string;
  content?: string;
  parent_task?: string;
}

// Parent task extends base task with subtask info
export interface ParentTask extends Task {
  type: 'parent_task';
  subtasks: SubtaskInfo[];
  progress?: {
    total: number;
    completed: number;
  };
}

// Subtask information
export interface SubtaskInfo {
  id: string;
  title: string;
  status: TaskStatus;
  sequence: string;
  parallel_with?: string;
}

// Extended table task type with additional display properties
export interface TableTask extends Task {
  task_type: 'parent' | 'simple';
  subtask_count?: number;
  subtask_completed?: number;
  progress_percentage?: number;
}

// Supporting document type
export interface Document {
  name: string;
  type: string;
  size?: number;
  lastModified?: string;
}