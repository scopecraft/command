/**
 * Scopecraft Task System Types
 *
 * Core type definitions for the workflow-based task system
 */

// ============================================
// Core Types and Aliases
// ============================================

/**
 * ISO 8601 timestamp string (e.g., "2024-01-15T10:30:00.000Z")
 */
export type ISOTimestamp = string;

// ============================================
// Core Enums and Constants
// ============================================

// TODO: These types should be generated from the schema dynamically
// For now, they are hardcoded to match the canonical names (not labels) in default-schema.json
// This follows Postel's Law: we store canonical names internally and display human-readable labels

export type WorkflowState = 'backlog' | 'current' | 'archive';

export type TaskType = 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike' | 'idea';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'archived' | 'reviewing';

export type TaskPriority = 'highest' | 'high' | 'medium' | 'low';

export type TaskPhase = 'planning' | 'active' | 'completed';

// Required sections in task documents
export const REQUIRED_SECTIONS = ['instruction', 'tasks', 'deliverable', 'log'] as const;
export type RequiredSection = (typeof REQUIRED_SECTIONS)[number];

// ============================================
// Task Document Structure
// ============================================

/**
 * Task frontmatter - minimal required fields + custom
 */
export interface TaskFrontmatter {
  // Required fields
  type: TaskType;
  status: TaskStatus;
  area: string;

  // Optional typed fields
  priority?: TaskPriority;
  phase?: TaskPhase;
  tags?: string[];
  assignee?: string;

  // Allow custom fields for extensibility
  [key: string]: unknown;
}

/**
 * Task document sections
 */
export interface TaskSections {
  // Required sections
  instruction: string;
  tasks: string;
  deliverable: string;
  log: string;

  // Allow custom sections
  [key: string]: string;
}

/**
 * Complete task document structure
 */
export interface TaskDocument {
  title: string;
  frontmatter: TaskFrontmatter;
  sections: TaskSections;
}

// ============================================
// Task Metadata and Location
// ============================================

/**
 * Task location within workflow
 */
export interface TaskLocation {
  workflowState: WorkflowState;
  archiveDate?: string; // YYYY-MM format for archive organization
}

/**
 * Task metadata including file system info
 */
export interface TaskMetadata {
  id: string; // filename without .task.md
  filename: string; // full filename with extension
  path: string; // absolute file path
  location: TaskLocation; // workflow location
  isParentTask: boolean; // true if task is a folder with subtasks
  parentTask?: string; // for subtasks in complex tasks
  sequenceNumber?: string; // e.g., "01" for ordered subtasks
  createdAt?: ISOTimestamp; // Timestamp from file system
  updatedAt?: ISOTimestamp; // Timestamp from file system
}

/**
 * Complete task with document and metadata
 */
export interface Task {
  metadata: TaskMetadata;
  document: TaskDocument;
}

// ============================================
// Parent Task Support
// ============================================

/**
 * Parent task (folder-based) structure
 */
export interface ParentTask {
  metadata: TaskMetadata;
  overview: TaskDocument; // _overview.md content
  subtasks: Task[]; // ordered subtasks
  supportingFiles: string[]; // non-task files in folder
}

/**
 * Subtask info for parent tasks
 */
export interface SubtaskInfo {
  sequenceNumber: string; // "01", "02", etc.
  filename: string;
  canRunParallel: boolean; // true if same sequence number as another
}

// ============================================
// ID System
// ============================================

/**
 * Components of a task ID
 */
export interface TaskIdComponents {
  descriptiveName: string; // intelligently abbreviated name
  monthCode: string; // MM format (01-12)
  letterSuffix: string; // Single letter A-Z
  sequenceNumber?: string; // NN format for subtasks (01, 02, etc)
}

/**
 * Task reference format: @task:{id}#{section}
 */
export interface TaskReference {
  id: string;
  section?: string;
  explicitPath?: string; // e.g., "current/implement-oauth-0127-AB"
}

// ============================================
// Operations and Options
// ============================================

/**
 * Task creation options
 */
export interface TaskCreateOptions {
  title: string;
  type: TaskType;
  area: string;
  workflowState?: WorkflowState; // defaults to 'backlog'
  status?: TaskStatus; // defaults to 'To Do'
  tags?: string[]; // task tags
  template?: string; // template ID to use
  instruction?: string; // initial instruction content
  tasks?: string[]; // initial checklist items
  deliverable?: string; // initial deliverable content
  customMetadata?: Record<string, unknown>;
  customSections?: Record<string, string>;
}

/**
 * Task update options
 */
export interface TaskUpdateOptions {
  frontmatter?: Partial<TaskFrontmatter>;
  sections?: Partial<TaskSections>;
  title?: string;
}

/**
 * Task move options
 */
export interface TaskMoveOptions {
  targetState: WorkflowState;
  archiveDate?: string; // YYYY-MM format for archive
  updateStatus?: boolean; // auto-update status based on move
}

/**
 * List/filter options
 */
export interface TaskListOptions {
  workflowStates?: WorkflowState[];
  type?: TaskType;
  status?: TaskStatus;
  excludeStatuses?: TaskStatus[]; // Filter OUT multiple statuses for token efficiency
  area?: string;
  tags?: string[];
  includeArchived?: boolean;
  includeParentTasks?: boolean;
  // Additional filters
  [key: string]: unknown;
}

/**
 * Section update options
 */
export interface SectionUpdateOptions {
  taskId: string;
  sectionName: string;
  content: string;
  createIfMissing?: boolean;
}

// ============================================
// Results and Errors
// ============================================

/**
 * Section reference result
 */
export interface SectionContent {
  taskId: string;
  sectionName: string;
  content: string;
  taskPath: string;
  exists: boolean;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Operation result wrapper
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}

/**
 * Task search result
 */
export interface TaskSearchResult {
  task: Task;
  matchedIn?: 'title' | 'content' | 'metadata';
  excerpt?: string;
}

// ============================================
// Configuration
// ============================================

/**
 * Project-specific configuration options
 */
export interface ProjectConfig {
  workflowFolders?: {
    backlog: string;
    current: string;
    archive: string;
  };
  archiveDateFormat?: string; // default "YYYY-MM"
  defaultWorkflowState?: WorkflowState;
  autoStatusUpdate?: boolean; // update status on workflow transitions
  autoWorkflowTransitions?: boolean; // automatically move tasks between workflows on status changes
  complexTaskPrefix?: string; // prefix for subtask numbering
  override?: boolean; // For testing - treat as standalone project
}

/**
 * Migration info for v1 tasks
 */
export interface V1TaskInfo {
  path: string;
  phase: string;
  subdirectory?: string;
  id: string;
  type: string;
}

/**
 * Migration result
 */
export interface MigrationResult {
  tasksFound: number;
  tasksMigrated: number;
  errors: Array<{
    task: string;
    error: string;
  }>;
  warnings: string[];
}
