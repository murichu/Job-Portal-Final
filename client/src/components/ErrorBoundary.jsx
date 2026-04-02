import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full text-center">
            {/* Illustration */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-100 rounded-2xl rotate-6"></div>
              <div className="absolute inset-0 bg-red-200 rounded-2xl -rotate-3"></div>
              <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-sm border border-red-100">
                <svg className="w-9 h-9 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              An unexpected error occurred. Don&apos;t worry — your data is safe.
              Try refreshing the page or going back home.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Refresh Page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-8 text-left bg-gray-900 rounded-xl p-4 overflow-auto">
                <summary className="cursor-pointer text-gray-300 text-xs font-mono font-semibold mb-2 hover:text-white">
                  Error Details (dev only)
                </summary>
                <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono leading-relaxed">
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
