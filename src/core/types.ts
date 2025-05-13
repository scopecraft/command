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

// Feature object representing a feature directory structure
export interface Feature {
  id: string; // Directory name (e.g., "FEATURE_Authentication")
  name: string; // Clean name (e.g., "Authentication")
  title: string; // Display title from overview
  description?: string; // Description from overview
  phase?: string; // Phase this feature belongs to
  tasks: string[]; // List of task IDs in this feature
  status?: string; // Computed status based on tasks
  progress?: number; // Progress percentage (0-100)
  overview?: Task; // Reference to the overview task
}

// Area object representing an area directory structure
export interface Area {
  id: string; // Directory name (e.g., "AREA_Performance")
  name: string; // Clean name (e.g., "Performance")
  title: string; // Display title from overview
  description?: string; // Description from overview
  phase?: string; // Phase this area belongs to
  tasks: string[]; // List of task IDs in this area
  status?: string; // Computed status based on tasks
  progress?: number; // Progress percentage (0-100)
  overview?: Task; // Reference to the overview task
}

// Filter options for feature listing
export interface FeatureFilterOptions {
  phase?: string;
  status?: string;
  include_tasks?: boolean; // Whether to include task details
  include_progress?: boolean; // Whether to include progress calculation
}

// Filter options for area listing
export interface AreaFilterOptions {
  phase?: string;
  status?: string;
  include_tasks?: boolean; // Whether to include task details
  include_progress?: boolean; // Whether to include progress calculation
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
  include_content?: boolean; // Controls whether task content is included in the response (default: true)
  include_completed?: boolean; // Controls whether completed tasks are included in the response (default: true)
}

// Update options for task
export interface TaskUpdateOptions {
  metadata?: Partial<TaskMetadata>;
  content?: string;
}

// Update options for feature
export interface FeatureUpdateOptions {
  name?: string;
  title?: string;
  description?: string;
  status?: string;
}

// Update options for area
export interface AreaUpdateOptions {
  name?: string;
  title?: string;
  description?: string;
  status?: string;
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