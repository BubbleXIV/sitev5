export default function RootLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-nightshade-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-nightshade-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-nightshade-400 to-purple-400 bg-clip-text text-transparent mb-4">
          The Nightshade's Bloom
        </h2>
        <p className="text-gray-300 animate-pulse">Loading your experience...</p>
      </div>
    </div>
  )
}