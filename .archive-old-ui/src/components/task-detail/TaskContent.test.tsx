import { render, waitFor } from '@testing-library/react';
import { TaskProvider } from '../../context/TaskContext';
import { UIProvider } from '../../context/UIContext';
import type { Task } from '../../lib/types';
import { TaskContent } from './TaskContent';

// Mock MermaidDiagram
jest.mock('./MermaidDiagram', () => ({
  MermaidDiagram: ({ code }: { code: string }) => <div data-testid="mermaid-diagram">{code}</div>,
}));

const mockTask: Task = {
  id: 'test-task',
  title: 'Test Task',
  type: 'test',
  status: 'todo',
  priority: 'medium',
  created_date: '2025-05-18',
  updated_date: '2025-05-18',
  assigned_to: '',
  phase: 'tests',
  tags: [],
  dependencies: [],
  dependent_tasks: [],
  content: '',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UIProvider>
    <TaskProvider>{children}</TaskProvider>
  </UIProvider>
);

describe('TaskContent', () => {
  it('renders regular markdown content', () => {
    const taskWithContent = {
      ...mockTask,
      content: '# Test Heading\n\nThis is a test paragraph.',
    };

    const { getByText } = render(<TaskContent task={taskWithContent} />, { wrapper });

    expect(getByText('Test Heading')).toBeTruthy();
    expect(getByText('This is a test paragraph.')).toBeTruthy();
  });

  it('renders mermaid diagrams', async () => {
    const taskWithMermaid = {
      ...mockTask,
      content: `
# Task with Mermaid

\`\`\`mermaid
flowchart TD
  A[Start] --> B[End]
\`\`\`

Some more content.
      `,
    };

    const { getByTestId, getByText } = render(<TaskContent task={taskWithMermaid} />, { wrapper });

    await waitFor(() => {
      const mermaidDiagram = getByTestId('mermaid-diagram');
      expect(mermaidDiagram).toBeTruthy();
      expect(mermaidDiagram.textContent).toContain('flowchart TD');
    });

    expect(getByText('Some more content.')).toBeTruthy();
  });

  it('renders regular code blocks without mermaid', () => {
    const taskWithCode = {
      ...mockTask,
      content: `
\`\`\`javascript
console.log('Hello, world!');
\`\`\`
      `,
    };

    const { container } = render(<TaskContent task={taskWithCode} />, { wrapper });

    const codeElement = container.querySelector('code.language-javascript');
    expect(codeElement).toBeTruthy();
    expect(codeElement?.textContent).toContain("console.log('Hello, world!');");
  });

  it('handles multiple mermaid diagrams', async () => {
    const taskWithMultipleDiagrams = {
      ...mockTask,
      content: `
\`\`\`mermaid
flowchart TD
  A[Start] --> B[End]
\`\`\`

\`\`\`mermaid
sequenceDiagram
  A->>B: Hello
\`\`\`
      `,
    };

    const { getAllByTestId } = render(<TaskContent task={taskWithMultipleDiagrams} />, { wrapper });

    await waitFor(() => {
      const mermaidDiagrams = getAllByTestId('mermaid-diagram');
      expect(mermaidDiagrams).toHaveLength(2);
    });
  });
});
