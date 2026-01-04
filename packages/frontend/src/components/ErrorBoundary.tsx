import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI instead of crashing the entire app.
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload the page to ensure clean state
    window.location.reload();
  };

  handleReportIssue = (): void => {
    const { error, errorInfo } = this.state;

    // Create GitHub issue URL with pre-filled error details
    const title = encodeURIComponent(`Error: ${error?.message || 'Unknown error'}`);
    const body = encodeURIComponent(
      `## Error Details\n\n` +
      `**Message:** ${error?.message || 'No message'}\n\n` +
      `**Stack:**\n\`\`\`\n${error?.stack || 'No stack trace'}\n\`\`\`\n\n` +
      `**Component Stack:**\n\`\`\`\n${errorInfo?.componentStack || 'No component stack'}\n\`\`\`\n\n` +
      `**Browser:** ${navigator.userAgent}\n\n` +
      `## Steps to Reproduce\n\n` +
      `1. \n2. \n3. \n\n` +
      `## Expected Behavior\n\n` +
      `## Actual Behavior\n\n`
    );

    window.open(
      `https://github.com/yourusername/youtube-to-ersatztv-stream/issues/new?title=${title}&body=${body}`,
      '_blank'
    );
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI provided
      if (fallback) {
        return fallback;
      }

      // Default error UI with Tailwind
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-2xl w-full bg-card border border-border rounded-lg shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="h-6 w-6 text-destructive"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-semibold text-card-foreground">Something went wrong</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                The application encountered an unexpected error and couldn't continue.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-card-foreground">Error Details:</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-mono text-destructive break-all">
                      {error.message}
                    </p>
                  </div>
                </div>
              )}

              {import.meta.env.DEV && error?.stack && (
                <details className="space-y-2">
                  <summary className="text-sm font-semibold cursor-pointer hover:text-primary text-card-foreground">
                    Stack Trace (Development Only)
                  </summary>
                  <div className="bg-muted p-3 rounded-md overflow-auto max-h-64">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all text-muted-foreground">
                      {error.stack}
                    </pre>
                  </div>
                </details>
              )}

              {import.meta.env.DEV && errorInfo?.componentStack && (
                <details className="space-y-2">
                  <summary className="text-sm font-semibold cursor-pointer hover:text-primary text-card-foreground">
                    Component Stack (Development Only)
                  </summary>
                  <div className="bg-muted p-3 rounded-md overflow-auto max-h-64">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all text-muted-foreground">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  You can try reloading the page to recover, or report this issue if the problem persists.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-2">
              <Button onClick={this.handleReset} variant="default">
                Reload Page
              </Button>
              <Button onClick={this.handleReportIssue} variant="outline">
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
