import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { mockV2ParentTasks, mockV2SimpleTasks, mockV2Subtasks } from '../../lib/api/mock-data-v2';
import { DocumentsIcon, SubtasksIcon } from '../../lib/icons';
import { Button } from '../ui/button';
import { ClaudeAgentButton } from './ClaudeAgentButton';
import { ParentTaskCard } from './ParentTaskCard';
import { SubtaskList } from './SubtaskList';
import { TaskTypeIcon } from './TaskTypeIcon';
import { PriorityIndicator, StatusBadge, WorkflowStateBadge } from './WorkflowStateBadge';

const meta: Meta = {
  title: 'V2 Components/Complete Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete showcase of V2 components working together in realistic layouts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleTaskDetailPage: Story = {
  render: () => {
    const task = mockV2SimpleTasks[0]; // Login timeout bug
    const [isEditing, setIsEditing] = React.useState(false);
    const [content, setContent] = React.useState(`## Instruction
Users are experiencing random timeouts when logging in. The issue occurs sporadically and affects approximately 30% of login attempts during peak hours.

## Tasks
- [x] Reproduce the timeout issue locally
- [x] Add logging to authentication flow
- [ ] Identify bottleneck in login process
- [ ] Implement timeout handling
- [ ] Add retry mechanism
- [ ] Write tests for edge cases

## Deliverable
### Investigation Results

#### Root Cause
Found that the auth service is making synchronous calls to the user profile service, which times out under heavy load.

#### Proposed Solution
1. Make profile service calls asynchronous
2. Add circuit breaker pattern
3. Implement proper timeout handling with retries

## Log
- 2025-05-28: Bug reported by multiple users
- 2025-05-29: Reproduced locally with load testing
- 2025-05-29: Added debug logging to auth flow
- 2025-05-29: Identified synchronous call as bottleneck`);

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleCancel = () => {
      setContent(content); // Reset to saved version
      setIsEditing(false);
    };

    const handleSave = () => {
      console.log('Save task content:', content);
      setIsEditing(false);
      // In real app, would update the task
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <TaskTypeIcon task={task} />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <StatusBadge status={task.status} />
                    <PriorityIndicator priority={task.priority} />
                    <WorkflowStateBadge workflow={task.workflow_state} />
                    {task.area && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">Area: {task.area}</span>
                      </>
                    )}
                    {task.assignee && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">@{task.assignee}</span>
                      </>
                    )}
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag) => (
                        <span key={tag} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button variant="ghost" size="sm">
                  Convert to Parent
                </Button>
                <ClaudeAgentButton taskId={task.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Task Content (2/3) - Single editable area like parent */}
            <div className="lg:col-span-2">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Edit Task</h2>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleCancel} variant="ghost" size="sm">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} variant="atlas" size="sm">
                        Save
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-96 bg-background text-foreground p-4 font-mono text-sm resize-none focus:outline-none rounded-lg"
                      placeholder="Enter task content using Markdown..."
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supports Markdown formatting. Use ## for section headers.
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="group relative">
                  <Button
                    onClick={handleEdit}
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    Edit
                  </Button>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none cursor-text"
                    onClick={handleEdit}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (1/3) */}
            <div className="space-y-6">
              {/* Related Tasks Widget */}
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Related Tasks</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                    <TaskTypeIcon task={{ ...task, type: 'feature' }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">Implement session management</div>
                      <div className="text-xs text-muted-foreground">AUTH-002 • In Progress</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                    <TaskTypeIcon task={{ ...task, type: 'bug' }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">Profile service performance</div>
                      <div className="text-xs text-muted-foreground">PERF-045 • To Do</div>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline" size="sm">
                  Link Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const SubtaskDetailPage: Story = {
  render: () => {
    const subtask = mockV2Subtasks[0]; // API endpoint design
    const parentTask = mockV2ParentTasks[0]; // User Authentication System
    const siblingSubtasks = mockV2Subtasks.filter((t) => t.parent_task === subtask.parent_task);
    const _currentIndex = siblingSubtasks.findIndex((t) => t.id === subtask.id);

    const [isEditing, setIsEditing] = React.useState(false);
    const [content, setContent] = React.useState(`## Instruction
Design RESTful API endpoints for user authentication including login, logout, registration, and password reset. Follow OAuth2 standards where applicable.

## Tasks
- [x] Research OAuth2 best practices
- [x] Define endpoint structure
- [ ] Document request/response formats
- [ ] Define error codes and messages
- [ ] Create OpenAPI specification

## Deliverable
### API Endpoint Design

#### POST /auth/login
Request:
\`\`\`json
{
  "email": "user@example.com",
  "password": "********"
}
\`\`\`

Response:
\`\`\`json
{
  "access_token": "eyJ0eXAiOiJKV1Q...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4=",
  "expires_in": 3600
}
\`\`\`

#### POST /auth/register
[Design in progress...]

## Log
- 2025-05-29: Started API design based on requirements
- 2025-05-29: Researched OAuth2 and JWT best practices
- 2025-05-29: Completed login endpoint design`);

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleCancel = () => {
      setContent(content); // Reset to saved version
      setIsEditing(false);
    };

    const handleSave = () => {
      console.log('Save subtask content:', content);
      setIsEditing(false);
      // In real app, would update the subtask
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header with Parent Context */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            {/* Parent Task Context */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <TaskTypeIcon task={parentTask} />
              <button className="hover:text-foreground hover:underline">{parentTask.title}</button>
              <span>/</span>
              <span className="font-mono">{subtask.sequence_number}</span>
            </div>

            {/* Subtask Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <TaskTypeIcon task={subtask} />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground">{subtask.title}</h1>
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <StatusBadge status={subtask.status} />
                    <PriorityIndicator priority={subtask.priority} />
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                      {subtask.sequence_number}
                    </span>
                    {subtask.area && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">Area: {subtask.area}</span>
                      </>
                    )}
                    {subtask.assignee && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">@{subtask.assignee}</span>
                      </>
                    )}
                  </div>
                  {subtask.tags && subtask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {subtask.tags.map((tag) => (
                        <span key={tag} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button variant="ghost" size="sm">
                  Extract to Task
                </Button>
                <ClaudeAgentButton taskId={subtask.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Task Content (2/3) - Single editable area like parent */}
            <div className="lg:col-span-2">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Edit Subtask</h2>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleCancel} variant="ghost" size="sm">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} variant="atlas" size="sm">
                        Save
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-96 bg-background text-foreground p-4 font-mono text-sm resize-none focus:outline-none rounded-lg"
                      placeholder="Enter subtask content using Markdown..."
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supports Markdown formatting. Use ## for section headers.
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="group relative">
                  <Button
                    onClick={handleEdit}
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    Edit
                  </Button>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none cursor-text"
                    onClick={handleEdit}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (1/3) */}
            <div className="space-y-6">
              {/* Sibling Subtasks */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <SubtasksIcon size="md" className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Sibling Subtasks</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {siblingSubtasks.filter((t) => t.status === 'done').length}/
                    {siblingSubtasks.length}
                  </div>
                </div>
                <SubtaskList
                  subtasks={siblingSubtasks}
                  variant="compact"
                  highlightTaskId={subtask.id}
                  onTaskClick={(task) => console.log('Navigate to subtask:', task.title)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const ParentTaskDetailPage: Story = {
  render: () => {
    const parentTask = mockV2ParentTasks[0]; // User Authentication System
    const subtasks = mockV2Subtasks.filter((task) => task.parent_task === 'parent-001');
    const [isEditing, setIsEditing] = React.useState(false);
    const [content, setContent] = React.useState(parentTask.overview || '');

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleCancel = () => {
      setContent(parentTask.overview || '');
      setIsEditing(false);
    };

    const handleSave = () => {
      console.log('Save overview content:', content);
      setIsEditing(false);
      // In real app, would update the parent task
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <TaskTypeIcon task={parentTask} />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground">{parentTask.title}</h1>
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <StatusBadge status={parentTask.status} />
                    <PriorityIndicator priority={parentTask.priority} />
                    <WorkflowStateBadge workflow={parentTask.workflow_state} />
                    {parentTask.tags && parentTask.tags.length > 0 && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        {parentTask.tags.map((tag) => (
                          <span key={tag} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <ClaudeAgentButton taskId={parentTask.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overview - Main Content (2/3) */}
            <div className="lg:col-span-2">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Edit Overview</h2>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleCancel} variant="ghost" size="sm">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} variant="atlas" size="sm">
                        Save
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-96 bg-background text-foreground p-4 font-mono text-sm resize-none focus:outline-none rounded-lg"
                      placeholder="Enter overview content using Markdown..."
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supports Markdown formatting (headers, lists, links, etc.)
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="group relative">
                  <Button
                    onClick={handleEdit}
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    Edit
                  </Button>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none cursor-text"
                    onClick={handleEdit}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar (1/3) */}
            <div className="space-y-6">
              {/* Subtasks Widget */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <SubtasksIcon size="md" className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Subtasks</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {subtasks.filter((t) => t.status === 'done').length}/{subtasks.length}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round((subtasks.filter((t) => t.status === 'done').length / subtasks.length) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(
                      (subtasks.filter((t) => t.status === 'done').length / subtasks.length) * 100
                    )}
                    % complete
                  </div>
                </div>

                {/* Condensed Subtask List */}
                <SubtaskList
                  subtasks={subtasks}
                  variant="compact"
                  onTaskClick={(task) => console.log('Navigate to task detail:', task.id)}
                />

                {/* Subtask Actions */}
                <div className="mt-4 pt-3 border-t space-y-2">
                  <Button className="w-full text-left" variant="atlas">
                    + Add Subtask
                  </Button>
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="secondary" size="sm">
                      ↕ Reorder
                    </Button>
                    <Button className="flex-1" variant="secondary" size="sm">
                      ⚹ Make Parallel
                    </Button>
                  </div>
                </div>
              </div>

              {/* Documents Widget */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DocumentsIcon size="md" className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Documents</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">3</div>
                </div>

                {/* Document List */}
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer group"
                    onClick={() => console.log('Open PRD document')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        Product Requirements
                      </div>
                      <div className="text-xs text-muted-foreground">PRD • Updated 2 days ago</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit PRD');
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                  <div
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer group"
                    onClick={() => console.log('Open Technical Spec')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        Technical Specification
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Specification • Updated 1 week ago
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit Technical Spec');
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                  <div
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer group"
                    onClick={() => console.log('Open Research Notes')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        User Research Findings
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Research • Updated 3 days ago
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit Research Notes');
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Document Actions */}
                <div className="mt-4 pt-3 border-t space-y-2">
                  <Button className="w-full text-left" variant="atlas">
                    + Add Document
                  </Button>
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="secondary" size="sm">
                      Plan
                    </Button>
                    <Button className="flex-1" variant="secondary" size="sm">
                      PRD
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const DocumentDetailPage: Story = {
  render: () => {
    const parentTask = mockV2ParentTasks[0]; // User Authentication System
    const [isEditing, setIsEditing] = React.useState(false);
    const [content, setContent] = React.useState(`# Product Requirements Document

## Overview
This document outlines the requirements for implementing a comprehensive user authentication system that supports OAuth2, JWT tokens, and traditional session-based authentication.

## Goals
- Provide secure, scalable authentication
- Support multiple authentication methods
- Enable single sign-on (SSO) capabilities
- Maintain backwards compatibility

## User Stories

### As a new user
I want to register with email and password
So that I can create an account and access the platform

### As an existing user
I want to log in with my credentials
So that I can access my account securely

### As a user
I want to reset my password
So that I can regain access if I forget my credentials

## Technical Requirements

### Security
- Passwords must be hashed using bcrypt with cost factor 12
- JWT tokens expire after 1 hour
- Refresh tokens expire after 30 days
- All authentication endpoints use HTTPS

### Performance
- Login response time < 200ms
- Token validation < 50ms
- Support 10,000 concurrent authentications

## API Endpoints

### POST /auth/register
- Accepts: email, password, name
- Returns: user object, access token
- Validates email uniqueness

### POST /auth/login
- Accepts: email, password
- Returns: access token, refresh token
- Rate limited to 5 attempts per minute

## Next Steps
1. Review with security team
2. Create technical specification
3. Estimate implementation effort`);

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleCancel = () => {
      setContent(content); // Reset to saved version
      setIsEditing(false);
    };

    const handleSave = () => {
      console.log('Save document content:', content);
      setIsEditing(false);
      // In real app, would update the document
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h1 className="text-2xl font-bold text-foreground">Product Requirements</h1>
                    <span className="text-sm text-muted-foreground">Last modified: 2 days ago</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      #authentication
                    </span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">#oauth2</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">#security</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <ClaudeAgentButton taskId={`doc-${parentTask.id}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Document Content (2/3) - Single editable area like parent */}
            <div className="lg:col-span-2">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Edit Document</h2>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleCancel} variant="ghost" size="sm">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} variant="atlas" size="sm">
                        Save
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-96 bg-background text-foreground p-4 font-mono text-sm resize-none focus:outline-none rounded-lg"
                      placeholder="Enter document content using Markdown..."
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supports Markdown formatting. Perfect for PRDs, specs, and planning documents.
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="group relative">
                  <Button
                    onClick={handleEdit}
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    Edit
                  </Button>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none cursor-text"
                    onClick={handleEdit}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (1/3) */}
            <div className="space-y-6">
              {/* Other Documents */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DocumentsIcon size="md" className="text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Other Documents</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">3</div>
                </div>

                {/* Document List */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50 cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        Product Requirements
                      </div>
                      <div className="text-xs text-muted-foreground">PRD • Current</div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer group"
                    onClick={() => console.log('Open Technical Spec')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        Technical Specification
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Specification • Updated 1 week ago
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer group"
                    onClick={() => console.log('Open Research Notes')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        User Research Findings
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Research • Updated 3 days ago
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Actions */}
                <div className="mt-4 pt-3 border-t space-y-2">
                  <Button className="w-full text-left" variant="atlas">
                    + New Document
                  </Button>
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="secondary" size="sm">
                      Template
                    </Button>
                    <Button className="flex-1" variant="secondary" size="sm">
                      Import
                    </Button>
                  </div>
                </div>
              </div>

              {/* Parent Task */}
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Parent Task</h3>
                <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <TaskTypeIcon task={parentTask} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{parentTask.title}</div>
                    <div className="text-xs text-muted-foreground">
                      <StatusBadge status={parentTask.status} size="sm" />
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline" size="sm">
                  View Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const WorkflowDashboard: Story = {
  render: () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Workflow Dashboard</h1>
          <p className="text-muted-foreground mt-1">Organize your work by workflow states</p>
        </div>
      </div>

      {/* Workflow Columns */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Backlog */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WorkflowStateBadge workflow="backlog" />
              <span className="text-muted-foreground">
                ({mockV2ParentTasks.filter((t) => t.workflow_state === 'backlog').length})
              </span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter((task) => task.workflow_state === 'backlog')
                .map((task) => (
                  <ParentTaskCard
                    key={task.id}
                    parentTask={task}
                    variant="compact"
                    onClick={() => console.log('Navigate to:', task.title)}
                  />
                ))}
            </div>
          </div>

          {/* Current */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WorkflowStateBadge workflow="current" />
              <span className="text-muted-foreground">
                ({mockV2ParentTasks.filter((t) => t.workflow_state === 'current').length})
              </span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter((task) => task.workflow_state === 'current')
                .map((task) => (
                  <ParentTaskCard
                    key={task.id}
                    parentTask={task}
                    variant="compact"
                    onClick={() => console.log('Navigate to:', task.title)}
                  />
                ))}
            </div>
          </div>

          {/* Archive */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <WorkflowStateBadge workflow="archive" />
              <span className="text-muted-foreground">
                ({mockV2ParentTasks.filter((t) => t.workflow_state === 'archive').length})
              </span>
            </div>
            <div className="space-y-3">
              {mockV2ParentTasks
                .filter((task) => task.workflow_state === 'archive')
                .map((task) => (
                  <ParentTaskCard
                    key={task.id}
                    parentTask={task}
                    variant="compact"
                    onClick={() => console.log('Navigate to:', task.title)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const MixedTaskList: Story = {
  render: () => {
    const allTasks = [...mockV2SimpleTasks, ...mockV2ParentTasks];

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">All Tasks</h1>
                <p className="text-muted-foreground mt-1">
                  Mixed view of parent tasks and simple tasks
                </p>
              </div>
              <div className="flex items-center gap-2">
                <WorkflowStateBadge workflow="current" size="sm" />
                <span className="text-muted-foreground">
                  {allTasks.filter((t) => t.workflow_state === 'current').length} tasks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-4">
            {allTasks
              .filter((task) => task.workflow_state === 'current')
              .map((task) => {
                if ('subtasks' in task) {
                  // Parent task
                  return (
                    <ParentTaskCard
                      key={task.id}
                      parentTask={task}
                      variant="default"
                      onClick={() => console.log('Navigate to parent:', task.title)}
                    />
                  );
                }
                // Simple task
                return (
                  <div
                    key={task.id}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => console.log('Navigate to task:', task.title)}
                  >
                    <div className="flex items-start gap-3">
                      <TaskTypeIcon task={task} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground">{task.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={task.status} size="sm" />
                          <PriorityIndicator priority={task.priority} size="sm" />
                          <WorkflowStateBadge workflow={task.workflow_state} size="sm" />
                        </div>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {task.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  },
};

export const ComponentShowcase: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">V2 Component Library</h1>
        <p className="text-muted-foreground">
          Clean, modern UI components for workflow-based task management
        </p>
      </div>

      {/* Icons */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Task Type Icons</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={mockV2ParentTasks[0]} />
            <span>Parent Task</span>
          </div>
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={{ ...mockV2SimpleTasks[0], type: 'bug' }} />
            <span>Bug</span>
          </div>
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={{ ...mockV2SimpleTasks[0], type: 'feature' }} />
            <span>Feature</span>
          </div>
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={{ ...mockV2SimpleTasks[0], type: 'documentation' }} />
            <span>Docs</span>
          </div>
          <div className="flex items-center gap-2">
            <TaskTypeIcon task={{ ...mockV2SimpleTasks[0], type: 'test' }} />
            <span>Test</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Status & Priority Badges</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Workflow States</h3>
            <div className="flex gap-2">
              <WorkflowStateBadge workflow="backlog" />
              <WorkflowStateBadge workflow="current" />
              <WorkflowStateBadge workflow="archive" />
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Task Status</h3>
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status="todo" />
              <StatusBadge status="in_progress" />
              <StatusBadge status="done" />
              <StatusBadge status="blocked" />
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Priority Levels</h3>
            <div className="flex gap-2">
              <PriorityIndicator priority="highest" />
              <PriorityIndicator priority="high" />
              <PriorityIndicator priority="low" />
            </div>
          </div>
        </div>
      </div>

      {/* Sample Parent Task */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Parent Task Card</h2>
        <ParentTaskCard parentTask={mockV2ParentTasks[0]} variant="default" />
      </div>

      {/* Sample Subtask List */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Subtask Tree View</h2>
        <SubtaskList
          subtasks={mockV2Subtasks.filter((t) => t.parent_task === 'parent-001').slice(0, 5)}
          variant="tree"
        />
      </div>
    </div>
  ),
};
