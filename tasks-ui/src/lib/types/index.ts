// Import v2 core types
export type {
  Task,
  ParentTask,
  TaskDocument,
  TaskFrontmatter,
  TaskSections,
  TaskMetadata,
  TaskLocation,
  TaskCreateOptions,
  TaskUpdateOptions,
  TaskMoveOptions,
  TaskListOptions,
  SectionUpdateOptions,
  SectionContent,
  OperationResult,
  ValidationError,
  TaskSearchResult,
  TaskIdComponents,
  TaskReference,
  SubtaskInfo,
  WorkflowState,
  TaskType,
  TaskStatus,
  TaskPriority,
  V2Config,
  StructureVersion,
  MigrationResult
} from '../../../../src/core/v2/types';

// UI-specific area model (simplified for organizational purposes)
export interface Area {
  id: string;
  name: string;
  title?: string;
  description?: string;
  created_date?: string;
  updated_date?: string;
  taskCount?: number;
  parentTaskCount?: number;
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
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  workflowState?: WorkflowState;
  searchTerm?: string;
  assignedTo?: string;
  area?: string;
  tag?: string;
  parentTask?: string; // Filter by parent task
  includeCompleted?: boolean;
  includeArchived?: boolean;
  sortBy?: 'title' | 'status' | 'priority' | 'created_date' | 'updated_date';
  sortDirection?: 'asc' | 'desc';
}

export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  activeView: 'home' | 'list' | 'detail' | 'form' | 'create' | 'graph' | 'workflow' | 'parent-task';
  activeTaskId: string | null;
  activeParentTaskId: string | null;
  activeWorkflowState: WorkflowState | null;
  toasts: Toast[];
  collapsedSections: {
    views?: boolean;
    workflow?: boolean;
    parentTasks?: boolean;
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
  type: 'depends-on' | 'parent-child' | 'sequence-follows';
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'date';
  required: boolean;
  options?: { value: string; label: string }[];
  default?: string;
}
