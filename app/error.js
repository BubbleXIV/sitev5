'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-nightshade-900 to-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="glass-dark rounded-xl p-8">
          <div className="mb-6">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-red-400 mb-2">Something Went Wrong</h2>
            <p className="text-gray-300 mb-6">
              We encountered an unexpected error. The venue staff have been notified and are working to fix this issue.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              Refresh Page
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center space-x-2"
            >
              <Home size={16} />
              <span>Return to Homepage</span>
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="text-sm text-gray-400 cursor-pointer hover:text-white mb-2">
                Error Details (Development Only)
              </summary>
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded text-xs text-red-300 font-mono overflow-auto max-h-32">
                <pre className="whitespace-pre-wrap">{error?.message || 'Unknown error'}</pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}