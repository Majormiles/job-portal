import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0,
      maxRetries: 3
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // Update state with error info
    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Log to error reporting service if available
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.state.maxRetries) {
      // Reset error state and retry
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
      window.location.reload();
    } else {
      // If max retries reached, redirect to home
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <pre className="text-xs text-red-700 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
            <div className="mt-8 space-y-6">
              <button
                onClick={this.handleRetry}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {this.state.retryCount < this.state.maxRetries ? 'Try Again' : 'Return to Home'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Attempt {this.state.retryCount} of {this.state.maxRetries}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 