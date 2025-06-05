import type { Meta, StoryObj } from '@storybook/react'
import { SectionEditor } from './SectionEditor'

const meta = {
  title: 'V2/SectionEditor',
  component: SectionEditor,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'atlas-dark',
      values: [
        { name: 'atlas-dark', value: '#121212' },
        { name: 'terminal-dark', value: '#1A1A1A' },
      ],
    },
  },
  argTypes: {
    section: {
      control: 'select',
      options: ['instruction', 'tasks', 'deliverable', 'log'],
    },
    readOnly: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof SectionEditor>

export default meta
type Story = StoryObj<typeof meta>

// Mock save handler with artificial delay
const mockSave = async (content: string) => {
  console.log('Saving content:', content)
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Content saved\!')
}

// 1. Default - View mode with content
export const Default: Story = {
  args: {
    section: 'instruction',
    content: `Implement the authentication flow for the application including login, logout, and session management.

### Requirements:
- Support email/password authentication
- Include JWT token management
- Add remember me functionality`,
    onSave: mockSave,
  },
}

// 2. Hover State - Show edit affordance
export const HoverState: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    pseudo: { hover: true },
  },
  play: async ({ canvasElement }) => {
    // Simulate hover to show [E] hint
    const card = canvasElement.querySelector('[class*="rounded-lg"]')
    if (card) {
      const event = new MouseEvent('mouseenter', { bubbles: true })
      card.dispatchEvent(event)
    }
  },
}

// 3. Edit Mode - Active editing
export const EditMode: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    // Simulate clicking to enter edit mode
    const content = canvasElement.querySelector('.prose')
    if (content) {
      const event = new MouseEvent('click', { bubbles: true })
      content.dispatchEvent(event)
    }
  },
}

// 4. Saving State - Loading during save
export const SavingState: Story = {
  args: {
    section: 'tasks',
    content: `- [x] Design authentication schema
- [ ] Implement login endpoint
- [ ] Add JWT token generation
- [ ] Create logout functionality`,
    onSave: async (content: string) => {
      // Longer delay to show saving state
      await new Promise(resolve => setTimeout(resolve, 3000))
    },
  },
  play: async ({ canvasElement }) => {
    // Enter edit mode and trigger save
    const content = canvasElement.querySelector('.prose')
    if (content) {
      content.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      
      // Wait for edit mode, then trigger save
      setTimeout(() => {
        const saveButton = canvasElement.querySelector('button:first-of-type')
        if (saveButton) {
          saveButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        }
      }, 500)
    }
  },
}

// 5. Read Only - No edit capability
export const ReadOnly: Story = {
  args: {
    section: 'deliverable',
    content: `## Authentication System Complete

The authentication system has been successfully implemented with all required features:

- ✅ Email/password authentication
- ✅ JWT token management with refresh tokens
- ✅ Remember me functionality with persistent sessions
- ✅ Secure password hashing with bcrypt
- ✅ Rate limiting on login attempts`,
    onSave: mockSave,
    readOnly: true,
  },
}

// 6. All Sections - Show each section type
export const InstructionSection: Story = {
  args: {
    section: 'instruction',
    content: `Create a comprehensive test suite for the authentication system.

Cover all edge cases including:
- Invalid credentials
- Expired tokens
- Concurrent sessions`,
    onSave: mockSave,
  },
}

export const TasksSection: Story = {
  args: {
    section: 'tasks',
    content: `- [ ] Write unit tests for auth service
- [ ] Add integration tests for endpoints
- [ ] Test token expiration scenarios
- [ ] Verify rate limiting works
- [ ] Check concurrent session handling`,
    onSave: mockSave,
  },
}

export const DeliverableSection: Story = {
  args: {
    section: 'deliverable',
    content: `## Test Coverage Report

- **Unit Tests**: 95% coverage
- **Integration Tests**: 88% coverage
- **E2E Tests**: All critical paths tested

All tests passing in CI/CD pipeline.`,
    onSave: mockSave,
  },
}

export const LogSection: Story = {
  args: {
    section: 'log',
    content: `- 2025-01-05 10:30: Started implementation of auth tests
- 2025-01-05 11:45: Completed unit tests for auth service
- 2025-01-05 14:20: Added integration tests for all endpoints
- 2025-01-05 16:00: Fixed failing tests related to token expiration`,
    onSave: mockSave,
  },
}

// Additional stories for edge cases
export const EmptyContent: Story = {
  args: {
    section: 'instruction',
    content: '',
    onSave: mockSave,
  },
}

export const LongContent: Story = {
  args: {
    section: 'deliverable',
    content: `## Comprehensive System Architecture

### Overview
The authentication system is built with a microservices architecture that ensures scalability, maintainability, and security. Each component is designed to handle specific responsibilities while maintaining loose coupling.

### Core Components

#### 1. Authentication Service
Handles all authentication-related operations:
- User registration and validation
- Login/logout flows
- Password reset mechanisms
- Two-factor authentication

#### 2. Token Management Service
Manages JWT tokens and sessions:
- Token generation with configurable expiration
- Refresh token rotation
- Token blacklisting for logout
- Session tracking across devices

#### 3. User Profile Service
Maintains user data and preferences:
- Profile information management
- Permission and role assignment
- Activity logging
- Privacy settings

### Security Measures

1. **Password Security**
   - Bcrypt hashing with salt rounds of 12
   - Password complexity requirements
   - History tracking to prevent reuse

2. **Token Security**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Secure HttpOnly cookies
   - CSRF protection

3. **Rate Limiting**
   - Progressive delays on failed attempts
   - IP-based tracking
   - Captcha after 3 failed attempts

### Performance Optimizations

- Redis caching for session data
- Database indexing on frequently queried fields
- Connection pooling for database efficiency
- Lazy loading of user permissions`,
    onSave: mockSave,
  },
}

// Story with markdown formatting
export const MarkdownFormatting: Story = {
  args: {
    section: 'instruction',
    content: `## Build a **REST API** for the task management system

### Endpoints to implement:

1. \`GET /api/tasks\` - List all tasks
2. \`POST /api/tasks\` - Create new task
3. \`PUT /api/tasks/:id\` - Update task
4. \`DELETE /api/tasks/:id\` - Delete task

### Code Example:

\`\`\`typescript
interface Task {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
}
\`\`\`

> **Note**: Use proper error handling and validation`,
    onSave: mockSave,
  },
}