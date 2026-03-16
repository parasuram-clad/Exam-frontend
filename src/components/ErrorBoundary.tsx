import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 font-sans">Something went wrong</h1>
            <p className="text-slate-600 mb-8 font-sans">
              We've encountered an unexpected error. Don't worry, your data is safe. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-4 rounded-xl border border-slate-200 transition-all duration-200"
              >
                Back to Home
              </button>
            </div>
            
            {(import.meta.env.DEV) && (
              <div className="mt-8 text-left">
                <details className="group">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors uppercase tracking-widest font-semibold underline underline-offset-4 decoration-slate-200">
                    Technical details
                  </summary>
                  <div className="mt-4 p-4 bg-slate-900 rounded-xl overflow-auto max-h-64 scrollbar-hide">
                    <p className="text-red-400 font-mono text-[11px] mb-2 font-bold">{this.state.error?.toString()}</p>
                    <pre className="text-slate-400 font-mono text-[10px] leading-relaxed">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
