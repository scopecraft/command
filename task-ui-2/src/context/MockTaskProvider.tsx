import React from 'react';
import { TaskProvider } from './TaskContext';
import type { Task, ParentTask } from '../lib/types';

// Mock data for Storybook development
export const mockV2Tasks: Task[] = [
  {
    id: 'simple-001',
    title: 'Fix authentication bug',
    type: 'bug',
    status: 'in_progress',
    priority: 'high',
    workflow_state: 'current',
    created_date: '2025-05-15',
    updated_date: '2025-05-28',
    tags: ['auth', 'security', 'urgent'],
    content: '# Fix Authentication Bug\n\nUsers are experiencing login failures when using social auth providers.\n\n## Steps to Reproduce\n1. Navigate to login page\n2. Click "Login with Google"\n3. Complete OAuth flow\n4. Returns to app with error\n\n## Expected Behavior\nUser should be logged in successfully.',
  },
  {
    id: 'simple-002',
    title: 'Update API documentation',
    type: 'documentation',
    status: 'todo',
    priority: 'medium',
    workflow_state: 'backlog',
    created_date: '2025-05-20',
    updated_date: '2025-05-20',
    tags: ['docs', 'api'],
    content: '# Update API Documentation\n\nBring the API docs up to date with recent endpoint changes.',
  },
  {
    id: 'subtask-001',
    title: 'Setup authentication database schema',
    type: 'task',
    status: 'done',
    priority: 'high',
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '01',
    created_date: '2025-05-10',
    updated_date: '2025-05-15',
    tags: ['database', 'schema'],
    content: '# Setup Authentication Database Schema\n\nCreate tables for user authentication and sessions.',
  },
  {
    id: 'subtask-002',
    title: 'Add password hashing middleware',
    type: 'task',
    status: 'in_progress',
    priority: 'high',
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '02',
    created_date: '2025-05-12',
    updated_date: '2025-05-28',
    tags: ['security', 'middleware'],
    content: '# Add Password Hashing Middleware\n\nImplement bcrypt hashing for password security.',
  },
  {
    id: 'subtask-003',
    title: 'Implement JWT token validation',
    type: 'task',
    status: 'todo',
    priority: 'high',
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '03',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    tags: ['jwt', 'validation', 'security'],
    content: '# Implement JWT Token Validation\n\nAdd middleware to validate JWT tokens on protected routes.',
  },
  {
    id: 'subtask-004a',
    title: 'Create login endpoint',
    type: 'task',
    status: 'todo',
    priority: 'high',
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '04a',
    created_date: '2025-05-13',
    updated_date: '2025-05-13',
    tags: ['api', 'endpoint'],
    content: '# Create Login Endpoint\n\nBuild POST /auth/login endpoint with validation.',
  },
  {
    id: 'subtask-004b',
    title: 'Create logout endpoint',
    type: 'task',
    status: 'todo',
    priority: 'high',
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '04b',
    created_date: '2025-05-13',
    updated_date: '2025-05-13',
    tags: ['api', 'endpoint'],
    content: '# Create Logout Endpoint\n\nBuild POST /auth/logout endpoint to invalidate sessions.',
  },
  {
    id: 'subtask-005',
    title: 'Add session management',
    type: 'task',
    status: 'blocked',
    priority: 'medium',
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '05',
    created_date: '2025-05-14',
    updated_date: '2025-05-14',
    tags: ['session', 'redis'],
    content: '# Add Session Management\n\nImplement Redis-based session storage and management.',
  },
  {
    id: 'subtask-006',
    title: 'Implement password reset flow',
    type: 'task',
    status: 'todo',
    priority: 'low',
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '06',
    created_date: '2025-05-14',
    updated_date: '2025-05-14',
    tags: ['password', 'email', 'recovery'],
    content: '# Implement Password Reset Flow\n\nBuild email-based password reset with secure tokens.',
  },
];

export const mockV2ParentTasks: ParentTask[] = [
  {
    id: 'parent-001',
    title: 'User Authentication System',
    type: 'parent_task',
    status: 'in_progress',
    priority: 'high',
    workflow_state: 'current',
    created_date: '2025-05-10',
    updated_date: '2025-05-28',
    tags: ['security', 'backend', 'api', 'authentication'],
    overview: '# User Authentication System\n\nImplement complete user authentication system with JWT tokens, password hashing, and session management. Includes login, logout, and password reset functionality.\n\n## Key Features\n- Secure password hashing with bcrypt\n- JWT token-based authentication\n- Session management with Redis\n- Email-based password reset\n- Social authentication providers\n\n## Success Criteria\n- Users can register and login securely\n- Passwords are properly hashed and stored\n- JWT tokens are validated on protected routes\n- Sessions are managed efficiently\n- Password reset flow works end-to-end',
    content: '',
    subtasks: ['subtask-001', 'subtask-002', 'subtask-003', 'subtask-004a', 'subtask-004b', 'subtask-005', 'subtask-006'],
    progress: {
      completed: 1,
      total: 7,
    },
  },
  {
    id: 'parent-002',
    title: 'API Rate Limiting',
    type: 'parent_task',
    status: 'todo',
    priority: 'medium',
    workflow_state: 'backlog',
    created_date: '2025-05-25',
    updated_date: '2025-05-25',
    tags: ['api', 'security', 'performance'],
    overview: '# API Rate Limiting\n\nImplement comprehensive rate limiting to protect API endpoints from abuse and ensure fair usage.\n\n## Key Features\n- Per-user rate limiting\n- Per-IP rate limiting\n- Different limits for different endpoint types\n- Redis-based rate limit storage\n- Rate limit headers in responses\n\n## Success Criteria\n- API is protected from abuse\n- Rate limits are enforced consistently\n- Users receive clear feedback when limits are reached\n- Rate limiting doesn\'t impact normal usage',
    content: '',
    subtasks: [],
    progress: {
      completed: 0,
      total: 0,
    },
  },
];

// Mock provider for Storybook stories
interface MockTaskProviderProps {
  children: React.ReactNode;
  mockTasks?: Task[];
  mockParentTasks?: ParentTask[];
}

export function MockTaskProvider({ 
  children, 
  mockTasks = mockV2Tasks, 
  mockParentTasks = mockV2ParentTasks 
}: MockTaskProviderProps) {
  // For Storybook, we can provide pre-populated data through a wrapper
  // that initializes the real TaskProvider with mock data
  
  return (
    <TaskProvider>
      {children}
    </TaskProvider>
  );
}

// Specific mock scenarios for Storybook
export const mockScenarios = {
  empty: {
    tasks: [],
    parentTasks: [],
  },
  
  singleParentTask: {
    tasks: mockV2Tasks.filter(t => t.parent_task === 'parent-001'),
    parentTasks: [mockV2ParentTasks[0]],
  },
  
  multipleWorkflows: {
    tasks: mockV2Tasks,
    parentTasks: mockV2ParentTasks,
  },
  
  onlySimpleTasks: {
    tasks: mockV2Tasks.filter(t => !t.parent_task),
    parentTasks: [],
  },
  
  parallelTasks: {
    tasks: mockV2Tasks.filter(t => t.sequence?.includes('04')), // Tasks 04a and 04b
    parentTasks: [mockV2ParentTasks[0]],
  },
};