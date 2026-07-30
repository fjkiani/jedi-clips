'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the dashboard.
 * Catches unexpected errors and shows a friendly recovery UI.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred. This has been logged and our team will
        investigate. You can try again or go back to the dashboard.
      </p>
      {error.message && (
        <p className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-1.5 font-mono">
          {error.message}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <a href="/dashboard">
          <Button variant="default">Back to Dashboard</Button>
        </a>
      </div>
    </div>
  );
}
