'use client'
import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-nightshade-900 to-gray-900">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="glass-dark rounded-xl p-8">
              <div className="mb-6">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-400 mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-300 mb-6">
                  We encountered an unexpected error. Don't worry, it's not your fault!
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={this.handleReset}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <RefreshCw size={16} />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full btn-secondary"
                >
                  Refresh Page
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Return to Homepage
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-4 bg-red-900/20 border border-red-500/50 rounded text-xs text-red-300 font-mono overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary