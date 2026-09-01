import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * App-wide safety net: without this, ANY uncaught exception anywhere in the
 * render tree (a malformed date, a null dereference in a chart, a bad value
 * from an old Firestore record) white-screens the entire app with nothing
 * on screen and nothing in the UI to explain why - the only trace is a
 * console error the user never sees. This never happened to surface in
 * testing, but the First Opinion Engine renders live-computed numbers
 * (scores, charts, PDF data) from real uploaded data with no fixed shape
 * guarantee, so a defensive boundary here costs nothing and prevents a
 * total loss of the page over one bad value in one component.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl shadow-sm p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center text-2xl">⚠️</div>
            <h1 className="text-lg font-bold text-gray-900">Something went wrong</h1>
            <p className="text-sm text-gray-600">
              An unexpected error occurred while rendering this page. Your data has not been affected - reloading usually resolves this.
            </p>
            <p className="text-xs text-gray-400 font-mono break-words">{this.state.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
