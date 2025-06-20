import type { ParentTask, Task, TaskStatus, TaskType, WorkflowState } from '../types';

// V2 Mock Tasks for testing the new workflow-based structure
export const mockV2SimpleTasks: Task[] = [
  {
    id: 'simple-001',
    title: 'Fix authentication bug',
    type: 'bug',
    taskStructure: 'simple',
    status: 'in_progress',
    priority: 'high',
    workflowState: 'current',
    area: 'security',
    createdDate: '2025-05-15',
    updatedDate: '2025-05-28',
    tags: ['auth', 'security', 'urgent'],
    path: '/current/simple-001.md',
    filename: 'simple-001.md',
    content: `## Instruction
Users are experiencing login failures when using social auth providers.

### Steps to Reproduce
1. Navigate to login page
2. Click "Login with Google"
3. Complete OAuth flow
4. Returns to app with error

### Expected Behavior
User should be logged in successfully.

## Tasks
- [ ] Check OAuth app configuration in Google Console
- [ ] Verify callback URLs match production domain
- [ ] Test with different providers
- [ ] Update error handling for better UX

## Deliverable
Working social authentication for all providers

## Log
- 2025-05-28: Investigation started - issue appears OAuth callback related`,
  },
  {
    id: 'simple-002',
    title: 'Update API documentation',
    type: 'documentation',
    status: 'todo',
    priority: 'medium',
    workflowState: 'backlog',
    createdDate: '2025-05-20',
    updatedDate: '2025-05-20',
    tags: ['docs', 'api'],
    content: `## Instruction
Bring the API docs up to date with recent endpoint changes.

## Tasks
- [ ] Add new authentication endpoints
- [ ] Update rate limiting documentation
- [ ] Document new error response formats
- [ ] Add examples for new features

## Deliverable
Updated API documentation with all recent changes

## Log
- 2025-05-20: Task created - target completion end of sprint`,
  },
  {
    id: 'simple-003',
    title: 'Refactor database connection pooling',
    type: 'chore',
    status: 'archived',
    priority: 'low',
    workflowState: 'archive',
    createdDate: '2025-04-01',
    updatedDate: '2025-04-15',
    archivedDate: '2025-04',
    tags: ['database', 'performance'],
    content: `## Instruction
Improve database connection management for better performance.

## Tasks
- [x] Migrate from basic connection to connection pooling
- [x] Optimize pool size based on load testing
- [x] Add connection health checks
- [x] Implement graceful shutdown handling

## Deliverable
Improved database connection system with better performance

## Log
- 2025-04-15: Completed - 40% improvement in response times, reduced connection errors to near zero`,
  },
];

export const mockV2Subtasks: Task[] = [
  {
    id: 'subtask-001',
    title: 'Setup authentication database schema',
    type: 'task',
    status: 'done',
    priority: 'high',
    workflowState: 'current',
    parent_task: 'parent-001',
    sequence: '01',
    createdDate: '2025-05-10',
    updatedDate: '2025-05-15',
    tags: ['database', 'schema'],
    content: `## Instruction
Create tables for user authentication and sessions.

## Tasks
- [x] Create users table (id, email, password_hash, created_at, updated_at)
- [x] Create sessions table (id, user_id, token, expires_at, created_at)
- [x] Create oauth_providers table (id, user_id, provider, provider_id, created_at)

## Deliverable
Complete database schema for authentication system

## Log
- 2025-05-15: Migration completed - dev, test, and production ready`,
  },
  {
    id: 'subtask-002',
    title: 'Add password hashing middleware',
    type: 'task',
    status: 'in_progress',
    priority: 'high',
    workflowState: 'current',
    parent_task: 'parent-001',
    sequence: '02',
    createdDate: '2025-05-12',
    updatedDate: '2025-05-28',
    tags: ['security', 'middleware'],
    content: `## Instruction
Implement bcrypt hashing for password security.

## Tasks
- [x] Install bcrypt dependency
- [x] Create hashing utility functions
- [ ] Integrate with registration endpoint
- [ ] Add to password change endpoint
- [ ] Write unit tests

## Deliverable
Secure password hashing middleware integrated into auth system

## Log
- 2025-05-28: In progress - working on registration endpoint integration

## Security Notes
- Using bcrypt with salt rounds: 12
- Passwords are hashed before database storage
- Plain text passwords never stored`,
  },
  {
    id: 'subtask-003',
    title: 'Implement JWT token validation',
    type: 'task',
    status: 'todo',
    priority: 'high',
    workflowState: 'current',
    parent_task: 'parent-001',
    sequence: '03',
    createdDate: '2025-05-12',
    updatedDate: '2025-05-12',
    tags: ['jwt', 'validation', 'security'],
    content: `# Implement JWT Token Validation

Add middleware to validate JWT tokens on protected routes.

## Requirements
- Validate token signature
- Check token expiration
- Extract user information
- Handle invalid tokens gracefully
- Support token refresh flow

## Dependencies
- Requires password hashing middleware (task 02) to be complete
- Needs user database schema (task 01) ✅`,
  },
  {
    id: 'subtask-004a',
    title: 'Create login endpoint',
    type: 'task',
    status: 'todo',
    priority: 'high',
    workflowState: 'current',
    parent_task: 'parent-001',
    sequence: '04a',
    createdDate: '2025-05-13',
    updatedDate: '2025-05-13',
    tags: ['api', 'endpoint'],
    content: `## Instruction
Build POST /auth/login endpoint with validation.

## Tasks
- [ ] Create POST /auth/login endpoint
- [ ] Validate email format and password requirements
- [ ] Return JWT token and user profile on success
- [ ] Handle invalid credentials errors
- [ ] Add account lockout protection

## Deliverable
Functional login endpoint with proper validation and error handling

## Log

## Parallel with Logout
This task can be developed in parallel with the logout endpoint (04b).`,
  },
  {
    id: 'subtask-004b',
    title: 'Create logout endpoint',
    type: 'task',
    status: 'todo',
    priority: 'high',
    workflowState: 'current',
    parent_task: 'parent-001',
    sequence: '04b',
    createdDate: '2025-05-13',
    updatedDate: '2025-05-13',
    tags: ['api', 'endpoint'],
    content: `# Create Logout Endpoint

Build POST /auth/logout endpoint to invalidate sessions.

## Specification
- **Endpoint**: POST /auth/logout
- **Headers**: Authorization: Bearer <token>
- **Response**: { success: boolean, message: string }
- **Action**: Invalidate JWT token, clear session
- **Error Handling**: Invalid token, already logged out

## Parallel with Login
This task can be developed in parallel with the login endpoint (04a).`,
  },
  {
    id: 'subtask-005',
    title: 'Add session management',
    type: 'task',
    status: 'blocked',
    priority: 'medium',
    workflowState: 'current',
    parent_task: 'parent-001',
    sequence: '05',
    createdDate: '2025-05-14',
    updatedDate: '2025-05-14',
    tags: ['session', 'redis'],
    content: `# Add Session Management

Implement Redis-based session storage and management.

## Blocked By
- Redis infrastructure not yet available in production
- Waiting for DevOps team to provision Redis cluster

## Requirements
- Session storage in Redis
- Session expiration handling
- Session cleanup for logged out users
- Multi-device session support

## Timeline
Blocked until Redis is available (estimated: next week)`,
  },
  {
    id: 'subtask-006',
    title: 'Implement password reset flow',
    type: 'task',
    status: 'todo',
    priority: 'low',
    workflowState: 'current',
    parent_task: 'parent-001',
    sequence: '06',
    createdDate: '2025-05-14',
    updatedDate: '2025-05-14',
    tags: ['password', 'email', 'recovery'],
    content: `# Implement Password Reset Flow

Build email-based password reset with secure tokens.

## Flow
1. User requests password reset
2. System generates secure token
3. Email sent with reset link
4. User clicks link, enters new password
5. Token validated and password updated

## Security Considerations
- Tokens expire after 1 hour
- Single-use tokens
- Rate limiting on reset requests
- Secure token generation`,
  },
];

export const mockV2ParentTasks: ParentTask[] = [
  {
    id: 'parent-001',
    title: 'User Authentication System',
    type: 'parent_task',
    status: 'in_progress',
    priority: 'high',
    workflowState: 'current',
    createdDate: '2025-05-10',
    updatedDate: '2025-05-28',
    tags: ['security', 'backend', 'api', 'authentication'],
    content: `# User Authentication System

Implement complete user authentication system with JWT tokens, password hashing, and session management. Includes login, logout, and password reset functionality.

## Key Features
- Secure password hashing with bcrypt
- JWT token-based authentication  
- Session management with Redis
- Email-based password reset
- Social authentication providers

## Architecture Overview
The authentication system follows industry best practices:
1. **Password Security**: bcrypt hashing with salt rounds
2. **Token Management**: JWT with proper expiration and validation
3. **Session Handling**: Redis-based session storage for scalability
4. **Security**: Rate limiting, secure token generation, proper error handling

## Success Criteria
- Users can register and login securely
- Passwords are properly hashed and stored
- JWT tokens are validated on protected routes  
- Sessions are managed efficiently
- Password reset flow works end-to-end
- System handles edge cases gracefully (invalid tokens, expired sessions, etc.)

## Current Status
- Database schema completed ✅
- Password hashing in progress 🔄
- Remaining tasks depend on infrastructure setup`,
    subtasks: [
      'subtask-001',
      'subtask-002',
      'subtask-003',
      'subtask-004a',
      'subtask-004b',
      'subtask-005',
      'subtask-006',
    ],
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
    workflowState: 'backlog',
    createdDate: '2025-05-25',
    updatedDate: '2025-05-25',
    tags: ['api', 'security', 'performance'],
    content: `# API Rate Limiting

Implement comprehensive rate limiting to protect API endpoints from abuse and ensure fair usage.

## Key Features
- Per-user rate limiting
- Per-IP rate limiting  
- Different limits for different endpoint types
- Redis-based rate limit storage
- Rate limit headers in responses
- Graceful degradation under load

## Implementation Strategy
1. **Middleware Approach**: Express middleware for easy integration
2. **Storage Backend**: Redis for distributed rate limiting
3. **Configuration**: Environment-based limits for different environments
4. **Monitoring**: Metrics and alerts for rate limit violations

## Rate Limit Tiers
- **Public endpoints**: 100 requests/hour per IP
- **Authenticated users**: 1000 requests/hour per user
- **Premium users**: 5000 requests/hour per user
- **Admin endpoints**: 50 requests/hour per user

## Success Criteria
- API is protected from abuse
- Rate limits are enforced consistently
- Users receive clear feedback when limits are reached
- Rate limiting doesn't impact normal usage
- System remains performant under high load
- Easy configuration for different environments`,
    subtasks: [],
    progress: {
      completed: 0,
      total: 0,
    },
  },
  {
    id: 'parent-003',
    title: 'Database Migration to PostgreSQL',
    type: 'parent_task',
    status: 'archived',
    priority: 'high',
    workflowState: 'archive',
    archived_date: '2025-04',
    createdDate: '2025-03-01',
    updatedDate: '2025-04-20',
    tags: ['database', 'migration', 'postgresql'],
    content: `# Database Migration to PostgreSQL

Successfully migrated from SQLite to PostgreSQL for improved performance and scalability.

## Completed Work
- ✅ Database schema migration
- ✅ Data migration scripts
- ✅ Connection pool optimization
- ✅ Query performance tuning
- ✅ Backup and restore procedures
- ✅ Production deployment

## Results Achieved
- 3x improvement in query performance
- Support for concurrent connections
- Better JSON data handling
- Improved backup and recovery
- Ready for horizontal scaling

## Lessons Learned
- Early performance testing saved significant rework
- Staged migration approach minimized downtime
- Connection pooling crucial for performance`,
    subtasks: [],
    progress: {
      completed: 6,
      total: 6,
    },
  },
];

// Combined mock data for easy access
export const mockV2Data = {
  tasks: [...mockV2SimpleTasks, ...mockV2Subtasks],
  parentTasks: mockV2ParentTasks,
  simpleTasks: mockV2SimpleTasks,
  subtasks: mockV2Subtasks,
};

// Utility functions for mock data manipulation
export const mockV2Utils = {
  // Get tasks by workflow state
  getTasksByWorkflow: (workflow: WorkflowState) =>
    mockV2Data.tasks.filter((task) => task.workflowState === workflow),

  // Get subtasks for a parent task
  getSubtasks: (parentId: string) =>
    mockV2Data.subtasks.filter((task) => task.parent_task === parentId),

  // Get parent task by ID
  getParentTask: (parentId: string) =>
    mockV2Data.parentTasks.find((parent) => parent.id === parentId),

  // Get tasks with specific status
  getTasksByStatus: (status: TaskStatus) =>
    mockV2Data.tasks.filter((task) => task.status === status),

  // Get tasks with specific type
  getTasksByType: (type: TaskType) => mockV2Data.tasks.filter((task) => task.type === type),

  // Get parallel tasks (same sequence base, different suffixes)
  getParallelTasks: (parentId: string) => {
    const subtasks = mockV2Utils.getSubtasks(parentId);
    const sequenceGroups: Record<string, Task[]> = {};

    for (const task of subtasks) {
      if (task.sequence) {
        const baseSequence = task.sequence.replace(/[a-z]$/, '');
        if (!sequenceGroups[baseSequence]) {
          sequenceGroups[baseSequence] = [];
        }
        sequenceGroups[baseSequence].push(task);
      }
    }

    return Object.values(sequenceGroups).filter((group) => group.length > 1);
  },
};

export default mockV2Data;
