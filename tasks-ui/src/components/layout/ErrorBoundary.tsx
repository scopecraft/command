import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Show custom fallback UI if provided, otherwise show default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-background text-foreground">
          <div className="w-full max-w-md p-6 rounded-lg border border-border bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <div className="mb-4 text-sm text-muted-foreground">
              <p className="mb-2">An error occurred in the application:</p>
              <pre className="p-2 rounded bg-muted text-xs overflow-auto max-h-40">
                {this.state.error?.toString() || 'Unknown error'}
              </pre>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button onClick={this.handleReset}>Try Again</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
