import type { Task, ParentTask, WorkflowState, TaskStatus, TaskType } from '../types';

// V2 Mock Tasks for testing the new workflow-based structure
export const mockV2SimpleTasks: Task[] = [
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
    content: `# Fix Authentication Bug

Users are experiencing login failures when using social auth providers.

## Steps to Reproduce
1. Navigate to login page
2. Click "Login with Google"
3. Complete OAuth flow
4. Returns to app with error

## Expected Behavior
User should be logged in successfully.

## Investigation Notes
- Issue appears to be related to OAuth callback URL configuration
- Only affects Google and GitHub providers
- Local auth works fine

## Solution Plan
1. Check OAuth app configuration in Google Console
2. Verify callback URLs match production domain
3. Test with different providers
4. Update error handling for better UX`,
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
    content: `# Update API Documentation

Bring the API docs up to date with recent endpoint changes.

## Changes Needed
- Add new authentication endpoints
- Update rate limiting documentation
- Document new error response formats
- Add examples for new features

## Timeline
Target completion: End of sprint`,
  },
  {
    id: 'simple-003',
    title: 'Refactor database connection pooling',
    type: 'chore',
    status: 'archived',
    priority: 'low',
    workflow_state: 'archive',
    created_date: '2025-04-01',
    updated_date: '2025-04-15',
    archived_date: '2025-04',
    tags: ['database', 'performance'],
    content: `# Refactor Database Connection Pooling

Completed: Improved database connection management for better performance.

## What Was Done
- Migrated from basic connection to connection pooling
- Optimized pool size based on load testing
- Added connection health checks
- Implemented graceful shutdown handling

## Results
- 40% improvement in response times
- Reduced connection errors to near zero
- Better resource utilization`,
  },
];

export const mockV2Subtasks: Task[] = [
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
    content: `# Setup Authentication Database Schema

Create tables for user authentication and sessions.

## Tables Created
- users (id, email, password_hash, created_at, updated_at)
- sessions (id, user_id, token, expires_at, created_at)
- oauth_providers (id, user_id, provider, provider_id, created_at)

## Migration Status
✅ Development database updated
✅ Test database updated  
✅ Production migration ready`,
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
    content: `# Add Password Hashing Middleware

Implement bcrypt hashing for password security.

## Progress
- ✅ Installed bcrypt dependency
- ✅ Created hashing utility functions  
- 🔄 Currently: Integrating with registration endpoint
- ⏳ TODO: Add to password change endpoint
- ⏳ TODO: Write unit tests

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
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '03',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
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
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '04a',
    created_date: '2025-05-13',
    updated_date: '2025-05-13',
    tags: ['api', 'endpoint'],
    content: `# Create Login Endpoint

Build POST /auth/login endpoint with validation.

## Specification
- **Endpoint**: POST /auth/login
- **Body**: { email: string, password: string }
- **Response**: { token: string, user: UserProfile }
- **Validation**: Email format, password requirements
- **Error Handling**: Invalid credentials, account locked, etc.

## Parallel with Logout
This task can be developed in parallel with the logout endpoint (04b).`,
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
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '05',
    created_date: '2025-05-14',
    updated_date: '2025-05-14',
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
    workflow_state: 'current',
    parent_task: 'parent-001',
    sequence: '06',
    created_date: '2025-05-14',
    updated_date: '2025-05-14',
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
    workflow_state: 'current',
    created_date: '2025-05-10',
    updated_date: '2025-05-28',
    tags: ['security', 'backend', 'api', 'authentication'],
    overview: `# User Authentication System

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
    overview: `# API Rate Limiting

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
    content: '',
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
    workflow_state: 'archive',
    archived_date: '2025-04',
    created_date: '2025-03-01',
    updated_date: '2025-04-20',
    tags: ['database', 'migration', 'postgresql'],
    overview: `# Database Migration to PostgreSQL

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
    content: '',
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
    mockV2Data.tasks.filter(task => task.workflow_state === workflow),
  
  // Get subtasks for a parent task
  getSubtasks: (parentId: string) => 
    mockV2Data.subtasks.filter(task => task.parent_task === parentId),
  
  // Get parent task by ID
  getParentTask: (parentId: string) => 
    mockV2Data.parentTasks.find(parent => parent.id === parentId),
  
  // Get tasks with specific status
  getTasksByStatus: (status: TaskStatus) => 
    mockV2Data.tasks.filter(task => task.status === status),
  
  // Get tasks with specific type
  getTasksByType: (type: TaskType) => 
    mockV2Data.tasks.filter(task => task.type === type),
  
  // Get parallel tasks (same sequence base, different suffixes)
  getParallelTasks: (parentId: string) => {
    const subtasks = mockV2Utils.getSubtasks(parentId);
    const sequenceGroups: Record<string, Task[]> = {};
    
    subtasks.forEach(task => {
      if (task.sequence) {
        const baseSequence = task.sequence.replace(/[a-z]$/, '');
        if (!sequenceGroups[baseSequence]) {
          sequenceGroups[baseSequence] = [];
        }
        sequenceGroups[baseSequence].push(task);
      }
    });
    
    return Object.values(sequenceGroups).filter(group => group.length > 1);
  },
};

export default mockV2Data;