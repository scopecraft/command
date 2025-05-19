import { fireEvent, render, waitFor } from '@testing-library/react';
import { UIProvider } from '../../context/UIContext';
import { MermaidDiagram } from './MermaidDiagram';

// Mock mermaid module
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({ svg: '<svg>Mock Diagram</svg>' }),
}));

// Mock Dialog components
jest.mock('../ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
}));

describe('MermaidDiagram', () => {
  const mockCode = `
    flowchart TD
      A[Start] --> B[End]
  `;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UIProvider>{children}</UIProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders diagram successfully', async () => {
    const { container } = render(<MermaidDiagram code={mockCode} />, { wrapper });

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  it('handles render errors gracefully', async () => {
    const mermaid = require('mermaid');
    mermaid.render.mockRejectedValueOnce(new Error('Invalid syntax'));

    const { container } = render(<MermaidDiagram code="invalid code" />, { wrapper });

    await waitFor(() => {
      const error = container.querySelector('.text-destructive');
      expect(error?.textContent).toContain('Diagram Error:');
      expect(error?.textContent).toContain('Invalid syntax');
    });
  });

  it('applies custom className', () => {
    const { container } = render(<MermaidDiagram code={mockCode} className="custom-class" />, {
      wrapper,
    });

    const mermaidContainer = container.querySelector('.mermaid-container');
    expect(mermaidContainer?.classList.contains('custom-class')).toBe(true);
  });

  it('re-renders when code changes', async () => {
    const mermaid = require('mermaid');
    const { rerender } = render(<MermaidDiagram code={mockCode} />, { wrapper });

    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalledTimes(1);
    });

    const newCode = `
      sequenceDiagram
        A->>B: Hello
    `;

    rerender(<MermaidDiagram code={newCode} />);

    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalledTimes(2);
    });
  });

  it('shows expand button on hover', async () => {
    const { container, getByRole } = render(<MermaidDiagram code={mockCode} />, { wrapper });

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    // The expand button should be present but hidden initially
    const expandButton = getByRole('button', { name: /expand diagram/i });
    expect(expandButton).toBeTruthy();
    expect(expandButton.classList.contains('opacity-0')).toBe(true);
  });

  it('opens dialog when expand button is clicked', async () => {
    const { container, getByRole, queryByTestId } = render(<MermaidDiagram code={mockCode} />, {
      wrapper,
    });

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    // Initially, dialog should not be present
    expect(queryByTestId('dialog')).toBeNull();

    // Click the expand button
    const expandButton = getByRole('button', { name: /expand diagram/i });
    fireEvent.click(expandButton);

    // Dialog should now be present
    await waitFor(() => {
      expect(queryByTestId('dialog')).toBeTruthy();
      expect(queryByTestId('dialog-content')).toBeTruthy();
    });
  });

  it('does not show expand button when there is an error', async () => {
    const mermaid = require('mermaid');
    mermaid.render.mockRejectedValueOnce(new Error('Invalid syntax'));

    const { queryByRole } = render(<MermaidDiagram code="invalid code" />, { wrapper });

    await waitFor(() => {
      const expandButton = queryByRole('button', { name: /expand diagram/i });
      expect(expandButton).toBeNull();
    });
  });
});
