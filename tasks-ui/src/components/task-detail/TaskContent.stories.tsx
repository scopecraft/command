import type { Meta, StoryObj } from '@storybook/react';
import { TaskContent } from './TaskContent';
import type { Task } from '../../lib/types';

// Mock task data
const mockTask: Task = {
  id: 'task-001',
  title: 'Implement User Authentication',
  type: 'feature',
  status: 'In Progress',
  content: `# User Authentication Implementation

## Overview
Implement a complete user authentication system with JWT tokens, password hashing, and session management.

## Requirements
- JWT token generation and validation
- Secure password hashing using bcrypt
- Session management with Redis
- Password reset functionality

## Technical Details
\`\`\`javascript
// Example JWT payload
{
  userId: "123",
  email: "user@example.com",
  roles: ["user", "admin"]
}
\`\`\`

## Progress
- [x] Database schema setup
- [x] Password hashing middleware
- [ ] JWT implementation
- [ ] Session management
- [ ] Password reset flow`,
};

const meta = {
  title: 'Task Detail/TaskContent',
  component: TaskContent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Note: Since TaskContent uses context, we'll need to refactor it to be pure
// For now, these stories show the intended usage patterns

export const Default: Story = {
  args: {
    task: mockTask,
  },
};

export const EmptyContent: Story = {
  args: {
    task: {
      ...mockTask,
      content: '',
    },
  },
};

export const ShortContent: Story = {
  args: {
    task: {
      ...mockTask,
      content: 'This is a brief task description without much detail.',
    },
  },
};

export const MarkdownFormatting: Story = {
  args: {
    task: {
      ...mockTask,
      content: `# Markdown Showcase

## Text Formatting
This shows **bold text**, *italic text*, and ~~strikethrough~~.

## Lists
### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Code Blocks
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

## Tables
| Feature | Status | Priority |
|---------|--------|----------|
| Auth | Done | High |
| API | In Progress | Medium |
| UI | To Do | Low |

## Blockquotes
> This is an important note about the implementation.
> It spans multiple lines.

## Links
Check the [documentation](https://example.com) for more details.`,
    },
  },
};

export const WithMermaidDiagram: Story = {
  args: {
    task: {
      ...mockTask,
      content: `# Task with Mermaid Diagram

## Flow Diagram

\`\`\`mermaid
graph TD
    A[User Login] --> B{Valid Credentials?}
    B -->|Yes| C[Generate JWT]
    B -->|No| D[Show Error]
    C --> E[Create Session]
    E --> F[Redirect to Dashboard]
    D --> G[Retry Login]
    G --> A
\`\`\`

## Implementation Notes
The above diagram shows the authentication flow for our system.`,
    },
  },
};

export const LongContent: Story = {
  args: {
    task: {
      ...mockTask,
      content: `# Comprehensive Task Documentation

${Array(20)
  .fill(0)
  .map(
    (_, i) => `## Section ${i + 1}
This is paragraph ${i + 1} of the task documentation. It contains detailed information about various aspects of the implementation, including technical specifications, requirements, and progress updates.

- Point 1 for section ${i + 1}
- Point 2 for section ${i + 1}
- Point 3 for section ${i + 1}

\`\`\`javascript
// Code example ${i + 1}
function example${i + 1}() {
  return "Example ${i + 1}";
}
\`\`\`
`
  )
  .join('\n')}`,
    },
  },
};

// Note: In the actual implementation, these would demonstrate edit mode
// For now, they show the component in different states
export const EditMode: Story = {
  args: {
    task: mockTask,
  },
  parameters: {
    docs: {
      description: {
        story: 'This would show the component in edit mode with a textarea for content editing.',
      },
    },
  },
};

export const SavingState: Story = {
  args: {
    task: mockTask,
  },
  parameters: {
    docs: {
      description: {
        story: 'This would show the component while saving changes with a loading state.',
      },
    },
  },
};