import React from "react";
import type { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({
      error,
      errorInfo,
    });

    if (import.meta.env.PROD) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="max-w-md w-full mx-4 p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-bold text-red-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-700 text-sm mb-4">
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again."}
            </p>
            {import.meta.env.DEV && this.state.errorInfo && (
              <pre className="text-xs bg-red-100 p-2 rounded mb-4 overflow-auto max-h-40 text-red-900">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium transition"
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded font-medium transition"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
