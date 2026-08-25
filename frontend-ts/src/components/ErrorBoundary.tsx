import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
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

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error in ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/app';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shadow-xs">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Something went wrong
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An unexpected render error occurred in this view. Your session and saved data are intact.
            </p>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="w-full max-w-lg p-3 rounded-xl bg-muted/40 border border-border text-left overflow-x-auto text-[11px] font-mono text-rose-600 dark:text-rose-400 max-h-32">
              {this.state.error.toString()}
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleGoHome}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
            <Button
              size="sm"
              onClick={this.handleReset}
              className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
            >
              <RefreshCw className="h-4 w-4" /> Reload View
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
