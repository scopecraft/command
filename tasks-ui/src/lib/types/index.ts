// Define our own types instead of importing from core
// In a real implementation, we would directly import these from the core library
// import { Task, Phase, Template, OperationResult } from '../../../../src/core/types';

// Result type for operation responses
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: Error;
}

// Basic task model
export interface Task {
  id: string;
  title: string;
  type: string;
  status: string;
  priority?: string;
  created_date?: string;
  updated_date?: string;
  assigned_to?: string;
  parent_task?: string;
  subtasks?: string[];
  depends_on?: string[];
  previous_task?: string;
  next_task?: string;
  phase?: string;
  subdirectory?: string;
  feature?: string;
  area?: string;
  tags?: string[];
  content?: string;
  [key: string]: any;
}

// Phase model
export interface Phase {
  id: string;
  name: string;
  description?: string;
  status?: string;
  order: number;
}

// Feature model
export interface Feature {
  id: string;
  name: string;
  title?: string;
  description?: string;
  status?: string;
  created_date?: string;
  updated_date?: string;
  assigned_to?: string;
  phase?: string;
  phases?: string[]; // Array of phases this feature exists in
  is_overview?: boolean;
  subtasks?: string[];
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  tags?: string[];
}

// Area model
export interface Area {
  id: string;
  name: string;
  title?: string;
  description?: string;
  status?: string;
  created_date?: string;
  updated_date?: string;
  assigned_to?: string;
  phase?: string;
  phases?: string[]; // Array of phases this area exists in
  is_overview?: boolean;
  subtasks?: string[];
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  tags?: string[];
}

// Template model
export interface Template {
  id: string;
  name: string;
  type: string;
  description?: string;
  fields?: TemplateField[];
  typeLabel?: string;
  icon?: string;
}

// Additional UI-specific types
export interface TaskListFilter {
  status?: string;
  priority?: string;
  type?: string;
  phase?: string;
  searchTerm?: string;
  assignedTo?: string;
  subdirectory?: string;
  feature?: string;
  area?: string;
  tag?: string;
  sortBy?: keyof Task;
  sortDirection?: 'asc' | 'desc';
}

export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  activeView: 'home' | 'list' | 'detail' | 'form' | 'create' | 'graph';
  activeTaskId: string | null;
  toasts: Toast[];
  collapsedSections: {
    views?: boolean;
    phases?: boolean;
    features?: boolean;
    areas?: boolean;
  };
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export interface TaskRelationship {
  source: string;
  target: string;
  type: 'depends-on' | 'parent-child' | 'next-previous';
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'date';
  required: boolean;
  options?: { value: string; label: string }[];
  default?: string;
}
