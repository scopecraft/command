import { Maximize2 } from 'lucide-react';
import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';
import { useUIContext } from '../../context/UIContext';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

// Initialize mermaid without auto-start
mermaid.initialize({
  startOnLoad: false,
  deterministicIds: true,
  securityLevel: 'loose',
  theme: 'default',
  themeVariables: {
    darkMode: false,
  },
});

export function MermaidDiagram({ code, className = '' }: MermaidDiagramProps) {
  const { ui } = useUIContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !code) return;

      try {
        // Configure mermaid for the current theme
        mermaid.initialize({
          startOnLoad: false,
          deterministicIds: true,
          securityLevel: 'loose',
          theme: ui.darkMode ? 'dark' : 'default',
          themeVariables: {
            darkMode: ui.darkMode,
            // Ensure text is readable in both themes with muted colors
            primaryTextColor: ui.darkMode ? '#a9b1d6' : '#24292e',
            primaryColor: ui.darkMode ? '#565f89' : '#4a5568', // More muted colors
            secondaryColor: ui.darkMode ? '#3f4460' : '#e2e8f0',
            lineColor: ui.darkMode ? '#3f4460' : '#d0d7de',
            edgeLabelBackground: ui.darkMode ? '#1a1b26' : '#ffffff',
            backgroundColor: ui.darkMode ? '#1a1b26' : '#ffffff',
            // Avoid bright/jarring colors that could trigger epilepsy
            errorBkgColor: ui.darkMode ? '#2d1b2e' : '#fee',
            errorTextColor: ui.darkMode ? '#bb9af7' : '#9b2c2c',
          },
        });

        const { svg } = await mermaid.render(idRef.current, code);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
        setError(errorMessage);

        // Display error message
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="text-destructive text-sm p-4 border border-destructive rounded-md">
              <strong>Diagram Error:</strong> ${errorMessage}
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [code, ui.darkMode]);

  return (
    <>
      <div className={`mermaid-container relative group ${className}`}>
        {!error && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={() => setIsExpanded(true)}
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Expand diagram</span>
          </Button>
        )}
        <div ref={containerRef} className="overflow-x-auto" />
      </div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-8 bg-card">
          <div className="w-full h-full bg-card p-4 rounded-lg border border-border">
            <MermaidDiagramInner code={code} className="h-full w-full" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Inner component for rendering in the modal to avoid circular dependencies
function MermaidDiagramInner({ code, className = '' }: MermaidDiagramProps) {
  const { ui } = useUIContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-modal-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !code) return;

      try {
        // Configure mermaid for the current theme
        mermaid.initialize({
          startOnLoad: false,
          deterministicIds: true,
          securityLevel: 'loose',
          theme: ui.darkMode ? 'dark' : 'default',
          themeVariables: {
            darkMode: ui.darkMode,
            // Ensure text is readable in both themes with muted colors
            primaryTextColor: ui.darkMode ? '#a9b1d6' : '#24292e',
            primaryColor: ui.darkMode ? '#565f89' : '#4a5568', // More muted colors
            secondaryColor: ui.darkMode ? '#3f4460' : '#e2e8f0',
            lineColor: ui.darkMode ? '#3f4460' : '#d0d7de',
            edgeLabelBackground: ui.darkMode ? '#1a1b26' : '#ffffff',
            backgroundColor: ui.darkMode ? '#1a1b26' : '#ffffff',
            // Avoid bright/jarring colors that could trigger epilepsy
            errorBkgColor: ui.darkMode ? '#2d1b2e' : '#fee',
            errorTextColor: ui.darkMode ? '#bb9af7' : '#9b2c2c',
          },
        });

        const { svg } = await mermaid.render(idRef.current, code);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';

        // Display error message
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="text-destructive text-sm p-4 border border-destructive rounded-md">
              <strong>Diagram Error:</strong> ${errorMessage}
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [code, ui.darkMode]);

  return (
    <div className={`mermaid-modal-container ${className}`}>
      <div ref={containerRef} className="mermaid-modal-content" />
    </div>
  );
}
