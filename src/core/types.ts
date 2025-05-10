/**
 * Core types used across the task management system
 */

// Task metadata schema
export interface TaskMetadata {
  id: string;
  title: string;
  status?: string;
  type?: string;
  priority?: string;
  created_date?: string;
  updated_date?: string;
  assigned_to?: string;
  tags?: string[];
  parent_task?: string;
  depends_on?: string[];
  related_tasks?: string[];
  phase?: string;
  subdirectory?: string; // Supports MDTM directory structure (e.g., "FEATURE_Login")
  is_overview?: boolean; // Special flag for _overview.md files
  next_task?: string;
  previous_task?: string;
  subtasks?: string[];
  [key: string]: any; // Allow for additional fields
}

// Task object with metadata and content
export interface Task {
  metadata: TaskMetadata;
  content: string;
  filePath?: string;
}

// Phase object
export interface Phase {
  id: string;
  name: string;
  description?: string;
  tasks: string[];
  status?: string;
  order?: number;
}

// Filter options for task listing
export interface TaskFilterOptions {
  status?: string;
  type?: string;
  assignee?: string;
  tags?: string[];
  phase?: string;
  subdirectory?: string;
  is_overview?: boolean;
}

// Update options for task
export interface TaskUpdateOptions {
  metadata?: Partial<TaskMetadata>;
  content?: string;
}

// Output formats for various displays
export type OutputFormat = 'table' | 'json' | 'minimal' | 'workflow' | 'markdown' | 'default' | 'full';

// Response type for operations
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}