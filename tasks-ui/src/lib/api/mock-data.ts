import type { Task, Phase, Template } from '../types';

// Mock data with a variety of task statuses, types, and priorities
export const mockTasks: Task[] = [
  {
    id: 'TASK-001',
    title: 'Implement Task List View',
    type: '📋 Task',
    status: '🟢 Done',
    priority: '🔼 High',
    created_date: '2025-05-10',
    updated_date: '2025-05-12',
    phase: 'phase-1',
    tags: ['ui', 'frontend'],
    content: '# Implement Task List View\n\nCreate a table view for displaying and filtering tasks.'
  },
  {
    id: 'TASK-002',
    title: 'Create Task Detail View',
    type: '📋 Task',
    status: '🔵 In Progress',
    priority: '🔼 High',
    created_date: '2025-05-10',
    updated_date: '2025-05-12',
    phase: 'phase-2',
    tags: ['ui', 'frontend'],
    content: '# Create Task Detail View\n\nImplement a detailed view for viewing task information and content.'
  },
  {
    id: 'TASK-003',
    title: 'Implement Task Form',
    type: '📋 Task',
    status: '🟡 To Do',
    priority: '▶️ Medium',
    created_date: '2025-05-11',
    updated_date: '2025-05-11',
    phase: 'phase-2',
    tags: ['ui', 'frontend', 'form'],
    content: '# Implement Task Form\n\nCreate a form for adding and editing tasks.'
  },
  {
    id: 'TASK-004',
    title: 'Add Task Filtering',
    type: '🌟 Feature',
    status: '🟡 To Do',
    priority: '🔼 High',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    phase: 'phase-2',
    tags: ['ui', 'frontend', 'filtering'],
    content: '# Add Task Filtering\n\nImplement filtering options for the task list view.'
  },
  {
    id: 'TASK-005',
    title: 'Implement Task Sorting',
    type: '🌟 Feature',
    status: '🟡 To Do',
    priority: '▶️ Medium',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    phase: 'phase-2',
    tags: ['ui', 'frontend', 'sorting'],
    content: '# Implement Task Sorting\n\nAdd sorting capabilities to the task list view.'
  },
  {
    id: 'TASK-006',
    title: 'Fix Task Creation Bug',
    type: '🐛 Bug',
    status: '🟠 Blocked',
    priority: '🔥 Highest',
    created_date: '2025-05-11',
    updated_date: '2025-05-12',
    phase: 'phase-2',
    tags: ['bug', 'creation'],
    content: '# Fix Task Creation Bug\n\nFix bug where task creation fails with long titles.'
  },
  {
    id: 'TASK-007',
    title: 'Add Markdown Preview',
    type: '🌟 Feature',
    status: '🟡 To Do',
    priority: '🔽 Low',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    phase: 'phase-3',
    tags: ['ui', 'markdown'],
    content: '# Add Markdown Preview\n\nImplement a preview mode for markdown content in the task form.'
  },
  {
    id: 'TASK-008',
    title: 'Improve Task List Performance',
    type: '⚙️ Chore',
    status: '🟡 To Do',
    priority: '🔽 Low',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    phase: 'phase-3',
    tags: ['performance', 'frontend'],
    content: '# Improve Task List Performance\n\nOptimize the task list rendering for better performance with large datasets.'
  },
  {
    id: 'TASK-009',
    title: 'Add User Authentication',
    type: '🌟 Feature',
    status: '🟡 To Do',
    priority: '▶️ Medium',
    created_date: '2025-05-11',
    updated_date: '2025-05-11',
    phase: 'phase-3',
    tags: ['auth', 'security'],
    content: '# Add User Authentication\n\nImplement user authentication and authorization.'
  },
  {
    id: 'TASK-010',
    title: 'Create Task Dependency Graph',
    type: '🌟 Feature',
    status: '🟡 To Do',
    priority: '🔽 Low',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    phase: 'phase-3',
    tags: ['ui', 'graph', 'dependencies'],
    content: '# Create Task Dependency Graph\n\nImplement a visual representation of task dependencies.'
  }
];

export const mockPhases: Phase[] = [
  {
    id: 'phase-1',
    name: 'Phase 1: Foundation',
    description: 'Initial setup and foundation components',
    status: '🟢 Done',
    order: 1
  },
  {
    id: 'phase-2',
    name: 'Phase 2: Core Features',
    description: 'Implement the core task management features',
    status: '🔵 In Progress',
    order: 2
  },
  {
    id: 'phase-3',
    name: 'Phase 3: Advanced Features',
    description: 'Implement advanced features and optimizations',
    status: '🟡 To Do',
    order: 3
  }
];

export const mockTemplates: Template[] = [
  {
    id: 'template-task',
    name: 'Task',
    type: '📋 Task',
    description: 'A standard task implementation',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'text',
        required: true
      },
      {
        id: 'status',
        name: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: '🟡 To Do', label: '🟡 To Do' },
          { value: '🔵 In Progress', label: '🔵 In Progress' },
          { value: '🟠 Blocked', label: '🟠 Blocked' },
          { value: '🟣 In Review', label: '🟣 In Review' },
          { value: '🟢 Done', label: '🟢 Done' }
        ],
        default: '🟡 To Do'
      },
      {
        id: 'priority',
        name: 'Priority',
        type: 'select',
        required: false,
        options: [
          { value: '🔥 Highest', label: '🔥 Highest' },
          { value: '🔼 High', label: '🔼 High' },
          { value: '▶️ Medium', label: '▶️ Medium' },
          { value: '🔽 Low', label: '🔽 Low' }
        ],
        default: '▶️ Medium'
      }
    ]
  },
  {
    id: 'template-feature',
    name: 'Feature',
    type: '🌟 Feature',
    description: 'A new feature to be implemented',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'text',
        required: true
      },
      {
        id: 'status',
        name: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: '🟡 To Do', label: '🟡 To Do' },
          { value: '🔵 In Progress', label: '🔵 In Progress' },
          { value: '🟠 Blocked', label: '🟠 Blocked' },
          { value: '🟣 In Review', label: '🟣 In Review' },
          { value: '🟢 Done', label: '🟢 Done' }
        ],
        default: '🟡 To Do'
      },
      {
        id: 'priority',
        name: 'Priority',
        type: 'select',
        required: false,
        options: [
          { value: '🔥 Highest', label: '🔥 Highest' },
          { value: '🔼 High', label: '🔼 High' },
          { value: '▶️ Medium', label: '▶️ Medium' },
          { value: '🔽 Low', label: '🔽 Low' }
        ],
        default: '▶️ Medium'
      }
    ]
  },
  {
    id: 'template-bug',
    name: 'Bug',
    type: '🐛 Bug',
    description: 'A bug to be fixed',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'text',
        required: true
      },
      {
        id: 'status',
        name: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: '🟡 To Do', label: '🟡 To Do' },
          { value: '🔵 In Progress', label: '🔵 In Progress' },
          { value: '🟠 Blocked', label: '🟠 Blocked' },
          { value: '🟣 In Review', label: '🟣 In Review' },
          { value: '🟢 Done', label: '🟢 Done' }
        ],
        default: '🟡 To Do'
      },
      {
        id: 'priority',
        name: 'Priority',
        type: 'select',
        required: false,
        options: [
          { value: '🔥 Highest', label: '🔥 Highest' },
          { value: '🔼 High', label: '🔼 High' },
          { value: '▶️ Medium', label: '▶️ Medium' },
          { value: '🔽 Low', label: '🔽 Low' }
        ],
        default: '🔼 High'
      }
    ]
  }
];