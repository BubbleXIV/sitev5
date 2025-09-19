export default function StaffLoading() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-12 bg-gradient-to-r from-nightshade-400/20 to-purple-400/20 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-white/10 rounded-lg max-w-md mx-auto animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-full h-64 bg-gradient-to-br from-nightshade-800/50 to-gray-800/50 rounded-lg mb-4"></div>
              <div className="h-6 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded mb-4 w-2/3"></div>
              <div className="h-16 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}