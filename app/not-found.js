'use client'
import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-nightshade-900 to-gray-900 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center p-8">
        <div className="glass-dark rounded-xl p-8">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-nightshade-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-nightshade-400 to-purple-400 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Looks like you've wandered into the shadows of Eorzea. The page you're looking for doesn't exist in our realm.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="w-full bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Home size={16} />
              <span>Return to The Nightshade's Bloom</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400">
              Lost? Visit our <Link href="/menu" className="text-nightshade-400 hover:text-nightshade-300 transition-colors">menu</Link> or
              meet our <Link href="/staff" className="text-nightshade-400 hover:text-nightshade-300 transition-colors ml-1">staff</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
