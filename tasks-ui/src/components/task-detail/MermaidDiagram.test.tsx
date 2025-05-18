import { render, waitFor } from '@testing-library/react';
import { MermaidDiagram } from './MermaidDiagram';
import { UIProvider } from '../../context/UIContext';

// Mock mermaid module
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({ svg: '<svg>Mock Diagram</svg>' }),
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
    const { container } = render(
      <MermaidDiagram code={mockCode} />,
      { wrapper }
    );

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  it('handles render errors gracefully', async () => {
    const mermaid = require('mermaid');
    mermaid.render.mockRejectedValueOnce(new Error('Invalid syntax'));

    const { container } = render(
      <MermaidDiagram code="invalid code" />,
      { wrapper }
    );

    await waitFor(() => {
      const error = container.querySelector('.text-destructive');
      expect(error?.textContent).toContain('Diagram Error:');
      expect(error?.textContent).toContain('Invalid syntax');
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <MermaidDiagram code={mockCode} className="custom-class" />,
      { wrapper }
    );

    const mermaidContainer = container.querySelector('.mermaid-container');
    expect(mermaidContainer?.classList.contains('custom-class')).toBe(true);
  });

  it('re-renders when code changes', async () => {
    const mermaid = require('mermaid');
    const { rerender } = render(
      <MermaidDiagram code={mockCode} />,
      { wrapper }
    );

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
});