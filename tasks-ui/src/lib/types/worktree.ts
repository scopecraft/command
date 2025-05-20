// Worktree data model types

// Represents a Git worktree with its associated metadata
export interface Worktree {
  // Git-related properties
  path: string;
  branch: string;
  headCommit: string;
  status: WorktreeStatus;
  lastActivity?: Date;
  
  // Changed files information
  changedFiles?: {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'untracked' | 'renamed' | 'conflicted';
    oldPath?: string; // For renamed files
  }[];
  
  // Task-related properties (if linked to a task)
  taskId?: string;
  taskTitle?: string;
  taskStatus?: string;
  
  // Workflow properties
  workflowStatus?: WorkflowStatus;
  mode?: {
    current?: DevelopmentMode;
    next?: DevelopmentMode;
  };
  
  // Feature progress (if part of a feature)
  featureProgress?: {
    totalTasks: number;
    completed: number;
    inProgress: number;
    blocked: number;
    toDo: number;
  };
  
  // UI state properties
  isLoading?: boolean;
  error?: string;
}

// Git status values for a worktree
export enum WorktreeStatus {
  CLEAN = 'clean',           // No uncommitted changes
  MODIFIED = 'modified',     // Has uncommitted modifications
  UNTRACKED = 'untracked',   // Has untracked files
  CONFLICT = 'conflict',     // Has merge conflicts
  UNKNOWN = 'unknown'        // Status couldn't be determined
}

// Workflow status values (more human-readable workflow states)
export enum WorkflowStatus {
  TO_START = 'To Start',       // Ready to begin work
  WIP = 'WIP',                // Work in progress
  NEEDS_ATTENTION = 'Needs Attention', // Requires intervention
  FOR_REVIEW = 'For Review',    // Ready for code review
  TO_MERGE = 'To Merge',       // Approved and ready to merge
  COMPLETED = 'Completed'      // Fully merged and complete
}

// Development modes
export enum DevelopmentMode {
  TYPESCRIPT = 'typescript',
  UI = 'ui',
  CLI = 'cli',
  MCP = 'mcp',
  DEVOPS = 'devops',
  CODEREVIEW = 'codereview',
  PLANNING = 'planning',
  DOCUMENTATION = 'documentation'
}

// Configuration for the Worktree Dashboard
export interface WorktreeDashboardConfig {
  refreshInterval: number;   // How often to refresh worktree status (in ms)
  showTaskInfo: boolean;     // Whether to show associated task information
  maxWorktrees?: number;     // Maximum number of worktrees to display
}

// Statistics and summary information about worktrees
export interface WorktreeSummary {
  total: number;
  clean: number;
  modified: number;
  untracked: number;
  conflict: number;
  unknown: number;
}

// Mock data for development and testing
export const MOCK_WORKTREES: Worktree[] = [
  {
    path: '/Users/user/Projects/project-name.worktrees/feature-auth',
    branch: 'feature/auth',
    headCommit: 'a1b2c3d',
    status: WorktreeStatus.CLEAN,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    taskId: 'FEAT-AUTH-20250510-AB',
    taskTitle: 'Implement Authentication',
    taskStatus: '🔵 In Progress',
    workflowStatus: WorkflowStatus.WIP,
    mode: {
      current: DevelopmentMode.TYPESCRIPT
    },
    featureProgress: {
      totalTasks: 5,
      completed: 2,
      inProgress: 1,
      blocked: 0,
      toDo: 2
    }
  },
  {
    path: '/Users/user/Projects/project-name.worktrees/feature-dashboard',
    branch: 'feature/dashboard',
    headCommit: 'e5f6g7h',
    status: WorktreeStatus.MODIFIED,
    lastActivity: new Date(),
    taskId: 'FEAT-DASHBOARD-20250512-CD',
    taskTitle: 'Create Main Dashboard',
    taskStatus: '🔵 In Progress',
    workflowStatus: WorkflowStatus.WIP,
    mode: {
      current: DevelopmentMode.UI
    },
    featureProgress: {
      totalTasks: 4,
      completed: 1,
      inProgress: 3,
      blocked: 0,
      toDo: 0
    },
    changedFiles: [
      { path: 'src/components/Dashboard.tsx', status: 'modified' },
      { path: 'src/lib/api/dashboard-client.ts', status: 'added' },
      { path: 'src/styles/dashboard.css', status: 'modified' }
    ]
  },
  {
    path: '/Users/user/Projects/project-name.worktrees/bugfix-login',
    branch: 'bugfix/login-error',
    headCommit: 'i9j0k1l',
    status: WorktreeStatus.UNTRACKED,
    lastActivity: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    taskId: 'BUGFIX-LOGIN-20250515-EF',
    taskTitle: 'Fix Login Error',
    taskStatus: '🟡 To Do',
    workflowStatus: WorkflowStatus.TO_START,
    mode: {
      next: DevelopmentMode.TYPESCRIPT
    }
  },
  {
    path: '/Users/user/Projects/project-name.worktrees/feature-notifications',
    branch: 'feature/notifications',
    headCommit: 'm2n3o4p',
    status: WorktreeStatus.CONFLICT,
    lastActivity: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    taskId: 'FEAT-NOTIFICATIONS-20250514-GH',
    taskTitle: 'Add Notification System',
    taskStatus: '🟠 Blocked',
    workflowStatus: WorkflowStatus.NEEDS_ATTENTION,
    mode: {
      current: DevelopmentMode.CLI
    },
    featureProgress: {
      totalTasks: 6,
      completed: 3,
      inProgress: 1,
      blocked: 2,
      toDo: 0
    },
    changedFiles: [
      { path: 'src/components/Notification.tsx', status: 'conflicted' },
      { path: 'src/lib/api/notification-service.ts', status: 'modified' },
      { path: 'src/lib/hooks/useNotifications.ts', status: 'added' },
      { path: 'src/styles/notifications.css', status: 'deleted' }
    ]
  },
  {
    path: '/Users/user/Projects/project-name.worktrees/feature-export',
    branch: 'feature/export-data',
    headCommit: 'q7r8s9t',
    status: WorktreeStatus.CLEAN,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    taskId: 'FEAT-EXPORT-20250513-IJ',
    taskTitle: 'Add Data Export Functionality',
    taskStatus: '🟢 Ready for Review',
    workflowStatus: WorkflowStatus.FOR_REVIEW,
    mode: {
      current: DevelopmentMode.CODEREVIEW,
      next: DevelopmentMode.DEVOPS
    },
    featureProgress: {
      totalTasks: 3,
      completed: 2,
      inProgress: 1,
      blocked: 0,
      toDo: 0
    }
  }
];

// Default configuration
export const DEFAULT_DASHBOARD_CONFIG: WorktreeDashboardConfig = {
  refreshInterval: 30000, // 30 seconds
  showTaskInfo: true
};